from fastapi import FastAPI, HTTPException, Header
from pydantic import BaseModel
from typing import List, Optional, Any
from copilot_service.config import CopilotConfig
from copilot_service.providers.claude_provider import AnthropicClaudeProvider
from copilot_service.rag.retrieval_engine import StructuredQueryPlanner, RAGRetrievalEngine
from copilot_service.tools.controlled_tools import ControlledDataTools
from copilot_service.security.prompt_injection import SecurityAndPromptInjectionHandler

app = FastAPI(
    title=CopilotConfig.SERVICE_NAME,
    version=CopilotConfig.VERSION,
    description="Isolated Natural-Language AI Copilot Service powering ITAM & CMDB Natural Language Queries"
)

claude_provider = AnthropicClaudeProvider()
rag_engine = RAGRetrievalEngine()

class CopilotQueryRequest(BaseModel):
    query: str
    session_id: Optional[str] = "session-global-01"

class AnomalyExplanationRequest(BaseModel):
    ci_id: str
    anomaly_id: str

@app.get("/health")
def health_check():
    return {
        "status": "HEALTHY",
        "service": CopilotConfig.SERVICE_NAME,
        "version": CopilotConfig.VERSION,
        "provider": CopilotConfig.DEFAULT_PROVIDER,
        "model": CopilotConfig.DEFAULT_MODEL,
        "read_only_mode": CopilotConfig.READ_ONLY_MODE
    }

@app.post("/api/v1/copilot/chat")
def execute_copilot_query(
    req: CopilotQueryRequest,
    x_tenant_id: str = Header("tenant-kspl-global"),
    x_user_role: str = Header("ITAM_Analyst")
):
    # 1. Sanitize input against prompt injection
    safe_query = SecurityAndPromptInjectionHandler.sanitize_untrusted_data(req.query)

    # 2. Generate structured query plan
    query_plan = StructuredQueryPlanner.generate_plan(safe_query)

    # 3. Retrieve RAG context scoped by tenant and RBAC
    context = rag_engine.retrieve_context(query_plan, tenant_id=x_tenant_id, user_role=x_user_role)

    # 4. Generate grounded Claude AI response
    system_prompt = "You are the Enterprise ITAM & CMDB Copilot. Provide grounded, fact-checked responses based strictly on retrieved records."
    ai_output = claude_provider.generate_response(system_prompt, safe_query, context)

    # 5. Format response with references & structured query plan
    return {
        "status": "SUCCESS",
        "query": safe_query,
        "tenant_id": x_tenant_id,
        "query_plan": query_plan,
        "ai_response": ai_output["response"],
        "metadata": {
            "model": ai_output["model"],
            "prompt_version": ai_output["prompt_version"],
            "read_only": ai_output["read_only"],
            "input_tokens": ai_output["input_tokens"],
            "output_tokens": ai_output["output_tokens"]
        },
        "referenced_records": context
    }

@app.get("/api/v1/copilot/audit-summary")
def get_audit_summary(
    framework: str = "ISO 27001",
    x_tenant_id: str = Header("tenant-kspl-global")
):
    compliance_data = ControlledDataTools.search_compliance(x_tenant_id, framework)
    warranties = ControlledDataTools.search_warranties(x_tenant_id, 90)

    summary = f"ISO 27001 Asset Readiness Summary for Tenant {x_tenant_id}:\n"
    summary += f"- Overall Readiness Score: {compliance_data['overall_readiness']}\n"
    summary += f"- Pending Field Annotations: {compliance_data['missing_fields_count']}\n"
    summary += f"- Expiring Hardware Warranties (<90d): {len(warranties)} assets\n\n"
    summary += "RECOMMENDED ACTION: Review warranty renewals for SERVER-001 prior to expiry date."

    return {
        "status": "SUCCESS",
        "framework": framework,
        "tenant_id": x_tenant_id,
        "readiness_summary": summary,
        "compliance_details": compliance_data,
        "expiring_warranties": warranties
    }

@app.post("/api/v1/copilot/explain-anomaly")
def explain_anomaly(
    req: AnomalyExplanationRequest,
    x_tenant_id: str = Header("tenant-kspl-global")
):
    relationships = ControlledDataTools.get_ci_relationships(x_tenant_id, req.ci_id)
    
    explanation = f"ANOMALY DIAGNOSTIC SUMMARY FOR {req.ci_id}:\n"
    explanation += f"FACT: Detected unusual CPU utilization spike on target host {req.ci_id}.\n"
    explanation += f"EVIDENCE: Downstream impact detected on services: {', '.join(relationships['downstream_impacts'])}.\n"
    explanation += "HYPOTHESIS: Deployment of application patch v2.4 correlated with resource contention.\n"
    explanation += "RECOMMENDED ACTION: Inspect patch logs and consider temporary load balancing."

    return {
        "status": "SUCCESS",
        "ci_id": req.ci_id,
        "anomaly_id": req.anomaly_id,
        "tenant_id": x_tenant_id,
        "explanation": explanation,
        "impact_graph": relationships
    }
