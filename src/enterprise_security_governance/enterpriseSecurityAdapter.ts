import { 
  DataClassification, 
  FieldRbacPolicy, 
  PrivilegedMfaPolicy, 
  ImmutableSecurityAuditRecord, 
  SecurityVulnerabilityRecord, 
  BackupDrRecord, 
  ComplianceControlEvidence, 
  SecurityGovernanceStats 
} from './types';

export class EnterpriseSecurityAdapter {
  private rbacPolicies: FieldRbacPolicy[] = [];
  private mfaPolicies: PrivilegedMfaPolicy[] = [];
  private auditTrail: ImmutableSecurityAuditRecord[] = [];
  private vulnerabilities: SecurityVulnerabilityRecord[] = [];
  private backups: BackupDrRecord[] = [];
  private complianceEvidence: ComplianceControlEvidence[] = [];

  constructor() {
    this.seedDefaultSecurityData();
  }

  private seedDefaultSecurityData() {
    // 1. Field-Level RBAC Policies & Masking Rules
    this.rbacPolicies = [
      { id: 'pol-01', roleName: 'IT Support Engineer', moduleName: 'Asset Management', fieldName: 'purchaseCostUsd', classification: 'FINANCIAL', action: 'MASK', isAllowed: true, maskingFormat: 'CURRENCY_MASK' },
      { id: 'pol-02', roleName: 'Finance Admin', moduleName: 'Asset Management', fieldName: 'purchaseCostUsd', classification: 'FINANCIAL', action: 'VIEW', isAllowed: true },
      { id: 'pol-03', roleName: 'Helpdesk Agent', moduleName: 'HRIS Integration', fieldName: 'employeeSsn', classification: 'PII', action: 'MASK', isAllowed: true, maskingFormat: 'FULL_MASK' },
      { id: 'pol-04', roleName: 'Security Admin', moduleName: 'Integrations', fieldName: 'apiSecretKey', classification: 'RESTRICTED', action: 'MASK', isAllowed: true, maskingFormat: 'FULL_MASK' },
      { id: 'pol-05', roleName: 'General Employee', moduleName: 'User Directory', fieldName: 'contactEmail', classification: 'PII', action: 'MASK', isAllowed: true, maskingFormat: 'PARTIAL_EMAIL' }
    ];

    // 2. Admin MFA Policies
    this.mfaPolicies = [
      { id: 'mfa-01', roleName: 'Super Admin', enforcementLevel: 'MANDATORY_HARDWARE_KEY', mfaCoveragePercent: 100, totalPrivilegedUsers: 4, enforcedUsersCount: 4 },
      { id: 'mfa-02', roleName: 'Tenant Admin', enforcementLevel: 'MANDATORY_TOTP_WEBAUTHN', mfaCoveragePercent: 100, totalPrivilegedUsers: 12, enforcedUsersCount: 12 },
      { id: 'mfa-03', roleName: 'Security Admin', enforcementLevel: 'MANDATORY_HARDWARE_KEY', mfaCoveragePercent: 100, totalPrivilegedUsers: 6, enforcedUsersCount: 6 },
      { id: 'mfa-04', roleName: 'Finance Admin', enforcementLevel: 'MANDATORY_TOTP_WEBAUTHN', mfaCoveragePercent: 95, totalPrivilegedUsers: 20, enforcedUsersCount: 19 }
    ];

    // 3. Immutable Hash-Chained Audit Trail
    this.auditTrail = [
      {
        id: 'aud-sec-9001',
        actor: 'security.admin@enterprise.com',
        tenantId: 'tenant-global-01',
        timestamp: '2026-08-11 23:45:10',
        action: 'MFA_CHANGE',
        entityType: 'PrivilegedMfaPolicy',
        entityId: 'mfa-01',
        changedFields: ['enforcementLevel'],
        beforeValue: 'MANDATORY_TOTP_WEBAUTHN',
        afterValue: 'MANDATORY_HARDWARE_KEY',
        ipAddress: '10.200.44.12',
        hashChainSignature: 'sha256:7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a'
      },
      {
        id: 'aud-sec-9002',
        actor: 'system.scanner@enterprise.com',
        tenantId: 'tenant-global-01',
        timestamp: '2026-08-11 23:50:00',
        action: 'SECURITY_POLICY_CHANGE',
        entityType: 'FieldRbacPolicy',
        entityId: 'pol-01',
        changedFields: ['action', 'maskingFormat'],
        beforeValue: 'VIEW',
        afterValue: 'MASK (CURRENCY_MASK)',
        ipAddress: '10.200.0.1',
        hashChainSignature: 'sha256:1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b'
      }
    ];

    // 4. Vulnerabilities & CVE Correlation Engine
    this.vulnerabilities = [
      {
        id: 'vuln-snyk-101',
        cveId: 'CVE-2026-3819',
        sourceTool: 'Snyk',
        packageName: 'openssl',
        affectedVersion: '3.0.2-0ubuntu1.10',
        fixedVersion: '3.0.2-0ubuntu1.12',
        severity: 'CRITICAL',
        affectedCiId: 'ci-srv-101',
        affectedCiName: 'mumbai-db-core-01.internal',
        riskScore: 92,
        detectedAt: '2026-08-01 10:00:00',
        status: 'OPEN'
      },
      {
        id: 'vuln-dep-202',
        cveId: 'CVE-2026-4401',
        sourceTool: 'Dependabot',
        packageName: 'express-jwt',
        affectedVersion: '6.0.0',
        fixedVersion: '7.7.5',
        severity: 'HIGH',
        affectedCiId: 'ci-vm-303',
        affectedCiName: 'aws-ec2-prod-api-cluster',
        riskScore: 78,
        detectedAt: '2026-08-05 14:30:00',
        status: 'IN_REMEDIATION'
      }
    ];

    // 5. Backup & DR Verification Records
    this.backups = [
      {
        id: 'bak-01',
        backupType: 'Database_Snapshot',
        region: 'APAC_INDIA_MUMBAI',
        encryptionStatus: 'AES_256_GCM_ENVELOPE',
        sizeGb: 850,
        rpoTargetMinutes: 15,
        rtoTargetMinutes: 60,
        lastBackupAt: '2026-08-11 23:30:00',
        lastRestoreTestAt: '2026-08-11 00:00:00',
        restoreTestResult: 'PASSED'
      },
      {
        id: 'bak-02',
        backupType: 'Object_Storage_Vault',
        region: 'APAC_INDIA_MUMBAI',
        encryptionStatus: 'AES_256_GCM_ENVELOPE',
        sizeGb: 3400,
        rpoTargetMinutes: 60,
        rtoTargetMinutes: 240,
        lastBackupAt: '2026-08-11 22:00:00',
        lastRestoreTestAt: '2026-08-10 12:00:00',
        restoreTestResult: 'PASSED'
      }
    ];

    // 6. SOC 2 / ISO 27001 Compliance Evidence
    this.complianceEvidence = [
      { id: 'comp-01', controlId: 'SOC2-CC6.1', framework: 'SOC2_TYPE2', controlName: 'Logical Access Controls & Field RBAC', status: 'COMPLIANT', evidenceSummary: 'Enforced field-level authorization and dynamic PII/Financial masking across REST APIs', lastAuditedAt: '2026-08-10' },
      { id: 'comp-02', controlId: 'ISO27001-A.9.4.2', framework: 'ISO_27001', controlName: 'Secure Log-on Procedures & Privileged MFA', status: 'COMPLIANT', evidenceSummary: '100% MFA coverage enforced via FIDO2 WebAuthn hardware keys for Super Admins', lastAuditedAt: '2026-08-11' },
      { id: 'comp-03', controlId: 'GDPR-Art.32', framework: 'GDPR', controlName: 'Security of Processing & Pseudonymization', status: 'COMPLIANT', evidenceSummary: 'AES-256 envelope encryption at rest with automated non-production PII sanitization', lastAuditedAt: '2026-08-09' }
    ];
  }

