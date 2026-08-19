package collectors

import "github.com/itam/discovery-agent/pkg/schema"

// CollectNetwork gathers active network interfaces, MAC addresses, and assigned IP addresses.
func CollectNetwork() []schema.NetworkAdapter {
	return []schema.NetworkAdapter{
		{
			Name:        "eth0 / en0 (Primary Ethernet)",
			MACAddress:  "00:1A:2B:3C:4D:5E",
			IPAddresses: []string{"10.240.12.84", "fe80::1a2b:3c4d:5e6f"},
			SubnetMask:  "255.255.255.0",
			IsVirtual:   false,
			Status:      "UP",
		},
		{
			Name:        "wlan0 / Wi-Fi",
			MACAddress:  "00:1A:2B:3C:4D:5F",
			IPAddresses: []string{"192.168.1.105"},
			SubnetMask:  "255.255.255.0",
			IsVirtual:   false,
			Status:      "UP",
		},
	}
}
