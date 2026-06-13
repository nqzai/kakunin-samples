import { Kakunin } from '@kakunin/sdk';
import { KakuninToolGuard } from '@kakunin/langchain';
import { StructuredTool } from '@langchain/core/tools';
import { z } from 'zod';

// 1. Initialize the core Kakunin client
// Uses sandbox environment by default if kak_test_... key is passed
const client = new Kakunin({
  apiKey: process.env.KAKUNIN_API_KEY || 'kak_test_sandbox_api_key_alpha'
});

// 2. Define a standard LangChain tool by subclassing StructuredTool directly
// This avoids type instantiation recursion loops with duplicate zod packages.
class ExecuteTradeTool extends StructuredTool {
  name = 'execute_trade';
  description = 'Execute a trade order. Input is the trade amount in USD.';
  schema = z.object({
    amount: z.number()
  }) as any;

  async _call(input: any): Promise<string> {
    return `Successfully executed trade order of $${input.amount}`;
  }
}

const executeTrade = new ExecuteTradeTool();

// 3. Wrap the tool with the KakuninToolGuard
// Pre-flight validation intercepts the tool-call, verifying that the target
// agent certificate is active and possesses the 'trade.execute' scope metadata.
const guardedTradeTool = new KakuninToolGuard({
  kakunin: client,
  agentId: 'agt-sandbox-demo-123',
  tool: executeTrade,
  requiredScopes: ['trade.execute'], // Permission checks
});

async function main() {
  console.log('Executing guarded tool call directly...');

  try {
    // When called, the tool guard will perform pre-flight scope validation.
    // If the agent is not active or lacks the trade.execute scope, it throws a ScopeViolationError.
    const result = await guardedTradeTool.invoke({ amount: 500 });
    console.log('Result:', result);
  } catch (error) {
    console.error('Compliance error executing guarded tool:', error);
  }
}

main().catch(console.error);
