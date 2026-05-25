# Kakunin + Next.js

Full-stack example: agent registration, certificate issuance, and middleware-level cert enforcement in a Next.js App Router project. Pairs with the [Vercel Marketplace integration](https://vercel.com/integrations/kakunin) — `KAK_API_KEY` is injected automatically.

## What this covers

- `lib/kakunin.ts` — singleton SDK init (reads `KAK_API_KEY` from env)
- `app/api/v1/agents/route.ts` — register + certify an agent via POST
- `middleware.ts` — enforce cert serial on all `/api/agent/*` routes

## Prerequisites

- Node 18+
- API key from [dashboard → API Keys](https://kakunin.ai/dashboard/api-keys) **or** install the [Vercel integration](https://vercel.com/integrations/kakunin) to inject the key automatically

## Local setup

```bash
npm install @kakunin/sdk
cp .env.example .env.local
# Edit .env.local and add your key, or:
vercel env pull .env.local   # if using the Vercel integration
```

## Register an agent

```bash
curl -X POST http://localhost:3000/api/v1/agents \
  -H "Content-Type: application/json" \
  -d '{"name":"my-agent","model":"gpt-4o","version":"v1.0.0"}'
```

## Call a protected route

```bash
curl http://localhost:3000/api/agent/data \
  -H "X-Kakunin-Cert-Serial: 01:23:AB:CD"
```

Without a valid cert serial: `401 Agent certificate required`  
With a revoked cert: `403 Certificate revoked`

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fnqzai%2Fkakunin-samples%2Ftree%2Fmain%2Fnextjs&env=KAK_API_KEY&envDescription=Get%20your%20API%20key%20from%20kakunin.ai%2Fdashboard&envLink=https%3A%2F%2Fkakunin.ai%2Fdashboard%2Fapi-keys)

## Related

- [Vercel integration guide](https://kakunin.ai/docs/vercel-integration)
- [TypeScript SDK](../typescript/)
