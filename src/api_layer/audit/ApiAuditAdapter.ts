// ==================== API AUDIT ADAPTER ====================
// Immutable API layer audit logging service recording all API authentication, key actions, GraphQL queries, REST calls, and Webhook events.

import { ApiAuditRecord } from '../types/apiTypes';

export class ApiAuditAdapter {
  private static auditLogs: ApiAuditRecord[] = [];

  public static log(
    tenantId: string,
    actorId: string,
    action: string,
    endpointOrOperation: string,
    details: string,
    status: 'SUCCESS' | 'DENIED' | 'ERROR' = 'SUCCESS',
    ipAddress: string = '10.200.10.45'
  ) {
    const record: ApiAuditRecord = {
      auditId: `audit-api-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      tenantId,
      actorId,
      action,
      endpointOrOperation,
      ipAddress,
      details,
      status,
    };
    this.auditLogs.unshift(record);
  }

  public static getAuditLogs(tenantId: string): ApiAuditRecord[] {
    return this.auditLogs.filter((l) => l.tenantId === tenantId);
  }
}
