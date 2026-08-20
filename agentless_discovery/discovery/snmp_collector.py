from typing import Dict, Any

class SNMPCollector:
    def __init__(self, community_or_v3_user: str, secret: str, version: str = "v2c"):
        self.version = version
        self.user_or_community = community_or_v3_user
        self.secret = secret

    def collect(self, ip_address: str) -> Dict[str, Any]:
        # Collector execution is intentionally delegated to the installed scanner worker.
        # This service must never return a representative device when PySNMP is unavailable.
        return {"protocol": "SNMP", "ip_address": ip_address, "error": "SNMP worker is not configured"}
