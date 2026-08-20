package config

import (
	"crypto/rand"
	"math/big"
	"os"
	"time"
)

// AgentConfig holds local settings for the Go discovery agent.
type AgentConfig struct {
	ServerURL         string        `json:"server_url"`
	TenantID          string        `json:"tenant_id"`
	AgentID           string        `json:"agent_id"`
	DeviceToken       string        `json:"device_token"`
	UpdateChannel     string        `json:"update_channel"` // stable, beta, canary
	InventoryInterval time.Duration `json:"inventory_interval"`
	HeartbeatInterval time.Duration `json:"heartbeat_interval"`
	JitterMaxSeconds  int           `json:"jitter_max_seconds"`
	HTTPProxy         string        `json:"http_proxy,omitempty"`
	LogLevel          string        `json:"log_level"` // INFO, DEBUG, WARN, ERROR
	LogMaxMB          int           `json:"log_max_mb"`
}

// DefaultConfig returns enterprise safe defaults.
func DefaultConfig() *AgentConfig {
	return &AgentConfig{
		ServerURL:         os.Getenv("ITAM_SERVER_URL"),
		TenantID:          os.Getenv("ITAM_TENANT_ID"),
		AgentID:           os.Getenv("ITAM_AGENT_ID"),
		DeviceToken:       os.Getenv("ITAM_ENROLLMENT_TOKEN"),
		UpdateChannel:     "stable",
		InventoryInterval: 24 * time.Hour,
		HeartbeatInterval: 5 * time.Minute,
		JitterMaxSeconds:  300, // 5 minutes randomized jitter
		LogLevel:          "INFO",
		LogMaxMB:          20,
	}
}

// CalculateJitterDelay returns a randomized delay up to jitterMaxSeconds to prevent backend inventory traffic spikes.
func CalculateJitterDelay(maxSeconds int) time.Duration {
	if maxSeconds <= 0 {
		return 0
	}
	nBig, err := rand.Int(rand.Reader, big.NewInt(int64(maxSeconds)))
	if err != nil {
		return time.Duration(maxSeconds/2) * time.Second
	}
	return time.Duration(nBig.Int64()) * time.Second
}
