export type PublisherPackType = 'Microsoft' | 'Oracle' | 'SAP' | 'Adobe' | 'IBM';

export type LicenseMetric = 'Per Device' | 'Per User' | 'Per Core' | 'Per CPU' | 'Per Socket';

export type ComplianceStatus = 
  | 'Compliant' 
  | 'Under-Licensed' 
  | 'Over-Licensed' 
  | 'Partially Licensed' 
  | 'Unknown' 
  | 'Needs Review';

export type ShadowItApprovalStatus = 'Approved' | 'Unapproved' | 'Under Review' | 'Blocked';

export type ShadowItRiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export interface SoftwareEntitlement {
  entitlementId: string;
  publisher: string;
  product: string;
  edition: string;
  sku: string;
  metric: LicenseMetric;
  ownedQuantity: number;
  purchaseOrderRef: string;
  costCenter: string;
  startDate: string;
  endDate: string;
}

export interface EffectiveLicensePosition {
  elpId: string;
  publisher: string;
  product: string;
  edition: string;
  metric: LicenseMetric;
  ownedQuantity: number;
  consumedQuantity: number;
  elpDelta: number; // owned - consumed
  utilizationPercent: number;
  complianceStatus: ComplianceStatus;
  ruleVersionUsed: string;
  calculatedAt: string;
}

export interface PublisherCompliancePack {
  packId: string;
  publisher: PublisherPackType;
  packVersion: string;
  effectiveDate: string;
  rulesDescription: string;
  supportedMetrics: LicenseMetric[];
  status: 'Active' | 'Draft' | 'Deprecated';
}

export interface CanonicalMapping {
  rawString: string;
  canonicalName: string;
  publisher: string;
  product: string;
  edition: string;
  version: string;
  confidenceScore: number;
  matchingMethod: 'Exact' | 'Alias' | 'Fuzzy ML' | 'Catalog Reference';
  reviewStatus: 'Auto-Approved' | 'Pending Review' | 'Approved' | 'Rejected';
}

export interface ShadowItApplication {
  appId: string;
  appName: string;
  publisher: string;
  appUrl: string;
  userCount: number;
  firstSeen: string;
  lastSeen: string;
  discoverySource: 'SSO Logs' | 'CASB' | 'Expense Data' | 'OAuth Integration';
  riskLevel: ShadowItRiskLevel;
  approvalStatus: ShadowItApprovalStatus;
  estimatedMonthlySpend: string;
}

export interface AuditSimulationResult {
  simulationId: string;
  publisher: PublisherPackType;
  readinessScore: number; // 0 - 100
  estimatedFinancialExposure: string;
  ruleVersion: string;
  simulatedAt: string;
  findingsCount: {
    underLicensed: number;
    unlicensedDeployments: number;
    staleEvidence: number;
  };
  defensePacketReady: boolean;
}

export interface SamSummaryStats {
  totalEntitlements: number;
  totalProductsMonitored: number;
  compliantCount: number;
  underLicensedCount: number;
  shadowItAppsCount: number;
  avgAuditReadinessScore: number;
}
