# Kakunin + CrewAI

Per-agent X.509 scope enforcement in multi-agent crews. Each agent holds its own certificate with distinct permitted scopes. `KakuninCrewAgent` verifies scope before every task execution.

## Why this matters

Multi-agent systems are Kakunin's strongest use case. A research agent should never be able to execute trades. A compliance agent should never modify production data. Certificate scopes enforce these boundaries cryptographically — the constraint lives in the cert, not in application code.

## Prerequisites

- Python 3.11+
- Two registered Kakunin agents (different scopes)
- API key from [dashboard → API Keys](https://kakunin.ai/dashboard/api-keys)

## Setup

```bash
pip install -r requirements.txt
export KAKUNIN_API_KEY=kak_live_...

# Register agents (edit scopes as needed)
# Research agent: scopes = ["market_data:read", "research:write"]
# Execution agent: scopes = ["trades:execute", "market_data:read"]
export RESEARCH_AGENT_ID=agt_...
export EXECUTION_AGENT_ID=agt_...
```

## Run

```bash
python quickstart.py
```

## Core pattern

```python
from kakunin.integrations.crewai import KakuninCrewAgent

agent = KakuninCrewAgent(
    kakunin=kkn,
    agent_id=AGENT_ID,
    required_scopes=["trades:execute"],
    role="Trade Execution Specialist",
    goal="...",
    backstory="...",
)
```

`KakuninCrewAgent` is a drop-in replacement for CrewAI's `Agent`. Scope is checked synchronously before each task via `execute_task()`.

## Related

- [AutoGen sample](../autogen/) — same pattern for Microsoft AutoGen
- [Python SDK docs](https://kakunin.ai/docs/python-sdk)
