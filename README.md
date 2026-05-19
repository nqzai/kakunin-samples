# Kakunin Samples

End-to-end integration examples for the [Kakunin](https://kakunin.ai) AI agent compliance API.

## What is Kakunin?

Kakunin issues X.509 cryptographic identities to AI agents, monitors their behaviour in real time, and generates MiCA & EU AI Act compliance reports — all via API.

## Quickstart (TypeScript)

**Prerequisites:** Node ≥ 18, an API key from [dashboard → API Keys](https://kakunin.ai/dashboard/api-keys)

```bash
cd typescript
npm install
KAKUNIN_API_KEY=your_key npx ts-node quickstart.ts
```

The script will:
1. Register a new agent
2. Issue an X.509 certificate (signed by Kakunin CA via AWS KMS)
3. Record three behaviour events (data access, trade execution, report generation)
4. Queue a compliance report

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

## API reference

| Endpoint | Description |
|---|---|
| `POST /api/v1/agents` | Register an agent |
| `POST /api/v1/certificates` | Issue X.509 certificate |
| `POST /api/v1/events` | Record a behaviour event |
| `POST /api/v1/reports/compliance` | Queue a compliance report |
| `GET /api/v1/verify/:serial` | Verify a certificate (public, no auth) |

Full OpenAPI spec: [kakunin.ai/api/v1/openapi.json](https://kakunin.ai/api/v1/openapi.json)

## Authentication

All endpoints (except `/verify/*`) require a Bearer token:

```
Authorization: Bearer YOUR_KAKUNIN_API_KEY
```

Keys are created and revoked in [dashboard → API Keys](https://kakunin.ai/dashboard/api-keys).

## Error handling

| Status | Meaning |
|---|---|
| 401 | Invalid or revoked API key |
| 422 | Quota exceeded (agent/cert/report limit) |
| 429 | Rate limit exceeded — retry after `Retry-After` seconds |
| 5xx | Internal error — contact ai@kakunin.ai |

All errors return `{ "error": "string" }`.

## More examples

Coming soon:
- `python/` — Python SDK quickstart  
- `curl/` — bare curl examples for CI pipelines
- `node/` — CommonJS (require) version

## Support

- Docs: [kakunin.ai/docs](https://kakunin.ai/docs)
- Email: [ai@kakunin.ai](mailto:ai@kakunin.ai)
- Issues: open a GitHub issue in this repo
