import ipaddress
import re
from typing import List, Dict, Any
from agentless_discovery.config import AgentlessConfig

class NmapScanner:
    def __init__(self, allowed_cidrs: List[str] = AgentlessConfig.APPROVED_CIDRS):
        self.allowed_cidrs = [ipaddress.ip_network(cidr) for cidr in allowed_cidrs]

    def validate_target_range(self, target: str) -> bool:
        try:
            if "/" in target:
                net = ipaddress.ip_network(target, strict=False)
                return any(net.subnet_of(approved) or net == approved for approved in self.allowed_cidrs)
            else:
                ip = ipaddress.ip_address(target)
                return any(ip in approved for approved in self.allowed_cidrs)
        except ValueError:
            return False

    def scan_network_range(self, cidr_range: str) -> Dict[str, Any]:
        if not self.validate_target_range(cidr_range):
            return {
                "status": "REJECTED",
                "error": f"Target range {cidr_range} is not in approved target allowlist.",
                "hosts": []
            }

        # Simulated safe Nmap scan output structure
        return {
            "status": "COMPLETED",
            "target_range": cidr_range,
            "hosts": [
                {
                    "ip": "10.0.0.15",
                    "status": "UP",
                    "hostname": "switch-core-01.internal",
                    "mac": "00:1B:44:11:3A:B7",
                    "vendor": "Cisco Systems",
                    "open_ports": [22, 161, 443],
                    "detected_os": "Cisco IOS-XE 17.06",
                    "suggested_protocols": ["SNMP", "SSH"]
                },
                {
                    "ip": "10.0.0.42",
                    "status": "UP",
                    "hostname": "WIN-SRV-DC01.corp.local",
                    "mac": "00:50:56:9A:88:C1",
                    "vendor": "VMware Virtual Platform",
                    "open_ports": [135, 139, 445, 3389],
                    "detected_os": "Microsoft Windows Server 2022",
                    "suggested_protocols": ["WMI"]
                },
                {
                    "ip": "10.0.0.88",
                    "status": "UP",
                    "hostname": "rhel-prod-db01.node.internal",
                    "mac": "00:50:56:9A:12:F4",
                    "vendor": "VMware Virtual Platform",
                    "open_ports": [22, 5432],
                    "detected_os": "Linux / Red Hat Enterprise Linux 9",
                    "suggested_protocols": ["SSH"]
                }
            ]
        }
