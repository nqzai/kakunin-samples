import { Kakunin } from '@kakunin/sdk';
import { KakuninIntegration } from '@kakunin/mastra';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
  const kakApiKey = process.env.KAKUNIN_API_KEY || process.env.KAK_API_KEY;
  if (!kakApiKey) {
    console.error("Error: Please set KAKUNIN_API_KEY environment variable.");
    process.exit(1);
  }

  const baseUrl = process.env.KAKUNIN_BASE_URL;

  const client = new Kakunin({ 
    apiKey: kakApiKey,
    ...(baseUrl ? { baseUrl } : {})
  });

  console.log("1. Registering agent with Kakunin compliance platform...");
  // Register agent with correct permitted_actions metadata key
  const agentRecord = await client.agents.create({
    name: 'Mastra-Compliance-Trader',
    model: 'gpt-4o',
    version: '1.0.0',
    model_hash: 'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    metadata: {
      permitted_actions: ['market.read', 'trade.execute']
    }
  });
  console.log(`Agent registered successfully: ${agentRecord.id}`);

  console.log("2. Issuing X.509 compliance certificate...");
  const cert = await client.agents.certify(agentRecord.id);
  console.log(`Certificate issued! Serial: ${cert.serial_number}`);

  console.log("3. Instantiating KakuninIntegration for Mastra...");
  const kakuninIntegration = new KakuninIntegration({
    apiKey: kakApiKey,
    ...(baseUrl ? { baseUrl } : {})
  });

  console.log("4. Fetching Mastra-compatible tools...");
  const tools = kakuninIntegration.getTools();

  console.log("5. Testing 'checkAgentScope' tool execution directly...");
  const scopeResult = await tools.checkAgentScope.execute({
    context: {
      agentId: agentRecord.id,
      action: 'market.read'
    }
  });
  console.log("Scope verification response:", scopeResult);

  console.log("6. Testing 'emitBehaviorEvent' tool execution directly...");
  const eventResult = await tools.emitBehaviorEvent.execute({
    context: {
      agentId: agentRecord.id,
      actionType: 'transaction_initiated',
      details: { symbol: 'AAPL', quantity: 5 }
    }
  });
  console.log("Behavioral event response:", eventResult);

  console.log("\nSuccess! Mastra integration tools verified.");
}

main().catch(err => {
  console.error("Execution failed:", err);
  process.exit(1);
});
