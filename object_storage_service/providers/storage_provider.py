import os
from typing import Dict, Any, Optional
from object_storage_service.config import StorageConfig

class ObjectStorageProviderInterface:
    """
    Abstract interface for S3-compatible object storage implementations (AWS S3, MinIO, Ceph).
    Prevents vendor lock-in and isolates storage drivers from ITAM business modules.
    """
    def put_object(self, object_key: str, data_bytes: bytes, mime_type: str, metadata: Dict[str, str]) -> Dict[str, Any]:
        raise NotImplementedError

    def generate_presigned_download_url(self, object_key: str, expires_in_seconds: int = 3600) -> str:
        raise NotImplementedError

    def generate_presigned_upload_url(self, object_key: str, mime_type: str, expires_in_seconds: int = 3600) -> str:
        raise NotImplementedError

    def delete_object(self, object_key: str) -> bool:
        raise NotImplementedError

class S3Provider(ObjectStorageProviderInterface):
    """
    AWS S3 production storage provider adapter.
    """
    def __init__(self, endpoint: str = StorageConfig.S3_ENDPOINT, region: str = StorageConfig.S3_REGION, bucket: str = StorageConfig.S3_BUCKET):
        self.endpoint = endpoint
        self.region = region
        self.bucket = bucket

    def put_object(self, object_key: str, data_bytes: bytes, mime_type: str, metadata: Dict[str, str]) -> Dict[str, Any]:
        # Simulated S3 PutObject response
        return {
            "provider": "AWS_S3",
            "bucket": self.bucket,
            "object_key": object_key,
            "size_bytes": len(data_bytes),
            "etag": f'"s3-etag-{hash(object_key)}"'
        }

    def generate_presigned_download_url(self, object_key: str, expires_in_seconds: int = 3600) -> str:
        return f"{self.endpoint}/{self.bucket}/{object_key}?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Expires={expires_in_seconds}&X-Amz-Signature=s3-sig-mock"

    def generate_presigned_upload_url(self, object_key: str, mime_type: str, expires_in_seconds: int = 3600) -> str:
        return f"{self.endpoint}/{self.bucket}/{object_key}?upload=true&X-Amz-Expires={expires_in_seconds}"

    def delete_object(self, object_key: str) -> bool:
        return True

class MinIOProvider(ObjectStorageProviderInterface):
    """
    MinIO on-premise / private cloud object storage provider adapter.
    Supports custom S3 endpoints with path-style URL addressing.
    """
    def __init__(self, endpoint: str = "http://minio.internal:9000", bucket: str = "itam-minio-vault"):
        self.endpoint = endpoint
        self.bucket = bucket

    def put_object(self, object_key: str, data_bytes: bytes, mime_type: str, metadata: Dict[str, str]) -> Dict[str, Any]:
        return {
            "provider": "MINIO",
            "bucket": self.bucket,
            "object_key": object_key,
            "size_bytes": len(data_bytes),
            "etag": f'"minio-etag-{hash(object_key)}"'
        }

    def generate_presigned_download_url(self, object_key: str, expires_in_seconds: int = 3600) -> str:
        return f"{self.endpoint}/{self.bucket}/{object_key}?minio-signature=mock-minio-sig&expires={expires_in_seconds}"

    def generate_presigned_upload_url(self, object_key: str, mime_type: str, expires_in_seconds: int = 3600) -> str:
        return f"{self.endpoint}/{self.bucket}/{object_key}?upload=minio&expires={expires_in_seconds}"

    def delete_object(self, object_key: str) -> bool:
        return True

def get_storage_provider() -> ObjectStorageProviderInterface:
    provider_type = StorageConfig.STORAGE_PROVIDER.lower()
    if provider_type == "minio":
        return MinIOProvider()
    return S3Provider()
