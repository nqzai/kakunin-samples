import { type NextRequest, NextResponse } from 'next/server';
import { kkn } from '@/lib/kakunin';

/**
 * POST /api/v1/agents
 * Register and certify a new AI agent.
 */
export async function POST(req: NextRequest) {
  const body = await req.json() as { name: string; model: string; version: string };

  if (!body.name || !body.model || !body.version) {
    return NextResponse.json({ error: 'name, model, version required' }, { status: 400 });
  }

  const agent = await kkn.agents.create({
    name: body.name,
    model: body.model,
    version: body.version,
    model_hash: await (kkn.constructor as typeof import('@kakunin/sdk').default).computeModelHash(body.model),
  });

  const cert = await kkn.agents.certify(agent.id);

  return NextResponse.json({ agent, cert });
}
