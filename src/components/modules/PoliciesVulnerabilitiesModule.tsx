import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldAlert,
  Bug,
  AlertTriangle,
  CheckCircle2,
  Lock,
  FileCheck2,
  X,
  Play,
  ArrowRight,
} from 'lucide-react';

export const PoliciesVulnerabilitiesModule: React.FC = () => {
  const {
    compliancePolicies,
    policyViolations,
    vulnerabilities,
    resolvePolicyViolation,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'violations' | 'rules' | 'cves'>('violations');

  const openViolations = policyViolations.filter((v) => v.status === 'Open');

  return (
    <div className="p-6 space-y-6 text-white font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-950 p-4 border border-zinc-800 rounded-lg">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-red-500" />
            <span>COMPLIANCE POLICY ENGINE & VULNERABILITY MANAGEMENT</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1 font-mono">
            Automated Policy Enforcement, Active Governance Violations, and CVE Risk Intelligence
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center space-x-2 bg-black p-1 border border-zinc-800 rounded font-mono text-xs">
          <button
            onClick={() => setActiveTab('violations')}
            className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
              activeTab === 'violations' ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Active Violations ({openViolations.length})
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
              activeTab === 'rules' ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Enforcement Rules ({compliancePolicies.length})
          </button>
          <button
            onClick={() => setActiveTab('cves')}
            className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
              activeTab === 'cves' ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Vulnerabilities & CVEs ({vulnerabilities.length})
          </button>
        </div>
      </div>

      {/* TAB 1: ACTIVE VIOLATIONS */}
      {activeTab === 'violations' && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden font-mono text-xs">
          <div className="p-3 bg-black border-b border-zinc-800 text-zinc-400 font-bold flex justify-between">
            <span>ACTIVE POLICY VIOLATION INCIDENTS ({policyViolations.length})</span>
            <span className="text-red-400 font-bold">Automated Remediation Workflows Active</span>
          </div>

          <table className="w-full text-left">
            <thead className="bg-zinc-900 text-zinc-400 border-b border-zinc-800 text-[10px] uppercase">
              <tr>
                <th className="p-3">Policy Rule</th>
                <th className="p-3">Affected CI</th>
                <th className="p-3">Severity</th>
                <th className="p-3">Violation Details</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 text-zinc-300">
              {policyViolations.map((viol) => (
                <tr key={viol.id} className="hover:bg-zinc-900">
                  <td className="p-3 font-bold text-white">{viol.policyName}</td>
                  <td className="p-3 text-red-400 font-bold">{viol.ciName}</td>
                  <td className="p-3">
                    <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                      {viol.severity}
                    </span>
                  </td>
                  <td className="p-3 text-zinc-300 max-w-xs">{viol.details}</td>
                  <td className="p-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        viol.status === 'Open'
                          ? 'bg-red-600 text-white border-red-500'
                          : 'bg-black text-zinc-400 border-zinc-800'
                      }`}
                    >
                      {viol.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    {viol.status === 'Open' ? (
                      <button
                        onClick={() => resolvePolicyViolation(viol.id)}
                        className="bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold px-2.5 py-1 rounded border border-red-500 cursor-pointer"
                      >
                        Auto-Remediate Violation
                      </button>
                    ) : (
                      <span className="text-zinc-500 text-[10px]">Resolved</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: ENFORCEMENT RULES */}
      {activeTab === 'rules' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
          {compliancePolicies.map((pol) => (
            <div key={pol.id} className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-2">
              <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                <span className="font-bold text-white text-sm">{pol.name}</span>
                <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                  {pol.severity}
                </span>
              </div>
              <p className="text-zinc-400">{pol.description}</p>
              <div className="text-zinc-500 text-[10px]">
                Target Category: <span className="text-white font-bold">{pol.category}</span>
              </div>
              <div className="p-2 bg-black border border-zinc-800 rounded text-[10px] text-zinc-400">
                Rule Logic: Automatic evaluation every 15 mins against CMDB CIs.
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: VULNERABILITIES & CVES */}
      {activeTab === 'cves' && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden font-mono text-xs">
          <div className="p-3 bg-black border-b border-zinc-800 text-zinc-400 font-bold flex justify-between">
            <span>CVE VULNERABILITY MATRIX & PATCHING STATUS ({vulnerabilities.length})</span>
            <span className="text-red-400 font-bold">NIST NVD Feed Integrated</span>
          </div>

          <table className="w-full text-left">
            <thead className="bg-zinc-900 text-zinc-400 border-b border-zinc-800 text-[10px] uppercase">
              <tr>
                <th className="p-3">CVE Identifier</th>
                <th className="p-3">Title / Threat Description</th>
                <th className="p-3">Affected Product</th>
                <th className="p-3">CVSS Score</th>
                <th className="p-3">Severity</th>
                <th className="p-3">Affected CIs Count</th>
                <th className="p-3">Patch Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 text-zinc-300">
              {vulnerabilities.map((v) => (
                <tr key={v.cveId} className="hover:bg-zinc-900">
                  <td className="p-3 font-bold text-red-400">{v.cveId}</td>
                  <td className="p-3 text-white font-bold max-w-xs">{v.title}</td>
                  <td className="p-3 text-zinc-300">{v.affectedProduct}</td>
                  <td className="p-3 font-bold text-white">{v.cvssScore} / 10.0</td>
                  <td className="p-3">
                    <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                      {v.severity}
                    </span>
                  </td>
                  <td className="p-3 font-bold text-white">{v.affectedCiCount} CIs</td>
                  <td className="p-3">
                    <span className="bg-black border border-zinc-700 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                      {v.remediationStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
