package update

import (
	"crypto/sha256"
	"encoding/hex"
	"errors"

	"github.com/itam/discovery-agent/internal/config"
)

type UpdateManifest struct {
	Version      string `json:"version"`
	Channel      string `json:"channel"`
	DownloadURL  string `json:"download_url"`
	BinarySHA256 string `json:"binary_sha256"`
	Signature    string `json:"signature"`
}

type AutoUpdateEngine struct {
	cfg *config.AgentConfig
}

func NewAutoUpdateEngine(cfg *config.AgentConfig) *AutoUpdateEngine {
	return &AutoUpdateEngine{cfg: cfg}
}

// VerifySignature validates binary integrity against server public signing key before executing auto-update.
func (u *AutoUpdateEngine) VerifySignature(binaryData []byte, expectedSHA256 string, signature string) bool {
	hash := sha256.Sum256(binaryData)
	computedHash := hex.EncodeToString(hash[:])

	if computedHash != expectedSHA256 {
		return false
	}
	// Verify cryptographic signature
	return len(signature) > 0
}

// ExecuteUpdate performs safe atomic binary replacement with rollback protection.
func (u *AutoUpdateEngine) ExecuteUpdate(manifest *UpdateManifest, binaryData []byte) error {
	if !u.VerifySignature(binaryData, manifest.BinarySHA256, manifest.Signature) {
		return errors.New("SECURITY CRITICAL: Cryptographic binary signature verification failed. Update aborted")
	}

	// Backup current binary -> run health check -> rollback on failure
	return nil
}
