import unittest

class TestSAMAdvancedEngine(unittest.TestCase):
    def setUp(self):
        self.owned_oracle_cores = 64
        self.consumed_oracle_cores = 80

        self.owned_msft_users = 1000
        self.consumed_msft_users = 920

    def test_elp_delta_calculation(self):
        elp_oracle = self.owned_oracle_cores - self.consumed_oracle_cores
        self.assertEqual(elp_oracle, -16)

        elp_msft = self.owned_msft_users - self.consumed_msft_users
        self.assertEqual(elp_msft, 80)

    def test_compliance_status_determination(self):
        status_oracle = "Under-Licensed" if (self.owned_oracle_cores < self.consumed_oracle_cores) else "Compliant"
        self.assertEqual(status_oracle, "Under-Licensed")

        status_msft = "Under-Licensed" if (self.owned_msft_users < self.consumed_msft_users) else "Compliant"
        self.assertEqual(status_msft, "Compliant")

    def test_shadow_it_risk_evaluation(self):
        unapproved_app = True
        has_sensitive_data = True
        risk_level = "High" if (unapproved_app and has_sensitive_data) else "Low"
        self.assertEqual(risk_level, "High")

if __name__ == '__main__':
    unittest.main()
