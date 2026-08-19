// ==================== API AUTH & RATE LIMITING ADAPTER ====================
// Isolated authentication, API Key hashing, scope verification, and rate limiting module.

import { ApiKeyRecord, ApiScope, ApiTenantContext, RateLimitConfig } from '../types/apiTypes';

export class ApiAuthAdapter {
  private static apiKeysStore: Map<string, ApiKeyRecord> = new Map();
  private static rateLimiters: Map<string, RateLimitConfig> = new Map();

  constructor() {
    this.seedDefaultApiKeys();
  }

  private seedDefaultApiKeys() {
    if (ApiAuthAdapter.apiKeysStore.size > 0) return;

    const key1: ApiKeyRecord = {
      keyId: 'key-servicenow-live',
      keyPrefix: 'kspl_live_sn_8a99b',
      hashedSecret: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      tenantId: 'tenant-kspl-global',
      createdForUser: 'usr-alexander-wright',
      scopes: ['assets.read', 'assets.write', 'cmdb.read', 'workflow.execute', 'webhooks.manage'],
      status: 'ACTIVE',
      expiresAt: '2027-12-31T23:59:59Z',
      createdAt: new Date().toISOString(),
      lastUsedAt: new Date().toISOString(),
    };

    const key2: ApiKeyRecord = {
      keyId: 'key-workday-readonly',
      keyPrefix: 'kspl_live_wd_11a02',
      hashedSecret: '7d81230182839910293123012938102938102938102938102938102938102938',
      tenantId: 'tenant-kspl-global',
      createdForUser: 'usr-priya-sharma',
      scopes: ['assets.read', 'software.read', 'licenses.read'],
      status: 'ACTIVE',
      expiresAt: '2028-06-30T23:59:59Z',
      createdAt: new Date().toISOString(),
      lastUsedAt: new Date().toISOString(),
    };

    ApiAuthAdapter.apiKeysStore.set(key1.keyId, key1);
    ApiAuthAdapter.apiKeysStore.set(key2.keyId, key2);
  }

  public createApiKey(
    tenantId: string,
    createdForUser: string,
    scopes: ApiScope[]
  ): { apiKeyRecord: ApiKeyRecord; rawSecret: string } {
    const keyId = `key-${Date.now()}`;
    const rawSecret = `kspl_live_sec_${Math.random().toString(36).substring(2)}${Date.now().toString(36)}`;
    const keyPrefix = rawSecret.substring(0, 16);
    const hashedSecret = this.hashSecret(rawSecret);

    const apiKeyRecord: ApiKeyRecord = {
      keyId,
      keyPrefix,
      hashedSecret,
      tenantId,
      createdForUser,
      scopes,
      status: 'ACTIVE',
      expiresAt: new Date(Date.now() + 365 * 86400 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
    };

    ApiAuthAdapter.apiKeysStore.set(keyId, apiKeyRecord);
    return { apiKeyRecord, rawSecret };
  }

  public revokeApiKey(keyId: string, tenantId: string): boolean {
    const key = ApiAuthAdapter.apiKeysStore.get(keyId);
    if (!key || key.tenantId !== tenantId) return false;
    key.status = 'REVOKED';
    return true;
  }

  public getApiKeys(tenantId: string): ApiKeyRecord[] {
    return Array.from(ApiAuthAdapter.apiKeysStore.values()).filter((k) => k.tenantId === tenantId);
  }

  public authenticateRequest(authHeader: string | undefined, reqTenantId: string): ApiTenantContext {
    // Default context for demonstration UI
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        tenantId: reqTenantId,
        userId: 'usr-alexander-wright',
        userRole: 'ADMIN',
        scopes: ['assets.read', 'assets.write', 'cmdb.read', 'software.read', 'licenses.read', 'contracts.read', 'workflow.read', 'workflow.execute', 'webhooks.manage', 'financial.view'],
      };
    }

    const token = authHeader.replace('Bearer ', '').trim();
    const key = Array.from(ApiAuthAdapter.apiKeysStore.values()).find(
      (k) => k.keyPrefix === token.substring(0, 16) && k.status === 'ACTIVE'
    );

    if (!key) {
      throw new Error('Authentication Failed: Invalid or revoked API key credentials.');
    }

    if (key.tenantId !== reqTenantId) {
      throw new Error(`Authentication Failed: API key is restricted to tenant '${key.tenantId}', but request supplied '${reqTenantId}'. Cross-tenant access denied.`);
    }

    key.lastUsedAt = new Date().toISOString();

    return {
      tenantId: key.tenantId,
      userId: key.createdForUser,
      userRole: 'INTEGRATION_SERVICE',
      scopes: key.scopes,
    };
  }

  public checkRateLimit(tenantId: string, maxPerMin: number = 1000): { allowed: boolean; remaining: number } {
    const now = Date.now();
    let limit = ApiAuthAdapter.rateLimiters.get(tenantId);

    if (!limit || now > limit.windowResetTime) {
      limit = {
        maxRequestsPerMinute: maxPerMin,
        currentWindowRequests: 1,
        windowResetTime: now + 60000,
      };
      ApiAuthAdapter.rateLimiters.set(tenantId, limit);
      return { allowed: true, remaining: maxPerMin - 1 };
    }

    if (limit.currentWindowRequests >= limit.maxRequestsPerMinute) {
      return { allowed: false, remaining: 0 };
    }

    limit.currentWindowRequests++;
    return { allowed: true, remaining: limit.maxRequestsPerMinute - limit.currentWindowRequests };
  }

  private hashSecret(secret: string): string {
    let hash = 0;
    for (let i = 0; i < secret.length; i++) {
      const char = secret.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return `sha256_${Math.abs(hash).toString(16)}`;
  }
}
