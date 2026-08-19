// ==================== ITAM AI & ANALYTICS ENGINE TYPES ====================

export type AnomalySeverity = 'Low' | 'Medium' | 'High' | 'Critical';
export type AnomalyStatus = 'New' | 'Investigating' | 'Acknowledged' | 'Resolved' | 'False Positive';

export type AnomalyType =
  | 'Unusual Asset Cost'
  | 'Unusual Asset Growth'
  | 'Unexpected Hardware Changes'
  | 'Unexpected Software Installation'
  | 'Unusual License Consumption'
  | 'Unusual Incident Frequency'
  | 'Unusual Maintenance Cost'
  | 'Unusual Cloud Cost'
  | 'Unusual Asset Assignment'
  | 'Unusual Asset Movement'
  | 'Unexpected Lifecycle Changes'
  | 'Discovered From Multiple Sources';

export interface AnomalyRecord {
  id: string;
  assetId?: string;
  assetName?: string;
  anomalyType: AnomalyType;
  severity: AnomalySeverity;
  detectedDate: string;
  reason: string;
  confidence: number; // 0 to 100%
  recommendedAction: string;
  status: AnomalyStatus;
  baselineValue: string;
  observedValue: string;
  affectedDepartment?: string;
  affectedLocation?: string;
  tenantId: string;
}

export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical'; // Low: 0-30, Medium: 31-60, High: 61-80, Critical: 81-100

export interface FailureRiskFactor {
  factorName: string;
  weightPercentage: number;
  description: string;
  scoreContribution: number;
}

export interface FailureRiskRecord {
  id: string;
  assetId: string;
  assetName: string;
  assetType: 'Server' | 'Laptop' | 'Desktop' | 'Network Device' | 'VM' | 'Cloud Resource';
  failureRiskScore: number; // 0 - 100
  riskLevel: RiskLevel;
  factors: FailureRiskFactor[];
  warrantyStatus: 'Active' | 'Expiring Soon' | 'Expired';
  incidentCount90d: number;
  repairCount6m: number;
  ageYears: number;
  recommendation: string;
  dataQualityStatus: 'Sufficient Data' | 'Insufficient Data';
  dataQualityReason?: string;
  lastUpdated: string;
  tenantId: string;
}

export interface EolRiskRecord {
  id: string;
  assetId: string;
  assetName: string;
  assetType: string;
  eolRiskLevel: RiskLevel;
  expectedEolDate: string;
  monthsRemaining: number;
  reason: string; // e.g., Vendor support ending + hardware age + warranty expiration
  replacementCostEst: number;
  vendorName: string;
  osVersion?: string;
  isUnsupportedOs: boolean;
  tenantId: string;
}

export interface WarrantyExpirationForecast {
  id: string;
  region: string; // e.g., APAC, AMER, EMEA
  assetType: string;
  timeframeDays: number; // e.g., 30, 60, 90 days
  expiringAssetCount: number;
  totalReplacementValue: number;
  estimatedRenewalCost: number;
  estimatedReplacementCost: number;
  affectedDepartments: string[];
  affectedLocations: string[];
  tenantId: string;
}

export interface CostDriverSummary {
  vendorName: string;
  productName: string;
  estimatedCost: number;
  percentageOfTotal: number;
}

export interface RenewalCostForecast {
  id: string;
  timeframeLabel: '30 Days' | '60 Days' | '90 Days' | '6 Months' | '12 Months' | '24 Months';
  forecastPeriodDays: number;
  estimatedRenewalCost: number;
  estimatedReplacementCost: number;
  estimatedMaintenanceCost: number;
  estimatedSubscriptionCost: number;
  confidenceScore: number; // e.g., 87%
  historicalRecordsUsed: number;
  methodology: string; // e.g., "Time-Series Exponential Smoothing + Contract Indexing"
  majorCostDrivers: CostDriverSummary[];
  lastUpdated: string;
  tenantId: string;
}

export interface AIRecommendation {
  id: string;
  title: string;
  riskCategory: 'Failure Risk' | 'EOL Obsolescence' | 'License Deficit' | 'Cost Optimization';
  priorityScore: number;
  targetEntityId: string;
  targetEntityName: string;
  recommendationText: string;
  financialImpactEst: number;
  confidence: number;
  status: 'Pending Review' | 'Accepted' | 'Dismissed';
  humanOversightRequired: boolean; // Must explicitly confirm "AI Recommendation (Advisory Only)"
  createdAt: string;
  tenantId: string;
}

export interface QueryPlan {
  targetEntity: string;
  filters: { field: string; operator: string; value: string }[];
  requestedFields: string[];
  estimatedResultCount: number;
  dataSourcesUsed: string[];
  permissionValidated: boolean;
}

export interface CopilotMessage {
  id: string;
  sessionId: string;
  sender: 'user' | 'ai';
  timestamp: string;
  text: string;
  queryPlan?: QueryPlan;
  citations?: string[];
  confidence?: number;
  dataQualityNote?: string;
  resultData?: {
    summaryText?: string;
    metrics?: { label: string; value: string }[];
    tableHeaders?: string[];
    tableRows?: Record<string, any>[];
    chartType?: 'bar' | 'line' | 'pie';
    chartData?: { name: string; value: number }[];
  };
  recommendations?: AIRecommendation[];
}

export interface AIProviderConfig {
  id: string;
  providerName: 'Google AI' | 'OpenAI' | 'Local LLM' | 'Enterprise LLM' | 'Self-Hosted';
  modelAlias: string; // e.g., "gemini-3.6-flash"
  endpointUrl?: string;
  isEnabled: boolean;
  isExternal: boolean;
  privacyMaskPii: boolean;
  latencyMsAvg: number;
  status: 'Active' | 'Standby' | 'Disabled';
  tenantId: string;
}

export interface MLModelConfig {
  id: string;
  modelType: 'Anomaly Detection' | 'Forecasting' | 'Failure Risk' | 'EOL Risk' | 'Risk Scoring';
  algorithm: string; // e.g., "Isolation Forest", "Arima / Prophet", "Gradient Boosted Trees"
  lastTrainedAt: string;
  accuracyScore: number; // e.g., 94.2%
  status: 'Deployed' | 'Training' | 'Deprecated';
  tenantId: string;
}

export interface AiAuditLogRecord {
  id: string;
  userId: string;
  userName: string;
  tenantId: string;
  questionText: string;
  timestamp: string;
  dataSourcesUsed: string[];
  queryType: string;
  resultCount: number;
  providerUsed: string;
  confidenceScore: number;
  executionTimeMs: number;
  piiMaskApplied: boolean;
}

export interface AnalyticsPermissionSet {
  canView: boolean;
  canAnomalies: boolean;
  canForecasting: boolean;
  canRisk: boolean;
  canAiCopilot: boolean;
  canModels: boolean;
  canAdmin: boolean;
  canAudit: boolean;
}
