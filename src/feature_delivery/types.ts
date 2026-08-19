export type FlagProvider = 'LaunchDarkly' | 'Unleash' | 'LocalFallback';

export type FlagType = 'Boolean' | 'Percentage' | 'TenantTargeted' | 'RoleTargeted';

export interface TargetingRule {
  id: string;
  type: 'tenant' | 'role' | 'percentage' | 'environment';
  attribute: string;
  values: string[];
  rolloutPercentage?: number;
}

export interface FeatureFlag {
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  type: FlagType;
  environment: 'development' | 'testing' | 'staging' | 'production';
  defaultValue: boolean;
  rules: TargetingRule[];
  enabledTenants: string[];
  enabledRoles: string[];
  rolloutPercentage: number;
  updatedAt: string;
  updatedBy: string;
}

export interface BlueGreenStatus {
  activeEnvironment: 'BLUE' | 'GREEN';
  blueVersion: string;
  blueReplicas: number;
  blueHealth: 'Healthy' | 'Degraded' | 'Offline';
  greenVersion: string;
  greenReplicas: number;
  greenHealth: 'Healthy' | 'Validating' | 'Offline';
  trafficSplitRatio: { blue: number; green: number }; // e.g. { blue: 90, green: 10 }
  autoRollbackTriggered: boolean;
  rollbackReason?: string;
  lastTrafficSwitchAt: string;
}

export interface ReleaseAuditLog {
  id: string;
  timestamp: string;
  action: 'FLAG_CREATED' | 'FLAG_TOGGLED' | 'TARGETING_UPDATED' | 'TRAFFIC_SWITCHED' | 'BLUE_GREEN_ROLLBACK' | 'CANARY_PROMOTED';
  actor: string;
  targetKey: string;
  details: string;
  environment: string;
}
