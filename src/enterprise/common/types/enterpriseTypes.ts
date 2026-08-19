// ==================== ENTERPRISE BACKEND FRAMEWORK TYPES ====================
// Standardized metadata, context, request/response envelopes for NestJS Modular DDD architecture.

export interface TenantContext {
  tenantId: string;
  tenantName: string;
  tier: 'ENTERPRISE' | 'GOVERNMENT' | 'STANDARD';
  region: string;
}

export interface UserContext {
  userId: string;
  email: string;
  roles: string[];
  permissions: string[];
  tenantId: string;
}

export interface ApiResponseEnvelope<T = any> {
  success: boolean;
  statusCode: number;
  data: T;
  meta: {
    requestId: string;
    correlationId: string;
    timestamp: string;
    domain: string;
    tenantId: string;
    executionTimeMs: number;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface HealthCheckStatus {
  status: 'UP' | 'DOWN' | 'DEGRADED';
  service: string;
  version: string;
  uptimeSeconds: number;
  timestamp: string;
  dependencies: Record<string, { status: 'UP' | 'DOWN'; responseTimeMs: number }>;
}

export interface DomainEventPayload<T = any> {
  eventId: string;
  eventName: string;
  aggregateId: string;
  domain: string;
  tenantId: string;
  timestamp: string;
  correlationId: string;
  data: T;
}
