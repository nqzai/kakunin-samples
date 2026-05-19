# Kakunin Samples

> Comply with MiCA Art. 72 and EU AI Act in under 10 minutes.

End-to-end integration examples for the [Kakunin](https://kakunin.ai) AI agent compliance API.

[![License: MIT](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)
[![kakunin.ai](https://img.shields.io/badge/docs-kakunin.ai-3aaa35?style=flat-square)](https://kakunin.ai/docs)

**⭐ If this saves you compliance headaches, star this repo.**

---

## What is Kakunin?

Kakunin issues X.509 cryptographic identities to AI agents, monitors their behaviour in real time, and generates MiCA & EU AI Act compliance reports — all via API.

```
Your AI agent  →  Kakunin API  →  X.509 cert + audit log + compliance report
```

---

## Quickstart (TypeScript)

**Prerequisites:** Node ≥ 18, API key from [dashboard → API Keys](https://kakunin.ai/dashboard/api-keys)

```bash
cd typescript
npm install
KAKUNIN_API_KEY=your_key npx ts-node quickstart.ts
```

Expected output:
```
→ Registering agent...
  ✓ Agent registered: 3f2e1a...
→ Issuing certificate...
  ✓ Certificate issued: 01:23:AB:... (valid until 20 May 2027)
→ Recording behaviour events...
  ✓ Event recorded: data_access | risk_score=0.041 (low)
  ✓ Event recorded: trade_execution | risk_score=0.183 (low)
  ✓ Event recorded: report_generation | risk_score=0.022 (low)
→ Requesting compliance report...
  ✓ Report queued: c8f9d... (status: pending)

✅ Quickstart complete.
```

---

## Quickstart (Python)

**Prerequisites:** Python ≥ 3.9

```bash
cd python
pip install -r requirements.txt
KAKUNIN_API_KEY=your_key python quickstart.py
```

---

## Quickstart (curl)

No SDK needed — works in any CI pipeline or shell:

```bash
export KAKUNIN_API_KEY=your_key
bash curl/quickstart.sh
```

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

All endpoints (except `/verify/*`) require a Bearer token:

```
Authorization: Bearer YOUR_KAKUNIN_API_KEY
```

---

## Error handling

| Status | Meaning |
|---|---|
| 401 | Invalid or revoked API key |
| 422 | Quota exceeded |
| 429 | Rate limited — retry after `Retry-After` seconds |
| 5xx | Internal error — contact ai@kakunin.ai |

All errors return `{ "error": "string" }`.

---

## Samples

| Language | Location | Status |
|---|---|---|
| TypeScript | [`typescript/`](typescript/) | ✅ |
| Python | [`python/`](python/) | ✅ |
| curl | [`curl/`](curl/) | ✅ |
| CommonJS (require) | `node/` | Coming soon |

---

## Support

- Docs: [kakunin.ai/docs](https://kakunin.ai/docs)
- Email: [ai@kakunin.ai](mailto:ai@kakunin.ai)
- Issues: open a GitHub issue in this repo
