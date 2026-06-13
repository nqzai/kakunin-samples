import { createKakuninTools } from '@kakunin/ai-sdk';
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const apiKey = process.env.KAKUNIN_API_KEY;
  if (!apiKey) {
    throw new Error('Missing KAKUNIN_API_KEY environment variable.');
  }

  // Instantiate compliance and scope verification tools
  const tools = createKakuninTools({
    apiKey,
    agentId: 'agt-vercel-sandbox', // Default sandbox agent ID
  });

  const result = await streamText({
    model: openai('gpt-4o'),
    messages,
    tools,
  });

  return result.toDataStreamResponse();
}
