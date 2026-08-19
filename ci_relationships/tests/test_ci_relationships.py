import unittest
import os

class TestCiRelationshipEngine(unittest.TestCase):

    def setUp(self):
        self.root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))

    def test_relationship_files_exist(self):
        ts_types = os.path.join(self.root_dir, "src", "ci_relationships", "types.ts")
        ts_engine = os.path.join(self.root_dir, "src", "ci_relationships", "relationshipEngine.ts")
        ts_ui = os.path.join(self.root_dir, "src", "ci_relationships", "CiRelationshipDashboardModule.tsx")
        readme = os.path.join(self.root_dir, "ci_relationships", "README.md")

        self.assertTrue(os.path.exists(ts_types), "types.ts should exist")
        self.assertTrue(os.path.exists(ts_engine), "relationshipEngine.ts should exist")
        self.assertTrue(os.path.exists(ts_ui), "CiRelationshipDashboardModule.tsx should exist")
        self.assertTrue(os.path.exists(readme), "README.md should exist")

    def test_engine_contains_required_relationship_types(self):
        engine_path = os.path.join(self.root_dir, "src", "ci_relationships", "relationshipEngine.ts")
        with open(engine_path, 'r') as f:
            content = f.read()
            self.assertIn("runs_on", content)
            self.assertIn("depends_on", content)
            self.assertIn("hosted_by", content)
            self.assertIn("connects_to", content)
            self.assertIn("used_by", content)
            self.assertIn("calculateBlastRadius", content)

if __name__ == "__main__":
    unittest.main()
