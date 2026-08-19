// ==================== GOVERNANCE & AUDIT TYPES ====================

export type GovernanceClassificationLevel =
  | 'Public'
  | 'Internal'
  | 'Confidential'
  | 'Restricted'
  | 'Highly Restricted';

export type GovernancePermissionAction = 'View' | 'Edit' | 'Export' | 'AiQuery' | 'Integrate' | 'Audit';

export interface FieldPermissionRule {
  id: string;
  moduleName: string;
  fieldName: string;
  classification: GovernanceClassificationLevel;
  allowedRoles: string[];
  maskingPattern?: 'Full Mask' | 'Partial Mask (e.g. e***@domain)' | 'Financial Mask' | 'Unmasked';
}

export interface ImmutableAuditRecord {
  id: string;
  sequenceNumber: number;
  previousHash: string;
  currentHash: string; // Cryptographic Hash Chaining Integrity
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  tenantId: string;
  actionType:
    | 'CREATE'
    | 'READ'
    | 'UPDATE'
    | 'DELETE'
    | 'EXPORT'
    | 'LOGIN'
    | 'PERMISSION_CHANGE'
    | 'ROLE_CHANGE'
    | 'CLASSIFICATION_CHANGE'
    | 'INTEGRATION_ACCESS'
    | 'AI_QUERY'
    | 'FINANCIAL_UPDATE';
  module: string;
  recordId: string;
  field?: string;
  oldValue?: string;
  newValue?: string;
  ipAddress: string;
  userAgent: string;
  correlationId: string;
  sourceSystem: string;
  reason?: string;
  dataClassification: GovernanceClassificationLevel;
}

export interface GovernancePolicyRule {
  id: string;
  policyName: string;
  triggerCondition: string; // e.g. "Financial Data Exported > 1000 Records"
  requiredPermission: string;
  actionIfViolated: 'Log Warning' | 'Require Step-Up Auth' | 'Block Request' | 'Alert Security Admin';
  isEnabled: boolean;
  tenantId: string;
}

export interface DataExportGovernanceLog {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  exportFormat: 'CSV' | 'Excel' | 'PDF' | 'JSON' | 'API Export';
  moduleName: string;
  recordCount: number;
  exportedFields: string[];
  highestClassification: GovernanceClassificationLevel;
  timestamp: string;
  ipAddress: string;
  status: 'Approved & Logged' | 'Blocked (Policy Violation)';
  tenantId: string;
}

export interface SecurityAccessMonitoringEvent {
  id: string;
  eventType: 'Repeated Failed Auth' | 'Unauthorized Field Access' | 'Unusual Data Export' | 'Large API Batch Request';
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  userId?: string;
  ipAddress: string;
  detectedAt: string;
  details: string;
  tenantId: string;
}
