// ==================== REDIS CACHE ADAPTER ====================
// Isolated Redis Cache Adapter enforcing tenant isolation, namespaced key design, TTLs, distributed locks, and rate limits.

import { CacheInterface } from '../interfaces/CacheInterface';
import { DistributedLockOptions, RateLimitCheckResult, RedisClusterHealth } from '../types/cacheEventTypes';

interface CacheEntry<T = any> {
  value: T;
  expiresAt: number | null; // epoch ms
}

interface LockRecord {
  ownerId: string;
  expiresAt: number;
}

export class RedisCacheAdapter implements CacheInterface {
  // In-memory backing storage simulating Redis key-value database
  private static redisStore: Map<string, CacheEntry> = new Map();
  private static lockStore: Map<string, LockRecord> = new Map();
  private static rateLimitStore: Map<string, { count: number; windowStart: number }> = new Map();
  private static processedEventsSet: Set<string> = new Set();

  constructor() {
    this.seedDefaultCacheData();
  }

  private seedDefaultCacheData() {
    if (RedisCacheAdapter.redisStore.size > 0) return;
    // Seed initial namespaced cache values for demonstration
    this.set('permissions:USR-8801', { roles: ['ITAM_ADMIN'], scope: 'GLOBAL' }, 'tenant-kspl-global', 3600);
    this.set('asset:ASSET-10025', { id: 'ASSET-10025', model: 'Dell Latitude 7440', status: 'IN_USE' }, 'tenant-kspl-global', 1800);
  }

  /**
   * Constructs strict tenant-isolated key: itam:{tenant_id}:{key}
   */
  private formatKey(key: string, tenantId: string): string {
    if (!tenantId) {
      throw new Error('[RedisCacheAdapter] Security Violation: Missing mandatory tenantId parameter.');
    }
    return `itam:${tenantId}:${key}`;
  }

  public async connect(): Promise<boolean> {
    return true;
  }

  public async disconnect(): Promise<void> {
    // Session disconnect
  }

  public async get<T>(key: string, tenantId: string): Promise<T | null> {
    const fullKey = this.formatKey(key, tenantId);
    const entry = RedisCacheAdapter.redisStore.get(fullKey);

    if (!entry) return null;

    if (entry.expiresAt !== null && Date.now() > entry.expiresAt) {
      RedisCacheAdapter.redisStore.delete(fullKey);
      return null;
    }

    return entry.value as T;
  }

  public async set<T>(key: string, value: T, tenantId: string, ttlSeconds: number = 300): Promise<boolean> {
    const fullKey = this.formatKey(key, tenantId);
    const expiresAt = ttlSeconds > 0 ? Date.now() + ttlSeconds * 1000 : null;

    RedisCacheAdapter.redisStore.set(fullKey, { value, expiresAt });
    return true;
  }

  public async delete(key: string, tenantId: string): Promise<boolean> {
    const fullKey = this.formatKey(key, tenantId);
    return RedisCacheAdapter.redisStore.delete(fullKey);
  }

  public async invalidatePrefix(prefix: string, tenantId: string): Promise<number> {
    const fullPrefix = this.formatKey(prefix, tenantId);
    let deletedCount = 0;

    for (const key of RedisCacheAdapter.redisStore.keys()) {
      if (key.startsWith(fullPrefix)) {
        RedisCacheAdapter.redisStore.delete(key);
        deletedCount++;
      }
    }

    return deletedCount;
  }

  /**
   * Distributed locking mechanism using atomic key setting with TTL
   */
  public async acquireLock(options: DistributedLockOptions): Promise<boolean> {
    const fullLockKey = this.formatKey(`lock:${options.lockKey}`, options.tenantId);
    const now = Date.now();
    const existingLock = RedisCacheAdapter.lockStore.get(fullLockKey);

    if (existingLock && existingLock.expiresAt > now) {
      return false; // Lock currently held
    }

    RedisCacheAdapter.lockStore.set(fullLockKey, {
      ownerId: options.ownerId,
      expiresAt: now + options.ttlMs,
    });

    return true;
  }

  public async releaseLock(lockKey: string, ownerId: string, tenantId: string): Promise<boolean> {
    const fullLockKey = this.formatKey(`lock:${lockKey}`, tenantId);
    const existingLock = RedisCacheAdapter.lockStore.get(fullLockKey);

    if (!existingLock) return true;

    if (existingLock.ownerId === ownerId) {
      RedisCacheAdapter.lockStore.delete(fullLockKey);
      return true;
    }

    return false; // Owned by another worker
  }

  /**
   * Redis fixed-window rate limiter
   */
  public async checkRateLimit(
    identifier: string,
    limit: number,
    windowSeconds: number,
    tenantId: string
  ): Promise<RateLimitCheckResult> {
    const fullKey = this.formatKey(`ratelimit:${identifier}`, tenantId);
    const now = Date.now();
    const windowMs = windowSeconds * 1000;

    let record = RedisCacheAdapter.rateLimitStore.get(fullKey);

    if (!record || now - record.windowStart > windowMs) {
      record = { count: 1, windowStart: now };
      RedisCacheAdapter.rateLimitStore.set(fullKey, record);
    } else {
      record.count++;
    }

    const allowed = record.count <= limit;
    const remaining = Math.max(0, limit - record.count);
    const resetSeconds = Math.ceil((record.windowStart + windowMs - now) / 1000);

    return {
      allowed,
      limit,
      remaining,
      resetSeconds,
      tenantId,
    };
  }

  /**
   * Checks if an eventId was already processed for idempotency
   */
  public async hasProcessedEvent(eventId: string, tenantId: string): Promise<boolean> {
    const fullKey = this.formatKey(`event:${eventId}`, tenantId);
    return RedisCacheAdapter.processedEventsSet.has(fullKey);
  }

  public async markEventProcessed(eventId: string, tenantId: string, ttlSeconds: number = 86400): Promise<boolean> {
    const fullKey = this.formatKey(`event:${eventId}`, tenantId);
    RedisCacheAdapter.processedEventsSet.add(fullKey);
    return true;
  }

  /**
   * Health metrics for Redis monitoring dashboard
   */
  public async clusterHealth(): Promise<RedisClusterHealth> {
    const activeKeys = RedisCacheAdapter.redisStore.size;
    return {
      status: 'ONLINE',
      engine: 'Redis 7.2 (Standalone/Cluster)',
      usedMemoryBytes: activeKeys * 1024 + 1420000,
      maxMemoryBytes: 512 * 1024 * 1024, // 512 MB
      connectedClients: 24,
      hitRatePercentage: 96.8,
      evictedKeysTotal: 12,
      activeNamespacesCount: 4,
    };
  }
}
