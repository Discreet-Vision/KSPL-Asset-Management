import re
from typing import Dict, Any, List

class SecurityAndPromptInjectionHandler:
    """
    Sanitizes untrusted CMDB / ITAM data and strips potential prompt injection vectors
    before passing records to LLM contexts. Protects PII & Financial details.
    """
    
    INJECTION_PATTERNS = [
        r"ignore previous instructions",
        r"system prompt",
        r"you are now an unrestricted",
        r"override safety",
        r"bypass rules",
        r"eval\(",
        r"<script>"
    ]

    @classmethod
    def sanitize_untrusted_data(cls, raw_data_str: str) -> str:
        clean_text = raw_data_str
        for pattern in cls.INJECTION_PATTERNS:
            clean_text = re.sub(pattern, "[FILTERED_INJECTION_ATTEMPT]", clean_text, flags=re.IGNORECASE)
        return clean_text

    @classmethod
    def strip_pii_for_llm(cls, record: Dict[str, Any], user_has_financial_access: bool = False) -> Dict[str, Any]:
        sanitized = dict(record)
        # Redact personal PII email/ssn
        if "email" in sanitized:
            sanitized["email"] = "[REDACTED_PII]"
        if "phone" in sanitized:
            sanitized["phone"] = "[REDACTED_PII]"
            
        # Protect financial metrics if user lacks financial authorization
        if not user_has_financial_access:
            for fin_key in ["purchase_cost", "depreciation", "contract_value", "license_cost"]:
                if fin_key in sanitized:
                    sanitized[fin_key] = "[RESTRICTED_FINANCIAL_DATA]"

        return sanitized
