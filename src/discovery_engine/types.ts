export type DiscoveryMethod = 
  | 'Agentless Network' 
  | 'Endpoint Agent' 
  | 'Cloud API' 
  | 'SaaS OAuth' 
  | 'CASB Shadow IT' 
  | 'Manual Entry' 
  | 'CSV Import';

export type AgentlessProtocol = 'SNMP' | 'WMI' | 'SSH' | 'Network Sweep';

export type CloudProviderType = 'AWS' | 'Azure' | 'GCP';

export interface UnifiedDiscoveryResult {
  id: string;
  sourceMethod: DiscoveryMethod;
  subProtocol?: string;
  tenantId: string;
  timestamp: string;
  confidenceScore: number; // 0 - 100
  
  // Normalized Core Fields
  rawIdentifier: string;
  hostname: string;
  ipAddress?: string;
  macAddress?: string;
  serialNumber?: string;
  manufacturer?: string;
  model?: string;
  osName?: string;
  osVersion?: string;
  
  // Software / Cloud specific
  installedSoftwareCount?: number;
  cloudResourceId?: string;
  cloudProvider?: CloudProviderType;
  saasAppName?: string;
  saasActiveUsers?: number;

  // Candidate CI Classification
  candidateClass: 'Hardware' | 'Software' | 'Cloud' | 'Service';
  candidateType: string;
  
  status: 'Pending Reconciliation' | 'Reconciled' | 'Duplicate Candidate' | 'Rejected';
  rawAttributes: Record<string, any>;
}

export interface AgentlessSweepConfig {
  jobId: string;
  targetCidr: string;
  protocols: AgentlessProtocol[];
  credentialsProfile: string;
  concurrencyLimit: number;
  timeoutSeconds: number;
  status: 'Idle' | 'Running' | 'Completed' | 'Failed';
  devicesFound: number;
  lastRunTimestamp: string;
}

export interface EndpointAgentRecord {
  agentId: string;
  deviceId: string;
  hostname: string;
  osType: 'Windows' | 'Linux' | 'macOS' | 'iOS';
  osName?: string;
  osVersion: string;
  agentVersion: string;
  status: 'Healthy' | 'Unreachable' | 'Update Pending' | 'Enrolled';
  lastSeen: string;
  ipAddress: string;
  macAddress?: string;
  serialNumber?: string;
  manufacturer?: string;
  model?: string;
  installedSoftwareCount: number;
  installedSoftwareSample?: string[];
  missingPatchCount: number;
  cpuUsagePct: number;
  memoryUsagePct: number;
  cpuModel?: string;
  cpuCores?: number;
  memoryTotalGb?: number;
  diskTotalGb?: number;
  diskFreeGb?: number;
}

export interface CloudConnectorConfig {
  connectorId: string;
  provider: CloudProviderType;
  accountId: string; // AWS Acc ID / Azure Sub / GCP Project
  authMechanism: 'IAM Role' | 'Workload Identity' | 'Service Account Key';
  syncIntervalHours: number;
  status: 'Active' | 'Sync Error' | 'Unauthorized';
  lastSyncTimestamp: string;
  resourcesDiscovered: number;
}

export interface SaasConnectorRecord {
  id: string;
  saasName: string;
  provider: string;
  authType: 'OAuth2' | 'API Key';
  licensedSeats: number;
  activeUsers: number;
  syncStatus: 'Synced' | 'Token Expired' | 'Syncing';
  lastSync: string;
}

export interface DiscoveryJob {
  id: string;
  name: string;
  method: DiscoveryMethod;
  tenantId: string;
  startTime: string;
  endTime?: string;
  status: 'SUCCESS' | 'RUNNING' | 'FAILED' | 'QUEUED';
  itemsDiscovered: number;
  newCis: number;
  updatedCis: number;
  errorsCount: number;
  logSummary: string;
}
