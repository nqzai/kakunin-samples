"""
Kakunin + LangChain — Scope-Enforced Tool Calls

Demonstrates KakuninToolGuard wrapping a LangChain BaseTool.
Every tool invocation is gated on a verified X.509 certificate.
ScopeViolationError is raised — not swallowed — if the check fails.

Prerequisites:
  pip install -r requirements.txt
  export KAKUNIN_API_KEY=kak_live_...
  export KKN_AGENT_ID=agt_...      # from: python register_agent.py
  export OPENAI_API_KEY=sk-...

Run:
  python quickstart.py
"""

import os
import asyncio
import kakunin
from kakunin.integrations.langchain import KakuninToolGuard, langchain_scope_callback
from kakunin.exceptions import ScopeViolationError
from langchain.tools import BaseTool
from langchain_openai import ChatOpenAI
from langchain.agents import AgentExecutor, create_openai_tools_agent
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

# ── Init ──────────────────────────────────────────────────────────────────────

kkn = kakunin.Kakunin(api_key=os.environ["KAKUNIN_API_KEY"])
AGENT_ID = os.environ.get("KKN_AGENT_ID")

if not AGENT_ID:
    raise RuntimeError("KKN_AGENT_ID not set — run register_agent.py first")


# ── Define a tool ─────────────────────────────────────────────────────────────

class MarketDataTool(BaseTool):
    name: str = "get_market_data"
    description: str = "Fetch current price and volume for a ticker symbol."

    def _run(self, ticker: str) -> str:
        # Replace with real market data integration
        return f"{ticker.upper()}: $189.42, Vol: 54.2M"

    async def _arun(self, ticker: str) -> str:
        return self._run(ticker)


# ── Wrap with scope enforcement ───────────────────────────────────────────────

# Requires the agent to hold "market_data:read" scope in its certificate metadata.
# If the cert is revoked or the scope is missing, ScopeViolationError is raised
# before _run is ever called.
guarded_tool = KakuninToolGuard(
    tool=MarketDataTool(),
    kakunin=kkn,
    agent_id=AGENT_ID,
    required_scopes=["market_data:read"],
)


# ── Build agent ───────────────────────────────────────────────────────────────

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a trading research assistant. Use tools to fetch market data."),
    ("human", "{input}"),
    MessagesPlaceholder("agent_scratchpad"),
])

agent = create_openai_tools_agent(llm, [guarded_tool], prompt)
executor = AgentExecutor(agent=agent, tools=[guarded_tool], verbose=True)

# Callback checks scope before the first LLM call — chain-level guard
scope_cb = langchain_scope_callback(kkn, AGENT_ID, required_scopes=["market_data:read"])


# ── Run ───────────────────────────────────────────────────────────────────────

async def main() -> None:
    print("→ Running agent with scope enforcement...\n")
    try:
        result = executor.invoke(
            {"input": "What is the current price of AAPL?"},
            config={"callbacks": [scope_cb]},
        )
        print(f"\n✓ Agent response: {result['output']}")

    except ScopeViolationError as e:
        print(f"\n✗ Scope violation blocked execution:")
        print(f"  Agent ID:       {e.agent_id}")
        print(f"  Agent status:   {e.agent_status}")
        print(f"  Missing scopes: {e.missing_scopes}")


if __name__ == "__main__":
    asyncio.run(main())
