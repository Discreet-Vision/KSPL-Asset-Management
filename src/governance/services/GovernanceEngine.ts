// ==================== GOVERNANCE & IMMUTABLE AUDIT ENGINE ====================
// Implements Field-Level Permissions, PII Masking, Hash-Chained Immutable Audit Logs, and Policy Rules.

import {
  GovernanceClassificationLevel,
  FieldPermissionRule,
  ImmutableAuditRecord,
  GovernancePolicyRule,
  DataExportGovernanceLog,
  SecurityAccessMonitoringEvent,
} from '../types/governanceTypes';

export class GovernanceEngine {
  private static fieldPermissions: FieldPermissionRule[] = [
    { id: 'fp-1', moduleName: 'Hardware Assets', fieldName: 'Asset Name', classification: 'Internal', allowedRoles: ['All Users'], maskingPattern: 'Unmasked' },
    { id: 'fp-2', moduleName: 'Hardware Assets', fieldName: 'Serial Number', classification: 'Confidential', allowedRoles: ['System Administrator', 'IT Administrator', 'Asset Manager', 'Auditor'], maskingPattern: 'Unmasked' },
    { id: 'fp-3', moduleName: 'Financials', fieldName: 'Purchase Cost & Depreciation', classification: 'Confidential', allowedRoles: ['System Administrator', 'Finance Manager', 'Procurement Manager', 'Auditor'], maskingPattern: 'Financial Mask' },
    { id: 'fp-4', moduleName: 'Employees', fieldName: 'Employee Email & Phone', classification: 'Restricted', allowedRoles: ['System Administrator', 'IT Manager', 'Security Manager'], maskingPattern: 'Partial Mask (e.g. e***@domain)' },
    { id: 'fp-5', moduleName: 'Security', fieldName: 'API Keys & Secrets', classification: 'Highly Restricted', allowedRoles: ['System Administrator'], maskingPattern: 'Full Mask' },
  ];

  // Cryptographically Hash-Chained Immutable Audit Trail
  private static auditChain: ImmutableAuditRecord[] = [
    {
      id: 'aud-gen-101',
      sequenceNumber: 101,
      previousHash: '0000000000000000000000000000000000000000000000000000000000000000',
      currentHash: '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
      timestamp: '2026-08-11 11:00:00',
      userId: 'USR-8801',
      userName: 'Jitin (Admin)',
      userRole: 'System Administrator',
      tenantId: 'tenant-kspl-global',
      actionType: 'ROLE_CHANGE',
      module: 'Governance RBAC',
      recordId: 'USR-9012',
      field: 'role',
      oldValue: 'IT Administrator',
      newValue: 'Auditor',
      ipAddress: '10.0.12.44',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      correlationId: 'corr-aud-101',
      sourceSystem: 'KSPL Governance Engine',
      reason: 'Quarterly Security Audit Role Delegation',
      dataClassification: 'Restricted',
    },
    {
      id: 'aud-gen-102',
      sequenceNumber: 102,
      previousHash: '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
      currentHash: '3921764da66a19f4a0c8b35069a84d4b179e8c45d3e0988fa4e321528fbc0012',
      timestamp: '2026-08-11 11:15:00',
      userId: 'USR-8801',
      userName: 'Jitin (Admin)',
      userRole: 'System Administrator',
      tenantId: 'tenant-kspl-global',
      actionType: 'EXPORT',
      module: 'Financials & TCO',
      recordId: 'EXP-FIN-2026',
      field: 'Purchase Cost, TCO, Depreciation',
      newValue: '2,450 Financial Records Exported to CSV',
      ipAddress: '10.0.12.44',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      correlationId: 'corr-aud-102',
      sourceSystem: 'Export Governance Service',
      dataClassification: 'Confidential',
    },
  ];

  private static governancePolicies: GovernancePolicyRule[] = [
    {
      id: 'pol-1',
      policyName: 'Bulk Financial Export Safeguard',
      triggerCondition: 'Financial Export > 1,000 Records',
      requiredPermission: 'governance.export_financials',
      actionIfViolated: 'Require Step-Up Auth',
      isEnabled: true,
      tenantId: 'tenant-kspl-global',
    },
    {
      id: 'pol-2',
      policyName: 'PII Display Masking Rule',
      triggerCondition: 'Employee Email or Phone Displayed to Non-Admin',
      requiredPermission: 'governance.view_pii',
      actionIfViolated: 'Log Warning',
      isEnabled: true,
      tenantId: 'tenant-kspl-global',
    },
  ];

  private static exportLogs: DataExportGovernanceLog[] = [
    {
      id: 'exp-log-1',
      userId: 'USR-8801',
      userName: 'Jitin (Admin)',
      userRole: 'Finance Manager',
      exportFormat: 'CSV',
      moduleName: 'Asset Financial Report',
      recordCount: 2450,
      exportedFields: ['Purchase Cost', 'TCO', 'Depreciation'],
      highestClassification: 'Confidential',
      timestamp: '2026-08-11 11:15:00',
      ipAddress: '10.0.12.44',
      status: 'Approved & Logged',
      tenantId: 'tenant-kspl-global',
    },
  ];

  private static securityEvents: SecurityAccessMonitoringEvent[] = [
    {
      id: 'sec-evt-1',
      eventType: 'Unauthorized Field Access',
      severity: 'Medium',
      userId: 'USR-7701',
      ipAddress: '192.168.1.102',
      detectedAt: '2026-08-11 10:05:00',
      details: 'User with role "Employee" attempted to query REST field "purchase_cost". Field masked automatically.',
      tenantId: 'tenant-kspl-global',
    },
  ];

  public static getFieldPermissions(): FieldPermissionRule[] {
    return [...this.fieldPermissions];
  }

  public static getAuditChain(): ImmutableAuditRecord[] {
    return [...this.auditChain];
  }

  public static verifyAuditChainIntegrity(): { isValid: boolean; verifiedRecordsCount: number; brokenSequenceAt?: number } {
    for (let i = 1; i < this.auditChain.length; i++) {
      if (this.auditChain[i].previousHash !== this.auditChain[i - 1].currentHash) {
        return { isValid: false, verifiedRecordsCount: i, brokenSequenceAt: this.auditChain[i].sequenceNumber };
      }
    }
    return { isValid: true, verifiedRecordsCount: this.auditChain.length };
  }

  public static getGovernancePolicies(): GovernancePolicyRule[] {
    return [...this.governancePolicies];
  }

  public static getExportLogs(): DataExportGovernanceLog[] {
    return [...this.exportLogs];
  }

  public static getSecurityEvents(): SecurityAccessMonitoringEvent[] {
    return [...this.securityEvents];
  }

  public static maskPiiValue(value: string, classification: GovernanceClassificationLevel): string {
    if (classification === 'Public' || classification === 'Internal') return value;
    if (value.includes('@')) {
      const parts = value.split('@');
      return `${parts[0].substring(0, 2)}******@${parts[1]}`;
    }
    return `[RESTRICTED_${classification.toUpperCase()}]`;
  }
}
