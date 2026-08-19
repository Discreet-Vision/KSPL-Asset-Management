import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldAlert,
  Play,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Plus,
  X,
  Shield,
  RotateCcw,
  Search,
  FileCheck2,
  Bug,
  Sliders,
} from 'lucide-react';

export const PolicyRulesEngineModule: React.FC = () => {
  const {
    policyRules,
    policyViolations,
    resolvePolicyViolation,
    waivePolicyViolation,
    addPolicyRule,
    togglePolicyRule,
    evaluatePolicyRules,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'violations' | 'rules' | 'evaluator'>('violations');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  // Modals
  const [isNewRuleModalOpen, setIsNewRuleModalOpen] = useState(false);
  const [isWaiveModalOpen, setIsWaiveModalOpen] = useState(false);
  const [selectedViolation, setSelectedViolation] = useState<any>(null);

  // Form States
  const [ruleName, setRuleName] = useState('');
  const [ruleCategory, setRuleCategory] = useState<any>('Security');
  const [ruleSeverity, setRuleSeverity] = useState<any>('High');
  const [ruleDesc, setRuleDesc] = useState('');
  const [waiveRationale, setWaiveRationale] = useState('');

  const filteredViolations = policyViolations.filter((v) => {
    const matchesSearch =
      v.policyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.ciName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.details.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSeverity = severityFilter === 'All' || v.severity === severityFilter;

    return matchesSearch && matchesSeverity;
  });

  const openViolations = policyViolations.filter((v) => v.status === 'Open' || v.status === 'In Remediation');
  const criticalCount = policyViolations.filter((v) => v.severity === 'Critical' && v.status === 'Open').length;

  const handleRunScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      evaluatePolicyRules();
      setIsScanning(false);
    }, 1000);
  };

  const handleCreateRuleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleName) return;

    addPolicyRule({
      name: ruleName,
      category: ruleCategory,
      severity: ruleSeverity,
      description: ruleDesc,
      isEnabled: true,
    });

    setIsNewRuleModalOpen(false);
    setRuleName('');
    setRuleDesc('');
  };

  const handleWaiveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedViolation) return;
    waivePolicyViolation(selectedViolation.id, waiveRationale);
    setIsWaiveModalOpen(false);
    setSelectedViolation(null);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 text-white font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-950 p-4 border border-zinc-800 rounded-lg">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-red-500" />
            <span>POLICY RULES ENGINE & GOVERNANCE ENFORCEMENT</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1 font-mono">
            Automated Policy Evaluator, Security Violations Board & One-Click Remediation Workflows
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-black p-1 border border-zinc-800 rounded font-mono text-xs">
          <button
            onClick={() => setActiveTab('violations')}
            className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
              activeTab === 'violations' ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Violations ({openViolations.length})
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
              activeTab === 'rules' ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Rules Directory ({policyRules.length})
          </button>
          <button
            onClick={handleRunScan}
            disabled={isScanning}
            className="px-3 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-emerald-400 font-bold flex items-center space-x-1 cursor-pointer"
          >
            <Play className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Scanning CMDB...' : 'Run Live Policy Scan'}</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-lg">
          <div className="text-zinc-400 text-xs uppercase font-bold">Critical Policy Violations</div>
          <div className="text-2xl font-black text-red-500 mt-1">{criticalCount} Open Incidents</div>
          <div className="text-[11px] text-red-400 mt-1">Requires immediate remediation</div>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-lg">
          <div className="text-zinc-400 text-xs uppercase font-bold">Active Governance Rules</div>
          <div className="text-2xl font-black text-white mt-1">{policyRules.filter((r) => r.isEnabled).length} Enabled</div>
          <div className="text-[11px] text-zinc-400 mt-1">Continuous evaluation engine</div>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-lg">
          <div className="text-zinc-400 text-xs uppercase font-bold">Total Violations Tracked</div>
          <div className="text-2xl font-black text-white mt-1">{policyViolations.length} Events</div>
          <div className="text-[11px] text-emerald-400 mt-1">
            {policyViolations.filter((v) => v.status === 'Resolved').length} Resolved
          </div>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-lg">
          <div className="text-zinc-400 text-xs uppercase font-bold">Overall Compliance Score</div>
          <div className="text-2xl font-black text-emerald-400 mt-1">92.8%</div>
          <div className="text-[11px] text-emerald-400 mt-1">Passes ISO / SOC2 benchmarks</div>
        </div>
      </div>

      {/* TAB 1: VIOLATIONS */}
      {activeTab === 'violations' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-950 p-3 border border-zinc-800 rounded-lg">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search policy rule, CI name, or details..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded pl-9 pr-3 py-1.5 text-white placeholder-zinc-500"
              />
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-zinc-400">Severity:</span>
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-white"
              >
                <option value="All">All Severities</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-zinc-900 text-zinc-400 border-b border-zinc-800 text-[10px] uppercase">
                <tr>
                  <th className="p-3">Policy Rule</th>
                  <th className="p-3">Affected CI</th>
                  <th className="p-3">Severity</th>
                  <th className="p-3">Violation Details</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Remediation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 text-zinc-300">
                {filteredViolations.map((viol) => (
                  <tr key={viol.id} className="hover:bg-zinc-900">
                    <td className="p-3 font-bold text-white">{viol.policyName}</td>
                    <td className="p-3 font-bold text-red-400">{viol.ciName}</td>
                    <td className="p-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        viol.severity === 'Critical'
                          ? 'bg-red-600 text-white font-bold'
                          : viol.severity === 'High'
                          ? 'bg-amber-600 text-black font-bold'
                          : 'bg-zinc-800 text-zinc-300'
                      }`}>
                        {viol.severity}
                      </span>
                    </td>
                    <td className="p-3 text-zinc-300 max-w-xs leading-relaxed">{viol.details}</td>
                    <td className="p-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        viol.status === 'Resolved'
                          ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                          : viol.status === 'Waived'
                          ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                          : 'bg-red-600/20 text-red-400 border border-red-500/30 animate-pulse'
                      }`}>
                        {viol.status}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      {viol.status !== 'Resolved' && viol.status !== 'Waived' && (
                        <>
                          <button
                            onClick={() => resolvePolicyViolation(viol.id, 'Automated Fix Applied')}
                            className="text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-2.5 py-1 rounded cursor-pointer"
                          >
                            Auto-Remediate
                          </button>
                          <button
                            onClick={() => {
                              setSelectedViolation(viol);
                              setIsWaiveModalOpen(true);
                            }}
                            className="text-[11px] font-bold text-zinc-400 hover:text-white bg-zinc-900 px-2 py-1 rounded cursor-pointer"
                          >
                            Waive
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: RULES DIRECTORY */}
      {activeTab === 'rules' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between bg-zinc-950 p-3 border border-zinc-800 rounded-lg">
            <span className="font-bold text-zinc-300">POLICY RULE DEFINITION DIRECTORY</span>
            <button
              onClick={() => setIsNewRuleModalOpen(true)}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded flex items-center space-x-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Policy Rule</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {policyRules.map((rule) => (
              <div key={rule.id} className="bg-zinc-950 border border-zinc-800 p-4 rounded-lg space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white">{rule.name}</h3>
                      <p className="text-[11px] text-zinc-400 mt-1">{rule.description}</p>
                    </div>

                    <button
                      onClick={() => togglePolicyRule(rule.id)}
                      className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase cursor-pointer ${
                        rule.isEnabled
                          ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-zinc-800 text-zinc-500'
                      }`}
                    >
                      {rule.isEnabled ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>

                  <div className="mt-3 flex items-center space-x-3 text-[11px]">
                    <span className="bg-zinc-900 text-zinc-300 px-2 py-0.5 rounded border border-zinc-800">
                      Category: {rule.category}
                    </span>
                    <span className="bg-red-950 text-red-400 px-2 py-0.5 rounded border border-red-900">
                      Severity: {rule.severity}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-900 flex justify-between items-center text-[11px]">
                  <span className="text-zinc-500">Violations Logged: {rule.violationsCount}</span>
                  <span className="text-emerald-400 font-bold">Continuous Rule Active</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CREATE POLICY RULE MODAL */}
      {isNewRuleModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg max-w-lg w-full p-5 space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 text-red-500" />
                <span>Create Custom Compliance Policy Rule</span>
              </h3>
              <button onClick={() => setIsNewRuleModalOpen(false)} className="text-zinc-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRuleSubmit} className="space-y-4">
              <div>
                <label className="block text-zinc-400 mb-1">Policy Rule Title</label>
                <input
                  type="text"
                  required
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                  placeholder="e.g. Unassigned Production Database Alert"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Category</label>
                <select
                  value={ruleCategory}
                  onChange={(e) => setRuleCategory(e.target.value as any)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-white font-mono"
                >
                  <option value="Security">Security</option>
                  <option value="Compliance">Compliance</option>
                  <option value="Financial">Financial</option>
                  <option value="Lifecycle">Lifecycle</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Severity Level</label>
                <select
                  value={ruleSeverity}
                  onChange={(e) => setRuleSeverity(e.target.value as any)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-white font-mono"
                >
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Description & Target Condition</label>
                <textarea
                  rows={3}
                  value={ruleDesc}
                  onChange={(e) => setRuleDesc(e.target.value)}
                  placeholder="Triggers when asset meets condition..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-white font-mono"
                />
              </div>

              <div className="pt-3 border-t border-zinc-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsNewRuleModalOpen(false)}
                  className="px-4 py-2 bg-zinc-900 text-zinc-300 rounded cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded cursor-pointer"
                >
                  Save Policy Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WAIVE VIOLATION MODAL */}
      {isWaiveModalOpen && selectedViolation && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg max-w-lg w-full p-5 space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <FileCheck2 className="w-4 h-4 text-blue-500" />
                <span>Grant Compliance Exception: {selectedViolation.policyName}</span>
              </h3>
              <button onClick={() => setIsWaiveModalOpen(false)} className="text-zinc-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleWaiveSubmit} className="space-y-4">
              <div>
                <p className="text-zinc-400">Affected CI: <span className="text-white font-bold">{selectedViolation.ciName}</span></p>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Exception Rationale & Expiration</label>
                <textarea
                  rows={3}
                  required
                  value={waiveRationale}
                  onChange={(e) => setWaiveRationale(e.target.value)}
                  placeholder="Approved exception due to legacy system dependency..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-white font-mono"
                />
              </div>

              <div className="pt-3 border-t border-zinc-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsWaiveModalOpen(false)}
                  className="px-4 py-2 bg-zinc-900 text-zinc-300 rounded cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white font-bold rounded cursor-pointer"
                >
                  Approve Exception
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
