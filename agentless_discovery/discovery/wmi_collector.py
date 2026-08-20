from typing import Dict, Any

class WMICollector:
    def __init__(self, username: str, secret: str, domain: str = ""):
        self.username = username
        self.secret = secret
        self.domain = domain

    def collect(self, ip_address: str) -> Dict[str, Any]:
        return {"protocol": "WMI", "ip_address": ip_address, "error": "WMI worker is not configured"}
