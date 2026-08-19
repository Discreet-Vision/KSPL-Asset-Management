from typing import Dict, Any, List
from object_storage_service.metadata.attachment_metadata import AttachmentMetadataRepository, AttachmentMetadataItem
from object_storage_service.config import StorageConfig

class TenantStorageQuotaManager:
    """
    Isolated quota and usage calculation manager for tenant S3 object storage.
    Calculates storage usage per category, per entity type, and enforces limits.
    """
    def __init__(self, repo: AttachmentMetadataRepository):
        self.repo = repo

    def calculate_tenant_usage(self, tenant_id: str) -> Dict[str, Any]:
        attachments = self.repo.list_all_tenant_attachments(tenant_id)
        
        total_bytes = sum(a.file_size for a in attachments)
        total_count = len(attachments)
        
        by_category: Dict[str, int] = {}
        by_entity_type: Dict[str, int] = {}
        
        for a in attachments:
            by_category[a.category] = by_category.get(a.category, 0) + a.file_size
            by_entity_type[a.entity_type] = by_entity_type.get(a.entity_type, 0) + a.file_size

        limit_bytes = StorageConfig.DEFAULT_TENANT_QUOTA_BYTES
        usage_pct = round((total_bytes / limit_bytes) * 100, 2) if limit_bytes > 0 else 0.0

        return {
            "tenant_id": tenant_id,
            "total_bytes_used": total_bytes,
            "total_bytes_used_mb": round(total_bytes / (1024 * 1024), 2),
            "quota_limit_bytes": limit_bytes,
            "quota_limit_bytes_gb": round(limit_bytes / (1024 * 1024 * 1024), 2),
            "usage_percentage": usage_pct,
            "total_file_count": total_count,
            "usage_by_category": by_category,
            "usage_by_entity_type": by_entity_type
        }
