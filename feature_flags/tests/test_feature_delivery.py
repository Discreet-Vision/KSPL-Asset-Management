import unittest
import os
import json
import yaml

class TestFeatureDeliveryStructure(unittest.TestCase):

    def setUp(self):
        self.root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))

    def test_feature_flags_config_json(self):
        config_path = os.path.join(self.root_dir, "feature_flags", "flags.config.json")
        self.assertTrue(os.path.exists(config_path))
        with open(config_path, 'r') as f:
            data = json.load(f)
            self.assertIn("provider", data)
            self.assertIn("flags", data)
            self.assertTrue(len(data["flags"]) > 0)

    def test_blue_green_manifests_exist(self):
        service_path = os.path.join(self.root_dir, "blue_green", "service-bluegreen.yaml")
        ingress_path = os.path.join(self.root_dir, "blue_green", "ingress-bluegreen.yaml")
        self.assertTrue(os.path.exists(service_path))
        self.assertTrue(os.path.exists(ingress_path))

        with open(ingress_path, 'r') as f:
            data = yaml.safe_load(f)
            self.assertEqual(data["kind"], "Ingress")

    def test_feature_delivery_ts_files_exist(self):
        ts_types = os.path.join(self.root_dir, "src", "feature_delivery", "types.ts")
        ts_client = os.path.join(self.root_dir, "src", "feature_delivery", "FeatureFlagClient.ts")
        ts_dashboard = os.path.join(self.root_dir, "src", "feature_delivery", "FeatureDeliveryDashboardModule.tsx")

        self.assertTrue(os.path.exists(ts_types))
        self.assertTrue(os.path.exists(ts_client))
        self.assertTrue(os.path.exists(ts_dashboard))

if __name__ == "__main__":
    unittest.main()
