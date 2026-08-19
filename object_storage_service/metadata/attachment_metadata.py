import datetime
import uuid
from typing import Dict, List, Optional, Any

class AttachmentMetadataItem:
    def __init__(
        self,
        tenant_id: str,
        entity_type: str,
        entity_id: str,
        original_filename: str,
        object_key: str,
        mime_type: str,
        file_size: int,
        checksum: str,
        category: str = "General Attachment",
        uploaded_by: str = "system-user",
        provider: str = "S3"
    ):
        self.attachment_id = f"ATT-{uuid.uuid4().hex[:10].upper()}"
        self.tenant_id = tenant_id
        self.entity_type = entity_type
        self.entity_id = entity_id
        self.original_filename = original_filename
        self.object_key = object_key
        self.mime_type = mime_type
        self.file_size = file_size
        self.checksum = checksum
        self.category = category
        self.uploaded_by = uploaded_by
        self.provider = provider
        self.status = "AVAILABLE" # AVAILABLE, PENDING_SCAN, QUARANTINED, ARCHIVED, DELETED
        self.version = 1
        self.uploaded_at = datetime.datetime.utcnow().isoformat() + "Z"

    def to_dict(self) -> Dict[str, Any]:
        return {
            "attachment_id": self.attachment_id,
            "tenant_id": self.tenant_id,
            "entity_type": self.entity_type,
            "entity_id": self.entity_id,
            "original_filename": self.original_filename,
            "object_key": self.object_key,
            "mime_type": self.mime_type,
            "file_size": self.file_size,
            "checksum": self.checksum,
            "category": self.category,
            "uploaded_by": self.uploaded_by,
            "provider": self.provider,
            "status": self.status,
            "version": self.version,
            "uploaded_at": self.uploaded_at
        }

class AttachmentMetadataRepository:
    """
    Isolated metadata repository managing object attachment mappings for ITAM entities
    without modifying existing entity database tables.
    """
    def __init__(self):
        self._store: Dict[str, AttachmentMetadataItem] = {}
        self._seed_default_attachments()

    def _seed_default_attachments(self):
        seed_items = [
            AttachmentMetadataItem(
                tenant_id="tenant-kspl-global",
                entity_type="Contract",
                entity_id="CTR-DELL-8821",
                original_filename="Dell_ProSupport_Master_Contract_2026.pdf",
                object_key="tenants/tenant-kspl-global/contract/ctr-dell-8821/doc01.pdf",
                mime_type="application/pdf",
                file_size=2458000,
                checksum="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
                category="Contract",
                uploaded_by="usr-legal-admin",
                provider="AWS_S3"
            ),
            AttachmentMetadataItem(
                tenant_id="tenant-kspl-global",
                entity_type="Warranty",
                entity_id="AST-8001",
                original_filename="Server_001_Dell_Warranty_Certificate.pdf",
                object_key="tenants/tenant-kspl-global/warranty/ast-8001/doc02.pdf",
                mime_type="application/pdf",
                file_size=1204000,
                checksum="8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4",
                category="Warranty",
                uploaded_by="usr-hardware-tech",
                provider="AWS_S3"
            ),
            AttachmentMetadataItem(
                tenant_id="tenant-kspl-global",
                entity_type="Disposal",
                entity_id="DSP-2026-09",
                original_filename="E-Waste_Destruction_Certificate_Signed.pdf",
                object_key="tenants/tenant-kspl-global/disposal/dsp-2026-09/doc03.pdf",
                mime_type="application/pdf",
                file_size=3100000,
                checksum="315f5bdb76d078c43b8ac0064e4a0164612b1fce77c869345bfc94c75894edd3",
                category="Disposal Certificate",
                uploaded_by="usr-compliance-officer",
                provider="MinIO"
            )
        ]
        for item in seed_items:
            self._store[item.attachment_id] = item

    def save(self, item: AttachmentMetadataItem):
        self._store[item.attachment_id] = item

    def get_by_id(self, attachment_id: str) -> Optional[AttachmentMetadataItem]:
        return self._store.get(attachment_id)

    def list_by_entity(self, tenant_id: str, entity_type: str, entity_id: str) -> List[AttachmentMetadataItem]:
        return [
            item for item in self._store.values()
            if item.tenant_id == tenant_id 
            and item.entity_type.lower() == entity_type.lower() 
            and item.entity_id == entity_id
            and item.status != "DELETED"
        ]

    def list_all_tenant_attachments(self, tenant_id: str) -> List[AttachmentMetadataItem]:
        return [
            item for item in self._store.values()
            if item.tenant_id == tenant_id and item.status != "DELETED"
        ]

    def soft_delete(self, attachment_id: str) -> bool:
        item = self._store.get(attachment_id)
        if item:
            item.status = "DELETED"
            return True
        return False
