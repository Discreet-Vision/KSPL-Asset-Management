import React, { useState } from 'react';
import { 
  ShieldCheck, Lock, Key, ShieldAlert, Eye, EyeOff, 
  Database, FileText, CheckCircle2, AlertTriangle, RefreshCw, 
  Server, Globe, Download, Fingerprint, Layers, Cpu
} from 'lucide-react';
import { 
  FieldRbacPolicy, 
  PrivilegedMfaPolicy, 
  ImmutableSecurityAuditRecord, 
  SecurityVulnerabilityRecord, 
  BackupDrRecord, 
  ComplianceControlEvidence, 
  SecurityGovernanceStats 
} from './types';
import { enterpriseSecurityAdapter } from './enterpriseSecurityAdapter';

export const EnterpriseSecurityDashboardModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'security_posture_and_mfa' | 'field_rbac_and_masking' | 'vulnerability_cve_correlation' | 'compliance_and_audit' | 'backup_dr_and_residency'
  >('security_posture_and_mfa');

  const [rbacPolicies] = useState<FieldRbacPolicy[]>(enterpriseSecurityAdapter.getRbacPolicies());
  const [mfaPolicies] = useState<PrivilegedMfaPolicy[]>(enterpriseSecurityAdapter.getMfaPolicies());
  const [auditTrail, setAuditTrail] = useState<ImmutableSecurityAuditRecord[]>(enterpriseSecurityAdapter.getAuditTrail());
  const [vulnerabilities] = useState<SecurityVulnerabilityRecord[]>(enterpriseSecurityAdapter.getVulnerabilities());
  const [backups, setBackups] = useState<BackupDrRecord[]>(enterpriseSecurityAdapter.getBackups());
  const [complianceEvidence] = useState<ComplianceControlEvidence[]>(enterpriseSecurityAdapter.getComplianceEvidence());
  const [stats, setStats] = useState<SecurityGovernanceStats>(enterpriseSecurityAdapter.getStats());

  // Interactive masking inspector state
  const [unmaskedValues, setUnmaskedValues] = useState<Record<string, boolean>>({});
  const [testingBackupId, setTestingBackupId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const toggleUnmask = (id: string) => {
    setUnmaskedValues(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleRunRestoreTest = (backupId: string) => {
    setTestingBackupId(backupId);
    setTimeout(() => {
      enterpriseSecurityAdapter.triggerRestoreTest(backupId);
      setBackups([...enterpriseSecurityAdapter.getBackups()]);
      setAuditTrail([...enterpriseSecurityAdapter.getAuditTrail()]);
      setStats(enterpriseSecurityAdapter.getStats());
      setTestingBackupId(null);
      setSuccessMsg(`Backup Restore Test verified successfully. Hash signature verified and integrity confirmed.`);
      setTimeout(() => setSuccessMsg(null), 4000);
    }, 1200);
  };

  return (
    <div className="bg-black text-white p-3 sm:p-6 font-sans border border-red-900 shadow-2xl space-y-4 sm:space-y-6 max-w-full overflow-x-hidden">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-red-900 pb-4 gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="w-3 h-3 bg-red-600 animate-pulse shrink-0" />
            <h1 className="text-base sm:text-xl font-bold uppercase tracking-wider text-white">
              Enterprise Security, Governance & Compliance Subsystem
            </h1>
            <span className="text-[10px] sm:text-xs bg-red-950 text-red-400 px-2 py-0.5 border border-red-800 font-mono">
              SOC 2 / ISO 27001 Alignment Ready
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-neutral-400 mt-1 font-mono leading-relaxed">
            Field-Level RBAC • Dynamic Data Masking • Privileged Admin MFA • Immutable Audit Hash-Chaining • CVE Correlation • Data Residency
          </p>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex flex-wrap gap-1 border border-neutral-800 p-1 bg-neutral-950 font-mono text-xs max-w-full overflow-x-auto">
          {(
            [
              ['security_posture_and_mfa', `MFA & Identity (${mfaPolicies.length})`],
              ['field_rbac_and_masking', `Field RBAC & Masking (${rbacPolicies.length})`],
              ['vulnerability_cve_correlation', `CVE Correlation (${vulnerabilities.length})`],
              ['compliance_and_audit', `SOC2 / Audit (${complianceEvidence.length})`],
              ['backup_dr_and_residency', `Backup & DR (${backups.length})`]
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-2.5 sm:px-3 py-1.5 uppercase tracking-wider transition-colors text-[10px] sm:text-xs whitespace-nowrap ${
                activeTab === key
                  ? 'bg-red-600 text-white font-bold'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {successMsg && (
        <div className="p-3 bg-red-950 border border-red-700 text-red-200 text-xs font-mono flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-red-500 shrink-0" />
          <span className="break-words">{successMsg}</span>
        </div>
      )}

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 font-mono text-xs">
        <div className="bg-neutral-950 border border-neutral-800 p-2.5 sm:p-3 text-center">
          <span className="text-[9px] sm:text-[10px] text-neutral-500 uppercase block truncate">Security Posture</span>
          <div className="text-lg sm:text-xl font-bold text-white mt-1">{stats.securityPostureScore} / 100</div>
        </div>

        <div className="bg-neutral-950 border border-neutral-800 p-2.5 sm:p-3 text-center">
          <span className="text-[9px] sm:text-[10px] text-neutral-500 uppercase block truncate">Privileged MFA</span>
          <div className="text-lg sm:text-xl font-bold text-white mt-1">{stats.mfaEnforcementPercent}%</div>
        </div>

        <div className="bg-neutral-950 border border-neutral-800 p-2.5 sm:p-3 text-center">
          <span className="text-[9px] sm:text-[10px] text-neutral-500 uppercase block truncate">Critical CVEs</span>
          <div className="text-lg sm:text-xl font-bold text-red-500 mt-1">{stats.criticalVulnerabilitiesCount}</div>
        </div>

        <div className="bg-neutral-950 border border-neutral-800 p-2.5 sm:p-3 text-center">
          <span className="text-[9px] sm:text-[10px] text-neutral-500 uppercase block truncate">Audit Chain</span>
          <div className="text-xs sm:text-sm font-bold text-white mt-1 uppercase truncate">{stats.auditChainIntegrityStatus}</div>
        </div>

        <div className="bg-neutral-950 border border-neutral-800 p-2.5 sm:p-3 text-center">
          <span className="text-[9px] sm:text-[10px] text-neutral-500 uppercase block truncate">Backup Health</span>
          <div className="text-xs sm:text-sm font-bold text-white mt-1 uppercase truncate">{stats.backupRestoreStatus}</div>
        </div>

        <div className="bg-neutral-950 border border-neutral-800 p-2.5 sm:p-3 text-center">
          <span className="text-[9px] sm:text-[10px] text-neutral-500 uppercase block truncate">Data Residency</span>
          <div className="text-[10px] sm:text-[11px] font-bold text-white mt-1 truncate">MUMBAI (APAC)</div>
        </div>
      </div>

      {/* TAB 1: SECURITY POSTURE & PRIVILEGED MFA */}
      {activeTab === 'security_posture_and_mfa' && (
        <div className="space-y-4 sm:space-y-6 font-mono text-xs">
          <div className="bg-neutral-950 border border-neutral-800 p-3 sm:p-5 space-y-4">
            <div className="border-b border-neutral-900 pb-2 font-bold uppercase text-white flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span>Privileged Admin MFA Enforcement Policies</span>
              <span className="text-[10px] text-neutral-400">WebAuthn / Passkeys / FIDO2 Hardware Key</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {mfaPolicies.map(pol => (
                <div key={pol.id} className="bg-black border border-neutral-800 p-3 sm:p-4 space-y-3">
                  <div className="flex justify-between items-start border-b border-neutral-900 pb-2 gap-2">
                    <div>
                      <span className="text-xs sm:text-sm font-bold text-white">{pol.roleName}</span>
                      <span className="text-[10px] text-neutral-400 block mt-1">ID: {pol.id}</span>
                    </div>

                    <span className="px-2 py-0.5 text-[9px] bg-red-950 text-red-400 border border-red-900 font-bold uppercase shrink-0">
                      {pol.mfaCoveragePercent}% Enforced
                    </span>
                  </div>

                  <div className="bg-neutral-950 p-2 border border-neutral-900 space-y-1 text-[10px] text-neutral-300">
                    <p><strong className="text-white">Enforcement Level: </strong>{pol.enforcementLevel}</p>
                    <p><strong className="text-white">Active Users: </strong>{pol.enforcedUsersCount} of {pol.totalPrivilegedUsers} users enrolled</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FIELD-LEVEL RBAC & DATA MASKING */}
      {activeTab === 'field_rbac_and_masking' && (
        <div className="space-y-4 sm:space-y-6 font-mono text-xs">
          <div className="bg-neutral-950 border border-neutral-800 p-3 sm:p-5 space-y-4">
            <div className="border-b border-neutral-900 pb-2 font-bold uppercase text-white flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span>Field-Level Authorization & Dynamic Data Masking Rules</span>
              <span className="text-[10px] text-neutral-400">REST API & UI Uniform Enforcement</span>
            </div>

            <div className="space-y-3">
              {rbacPolicies.map(pol => {
                const sampleRawMap: Record<string, string> = {
                  purchaseCostUsd: '₹18,000.00',
                  employeeSsn: 'SSN-990-12-8841',
                  apiSecretKey: 'sk_live_994827104812391024',
                  contactEmail: 'rajesh.kumar@enterprise.com'
                };
                const rawVal = sampleRawMap[pol.fieldName] || 'Sensitive Data Value';
                const maskedVal = enterpriseSecurityAdapter.applyFieldMasking(rawVal, pol.maskingFormat);
                const isUnmasked = !!unmaskedValues[pol.id];

                return (
                  <div key={pol.id} className="bg-black border border-neutral-800 p-3 sm:p-4 space-y-3">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-neutral-900 pb-2 gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-xs sm:text-sm font-bold text-white">{pol.roleName} ➔ {pol.moduleName}.{pol.fieldName}</span>
                        <span className="px-2 py-0.5 text-[8px] bg-red-950 text-red-400 border border-red-900 font-bold uppercase">
                          {pol.classification}
                        </span>
                      </div>

                      <span className="px-2 py-0.5 text-[9px] bg-black text-white border border-neutral-800 font-bold uppercase self-start sm:self-auto">
                        Action: {pol.action}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-neutral-950 p-3 border border-neutral-900 items-center">
                      <div className="break-all">
                        <span className="text-[9px] text-neutral-500 uppercase block">Field Masking Enforcement</span>
                        <span className="text-xs font-bold text-red-500">
                          {isUnmasked ? rawVal : maskedVal}
                        </span>
                      </div>

                      <div className="flex justify-start md:justify-end">
                        <button
                          onClick={() => toggleUnmask(pol.id)}
                          className="px-3 py-1 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-bold text-[9px] uppercase border border-neutral-800 flex items-center space-x-1"
                        >
                          {isUnmasked ? <EyeOff className="w-3 h-3 text-red-400" /> : <Eye className="w-3 h-3 text-neutral-400" />}
                          <span>{isUnmasked ? 'Re-Apply Mask' : 'Inspect Unmasked (Audited)'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: VULNERABILITY & CVE CORRELATION */}
      {activeTab === 'vulnerability_cve_correlation' && (
        <div className="space-y-4 sm:space-y-6 font-mono text-xs">
          <div className="bg-neutral-950 border border-neutral-800 p-3 sm:p-5 space-y-4">
            <div className="border-b border-neutral-900 pb-2 font-bold uppercase text-white flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span>CVE Correlation Engine & Security Risk Scoring</span>
              <span className="text-[10px] text-neutral-400">Snyk / Dependabot Automated Ingestion</span>
            </div>

            <div className="space-y-3">
              {vulnerabilities.map(vuln => (
                <div key={vuln.id} className="bg-black border border-neutral-800 p-3 sm:p-4 space-y-2">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-neutral-900 pb-2 gap-2">
                    <span className="text-xs sm:text-sm font-bold text-red-500">{vuln.cveId}: {vuln.packageName}</span>
                    <span className="px-2 py-0.5 text-[8px] bg-red-950 text-red-400 border border-red-900 font-bold uppercase self-start sm:self-auto">
                      Risk Score: {vuln.riskScore} / 100 ({vuln.severity})
                    </span>
                  </div>

                  <div className="bg-neutral-950 p-2 border border-neutral-900 text-[10px] text-neutral-300 space-y-1 break-all">
                    <p><strong className="text-white">Affected CI: </strong>{vuln.affectedCiName} ({vuln.affectedCiId})</p>
                    <p><strong className="text-white">Version Match: </strong>Installed {vuln.affectedVersion} ➔ Fixed in {vuln.fixedVersion}</p>
                    <p><strong className="text-white">Source Tool: </strong>{vuln.sourceTool} | Status: {vuln.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: COMPLIANCE & IMMUTABLE AUDIT */}
      {activeTab === 'compliance_and_audit' && (
        <div className="space-y-4 sm:space-y-6 font-mono text-xs">
          {/* SOC 2 / ISO 27001 Evidence */}
          <div className="bg-neutral-950 border border-neutral-800 p-3 sm:p-5 space-y-4">
            <div className="border-b border-neutral-900 pb-2 font-bold uppercase text-white">
              SOC 2 Type II / ISO 27001 Alignment Control Evidence
            </div>

            <div className="space-y-3">
              {complianceEvidence.map(ev => (
                <div key={ev.id} className="bg-black border border-neutral-800 p-3 sm:p-4 space-y-2">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-neutral-900 pb-2 gap-2">
                    <span className="text-xs sm:text-sm font-bold text-white">{ev.controlId}: {ev.controlName}</span>
                    <span className="px-2 py-0.5 text-[8px] bg-red-950 text-red-400 border border-red-900 font-bold uppercase self-start sm:self-auto">
                      {ev.status}
                    </span>
                  </div>

                  <p className="text-[10px] text-neutral-300 bg-neutral-950 p-2 border border-neutral-900 leading-relaxed">
                    {ev.evidenceSummary}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Hash-Chained Audit Trail */}
          <div className="bg-neutral-950 border border-neutral-800 p-3 sm:p-5 space-y-3">
            <span className="text-xs font-bold uppercase text-white block border-b border-neutral-900 pb-2">
              Immutable Append-Only Audit Trail (SHA-256 Signature Chained)
            </span>

            <div className="space-y-2">
              {auditTrail.map(aud => (
                <div key={aud.id} className="bg-black border border-neutral-800 p-3 space-y-1">
                  <div className="flex flex-col sm:flex-row justify-between text-[10px] gap-1">
                    <span className="text-red-500 font-bold">{aud.action} by {aud.actor}</span>
                    <span className="text-neutral-500">{aud.timestamp}</span>
                  </div>

                  <div className="bg-neutral-950 p-2 border border-neutral-900 text-[10px] text-neutral-300 break-all space-y-1">
                    <p><strong className="text-white">Entity: </strong>{aud.entityType} ({aud.entityId})</p>
                    <p><strong className="text-white">Changed Fields: </strong>{aud.changedFields.join(', ')}</p>
                    <p><strong className="text-white">Hash Signature: </strong><span className="text-neutral-400 font-mono text-[9px]">{aud.hashChainSignature}</span></p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: BACKUP, DR & RESIDENCY */}
      {activeTab === 'backup_dr_and_residency' && (
        <div className="space-y-4 sm:space-y-6 font-mono text-xs">
          <div className="bg-neutral-950 border border-neutral-800 p-3 sm:p-5 space-y-4">
            <div className="border-b border-neutral-900 pb-2 font-bold uppercase text-white">
              Automated Backup Governance & DR Restore Testing
            </div>

            <div className="space-y-3">
              {backups.map(bak => (
                <div key={bak.id} className="bg-black border border-neutral-800 p-3 sm:p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-neutral-900 pb-2 gap-2">
                    <span className="text-xs sm:text-sm font-bold text-white">{bak.backupType} ({bak.region})</span>
                    <span className="px-2 py-0.5 text-[8px] bg-red-950 text-red-400 border border-red-900 font-bold uppercase self-start sm:self-auto">
                      Test Result: {bak.restoreTestResult}
                    </span>
                  </div>

                  <div className="bg-neutral-950 p-2 border border-neutral-900 text-[10px] text-neutral-300 space-y-1">
                    <p><strong className="text-white">Encryption: </strong>{bak.encryptionStatus}</p>
                    <p><strong className="text-white">Targets: </strong>RPO {bak.rpoTargetMinutes}m | RTO {bak.rtoTargetMinutes}m | Size: {bak.sizeGb} GB</p>
                    <p><strong className="text-white">Last Backup: </strong>{bak.lastBackupAt} | Last Restore Test: {bak.lastRestoreTestAt}</p>
                  </div>

                  <div className="flex justify-end pt-2 border-t border-neutral-900">
                    <button
                      onClick={() => handleRunRestoreTest(bak.id)}
                      disabled={testingBackupId === bak.id}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white font-bold text-[9px] uppercase tracking-wider flex items-center justify-center space-x-1"
                    >
                      <RefreshCw className={`w-3 h-3 ${testingBackupId === bak.id ? 'animate-spin' : ''}`} />
                      <span>{testingBackupId === bak.id ? 'Running Restore Test...' : 'Run Automated Restore Verification'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
