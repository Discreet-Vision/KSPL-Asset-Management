import os

class CopilotConfig:
    SERVICE_NAME: str = "Enterprise ITAM & CMDB AI Copilot Subsystem"
    VERSION: str = "1.0.0-claude"
    PORT: int = 8083
    
    # Model Abstraction Config
    DEFAULT_PROVIDER: str = "anthropic"
    DEFAULT_MODEL: str = os.getenv("ANTHROPIC_MODEL", "claude-3-5-sonnet-20241022")
    MAX_TOKENS: int = 2048
    TEMPERATURE: float = 0.2 # Low temperature for factual precision
    PROMPT_VERSION: str = "1.0.0"
    
    # Security & Rate Limits
    MAX_REQUESTS_PER_MINUTE: int = 30
    MAX_TOKEN_BUDGET_PER_DAY: int = 500000
    READ_ONLY_MODE: bool = True
