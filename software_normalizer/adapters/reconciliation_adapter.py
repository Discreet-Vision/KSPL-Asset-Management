from typing import Dict, Any

class SoftwareReconciliationAdapter:
    """
    Adapter linking Software Normalizer results to the existing/new Reconciliation Engine
    without modifying existing source files or tables.
    """
    @staticmethod
    def format_for_reconciliation(normalization_result: Dict[str, Any], tenant_id: str) -> Dict[str, Any]:
        return {
            "source_type": "SOFTWARE_NORMALIZATION_SERVICE",
            "tenant_id": tenant_id,
            "raw_observation": {
                "name": normalization_result.get("raw_name"),
                "publisher": normalization_result.get("raw_publisher"),
                "version": normalization_result.get("raw_version")
            },
            "canonical_entity": {
                "id": normalization_result.get("canonical_id"),
                "name": normalization_result.get("canonical_name"),
                "publisher": normalization_result.get("publisher"),
                "edition": normalization_result.get("edition")
            },
            "matching_metadata": {
                "confidence": normalization_result.get("confidence"),
                "method": normalization_result.get("method"),
                "status": normalization_result.get("status"),
                "model_version": normalization_result.get("model_version")
            }
        }