  // Getters
  public getRbacPolicies(): FieldRbacPolicy[] { return this.rbacPolicies; }
  public getMfaPolicies(): PrivilegedMfaPolicy[] { return this.mfaPolicies; }
  public getAuditTrail(): ImmutableSecurityAuditRecord[] { return this.auditTrail; }
  public getVulnerabilities(): SecurityVulnerabilityRecord[] { return this.vulnerabilities; }
  public getBackups(): BackupDrRecord[] { return this.backups; }
  public getComplianceEvidence(): ComplianceControlEvidence[] { return this.complianceEvidence; }

  // Stats
  public getStats(): SecurityGovernanceStats {
    const criticals = this.vulnerabilities.filter(v => v.severity === 'CRITICAL' && v.status === 'OPEN').length;
    const highs = this.vulnerabilities.filter(v => v.severity === 'HIGH' && v.status === 'OPEN').length;

    return {
      securityPostureScore: 96,
      mfaEnforcementPercent: 98.8,
      criticalVulnerabilitiesCount: criticals,
      highVulnerabilitiesCount: highs,
      auditChainIntegrityStatus: 'VERIFIED_INTACT',
      backupRestoreStatus: 'HEALTHY',
      dataResidencyRegion: 'APAC_INDIA_MUMBAI'
    };
  }

  // Masking Helper Function
  public applyFieldMasking(val: string, format?: FieldRbacPolicy['maskingFormat']): string {
    if (!val) return val;
    if (format === 'FULL_MASK') return '••••••••••••';
    if (format === 'CURRENCY_MASK') return '₹••••••';
    if (format === 'PARTIAL_EMAIL') {
      const parts = val.split('@');
      if (parts.length === 2) {
        return `${parts[0][0]}***@${parts[1]}`;
      }
      return '***@***.com';
    }
    if (format === 'PARTIAL_PHONE') {
      return `******${val.slice(-4)}`;
    }
    return val;
  }

  // Action: Trigger Backup Restore Test Verification
  public triggerRestoreTest(backupId: string): BackupDrRecord | undefined {
    const b = this.backups.find(x => x.id === backupId);
    if (b) {
      b.lastRestoreTestAt = new Date().toISOString().replace('T', ' ').substring(0, 19);
      b.restoreTestResult = 'PASSED';

      this.auditTrail.unshift({
        id: `aud-sec-${Math.floor(1000 + Math.random() * 9000)}`,
        actor: 'admin@enterprise.com',
        tenantId: 'tenant-global-01',
        timestamp: b.lastRestoreTestAt,
        action: 'SECURITY_POLICY_CHANGE',
        entityType: 'BackupDrRecord',
        entityId: backupId,
        changedFields: ['lastRestoreTestAt', 'restoreTestResult'],
        beforeValue: 'PENDING',
        afterValue: 'PASSED',
        ipAddress: '10.200.12.88',
        hashChainSignature: `sha256:${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`
      });
    }
    return b;
  }
}

export const enterpriseSecurityAdapter = new EnterpriseSecurityAdapter();
