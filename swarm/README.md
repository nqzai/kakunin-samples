# Kakunin + OpenAI Swarm

Cryptographic compliance checking and audit logging for OpenAI Swarm multi-agent systems using the `KakuninSwarm` subclass.

## What this demonstrates

- **`KakuninSwarm`**: A subclass of OpenAI's `Swarm` client that automatically wraps agent functions with Kakunin scope gates and active-agent validations.
- **Runtime Auditing**: Logs agent lifecycle steps (session start, prompt, execution, and error events) automatically to Kakunin.

## Interactive Notebook / Colab

You can run this demo directly in your browser or Jupyter environment:
👉 **[Jupyter Playground Notebook](./swarm_playground.ipynb)**


## Prerequisites

- Python 3.10+
- Kakunin API key
- OpenAI API key

## Setup

```bash
pip install -r requirements.txt

export KAK_API_KEY=kak_live_...
export OPENAI_API_KEY=sk-...
```

## Run

```bash
python quickstart.py
```

## How scope enforcement works

Initialize `KakuninSwarm` and run your Swarm loop as normal. Pass your `tool_scopes_mapping` dictionary containing the required scopes for each function tool:

```python
from swarm import Agent
from kakunin.integrations.openai_swarm import KakuninSwarm

swarm = KakuninSwarm(kakunin=client, agent_id="agt-123")

response = swarm.run(
    agent=agent,
    messages=messages,
    tool_scopes_mapping={
        "execute_market_trade": ["trade.execute"],
    }
)
```

If the agent status becomes suspended/revoked, or if the model attempts to invoke a tool for which it does not hold the required scopes, the execution is immediately blocked and raises `ScopeViolationError` before the function executes.
