import hashlib
import uuid
import re
from typing import Dict, Any, Tuple
from object_storage_service.config import StorageConfig

class FileSecurityValidator:
    """
    Strict security validator for ITAM attachments:
    - Blocks executable file types (.exe, .bat, .sh, .dll)
    - Validates file extensions against allowed whitelist
    - Calculates SHA-256 checksums for data integrity
    - Generates multi-tenant isolated object keys preventing path traversal
    """

    @classmethod
    def calculate_sha256(cls, data_bytes: bytes) -> str:
        return hashlib.sha256(data_bytes).hexdigest()

    @classmethod
    def validate_file_upload(cls, filename: str, file_size_bytes: int) -> Tuple[bool, str]:
        if file_size_bytes > StorageConfig.MAX_FILE_SIZE_BYTES:
            return False, f"File size {file_size_bytes} exceeds limit of {StorageConfig.MAX_FILE_SIZE_BYTES} bytes."

        # Extract extension safely
        ext = filename.split(".")[-1].lower() if "." in filename else ""
        
        if ext in StorageConfig.BLOCKED_EXTENSIONS:
            return False, f"Executable / script file format .{ext} is strictly prohibited."

        if ext not in StorageConfig.ALLOWED_EXTENSIONS:
            return False, f"Extension .{ext} is not in allowed document extensions: {', '.join(StorageConfig.ALLOWED_EXTENSIONS)}"

        return True, "Valid"

    @classmethod
    def generate_tenant_object_key(cls, tenant_id: str, entity_type: str, entity_id: str, original_filename: str) -> str:
        # Prevent path traversal in original filenames
        safe_entity_type = re.sub(r'[^a-zA-Z0-9_-]', '', entity_type.lower())
        safe_entity_id = re.sub(r'[^a-zA-Z0-9_-]', '', entity_id)
        safe_tenant_id = re.sub(r'[^a-zA-Z0-9_-]', '', tenant_id)
        
        ext = original_filename.split(".")[-1].lower() if "." in original_filename else "bin"
        unique_uuid = uuid.uuid4().hex
        
        # Structure: tenants/{tenant_id}/{entity_type}/{entity_id}/{uuid}.{ext}
        return f"tenants/{safe_tenant_id}/{safe_entity_type}/{safe_entity_id}/{unique_uuid}.{ext}"
