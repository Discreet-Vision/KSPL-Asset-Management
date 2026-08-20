import datetime
import uuid
from typing import Dict, List, Any
from agentless_discovery.discovery.nmap_scanner import NmapScanner
from agentless_discovery.discovery.snmp_collector import SNMPCollector
from agentless_discovery.discovery.wmi_collector import WMICollector
from agentless_discovery.discovery.ssh_collector import SSHCollector
from agentless_discovery.config import AgentlessConfig

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

        scanner = NmapScanner(AgentlessConfig.APPROVED_CIDRS)
        scan_res = scanner.scan_network_range(job["target_range"])

        if scan_res.get("status") == "REJECTED":
            job["status"] = "Failed"
            job["end_time"] = datetime.datetime.utcnow().isoformat() + "Z"
            job["error"] = scan_res.get("error")
            return job

        hosts = scan_res.get("hosts", [])
        job["hosts_scanned"] = scan_res.get("hosts_scanned", len(hosts))
        job["hosts_found"] = len(hosts)

        discovered = []
        for host in hosts:
            protocols = host.get("suggested_protocols", [])
            ip = host.get("ip")
            
            if "SNMP" in protocols:
                job["failed_creds"] += 1
                continue  # Credentials are selected from the encrypted vault by the worker; never use defaults.
                data = snmp.collect(ip)
                data["discovery_id"] = f"DISC-SNMP-{uuid.uuid4().hex[:6]}"
                discovered.append(data)
                job["successful_creds"] += 1
            elif "WMI" in protocols:
                job["failed_creds"] += 1
                continue
                data = wmi.collect(ip)
                data["discovery_id"] = f"DISC-WMI-{uuid.uuid4().hex[:6]}"
                discovered.append(data)
                job["successful_creds"] += 1
            elif "SSH" in protocols:
                job["failed_creds"] += 1
                continue
                data = ssh.collect(ip)
                data["discovery_id"] = f"DISC-SSH-{uuid.uuid4().hex[:6]}"
                discovered.append(data)
                job["successful_creds"] += 1

        job["discovered_records"] = discovered
        job["status"] = "COMPLETED_WITH_ERRORS" if job["failed_creds"] else "COMPLETED"
        job["end_time"] = datetime.datetime.utcnow().isoformat() + "Z"
        self._results.extend(discovered)
        return job

    def get_job_status(self, job_id: str) -> Dict[str, Any]:
        return self._jobs.get(job_id, {"error": "Job not found"})

    def list_jobs(self, tenant_id: str) -> List[Dict[str, Any]]:
        return [j for j in self._jobs.values() if j.get("tenant_id") == tenant_id]
