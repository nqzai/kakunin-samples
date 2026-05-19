/**
 * Kakunin Quickstart — TypeScript
 *
 * Demonstrates the full agent lifecycle in under 50 lines:
 *   1. Register an agent
 *   2. Issue an X.509 certificate
 *   3. Stream behaviour events
 *   4. Request a compliance report
 *
 * Prerequisites:
 *   KAKUNIN_API_KEY=your_key_here  (from dashboard → API Keys)
 *
 * Run:
 *   npm install
 *   KAKUNIN_API_KEY=your_key npx ts-node quickstart.ts
 */

const BASE_URL = 'https://kakunin.ai/api/v1';
const API_KEY = process.env.KAKUNIN_API_KEY;

if (!API_KEY) throw new Error('KAKUNIN_API_KEY environment variable not set');

const headers = {
  'Authorization': `Bearer ${API_KEY}`,
  'Content-Type': 'application/json',
};

async function api<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json() as { error: string };
    throw new Error(`${method} ${path} → ${res.status}: ${err.error}`);
  }
  const { data } = await res.json() as { data: T };
  return data;
}

async function main() {
  // 1. Register agent
  console.log('→ Registering agent...');
  const agent = await api<{ id: string; name: string }>('POST', '/agents', {
    name: 'sample-trading-bot',
    description: 'Demo agent for Kakunin quickstart',
  });
  console.log(`  ✓ Agent registered: ${agent.id}`);

  // 2. Issue X.509 certificate
  console.log('→ Issuing certificate...');
  const cert = await api<{ pem: string; serial_number: string; valid_until: string }>(
    'POST', '/certificates', { agent_id: agent.id }
  );
  console.log(`  ✓ Certificate issued: ${cert.serial_number} (valid until ${cert.valid_until})`);
  console.log(`  Certificate PEM preview: ${cert.pem.split('\n')[1].slice(0, 40)}...`);

  // 3. Stream behaviour events
  console.log('→ Recording behaviour events...');
  const actions = [
    { action: 'data_access', resource: 'market-data-feed', metadata: { symbols: ['BTC', 'ETH'] } },
    { action: 'trade_execution', resource: 'exchange-api', metadata: { side: 'buy', amount: 0.1 } },
    { action: 'report_generation', resource: 'compliance-module', metadata: { period: '2026-05' } },
  ];

  for (const event of actions) {
    const result = await api<{ event_id: string; risk_score: number; risk_band: string }>(
      'POST', '/events', { agent_id: agent.id, ...event }
    );
    console.log(`  ✓ Event recorded: ${event.action} | risk_score=${result.risk_score.toFixed(3)} (${result.risk_band})`);
  }

  // 4. Request compliance report
  console.log('→ Requesting compliance report...');
  const report = await api<{ report_id: string; status: string }>(
    'POST', '/reports/compliance', {
      agent_id: agent.id,
      period_start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      period_end: new Date().toISOString().slice(0, 10),
    }
  );
  console.log(`  ✓ Report queued: ${report.report_id} (status: ${report.status})`);
  console.log('  Report will be ready in ~30 seconds — check dashboard → Reports');

  console.log('\n✅ Quickstart complete. Open https://kakunin.ai/dashboard/agents to view your agent.');
}

main().catch((err) => {
  console.error('Error:', err instanceof Error ? err.message : err);
  process.exit(1);
});
