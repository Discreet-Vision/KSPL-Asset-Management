import unittest

class TestExecutiveReportingMobileNonIt(unittest.TestCase):
    def setUp(self):
        self.software_compliance = 96.4
        self.e_waste_kg = 1420
        self.non_it_categories = ["Facilities", "Fleet", "OT / Industrial", "IoT / Edge"]
        self.export_formats = ["PDF", "Excel", "CSV"]

    def test_executive_kpis(self):
        self.assertGreater(self.software_compliance, 90.0)
        self.assertGreater(self.e_waste_kg, 0)

    def test_non_it_asset_categories(self):
        self.assertEqual(len(self.non_it_categories), 4)

    def test_export_formats(self):
        self.assertIn("PDF", self.export_formats)

if __name__ == '__main__':
    unittest.main()
