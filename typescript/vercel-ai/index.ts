import { Kakunin } from '@kakunin/sdk';
import { createKakuninTools } from '@kakunin/ai-sdk';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
  const kakApiKey = process.env.KAKUNIN_API_KEY || process.env.KAK_API_KEY;
  if (!kakApiKey) {
    console.error("Error: Please set KAKUNIN_API_KEY environment variable.");
    process.exit(1);
  }

  // Allow overriding base URL for local sandbox testing
  const baseUrl = process.env.KAKUNIN_BASE_URL;

  const client = new Kakunin({ 
    apiKey: kakApiKey,
    ...(baseUrl ? { baseUrl } : {})
  });

  console.log("1. Registering agent with Kakunin compliance platform...");
  // Register agent with correct permitted_actions metadata key
  const agent = await client.agents.create({
    name: 'Vercel-AI-Trader',
    model: 'gpt-4o',
    version: '1.0.0',
    model_hash: 'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    metadata: {
      permitted_actions: ['market.read', 'trade.execute']
    }
  });
  console.log(`Agent registered successfully: ${agent.id}`);

  console.log("2. Issuing X.509 compliance certificate...");
  const cert = await client.agents.certify(agent.id);
  console.log(`Certificate issued! Serial: ${cert.serial_number}`);

  console.log("3. Instantiating Vercel AI SDK integration tools...");
  const tools = createKakuninTools({
    apiKey: kakApiKey,
    agentId: agent.id,
    ...(baseUrl ? { baseUrl } : {})
  });

  console.log("4. Testing 'checkAgentScope' tool execution directly...");
  const scopeResult = await tools.checkAgentScope.execute({
    agentId: agent.id,
    action: 'market.read',
  }, { toolCallId: 'call-1', messages: [] });
  console.log("Scope verification response:", scopeResult);

  console.log("5. Testing 'emitBehaviorEvent' tool execution directly...");
  const eventResult = await tools.emitBehaviorEvent.execute({
    agentId: agent.id,
    actionType: 'transaction_initiated',
    details: { symbol: 'AAPL', quantity: 10 }
  }, { toolCallId: 'call-2', messages: [] });
  console.log("Behavioral event response:", eventResult);

  console.log("\nSuccess! Kakunin Vercel AI SDK tools verified.");
}

main().catch(err => {
  console.error("Execution failed:", err);
  process.exit(1);
});
