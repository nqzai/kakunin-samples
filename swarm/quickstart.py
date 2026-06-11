"""
Example script demonstrating how to integrate Kakunin compliance and auditing
with an OpenAI Swarm multi-agent system.

Run this example with your API keys set in your environment:
    export KAK_API_KEY="your-kakunin-api-key"
    export OPENAI_API_KEY="your-openai-api-key"
"""

from __future__ import annotations

import asyncio
import os
import sys

from dotenv import load_dotenv
from swarm import Agent
from kakunin import Kakunin
from kakunin.exceptions import ScopeViolationError
from kakunin.integrations.openai_swarm import KakuninSwarm

# Load local environment variables from .env
load_dotenv()


# 1. Define custom tools for the Swarm agents
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

    print("Initializing Kakunin client...")
    # 2. Instantiate the Kakunin client
    async with Kakunin(api_key=kak_api_key) as kakunin_client:

        # 3. Register the agent in Kakunin
        print("Registering agent with Kakunin compliance platform...")
        kakunin_agent = await kakunin_client.agents.create(
            name="AlphaTrader-Swarm",
            model="gpt-4o",
            version="1.0.0",
            model_hash="sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        )
        print(f"Registered Agent ID: {kakunin_agent.id}")

        # 4. Certify the agent to issue its X.509 certificate
        print("Issuing X.509 compliance certificate...")
        certificate = await kakunin_client.agents.certify(kakunin_agent.id)
        print(f"Certificate Serial: {certificate.serial_number}")

        # 5. Initialize the KakuninSwarm client
        print("Initializing Kakunin-integrated Swarm client...")
        swarm = KakuninSwarm(kakunin=kakunin_client, agent_id=kakunin_agent.id)

        # 6. Define Swarm Agent with tools
        agent = Agent(
            name="Compliance Trader",
            instructions=(
                "You are an automated stock trading assistant. "
                "You can query prices and execute trades when requested by calling functions."
            ),
            functions=[query_market_prices, execute_market_trade],
        )

        # 7. Define tool-to-scope mappings for compliance verification
        tool_scopes_mapping = {
            "query_market_prices": ["market.read"],
            "execute_market_trade": ["trade.execute"],
        }

        print("\n--- Starting Swarm Agent Session ---")

        # First turn: A safe query that requires 'market.read' scope
        print("\nPrompting agent to query prices...")
        try:
            response = swarm.run(
                agent=agent,
                messages=[{"role": "user", "content": "What is the price of AAPL?"}],
                tool_scopes_mapping=tool_scopes_mapping,
            )
            print(f"Agent Response: {response.messages[-1]['content']}")
        except ScopeViolationError as e:
            print(f"Compliance Violation Blocked Execution: {e}")

        # Second turn: A trade execution that requires 'trade.execute' scope
        print("\nPrompting agent to execute a trade...")
        try:
            response = swarm.run(
                agent=agent,
                messages=[{"role": "user", "content": "Buy 5 shares of AAPL."}],
                tool_scopes_mapping=tool_scopes_mapping,
            )
            print(f"Agent Response: {response.messages[-1]['content']}")
        except ScopeViolationError as e:
            print(f"Compliance Violation Blocked Execution: {e}")

        print("\n--- Session Finished ---")


if __name__ == "__main__":
    asyncio.run(main())
