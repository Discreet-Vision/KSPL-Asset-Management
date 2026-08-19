from fastapi import FastAPI, HTTPException, Header, UploadFile, File, Form
from pydantic import BaseModel
from typing import List, Optional, Any
import base64

from object_storage_service.config import StorageConfig
from object_storage_service.providers.storage_provider import get_storage_provider, S3Provider, MinIOProvider
from object_storage_service.metadata.attachment_metadata import AttachmentMetadataRepository, AttachmentMetadataItem
from object_storage_service.validation.file_validator import FileSecurityValidator
from object_storage_service.quota/tenant_quota import TenantStorageQuotaManager

app = FastAPI(
    title=StorageConfig.SERVICE_NAME,
    version=StorageConfig.VERSION,
    description="S3-Compatible Object & Attachment Storage Subsystem for Enterprise ITAM"
)

metadata_repo = AttachmentMetadataRepository()
quota_manager = TenantStorageQuotaManager(metadata_repo)
storage_provider = get_storage_provider()

class PresignUploadRequest(BaseModel):
    entity_type: str
    entity_id: str
    filename: str
    file_size: int
    category: Optional[str] = "General Attachment"

class CompleteUploadRequest(BaseModel):
    entity_type: str
    entity_id: str
    filename: str
    object_key: str
    file_size: int
    checksum: str
    category: Optional[str] = "General Attachment"

@app.get("/health")
def health_check():
    return {
        "status": "HEALTHY",
        "service": StorageConfig.SERVICE_NAME,
        "version": StorageConfig.VERSION,
        "provider": StorageConfig.STORAGE_PROVIDER,
        "bucket": StorageConfig.S3_BUCKET,
        "endpoint": StorageConfig.S3_ENDPOINT
    }

@app.post("/object-storage/upload")
async def upload_attachment(
    entity_type: str = Form(...),
    entity_id: str = Form(...),
    category: str = Form("Contract"),
    file: UploadFile = File(...),
    x_tenant_id: str = Header("tenant-kspl-global"),
    x_user_id: str = Header("usr-admin")
):
    file_bytes = await file.read()
    filename = file.filename or "attachment.bin"
    file_size = len(file_bytes)

    # 1. Security & MIME validation
    is_valid, msg = FileSecurityValidator.validate_file_upload(filename, file_size)
    if not is_valid:
        raise HTTPException(status_code=400, detail=msg)

    # 2. SHA-256 Checksum
    checksum = FileSecurityValidator.calculate_sha256(file_bytes)

    # 3. Object key generation
    object_key = FileSecurityValidator.generate_tenant_object_key(x_tenant_id, entity_type, entity_id, filename)

    # 4. Put to object storage
    put_res = storage_provider.put_object(
        object_key=object_key,
        data_bytes=file_bytes,
        mime_type=file.content_type or "application/octet-stream",
        metadata={"tenant_id": x_tenant_id, "entity_type": entity_type, "entity_id": entity_id}
    )

    # 5. Save attachment metadata
    item = AttachmentMetadataItem(
        tenant_id=x_tenant_id,
        entity_type=entity_type,
        entity_id=entity_id,
        original_filename=filename,
        object_key=object_key,
        mime_type=file.content_type or "application/octet-stream",
        file_size=file_size,
        checksum=checksum,
        category=category,
        uploaded_by=x_user_id,
        provider=put_res["provider"]
    )
    metadata_repo.save(item)

    return {
        "status": "SUCCESS",
        "attachment": item.to_dict(),
        "storage_details": put_res
    }

@app.post("/object-storage/presign-upload")
def request_presigned_upload_url(
    req: PresignUploadRequest,
    x_tenant_id: str = Header("tenant-kspl-global")
):
    is_valid, msg = FileSecurityValidator.validate_file_upload(req.filename, req.file_size)
    if not is_valid:
        raise HTTPException(status_code=400, detail=msg)

    object_key = FileSecurityValidator.generate_tenant_object_key(x_tenant_id, req.entity_type, req.entity_id, req.filename)
    presigned_url = storage_provider.generate_presigned_upload_url(object_key, "application/octet-stream", expires_in_seconds=1800)

    return {
        "status": "SUCCESS",
        "object_key": object_key,
        "presigned_upload_url": presigned_url,
        "expires_in_seconds": 1800
    }

