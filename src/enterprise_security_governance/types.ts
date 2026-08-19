export type DataClassification = 
  | 'PUBLIC' 
  | 'INTERNAL' 
  | 'CONFIDENTIAL' 
  | 'RESTRICTED' 
  | 'PII' 
  | 'FINANCIAL' 
  | 'SECURITY_SENSITIVE';

export type FieldPermissionAction = 'VIEW' | 'CREATE' | 'UPDATE' | 'DELETE' | 'EXPORT' | 'MASK';

export type ComplianceFramework = 'SOC2_TYPE2' | 'ISO_27001' | 'SOX' | 'GDPR' | 'HIPAA_READINESS';

export type DataResidencyRegion = 'EU_GERMANY_FRANKFURT' | 'US_EAST_VIRGINIA' | 'APAC_INDIA_MUMBAI' | 'APAC_SINGAPORE';

export interface FieldRbacPolicy {
  id: string;
  roleName: string;
  moduleName: string;
  fieldName: string;
  classification: DataClassification;
  action: FieldPermissionAction;
  isAllowed: boolean;
  maskingFormat?: 'FULL_MASK' | 'PARTIAL_EMAIL' | 'PARTIAL_PHONE' | 'CURRENCY_MASK';
}

export interface PrivilegedMfaPolicy {
  id: string;
  roleName: 'Super Admin' | 'Tenant Admin' | 'Security Admin' | 'Finance Admin';
  enforcementLevel: 'MANDATORY_HARDWARE_KEY' | 'MANDATORY_TOTP_WEBAUTHN' | 'OPTIONAL';
  mfaCoveragePercent: number;
  totalPrivilegedUsers: number;
  enforcedUsersCount: number;
}

export interface ImmutableSecurityAuditRecord {
  id: string;
  actor: string;
  tenantId: string;
  timestamp: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'MFA_CHANGE' | 'ROLE_CHANGE' | 'EXPORT' | 'SECURITY_POLICY_CHANGE';
  entityType: string;
  entityId: string;
  changedFields: string[];
  beforeValue?: string;
  afterValue?: string;
  ipAddress: string;
  hashChainSignature: string;
}

export interface SecurityVulnerabilityRecord {
  id: string;
  cveId: string;
  sourceTool: 'Snyk' | 'Dependabot' | 'Container Scanner' | 'Secret Scanner' | 'SAST';
  packageName: string;
  affectedVersion: string;
  fixedVersion: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  affectedCiId: string;
  affectedCiName: string;
  riskScore: number; // 0 - 100
  detectedAt: string;
  status: 'OPEN' | 'IN_REMEDIATION' | 'RESOLVED' | 'RISK_ACCEPTED';
}

export interface BackupDrRecord {
  id: string;
  backupType: 'Database_Snapshot' | 'Object_Storage_Vault' | 'Configuration_Archive';
  region: DataResidencyRegion;
  encryptionStatus: 'AES_256_GCM_ENVELOPE';
  sizeGb: number;
  rpoTargetMinutes: number;
  rtoTargetMinutes: number;
  lastBackupAt: string;
  lastRestoreTestAt: string;
  restoreTestResult: 'PASSED' | 'FAILED' | 'PENDING';
}

export interface ComplianceControlEvidence {
  id: string;
  controlId: string; // e.g. "CC6.1 - Access Control"
  framework: ComplianceFramework;
  controlName: string;
  status: 'COMPLIANT' | 'NEEDS_REVIEW' | 'GAP_DETECTED';
  evidenceSummary: string;
  lastAuditedAt: string;
}

export interface SecurityGovernanceStats {
  securityPostureScore: number; // 0 - 100
  mfaEnforcementPercent: number;
  criticalVulnerabilitiesCount: number;
  highVulnerabilitiesCount: number;
  auditChainIntegrityStatus: 'VERIFIED_INTACT' | 'CORRUPTED';
  backupRestoreStatus: 'HEALTHY' | 'DEGRADED';
  dataResidencyRegion: DataResidencyRegion;
}
