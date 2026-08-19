// ==================== APPROVAL CHAIN MANAGER ====================
// Domain engine managing multi-tier approvals, delegations, escalations, and SLAs.

import { ApprovalTask } from '../types/workflowTypes';

export class ApprovalChainManager {
  private static delegations: Map<string, { delegatorId: string; delegateId: string; startDate: string; endDate: string; reason: string }> = new Map();

  public static addDelegation(tenantId: string, delegatorId: string, delegateId: string, startDate: string, endDate: string, reason: string) {
    this.delegations.set(`${tenantId}:${delegatorId}`, { delegatorId, delegateId, startDate, endDate, reason });
  }

  public static getEffectiveApprover(tenantId: string, userId: string): string {
    const del = this.delegations.get(`${tenantId}:${userId}`);
    if (!del) return userId;

    const now = new Date().getTime();
    const start = new Date(del.startDate).getTime();
    const end = new Date(del.endDate).getTime();

    if (now >= start && now <= end) {
      return del.delegateId;
    }
    return userId;
  }

  public static checkSlaBreached(task: ApprovalTask): boolean {
    const now = new Date().getTime();
    const expires = new Date(task.slaExpiresAt).getTime();
    return now > expires && task.status === 'PENDING';
  }
}
