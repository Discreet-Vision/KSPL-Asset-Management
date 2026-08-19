import unittest

class TestFinancialAdvancedEngine(unittest.TestCase):
    def setUp(self):
        self.contract_value = 450000
        self.days_remaining = 141
        self.initial_cost = 1850
        self.residual_value = 200
        self.useful_years = 3

    def test_straight_line_depreciation(self):
        annual_depreciation = (self.initial_cost - self.residual_value) / self.useful_years
        self.assertEqual(annual_depreciation, 550.0)

    def test_contract_renewal_deadline_alert(self):
        is_expiring_soon = self.days_remaining <= 180
        self.assertTrue(is_expiring_soon)

    def test_tco_calculation(self):
        purchase = 1850
        maint = 150
        support = 200
        license_fee = 450
        tco = purchase + maint + support + license_fee
        self.assertEqual(tco, 2650)

if __name__ == '__main__':
    unittest.main()