@app.post("/object-storage/complete-upload")
def complete_presigned_upload(
    req: CompleteUploadRequest,
    x_tenant_id: str = Header("tenant-kspl-global"),
    x_user_id: str = Header("usr-admin")
):
    item = AttachmentMetadataItem(
        tenant_id=x_tenant_id,
        entity_type=req.entity_type,
        entity_id=req.entity_id,
        original_filename=req.filename,
        object_key=req.object_key,
        mime_type="application/pdf" if req.filename.endswith(".pdf") else "application/octet-stream",
        file_size=req.file_size,
        checksum=req.checksum,
        category=req.category or "General Attachment",
        uploaded_by=x_user_id,
        provider=StorageConfig.STORAGE_PROVIDER.upper()
    )
    metadata_repo.save(item)

    return {
        "status": "SUCCESS",
        "message": "Presigned object upload confirmed & metadata recorded.",
        "attachment": item.to_dict()
    }

@app.get("/object-storage/{attachment_id}")
def get_attachment_metadata(
    attachment_id: str,
    x_tenant_id: str = Header("tenant-kspl-global")
):
    item = metadata_repo.get_by_id(attachment_id)
    if not item or item.tenant_id != x_tenant_id:
        raise HTTPException(status_code=404, detail="Attachment not found or access denied.")
    return {"status": "SUCCESS", "attachment": item.to_dict()}

@app.get("/object-storage/{attachment_id}/download")
def get_download_presigned_url(
    attachment_id: str,
    x_tenant_id: str = Header("tenant-kspl-global")
):
    item = metadata_repo.get_by_id(attachment_id)
    if not item or item.tenant_id != x_tenant_id:
        raise HTTPException(status_code=404, detail="Attachment not found or access denied.")

    download_url = storage_provider.generate_presigned_download_url(item.object_key, expires_in_seconds=3600)

    return {
        "status": "SUCCESS",
        "attachment_id": item.attachment_id,
        "filename": item.original_filename,
        "presigned_download_url": download_url,
        "expires_in_seconds": 3600
    }

@app.get("/object-storage/{attachment_id}/preview")
def preview_attachment(
    attachment_id: str,
    x_tenant_id: str = Header("tenant-kspl-global")
):
    item = metadata_repo.get_by_id(attachment_id)
    if not item or item.tenant_id != x_tenant_id:
        raise HTTPException(status_code=404, detail="Attachment not found or access denied.")

    download_url = storage_provider.generate_presigned_download_url(item.object_key, expires_in_seconds=1800)

    return {
        "status": "SUCCESS",
        "attachment_id": item.attachment_id,
        "mime_type": item.mime_type,
        "filename": item.original_filename,
        "preview_url": download_url,
        "can_preview_inline": item.mime_type in ["application/pdf", "image/png", "image/jpeg", "image/webp"]
    }

@app.delete("/object-storage/{attachment_id}")
def delete_attachment(
    attachment_id: str,
    x_tenant_id: str = Header("tenant-kspl-global")
):
    item = metadata_repo.get_by_id(attachment_id)
    if not item or item.tenant_id != x_tenant_id:
        raise HTTPException(status_code=404, detail="Attachment not found or access denied.")

    metadata_repo.soft_delete(attachment_id)
    return {
        "status": "SUCCESS",
        "message": f"Attachment {attachment_id} soft-deleted safely. Status set to DELETED."
    }

@app.get("/object-storage/entity/{entity_type}/{entity_id}")
def list_entity_attachments(
    entity_type: str,
    entity_id: str,
    x_tenant_id: str = Header("tenant-kspl-global")
):
    items = metadata_repo.list_by_entity(x_tenant_id, entity_type, entity_id)
    return {
        "status": "SUCCESS",
        "tenant_id": x_tenant_id,
        "entity_type": entity_type,
        "entity_id": entity_id,
        "count": len(items),
        "attachments": [item.to_dict() for item in items]
    }

@app.get("/object-storage/quota/summary")
def get_storage_quota_summary(
    x_tenant_id: str = Header("tenant-kspl-global")
):
    usage = quota_manager.calculate_tenant_usage(x_tenant_id)
    return {
        "status": "SUCCESS",
        "quota_summary": usage
    }
