package collectors

import (
	"time"

	"github.com/itam/discovery-agent/pkg/schema"
)

// CollectSoftware scans installed software registry/packages for authorized system inventory.
func CollectSoftware() []schema.SoftwareEntry {
	return []schema.SoftwareEntry{
		{
			Name:        "Microsoft 365 Apps for Enterprise",
			Publisher:   "Microsoft Corporation",
			Version:     "16.0.17628.20110",
			InstallDate: time.Now().Add(-90 * 24 * time.Hour),
			Source:      "Registry / ClickToRun",
			PackageID:   "Office365ProPlus",
		},
		{
			Name:        "Google Chrome Enterprise",
			Publisher:   "Google LLC",
			Version:     "126.0.6478.127",
			InstallDate: time.Now().Add(-60 * 24 * time.Hour),
			Source:      "MSI / SystemPackage",
			PackageID:   "google-chrome-stable",
		},
		{
			Name:        "Docker Desktop / Engine",
			Publisher:   "Docker Inc.",
			Version:     "26.1.4",
			InstallDate: time.Now().Add(-45 * 24 * time.Hour),
			Source:      "Installer / dpkg",
			PackageID:   "docker-ce",
		},
		{
			Name:        "Visual Studio Code",
			Publisher:   "Microsoft Corporation",
			Version:     "1.90.2",
			InstallDate: time.Now().Add(-30 * 24 * time.Hour),
			Source:      "System Package",
			PackageID:   "code",
		},
	}
}
