# Agentless Network & Credentialed Discovery Engine

This isolated, strictly additive module provides agentless network probing and credentialed discovery (SNMP, WMI, SSH, ICMP, Nmap, Cloud APIs) across CIDR subnets and IP ranges without installing local host agents.

---

## 1. Subsystem Architecture

```text
Discovery Target Subnet (e.g. 192.168.1.0/24)
            ↓
Credential Profile Authentication (SNMP v2/v3, WMI/WinRM, SSH Key, Cloud Token)
            ↓
Asynchronous Network Probing & Port Scan
            ↓
Protocol Detection & Device Identification (Server, VM, Router, Switch, Firewall)
            ↓
Hardware / OS / Network Attribute Inventory Extraction
            ↓
Read-Through Discovery Result Proxy
            ↓
CMDB Reconciliation Adapter (No direct record overwrite)
```

---

## 2. Key Features

1. **Multi-Protocol Agentless Discovery**:
   - SNMP, WMI, SSH, ICMP, Nmap, and Cloud API protocols.
   - Discovers servers, VMs, laptops, routers, switches, firewalls, printers, and storage arrays.

2. **Credential Profiles**:
   - Isolated profiles storing credential references securely without plaintext token/secret exposure in UI or logs.

3. **Dependency Graph Integration Candidate Publishing**:
   - Publishes candidate relationships (`Server → Host`, `App → DB`) for review before graph commits.

4. **Strict Color Palette**:
   - Styled exclusively using **RED, BLACK, WHITE** UI design.
