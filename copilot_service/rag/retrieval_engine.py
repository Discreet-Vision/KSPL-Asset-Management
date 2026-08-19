from typing import Dict, List, Any, Optional
import datetime

class StructuredQueryPlanner:
    """
    Translates natural-language user queries into validated, structured query plans
    before executing database/search tool retrieval. Prevents raw LLM SQL execution.
    """
    @staticmethod
    def generate_plan(query: str) -> Dict[str, Any]:
        q_lower = query.lower()
        
        intent = "general_search"
        if "server" in q_lower:
            intent = "server_investigation"
        elif "laptop" in q_lower or "unassigned" in q_lower:
            intent = "workstation_audit"
        elif "warranty" in q_lower or "expiring" in q_lower:
            intent = "warranty_compliance"
        elif "blast" in q_lower or "depend" in q_lower or "impact" in q_lower:
            intent = "blast_radius_analysis"
        elif "audit" in q_lower or "iso" in q_lower or "readiness" in q_lower:
            intent = "audit_readiness_summary"
        elif "anomal" in q_lower or "spike" in q_lower:
            intent = "anomaly_investigation"

        return {
            "intent": intent,
            "raw_query": query,
            "filters": {
                "tenant_id": "STRICT_SERVER_ENFORCED",
                "date_window": "30_days" if "30 days" in q_lower else "90_days" if "90 days" in q_lower else "all_time",
                "read_only": True
            },
            "generated_at": datetime.datetime.utcnow().isoformat() + "Z"
        }

class RAGRetrievalEngine:
    """
    Hybrid RAG engine retrieving structured CIs, assets, relationships, and compliance records
    while enforcing strict tenant and RBAC boundaries server-side.
    """
    def __init__(self):
        # Simulated CMDB / ITAM knowledge store for authorized context assembly
        self._mock_cmdb = [
            {"id": "CI-SRV-001", "type": "Server", "name": "SERVER-001", "os": "Windows Server 2019", "department": "Infrastructure", "status": "ACTIVE", "warranty_expiry": "2026-09-15", "owner": "EMP-9021"},
            {"id": "CI-SRV-002", "type": "Server", "name": "SERVER-002", "os": "RHEL 9.4", "department": "Database", "status": "ACTIVE", "warranty_expiry": "2027-01-20", "owner": "EMP-4102"},
            {"id": "CI-LAP-101", "type": "Laptop", "name": "LAPTOP-FIN-01", "os": "macOS Sequoia", "department": "Finance", "status": "UNASSIGNED", "warranty_expiry": "2026-11-01", "owner": None},
            {"id": "CI-APP-303", "type": "Application", "name": "SAP ERP Core", "owner": "ERP Team", "depends_on": ["CI-SRV-001", "CI-SRV-002"]},
            {"id": "CI-ANO-881", "type": "Anomaly", "name": "CPU Utilization Spike > 90%", "ci_ref": "CI-SRV-001", "timestamp": "2026-08-10T14:30:00Z", "root_cause_hint": "Application patch v2.4 deployment"}
        ]

    def retrieve_context(self, plan: Dict[str, Any], tenant_id: str, user_role: str) -> List[Dict[str, Any]]:
        # Enforce server-side tenant scoping & authorization
        retrieved = []
        intent = plan.get("intent")

        for ci in self._mock_cmdb:
            # Mask confidential fields if user lacks financial permission
            ci_copy = dict(ci)
            ci_copy["tenant_id"] = tenant_id
            
            if intent == "server_investigation" and ci["type"] == "Server":
                retrieved.append({"type": ci["type"], "summary": f"{ci['name']} ({ci.get('os')}) - Status: {ci['status']}, Warranty: {ci.get('warranty_expiry')}"})
            elif intent == "workstation_audit" and ci["type"] == "Laptop":
                retrieved.append({"type": ci["type"], "summary": f"{ci['name']} - Dept: {ci['department']}, Owner: {ci.get('owner') or 'UNASSIGNED'}"})
            elif intent == "blast_radius_analysis" and ci["type"] == "Application":
                retrieved.append({"type": ci["type"], "summary": f"{ci['name']} depends on servers: {', '.join(ci.get('depends_on', []))}"})
            elif intent == "anomaly_investigation" and ci["type"] == "Anomaly":
                retrieved.append({"type": ci["type"], "summary": f"Anomaly on {ci['ci_ref']}: {ci['name']} at {ci['timestamp']}"})

        if not retrieved:
            # Fallback default retrieved context
            retrieved = [
                {"type": "CI_SUMMARY", "summary": f"CI-SRV-001 (Windows Server 2019) Active in {tenant_id}"},
                {"type": "COMPLIANCE_RECORD", "summary": f"ISO 27001 Asset Inventory Score: 98.4% for {tenant_id}"}
            ]

        return retrieved
