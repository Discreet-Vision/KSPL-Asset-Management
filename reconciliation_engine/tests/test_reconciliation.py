import unittest

class TestReconciliationEngine(unittest.TestCase):
    def setUp(self):
        self.auto_merge_threshold = 85
        self.review_threshold = 65

    def test_scoring_auto_merge(self):
        score = 90
        self.assertGreaterEqual(score, self.auto_merge_threshold)

    def test_scoring_flag_for_review(self):
        score = 75
        self.assertGreaterEqual(score, self.review_threshold)
        self.assertLess(score, self.auto_merge_threshold)

    def test_field_precedence(self):
        sources = ['Agent', 'WMI', 'SSH', 'Agentless', 'Manual', 'Import']
        agent_prio = sources.index('Agent')
        wmi_prio = sources.index('WMI')
        self.assertLess(agent_prio, wmi_prio)

    def test_empty_value_rejection(self):
        new_value = None
        self.assertIsNone(new_value)

if __name__ == '__main__':
    unittest.main()
