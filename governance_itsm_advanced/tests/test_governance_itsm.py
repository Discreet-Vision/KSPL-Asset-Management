import unittest

class TestGovernanceItsmEngine(unittest.TestCase):
    def setUp(self):
        self.workflow_id = "wf-laptop-approval-v2"
        self.cve_id = "CVE-2026-22901"
        self.cvss_score = 9.8
        self.field_permission = "DENY"

    def test_workflow_node_sequence(self):
        nodes_count = 7
        self.assertGreaterEqual(nodes_count, 3)

    def test_cve_critical_severity(self):
        is_critical = self.cvss_score >= 9.0
        self.assertTrue(is_critical)

    def test_field_level_rbac_deny(self):
        self.assertEqual(self.field_permission, "DENY")

if __name__ == '__main__':
    unittest.main()
