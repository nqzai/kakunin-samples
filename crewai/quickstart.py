"""
Kakunin + CrewAI — Multi-Agent Scope Enforcement

Each agent in the crew holds its own X.509 certificate with distinct scopes.
KakuninCrewAgent verifies scope before task execution.
A research agent (read-only) and an execution agent (trade scope) operate independently.

Prerequisites:
  pip install -r requirements.txt
  export KAKUNIN_API_KEY=kak_live_...
  export RESEARCH_AGENT_ID=agt_...    # "scopes": ["market_data:read", "research:write"]
  export EXECUTION_AGENT_ID=agt_...   # "scopes": ["trades:execute", "market_data:read"]

Run:
  python quickstart.py
"""

import os
import asyncio
import kakunin
from kakunin.integrations.crewai import KakuninCrewAgent
from kakunin.exceptions import ScopeViolationError
from crewai import Task, Crew

kkn = kakunin.Kakunin(api_key=os.environ["KAKUNIN_API_KEY"])

# ── Define two agents with different certificate scopes ───────────────────────

# Research agent — read-only, no trade execution
research_agent = KakuninCrewAgent(
    kakunin=kkn,
    agent_id=os.environ["RESEARCH_AGENT_ID"],
    required_scopes=["market_data:read"],
    role="Market Research Analyst",
    goal="Analyse market data and produce research summaries",
    backstory="You are a compliance-aware research analyst with read-only market access.",
    verbose=True,
)

# Execution agent — holds trades:execute scope
execution_agent = KakuninCrewAgent(
    kakunin=kkn,
    agent_id=os.environ["EXECUTION_AGENT_ID"],
    required_scopes=["trades:execute"],
    role="Trade Execution Specialist",
    goal="Execute approved trades within permitted instruments",
    backstory="You are a certified trade execution agent. Your scope is verified before every action.",
    verbose=True,
)

# ── Define tasks ──────────────────────────────────────────────────────────────

research_task = Task(
    description="Research current AAPL price action and summarise in 2 sentences.",
    expected_output="A 2-sentence market summary with price and trend direction.",
    agent=research_agent,
)

execution_task = Task(
    description="Given the research summary, decide whether to execute a BUY order for 10 AAPL shares.",
    expected_output="Execution decision: BUY or HOLD with brief justification.",
    agent=execution_agent,
)

# ── Run crew ──────────────────────────────────────────────────────────────────

crew = Crew(
    agents=[research_agent, execution_agent],
    tasks=[research_task, execution_task],
    verbose=True,
)

if __name__ == "__main__":
    try:
        result = crew.kickoff()
        print(f"\n✅ Crew result:\n{result}")
    except ScopeViolationError as e:
        print(f"\n✗ Agent {e.agent_id} blocked — missing scopes: {e.missing_scopes}")
