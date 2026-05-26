#!/usr/bin/env bash
# Kakunin Quickstart — curl
#
# Full agent lifecycle via bare HTTP — no SDK, no dependencies.
# Works in any CI pipeline, Docker container, or shell.
#
# Prerequisites:
#   curl, python3, openssl (for model_hash)
#   export KAKUNIN_API_KEY=kak_live_...
#
# Run:
#   chmod +x quickstart.sh && ./quickstart.sh

set -euo pipefail

BASE="https://kakunin.ai/api/v1"

if [[ -z "${KAKUNIN_API_KEY:-}" ]]; then
  echo "Error: KAKUNIN_API_KEY environment variable not set" >&2
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
# model_hash is required — binds the certificate to an exact model version.
# Here we derive a SHA-256 hash of the model identifier string as a convenience;
# in production, hash your actual model weights or config file instead.
MODEL_ID="trading-bot-ml"
MODEL_HASH="sha256:$(echo -n "$MODEL_ID" | openssl dgst -sha256 -hex | awk '{print $2}')"

echo "→ Registering agent..."
AGENT=$(api POST /agents "{\"name\":\"sample-curl-agent\",\"model\":\"${MODEL_ID}\",\"version\":\"1.0.0\",\"model_hash\":\"${MODEL_HASH}\",\"description\":\"Demo agent — Kakunin curl quickstart\"}")
AGENT_ID=$(echo "$AGENT" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
echo "  ✓ Agent registered: $AGENT_ID"

# 2. Issue X.509 certificate
# Endpoint: POST /agents/{id}/certify  — no request body required.
# Response fields: serial_number, certificate_pem, expires_at
#   (NOT /certificates, NOT agent_id body, NOT valid_until)
echo "→ Issuing certificate..."
CERT=$(api POST "/agents/${AGENT_ID}/certify")
SERIAL=$(echo "$CERT" | python3 -c "import sys,json; print(json.load(sys.stdin)['serial_number'])")
EXPIRES=$(echo "$CERT" | python3 -c "import sys,json; print(json.load(sys.stdin)['expires_at'])")
echo "  ✓ Certificate issued: $SERIAL (valid until $EXPIRES)"

# 3. Record behaviour events
# Body fields are camelCase: agentId, actionType, details (not action/resource/metadata/agent_id)
# Valid actionType values: api_call, authentication_attempt, authentication_failure,
#   data_access, data_mutation, transaction_initiated, transaction_anomaly,
#   unauthorized_access_attempt, message_signed, message_verification_failed
echo "→ Recording behaviour events..."

for ACTION_TYPE in data_access transaction_initiated api_call; do
  EVENT=$(api POST /events "{\"agentId\":\"$AGENT_ID\",\"actionType\":\"$ACTION_TYPE\",\"details\":{\"source\":\"demo\"}}")
  SCORE=$(echo "$EVENT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(f\"{d['risk_score']:.3f} ({d['risk_band']})\")")
  echo "  ✓ Event recorded: $ACTION_TYPE | risk_score=$SCORE"
done

# 4. Queue compliance report
# Body: agentId (camelCase), windowDays (integer).
#   NOT period_start/period_end — use windowDays instead.
# Response: id (not report_id)
echo "→ Requesting compliance report..."
REPORT=$(api POST /reports/compliance "{\"agentId\":\"$AGENT_ID\",\"windowDays\":30}")
REPORT_ID=$(echo "$REPORT" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
echo "  ✓ Report queued: $REPORT_ID (status: pending)"

# 5. Verify certificate (public endpoint — no auth required)
echo "→ Verifying certificate..."
VERIFY=$(curl -sf "${BASE}/verify/${SERIAL}" | python3 -c "import sys,json; print(json.dumps(json.load(sys.stdin)['data']))")
STATUS=$(echo "$VERIFY" | python3 -c "import sys,json; print(json.load(sys.stdin)['status'])")
echo "  ✓ Certificate status: ${STATUS}"

echo ""
echo "✅ Quickstart complete. View agent at https://kakunin.ai/dashboard/agents"
