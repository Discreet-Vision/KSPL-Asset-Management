export type SystemOfRecordType = 
  | 'HR / HRIS'
  | 'ERP / SAP'
  | 'Finance'
  | 'Procurement'
  | 'Cloud Billing'
  | 'Identity Provider / Azure AD'
  | 'Contract Management';

export type ConnectorStatus = 
  | 'Connected (Live)'
  | 'Cached'
  | 'Circuit Open (Rate Limited)'
  | 'Unavailable'
  | 'Authentication Failed';

export type DataFreshness = 'Live' | 'Cached' | 'Stale' | 'Unavailable';

export interface ExternalReference {
  referenceId: string;
  sourceSystem: SystemOfRecordType;
  entityType: 'Employee' | 'Cost Center' | 'Purchase Order' | 'Contract' | 'Vendor';
}

export interface ResolvedFederatedField {
  fieldName: string;
  fieldValue: string;
  sourceSystem: SystemOfRecordType;
  isFederated: boolean; // true = FEDERATED, false = LOCAL
  freshness: DataFreshness;
  retrievedAt: string;
}

export interface FederatedEntityRecord {
  referenceId: string;
  entityType: string;
  sourceSystem: SystemOfRecordType;
  resolvedFields: Record<string, ResolvedFederatedField>;
  status: ConnectorStatus;
  cacheTtlMinutes: number;
}

export interface FederationConnectorConfig {
  connectorId: string;
  connectorName: string;
  systemType: SystemOfRecordType;
  status: ConnectorStatus;
  endpointUrl: string;
  authMethod: 'OAuth 2.0' | 'API Key' | 'mTLS' | 'Service Account';
  cacheDurationMinutes: number;
  circuitBreakerThreshold: number;
  lastSyncTimestamp: string;
  recordsResolvedCount: number;
  tenantId: string;
}

export interface SourceConflictRecord {
  conflictId: string;
  ciId: string;
  ciName: string;
  fieldName: string;
  localValue: string;
  externalAuthoritativeValue: string;
  sourceSystem: SystemOfRecordType;
  detectedAt: string;
  resolutionStatus: 'Unresolved Conflict' | 'Local Overridden' | 'Source Kept';
}

export interface FederationHealthStats {
  totalConnectors: number;
  activeConnectors: number;
  recordsResolved24h: number;
  cacheHitRatioPercent: number;
  sourceConflictsCount: number;
}
