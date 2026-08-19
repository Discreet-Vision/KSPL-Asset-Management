export type SystemCategory = 
  | 'HRIS' 
  | 'ERP_FINANCE' 
  | 'ITSM' 
  | 'CLOUD_PROVIDER' 
  | 'MDM_UEM' 
  | 'SSO_IDP' 
  | 'SAAS_DISCOVERY' 
  | 'CASB_SECURITY' 
  | 'PROCUREMENT' 
  | 'BI_DATA_WAREHOUSE' 
  | 'SIEM';

export type SystemProvider = 
  | 'Workday' | 'SAP_SuccessFactors'
  | 'SAP_S4HANA' | 'Oracle_NetSuite'
  | 'ServiceNow' | 'Jira_Service_Management' | 'BMC_Helix'
  | 'AWS' | 'Azure' | 'GCP'
  | 'Microsoft_Intune' | 'Jamf' | 'VMware_Workspace_ONE'
  | 'Okta' | 'Microsoft_Entra_ID' | 'Ping_Identity'
  | 'Coupa' | 'SAP_Ariba'
  | 'Snowflake' | 'BigQuery'
  | 'Splunk' | 'Microsoft_Sentinel'
  | 'Generic_REST_Webhook';

export type AuthMethod = 'OAuth2' | 'OIDC' | 'SAML' | 'API_Key' | 'Service_Account' | 'Vendor_Token';

export type SyncStatus = 'Connected' | 'Disconnected' | 'Syncing' | 'Warning' | 'Failed' | 'Disabled';

export type IntegrationEventType = 
  | 'asset.created' | 'asset.updated' | 'asset.assigned' | 'asset.returned' | 'asset.retired'
  | 'ci.created' | 'ci.updated' | 'ci.changed' | 'ci.relationship.changed'
  | 'discovery.completed'
  | 'license.expiring' | 'license.overconsumed'
  | 'contract.expiring'
  | 'employee.onboarded' | 'employee.offboarded' | 'employee.transferred'
  | 'purchase_order.created' | 'purchase_order.updated'
  | 'policy.violation.detected'
  | 'vulnerability.detected' | 'vulnerability.remediated'
  | 'audit.created';

export interface IntegrationConnector {
  id: string;
  name: string;
  category: SystemCategory;
  provider: SystemProvider;
  authMethod: AuthMethod;
  status: SyncStatus;
  endpointUrl: string;
  lastSyncAt: string;
  nextSyncAt: string;
  recordsProcessedCount: number;
  errorRatePercent: number;
  tenantId: string;
  rateLimitPerMinute: number;
  enabled: boolean;
}

export interface SyncJobRecord {
  id: string;
  connectorId: string;
  connectorName: string;
  startedAt: string;
  completedAt: string;
  status: 'Completed' | 'Failed' | 'Partial' | 'Running';
  recordsRead: number;
  recordsCreated: number;
  recordsUpdated: number;
  recordsSkipped: number;
  recordsFailed: number;
  errorDetails?: string;
  tenantId: string;
}

export interface OutboundWebhookConfig {
  id: string;
  name: string;
  endpointUrl: string;
  subscribedEvents: IntegrationEventType[];
  authHeaderKey: string;
  secretHmacHash: string;
  retryPolicy: 'Exponential_Backoff' | 'Fixed_3_Attempts';
  status: 'Active' | 'Paused' | 'Failing';
  lastAttemptAt: string;
  totalDelivered: number;
  tenantId: string;
}

export interface FieldSourcePrecedenceRule {
  id: string;
  fieldCategory: 'OS_Version' | 'Employee_Department' | 'Cloud_Cost' | 'Purchase_Order' | 'Asset_Compliance';
  targetAttribute: string;
  precedenceChain: SystemCategory[]; // e.g. ['MDM_UEM', 'AGENT', 'AGENTLESS']
  tenantId: string;
}

export interface CloudCostRecord {
  id: string;
  cloudProvider: 'AWS' | 'Azure' | 'GCP';
  resourceArn: string;
  billingAccount: string;
  serviceName: string;
  region: string;
  costCenter: string;
  dailyCostUsd: number;
  monthlyProjectedCostUsd: number;
  billingDate: string;
}

export interface SaasUsageSignal {
  id: string;
  appName: string;
  userEmail: string;
  department: string;
  firstSeen: string;
  lastSeen: string;
  loginCount: number;
  classification: 'Sanctioned' | 'Shadow_IT' | 'Under_Review';
}

export interface FabricEventMessage {
  eventId: string;
  eventType: IntegrationEventType;
  sourceConnectorId: string;
  tenantId: string;
  timestamp: string;
  payload: Record<string, any>;
  idempotencyKey: string;
}

export interface IntegrationFabricStats {
  totalConnectorsCount: number;
  activeConnectorsCount: number;
  syncSuccessRatePercent: number;
  activeWebhooksCount: number;
  totalSyncedRecords24h: number;
  cloudCostTrackedUsd: number;
}
