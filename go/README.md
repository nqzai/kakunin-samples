# Kakunin — Go Quickstart

Full agent lifecycle via the Kakunin REST API. Uses only the Go standard library — no third-party dependencies.

## Prerequisites

- Go 1.21+
- API key from [dashboard → API Keys](https://kakunin.ai/dashboard/api-keys)

## Run

```bash
export KAKUNIN_API_KEY=kak_live_...
go run main.go
```

## Expected output

```
→ Registering agent...
  ✓ Agent registered: agt_...
→ Issuing certificate...
  ✓ Certificate issued: 01:23:AB:... (valid until 25 May 2027)
→ Recording behaviour event...
  ✓ Event recorded: risk_score=0.041 (low)
→ Verifying certificate (public)...
  ✓ Certificate status: active

✅ Quickstart complete.
```

## No dependencies

`main.go` uses only `net/http`, `encoding/json`, `bytes`, `fmt`, `io`, `os`, and `time`. Drop it into any Go project.
