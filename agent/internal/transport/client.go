package transport

import (
	"bytes"
	"crypto/tls"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"time"

	"github.com/itam/discovery-agent/internal/config"
	"github.com/itam/discovery-agent/pkg/schema"
)

// AgentClient handles HTTPS TLS communication with token rotation and retry backoff.
type AgentClient struct {
	cfg        *config.AgentConfig
	httpClient *http.Client
}

func NewAgentClient(cfg *config.AgentConfig) *AgentClient {
	tr := &http.Transport{
		TLSClientConfig: &tls.Config{
			MinVersion: tls.VersionTLS12,
		},
	}

	return &AgentClient{
		cfg: cfg,
		httpClient: &http.Client{
			Transport: tr,
			Timeout:   30 * time.Second,
		},
	}
}

// SendInventoryPayload transmits inventory payload with exponential backoff retries.
func (c *AgentClient) SendInventoryPayload(payload *schema.InventoryPayload) error {
	data, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	backoffs := []time.Duration{1 * time.Second, 2 * time.Second, 4 * time.Second}
	var lastErr error

	for attempt, delay := range backoffs {
			req, err := http.NewRequest("POST", c.cfg.ServerURL+"/api/discovery/agent/ingest", bytes.NewBuffer(data))
		if err != nil {
			return err
		}

		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("X-Agent-ID", c.cfg.AgentID)
		req.Header.Set("X-Tenant-ID", c.cfg.TenantID)
		req.Header.Set("Authorization", "Bearer "+c.cfg.DeviceToken)

		resp, requestErr := c.httpClient.Do(req)
		if requestErr == nil && resp.StatusCode >= 200 && resp.StatusCode < 300 {
			_ = resp.Body.Close()
			return nil
		}
		if resp != nil { _ = resp.Body.Close() }
		if requestErr != nil { lastErr = requestErr } else { lastErr = fmt.Errorf("attempt %d received non-success response", attempt+1) }
		time.Sleep(delay)
	}

	return errors.New("Exhausted exponential retries: " + lastErr.Error())
}

// SendHeartbeat pings operational agent health.
func (c *AgentClient) SendHeartbeat(hb *schema.AgentHeartbeat) error {
	data, err := json.Marshal(hb)
	if err != nil {
		return err
	}
	req, err := http.NewRequest("POST", c.cfg.ServerURL+"/api/discovery/agent/heartbeat", bytes.NewBuffer(data))
	if err != nil { return err }
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Agent-ID", c.cfg.AgentID)
	req.Header.Set("X-Tenant-ID", c.cfg.TenantID)
	req.Header.Set("Authorization", "Bearer "+c.cfg.DeviceToken)
	resp, err := c.httpClient.Do(req)
	if resp != nil { _ = resp.Body.Close() }
	if err != nil { return err }
	if resp.StatusCode < 200 || resp.StatusCode >= 300 { return fmt.Errorf("heartbeat rejected with status %d", resp.StatusCode) }
	return nil
}
