"""
Kakunin + AutoGen — Scope-Enforced Conversable Agents

KakuninConversableAgent verifies the agent's X.509 certificate before
every generate_reply() call. If the cert is revoked or scope is missing,
ScopeViolationError is raised — the agent never replies.

Prerequisites:
  pip install -r requirements.txt
  export KAKUNIN_API_KEY=kak_live_...
  export KKN_AGENT_ID=agt_...
  export OPENAI_API_KEY=sk-...

Run:
  python quickstart.py
"""

import os
import kakunin
from kakunin.integrations.autogen import KakuninConversableAgent
from kakunin.exceptions import ScopeViolationError
from autogen import UserProxyAgent

kkn = kakunin.Kakunin(api_key=os.environ["KAKUNIN_API_KEY"])
AGENT_ID = os.environ["KKN_AGENT_ID"]

# LLM config
llm_config = {
    "config_list": [{"model": "gpt-4o-mini", "api_key": os.environ["OPENAI_API_KEY"]}],
    "cache_seed": None,
}

# ── Create a Kakunin-guarded AutoGen agent ────────────────────────────────────

compliance_assistant = KakuninConversableAgent(
    kakunin=kkn,
    agent_id=AGENT_ID,
    required_scopes=["compliance:read"],
    name="ComplianceAssistant",
    system_message=(
        "You are a compliance assistant. You answer questions about MiCA and EU AI Act requirements. "
        "Your identity is cryptographically verified before every response."
    ),
    llm_config=llm_config,
)

user_proxy = UserProxyAgent(
    name="User",
    human_input_mode="NEVER",
    max_consecutive_auto_reply=1,
    code_execution_config=False,
)

# ── Run conversation ──────────────────────────────────────────────────────────

if __name__ == "__main__":
    try:
        user_proxy.initiate_chat(
            compliance_assistant,
            message="What are the key logging requirements under EU AI Act Article 12?",
        )
        print("\n✅ Conversation complete.")
    except ScopeViolationError as e:
        print(f"\n✗ Agent blocked before reply:")
        print(f"  Agent ID:       {e.agent_id}")
        print(f"  Agent status:   {e.agent_status}")
        print(f"  Missing scopes: {e.missing_scopes}")
