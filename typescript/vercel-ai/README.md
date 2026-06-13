# Kakunin + Vercel AI SDK Compliance Tools

This directory contains a TypeScript sample demonstrating how to integrate Kakunin's compliance, certificate verification, and real-time auditing capabilities with the Vercel AI SDK.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set your Kakunin API Key in your environment or a `.env` file:
   ```bash
   export KAKUNIN_API_KEY="your-kakunin-api-key"
   ```

3. Run the verification script:
   ```bash
   npm start
   ```

## Integration Code Example

Once installed, you can pass the Kakunin tools directly into Vercel AI SDK's `generateText`, `streamText`, or `generateObject` functions:

```typescript
import { createKakuninTools } from '@kakunin/ai-sdk';
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

const tools = createKakuninTools({
  apiKey: process.env.KAKUNIN_API_KEY,
  agentId: "agt-your-agent-id",
});

const { text } = await generateText({
  model: openai('gpt-4o'),
  tools,
  prompt: 'Verify the certificate and verify if the agent is allowed to execute a trade.',
});
```
