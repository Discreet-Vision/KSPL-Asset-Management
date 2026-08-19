export type QualityStatus = 'Excellent' | 'Good' | 'Needs Improvement' | 'Poor' | 'Critical' | 'Unknown';
export type QualityTrend = 'Improving' | 'Stable' | 'Declining';

export type VerificationStatus = 
  | 'Verified' 
  | 'Recently Verified' 
  | 'Aging' 
  | 'Stale' 
  | 'Never Verified' 
  | 'Unknown';

export interface FieldWeightRule {
  fieldName: string;
  weightPct: number; // e.g. 20 for 20%
  isRequired: boolean;
  validityFormat?: 'IPv4/IPv6' | 'MAC' | 'Email' | 'Date' | 'NonEmptyString';
}

export interface ClassQualityRuleConfig {
  id: string;
  ciClass: string; // e.g. 'Server', 'Laptop', 'Network Device', 'Cloud VM', 'ALL'
  requiredFields: string[];
  fieldWeights: FieldWeightRule[];
  freshnessDaysThresholds: {
    optimalDays: number; // e.g. 1
    goodDays: number;    // e.g. 7
    agingDays: number;   // e.g. 30
    staleDays: number;   // e.g. 90
  };
  conflictPenaltyPct: number; // e.g. 10
  stalePenaltyPct: number;    // e.g. 15
  tenantId: string;
  updatedAt: string;
}

export interface QualityScoreBreakdown {
  overallScore: number; // 0 - 100
  status: QualityStatus;
  completenessScore: number;
  validityScore: number;
  consistencyScore: number;
  freshnessScore: number;
  sourceConfidenceScore: number;
  reconciliationConfidenceScore: number;
  conflictPenaltyApplied: number;
  stalePenaltyApplied: number;
  verificationStatus: VerificationStatus;
  reasons: string[];
  recommendedActions: string[];
  evaluatedAt: string;
}

export interface CiQualityRecord {
  ciId: string;
  ciName: string;
  ciClass: string;
  tenantId: string;
  breakdown: QualityScoreBreakdown;
  lastVerified: string;
  trend: QualityTrend;
  historicalScores: { timestamp: string; score: number }[];
}

export interface QualityScanSummary {
  scanId: string;
  tenantId: string;
  totalCisEvaluated: number;
  avgQualityScore: number;
  excellentCount: number;
  goodCount: number;
  needsImprovementCount: number;
  poorCount: number;
  criticalCount: number;
  staleCount: number;
  conflictedCount: number;
  scannedAt: string;
}

export interface DataQualityAlert {
  id: string;
  ciId: string;
  ciName: string;
  tenantId: string;
  severity: 'High' | 'Medium' | 'Low';
  message: string;
  triggerReason: string;
  createdAt: string;
}
