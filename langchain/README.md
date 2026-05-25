# Kakunin + LangChain

Cryptographic scope enforcement for LangChain tool calls. Every tool invocation is gated on a verified Kakunin X.509 certificate — before any LLM tokens are generated.

## What this demonstrates

- `KakuninToolGuard` — wraps any `BaseTool`, blocks execution if cert is inactive or scope is missing
- `langchain_scope_callback` — chain-level guard, fires before the first LLM call
- `ScopeViolationError` — structured error with `agent_id`, `agent_status`, `missing_scopes`

## Prerequisites

- Python 3.11+
- API key from [dashboard → API Keys](https://kakunin.ai/dashboard/api-keys)
- OpenAI API key

## Setup

```bash
pip install -r requirements.txt

export KAKUNIN_API_KEY=kak_live_...
export OPENAI_API_KEY=sk-...

# Register and certify an agent (run once)
python register_agent.py
# Copy the printed agent ID:
export KKN_AGENT_ID=agt_...
```

## Run

```bash
python quickstart.py
```

## How scope enforcement works

```python
from kakunin.integrations.langchain import KakuninToolGuard
from kakunin.exceptions import ScopeViolationError

guarded_tool = KakuninToolGuard(
    tool=MyTool(),
    kakunin=kkn,
    agent_id=AGENT_ID,
    required_scopes=["market_data:read"],
)

try:
    result = executor.invoke({"input": "..."})
except ScopeViolationError as e:
    print(e.missing_scopes)  # ['market_data:read']
```

If the agent's certificate has been revoked, `e.agent_status` is `"revoked"` — execution is blocked automatically with no code change.

## Related

- [Full tutorial](https://kakunin.ai/blog/securing-langchain-agent-tools-kakunin) — step-by-step blog post
- [Python SDK docs](https://kakunin.ai/docs/python-sdk)
- [LlamaIndex sample](../llamaindex/)
- [CrewAI sample](../crewai/)
