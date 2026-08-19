import React, { useState } from 'react';
import { 
  ShieldCheck, AlertTriangle, FileText, CheckCircle2, Lock, Workflow, 
  ShoppingBag, Link2, Download, EyeOff, Bug, History, ChevronRight
} from 'lucide-react';
import { 
  WorkflowDefinition, 
  WorkflowExecution, 
  ServiceCatalogItem, 
  SelfServiceRequest, 
  ItsmRecordLink, 
  FieldRbacRule, 
  ImmutableAuditRecord, 
  PolicyRule, 
  PolicyViolationRecord, 
  CveCorrelationItem, 
  GovernanceItsmStats 
} from './types';
import { governanceItsmEngine } from './governanceItsmEngine';

export const GovernanceItsmDashboardModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'workflows' | 'itsm_integration' | 'self_service' | 'field_rbac' | 'audit_trail' | 'policy_risk' | 'cve_correlation'
  >('workflows');

  const [workflows, setWorkflows] = useState<WorkflowDefinition[]>(governanceItsmEngine.getWorkflows());
  const [executions, setExecutions] = useState<WorkflowExecution[]>(governanceItsmEngine.getExecutions());
  const [catalogItems, setCatalogItems] = useState<ServiceCatalogItem[]>(governanceItsmEngine.getCatalogItems());
  const [requests, setRequests] = useState<SelfServiceRequest[]>(governanceItsmEngine.getRequests());
  const [itsmRecords, setItsmRecords] = useState<ItsmRecordLink[]>(governanceItsmEngine.getItsmRecords());
  const [fieldRbacRules, setFieldRbacRules] = useState<FieldRbacRule[]>(governanceItsmEngine.getFieldRbacRules());
  const [auditTrail, setAuditTrail] = useState<ImmutableAuditRecord[]>(governanceItsmEngine.getAuditTrail());
  const [policies, setPolicies] = useState<PolicyRule[]>(governanceItsmEngine.getPolicies());
  const [violations, setViolations] = useState<PolicyViolationRecord[]>(governanceItsmEngine.getViolations());
  const [cveCorrelations, setCveCorrelations] = useState<CveCorrelationItem[]>(governanceItsmEngine.getCveCorrelations());
  const [stats, setStats] = useState<GovernanceItsmStats>(governanceItsmEngine.getStats());

  const [selectedCatalogItem, setSelectedCatalogItem] = useState('Developer Laptop Kit (MacBook Pro 16" M3 Max)');
  const [reqUserName, setReqUserName] = useState('Rahul Sharma');
  const [reqDept, setReqDept] = useState('Core Engineering');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleCreateRequest = () => {
    governanceItsmEngine.submitSelfServiceRequest(selectedCatalogItem, reqUserName, reqDept);
    setRequests([...governanceItsmEngine.getRequests()]);
    setAuditTrail([...governanceItsmEngine.getAuditTrail()]);
    setStats(governanceItsmEngine.getStats());
    setSuccessMsg(`Submitted request for '${selectedCatalogItem}'. Approval workflow initialized.`);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleApproveRequest = (reqId: string) => {
    governanceItsmEngine.approveRequest(reqId);
    setRequests([...governanceItsmEngine.getRequests()]);
    setAuditTrail([...governanceItsmEngine.getAuditTrail()]);
    setStats(governanceItsmEngine.getStats());
    setSuccessMsg(`Request '${reqId}' approved and recorded in immutable audit log.`);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  return (
    <div className="bg-black text-white p-6 font-sans border border-red-900 shadow-2xl space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-red-900 pb-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-red-600 animate-pulse" />
            <h1 className="text-xl font-bold uppercase tracking-wider text-white">
              Workflow, ITSM & Governance / Security Engine
            </h1>
            <span className="text-xs bg-red-950 text-red-400 px-2 py-0.5 border border-red-800 font-mono">
              Enterprise Control v2026.8
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1 font-mono">
            Low-Code Approval Workflows • Bi-Directional ITSM • Self-Service Request Catalog • Field-Level RBAC • Immutable Audit • Risk & CVE Correlation
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-1 mt-4 md:mt-0 border border-neutral-800 p-1 bg-neutral-950 font-mono text-xs">
          {(
            [
              ['workflows', `Workflows (${workflows.length})`],
              ['itsm_integration', `ITSM Link (${itsmRecords.length})`],
              ['self_service', `Request Catalog (${catalogItems.length})`],
              ['field_rbac', `Field RBAC (${fieldRbacRules.length})`],
              ['audit_trail', `Immutable Audit (${auditTrail.length})`],
              ['policy_risk', `Policy & Risk (${violations.length})`],
              ['cve_correlation', `CVE Match (${cveCorrelations.length})`]
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-3 py-1.5 uppercase tracking-wider transition-colors ${
                activeTab === key
                  ? 'bg-red-600 text-white font-bold'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {successMsg && (
        <div className="p-3 bg-red-950 border border-red-700 text-red-200 text-xs font-mono flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-red-500" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-2 md:grid-cols-7 gap-3 font-mono text-xs">
        <div className="bg-neutral-950 border border-neutral-800 p-3 text-center">
          <span className="text-[10px] text-neutral-500 uppercase">Active Workflows</span>
          <div className="text-xl font-bold text-white mt-1">{stats.activeWorkflowsCount}</div>
        </div>

        <div className="bg-neutral-950 border border-neutral-800 p-3 text-center">
          <span className="text-[10px] text-neutral-500 uppercase">Pending Requests</span>
          <div className="text-xl font-bold text-red-500 mt-1">{stats.pendingServiceRequestsCount}</div>
        </div>

        <div className="bg-neutral-950 border border-neutral-800 p-3 text-center">
          <span className="text-[10px] text-neutral-500 uppercase">Open ITSM Records</span>
          <div className="text-xl font-bold text-white mt-1">{stats.openItsmIncidentsCount}</div>
        </div>

        <div className="bg-neutral-950 border border-neutral-800 p-3 text-center">
          <span className="text-[10px] text-neutral-500 uppercase">Field RBAC Rules</span>
          <div className="text-xl font-bold text-white mt-1">{stats.restrictedFieldsConfigured}</div>
        </div>

        <div className="bg-neutral-950 border border-neutral-800 p-3 text-center">
          <span className="text-[10px] text-neutral-500 uppercase">Immutable Audits</span>
          <div className="text-xl font-bold text-white mt-1">{stats.immutableAuditCount}</div>
        </div>

        <div className="bg-neutral-950 border border-neutral-800 p-3 text-center">
          <span className="text-[10px] text-neutral-500 uppercase">Policy Violations</span>
          <div className="text-xl font-bold text-red-400 mt-1">{stats.policyViolationsCount}</div>
        </div>

        <div className="bg-neutral-950 border border-neutral-800 p-3 text-center">
          <span className="text-[10px] text-neutral-500 uppercase">Critical CVEs</span>
          <div className="text-xl font-bold text-red-500 mt-1">{stats.criticalCveCount}</div>
        </div>
      </div>

      {/* TAB 1: LOW-CODE APPROVAL WORKFLOWS */}
      {activeTab === 'workflows' && (
        <div className="space-y-6 font-mono text-xs">
          <div className="bg-neutral-950 border border-neutral-800 p-5 space-y-4">
            <div className="border-b border-neutral-900 pb-2 font-bold uppercase text-white flex justify-between items-center">
              <span>Visual Workflow Designer & Active Approval Pipelines</span>
              <span className="text-[10px] text-neutral-500 font-normal">Versioned Execution State Engine</span>
            </div>

            <div className="space-y-4">
              {workflows.map(wf => (
                <div key={wf.workflowId} className="bg-black border border-neutral-800 p-4 space-y-3">
                  <div className="flex justify-between items-center border-b border-neutral-900 pb-2">
                    <div>
                      <span className="text-sm font-bold text-white">{wf.name}</span>
                      <span className="ml-2 text-[10px] text-red-500 font-bold">[{wf.version}]</span>
                    </div>
                    <span className="px-2 py-0.5 text-[9px] bg-red-950 text-red-400 border border-red-900 font-bold uppercase">
                      Trigger: {wf.triggerEvent}
                    </span>
                  </div>

                  {/* Visual Node Graph Line */}
                  <div className="flex flex-wrap items-center gap-2 py-2 overflow-x-auto">
                    {wf.nodes.map((node, i) => (
                      <React.Fragment key={node.id}>
                        <div className="bg-neutral-950 border border-neutral-800 p-2 text-center min-w-[120px]">
                          <span className="text-[9px] text-red-500 block uppercase font-bold">{node.type}</span>
                          <span className="text-[10px] text-white font-bold block">{node.label}</span>
                          {node.assigneeRole && <span className="text-[8px] text-neutral-400 block">Assignee: {node.assigneeRole}</span>}
                        </div>
                        {i < wf.nodes.length - 1 && <ChevronRight className="w-4 h-4 text-neutral-600 shrink-0" />}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BI-DIRECTIONAL ITSM INTEGRATION */}
      {activeTab === 'itsm_integration' && (
        <div className="space-y-6 font-mono text-xs">
          <div className="bg-neutral-950 border border-neutral-800 p-5 space-y-4">
            <div className="border-b border-neutral-900 pb-2 font-bold uppercase text-white">
              Bi-Directional ITSM Record Context (Incidents, Problems, Changes)
            </div>

            <div className="space-y-3">
              {itsmRecords.map(rec => (
                <div key={rec.itsmId} className="bg-black border border-neutral-800 p-4 space-y-2">
                  <div className="flex justify-between items-center border-b border-neutral-900 pb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-white">{rec.itsmId}</span>
                      <span className="text-[10px] text-red-500 font-bold uppercase">[{rec.type}]</span>
                    </div>
                    <span className="px-2 py-0.5 text-[9px] bg-red-950 text-red-400 border border-red-900 font-bold uppercase">
                      Priority: {rec.priority}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-white">{rec.title}</p>

                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div className="bg-neutral-950 p-2 border border-neutral-900">
                      <span className="text-neutral-500 uppercase block">Impacted CI / Asset</span>
                      <span className="text-white font-bold">{rec.impactedCi}</span>
                    </div>

                    <div className="bg-neutral-950 p-2 border border-neutral-900">
                      <span className="text-neutral-500 uppercase block">ITSM Record Status</span>
                      <span className="text-white font-bold">{rec.status} (Created: {rec.createdDate})</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SELF-SERVICE REQUEST PORTAL & CATALOG */}
      {activeTab === 'self_service' && (
        <div className="space-y-6 font-mono text-xs">
          {/* Submit Request Form */}
          <div className="bg-neutral-950 border border-neutral-800 p-5 space-y-4">
            <div className="border-b border-neutral-900 pb-2 font-bold uppercase text-white">
              Submit Self-Service Catalog Request
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
              <div>
                <label className="text-[10px] text-neutral-500 uppercase block mb-1">Catalog Item</label>
                <select
                  value={selectedCatalogItem}
                  onChange={(e) => setSelectedCatalogItem(e.target.value)}
                  className="w-full bg-black border border-neutral-800 p-2 text-white font-bold"
                >
                  {catalogItems.map(item => (
                    <option key={item.itemId} value={item.name}>
                      {item.name} (${item.cost})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-neutral-500 uppercase block mb-1">Requester Name</label>
                <input
                  type="text"
                  value={reqUserName}
                  onChange={(e) => setReqUserName(e.target.value)}
                  className="w-full bg-black border border-neutral-800 p-2 text-white font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] text-neutral-500 uppercase block mb-1">Department</label>
                <input
                  type="text"
                  value={reqDept}
                  onChange={(e) => setReqDept(e.target.value)}
                  className="w-full bg-black border border-neutral-800 p-2 text-white font-bold"
                />
              </div>

              <button
                onClick={handleCreateRequest}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-wider text-[10px]"
              >
                Submit Request
              </button>
            </div>
          </div>

          {/* Request Queue */}
          <div className="bg-neutral-950 border border-neutral-800 p-5 space-y-4">
            <div className="border-b border-neutral-900 pb-2 font-bold uppercase text-white">
              Self-Service Request Lifecycle Queue
            </div>

            <div className="space-y-3">
              {requests.map(req => (
                <div key={req.requestId} className="bg-black border border-neutral-800 p-4 space-y-3">
                  <div className="flex justify-between items-start border-b border-neutral-900 pb-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-white">{req.requestId}</span>
                        <span className="text-[10px] text-neutral-400">({req.submittedDate})</span>
                      </div>
                      <h3 className="font-bold text-white text-xs">{req.catalogItemName}</h3>
                      <span className="text-[10px] text-neutral-500">Requested by: {req.requestedBy} • {req.department}</span>
                    </div>

                    <span className={`px-2 py-0.5 text-[9px] font-bold border ${
                      req.status === 'Approval Pending'
                        ? 'bg-red-950 text-red-500 border-red-900'
                        : 'bg-black text-white border-neutral-800'
                    }`}>
                      {req.status}
                    </span>
                  </div>

                  {req.status === 'Approval Pending' && (
                    <div className="flex justify-end space-x-2 pt-2 border-t border-neutral-900">
                      <button
                        onClick={() => handleApproveRequest(req.requestId)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white font-bold text-[9px] uppercase"
                      >
                        Approve & Execute Fulfillment
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: FIELD-LEVEL RBAC & DATA CLASSIFICATION */}
      {activeTab === 'field_rbac' && (
        <div className="space-y-6 font-mono text-xs">
          <div className="bg-neutral-950 border border-neutral-800 p-5 space-y-4">
            <div className="border-b border-neutral-900 pb-2 font-bold uppercase text-white">
              Field-Level Access Control & Data Classification Rules
            </div>

            <div className="space-y-3">
              {fieldRbacRules.map(rule => (
                <div key={rule.ruleId} className="bg-black border border-neutral-800 p-4 space-y-2">
                  <div className="flex justify-between items-center border-b border-neutral-900 pb-2">
                    <div>
                      <span className="text-sm font-bold text-white">Target Field: {rule.fieldName}</span>
                      <span className="ml-2 text-[10px] text-neutral-400">Role: {rule.roleName}</span>
                    </div>
                    <span className="px-2 py-0.5 text-[9px] bg-red-950 text-red-400 border border-red-900 font-bold uppercase">
                      Classification: {rule.classification}
                    </span>
                  </div>

                  <div className="text-[10px] text-neutral-300">
                    Effective Field Permission: <strong className="text-white">{rule.permission}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: IMMUTABLE AUDIT TRAIL */}
      {activeTab === 'audit_trail' && (
        <div className="space-y-6 font-mono text-xs">
          <div className="bg-neutral-950 border border-neutral-800 p-5 space-y-4">
            <div className="border-b border-neutral-900 pb-2 font-bold uppercase text-white">
              Append-Only Immutable Audit Trail Log
            </div>

            <div className="space-y-2">
              {auditTrail.map(aud => (
                <div key={aud.auditId} className="bg-black border border-neutral-800 p-3 space-y-1">
                  <div className="flex justify-between items-center text-[10px]">
                    <div className="flex items-center space-x-2">
                      <span className="text-red-500 font-bold">{aud.auditId}</span>
                      <span className="text-white font-bold">[{aud.action}]</span>
                      <span className="text-neutral-400">{aud.entity} ({aud.entityId})</span>
                    </div>
                    <span className="text-neutral-500">{aud.timestamp}</span>
                  </div>

                  <div className="text-[9px] text-neutral-400 flex justify-between">
                    <span>Performed By: {aud.user} (IP: {aud.ipAddress})</span>
                    <span>State: {aud.afterValue || 'Logged'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: POLICY & RISK ENGINE */}
      {activeTab === 'policy_risk' && (
        <div className="space-y-6 font-mono text-xs">
          <div className="bg-neutral-950 border border-neutral-800 p-5 space-y-4">
            <div className="border-b border-neutral-900 pb-2 font-bold uppercase text-white">
              Policy Violations & Risk Score Engine
            </div>

            <div className="space-y-3">
              {violations.map(viol => (
                <div key={viol.violationId} className="bg-black border border-neutral-800 p-4 space-y-2">
                  <div className="flex justify-between items-center border-b border-neutral-900 pb-2">
                    <div>
                      <span className="text-sm font-bold text-white">{viol.policyName}</span>
                      <span className="text-[10px] text-neutral-400 block">Asset / CI: {viol.assetOrCiName}</span>
                    </div>
                    <span className="px-2 py-0.5 text-[9px] bg-red-950 text-red-500 border border-red-900 font-bold uppercase">
                      Risk: {viol.severity}
                    </span>
                  </div>

                  <p className="text-[10px] text-neutral-300 bg-neutral-950 p-2 border border-neutral-900">
                    Evidence: {viol.evidence}
                  </p>

                  <div className="flex justify-between items-center text-[9px] text-neutral-500 pt-1">
                    <span>Detected At: {viol.detectedAt} • Owner: {viol.owner}</span>
                    <span>Lifecycle: {viol.state}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: VULNERABILITY / CVE CORRELATION */}
      {activeTab === 'cve_correlation' && (
        <div className="space-y-6 font-mono text-xs">
          <div className="bg-neutral-950 border border-neutral-800 p-5 space-y-4">
            <div className="border-b border-neutral-900 pb-2 font-bold uppercase text-white">
              CVE Vulnerability Correlation & Software Matches
            </div>

            <div className="space-y-3">
              {cveCorrelations.map(cve => (
                <div key={cve.cveId} className="bg-black border border-neutral-800 p-4 space-y-3">
                  <div className="flex justify-between items-center border-b border-neutral-900 pb-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-white">{cve.cveId}</span>
                        <span className="text-[10px] text-red-500 font-bold">CVSS: {cve.cvssScore}</span>
                      </div>
                      <span className="text-[10px] text-neutral-400">Software Product: {cve.publisherProduct} (Installed: {cve.installedVersion})</span>
                    </div>

                    <span className="px-2 py-0.5 text-[9px] bg-red-950 text-red-500 border border-red-900 font-bold uppercase">
                      Severity: {cve.severity}
                    </span>
                  </div>

                  <div className="bg-neutral-950 p-2 border border-neutral-900 text-[10px] text-neutral-300">
                    <p className="font-bold text-white mb-1">Remediation Guidance:</p>
                    <p>{cve.remediationGuidance}</p>
                  </div>

                  <div className="flex justify-between items-center text-[9px] text-neutral-500 pt-2 border-t border-neutral-900">
                    <span>Affected Asset Count: {cve.affectedAssetCount}</span>
                    <button className="px-3 py-1 bg-black border border-neutral-800 hover:border-white text-white font-bold text-[9px] uppercase flex items-center space-x-1">
                      <Download className="w-3 h-3 text-red-500" />
                      <span>Export CVE Vulnerability Report</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
