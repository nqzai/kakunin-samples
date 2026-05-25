"""
Register and certify a Kakunin agent for use with LangChain samples.
Run once — prints the agent ID to set as KKN_AGENT_ID.

Usage:
  python register_agent.py
  export KKN_AGENT_ID=<printed id>
"""

import os
import asyncio
import kakunin

kkn = kakunin.Kakunin(api_key=os.environ["KAKUNIN_API_KEY"])


async def main() -> None:
    agent = await kkn.agents.create(
        name="langchain-sample-agent",
        model="gpt-4o-mini",
        version="v1.0.0",
        metadata={
            # Scopes this agent is permitted to use
            "scopes": ["market_data:read", "research:write"]
        },
    )
    cert = await kkn.agents.certify(agent.id)

    print(f"Agent ID:      {agent.id}")
    print(f"Cert serial:   {cert.serial_number}")
    print(f"Valid until:   {cert.valid_until}")
    print(f"\nexport KKN_AGENT_ID={agent.id}")


if __name__ == "__main__":
    asyncio.run(main())
