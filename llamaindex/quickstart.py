"""
Kakunin + LlamaIndex — Scope-Enforced Function Tools

Demonstrates KakuninFunctionToolGuard wrapping a LlamaIndex tool.
Certificate scope is verified before every tool call.

Prerequisites:
  pip install -r requirements.txt
  export KAKUNIN_API_KEY=kak_live_...
  export KKN_AGENT_ID=agt_...
  export OPENAI_API_KEY=sk-...

Run:
  python quickstart.py
"""

import os
import asyncio
import kakunin
from kakunin.integrations.llamaindex import KakuninFunctionToolGuard
from kakunin.exceptions import ScopeViolationError

kkn = kakunin.Kakunin(api_key=os.environ["KAKUNIN_API_KEY"])
AGENT_ID = os.environ["KKN_AGENT_ID"]


# ── Define a plain function tool ──────────────────────────────────────────────

def fetch_document_summary(document_id: str) -> str:
    """Fetch and summarise a regulatory document by ID."""
    # Replace with real document retrieval
    return f"Document {document_id}: MiCA Article 72 — AI agent operators must maintain audit logs..."


# ── Wrap with Kakunin scope enforcement ───────────────────────────────────────

guarded_tool = KakuninFunctionToolGuard(
    fn=fetch_document_summary,
    kakunin=kkn,
    agent_id=AGENT_ID,
    required_scopes=["documents:read"],
    name="fetch_document_summary",
    description="Fetch and summarise a regulatory document by ID.",
)


# ── Use the guarded tool ──────────────────────────────────────────────────────

async def main() -> None:
    print("→ Calling guarded tool...\n")
    try:
        # Sync call
        result = guarded_tool.call(document_id="mica-art-72")
        print(f"✓ Tool result: {result}")

        # Async call
        result_async = await guarded_tool.acall(document_id="eu-ai-act-annex-3")
        print(f"✓ Async tool result: {result_async}")

    except ScopeViolationError as e:
        print(f"✗ Scope violation: {e}")
        print(f"  Missing scopes: {e.missing_scopes}")
        print(f"  Agent status:   {e.agent_status}")

    # Tool metadata (name + description) is available for LlamaIndex agent binding
    print(f"\nTool metadata: {guarded_tool.metadata.name} — {guarded_tool.metadata.description}")


if __name__ == "__main__":
    asyncio.run(main())
