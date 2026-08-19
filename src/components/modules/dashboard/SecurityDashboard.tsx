import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import {
  ShieldAlert,
  Bug,
  Award,
  ShieldCheck,
  Lock,
  Flame,
  AlertTriangle,
  FileCheck2,
  KeyRound,
  Users,
  Activity,
  CheckCircle2,
  Trash2,
  ExternalLink,
} from 'lucide-react';

export const SecurityDashboard: React.FC = () => {
  const {
    vulnerabilities,
    policyViolations,
    disposalRecords,
    allUsers,
    setActiveModule,
  } = useApp();

  const safeVulns = vulnerabilities || [];
  const safeViolations = policyViolations || [];
  const safeDisposals = disposalRecords || [];
  const safeUsers = allUsers || [];

  const criticalCves = safeVulns.filter((v) => v && v.severity === 'Critical');
  const highCves = safeVulns.filter((v) => v && v.severity === 'High');
  const mediumCves = safeVulns.filter((v) => v && (v.severity === 'Medium' || v.severity === 'Low'));

  const openViolations = safeViolations.filter((v) => v && v.status === 'Open');
  const mfaEnabledUsers = safeUsers.filter((u) => u && u.mfaEnabled).length;
  const mfaAdoptionRate = Math.round((mfaEnabledUsers / (safeUsers.length || 1)) * 100);

  const nistWipes = safeDisposals.filter((d) => d && (d.sanitizationMethod?.includes('NIST') || d.certificateOfDestruction));

  return (
    <div className="space-y-6">
      {/* Security Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-950 p-4 border border-zinc-800 rounded-xl shadow-lg">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 bg-red-950 text-red-400 border border-red-800 rounded-md text-[10px] font-mono font-bold tracking-wider uppercase">
              SecOps & Asset Compliance Center
            </span>
            <span className="bg-zinc-800 text-zinc-300 border border-zinc-700 text-[10px] font-mono px-2 py-0.5 rounded">
              Zero-Trust Governance
            </span>
          </div>
          <h1 className="text-xl font-black text-white tracking-tight mt-1">
            SECURITY OPERATIONS & VULNERABILITY POSTURE
          </h1>
          <p className="text-xs text-zinc-400 font-mono">
            CVE Vulnerability Exposure, NIST 800-88 Sanitization Audits & Fleet Security Compliance
          </p>
        </div>

        {/* Quick SecOps Toolkit */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <button
            onClick={() => setActiveModule('vulnerabilities')}
            className="flex items-center space-x-1.5 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-colors shadow-md shadow-red-950"
          >
            <Bug className="w-3.5 h-3.5" />
            <span>CVE Assessment</span>
          </button>

          <button
            onClick={() => setActiveModule('security_mfa')}
            className="flex items-center space-x-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 hover:text-white px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>MFA Policy</span>
          </button>

          <button
            onClick={() => setActiveModule('compliance')}
            className="flex items-center space-x-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 hover:text-white px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-colors"
          >
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>Audit Proofs</span>
          </button>
        </div>
      </div>

      {/* Security Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Critical CVEs */}
        <div
          onClick={() => setActiveModule('vulnerabilities')}
          className="bg-zinc-950 border border-zinc-800 hover:border-red-500/50 p-4 rounded-xl transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">Critical CVEs</span>
            <Flame className="w-5 h-5 text-red-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-red-500 mt-2 flex items-center space-x-2">
            <span>{criticalCves.length}</span>
            {criticalCves.length > 0 && (
              <span className="bg-red-600 text-white text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                PATCH NOW
              </span>
            )}
          </div>
          <div className="text-[11px] text-zinc-400 font-mono mt-1 flex items-center space-x-2">
            <span className="text-amber-400">High: {highCves.length}</span>
            <span>•</span>
            <span>Med: {mediumCves.length}</span>
          </div>
        </div>

        {/* Security Policy Violations */}
        <div
          onClick={() => setActiveModule('policies')}
          className="bg-zinc-950 border border-zinc-800 hover:border-red-500/50 p-4 rounded-xl transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">Open Violations</span>
            <ShieldAlert className="w-5 h-5 text-red-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-white mt-2">{openViolations.length} Rules</div>
          <div className="text-[11px] text-red-400 font-mono mt-1">
            Unencrypted Disks & Outdated OS
          </div>
        </div>

        {/* NIST 800-88 Sanitization */}
        <div
          onClick={() => setActiveModule('compliance')}
          className="bg-zinc-950 border border-zinc-800 hover:border-emerald-500/50 p-4 rounded-xl transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">NIST 800-88 Wipes</span>
            <FileCheck2 className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-white mt-2">{nistWipes.length} Assets</div>
          <div className="text-[11px] text-emerald-400 font-mono mt-1 font-bold">
            100% Cryptographically Certified
          </div>
        </div>

        {/* MFA Adoption Rate */}
        <div
          onClick={() => setActiveModule('security_mfa')}
          className="bg-zinc-950 border border-zinc-800 hover:border-emerald-500/50 p-4 rounded-xl transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">MFA Adoption</span>
            <ShieldCheck className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-white mt-2">{mfaAdoptionRate}%</div>
          <div className="text-[11px] text-zinc-400 font-mono mt-1">
            {mfaEnabledUsers} of {allUsers.length} Staff Enrolled
          </div>
        </div>
      </div>

      {/* Compliance Frameworks & Threat Surfaces */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Compliance Posture */}
        <div className="bg-zinc-950 p-4 border border-zinc-800 rounded-xl">
          <div className="font-bold text-sm text-white flex items-center space-x-2 border-b border-zinc-800 pb-3 mb-3">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Compliance Standard Coverage</span>
          </div>
          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between items-center bg-black/60 p-2 rounded border border-zinc-800/80">
              <span className="text-zinc-400">SOC 2 Type II:</span>
              <span className="text-emerald-400 font-bold">Compliant (100%)</span>
            </div>
            <div className="flex justify-between items-center bg-black/60 p-2 rounded border border-zinc-800/80">
              <span className="text-zinc-400">ISO/IEC 27001:</span>
              <span className="text-emerald-400 font-bold">Compliant (98%)</span>
            </div>
            <div className="flex justify-between items-center bg-black/60 p-2 rounded border border-zinc-800/80">
              <span className="text-zinc-400">NIST CSF 2.0:</span>
              <span className="text-emerald-400 font-bold">Aligned</span>
            </div>
            <div className="flex justify-between items-center bg-black/60 p-2 rounded border border-zinc-800/80">
              <span className="text-zinc-400">HIPAA Security Rule:</span>
              <span className="text-emerald-400 font-bold">Enforced</span>
            </div>
          </div>
        </div>

        {/* Security Quarantine */}
        <div className="bg-zinc-950 p-4 border border-zinc-800 rounded-xl">
          <div className="font-bold text-sm text-white flex items-center space-x-2 border-b border-zinc-800 pb-3 mb-3">
            <Lock className="w-4 h-4 text-red-500" />
            <span>Asset Lockdown & Disposal</span>
          </div>
          <div className="space-y-2 text-xs font-mono">
            <div className="bg-black/60 p-2 rounded border border-zinc-800/80 flex justify-between items-center">
              <span className="text-zinc-400">Total Retired/Disposed:</span>
              <span className="font-bold text-white">{disposalRecords.length} Items</span>
            </div>
            <div className="bg-black/60 p-2 rounded border border-zinc-800/80 flex justify-between items-center">
              <span className="text-zinc-400">Certificates of Destruction:</span>
              <span className="font-bold text-emerald-400">{nistWipes.length} Valid</span>
            </div>
            <div className="bg-black/60 p-2 rounded border border-zinc-800/80 flex justify-between items-center">
              <span className="text-zinc-400">Lost / Stolen Lockdowns:</span>
              <span className="font-bold text-red-400">0 Active</span>
            </div>
          </div>
        </div>

        {/* MFA Health */}
        <div className="bg-zinc-950 p-4 border border-zinc-800 rounded-xl">
          <div className="font-bold text-sm text-white flex items-center space-x-2 border-b border-zinc-800 pb-3 mb-3">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Multi-Factor Authentication</span>
          </div>
          <div className="space-y-3 text-xs font-mono">
            <div className="flex justify-between items-center">
              <span className="text-zinc-400">Tenant Enrollment:</span>
              <span className="font-bold text-emerald-400">{mfaAdoptionRate}%</span>
            </div>
            <div className="w-full bg-black h-2.5 rounded-full overflow-hidden border border-zinc-800">
              <div
                className="bg-emerald-500 h-full transition-all duration-500"
                style={{ width: `${mfaAdoptionRate}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-zinc-400">
              TOTP (Google & Microsoft Authenticator) enforced for all privileged administrative accounts.
            </p>
          </div>
        </div>
      </div>

      {/* Critical Vulnerabilities Action Table */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-4 border-b border-zinc-800 pb-3">
          <div className="flex items-center space-x-2">
            <Flame className="w-4 h-4 text-red-500" />
            <h3 className="font-bold text-sm text-white uppercase tracking-wider">
              Critical & High CVE Vulnerability Remediation Queue
            </h3>
          </div>
          <button
            onClick={() => setActiveModule('vulnerabilities')}
            className="text-xs text-red-400 hover:text-white font-mono underline cursor-pointer"
          >
            All Vulnerabilities →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="bg-black text-zinc-400 border-b border-zinc-800 uppercase text-[10px] tracking-wider">
                <th className="p-3">CVE ID</th>
                <th className="p-3">Target Asset / CI</th>
                <th className="p-3">CVSS Score</th>
                <th className="p-3">Vulnerability Title</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 text-zinc-300">
              {vulnerabilities.slice(0, 5).map((v) => (
                <tr key={v.id} className="hover:bg-zinc-900 transition-colors">
                  <td className="p-3 font-bold text-red-400">{v.cveId}</td>
                  <td className="p-3 text-white font-medium">{v.affectedCiName}</td>
                  <td className="p-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      v.severity === 'Critical'
                        ? 'bg-red-600 text-white'
                        : 'bg-amber-600 text-black'
                    }`}>
                      {v.severity} ({v.cvssScore})
                    </span>
                  </td>
                  <td className="p-3 text-zinc-400">{v.title}</td>
                  <td className="p-3">
                    <span className="bg-black border border-red-500 text-red-400 text-[10px] px-2 py-0.5 rounded">
                      {v.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => setActiveModule('vulnerabilities')}
                      className="bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold px-2.5 py-1 rounded cursor-pointer transition-colors"
                    >
                      Remediate / Patch
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
