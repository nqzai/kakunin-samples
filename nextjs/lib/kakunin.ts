import Kakunin from '@kakunin/sdk';

// Singleton — reuse across requests in the same serverless function instance.
// KAKUNIN_API_KEY is set in your Vercel project environment variables.
// Use kak_live_... for production, kak_test_... for sandbox.
export const kkn = new Kakunin({
  apiKey: process.env.KAKUNIN_API_KEY!,
});
