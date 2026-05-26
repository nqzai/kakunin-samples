/**
 * Kakunin Quickstart — TypeScript
 *
 * Demonstrates the full agent lifecycle:
 *   1. Register an agent
 *   2. Issue an X.509 certificate  (POST /agents/{id}/certify)
 *   3. Record behaviour events
 *   4. Request a compliance report
 *
 * Prerequisites:
 *   KAKUNIN_API_KEY=your_key_here  (from dashboard → API Keys)
 *
 * Run:
 *   npm install
 *   KAKUNIN_API_KEY=your_key npx ts-node quickstart.ts
 */

import { createHash } from 'crypto';

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
  // model_hash is required — binds the certificate to an exact model version.
  // In production: hash your model weights/config. Here we derive one from the
  // model identifier string as a quickstart convenience.
  const modelId = 'trading-bot-ml';
  const modelHash = 'sha256:' + createHash('sha256').update(modelId).digest('hex');

  console.log('→ Registering agent...');
  const agent = await api<{ id: string; name: string }>('POST', '/agents', {
    name: 'sample-trading-bot',
    model: modelId,
    version: '1.0.0',
    model_hash: modelHash,
    description: 'Demo agent for Kakunin quickstart',
  });
  console.log(`  ✓ Agent registered: ${agent.id}`);

  // 2. Issue X.509 certificate
  // Endpoint: POST /agents/{id}/certify  — no request body required.
  // Response fields: serial_number, certificate_pem, expires_at
  //   (NOT pem, NOT valid_until — those are wrong field names)
  console.log('→ Issuing certificate...');
  const cert = await api<{ certificate_pem: string; serial_number: string; expires_at: string }>(
    'POST', `/agents/${agent.id}/certify`
  );
  console.log(`  ✓ Certificate issued: ${cert.serial_number} (valid until ${cert.expires_at})`);
  console.log(`  Certificate PEM preview: ${cert.certificate_pem.split('\n')[1].slice(0, 40)}...`);

  // 3. Record behaviour events
  // All body fields are camelCase: agentId, actionType, details
  // Valid actionType values: api_call, authentication_attempt, authentication_failure,
  //   data_access, data_mutation, transaction_initiated, transaction_anomaly,
  //   unauthorized_access_attempt, message_signed, message_verification_failed
  // Response: id (not event_id), risk_score, risk_band
  console.log('→ Recording behaviour events...');
  const events = [
    { actionType: 'data_access',           details: { source: 'market-data-feed', symbols: ['BTC', 'ETH'] } },
    { actionType: 'transaction_initiated', details: { side: 'buy', amount: 0.1, instrument: 'BTC/USD' } },
    { actionType: 'api_call',              details: { endpoint: 'compliance-module', period: '2026-05' } },
  ] as const;

  for (const ev of events) {
    const result = await api<{ id: string; risk_score: number; risk_band: string }>(
      'POST', '/events', { agentId: agent.id, ...ev }
    );
    console.log(`  ✓ Event recorded: ${ev.actionType} | risk_score=${result.risk_score.toFixed(3)} (${result.risk_band})`);
  }

  // 4. Request compliance report
  // Body: agentId (camelCase), windowDays (integer, default 30).
  //   NOT period_start/period_end — those are not accepted fields.
  // Response: id (not report_id), status, title
  console.log('→ Requesting compliance report...');
  const report = await api<{ id: string; status: string }>(
    'POST', '/reports/compliance', {
      agentId: agent.id,
      windowDays: 30,
    }
  );
  console.log(`  ✓ Report queued: ${report.id} (status: ${report.status})`);
  console.log('  Report will be ready in ~30 seconds — check dashboard → Reports');

  console.log('\n✅ Quickstart complete. Open https://kakunin.ai/dashboard/agents to view your agent.');
}

main().catch((err) => {
  console.error('Error:', err instanceof Error ? err.message : err);
  process.exit(1);
});
