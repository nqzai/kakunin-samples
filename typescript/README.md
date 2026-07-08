# TypeScript Samples

This directory contains various implementation examples of Kakunin using TypeScript, demonstrating how to enforce security scopes and manage agent lifecycles in a TypeScript environment.

## Contents

- **[quickstart.ts](./quickstart.ts)**: A complete demonstration of the full agent lifecycle.
- **[langchain-guard/](./langchain-guard/)**: Examples of enforcing scope-based tool calls using LangChain (TS).
- **[mastra/](./mastra/)**: Integration examples with the Mastra framework.
- **[vercel-ai/](./vercel-ai/)**: Showcases how to use Kakunin with Vercel AI SDK tools.
- **[supabase-rls-adapter.ts](./supabase-rls-adapter.ts)**: Demonstrates binding Kakunin with Supabase Row Level Security (RLS).
- **[cloudflare-worker-gateway.ts](./cloudflare-worker-gateway.ts)**: An example of implementing an edge gateway using Cloudflare Workers.


## Prerequisites

- **Node.js**: Version 18 or higher.
- **API Key**: API key from [dashboard → API Keys](https://kakunin.ai/dashboard/api-keys)

## Getting Started

To install dependencies and run the quickstart example, execute the following commands:
```bash
npm install
KAKUNIN_API_KEY=kak_live_... npx ts-node quickstart.ts
```

## More INFO

- **[official documentation](https://www.kakunin.ai/)**

- **[←Back to README.md](https://github.com/FarbodDaneshjoo/kakunin-samples/blob/main/README.md)**
