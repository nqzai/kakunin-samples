# Kakunin + LlamaIndex

Scope-enforced function tools for LlamaIndex agents. `KakuninFunctionToolGuard` wraps any Python callable and verifies the agent's X.509 certificate before execution.

## Prerequisites

- Python 3.11+
- API key from [dashboard → API Keys](https://kakunin.ai/dashboard/api-keys)

## Setup

```bash
pip install -r requirements.txt
export KAKUNIN_API_KEY=kak_live_...
export KKN_AGENT_ID=agt_...   # register via: python ../langchain/register_agent.py
```

## Run

```bash
python quickstart.py
```

## Core pattern

```python
from kakunin.integrations.llamaindex import KakuninFunctionToolGuard

guarded = KakuninFunctionToolGuard(
    fn=my_function,
    kakunin=kkn,
    agent_id=AGENT_ID,
    required_scopes=["documents:read"],
    name="my_function",
    description="What my function does.",
)

# Sync or async — both supported
result = guarded.call(arg="value")
result = await guarded.acall(arg="value")
```

The guard returns a standard tool with `.metadata` (name + description) compatible with LlamaIndex's `FunctionTool` interface. Pass it directly to any LlamaIndex agent or `ReActAgent`.

## Related

- [LangChain sample](../langchain/)
- [Python SDK docs](https://kakunin.ai/docs/python-sdk)
