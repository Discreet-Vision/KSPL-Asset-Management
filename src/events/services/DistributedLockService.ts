// ==================== DISTRIBUTED LOCK SERVICE ====================
// Redis-backed distributed lock manager protecting long-running background jobs from race conditions.

import { RedisCacheAdapter } from '../adapters/RedisCacheAdapter';

export class DistributedLockService {
  private static cacheAdapter = new RedisCacheAdapter();

  public static async withLock<T>(
    lockKey: string,
    tenantId: string,
    ownerId: string,
    ttlMs: number,
    taskFn: () => Promise<T>
  ): Promise<T | null> {
    const acquired = await this.cacheAdapter.acquireLock({
      lockKey,
      tenantId,
      ownerId,
      ttlMs,
    });

    if (!acquired) {
      console.warn(`[DistributedLockService] Could not acquire lock '${lockKey}' for tenant '${tenantId}'. Job skipped.`);
      return null;
    }

    try {
      return await taskFn();
    } finally {
      await this.cacheAdapter.releaseLock(lockKey, ownerId, tenantId);
    }
  }
}
