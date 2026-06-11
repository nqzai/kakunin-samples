# Kakunin + Google Antigravity SDK

Cryptographic compliance checking and audit logging for Google Antigravity SDK agents using lifecycle hooks.

## What this demonstrates

- **`KakuninPreToolCallDecideHook`**: A pre-tool callback that checks if the active agent has the required Kakunin scopes before allowing tool execution.
- **`get_kakunin_hooks`**: A convenience factory that returns a bundle of hooks to track sessions, turns (prompts and responses), tool execution successes, and anomalies.

## Interactive Notebook / Colab

You can run this demo directly in your browser or Jupyter environment:
👉 **[Jupyter Playground Notebook](./google_antigravity_playground.ipynb)**


## Prerequisites

- Python 3.10+
- Kakunin API key
- Google Gemini API key (for Antigravity agents)

## Setup

```bash
pip install -r requirements.txt

export KAK_API_KEY=kak_live_...
export GEMINI_API_KEY=AIzaSy...
```

## Run

```bash
python quickstart.py
```

## How scope enforcement works

Hooks intercept agent and tool lifecycle events. The `KakuninPreToolCallDecideHook` dynamically checks required scopes:

```python
from google.antigravity import Agent, LocalAgentConfig
from kakunin.integrations.google_antigravity import get_kakunin_hooks

hooks = get_kakunin_hooks(
    kakunin=client,
    agent_id="agt-123",
    tool_scopes_mapping={
        "execute_market_trade": ["trade.execute"],
    }
)

config = LocalAgentConfig(
    model="gemini-3.5-flash",
    tools=[execute_market_trade],
    hooks=hooks,
)
```

If the agent's certificate has been revoked or it lacks the required scopes, tool execution is blocked automatically, raising a `ScopeViolationError` before the tool logic runs.
