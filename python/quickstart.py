"""
Kakunin Quickstart — Python

Demonstrates the full agent lifecycle:
  1. Register a new agent
  2. Issue an X.509 certificate
  3. Record behaviour events
  4. Queue a compliance report

Prerequisites:
  pip install requests

Run:
  KAKUNIN_API_KEY=your_key python quickstart.py
"""

import os
import sys
import json
import requests
from datetime import datetime, timedelta

BASE_URL = "https://kakunin.ai/api/v1"
API_KEY = os.environ.get("KAKUNIN_API_KEY")

if not API_KEY:
    sys.exit("Error: KAKUNIN_API_KEY environment variable not set")

session = requests.Session()
session.headers.update({
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json",
})


def api(method: str, path: str, body: dict | None = None) -> dict:
    res = session.request(method, f"{BASE_URL}{path}", json=body)
    if not res.ok:
        err = res.json().get("error", res.text)
        sys.exit(f"Error {method} {path} → {res.status_code}: {err}")
    return res.json()["data"]


def main():
    # 1. Register agent
    print("→ Registering agent...")
    agent = api("POST", "/agents", {
        "name": "sample-trading-bot-py",
        "description": "Demo agent — Kakunin Python quickstart",
    })
    print(f"  ✓ Agent registered: {agent['id']}")

    # 2. Issue X.509 certificate
    print("→ Issuing certificate...")
    cert = api("POST", "/certificates", {"agent_id": agent["id"]})
    print(f"  ✓ Certificate issued: {cert['serial_number']} (valid until {cert['valid_until']})")
    print(f"  Certificate PEM preview: {cert['pem'].splitlines()[1][:40]}...")

    # 3. Record behaviour events
    print("→ Recording behaviour events...")
    events = [
        {"action": "data_access",       "resource": "market-data-feed",   "metadata": {"symbols": ["BTC", "ETH"]}},
        {"action": "trade_execution",   "resource": "exchange-api",        "metadata": {"side": "buy", "amount": 0.1}},
        {"action": "report_generation", "resource": "compliance-module",   "metadata": {"period": "2026-05"}},
    ]
    for event in events:
        result = api("POST", "/events", {"agent_id": agent["id"], **event})
        print(f"  ✓ Event recorded: {event['action']} | risk_score={result['risk_score']:.3f} ({result['risk_band']})")

    # 4. Queue compliance report
    print("→ Requesting compliance report...")
    today = datetime.utcnow().date()
    report = api("POST", "/reports/compliance", {
        "agent_id": agent["id"],
        "period_start": str(today - timedelta(days=30)),
        "period_end": str(today),
    })
    print(f"  ✓ Report queued: {report['report_id']} (status: {report['status']})")
    print("  Report ready in ~30s — check dashboard → Reports")

    print("\n✅ Quickstart complete. View your agent at https://kakunin.ai/dashboard/agents")


if __name__ == "__main__":
    main()
