# Kakunin — curl Quickstart

Full agent lifecycle via bare HTTP. No SDK, no runtime dependencies — works in any CI pipeline or shell environment.

## Prerequisites

- curl 7.68+
- API key from [dashboard → API Keys](https://kakunin.ai/dashboard/api-keys)

## Run

```bash
export KAKUNIN_API_KEY=kak_live_...
chmod +x quickstart.sh
./quickstart.sh
```

## Use in CI (GitHub Actions)

```yaml
- name: Register and certify agent
  env:
    KAKUNIN_API_KEY: ${{ secrets.KAKUNIN_API_KEY }}
  run: ./curl/quickstart.sh
```

## Individual commands

```bash
# Register agent
curl -X POST https://kakunin.ai/api/v1/agents \
  -H "Authorization: Bearer $KAKUNIN_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name":"my-agent"}'

# Issue certificate
curl -X POST https://kakunin.ai/api/v1/certificates \
  -H "Authorization: Bearer $KAKUNIN_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"agent_id":"agt_..."}'

# Verify certificate (no auth — public endpoint)
curl https://kakunin.ai/api/v1/verify/01:23:AB:CD
```

See the [reusable GitHub Actions workflow](../.github/workflows/certify-agent.yml) for a drop-in CI integration.
