"""
Kakunin Quickstart — Python

Demonstrates the full agent lifecycle:
  1. Register an agent
  2. Issue an X.509 certificate
  3. Record behaviour events
  4. Request a compliance report

Prerequisites:
  pip install httpx
  export KAKUNIN_API_KEY=kak_live_...

Run:
  python quickstart.py
"""

import os
import asyncio
import hashlib
import httpx

BASE_URL = "https://kakunin.ai/api/v1"
API_KEY = os.environ.get("KAKUNIN_API_KEY")

if not API_KEY:
    raise RuntimeError("KAKUNIN_API_KEY environment variable not set")

HEADERS = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json",
}


async def api(client: httpx.AsyncClient, method: str, path: str, body: dict = None) -> dict:
    res = await client.request(method, f"{BASE_URL}{path}", json=body, headers=HEADERS)
    if not res.is_success:
        err = res.json()
        raise RuntimeError(f"{method} {path} → {res.status_code}: {err.get('error', res.text)}")
    return res.json()["data"]


async def main() -> None:
    async with httpx.AsyncClient(timeout=30) as client:
        # 1. Register agent
        # model_hash is required — binds the certificate to an exact model version.
        # In production: hash your model weights/config file. Here we derive a hash
        # from the model identifier string as a quickstart convenience.
        model_id = "trading-bot-ml"
        model_hash = "sha256:" + hashlib.sha256(model_id.encode()).hexdigest()

        print("→ Registering agent...")
        agent = await api(client, "POST", "/agents", {
            "name": "sample-trading-bot",
            "model": model_id,
            "version": "1.0.0",
            "model_hash": model_hash,
            "description": "Demo agent for Kakunin Python quickstart",
        })
        print(f"  ✓ Agent registered: {agent['id']}")

        # 2. Issue X.509 certificate
        # POST /agents/{id}/certify — no request body required.
        # Response fields: serial_number, certificate_pem, expires_at (not valid_until, not pem)
        print("→ Issuing certificate...")
        cert = await api(client, "POST", f"/agents/{agent['id']}/certify")
        print(f"  ✓ Certificate issued: {cert['serial_number']} (valid until {cert['expires_at']})")
        print(f"  Certificate PEM preview: {cert['certificate_pem'].splitlines()[1][:40]}...")

        # 3. Record behaviour events
        # Body fields are camelCase: agentId, actionType, details
        # Valid actionType values: api_call, authentication_attempt, authentication_failure,
        #   data_access, data_mutation, transaction_initiated, transaction_anomaly,
        #   unauthorized_access_attempt, message_signed, message_verification_failed
        print("→ Recording behaviour events...")
        events = [
            {
                "agentId": agent["id"],
                "actionType": "data_access",
                "details": {"source": "market-data-feed", "symbols": ["BTC", "ETH"]},
            },
            {
                "agentId": agent["id"],
                "actionType": "transaction_initiated",
                "details": {"side": "buy", "amount": 0.1, "instrument": "BTC/USD"},
            },
            {
                "agentId": agent["id"],
                "actionType": "api_call",
                "details": {"endpoint": "compliance-module", "period": "2026-05"},
            },
        ]
        for ev in events:
            result = await api(client, "POST", "/events", ev)
            print(f"  ✓ Event recorded: {ev['actionType']} | risk_score={result['risk_score']:.3f} ({result['risk_band']})")

        # 4. Request compliance report
        # Body: agentId (camelCase), windowDays (integer days, default 30).
        # Not period_start/period_end — use windowDays instead.
        # Response: id (not report_id), status, title
        print("→ Requesting compliance report...")
        report = await api(client, "POST", "/reports/compliance", {
            "agentId": agent["id"],
            "windowDays": 30,
        })
        print(f"  ✓ Report queued: {report['id']} (status: {report['status']})")
        print("  Report ready in ~30s — check dashboard → Reports")

        print("\n✅ Quickstart complete. Open https://kakunin.ai/dashboard/agents to view your agent.")


if __name__ == "__main__":
    asyncio.run(main())
