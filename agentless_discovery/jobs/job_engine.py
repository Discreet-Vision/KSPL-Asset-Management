import datetime
import uuid
from typing import Dict, List, Any
from agentless_discovery.discovery.nmap_scanner import NmapScanner
from agentless_discovery.discovery.snmp_collector import SNMPCollector
from agentless_discovery.discovery.wmi_collector import WMICollector
from agentless_discovery.discovery.ssh_collector import SSHCollector

class DiscoveryJobEngine:
    def __init__(self):
        self._jobs: Dict[str, Dict[str, Any]] = {}
        self._results: List[Dict[str, Any]] = []

    def create_job(self, tenant_id: str, target_range: str, profile_name: str, cred_ids: List[str]) -> Dict[str, Any]:
        job_id = f"JOB-AGL-{uuid.uuid4().hex[:8].upper()}"
        job_record = {
            "job_id": job_id,
            "tenant_id": tenant_id,
            "target_range": target_range,
            "profile": profile_name,
            "credential_ids": cred_ids,
            "status": "Pending", # Pending, Running, Completed, Partially Completed, Failed, Cancelled
            "created_at": datetime.datetime.utcnow().isoformat() + "Z",
            "start_time": None,
            "end_time": None,
            "hosts_scanned": 0,
            "hosts_found": 0,
            "successful_creds": 0,
            "failed_creds": 0,
            "discovered_records": []
        }
        self._jobs[job_id] = job_record
        return job_record

    def execute_job(self, job_id: str) -> Dict[str, Any]:
        job = self._jobs.get(job_id)
        if not job:
            return {"error": "Job not found"}

        job["status"] = "Running"
        job["start_time"] = datetime.datetime.utcnow().isoformat() + "Z"

        scanner = NmapScanner()
        scan_res = scanner.scan_network_range(job["target_range"])

        if scan_res.get("status") == "REJECTED":
            job["status"] = "Failed"
            job["end_time"] = datetime.datetime.utcnow().isoformat() + "Z"
            job["error"] = scan_res.get("error")
            return job

        hosts = scan_res.get("hosts", [])
        job["hosts_scanned"] = len(hosts) * 4 # simulated IP scan breadth
        job["hosts_found"] = len(hosts)

        discovered = []
        for host in hosts:
            protocols = host.get("suggested_protocols", [])
            ip = host.get("ip")
            
            if "SNMP" in protocols:
                snmp = SNMPCollector(community_or_v3_user="public", secret="public_sec")
                data = snmp.collect(ip)
                data["discovery_id"] = f"DISC-SNMP-{uuid.uuid4().hex[:6]}"
                discovered.append(data)
                job["successful_creds"] += 1
            elif "WMI" in protocols:
                wmi = WMICollector(username="DomainAdmin", secret="EncryptedSecretPass")
                data = wmi.collect(ip)
                data["discovery_id"] = f"DISC-WMI-{uuid.uuid4().hex[:6]}"
                discovered.append(data)
                job["successful_creds"] += 1
            elif "SSH" in protocols:
                ssh = SSHCollector(username="root", key_or_password="EncryptedSSHKey")
                data = ssh.collect(ip)
                data["discovery_id"] = f"DISC-SSH-{uuid.uuid4().hex[:6]}"
                discovered.append(data)
                job["successful_creds"] += 1

        job["discovered_records"] = discovered
        job["status"] = "Completed"
        job["end_time"] = datetime.datetime.utcnow().isoformat() + "Z"
        self._results.extend(discovered)
        return job

    def get_job_status(self, job_id: str) -> Dict[str, Any]:
        return self._jobs.get(job_id, {"error": "Job not found"})

    def list_jobs(self, tenant_id: str) -> List[Dict[str, Any]]:
        return [j for j in self._jobs.values() if j.get("tenant_id") == tenant_id]
