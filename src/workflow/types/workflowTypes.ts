// ==================== WORKFLOW & RULES ENGINE TYPES ====================
// Standardized TypeScript types for Temporal.io / Camunda durable workflows, approval chains, SLAs, rules, and audits.

export type WorkflowStatus =
  | 'PENDING'
  | 'RUNNING'
  | 'WAITING_APPROVAL'
  | 'WAITING_TIMER'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED'
  | 'SUSPENDED';

export type ApprovalDecision = 'APPROVE' | 'REJECT' | 'REQUEST_CHANGES' | 'DELEGATE' | 'ESCALATE';

export interface WorkflowDefinition {
  id: string;
  name: string;
  version: number;
  description: string;
  status: 'DRAFT' | 'TESTING' | 'PUBLISHED' | 'RETIRED';
  triggerType: 'MANUAL' | 'SCHEDULED' | 'EVENT' | 'API' | 'ASSET_STATE' | 'CONTRACT_EXPIRY';
  tenantId: string;
  steps: WorkflowStep[];
}

export interface WorkflowStep {
  stepId: string;
  stepName: string;
  stepType: 'APPROVAL' | 'CONDITION' | 'ACTION' | 'TIMER' | 'PARALLEL' | 'NOTIFICATION';
  assigneeRole?: string;
  approverUserId?: string;
  slaHours?: number;
  conditionExpression?: string;
  actionType?: 'DATA_WIPE' | 'RETIRE_ASSET' | 'UPDATE_CMDB' | 'TRIGGER_ITSM_INCIDENT' | 'SEND_NOTIFICATION';
  nextStepOnSuccess?: string;
  nextStepOnFailure?: string;
}

export interface WorkflowExecution {
  executionId: string;
  workflowId: string;
  workflowName: string;
  version: number;
  tenantId: string;
  status: WorkflowStatus;
  currentStepId: string;
  startedAt: string;
  completedAt?: string;
  initiatedBy: string;
  targetEntityId: string; // Asset / CI ID
  targetEntityType: string;
  contextData: Record<string, any>;
  history: ExecutionHistoryRecord[];
}

export interface ExecutionHistoryRecord {
  timestamp: string;
  stepId: string;
  eventName: string;
  details: string;
  performedBy?: string;
  status: string;
}

export interface ApprovalTask {
  taskId: string;
  executionId: string;
  workflowName: string;
  targetEntityId: string;
  assignedRole: string;
  assignedUserId: string;
  delegatedToUserId?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ESCALATED';
  createdAt: string;
  slaExpiresAt: string;
  tenantId: string;
  comments?: string;
}

export interface BusinessRule {
  ruleId: string;
  ruleName: string;
  priority: number;
  tenantId: string;
  conditionField: string;
  operator: 'GREATER_THAN' | 'EQUALS' | 'CONTAINS' | 'LESS_THAN';
  value: any;
  actionRequired: 'REQUIRE_FINANCE_APPROVAL' | 'REQUIRE_SECURITY_APPROVAL' | 'AUTO_APPROVE' | 'FLAG_COMPLIANCE';
  isActive: boolean;
}

export interface WorkflowAuditRecord {
  id: string;
  timestamp: string;
  userId: string;
  tenantId: string;
  operation: string;
  details: string;
  correlationId: string;
}

export interface DryRunResult {
  workflowId: string;
  targetEntityId: string;
  tenantId: string;
  willExecute: boolean;
  requiredApprovals: string[];
  matchedRules: string[];
  estimatedDurationHours: number;
  potentialActions: string[];
}
