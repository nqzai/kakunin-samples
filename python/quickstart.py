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
import httpx
from datetime import datetime, timedelta

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
        print("→ Registering agent...")
        agent = await api(client, "POST", "/agents", {
            "name": "sample-trading-bot",
            "description": "Demo agent for Kakunin Python quickstart",
        })
        print(f"  ✓ Agent registered: {agent['id']}")

        # 2. Issue X.509 certificate
        print("→ Issuing certificate...")
        cert = await api(client, "POST", "/certificates", {"agent_id": agent["id"]})
        print(f"  ✓ Certificate issued: {cert['serial_number']} (valid until {cert['valid_until']})")
        print(f"  Certificate PEM preview: {cert['pem'].splitlines()[1][:40]}...")

        # 3. Record behaviour events
        print("→ Recording behaviour events...")
        actions = [
            {"action": "data_access", "resource": "market-data-feed", "metadata": {"symbols": ["BTC", "ETH"]}},
            {"action": "trade_execution", "resource": "exchange-api", "metadata": {"side": "buy", "amount": 0.1}},
            {"action": "report_generation", "resource": "compliance-module", "metadata": {"period": "2026-05"}},
        ]
        for event in actions:
            result = await api(client, "POST", "/events", {"agent_id": agent["id"], **event})
            print(f"  ✓ Event recorded: {event['action']} | risk_score={result['risk_score']:.3f} ({result['risk_band']})")

        # 4. Request compliance report
        print("→ Requesting compliance report...")
        report = await api(client, "POST", "/reports/compliance", {
            "agent_id": agent["id"],
            "period_start": (datetime.utcnow() - timedelta(days=30)).strftime("%Y-%m-%d"),
            "period_end": datetime.utcnow().strftime("%Y-%m-%d"),
        })
        print(f"  ✓ Report queued: {report['report_id']} (status: {report['status']})")
        print("  Report ready in ~30s — check dashboard → Reports")

        print("\n✅ Quickstart complete. Open https://kakunin.ai/dashboard/agents to view your agent.")


if __name__ == "__main__":
    asyncio.run(main())
