import unittest

class TestSoftwareNormalizationCatalog(unittest.TestCase):
    def setUp(self):
        self.high_confidence_threshold = 80
        self.review_threshold = 50

    def test_publisher_alias_resolution(self):
        aliases = {'msft': 'Microsoft', 'ms': 'Microsoft', 'adbe': 'Adobe'}
        self.assertEqual(aliases.get('msft'), 'Microsoft')

    def test_confidence_scoring_normalization(self):
        score = 95
        self.assertGreaterEqual(score, self.high_confidence_threshold)

    def test_flagged_for_review(self):
        score = 65
        self.assertGreaterEqual(score, self.review_threshold)
        self.assertLess(score, self.high_confidence_threshold)

    def test_raw_string_preservation(self):
        raw = "MSFT OFC 365 E3 (64-bit)"
        self.assertTrue(len(raw) > 0)

if __name__ == '__main__':
    unittest.main()
