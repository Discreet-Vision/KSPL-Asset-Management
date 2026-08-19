from typing import Dict, Any

class SAMLicenseAdapter:
    """
    Adapter outputting canonical software products formatted for SAM (Software Asset Management)
    and license entitlement compliance calculation.
    """
    @staticmethod
    def format_for_sam(normalization_result: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "canonical_product_id": normalization_result.get("canonical_id"),
            "product_title": normalization_result.get("canonical_name"),
            "publisher": normalization_result.get("publisher"),
            "license_category": normalization_result.get("category"),
            "license_model": normalization_result.get("license_model", "Per User"),
            "entitlement_eligible": True if normalization_result.get("status") == "MATCHED" else False
        }
