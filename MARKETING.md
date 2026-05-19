# Distribution Content

## Hacker News — Show HN

**Title:**
Show HN: Kakunin – KYC for AI agents (X.509 certs + MiCA compliance via API)

**Body:**
I've been building Kakunin, a compliance infrastructure API for AI agents. The problem: MiCA (EU crypto regulation) and the EU AI Act both require operators to prove that their AI systems have auditable identities, logged decisions, and structured compliance reports. There's no standard way to do this for autonomous agents.

Kakunin solves it with:
- X.509 certificates issued per agent (via AWS KMS, private key never leaves)
- Real-time behaviour event logging with risk scoring
- Compliance report generation (MiCA Art. 72 ready)

The samples repo has TypeScript, Python, and curl quickstarts. Full agent lifecycle in ~50 lines.

https://github.com/nqzai/kakunin-samples

Happy to answer questions about the PKI design, the risk scoring model, or the regulatory mapping.

---

## Twitter / X Thread

**Tweet 1 (hook):**
Your AI agent just made a trade. Can you prove to a regulator what it did, why, and that it was the same agent you deployed?

MiCA Art. 72 says you need to. Here's how to comply in 4 API calls 🧵

**Tweet 2 (problem):**
The EU's MiCA regulation requires crypto-asset service providers to keep detailed records of AI system decisions.

Most teams have no idea how to satisfy this. Logs aren't enough. You need:
- Cryptographic identity per agent
- Immutable decision audit trail
- Structured compliance report

**Tweet 3 (solution):**
Kakunin does this via API.

Register agent → issue X.509 cert → stream behaviour events → generate compliance report.

Here's the TypeScript quickstart: [link to repo]

**Tweet 4 (output):**
```
→ Registering agent...
  ✓ Agent registered: 3f2e1a...
→ Issuing certificate...
  ✓ Certificate issued: 01:23:AB:...
→ Recording behaviour events...
  ✓ trade_execution | risk_score=0.183 (low)
→ Requesting compliance report...
  ✓ Report queued
✅ Done.
```

**Tweet 5 (CTA):**
Samples in TypeScript, Python, and curl:
👉 github.com/nqzai/kakunin-samples

Building regulated AI? Docs at kakunin.ai/docs

---

## LinkedIn Post

**Hook:**
If your AI agent executes transactions in the EU, MiCA Art. 72 requires you to prove it.

Not just logs. Proof.

**Body:**
Article 72 of the Markets in Crypto-Assets Regulation mandates detailed record-keeping for every AI system decision made by crypto-asset service providers. This includes:

→ What decision was made and when
→ Which model version made it
→ An immutable audit trail

Most teams deploying AI agents have no compliance layer at all. They'll discover this during their first regulatory audit.

Kakunin is the infrastructure layer that solves this: X.509 cryptographic identities per agent, real-time behaviour monitoring, and structured MiCA compliance reports — all via API.

We've just published quickstart samples in TypeScript and Python:
github.com/nqzai/kakunin-samples

If you're building AI systems for financial services, trading, or any MiCA-regulated context, I'd be interested to hear how you're approaching agent identity and audit.

#AICompliance #MiCA #EUAIAct #AIAgents #Fintech #RegTech

---

## Dev.to / Hashnode Article Outline

**Title:** How to issue X.509 certificates to AI agents (and why MiCA requires it)

**Sections:**
1. The problem: AI agents have no identity
2. What MiCA Art. 72 actually requires
3. PKI as the solution: why X.509 works for agents
4. Full walkthrough: register → certify → monitor → report
5. Code samples (TypeScript + Python)
6. What comes next: certificate revocation, CRL endpoints

---

## Reddit Posts

**r/MachineLearning title:**
"We built X.509 certificate issuance for AI agents — here's why PKI is the right primitive for agent identity"

**r/AIAgents title:**
"MiCA Art. 72 compliance for AI agents — open source samples (TypeScript + Python)"

**r/fintech title:**
"How to satisfy EU AI Act audit requirements for autonomous trading agents"
