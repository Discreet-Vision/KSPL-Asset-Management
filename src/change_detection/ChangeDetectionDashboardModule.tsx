import React, { useState } from 'react';
import { 
  GitCommit, AlertTriangle, ShieldCheck, CheckCircle2, Sliders, 
  Search, RefreshCw, FileText, Activity, Layers, ArrowRight, Lock
} from 'lucide-react';
import { 
  CiChangeRecord, 
  CiBaseline, 
  AuthorizationStatus, 
  DriftStatus 
} from './types';
import { changeDetectionEngine } from './changeEngine';
import { configurableReconciliationEngine } from '../reconciliation_engine/reconciliationEngine';

export const ChangeDetectionDashboardModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'change_records' | 'baselines' | 'drift_inspector'>('change_records');

  const [records, setRecords] = useState<CiChangeRecord[]>(changeDetectionEngine.getChangeRecords());
  const [baselines, setBaselines] = useState<CiBaseline[]>(changeDetectionEngine.getBaselines());
  const [stats, setStats] = useState(changeDetectionEngine.getSummaryStats());

  const canonicalCis = configurableReconciliationEngine.getCanonicalCis();
  const [selectedCiId, setSelectedCiId] = useState<string>(canonicalCis[0]?.id || 'ci-101');

  const [inspectedRecord, setInspectedRecord] = useState<CiChangeRecord | null>(records[0] || null);

  const [searchTerm, setSearchTerm] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // New Baseline Form
  const [newBaseClass, setNewBaseClass] = useState('Hardware');
  const [newBaseVersion, setNewBaseVersion] = useState('v3.0 Production Standard');

  const handleRunAnalysis = () => {
    const rec = changeDetectionEngine.runDriftAnalysisForCi(selectedCiId);
    setRecords(changeDetectionEngine.getChangeRecords());
    setStats(changeDetectionEngine.getSummaryStats());
    setInspectedRecord(rec);
    setSuccessMsg(`Executed state comparison for CI '${rec.ciName}'. Detected ${rec.fieldChanges.length} configuration shifts.`);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleUpdateAuthorization = (recId: string, status: AuthorizationStatus, driftStatus: DriftStatus) => {
    changeDetectionEngine.updateAuthorizationStatus(recId, status, driftStatus);
    setRecords([...changeDetectionEngine.getChangeRecords()]);
    setStats(changeDetectionEngine.getSummaryStats());
    setSuccessMsg(`Updated Change ${recId} status to '${status}' / '${driftStatus}'.`);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleCreateBaseline = () => {
    changeDetectionEngine.createBaseline(newBaseClass, newBaseVersion, {
      'Operating System': 'Linux RHEL 9.2 Enterprise',
      'Min RAM': '32 GB',
      'Required Security Agent': 'CrowdStrike Falcon v7.2 Active'
    });
    setBaselines([...changeDetectionEngine.getBaselines()]);
    setStats(changeDetectionEngine.getSummaryStats());
    setSuccessMsg(`Created new baseline '${newBaseVersion}' for CI class '${newBaseClass}'.`);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const filteredRecords = records.filter(r => 
    r.ciName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.ciClass.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.fieldChanges.some(f => f.fieldName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="bg-black text-white p-6 font-sans border border-red-900 shadow-2xl space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-red-900 pb-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-red-600 animate-pulse" />
            <h1 className="text-xl font-bold uppercase tracking-wider text-white">
              Change Detection & Configuration Drift Engine
            </h1>
            <span className="text-xs bg-red-950 text-red-400 px-2 py-0.5 border border-red-800 font-mono">
              Drift-Engine v2026.8
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1 font-mono">
            Field-Level State Difference • Baseline Compliance Verification • Unauthorized Change Risk Correlation
          </p>
        </div>

        {/* Sub-Tab Navigation */}
        <div className="flex flex-wrap gap-1 mt-4 md:mt-0 border border-neutral-800 p-1 bg-neutral-950 font-mono text-xs">
          {(
            [
              ['change_records', `Detected Changes (${records.length})`],
              ['drift_inspector', 'Single CI State Inspector'],
              ['baselines', `Approved Baselines (${baselines.length})`]
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-3 py-1.5 uppercase tracking-wider transition-colors ${
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
          <CheckCircle2 className="w-4 h-4 text-red-500" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Metric Cards Bar */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 font-mono text-xs">
        <div className="bg-neutral-950 border border-neutral-800 p-3 text-center">
          <span className="text-[10px] text-neutral-500 uppercase">Total Changes</span>
          <div className="text-xl font-bold text-white mt-1">{stats.totalChangesDetected}</div>
        </div>

        <div className="bg-neutral-950 border border-neutral-800 p-3 text-center">
          <span className="text-[10px] text-neutral-500 uppercase">Unauthorized</span>
          <div className="text-xl font-bold text-red-500 mt-1">{stats.unauthorizedCount}</div>
        </div>

        <div className="bg-neutral-950 border border-neutral-800 p-3 text-center">
          <span className="text-[10px] text-neutral-500 uppercase">Expected / Authorized</span>
          <div className="text-xl font-bold text-neutral-300 mt-1">{stats.expectedCount}</div>
        </div>

        <div className="bg-neutral-950 border border-neutral-800 p-3 text-center">
          <span className="text-[10px] text-neutral-500 uppercase">High Risk Score</span>
          <div className="text-xl font-bold text-red-400 mt-1">{stats.highCriticalRiskCount}</div>
        </div>

        <div className="bg-neutral-950 border border-neutral-800 p-3 text-center">
          <span className="text-[10px] text-neutral-500 uppercase">Open Configuration Drift</span>
          <div className="text-xl font-bold text-red-500 mt-1">{stats.openDriftCount}</div>
        </div>

        <div className="bg-neutral-950 border border-neutral-800 p-3 text-center">
          <span className="text-[10px] text-neutral-500 uppercase">Active Baselines</span>
          <div className="text-xl font-bold text-white mt-1">{stats.activeBaselinesCount}</div>
        </div>
      </div>

      {/* TAB 1: DETECTED CHANGE RECORDS & DRIFT REVIEW */}
      {activeTab === 'change_records' && (
        <div className="space-y-6 font-mono text-xs">
          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row justify-between gap-4 bg-neutral-950 border border-neutral-800 p-4">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by CI Name, Class, or Modified Field..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-black border border-neutral-800 pl-9 pr-4 py-2 text-white text-xs"
              />
            </div>

            <div className="flex items-center space-x-3">
              <select
                value={selectedCiId}
                onChange={(e) => setSelectedCiId(e.target.value)}
                className="bg-black border border-neutral-800 p-2 text-white text-xs"
              >
                {canonicalCis.map(c => (
                  <option key={c.id} value={c.id}>{c.ciName} ({c.ciClass})</option>
                ))}
              </select>

              <button
                onClick={handleRunAnalysis}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold uppercase text-[10px] flex items-center space-x-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Trigger Comparison</span>
              </button>
            </div>
          </div>

          {/* Table / Details Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Change Log Table */}
            <div className="lg:col-span-8 bg-neutral-950 border border-neutral-800 p-4 space-y-3">
              <div className="border-b border-neutral-900 pb-2 font-bold uppercase text-white flex justify-between items-center">
                <span>Detected Change Events Inventory</span>
                <span className="text-[10px] text-neutral-500 font-normal">Real-Time Discovery Differences</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-900 text-neutral-500 uppercase text-[9px]">
                      <th className="p-2">Timestamp</th>
                      <th className="p-2">CI Name / Class</th>
                      <th className="p-2">Field Changes</th>
                      <th className="p-2">Auth Status</th>
                      <th className="p-2">Risk</th>
                      <th className="p-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.map(rec => {
                      const isSelected = inspectedRecord?.id === rec.id;

                      return (
                        <tr
                          key={rec.id}
                          onClick={() => setInspectedRecord(rec)}
                          className={`border-b border-neutral-900 cursor-pointer transition-colors ${
                            isSelected ? 'bg-neutral-900 border-white' : 'hover:bg-neutral-900/50'
                          }`}
                        >
                          <td className="p-2 text-neutral-400">{rec.detectedAt}</td>
                          <td className="p-2 font-bold text-white">
                            {rec.ciName}
                            <div className="text-[9px] text-neutral-500 font-normal">{rec.ciClass}</div>
                          </td>
                          <td className="p-2 text-red-400 font-bold">
                            {rec.fieldChanges.length} Shift(s) Detected
                          </td>
                          <td className="p-2">
                            <span className={`px-2 py-0.5 text-[9px] font-bold border ${
                              rec.authorizationStatus === 'Unauthorized'
                                ? 'bg-red-950 text-red-500 border-red-900'
                                : rec.authorizationStatus === 'Authorized'
                                ? 'bg-black text-white border-neutral-800'
                                : 'bg-neutral-900 text-neutral-300 border-neutral-800'
                            }`}>
                              {rec.authorizationStatus}
                            </span>
                          </td>
                          <td className="p-2 font-bold text-red-500">{rec.riskScore}%</td>
                          <td className="p-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setInspectedRecord(rec);
                              }}
                              className="px-2 py-1 bg-black border border-neutral-800 hover:border-white text-white text-[9px] uppercase"
                            >
                              Inspect
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right: Change Detail & Remediation Inspector */}
            <div className="lg:col-span-4 bg-neutral-950 border border-neutral-800 p-5 space-y-4 text-[10px]">
              {inspectedRecord ? (
                <div className="space-y-4">
                  <div className="border-b border-neutral-900 pb-2">
                    <span className="text-neutral-500 uppercase">Change Record Inspector</span>
                    <h3 className="text-sm font-bold uppercase text-white mt-0.5">{inspectedRecord.ciName}</h3>
                    <div className="text-[9px] text-neutral-400 mt-1">Detected at: {inspectedRecord.detectedAt}</div>
                  </div>

                  {/* Before vs After Field Table */}
                  <div className="space-y-2">
                    <span className="text-neutral-500 uppercase font-bold">Field Difference Analysis</span>
                    {inspectedRecord.fieldChanges.map((f, i) => (
                      <div key={i} className="bg-black border border-neutral-900 p-3 space-y-1">
                        <div className="flex justify-between font-bold text-white">
                          <span>{f.fieldName}</span>
                          <span className="text-red-400">{f.severity} Severity</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-neutral-400 mt-2">
                          <div className="bg-neutral-950 p-2 border border-neutral-900">
                            <div className="text-[8px] text-neutral-600 uppercase">Previous State</div>
                            <div className="text-neutral-300 font-bold mt-0.5">{f.previousValue}</div>
                          </div>
                          <div className="bg-neutral-950 p-2 border border-red-950">
                            <div className="text-[8px] text-red-500 uppercase">Current Discovered</div>
                            <div className="text-white font-bold mt-0.5">{f.currentValue}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Remediation */}
                  <div className="bg-red-950 border border-red-900 p-3 space-y-1 text-red-200">
                    <span className="text-[9px] text-red-400 uppercase font-bold">Remediation Guidance</span>
                    <p className="mt-1 leading-relaxed">{inspectedRecord.remediationRecommendation}</p>
                  </div>

                  {/* Authorization Review Actions */}
                  <div className="space-y-2">
                    <span className="text-neutral-500 uppercase font-bold">Review & Authorization Workflow</span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleUpdateAuthorization(inspectedRecord.id, 'Authorized', 'Authorized Baseline')}
                        className="py-2 bg-black border border-neutral-800 hover:border-white text-white font-bold uppercase text-[9px]"
                      >
                        Authorize Change
                      </button>
                      <button
                        onClick={() => handleUpdateAuthorization(inspectedRecord.id, 'Unauthorized', 'Open Drift')}
                        className="py-2 bg-red-600 hover:bg-red-700 text-white font-bold uppercase text-[9px]"
                      >
                        Flag Unauthorized
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center text-neutral-500">
                  Select a change record from the inventory table to view Before vs After comparisons.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SINGLE CI STATE INSPECTOR */}
      {activeTab === 'drift_inspector' && (
        <div className="space-y-6 font-mono text-xs max-w-4xl mx-auto">
          <div className="bg-neutral-950 border border-neutral-800 p-5 space-y-4">
            <div className="border-b border-neutral-900 pb-3 flex justify-between items-center">
              <h2 className="text-sm font-bold uppercase text-white flex items-center space-x-2">
                <GitCommit className="w-4 h-4 text-red-600" />
                <span>Single CI State & Drift Inspector</span>
              </h2>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-neutral-500 uppercase">Select Target CI</label>
                <select
                  value={selectedCiId}
                  onChange={(e) => setSelectedCiId(e.target.value)}
                  className="w-full bg-black border border-neutral-800 p-2 text-white font-bold mt-1"
                >
                  {canonicalCis.map(c => (
                    <option key={c.id} value={c.id}>{c.ciName} ({c.ciClass})</option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleRunAnalysis}
                className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-wider"
              >
                Execute Field Comparison & Baseline Analysis
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: APPROVED BASELINES MANAGEMENT */}
      {activeTab === 'baselines' && (
        <div className="space-y-6 font-mono text-xs">
          {/* Create Baseline Form */}
          <div className="bg-neutral-950 border border-neutral-800 p-5 space-y-4">
            <div className="border-b border-neutral-900 pb-2 font-bold uppercase text-white">
              Create New Approved Configuration Baseline
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] text-neutral-500 uppercase">CI Class</label>
                <select
                  value={newBaseClass}
                  onChange={(e) => setNewBaseClass(e.target.value)}
                  className="w-full bg-black border border-neutral-800 p-2 text-white mt-1"
                >
                  <option value="Hardware">Hardware / Server</option>
                  <option value="Database">Database Engine</option>
                  <option value="Software">Application Software</option>
                  <option value="Cloud">Cloud Infrastructure</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-neutral-500 uppercase">Baseline Version Name</label>
                <input
                  type="text"
                  value={newBaseVersion}
                  onChange={(e) => setNewBaseVersion(e.target.value)}
                  className="w-full bg-black border border-neutral-800 p-2 text-white mt-1"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleCreateBaseline}
                  className="w-full py-2 bg-red-600 hover:bg-red-700 text-white font-bold uppercase text-[10px]"
                >
                  Save Baseline Configuration
                </button>
              </div>
            </div>
          </div>

          {/* Baseline List */}
          <div className="bg-neutral-950 border border-neutral-800 p-5 space-y-4">
            <div className="border-b border-neutral-900 pb-2 font-bold uppercase text-white">
              Active Baseline Inventory ({baselines.length})
            </div>

            <div className="space-y-3">
              {baselines.map(b => (
                <div key={b.id} className="bg-black border border-neutral-800 p-4 space-y-2">
                  <div className="flex justify-between items-center border-b border-neutral-900 pb-2">
                    <span className="font-bold text-white">{b.version} ({b.ciClass})</span>
                    <span className="text-[9px] text-neutral-500">Created by {b.createdBy} on {b.createdAt}</span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px]">
                    {Object.entries(b.approvedConfig).map(([key, val]) => (
                      <div key={key} className="bg-neutral-950 p-2 border border-neutral-900">
                        <span className="text-neutral-500 uppercase block text-[8px]">{key}</span>
                        <span className="text-white font-bold mt-0.5 block">{val}</span>
                      </div>
                    ))}
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
