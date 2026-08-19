// ==================== CACHE INTERFACE ====================
// Abstract interface decoupling ITAM business logic from underlying cache implementations (Redis / In-Memory).

import { DistributedLockOptions, RateLimitCheckResult } from '../types/cacheEventTypes';

export interface CacheInterface {
  connect(): Promise<boolean>;
  disconnect(): Promise<void>;

  // Key-Value Ops with Tenant Namespacing
  get<T>(key: string, tenantId: string): Promise<T | null>;
  set<T>(key: string, value: T, tenantId: string, ttlSeconds?: number): Promise<boolean>;
  delete(key: string, tenantId: string): Promise<boolean>;
  invalidatePrefix(prefix: string, tenantId: string): Promise<number>;

  // Distributed Locks
  acquireLock(options: DistributedLockOptions): Promise<boolean>;
  releaseLock(lockKey: string, ownerId: string, tenantId: string): Promise<boolean>;

  // Rate Limiting
  checkRateLimit(
    identifier: string,
    limit: number,
    windowSeconds: number,
    tenantId: string
  ): Promise<RateLimitCheckResult>;

  // Idempotency Tracking
  hasProcessedEvent(eventId: string, tenantId: string): Promise<boolean>;
  markEventProcessed(eventId: string, tenantId: string, ttlSeconds?: number): Promise<boolean>;
}
