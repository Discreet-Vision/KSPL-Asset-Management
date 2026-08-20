import ipaddress
import socket
import subprocess
from concurrent.futures import ThreadPoolExecutor
from typing import List, Dict, Any
from agentless_discovery.config import AgentlessConfig

class NmapScanner:
    def __init__(self, allowed_cidrs: List[str]):
        self.allowed_cidrs = [ipaddress.ip_network(cidr) for cidr in allowed_cidrs]

    def validate_target_range(self, target: str) -> bool:
        try:
            if "/" in target:
                net = ipaddress.ip_network(target, strict=False)
                return any(net.subnet_of(approved) for approved in self.allowed_cidrs)
            else:
                ip = ipaddress.ip_address(target)
                return any(ip in approved for approved in self.allowed_cidrs)
        except ValueError:
            return False

    def scan_network_range(self, cidr_range: str, max_hosts: int = 1024, timeout: float = 2.0) -> Dict[str, Any]:
        if not self.validate_target_range(cidr_range):
            return {
                "status": "REJECTED",
                "error": "Target range is not in this scanner's approved target allowlist.",
                "hosts": []
            }

        targets = list(ipaddress.ip_network(cidr_range, strict=False).hosts())
        if len(targets) > max_hosts:
            return {"status": "REJECTED", "error": f"Target exceeds scanner limit of {max_hosts} hosts.", "hosts": []}
        def probe(ip):
            ports = []
            for port in (22, 135, 161, 5985, 5986):
                try:
                    with socket.create_connection((str(ip), port), timeout=timeout): ports.append(port)
                except OSError: pass
            reachable = bool(ports)
            if not reachable:
                try:
                    flag = '-n' if __import__('os').name == 'nt' else '-c'
                    reachable = subprocess.run(['ping', flag, '1', str(ip)], capture_output=True, timeout=timeout + 1).returncode == 0
                except (OSError, subprocess.TimeoutExpired): pass
            protocols = (["SNMP"] if 161 in ports else []) + (["WMI"] if any(p in ports for p in (135, 5985, 5986)) else []) + (["SSH"] if 22 in ports else [])
            return {"ip": str(ip), "status": "UP" if reachable else "UNREACHABLE", "open_ports": ports, "suggested_protocols": protocols}
        with ThreadPoolExecutor(max_workers=min(AgentlessConfig.MAX_CONCURRENT_HOSTS, len(targets) or 1)) as pool:
            records = list(pool.map(probe, targets))
        return {"status": "COMPLETED", "target_range": cidr_range, "hosts_scanned": len(records), "hosts": [r for r in records if r['status'] == 'UP']}
