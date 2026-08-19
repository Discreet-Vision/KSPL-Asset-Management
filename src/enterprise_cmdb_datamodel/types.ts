export type RelationshipDirectionType = 
  | 'runs_on' 
  | 'depends_on' 
  | 'hosted_by' 
  | 'connects_to' 
  | 'used_by' 
  | 'contains' 
  | 'located_in' 
  | 'managed_by' 
  | 'assigned_to';

export type DiscoveryMethod = 'Agentless' | 'Agent' | 'SNMP' | 'WMI' | 'SSH' | 'Nmap' | 'Cloud API' | 'SaaS/OAuth' | 'Manual Import';

export type LicenseMetric = 'Per Device' | 'Per User' | 'Per Core' | 'Per Socket' | 'Per Instance' | 'Subscription';

export type ContractType = 'MSA' | 'SOW' | 'Maintenance' | 'Subscription' | 'License Agreement' | 'Warranty';

export type TicketType = 'Incident' | 'Problem' | 'Change' | 'Request';

export type VulnerabilitySeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface CiClass {
  id: string;
  name: string;
  parentClassId: string | null;
  attributeSchema: Record<string, string>; // name -> type
}

export interface ConfigurationItem {
  id: string;
  ciClassId: string;
  className: string;
  name: string;
  status: 'Active' | 'In-Repair' | 'In-Stock' | 'Retired' | 'Disposed';
  discoverySource: string;
  confidenceScore: number;
  attributes: Record<string, any>;
  tenantId: string;
}

export interface CiRelationship {
  id: string;
  sourceCiId: string;
  sourceCiName: string;
  targetCiId: string;
  targetCiName: string;
  relationshipType: RelationshipDirectionType;
  discoveredAt: string;
}

export interface DiscoveryScanRecord {
  id: string;
  method: DiscoveryMethod;
  targetRange: string;
  startedAt: string;
  completedAt: string;
  status: 'Started' | 'Running' | 'Completed' | 'Failed' | 'Cancelled';
}

export interface NormalizationCatalogEntry {
  id: string;
  rawStringPattern: string;
  canonicalProductId: string;
  matchType: 'Exact' | 'Pattern' | 'Fuzzy' | 'Publisher';
}

export interface CanonicalProduct {
  id: string;
  publisher: string;
  productName: string;
  versionFamily: string;
  edition: string;
}

export interface SoftwareLicense {
  id: string;
  canonicalProductId: string;
  productName: string;
  licenseMetric: LicenseMetric;
  entitledQty: number;
  unitCostUsd: number;
  expiryDate: string;
}

export interface LicenseConsumption {
  id: string;
  licenseId: string;
  ciId: string;
  consumedUnits: number;
  measuredAt: string;
}

export interface EffectiveLicensePosition {
  canonicalProductId: string;
  productName: string;
  entitledQuantity: number;
  consumedQuantity: number;
  effectiveLicensePosition: number; // Entitled - Consumed
  overDeploysCount: number;
  complianceStatus: 'Compliant' | 'Over-Allocated' | 'At-Risk';
}

export interface ContractRecord {
  id: string;
  vendorId: string;
  vendorName: string;
  contractType: ContractType;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  valueUsd: number;
}

export interface PurchaseOrderRecord {
  id: string;
  vendorId: string;
  poNumber: string;
  orderDate: string;
  totalCostUsd: number;
  costCenterId: string;
}

export interface CostCenterRecord {
  id: string;
  name: string;
  departmentId: string;
  budgetOwner: string;
  annualBudgetUsd: number;
}

export interface DepreciationSchedule {
  id: string;
  ciId: string;
  ciName: string;
  method: 'Straight-Line' | 'Declining-Balance';
  usefulLifeMonths: number;
  salvageValueUsd: number;
  originalCostUsd: number;
  startDate: string;
  accumulatedDepreciationUsd: number;
  currentBookValueUsd: number;
}

export interface VendorRecord {
  id: string;
  name: string;
  contactEmail: string;
  riskRating: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface CiAssignment {
  id: string;
  ciId: string;
  userId: string;
  userName: string;
  assignedAt: string;
  returnedAt: string | null;
}

export interface WorkflowDefinitionRecord {
  id: string;
  name: string;
  triggerEvent: string;
  stepsCount: number;
}

export interface WorkflowInstanceRecord {
  id: string;
  workflowDefId: string;
  ciId: string;
  currentStep: string;
  status: 'Pending' | 'Running' | 'Approved' | 'Rejected' | 'Completed';
  startedAt: string;
}

export interface ItsmTicketRecord {
  id: string;
  ciId: string;
  userId: string;
  type: TicketType;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  createdAt: string;
}

export interface VulnerabilityRecord {
  id: string;
  cveId: string;
  severity: VulnerabilitySeverity;
  affectedProductId: string;
  publishedAt: string;
}

export interface CiVulnerabilityMatch {
  id: string;
  ciId: string;
  ciName: string;
  vulnerabilityId: string;
  cveId: string;
  matchedAt: string;
  remediatedAt: string | null;
}

export interface PolicyRecord {
  id: string;
  name: string;
  ruleDefinition: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface PolicyViolationRecord {
  id: string;
  policyId: string;
  policyName: string;
  ciId: string;
  detectedAt: string;
  resolvedAt: string | null;
  status: 'Detected' | 'Acknowledged' | 'Remediating' | 'Resolved';
}

export interface AuditLogRecord {
  id: string;
  entityType: string;
  entityId: string;
  action: 'Create' | 'Update' | 'Delete' | 'Assign' | 'Discovery' | 'Normalization' | 'Reconciliation';
  changedBy: string;
  changedAt: string;
  diffSummary: string;
}

export interface CmdbDataModelStats {
  totalClassesCount: number;
  totalCisCount: number;
  totalRelationshipsCount: number;
  totalCanonicalProductsCount: number;
  totalActiveContractsCount: number;
  elpCompliantPercent: number;
  policyViolationsCount: number;
}
