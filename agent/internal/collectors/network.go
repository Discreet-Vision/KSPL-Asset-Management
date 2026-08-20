package collectors

import (
	"net"
	"strings"

	"github.com/itam/discovery-agent/pkg/schema"
)

// CollectNetwork gathers active network interfaces, MAC addresses, and assigned IP addresses.
func CollectNetwork() []schema.NetworkAdapter {
	interfaces, err := net.Interfaces()
	if err != nil { return nil }
	result := make([]schema.NetworkAdapter, 0, len(interfaces))
	for _, iface := range interfaces {
		addresses, err := iface.Addrs(); if err != nil { continue }
		ips := make([]string, 0, len(addresses)); mask := ""
		for _, addr := range addresses {
			ip, network, ok := net.ParseCIDR(addr.String()); if !ok || ip.IsLoopback() { continue }
			ips = append(ips, ip.String()); if mask == "" && network != nil { mask = net.IP(network.Mask).String() }
		}
		if len(ips) == 0 && iface.HardwareAddr == nil { continue }
		status := "DOWN"; if iface.Flags&net.FlagUp != 0 { status = "UP" }
		name := strings.TrimSpace(iface.Name); if name == "" { continue }
		result = append(result, schema.NetworkAdapter{Name: name, MACAddress: iface.HardwareAddr.String(), IPAddresses: ips, SubnetMask: mask, IsVirtual: iface.Flags&net.FlagLoopback != 0, Status: status})
	}
	return result
}
