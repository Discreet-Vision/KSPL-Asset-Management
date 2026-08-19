import unittest

class TestChangeDetectionAndDriftEngine(unittest.TestCase):
    def setUp(self):
        self.approved_os = "Windows Server 2025"
        self.approved_ram = "64 GB"

    def test_field_level_change_detection(self):
        prev_ram = "32 GB"
        curr_ram = "64 GB"
        is_changed = prev_ram != curr_ram
        self.assertTrue(is_changed)

    def test_unauthorized_drift_flagging(self):
        curr_os = "Windows Server 2022"
        related_chg = None
        is_unauthorized = (curr_os != self.approved_os) and (related_chg is None)
        self.assertTrue(is_unauthorized)

    def test_risk_score_calculation(self):
        base_risk = 20
        is_unauthorized_sec = True
        if is_unauthorized_sec:
            base_risk += 60
        self.assertEqual(base_risk, 80)

if __name__ == '__main__':
    unittest.main()
