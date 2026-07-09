# Kakunin + Vercel AI SDK Next.js Chat Template

A fully deployable, self-service Next.js template demonstrating tool-level cryptographic scope governance and behavioral compliance monitoring using Vercel AI SDK and `@kakunin/ai-sdk`.

## Deploy to Vercel

Click the button below to deploy this template directly to Vercel. It will prompt you to set up your environment keys automatically:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fkakunin-ai%2Fkakunin-samples%2Ftree%2Fmain%2Fnextjs-vercel-ai&env=KAKUNIN_API_KEY,OPENAI_API_KEY&envDescription=Provide%20your%20API%20keys%20for%20Kakunin%20and%20OpenAI&envLink=https%3A%2F%2Fkakunin.ai%2Fdashboard)

## Features Included

* **Vercel AI SDK Integration**: Implemented in `/app/api/chat/route.ts` using `streamText()` and `toDataStreamResponse()`.
* **Kakunin AI SDK Tools**: Binds four compliance tools (`checkAgentScope`, `verifyAgentCertificate`, `getBehaviorRiskScore`, and `emitBehaviorEvent`) directly into the model's environment.
* **Interactive Frontend Chat**: Minimalist chat interface inside `/app/page.tsx` using `useChat`.

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy the environment variables:
   ```bash
   cp .env.example .env.local
   ```

3. Run the Next.js dev server:
   ```bash
   npm run dev
   ```
