from fastapi import FastAPI, HTTPException, Header
from pydantic import BaseModel
from typing import List, Optional
from agentless_discovery.config import AgentlessConfig
from agentless_discovery.security.credentials import CredentialVault
from agentless_discovery.jobs.job_engine import DiscoveryJobEngine
from agentless_discovery.adapters.reconciliation_adapter import AgentlessReconciliationAdapter

app = FastAPI(
    title=AgentlessConfig.SERVICE_NAME,
    version=AgentlessConfig.VERSION,
    description="Enterprise Agentless Network, SNMP, WMI, and SSH Discovery Subsystem"
)

vault = CredentialVault()
job_engine = DiscoveryJobEngine()

class CreateCredentialRequest(BaseModel):
    cred_id: str
    type: str # snmp_v2c, snmp_v3, wmi, ssh
    username: str
    secret: str

class CreateJobRequest(BaseModel):
    target_range: str
    profile_name: str
    credential_ids: List[str]

@app.get("/health")
def health_check():
    return {"status": "HEALTHY", "service": AgentlessConfig.SERVICE_NAME, "version": AgentlessConfig.VERSION}

@app.post("/api/v1/agentless/credentials")
def store_credential(req: CreateCredentialRequest, x_tenant_id: str = Header("tenant-kspl-global")):
    res = vault.store_credential(req.cred_id, req.type, x_tenant_id, req.username, req.secret)
    return {"status": "SUCCESS", "credential": res}

@app.post("/api/v1/agentless/jobs")
def create_discovery_job(req: CreateJobRequest, x_tenant_id: str = Header("tenant-kspl-global")):
    job = job_engine.create_job(x_tenant_id, req.target_range, req.profile_name, req.credential_ids)
    # Execute asynchronously in worker thread
    job_engine.execute_job(job["job_id"])
    return {"status": "SUCCESS", "job": job}

@app.get("/api/v1/agentless/jobs")
def list_discovery_jobs(x_tenant_id: str = Header("tenant-kspl-global")):
    jobs = job_engine.list_jobs(x_tenant_id)
    return {"status": "SUCCESS", "jobs": jobs}

@app.get("/api/v1/agentless/jobs/{job_id}")
def get_job_details(job_id: str):
    job = job_engine.get_job_status(job_id)
    if "error" in job:
        raise HTTPException(status_code=404, detail=job["error"])
    return {"status": "SUCCESS", "job": job}

@app.post("/api/v1/agentless/jobs/{job_id}/reconcile")
def submit_job_to_reconciliation(job_id: str, x_tenant_id: str = Header("tenant-kspl-global")):
    job = job_engine.get_job_status(job_id)
    if "error" in job:
        raise HTTPException(status_code=404, detail=job["error"])

    normalized = []
    for rec in job.get("discovered_records", []):
        norm = AgentlessReconciliationAdapter.normalize_observation(rec, x_tenant_id)
        normalized.append(norm)

    return {
        "status": "SUCCESS",
        "job_id": job_id,
        "records_reconciled": len(normalized),
        "normalized_samples": normalized
    }
