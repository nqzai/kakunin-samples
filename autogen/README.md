# Kakunin + AutoGen

Scope-enforced `ConversableAgent` for Microsoft AutoGen. `KakuninConversableAgent` verifies the X.509 certificate before every `generate_reply()` — the agent cannot respond if its cert is revoked or the required scope is missing.

## Prerequisites

- Python 3.11+
- API key from [dashboard → API Keys](https://kakunin.ai/dashboard/api-keys)
- OpenAI API key

## Setup

```bash
pip install -r requirements.txt
export KAKUNIN_API_KEY=kak_live_...
export KKN_AGENT_ID=agt_...
export OPENAI_API_KEY=sk-...
```

## Run

```bash
python quickstart.py
```

## Core pattern

```python
from kakunin.integrations.autogen import KakuninConversableAgent

agent = KakuninConversableAgent(
    kakunin=kkn,
    agent_id=AGENT_ID,
    required_scopes=["compliance:read"],
    name="ComplianceAssistant",
    system_message="...",
    llm_config=llm_config,
)
```

`KakuninConversableAgent` is a drop-in subclass of AutoGen's `ConversableAgent`. Scope check runs synchronously in `generate_reply()` before any LLM call.

## Related

- [CrewAI sample](../crewai/)
- [Python SDK docs](https://kakunin.ai/docs/python-sdk)
