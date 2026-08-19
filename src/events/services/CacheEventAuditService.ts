// ==================== CACHE & EVENT AUDIT SERVICE ====================
// Audit logger for administrative cache purges, DLQ replays, and topic configuration changes.

import { CacheEventAuditLog } from '../types/cacheEventTypes';

export class CacheEventAuditService {
  private static auditLogs: CacheEventAuditLog[] = [
    {
      id: 'aud-ce-001',
      timestamp: new Date().toISOString(),
      userId: 'USR-8801',
      tenantId: 'tenant-kspl-global',
      operation: 'CACHE_PURGE',
      details: 'Invalidated cache prefix "asset:ASSET-10025"',
      correlationId: 'corr-aud-991',
    },
  ];

  public static logActivity(log: Omit<CacheEventAuditLog, 'id' | 'timestamp'>): CacheEventAuditLog {
    const record: CacheEventAuditLog = {
      ...log,
      id: `aud-ce-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    this.auditLogs.unshift(record);
    return record;
  }

  public static getAuditLogs(tenantId: string): CacheEventAuditLog[] {
    return this.auditLogs.filter((a) => a.tenantId === tenantId);
  }
}
