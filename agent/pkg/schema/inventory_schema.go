package schema

import "time"

// SchemaVersion defines the authoritative ITAM inventory schema version.
const SchemaVersion = "1.0.0"

// HardwareInfo represents endpoint physical and virtual hardware specs.
type HardwareInfo struct {
	Manufacturer string `json:"manufacturer"`
	Model        string `json:"model"`
	SerialNumber string `json:"serial_number"`
	SystemUUID   string `json:"system_uuid"`
	BIOSVersion  string `json:"bios_version"`
	CPUModel     string `json:"cpu_model"`
	CPUCores     int    `json:"cpu_cores"`
	CPUArch      string `json:"cpu_arch"`
	RAMTotalBytes int64 `json:"ram_total_bytes"`
	DiskTotalBytes int64 `json:"disk_total_bytes"`
	GPUModel     string `json:"gpu_model"`
}

// OSInfo represents operating system version and kernel telemetry.
type OSInfo struct {
	Name         string    `json:"name"`          // Windows, Linux, macOS
	Version      string    `json:"version"`       // 11 Pro, 22.04 LTS, 14.5
	Edition      string    `json:"edition"`       // Enterprise, Server, Desktop
	BuildNumber  string    `json:"build_number"`
	KernelVer    string    `json:"kernel_version"`
	Architecture string    `json:"architecture"`  // x86_64, arm64
	InstallDate  time.Time `json:"install_date"`
	UptimeSec    int64     `json:"uptime_seconds"`
}

// SoftwareEntry represents an installed software application package.
type SoftwareEntry struct {
	Name          string    `json:"name"`
	Publisher     string    `json:"publisher"`
	Version       string    `json:"version"`
	InstallDate   time.Time `json:"install_date,omitempty"`
	Source        string    `json:"source,omitempty"` // Registry, dpkg, rpm, brew, app
	PackageID     string    `json:"package_id,omitempty"`
	Architecture  string    `json:"architecture,omitempty"`
}

// NetworkAdapter represents an active or available network interface.
type NetworkAdapter struct {
	Name         string   `json:"name"`
	MACAddress   string   `json:"mac_address"`
	IPAddresses  []string `json:"ip_addresses"`
	SubnetMask   string   `json:"subnet_mask,omitempty"`
	IsVirtual    bool     `json:"is_virtual"`
	Status       string   `json:"status"` // UP, DOWN
}

// InventoryPayload is the complete versioned JSON payload submitted by the agent.
type InventoryPayload struct {
	SchemaVersion string           `json:"schema_version"`
	AgentID       string           `json:"agent_id"`
	TenantID      string           `json:"tenant_id"`
	Hostname      string           `json:"hostname"`
	AgentVersion  string           `json:"agent_version"`
	Timestamp     time.Time        `json:"timestamp"`
	IsIncremental bool             `json:"is_incremental"`
	Hardware      HardwareInfo     `json:"hardware"`
	OS            OSInfo           `json:"operating_system"`
	Software      []SoftwareEntry  `json:"software"`
	Network       []NetworkAdapter `json:"network"`
	Checksum      string           `json:"checksum"`
}

// AgentHeartbeat represents operational health pinged back to ITAM.
type AgentHeartbeat struct {
	AgentID       string    `json:"agent_id"`
	TenantID      string    `json:"tenant_id"`
	AgentVersion  string    `json:"agent_version"`
	OS            string    `json:"os"`
	Hostname      string    `json:"hostname"`
	Timestamp     time.Time `json:"timestamp"`
	CPUUsagePct   float64   `json:"cpu_usage_pct"`
	MemoryUsageMB float64   `json:"memory_usage_mb"`
	ServiceStatus string    `json:"service_status"` // RUNNING, DEGRADED
}
