import unittest
import os

class TestMultiMethodDiscoveryEngine(unittest.TestCase):

    def setUp(self):
        self.root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))

    def test_discovery_files_exist(self):
        ts_types = os.path.join(self.root_dir, "src", "discovery_engine", "types.ts")
        ts_engine = os.path.join(self.root_dir, "src", "discovery_engine", "discoveryEngine.ts")
        ts_ui = os.path.join(self.root_dir, "src", "discovery_engine", "DiscoveryEngineDashboardModule.tsx")
        readme = os.path.join(self.root_dir, "discovery_engine", "README.md")

        self.assertTrue(os.path.exists(ts_types), "types.ts should exist")
        self.assertTrue(os.path.exists(ts_engine), "discoveryEngine.ts should exist")
        self.assertTrue(os.path.exists(ts_ui), "DiscoveryEngineDashboardModule.tsx should exist")
        self.assertTrue(os.path.exists(readme), "README.md should exist")

    def test_engine_contains_five_methods(self):
        engine_path = os.path.join(self.root_dir, "src", "discovery_engine", "types.ts")
        with open(engine_path, 'r') as f:
            content = f.read()
            self.assertIn("Agentless Network", content)
            self.assertIn("Endpoint Agent", content)
            self.assertIn("Cloud API", content)
            self.assertIn("SaaS OAuth", content)
            self.assertIn("CSV Import", content)

if __name__ == "__main__":
    unittest.main()
