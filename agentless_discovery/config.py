import os

class AgentlessConfig:
    SERVICE_NAME: str = "Enterprise Agentless Discovery Service"
    VERSION: str = "1.0.0-python"
    PORT: int = 8080
    SECRET_KEY: str = os.getenv("AGENTLESS_SECRET_KEY", "")
    MAX_CONCURRENT_HOSTS: int = 50
    MAX_CONCURRENT_SNMP: int = 20
    MAX_CONCURRENT_WMI: int = 10
    MAX_CONCURRENT_SSH: int = 15
    DEFAULT_TIMEOUT_SEC: int = 15
    MAX_RETRY_COUNT: int = 2
    ALLOW_INTERNET_SCANNING: bool = False
    APPROVED_CIDRS: list = [cidr.strip() for cidr in os.getenv("DISCOVERY_APPROVED_CIDRS", "").split(",") if cidr.strip()]
