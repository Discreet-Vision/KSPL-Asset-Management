export type PredictiveRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type AnomalySeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type ConnectorCategory = 
  | 'HRIS' 
  | 'ERP' 
  | 'ITSM' 
  | 'Cloud Billing' 
  | 'Procurement' 
  | 'MDM' 
  | 'SIEM' 
  | 'BI';

export interface PredictiveMaintenanceAsset {
  assetId: string;
  assetTag: string;
  model: string;
  category: string;
  ageYears: number;
  failureRisk: PredictiveRiskLevel;
  failureProbabilityPercent: number;
  confidencePercent: number;
  predictionWindowDays: number;
  recommendedAction: string;
  hardwareEolDate: string;
  hardwareEosDate: string;
  osEolDate: string;
}

export interface CopilotQueryHistory {
  queryId: string;
  userQuery: string;
  intentDetected: string;
  recordsFoundCount: number;
  aiExplanation: string;
  queryTimestamp: string;
  permissionFiltered: boolean;
}

export interface AssetAnomalyRecord {
  anomalyId: string;
  assetOrCiTag: string;
  anomalyType: string;
  detectedAt: string;
  observedValue: string;
  expectedValue: string;
  deviationScore: number;
  severity: AnomalySeverity;
  status: 'Open' | 'Under Investigation' | 'Resolved';
}

export interface SpendRenewalForecastItem {
  forecastId: string;
  category: 'Contract Renewal' | 'Software License' | 'Hardware Refresh' | 'Cloud Spend';
  itemRef: string;
  historicalPeriodCost: number;
  forecastedCost: number;
  forecastRangeLow: number;
  forecastRangeHigh: number;
  confidencePercent: number;
  forecastPeriod: 'Next 12 Months' | 'Next 24 Months';
  primaryCostDriver: string;
}

export interface MarketplaceConnector {
  connectorId: string;
  name: string;
  category: ConnectorCategory;
  provider: string;
  status: 'Connected' | 'Disconnected' | 'Syncing' | 'Error';
  lastSyncTimestamp?: string;
  recordsSyncedCount: number;
  authMethod: 'OAuth2' | 'API Key' | 'mTLS' | 'Webhook';
}

export interface WebhookEventRecord {
  eventId: string;
  eventType: 'asset.updated.v1' | 'risk.created.v1' | 'anomaly.detected.v1' | 'contract.expiring.v1' | 'cloud.cost.updated.v1';
  targetUrl: string;
  payloadEnvelope: string;
  deliveryStatus: 'Delivered' | 'Retrying' | 'Failed';
  timestamp: string;
  attempts: number;
}

export interface AiAnalyticsStats {
  highRiskAssetsCount: number;
  upcomingEolCount: number;
  activeAnomaliesCount: number;
  forecastedSpendNext12m: number;
  connectedMarketplaceCount: number;
  webhooksDeliveredCount: number;
  copilotQueriesProcessed: number;
}
