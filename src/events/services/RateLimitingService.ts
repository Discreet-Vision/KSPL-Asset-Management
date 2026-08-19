// ==================== RATE LIMITING SERVICE ====================
// Redis-backed fixed/sliding window rate limiter for APIs and event ingestion.

import { RedisCacheAdapter } from '../adapters/RedisCacheAdapter';
import { RateLimitCheckResult } from '../types/cacheEventTypes';

export class RateLimitingService {
  private static cacheAdapter = new RedisCacheAdapter();

  public static async enforceRateLimit(
    identifier: string,
    maxRequests: number = 100,
    windowSeconds: number = 60,
    tenantId: string
  ): Promise<RateLimitCheckResult> {
    return this.cacheAdapter.checkRateLimit(identifier, maxRequests, windowSeconds, tenantId);
  }
}
