// ==================== POSTGRESQL ISOLATED DATA LAYER TYPES ====================
// Purely additive types for new ITAM System-of-Record capabilities.

export type RelationshipType =
  | 'runs-on'
  | 'depends-on'
  | 'hosted-by'
  | 'connects-to'
  | 'contains'
  | 'member-of';

export interface NewConfigurationItem {
  id: string; // UUID
  ciTag: string;
  ciType: string;
  name: string;
  status: 'Active' | 'Maintenance' | 'Decommissioned' | 'Provisioning';
  owner: string;
  location: string;
  environment: 'Production' | 'Staging' | 'Development' | 'Disaster Recovery';
  criticality: 'Tier 1 Critical' | 'Tier 2 Major' | 'Tier 3 Minor';
  attributes: Record<string, any>; // JSONB
  tenantId: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface NewCiRelationship {
  id: string; // UUID
  sourceCiId: string;
  targetCiId: string;
  relationshipType: RelationshipType;
  tenantId: string;
  createdAt: string;
}

export interface NewContract {
  id: string; // UUID
  contractNumber: string;
  vendorName: string;
  contractValue: number; // Numeric (15, 2)
  currency: string;
  startDate: string;
  endDate: string;
  renewalDate: string;
  status: 'Active' | 'Under Review' | 'Expired' | 'Terminated';
  costCenterCode: string;
  externalReference?: string;
  tenantId: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface NewContractItem {
  id: string; // UUID
  contractId: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  tenantId: string;
}

export interface NewFinancialRecord {
  id: string; // UUID
  recordType: 'CAPEX' | 'OPEX' | 'Software Maintenance' | 'Cloud Consumption' | 'Depreciation';
  amount: number;
  currency: string;
  costCenterCode: string;
  financialPeriod: string; // e.g. "FY2026-Q3"
  tcoAmount: number;
  depreciationBookValue: number;
  tenantId: string;
  organizationId: string;
  createdAt: string;
}

export interface NewCostCenter {
  id: string; // UUID
  code: string;
  name: string;
  allocatedBudget: number;
  currency: string;
  managerName: string;
  tenantId: string;
}

export interface NewDepreciationRecord {
  id: string; // UUID
  assetTagRef: string;
  purchaseCost: number;
  salvageValue: number;
  usefulLifeMonths: number;
  currentBookValue: number;
  period: string;
  tenantId: string;
}

export interface NewIntegrationRecord {
  id: string; // UUID
  sourceSystem: string;
  externalId: string;
  externalType: string;
  lastSyncedAt: string;
  syncStatus: 'SUCCESS' | 'FAILED' | 'IN_PROGRESS';
  payloadHash: string;
  tenantId: string;
}

export interface NewExternalReference {
  id: string; // UUID
  internalEntityType: string;
  internalEntityId: string;
  externalSystem: string;
  externalId: string;
  syncMetadata: Record<string, any>; // JSONB
  tenantId: string;
}

export interface NewGovernanceRecord {
  id: string; // UUID
  policyId: string;
  ruleName: string;
  classificationLevel: 'Public' | 'Internal' | 'Confidential' | 'Restricted' | 'Highly Restricted';
  actionTaken: string;
  triggerReason: string;
  userId: string;
  tenantId: string;
  createdAt: string;
}

export interface NewAnalyticsMetadata {
  id: string; // UUID
  metricKey: string;
  metricValue: number;
  dimensions: Record<string, any>; // JSONB
  capturedAt: string;
  tenantId: string;
}

export interface NewAiMetadata {
  id: string; // UUID
  promptHash: string;
  modelAlias: string;
  tokenCount: number;
  confidenceScore: number;
  responseSummary: string;
  tenantId: string;
  timestamp: string;
}

export interface PostgresDbHealthMetrics {
  status: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
  activeConnections: number;
  maxConnections: number;
  averageQueryLatencyMs: number;
  activeTransactions: number;
  totalRollbacks: number;
  deadlockCount: number;
  rlsPoliciesEnforcedCount: number;
  databaseSizeBytes: number;
  lastBackupAt: string;
  walArchiveStatus: string;
}
