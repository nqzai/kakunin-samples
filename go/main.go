// Kakunin Quickstart — Go
//
// Full agent lifecycle via the Kakunin REST API.
// Uses only stdlib — no third-party dependencies.
//
// Prerequisites:
//   export KAKUNIN_API_KEY=kak_live_...
//
// Run:
//   go run main.go

package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"
)

const baseURL = "https://kakunin.ai/api/v1"

var apiKey string

func init() {
	apiKey = os.Getenv("KAKUNIN_API_KEY")
	if apiKey == "" {
		fmt.Fprintln(os.Stderr, "Error: KAKUNIN_API_KEY environment variable not set")
		os.Exit(1)
	}
}

func apiCall(method, path string, body any) (map[string]any, error) {
	var reqBody io.Reader
	if body != nil {
		b, err := json.Marshal(body)
		if err != nil {
			return nil, fmt.Errorf("marshal: %w", err)
		}
		reqBody = bytes.NewReader(b)
	}

	req, err := http.NewRequest(method, baseURL+path, reqBody)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", "Bearer "+apiKey)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 30 * time.Second}
	res, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("request: %w", err)
	}
	defer res.Body.Close()

	var envelope struct {
		Data  map[string]any `json:"data"`
		Error string         `json:"error"`
	}
	if err := json.NewDecoder(res.Body).Decode(&envelope); err != nil {
		return nil, fmt.Errorf("decode: %w", err)
	}
	if res.StatusCode >= 400 {
		return nil, fmt.Errorf("%s %s → %d: %s", method, path, res.StatusCode, envelope.Error)
	}
	return envelope.Data, nil
}

func main() {
	// 1. Register agent
	fmt.Println("→ Registering agent...")
	agent, err := apiCall("POST", "/agents", map[string]any{
		"name":        "sample-go-agent",
		"description": "Demo agent from Kakunin Go quickstart",
	})
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error: %v\n", err)
		os.Exit(1)
	}
	agentID := agent["id"].(string)
	fmt.Printf("  ✓ Agent registered: %s\n", agentID)

	// 2. Issue X.509 certificate
	fmt.Println("→ Issuing certificate...")
	cert, err := apiCall("POST", "/certificates", map[string]any{
		"agent_id": agentID,
	})
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error: %v\n", err)
		os.Exit(1)
	}
	serial := cert["serial_number"].(string)
	validUntil := cert["valid_until"].(string)
	fmt.Printf("  ✓ Certificate issued: %s (valid until %s)\n", serial, validUntil)

	// 3. Record behaviour event
	fmt.Println("→ Recording behaviour event...")
	event, err := apiCall("POST", "/events", map[string]any{
		"agent_id": agentID,
		"action":   "data_access",
		"resource": "market-data-feed",
		"metadata": map[string]any{"symbols": []string{"BTC", "ETH"}},
	})
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error: %v\n", err)
		os.Exit(1)
	}
	riskScore := event["risk_score"].(float64)
	riskBand := event["risk_band"].(string)
	fmt.Printf("  ✓ Event recorded: risk_score=%.3f (%s)\n", riskScore, riskBand)

	// 4. Verify certificate (public endpoint — no auth)
	fmt.Println("→ Verifying certificate (public)...")
	verify, err := apiCall("GET", "/verify/"+serial, nil)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error: %v\n", err)
		os.Exit(1)
	}
	status := verify["status"].(string)
	fmt.Printf("  ✓ Certificate status: %s\n", status)

	fmt.Printf("\n✅ Quickstart complete. View agent at https://kakunin.ai/dashboard/agents\n")
}
