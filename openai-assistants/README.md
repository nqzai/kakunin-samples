# Kakunin + OpenAI Assistants API

Cryptographic compliance checking and audit logging for OpenAI Assistants API agent runs using the `handle_assistants_requires_action` helper.

## What this demonstrates

- **`handle_assistants_requires_action`**: An async helper that checks the active agent status and scope validation policies on Kakunin, executes local function tools, logs events/errors, and formats the output data for submission back to OpenAI.

## Interactive Notebook / Colab

You can run this demo directly in your browser or Jupyter environment:
👉 **[Jupyter Playground Notebook](./assistants_playground.ipynb)**


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

Inside your thread execution loop, whenever a run transitions to the `requires_action` status, intercept the required tool outputs using the helper:

```python
from kakunin.integrations.openai_assistants import handle_assistants_requires_action

# When run.status == "requires_action"
tool_outputs = await handle_assistants_requires_action(
    kakunin=client,
    agent_id="agt-123",
    run=run,
    tool_scopes_mapping={
        "execute_market_trade": ["trade.execute"],
    },
    tool_funcs={
        "execute_market_trade": execute_market_trade_function,
    },
    catch_exceptions=True
)

# Submit to OpenAI
openai_client.beta.threads.runs.submit_tool_outputs(
    thread_id=thread.id,
    run_id=run.id,
    tool_outputs=tool_outputs
)
```

If `catch_exceptions=True` (default), any scope check violations or tool execution exceptions are gracefully captured and submitted back as a JSON-encoded error structure to OpenAI. If `False`, a `ScopeViolationError` will be raised immediately.
