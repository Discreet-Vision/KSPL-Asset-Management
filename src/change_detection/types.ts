export type ChangeCategory = 
  | 'Hardware Change'
  | 'Software Change'
  | 'OS Change'
  | 'Network Change'
  | 'Configuration Change'
  | 'Security Configuration Change'
  | 'Identity Change'
  | 'Cloud Configuration Change';

export type ChangeSeverity = 'Informational' | 'Low' | 'Medium' | 'High' | 'Critical';

export type AuthorizationStatus = 'Authorized' | 'Unauthorized' | 'Expected' | 'Unexpected' | 'Under Review';

export type DriftStatus = 'Open Drift' | 'Under Review' | 'Authorized Baseline' | 'Resolved' | 'Ignored';

export interface FieldChange {
  fieldName: string;
  previousValue: string;
  currentValue: string;
  category: ChangeCategory;
  severity: ChangeSeverity;
  isDriftFromBaseline: boolean;
}

export interface CiChangeRecord {
  id: string;
  ciId: string;
  ciName: string;
  ciClass: string;
  tenantId: string;
  detectedAt: string;
  discoverySource: string;
  fieldChanges: FieldChange[];
  authorizationStatus: AuthorizationStatus;
  driftStatus: DriftStatus;
  riskScore: number; // 0 - 100
  relatedChangeId?: string;
  impactedServicesCount: number;
  remediationRecommendation: string;
}

export interface CiBaseline {
  id: string;
  ciClass: string;
  version: string;
  tenantId: string;
  approvedConfig: Record<string, string>; // fieldName -> expectedValue
  createdBy: string;
  createdAt: string;
}

export interface ChangeSummaryStats {
  totalChangesDetected: number;
  unauthorizedCount: number;
  expectedCount: number;
  highCriticalRiskCount: number;
  openDriftCount: number;
  activeBaselinesCount: number;
}
