import unittest
from software_normalizer.config import NormalizerConfig
from software_normalizer.preprocessing.cleaner import TextCleaner
from software_normalizer.catalog.reference_catalog import ReferenceCatalog
from software_normalizer.ml.tfidf_model import SoftwareTFIDFModel
from software_normalizer.nlp.spacy_processor import SpaCyNLPProcessor
from software_normalizer.pipeline.matching_engine import MultiStageMatchingPipeline
from software_normalizer.review.queue import HumanReviewQueue
from software_normalizer.adapters.reconciliation_adapter import SoftwareReconciliationAdapter
from software_normalizer.adapters.sam_adapter import SAMLicenseAdapter

class TestSoftwareNormalizerSuite(unittest.TestCase):

    def setUp(self):
        self.pipeline = MultiStageMatchingPipeline()

    def test_text_cleaner(self):
        cleaned = TextCleaner.preprocess("MSFT OFC 365 E3-Enterprise")
        self.assertIn("microsoft", cleaned)
        self.assertIn("office", cleaned)

    def test_exact_match(self):
        res = self.pipeline.normalize_software("Microsoft 365 E3")
        self.assertEqual(res["status"], "MATCHED")
        self.assertEqual(res["method"], "exact_match")
        self.assertEqual(res["confidence"], 1.0)

    def test_alias_match(self):
        res = self.pipeline.normalize_software("MSFT OFC 365 E3")
        self.assertEqual(res["status"], "MATCHED")
        self.assertEqual(res["method"], "alias_match")
        self.assertEqual(res["canonical_id"], "SW-MSFT-365-E3")

    def test_ml_matching(self):
        # Raw variation requiring ML similarity
        res = self.pipeline.normalize_software("Microsoft Office 365 Enterprise E3 Suite")
        self.assertIn(res["status"], ["MATCHED", "UNCERTAIN_HUMAN_REVIEW"])
        self.assertGreater(res["confidence"], 0.70)

    def test_human_review_queue_learning(self):
        queue = HumanReviewQueue()
        item = queue.enqueue_uncertain_match(
            raw_name="Custom MSFT App E3",
            raw_publisher="Microsoft",
            raw_version="16.0",
            source="AGENT",
            tenant_id="tenant-01",
            candidates=[{"canonical_id": "SW-MSFT-365-E3", "confidence": 0.85}],
            confidence=0.85
        )
        self.assertEqual(item.status, "PENDING_REVIEW")

        approved = queue.approve_review(item.review_id, "SW-MSFT-365-E3", "admin-user-1")
        self.assertEqual(approved["status"], "APPROVED")

    def test_reconciliation_and_sam_adapters(self):
        norm_res = self.pipeline.normalize_software("Microsoft 365 E3")
        recon = SoftwareReconciliationAdapter.format_for_reconciliation(norm_res, "tenant-01")
        self.assertEqual(recon["canonical_entity"]["id"], "SW-MSFT-365-E3")

        sam = SAMLicenseAdapter.format_for_sam(norm_res)
        self.assertEqual(sam["canonical_product_id"], "SW-MSFT-365-E3")
        self.assertTrue(sam["entitlement_eligible"])

if __name__ == "__main__":
    unittest.main()
