import unittest
from agentless_discovery.config import AgentlessConfig
from agentless_discovery.security.credentials import CredentialVault
from agentless_discovery.discovery.nmap_scanner import NmapScanner
from agentless_discovery.discovery.snmp_collector import SNMPCollector
from agentless_discovery.discovery.wmi_collector import WMICollector
from agentless_discovery.discovery.ssh_collector import SSHCollector
from agentless_discovery.jobs.job_engine import DiscoveryJobEngine
from agentless_discovery.adapters.reconciliation_adapter import AgentlessReconciliationAdapter

class TestAgentlessDiscoverySubsystem(unittest.TestCase):

    def test_credential_encryption(self):
        vault = CredentialVault("test-secret-key-32bytes-pass!!")
        res = vault.store_credential("cred-snmp-01", "snmp_v2c", "tenant-01", "public", "SecretCommunity")
        self.assertEqual(res["status"], "ACTIVE")
        decrypted = vault.get_decrypted_secret("cred-snmp-01")
        self.assertEqual(decrypted, "SecretCommunity")

    def test_target_range_validation(self):
        scanner = NmapScanner(["10.0.0.0/8", "192.168.0.0/16"])
        self.assertTrue(scanner.validate_target_range("10.10.20.0/24"))
        self.assertFalse(scanner.validate_target_range("8.8.8.8/32")) # Prevent unauthorized Internet scanning

    def test_snmp_collector(self):
        collector = SNMPCollector("public", "secret")
        res = collector.collect("10.0.0.15")
        self.assertEqual(res["protocol"], "SNMP")
        self.assertIn("Cisco", res["hardware"]["manufacturer"])

    def test_wmi_collector(self):
        collector = WMICollector("admin", "secret")
        res = collector.collect("10.0.0.42")
        self.assertEqual(res["protocol"], "WMI")
        self.assertIn("Windows", res["operating_system"]["name"])

    def test_ssh_collector(self):
        collector = SSHCollector("root", "secret")
        res = collector.collect("10.0.0.88")
        self.assertEqual(res["protocol"], "SSH")
        self.assertIn("Red Hat", res["operating_system"]["name"])

    def test_job_execution_workflow(self):
        engine = DiscoveryJobEngine()
        job = engine.create_job("tenant-01", "10.0.0.0/24", "Core Switches & Servers", ["cred-snmp-01"])
        res = engine.execute_job(job["job_id"])
        self.assertEqual(res["status"], "Completed")
        self.assertGreater(len(res["discovered_records"]), 0)

    def test_reconciliation_adapter(self):
        collector = SNMPCollector("public", "secret")
        raw = collector.collect("10.0.0.15")
        norm = AgentlessReconciliationAdapter.normalize_observation(raw, "tenant-01")
        self.assertEqual(norm["source"], "AGENTLESS_DISCOVERY")
        self.assertEqual(norm["signals"]["manufacturer"], "Cisco Systems, Inc.")

if __name__ == "__main__":
    unittest.main()
