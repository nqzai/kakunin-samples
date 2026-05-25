# Kakunin — Python Quickstart

Register an AI agent, issue its X.509 certificate, record behaviour events, and request a compliance report — in under 50 lines of Python.

## Prerequisites

- Python 3.9+
- API key from [dashboard → API Keys](https://kakunin.ai/dashboard/api-keys)

## Run

```bash
pip install -r requirements.txt
export KAKUNIN_API_KEY=kak_live_...
python quickstart.py
```

## Expected output

```
→ Registering agent...
  ✓ Agent registered: agt_...
→ Issuing certificate...
  ✓ Certificate issued: 01:23:AB:... (valid until 25 May 2027)
→ Recording behaviour events...
  ✓ Event recorded: data_access | risk_score=0.041 (low)
  ✓ Event recorded: trade_execution | risk_score=0.183 (low)
  ✓ Event recorded: report_generation | risk_score=0.022 (low)
→ Requesting compliance report...
  ✓ Report queued: rpt_... (status: pending)

✅ Quickstart complete.
```

## Next steps

- [Python SDK docs](https://kakunin.ai/docs/python-sdk) — full async client with Pydantic models
- [LangChain integration](../langchain/) — `KakuninToolGuard` for scope-enforced tool calls
- [LlamaIndex integration](../llamaindex/) — `KakuninFunctionToolGuard`
- [API reference](https://kakunin.ai/docs/api-reference)
