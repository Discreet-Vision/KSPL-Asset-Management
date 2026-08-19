import unittest

class TestEnterpriseIntegrationFabric(unittest.TestCase):
    def setUp(self):
        self.categories = [
            "HRIS", "ERP_FINANCE", "ITSM", "CLOUD_PROVIDER", 
            "MDM_UEM", "SSO_IDP", "SAAS_DISCOVERY", "CASB_SECURITY", 
            "PROCUREMENT", "BI_DATA_WAREHOUSE", "SIEM"
        ]
        self.auth_methods = ["OAuth2", "OIDC", "SAML", "API_Key", "Service_Account", "Vendor_Token"]
        self.cloud_costs = {
            "AWS": 4275.00,
            "Azure": 6300.00
        }

    def test_categories_count(self):
        self.assertEqual(len(self.categories), 11)

    def test_total_cloud_cost_calculation(self):
        total = sum(self.cloud_costs.values())
        self.assertEqual(total, 10575.00)

    def test_auth_methods_support(self):
        self.assertIn("OAuth2", self.auth_methods)
        self.assertIn("Service_Account", self.auth_methods)

if __name__ == '__main__':
    unittest.main()
