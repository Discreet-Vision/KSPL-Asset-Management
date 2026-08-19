import datetime
from typing import Dict, Any

class AgentlessReconciliationAdapter:
    """
    Normalizes raw SNMP/WMI/SSH/Nmap observations into standard ITAM discovery payload format
    WITHOUT modifying existing core reconciliation/CMDB logic.
    """

    @staticmethod
    def normalize_observation(raw_record: Dict[str, Any], tenant_id: str) -> Dict[str, Any]:
        hw = raw_record.get("hardware", {})
        os_info = raw_record.get("operating_system", {})
        sw = raw_record.get("software", [])
        net = raw_record.get("network_interfaces", [])

        normalized_payload = {
            "source": "AGENTLESS_DISCOVERY",
            "protocol": raw_record.get("protocol"),
            "tenant_id": tenant_id,
            "target_ip": raw_record.get("ip_address"),
            "discovered_at": datetime.datetime.utcnow().isoformat() + "Z",
            "signals": {
                "serial_number": hw.get("serial_number"),
                "system_uuid": hw.get("system_uuid"),
                "mac_addresses": [n.get("mac") for n in net if n.get("mac")],
                "hostname": raw_record.get("hostname") or raw_record.get("ip_address"),
                "manufacturer": hw.get("manufacturer"),
                "model": hw.get("model")
            },
            "inventory": {
                "hardware": hw,
                "operating_system": os_info,
                "software": sw,
                "network": net
            },
            "ci_relationships": raw_record.get("ci_relationships", [])
        }
        return normalized_payload
