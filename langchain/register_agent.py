"""
Register and certify a Kakunin agent for use with LangChain samples.
Run once — prints the agent ID to set as KKN_AGENT_ID.

Usage:
  python register_agent.py
  export KKN_AGENT_ID=<printed id>
"""

import os
import asyncio
import hashlib
import kakunin

kkn = kakunin.Kakunin(api_key=os.environ["KAKUNIN_API_KEY"])


async def main() -> None:
    # model_hash is required — binds the certificate to an exact model version.
    # In production: hash your model weights/config file.
    # Here we derive a hash from the model identifier string as a quickstart convenience.
    model_id = "gpt-4o-mini"
    model_hash = "sha256:" + hashlib.sha256(model_id.encode()).hexdigest()

    agent = await kkn.agents.create(
        name="langchain-sample-agent",
        model=model_id,
        version="v1.0.0",
        model_hash=model_hash,
    )
    cert = await kkn.agents.certify(agent.id)

    print(f"Agent ID:      {agent.id}")
    print(f"Cert serial:   {cert.serial_number}")
    print(f"Valid until:   {cert.expires_at}")
    print(f"\nexport KKN_AGENT_ID={agent.id}")


if __name__ == "__main__":
    asyncio.run(main())
