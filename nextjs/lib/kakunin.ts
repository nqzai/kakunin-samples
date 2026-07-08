import Kakunin from '@kakunin/sdk';

// Singleton — reuse across requests in the same serverless function instance.
// The API key comes from your environment. The Vercel Marketplace integration
// injects KAK_API_KEY; local dev / the Deploy button use KAKUNIN_API_KEY. We
// accept either so both paths work. Use kak_live_... for production,
// kak_test_... for sandbox.
const apiKey = process.env.KAK_API_KEY ?? process.env.KAKUNIN_API_KEY;
if (!apiKey) {
  throw new Error(
    'Missing Kakunin API key. Set KAKUNIN_API_KEY (or KAK_API_KEY via the ' +
      'Vercel Marketplace integration). Get one at https://kakunin.ai/dashboard/api-keys',
  );
}

export const kkn = new Kakunin({ apiKey });
