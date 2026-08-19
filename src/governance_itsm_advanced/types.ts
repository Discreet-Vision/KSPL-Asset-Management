export type WorkflowNodeType = 
  | 'START' 
  | 'APPROVAL' 
  | 'CONDITION' 
  | 'ACTION' 
  | 'NOTIFICATION' 
  | 'ASSIGN' 
  | 'WAIT' 
  | 'WEBHOOK' 
  | 'CREATE_REQUEST' 
  | 'END';

export type WorkflowExecutionStatus = 'Active' | 'Completed' | 'Pending Approval' | 'Failed' | 'Terminated';

export type DataClassificationLevel = 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED';

export type RiskSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type PolicyLifecycleState = 'Detected' | 'Acknowledged' | 'In Remediation' | 'Exception Approved' | 'Resolved';

export interface WorkflowNode {
  id: string;
  type: WorkflowNodeType;
  label: string;
  assigneeRole?: string;
  conditionExpr?: string;
  actionDetails?: string;
}

export interface WorkflowDefinition {
  workflowId: string;
  name: string;
  version: string;
  triggerEvent: string;
  status: 'Active' | 'Draft' | 'Deprecated';
  nodes: WorkflowNode[];
  createdDate: string;
}

export interface WorkflowExecution {
  executionId: string;
  workflowName: string;
  version: string;
  triggerSource: string;
  currentStep: string;
  status: WorkflowExecutionStatus;
  startedAt: string;
  approverRole: string;
}

export interface ServiceCatalogItem {
  itemId: string;
  name: string;
  category: 'Hardware' | 'Software' | 'Cloud Access' | 'Repair';
  description: string;
  slaDays: number;
  cost: number;
  approvalRequired: boolean;
  status: 'Available' | 'Restricted';
}

export interface SelfServiceRequest {
  requestId: string;
  catalogItemName: string;
  requestedBy: string;
  department: string;
  status: 'Submitted' | 'Approval Pending' | 'Fulfillment In Progress' | 'Completed' | 'Rejected';
  submittedDate: string;
  expectedSla: string;
}

export interface ItsmRecordLink {
  itsmId: string;
  type: 'Incident' | 'Problem' | 'Change' | 'Request';
  title: string;
  impactedCi: string;
  priority: 'P1 - Critical' | 'P2 - High' | 'P3 - Medium' | 'P4 - Low';
  status: 'Open' | 'In Progress' | 'Pending Review' | 'Closed';
  createdDate: string;
}

export interface FieldRbacRule {
  ruleId: string;
  roleName: string;
  fieldName: string;
  classification: DataClassificationLevel;
  permission: 'VIEW' | 'EDIT' | 'DENY';
}

export interface ImmutableAuditRecord {
  auditId: string;
  timestamp: string;
  tenantId: string;
  user: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'EXPORT' | 'WORKFLOW_CHANGE' | 'POLICY_VIOLATION';
  entity: string;
  entityId: string;
  fieldChanged?: string;
  beforeValue?: string;
  afterValue?: string;
  ipAddress: string;
}

export interface PolicyRule {
  policyId: string;
  policyName: string;
  type: 'Security' | 'Compliance' | 'EOL' | 'Encryption' | 'Patch';
  conditionSummary: string;
  riskSeverity: RiskSeverity;
  activeViolationsCount: number;
}

export interface PolicyViolationRecord {
  violationId: string;
  policyName: string;
  assetOrCiName: string;
  severity: RiskSeverity;
  detectedAt: string;
  evidence: string;
  state: PolicyLifecycleState;
  owner: string;
}

export interface CveCorrelationItem {
  cveId: string;
  publisherProduct: string;
  installedVersion: string;
  affectedVersionRange: string;
  cvssScore: number;
  severity: RiskSeverity;
  affectedAssetCount: number;
  remediationGuidance: string;
  remediationStatus: 'Open' | 'In Progress' | 'Resolved';
}

export interface GovernanceItsmStats {
  activeWorkflowsCount: number;
  pendingServiceRequestsCount: number;
  openItsmIncidentsCount: number;
  policyViolationsCount: number;
  criticalCveCount: number;
  immutableAuditCount: number;
  restrictedFieldsConfigured: number;
}
