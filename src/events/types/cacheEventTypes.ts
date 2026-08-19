// ==================== CACHE & EVENT STREAMING TYPES ====================
// Isolated Data Models for Redis Cache & Kafka Event Streaming Layer.

export type EventType =
  | 'asset.discovered'
  | 'asset.updated'
  | 'asset.retired'
  | 'ci.discovered'
  | 'ci.updated'
  | 'inventory.updated'
  | 'reconciliation.completed'
  | 'reconciliation.failed'
  | 'telemetry.received'
  | 'contract.expiring'
  | 'compliance.violation.detected'
  | 'workflow.triggered';

export interface StandardEventEnvelope<T = any> {
  eventId: string; // UUID
  eventType: EventType;
  tenantId: string;
  source: string; // e.g., "discovery-agent-v2", "telemetry-worker", "ui-portal"
  entityType: 'asset' | 'ci' | 'inventory' | 'telemetry' | 'workflow' | 'compliance';
  entityId: string;
  timestamp: string; // ISO 8601 UTC
  correlationId: string;
  causationId?: string;
  version: string; // e.g., "1.0"
  payload: T;
}

export interface DistributedLockOptions {
  lockKey: string;
  tenantId: string;
  ownerId: string; // Unique process/node ID
  ttlMs: number; // e.g. 10000ms
}

export interface RateLimitCheckResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetSeconds: number;
  tenantId: string;
}

export interface DeadLetterEventRecord {
  dlqId: string;
  originalEvent: StandardEventEnvelope;
  failedConsumerName: string;
  failureReason: string;
  attemptCount: number;
  firstFailedAt: string;
  lastFailedAt: string;
  status: 'QUEUED' | 'REPLAYED' | 'DISCARDED';
  tenantId: string;
}

export interface RedisClusterHealth {
  status: 'ONLINE' | 'DEGRADED';
  engine: 'Redis 7.2 (Standalone/Cluster)';
  usedMemoryBytes: number;
  maxMemoryBytes: number;
  connectedClients: number;
  hitRatePercentage: number;
  evictedKeysTotal: number;
  activeNamespacesCount: number;
}

export interface KafkaClusterHealth {
  status: 'ONLINE' | 'DEGRADED';
  brokerEngine: 'Apache Kafka 3.6 (KRaft Mode)';
  activeTopicsCount: number;
  totalPartitions: number;
  activeConsumerGroups: number;
  totalMessagesInjected: number;
  consumerLagTotal: number;
  deadLetterEventsCount: number;
  throughputPerSec: number;
}

export interface CacheEventAuditLog {
  id: string;
  timestamp: string;
  userId: string;
  tenantId: string;
  operation: 'CACHE_PURGE' | 'EVENT_REPLAY' | 'EVENT_DISCARD' | 'LOCK_ACQUIRE' | 'DLQ_FLUSH';
  details: string;
  correlationId: string;
}

export interface CacheEventPermissions {
  canPublishEvents: boolean;
  canConsumeEvents: boolean;
  canViewEvents: boolean;
  canReplayEvents: boolean;
  canRetryEvents: boolean;
  canAdminEvents: boolean;
  canAdminCache: boolean;
}
