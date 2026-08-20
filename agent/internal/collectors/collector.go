package collectors

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"os"
	"time"

	"github.com/itam/discovery-agent/internal/config"
	"github.com/itam/discovery-agent/pkg/schema"
)

// InventoryEngine orchestrates all independent collectors.
type InventoryEngine struct {
	cfg *config.AgentConfig
}

func NewInventoryEngine(cfg *config.AgentConfig) *InventoryEngine {
	return &InventoryEngine{cfg: cfg}
}

// GenerateFullSnapshot collects complete endpoint inventory.
func (e *InventoryEngine) GenerateFullSnapshot() (*schema.InventoryPayload, error) {
	hostname, err := os.Hostname()
	if err != nil {
		return nil, err
	}

	hw := CollectHardware()
	osInfo := CollectOS()
	software := CollectSoftware()
	net := CollectNetwork()

	payload := &schema.InventoryPayload{
		SchemaVersion: schema.SchemaVersion,
		AgentID:       e.cfg.AgentID,
		TenantID:      e.cfg.TenantID,
		Hostname:      hostname,
		AgentVersion:  "1.2.0-golang",
		Timestamp:     time.Now().UTC(),
		IsIncremental: false,
		Hardware:      hw,
		OS:            osInfo,
		Software:      software,
		Network:       net,
	}

	// Calculate checksum for change detection & idempotency
	data, _ := json.Marshal(payload)
	hash := sha256.Sum256(data)
	payload.Checksum = hex.EncodeToString(hash[:])

	return payload, nil
}
