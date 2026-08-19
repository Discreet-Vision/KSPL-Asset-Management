import os

class StorageConfig:
    SERVICE_NAME: str = "Enterprise ITAM S3-Compatible Object Storage Subsystem"
    VERSION: str = "1.0.0-s3"
    PORT: int = 8084
    
    # Provider Selection: 's3' or 'minio'
    STORAGE_PROVIDER: str = os.getenv("STORAGE_PROVIDER", "s3")
    
    # S3 / MinIO Connection Config
    S3_ENDPOINT: str = os.getenv("S3_ENDPOINT", "https://s3.amazonaws.com")
    S3_REGION: str = os.getenv("S3_REGION", "us-east-1")
    S3_BUCKET: str = os.getenv("S3_BUCKET", "enterprise-itam-attachments-vault")
    S3_ACCESS_KEY: str = os.getenv("S3_ACCESS_KEY", "MOCK_S3_ACCESS_KEY_VAULT")
    S3_SECRET_KEY: str = os.getenv("S3_SECRET_KEY", "MOCK_S3_SECRET_KEY_VAULT")
    S3_USE_PATH_STYLE: bool = os.getenv("S3_USE_PATH_STYLE", "false").lower() == "true"
    
    # Security & Quota Defaults
    MAX_FILE_SIZE_BYTES: int = 50 * 1024 * 1024 # 50 MB per document
    DEFAULT_TENANT_QUOTA_BYTES: int = 100 * 1024 * 1024 * 1024 # 100 GB per tenant
    
    # Allowed Document Extensions
    ALLOWED_EXTENSIONS: set = {
        "pdf", "doc", "docx", "xls", "xlsx", "csv", "txt", 
        "jpg", "jpeg", "png", "webp"
    }
    
    # Forbidden Executable Extensions
    BLOCKED_EXTENSIONS: set = {
        "exe", "bat", "cmd", "ps1", "sh", "dll", "scr", "vbs", "msi"
    }
