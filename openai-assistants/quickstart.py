"""
Example script demonstrating how to integrate Kakunin compliance checking
and behavioral auditing with the OpenAI Assistants API.

Run this example with your API keys set in your environment:
    export KAK_API_KEY="your-kakunin-api-key"
    export OPENAI_API_KEY="your-openai-api-key"
"""

from __future__ import annotations

import asyncio
import os
import sys

from dotenv import load_dotenv
from openai import OpenAI
from kakunin import Kakunin
from kakunin.exceptions import ScopeViolationError
from kakunin.integrations.openai_assistants import handle_assistants_requires_action

# Load local environment variables from .env
load_dotenv()


# 1. Define custom tools for the Assistant
def query_market_prices(symbol: str) -> str:
    """Query current prices for a given ticker symbol."""
    print(f"[Tool Executing] query_market_prices: {symbol}")
    return f"Latest price for {symbol}: $150.00"


def execute_market_trade(symbol: str, amount: int) -> str:
    """Execute a market buy order for a symbol."""
    print(f"[Tool Executing] execute_market_trade: Buying {amount} of {symbol}")
    return f"Successfully executed trade: Buy {amount} shares of {symbol}"


async def main() -> None:
    # Validate environment setup
    kak_api_key = os.getenv("KAK_API_KEY")
    openai_api_key = os.getenv("OPENAI_API_KEY")

    if not kak_api_key or not openai_api_key:
        print("Error: Please set KAK_API_KEY and OPENAI_API_KEY environment variables.")
        sys.exit(1)

    print("Initializing Kakunin and OpenAI clients...")
    # 2. Instantiate clients
    openai_client = OpenAI(api_key=openai_api_key)
    
    async with Kakunin(api_key=kak_api_key) as kakunin_client:

        # 3. Register the agent in Kakunin
        print("Registering agent with Kakunin compliance platform...")
        kakunin_agent = await kakunin_client.agents.create(
            name="AlphaTrader-Assistants",
            model="gpt-4o",
            version="1.0.0",
            model_hash="sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        )
        print(f"Registered Agent ID: {kakunin_agent.id}")

        # 4. Certify the agent to issue its X.509 certificate
        print("Issuing X.509 compliance certificate...")
        certificate = await kakunin_client.agents.certify(kakunin_agent.id)
        print(f"Certificate Serial: {certificate.serial_number}")

        # 5. Create OpenAI Assistant
        print("Creating OpenAI Assistant...")
        assistant = openai_client.beta.assistants.create(
            name="Compliance-Aware Stock Trader",
            instructions=(
                "You are an automated stock trading assistant. "
                "You can query prices and execute trades when requested by calling functions."
            ),
            model="gpt-4o",
            tools=[
                {
                    "type": "function",
                    "function": {
                        "name": "query_market_prices",
                        "description": "Query current prices for a ticker symbol.",
                        "parameters": {
                            "type": "object",
                            "properties": {
                                "symbol": {"type": "string", "description": "Ticker symbol"}
                            },
                            "required": ["symbol"]
                        }
                    }
                },
                {
                    "type": "function",
                    "function": {
                        "name": "execute_market_trade",
                        "description": "Execute a market buy order.",
                        "parameters": {
                            "type": "object",
                            "properties": {
                                "symbol": {"type": "string", "description": "Ticker symbol"},
                                "amount": {"type": "integer", "description": "Amount to buy"}
                            },
                            "required": ["symbol", "amount"]
                        }
                    }
                }
            ]
        )

        # 6. Initialize Thread
        thread = openai_client.beta.threads.create()

        # Define tool-to-scope mappings and tool function mapping
        tool_scopes_mapping = {
            "query_market_prices": ["market.read"],
            "execute_market_trade": ["trade.execute"],
        }
        tool_funcs = {
            "query_market_prices": query_market_prices,
            "execute_market_trade": execute_market_trade,
        }

        # Submit query
        openai_client.beta.threads.messages.create(
            thread_id=thread.id,
            role="user",
            content="Check the price of AAPL, then buy 10 shares.",
        )

        # Create run
        run = openai_client.beta.threads.runs.create(
            thread_id=thread.id,
            assistant_id=assistant.id
        )

        print("\n--- Starting OpenAI Assistants API Loop ---")
        
        while True:
            # Retrieve run status
            run = openai_client.beta.threads.runs.retrieve(
                thread_id=thread.id,
                run_id=run.id
            )
            print(f"Current Run Status: {run.status}")

            if run.status == "requires_action":
                print("Assistants API requires action. Enforcing Kakunin compliance gates...")
                # 7. Use the Kakunin integration helper to check scopes and run tools
                tool_outputs = await handle_assistants_requires_action(
                    kakunin=kakunin_client,
                    agent_id=kakunin_agent.id,
                    run=run,
                    tool_scopes_mapping=tool_scopes_mapping,
                    tool_funcs=tool_funcs,
                    catch_exceptions=True
                )
                
                # Submit tool outputs back to OpenAI
                openai_client.beta.threads.runs.submit_tool_outputs(
                    thread_id=thread.id,
                    run_id=run.id,
                    tool_outputs=tool_outputs
                )
                
            elif run.status == "completed":
                messages = openai_client.beta.threads.messages.list(thread_id=thread.id)
                last_response = messages.data[0].content[0].text.value
                print(f"\nFinal Assistant Response:\n{last_response}")
                break
                
            elif run.status in ["failed", "cancelled", "expired"]:
                print(f"Run failed with status: {run.status}")
                break

            await asyncio.sleep(1)

        # Clean up assistant
        openai_client.beta.assistants.delete(assistant.id)
        print("\n--- Session Finished ---")


if __name__ == "__main__":
    asyncio.run(main())
