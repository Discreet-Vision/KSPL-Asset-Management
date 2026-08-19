package windows

// WindowsServiceConfig holds Windows Service Manager parameters.
type WindowsServiceConfig struct {
	ServiceName string
	DisplayName string
	Description string
	StartType   string // Automatic, Manual
}

func GetDefaultWindowsServiceConfig() WindowsServiceConfig {
	return WindowsServiceConfig{
		ServiceName: "ITAMDiscoveryAgent",
		DisplayName: "Enterprise ITAM Discovery Agent",
		Description: "Low-footprint background hardware, software, and OS inventory scanner.",
		StartType:   "Automatic",
	}
}
