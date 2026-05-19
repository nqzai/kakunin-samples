#!/usr/bin/env bash
# Kakunin Quickstart — curl
#
# Demonstrates the full agent lifecycle using only curl + standard Unix tools.
# Works in any CI pipeline, Docker container, or shell.
#
# Prerequisites:
#   curl, python3 (for JSON parsing) or jq
#
# Run:
#   KAKUNIN_API_KEY=your_key bash curl/quickstart.sh

set -euo pipefail

BASE="https://kakunin.ai/api/v1"

if [[ -z "${KAKUNIN_API_KEY:-}" ]]; then
  echo "Error: KAKUNIN_API_KEY not set" >&2
  exit 1
fi

AUTH="Authorization: Bearer $KAKUNIN_API_KEY"
CT="Content-Type: application/json"

# Helper: call API and extract .data field
api() {
  local method="$1" path="$2" body="${3:-}"
  local response
  if [[ -n "$body" ]]; then
    response=$(curl -sf -X "$method" "$BASE$path" -H "$AUTH" -H "$CT" -d "$body")
  else
    response=$(curl -sf -X "$method" "$BASE$path" -H "$AUTH" -H "$CT")
  fi
  echo "$response" | python3 -c "import sys,json; print(json.dumps(json.load(sys.stdin)['data']))"
}

# 1. Register agent
echo "→ Registering agent..."
AGENT=$(api POST /agents '{"name":"sample-trading-bot-curl","description":"Demo agent — Kakunin curl quickstart"}')
AGENT_ID=$(echo "$AGENT" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
echo "  ✓ Agent registered: $AGENT_ID"

# 2. Issue X.509 certificate
echo "→ Issuing certificate..."
CERT=$(api POST /certificates "{\"agent_id\":\"$AGENT_ID\"}")
SERIAL=$(echo "$CERT" | python3 -c "import sys,json; print(json.load(sys.stdin)['serial_number'])")
VALID_UNTIL=$(echo "$CERT" | python3 -c "import sys,json; print(json.load(sys.stdin)['valid_until'])")
echo "  ✓ Certificate issued: $SERIAL (valid until $VALID_UNTIL)"

# 3. Record behaviour events
echo "→ Recording behaviour events..."

for ACTION in data_access trade_execution report_generation; do
  EVENT=$(api POST /events "{\"agent_id\":\"$AGENT_ID\",\"action\":\"$ACTION\",\"resource\":\"demo-resource\",\"metadata\":{}}")
  SCORE=$(echo "$EVENT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(f\"{d['risk_score']:.3f} ({d['risk_band']})\")")
  echo "  ✓ Event recorded: $ACTION | risk_score=$SCORE"
done

# 4. Queue compliance report
echo "→ Requesting compliance report..."
TODAY=$(date -u +%Y-%m-%d)
THIRTY_AGO=$(python3 -c "from datetime import date,timedelta; print(date.today()-timedelta(days=30))")
REPORT=$(api POST /reports/compliance "{\"agent_id\":\"$AGENT_ID\",\"period_start\":\"$THIRTY_AGO\",\"period_end\":\"$TODAY\"}")
REPORT_ID=$(echo "$REPORT" | python3 -c "import sys,json; print(json.load(sys.stdin)['report_id'])")
echo "  ✓ Report queued: $REPORT_ID"

echo ""
echo "✅ Quickstart complete. View at https://kakunin.ai/dashboard/agents"
