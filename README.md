# Kakunin Samples

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/nqzai/kakunin-samples)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fnqzai%2Fkakunin-samples%2Ftree%2Fmain%2Fnextjs&env=KAK_API_KEY&envDescription=Get%20your%20API%20key%20from%20kakunin.ai%2Fdashboard&envLink=https%3A%2F%2Fkakunin.ai%2Fdashboard%2Fapi-keys)
[![License: MIT](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)
[![kakunin.ai](https://img.shields.io/badge/docs-kakunin.ai-3aaa35?style=flat-square)](https://kakunin.ai/docs)

> Comply with MiCA Art. 72 and EU AI Act in under 10 minutes.

End-to-end integration samples for the [Kakunin](https://kakunin.ai) AI agent compliance API.

**⭐ If this saves you compliance headaches, star this repo.**

**Kakunin issues X.509 cryptographic identities to AI agents, monitors their behaviour in real time, and generates MiCA & EU AI Act compliance reports — all via API.**

---

## Samples

| Language / Framework | Folder | What it demonstrates |
|---|---|---|
| TypeScript | [`typescript/`](./typescript/) | Full agent lifecycle — register, certify, events, report |
| Python | [`python/`](./python/) | Same lifecycle, async httpx client |
| curl / shell | [`curl/`](./curl/) | Bare HTTP — works in any CI pipeline |
| Go | [`go/`](./go/) | stdlib only, no dependencies |
| **LangChain** | [`langchain/`](./langchain/) | `KakuninToolGuard` — scope-enforced tool calls |
| **LlamaIndex** | [`llamaindex/`](./llamaindex/) | `KakuninFunctionToolGuard` — RAG tools with cert verification |
| **CrewAI** | [`crewai/`](./crewai/) | `KakuninCrewAgent` — per-agent certs in multi-agent crews |
| **AutoGen** | [`autogen/`](./autogen/) | `KakuninConversableAgent` — cert-gated replies |
| **Next.js** | [`nextjs/`](./nextjs/) | App Router API routes + middleware cert enforcement |

---

## Quickstart

**Prerequisites:** API key from [dashboard → API Keys](https://kakunin.ai/dashboard/api-keys)

**TypeScript (Node ≥ 18):**
```bash
cd typescript && npm install
KAKUNIN_API_KEY=kak_live_... npx ts-node quickstart.ts
```

**Python (3.9+):**
```bash
cd python && pip install -r requirements.txt
KAKUNIN_API_KEY=kak_live_... python quickstart.py
```

**curl:**
```bash
KAKUNIN_API_KEY=kak_live_... ./curl/quickstart.sh
```

**Go:**
```bash
KAKUNIN_API_KEY=kak_live_... go run go/main.go
```

---

## Framework integrations

The `kakunin` Python SDK ships scope-enforcement wrappers for all major agentic frameworks:

```bash
pip install kakunin
```

| Integration | Class | Scope check fires |
|---|---|---|
| LangChain | `KakuninToolGuard` | Per-tool invocation |
| LangChain | `langchain_scope_callback` | Per-chain (before first LLM call) |
| LlamaIndex | `KakuninFunctionToolGuard` | Per-tool call |
| CrewAI | `KakuninCrewAgent` | Per-task execution |
| AutoGen | `KakuninConversableAgent` | Per-reply |

See [`langchain/`](./langchain/) for a full example. Full reference: [kakunin.ai/docs/python-sdk](https://kakunin.ai/docs/python-sdk).

---

## Use in CI (reusable GitHub Actions workflow)

```yaml
jobs:
  certify:
    uses: nqzai/kakunin-samples/.github/workflows/certify-agent.yml@main
    with:
      agent_name: my-production-agent
      model: gpt-4o
      version: ${{ github.sha }}
    secrets:
      KAK_API_KEY: ${{ secrets.KAKUNIN_API_KEY }}
```

Outputs `agent_id` and `cert_serial` for downstream steps. See [`.github/workflows/certify-agent.yml`](./.github/workflows/certify-agent.yml).

---

## API reference

| Endpoint | Description |
|---|---|
| `POST /api/v1/agents` | Register an agent |
| `POST /api/v1/certificates` | Issue X.509 certificate |
| `POST /api/v1/events` | Record a behaviour event |
| `POST /api/v1/reports/compliance` | Queue a compliance report |
| `GET /api/v1/verify/:serial` | Verify a certificate (public, no auth) |

Full OpenAPI spec: [kakunin.ai/api/v1/openapi.json](https://kakunin.ai/api/v1/openapi.json)

---

## Authentication

All endpoints except `/verify/*` require a Bearer token:

```
Authorization: Bearer kak_live_...
```

---

## Error handling

| Status | Meaning |
|---|---|
| 401 | Invalid or revoked API key |
| 403 | Certificate revoked or scope violation |
| 422 | Quota exceeded |
| 429 | Rate limit exceeded — retry after `Retry-After` seconds |
| 5xx | Internal error — contact ai@kakunin.ai |

All errors return `{ "error": "string" }`.

---

## Support

- Docs: [kakunin.ai/docs](https://kakunin.ai/docs)
- Python SDK: [kakunin.ai/docs/python-sdk](https://kakunin.ai/docs/python-sdk)
- Email: [ai@kakunin.ai](mailto:ai@kakunin.ai)
- Issues: open a GitHub issue in this repo
