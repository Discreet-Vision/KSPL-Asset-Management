import unittest
import os
import yaml

class TestHelmChartStructure(unittest.TestCase):

    def setUp(self):
        self.helm_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

    def test_chart_yaml_exists_and_valid(self):
        chart_path = os.path.join(self.helm_dir, "Chart.yaml")
        self.assertTrue(os.path.exists(chart_path))
        with open(chart_path, 'r') as f:
            chart = yaml.safe_load(f)
            self.assertEqual(chart["name"], "itam")
            self.assertEqual(chart["apiVersion"], "v2")

    def test_values_yaml_files_exist(self):
        for val_file in ["values.yaml", "values-dev.yaml", "values-staging.yaml", "values-production.yaml"]:
            val_path = os.path.join(self.helm_dir, val_file)
            self.assertTrue(os.path.exists(val_path), f"Missing {val_file}")
            with open(val_path, 'r') as f:
                content = yaml.safe_load(f)
                self.assertIn("global", content)

    def test_templates_exist(self):
        tmpl_dir = os.path.join(self.helm_dir, "templates")
        expected_templates = [
            "serviceaccount.yaml",
            "configmap.yaml",
            "secret.yaml",
            "deployment.yaml",
            "service.yaml",
            "ingress.yaml",
            "hpa.yaml",
            "networkpolicy.yaml",
            "cronjob.yaml"
        ]
        for tmpl in expected_templates:
            self.assertTrue(os.path.exists(os.path.join(tmpl_dir, tmpl)), f"Missing template {tmpl}")

if __name__ == "__main__":
    unittest.main()
