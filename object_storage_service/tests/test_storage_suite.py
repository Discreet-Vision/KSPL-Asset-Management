import unittest
from object_storage_service.config import StorageConfig
from object_storage_service.providers.storage_provider import S3Provider, MinIOProvider, get_storage_provider
from object_storage_service.validation.file_validator import FileSecurityValidator
from object_storage_service.metadata.attachment_metadata import AttachmentMetadataRepository, AttachmentMetadataItem
from object_storage_service.quota.tenant_quota import TenantStorageQuotaManager

class TestObjectStorageSuite(unittest.TestCase):

    def test_file_security_validation_allowed(self):
        valid, msg = FileSecurityValidator.validate_file_upload("contract_final.pdf", 500000)
        self.assertTrue(valid)
        self.assertEqual(msg, "Valid")

    def test_file_security_validation_blocked_executable(self):
        valid, msg = FileSecurityValidator.validate_file_upload("malicious_script.exe", 1000)
        self.assertFalse(valid)
        self.assertIn("Executable / script file format .exe is strictly prohibited", msg)

    def test_file_security_validation_oversized(self):
        valid, msg = FileSecurityValidator.validate_file_upload("large_archive.pdf", 100 * 1024 * 1024)
        self.assertFalse(valid)
        self.assertIn("exceeds limit", msg)

    def test_sha256_checksum_calculation(self):
        test_data = b"Enterprise ITAM S3 Storage Document Content"
        checksum = FileSecurityValidator.calculate_sha256(test_data)
        self.assertEqual(len(checksum), 64) # SHA256 length is 64 hex characters

    def test_tenant_object_key_generation(self):
        key = FileSecurityValidator.generate_tenant_object_key("tenant-kspl-global", "Contract", "CTR-901", "invoice.pdf")
        self.assertTrue(key.startswith("tenants/tenant-kspl-global/contract/CTR-901/"))
        self.assertTrue(key.endswith(".pdf"))

    def test_s3_provider_put_and_presigned_urls(self):
        s3 = S3Provider(endpoint="https://s3.amazonaws.com", bucket="test-vault")
        res = s3.put_object("key/test.pdf", b"data", "application/pdf", {})
        self.assertEqual(res["provider"], "AWS_S3")
        
        url = s3.generate_presigned_download_url("key/test.pdf")
        self.assertIn("X-Amz-Signature", url)

    def test_minio_provider_put_and_presigned_urls(self):
        minio = MinIOProvider(endpoint="http://minio.internal:9000", bucket="test-minio")
        res = minio.put_object("key/test.pdf", b"data", "application/pdf", {})
        self.assertEqual(res["provider"], "MINIO")
        
        url = minio.generate_presigned_download_url("key/test.pdf")
        self.assertIn("minio-signature", url)

    def test_metadata_repository_and_entity_list(self):
        repo = AttachmentMetadataRepository()
        items = repo.list_by_entity("tenant-kspl-global", "Contract", "CTR-DELL-8821")
        self.assertGreater(len(items), 0)
        self.assertEqual(items[0].original_filename, "Dell_ProSupport_Master_Contract_2026.pdf")

    def test_tenant_storage_quota_calculation(self):
        repo = AttachmentMetadataRepository()
        quota_mgr = TenantStorageQuotaManager(repo)
        usage = quota_mgr.calculate_tenant_usage("tenant-kspl-global")
        self.assertEqual(usage["tenant_id"], "tenant-kspl-global")
        self.assertGreater(usage["total_bytes_used"], 0)
        self.assertIn("Contract", usage["usage_by_category"])

if __name__ == "__main__":
    unittest.main()
