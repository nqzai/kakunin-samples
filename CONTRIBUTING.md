# Contributing to Kakunin samples

Thanks for helping other developers integrate Kakunin. This repo is the **lowest-friction
way to contribute** — every sample runs against the hosted API with a single test key, so
you don't need to provision any infrastructure.

## Ground rules

- **Solo-maintainer project (for now).** Best-effort support; triage target is one week.
  Small, focused PRs get reviewed fastest.
- **Security issues:** never open a public issue — see the platform's
  [SECURITY.md](https://github.com/kakunin-ai/kakunin-core/blob/main/SECURITY.md).
- Contributions are licensed under **MIT** (this repo's license). A lightweight CLA check
  runs on your first PR — one click to sign.

## Ways to contribute

| Effort | What | Where |
|---|---|---|
| **Small** | Fix a typo, broken link, or stale version in a sample README | any `*/README.md` |
| **Small** | Fix a sample that no longer runs against the current SDK | the affected dir |
| **Medium** | **Add a sample for a framework we don't cover yet** ← highest-value | new top-level dir |
| **Medium** | Improve an existing sample (error handling, comments, a second scenario) | the affected dir |

### Frameworks we'd love a sample for

No sample exists for these yet — each is a self-contained new directory, mergeable in an
afternoon:

- **Pydantic AI** — https://ai.pydantic.dev
- **Semantic Kernel** — https://github.com/microsoft/semantic-kernel
- **Agno** (formerly Phidata) — https://github.com/agno-agi/agno
- **Smolagents** (Hugging Face) — https://github.com/huggingface/smolagents
- **Letta** (formerly MemGPT) — https://github.com/letta-ai/letta
- **Google ADK** (Agent Development Kit) — https://google.github.io/adk-docs
- **DSPy** — https://github.com/stanfordnlp/dspy
- **Strands** (AWS) — https://github.com/strands-agents/sdk-python
- **LangGraph** — https://github.com/langchain-ai/langgraph

Using a framework not on this list? A sample for it is still welcome — open a
[new-framework-sample issue](../../issues/new?template=new_framework_sample.md) first so we
can coordinate.

## Get set up

```bash
# Open in the devcontainer (recommended) or locally.
# Get a free sandbox key at https://kakunin.ai/dashboard/api-keys
export KAKUNIN_API_KEY=kak_test_...
```

A `kak_test_...` key hits the sandbox CA — no cost, no real certificates.

## Add a framework sample — the 20-minute skeleton

Copy the closest existing sample (e.g. [`langchain/`](./langchain/) for Python,
[`typescript/`](./typescript/) for TS) and adapt it. Every sample follows the same shape:

```
<framework>/
├── README.md          # What it demonstrates, prerequisites, setup, run, "how it works"
├── register_agent.py  # (or .ts) — register + certify an agent once, print the agent ID
├── quickstart.py      # (or .ts) — the actual integration: gate a tool/action on the cert
└── requirements.txt   # (or package.json) — pinned deps
```

The integration itself is small — verify the agent's certificate and scope **before** the
framework executes a tool or action:

```python
from kakunin import Kakunin

kkn = Kakunin(api_key=os.environ["KAKUNIN_API_KEY"])

# Before your framework runs a tool:
decision = await kkn.verify_agent_scope(agent_id=AGENT_ID, required_scopes=["market_data:read"])
if not decision.allowed:
    raise PermissionError(decision.reason)  # cert inactive or scope missing
```

Match the README structure of an existing sample so the set stays consistent. Add your
sample to the table in the [root README](./README.md), and cross-link it under "Related" in
one or two neighboring samples.

## Pull requests

1. For a new framework sample, open the issue first so we don't duplicate work.
2. Keep the PR to one sample / one fix.
3. Make sure the sample actually runs against a real `kak_test_` key before you open the PR.
4. CI must be green.

We review fast and we credit every contributor. Welcome aboard.

## Claiming an issue

Before you start working on an issue, comment `/assign` on it — our bot assigns it
to you automatically. This prevents two people building the same thing (which has
already happened a couple of times). Changed your mind? Comment `/unassign`.
