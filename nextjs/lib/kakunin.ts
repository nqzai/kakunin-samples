import Kakunin from '@kakunin/sdk';

// Singleton — reuse across requests in the same serverless function instance.
// KAK_API_KEY is injected automatically by the Vercel Marketplace integration.
export const kkn = new Kakunin({
  apiKey: process.env.KAK_API_KEY!,
});
