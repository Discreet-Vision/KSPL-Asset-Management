import unittest

class TestEnterpriseCmdbDataModel(unittest.TestCase):
    def setUp(self):
        self.ci_classes = ["Hardware", "Server", "Laptop", "Software", "Cloud", "Facilities", "Fleet", "OT", "IoT"]
        self.relationship_types = ["runs_on", "depends_on", "hosted_by", "connects_to", "used_by", "contains", "located_in", "managed_by", "assigned_to"]
        self.entitled_qty = 1000
        self.consumed_qty = 850

    def test_elp_calculation(self):
        elp = self.entitled_qty - self.consumed_qty
        self.assertEqual(elp, 150)

    def test_ci_classes_count(self):
        self.assertEqual(len(self.ci_classes), 9)

    def test_relationship_types(self):
        self.assertIn("hosted_by", self.relationship_types)

if __name__ == '__main__':
    unittest.main()
