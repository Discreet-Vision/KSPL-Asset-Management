// ==================== MICRO-FRONTEND ARCHITECTURE TYPES ====================
// Type definitions for Module Federation, Shell Context, Event Contracts, and RBAC Permissions.

export interface MfeUserContext {
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  tenantId: string;
  tenantName: string;
  permissions: string[];
}

export interface MfeManifest {
  moduleId: string;
  moduleName: string;
  description: string;
  version: string;
  remoteEntryUrl: string;
  scopeName: string;
  exposedModule: string;
  requiredPermissions: string[];
  status: 'ONLINE' | 'OFFLINE' | 'DEGRADED';
}

export type MfeModuleId =
  | 'itam'
  | 'sam'
  | 'financial'
  | 'discovery'
  | 'cmdb'
  | 'compliance'
  | 'workflow'
  | 'analytics'
  | 'admin';

export interface MfeEventContract<T = any> {
  eventId: string;
  eventType: string;
  sourceModule: MfeModuleId;
  timestamp: string;
  tenantId: string;
  correlationId: string;
  payload: T;
}

export interface MfeErrorState {
  hasError: boolean;
  failedModuleId?: MfeModuleId;
  errorMessage?: string;
  timestamp?: string;
}
