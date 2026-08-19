// ==================== ANALYTICS ISOLATED PERMISSIONS ====================
// Defines granular permissions for the AI & Analytics Engine without modifying core RBAC.

import { AnalyticsPermissionSet } from '../types/analyticsTypes';

export const DEFAULT_ANALYTICS_PERMISSIONS: AnalyticsPermissionSet = {
  canView: true,
  canAnomalies: true,
  canForecasting: true,
  canRisk: true,
  canAiCopilot: true,
  canModels: true,
  canAdmin: true,
  canAudit: true,
};

export class AnalyticsPermissionValidator {
  public static validateAccess(userRole: string, permission: keyof AnalyticsPermissionSet): boolean {
    if (userRole === 'System Administrator' || userRole === 'ITAM Manager' || userRole === 'Admin') {
      return true;
    }
    if (permission === 'canView' || permission === 'canAiCopilot') {
      return true;
    }
    return false;
  }
}
