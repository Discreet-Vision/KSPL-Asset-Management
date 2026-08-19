import unittest
import os

class TestCiClassHierarchy(unittest.TestCase):

    def setUp(self):
        self.root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))

    def test_ci_hierarchy_files_exist(self):
        ts_types = os.path.join(self.root_dir, "src", "ci_hierarchy", "types.ts")
        ts_registry = os.path.join(self.root_dir, "src", "ci_hierarchy", "ciClassRegistry.ts")
        ts_ui = os.path.join(self.root_dir, "src", "ci_hierarchy", "CiHierarchyModule.tsx")
        readme = os.path.join(self.root_dir, "ci_hierarchy", "README.md")

        self.assertTrue(os.path.exists(ts_types), "types.ts should exist")
        self.assertTrue(os.path.exists(ts_registry), "ciClassRegistry.ts should exist")
        self.assertTrue(os.path.exists(ts_ui), "CiHierarchyModule.tsx should exist")
        self.assertTrue(os.path.exists(readme), "README.md should exist")

    def test_registry_contains_all_four_classes(self):
        registry_path = os.path.join(self.root_dir, "src", "ci_hierarchy", "ciClassRegistry.ts")
        with open(registry_path, 'r') as f:
            content = f.read()
            self.assertIn("'Hardware'", content)
            self.assertIn("'Software'", content)
            self.assertIn("'Cloud'", content)
            self.assertIn("'Service'", content)
            self.assertIn("'Server'", content)
            self.assertIn("'Laptop'", content)
            self.assertIn("'Network Device'", content)
            self.assertIn("'SaaS'", content)
            self.assertIn("'Virtual Machine'", content)

if __name__ == "__main__":
    unittest.main()
