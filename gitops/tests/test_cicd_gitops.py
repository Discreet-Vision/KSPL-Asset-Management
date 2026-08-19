import unittest
import os
import yaml

class TestCiCdGitOpsStructure(unittest.TestCase):

    def setUp(self):
        self.root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))

    def test_github_workflows_exist(self):
        gh_dir = os.path.join(self.root_dir, ".github", "workflows")
        self.assertTrue(os.path.exists(os.path.join(gh_dir, "ci.yml")))
        self.assertTrue(os.path.exists(os.path.join(gh_dir, "argocd-sync.yml")))

    def test_gitlab_ci_exists(self):
        gitlab_file = os.path.join(self.root_dir, ".gitlab-ci.yml")
        self.assertTrue(os.path.exists(gitlab_file))

    def test_gitops_environments_exist(self):
        gitops_dir = os.path.join(self.root_dir, "gitops", "environments")
        for env in ["dev", "staging", "production"]:
            val_file = os.path.join(gitops_dir, env, "values.yaml")
            self.assertTrue(os.path.exists(val_file), f"Missing {val_file}")

    def test_argocd_applications_exist(self):
        argocd_dir = os.path.join(self.root_dir, "argocd", "applications")
        for app in ["itam-dev.yaml", "itam-staging.yaml", "itam-production.yaml"]:
            app_path = os.path.join(argocd_dir, app)
            self.assertTrue(os.path.exists(app_path), f"Missing {app_path}")
            with open(app_path, 'r') as f:
                data = yaml.safe_load(f)
                self.assertEqual(data["kind"], "Application")

    def test_canary_rollout_exists(self):
        rollout_path = os.path.join(self.root_dir, "argocd", "rollouts", "canary-rollout.yaml")
        self.assertTrue(os.path.exists(rollout_path))
        with open(rollout_path, 'r') as f:
            data = yaml.safe_load(f)
            self.assertEqual(data["kind"], "Rollout")

if __name__ == "__main__":
    unittest.main()
