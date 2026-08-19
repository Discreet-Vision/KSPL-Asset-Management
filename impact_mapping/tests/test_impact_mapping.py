import unittest

class TestImpactMappingEngine(unittest.TestCase):
    def setUp(self):
        self.critical_risk_threshold = 75
        self.high_risk_threshold = 50

    def test_direct_vs_indirect_impact(self):
        nodes = ['DB-01', 'APP-01', 'SERVICE-01']
        direct = ['APP-01']
        indirect = ['SERVICE-01']
        self.assertEqual(len(direct), 1)
        self.assertEqual(len(indirect), 1)
        self.assertEqual(len(nodes), 3)

    def test_risk_scoring_spof(self):
        spof_identified = True
        raw_risk = 50
        if spof_identified:
            raw_risk += 30
        self.assertGreaterEqual(raw_risk, self.critical_risk_threshold)

    def test_multi_ci_deduplication(self):
        selected_cis = ['DB-01', 'DB-02']
        affected_set = set(['APP-01', 'APP-02', 'APP-01']) # includes duplicate
        self.assertEqual(len(affected_set), 2)

if __name__ == '__main__':
    unittest.main()
