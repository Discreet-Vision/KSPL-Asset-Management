// ==================== WORKFLOW AUDIT SERVICE ====================
// Immutable workflow audit logging service recording all workflow creations, approvals, and rule changes.

import { WorkflowAuditRecord } from '../types/workflowTypes';

export class WorkflowAuditService {
  private static auditLogs: WorkflowAuditRecord[] = [];

  public static log(userId: string, tenantId: string, operation: string, details: string, correlationId: string = `corr-${Date.now()}`) {
    const record: WorkflowAuditRecord = {
      id: `audit-wf-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      userId,
      tenantId,
      operation,
      details,
      correlationId,
    };
    this.auditLogs.unshift(record);
  }

  public static getAuditLogs(tenantId: string): WorkflowAuditRecord[] {
    return this.auditLogs.filter((l) => l.tenantId === tenantId);
  }
}
