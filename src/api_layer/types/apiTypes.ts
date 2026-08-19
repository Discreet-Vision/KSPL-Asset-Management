// ==================== API LAYER TYPES & SCHEMAS ====================
// Isolated type definitions for GraphQL, REST Integration, Webhooks, API Security, and Auditing.

export interface ApiTenantContext {
  tenantId: string;
  userId: string;
  userRole: string;
  scopes: string[];
}

// ----------------- GRAPHQL TYPES -----------------
export interface GraphQLQueryRequest {
  query: string;
  variables?: Record<string, any>;
  operationName?: string;
}

export interface GraphQLResponseEnvelope<T = any> {
  data?: T;
  errors?: Array<{
    message: string;
    path?: string[];
    extensions?: {
      code: string;
      field?: string;
      tenantId?: string;
    };
  }>;
  extensions?: {
    complexity: number;
    depth: number;
    executionTimeMs: number;
    tenantId: string;
    correlationId: string;
  };
}

export interface BlastRadiusNode {
  ciId: string;
  name: string;
  type: string;
  relationshipType: string;
  depth: number;
  criticality: string;
}

// ----------------- REST TYPES -----------------
export interface RestApiResponseEnvelope<T = any> {
  success: boolean;
  statusCode: number;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta: {
    requestId: string;
    correlationId: string;
    timestamp: string;
    domain: string;
    tenantId: string;
    executionTimeMs: number;
    version: 'v1';
    idempotencyKey?: string;
  };
}

export interface IdempotencyRecord {
  key: string;
  tenantId: string;
  endpoint: string;
  response: RestApiResponseEnvelope;
  createdAt: string;
}

// ----------------- WEBHOOK TYPES -----------------
export type WebhookEventType =
  | 'asset.created'
  | 'asset.updated'
  | 'asset.retired'
  | 'ci.created'
  | 'ci.updated'
  | 'ci.relationship.changed'
  | 'software.discovered'
  | 'software.updated'
  | 'license.violation.detected'
  | 'contract.expiring'
  | 'workflow.started'
  | 'workflow.completed'
  | 'workflow.failed'
  | 'discovery.completed'
  | 'discovery.failed';

export interface WebhookSubscription {
  subscriptionId: string;
  tenantId: string;
  targetUrl: string;
  eventTypes: WebhookEventType[];
  secretHash: string; // HMAC SHA-256 secret
  status: 'ACTIVE' | 'DISABLED' | 'SUSPENDED';
  createdAt: string;
  retryPolicy: {
    maxAttempts: number;
    backoffBaseSeconds: number;
  };
}

export interface WebhookEventPayload {
  eventId: string;
  eventType: WebhookEventType;
  tenantId: string;
  timestamp: string;
  correlationId: string;
  data: Record<string, any>;
}

export interface WebhookDeliveryLog {
  deliveryId: string;
  eventId: string;
  subscriptionId: string;
  tenantId: string;
  eventType: WebhookEventType;
  targetUrl: string;
  attemptNumber: number;
  statusCode?: number;
  status: 'SUCCESS' | 'FAILED' | 'RETRYING' | 'DEAD_LETTER';
  deliveredAt: string;
  errorMessage?: string;
  signature: string;
}

// ----------------- SECURITY & AUTH TYPES -----------------
export interface ApiKeyRecord {
  keyId: string;
  keyPrefix: string; // e.g. "kspl_live_..."
  hashedSecret: string;
  tenantId: string;
  createdForUser: string;
  scopes: ApiScope[];
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
  expiresAt: string;
  createdAt: string;
  lastUsedAt?: string;
}

export type ApiScope =
  | 'assets.read'
  | 'assets.write'
  | 'cmdb.read'
  | 'software.read'
  | 'licenses.read'
  | 'contracts.read'
  | 'workflow.read'
  | 'workflow.execute'
  | 'webhooks.manage';

export interface RateLimitConfig {
  maxRequestsPerMinute: number;
  currentWindowRequests: number;
  windowResetTime: number;
}

// ----------------- AUDIT & METRICS TYPES -----------------
export interface ApiAuditRecord {
  auditId: string;
  timestamp: string;
  tenantId: string;
  actorId: string;
  action: string;
  endpointOrOperation: string;
  ipAddress: string;
  details: string;
  status: 'SUCCESS' | 'DENIED' | 'ERROR';
}

export interface ApiMetricSnapshot {
  tenantId: string;
  timestamp: string;
  totalRequestCount: number;
  avgResponseTimeMs: number;
  errorRatePercentage: number;
  graphqlMaxComplexity: number;
  graphqlMaxDepth: number;
  webhookDeliverySuccessRate: number;
  webhookDeliveryFailures: number;
  restThroughputPerMin: number;
  rateLimitViolations: number;
}
