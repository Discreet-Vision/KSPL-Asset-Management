import React, { useState } from 'react';
import { 
  ShieldCheck, AlertCircle, RefreshCw, Sliders, CheckCircle2, 
  Search, Play, Activity, AlertTriangle, Layers, FileCode2, Clock, Check
} from 'lucide-react';
import { 
  CiQualityRecord, 
  ClassQualityRuleConfig, 
  QualityScanSummary, 
  DataQualityAlert 
} from './types';
import { dataQualityScoringEngine } from './qualityEngine';

export const DataQualityDashboardModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'ci_table' | 'rule_builder' | 'scans_api'>('overview');

  // Engine State
  const [qualityRecords, setQualityRecords] = useState<CiQualityRecord[]>(
    dataQualityScoringEngine.getQualityRecords() || []
  );
  const [classRules, setClassRules] = useState<ClassQualityRuleConfig[]>(
    dataQualityScoringEngine.getClassRules() || []
  );
  const [alerts, setAlerts] = useState<DataQualityAlert[]>(
    dataQualityScoringEngine.getAlerts() || []
  );
  const [lastScanSummary, setLastScanSummary] = useState<QualityScanSummary | null>(null);

  const safeQualityRecords = qualityRecords || [];
  const safeClassRules = classRules || [];
  const safeAlerts = alerts || [];

  // Selected CI for Detail Inspection Panel
  const [selectedCiRecord, setSelectedCiRecord] = useState<CiQualityRecord | null>(
    safeQualityRecords.length > 0 ? safeQualityRecords[0] : null
  );

  // Table Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Success message state
  const [msg, setMsg] = useState<string | null>(null);

  const handleRunScan = () => {
    const summary = dataQualityScoringEngine.runFullQualityScan();
    setLastScanSummary(summary);
    const updatedRecords = dataQualityScoringEngine.getQualityRecords() || [];
    setQualityRecords(updatedRecords);
    setAlerts(dataQualityScoringEngine.getAlerts() || []);
    if (updatedRecords.length > 0 && selectedCiRecord) {
      const refreshedSel = updatedRecords.find(r => r.ciId === selectedCiRecord.ciId);
      if (refreshedSel) setSelectedCiRecord(refreshedSel);
    }
    setMsg(`Completed full CMDB Data Quality Scan. Evaluated ${summary.totalCisEvaluated} CIs. Average Score: ${summary.avgQualityScore}%.`);
    setTimeout(() => setMsg(null), 4000);
  };

  const filteredRecords = safeQualityRecords.filter(r => {
    if (!r) return false;
    const name = r.ciName || '';
    const cls = r.ciClass || '';
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || r.breakdown?.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate Aggregates for Overview
  const totalCis = safeQualityRecords.length;
  const avgScore = totalCis > 0 
    ? Math.round(safeQualityRecords.reduce((acc, r) => acc + (r.breakdown?.overallScore || 0), 0) / totalCis) 
    : 0;
  const excellentCount = safeQualityRecords.filter(r => r.breakdown?.status === 'Excellent').length;
  const goodCount = safeQualityRecords.filter(r => r.breakdown?.status === 'Good').length;
  const needsImprovementCount = safeQualityRecords.filter(r => r.breakdown?.status === 'Needs Improvement').length;
  const poorCriticalCount = safeQualityRecords.filter(r => r.breakdown?.status === 'Poor' || r.breakdown?.status === 'Critical').length;
  const staleCount = safeQualityRecords.filter(r => r.breakdown?.verificationStatus === 'Stale').length;
  const conflictCount = safeQualityRecords.filter(r => (r.breakdown?.conflictPenaltyApplied || 0) > 0).length;

  return (
    <div className="bg-black text-white p-6 font-sans border border-red-900 shadow-2xl space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-red-900 pb-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-red-600 animate-pulse" />
            <h1 className="text-xl font-bold uppercase tracking-wider text-white">
              CMDB Data Quality Scoring & Health Engine
            </h1>
            <span className="text-xs bg-red-950 text-red-400 px-2 py-0.5 border border-red-800 font-mono">
              Scoring Engine v2026.8
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1 font-mono">
            Non-Destructive Attribute Evaluation • Completeness & Validity Rules • Discovery Freshness • Multi-Tenant Isolation
          </p>
        </div>

        {/* Header Tabs */}
        <div className="flex flex-wrap gap-1 mt-4 md:mt-0 border border-neutral-800 p-1 bg-neutral-950 font-mono text-xs">
          {(
            [
              ['overview', 'Health Overview'],
              ['ci_table', `CI Quality Table (${qualityRecords.length})`],
              ['rule_builder', 'Quality Rule Builder'],
              ['scans_api', 'Scheduled Scans & API']
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

      {msg && (
        <div className="p-3 bg-red-950 border border-red-700 text-red-200 text-xs font-mono flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-red-500" />
          <span>{msg}</span>
        </div>
      )}

      {/* TAB 1: CMDB HEALTH OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6 font-mono text-xs">
          {/* Executive Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            <div className="bg-neutral-950 border border-neutral-800 p-3 text-center space-y-1">
              <span className="text-[10px] text-neutral-500 uppercase">Total CIs</span>
              <div className="text-xl font-bold text-white">{totalCis}</div>
            </div>

            <div className="bg-neutral-950 border border-neutral-800 p-3 text-center space-y-1">
              <span className="text-[10px] text-neutral-500 uppercase">Avg Quality Score</span>
              <div className="text-xl font-bold text-red-500">{avgScore}%</div>
            </div>

            <div className="bg-neutral-950 border border-neutral-800 p-3 text-center space-y-1">
              <span className="text-[10px] text-neutral-500 uppercase">Excellent (90-100)</span>
              <div className="text-xl font-bold text-white">{excellentCount}</div>
            </div>

            <div className="bg-neutral-950 border border-neutral-800 p-3 text-center space-y-1">
              <span className="text-[10px] text-neutral-500 uppercase">Good (75-89)</span>
              <div className="text-xl font-bold text-neutral-300">{goodCount}</div>
            </div>

            <div className="bg-neutral-950 border border-neutral-800 p-3 text-center space-y-1">
              <span className="text-[10px] text-neutral-500 uppercase">Needs Improvement</span>
              <div className="text-xl font-bold text-red-400">{needsImprovementCount}</div>
            </div>

            <div className="bg-neutral-950 border border-neutral-800 p-3 text-center space-y-1">
              <span className="text-[10px] text-neutral-500 uppercase">Poor / Critical</span>
              <div className="text-xl font-bold text-red-600">{poorCriticalCount}</div>
            </div>

            <div className="bg-neutral-950 border border-neutral-800 p-3 text-center space-y-1">
              <span className="text-[10px] text-neutral-500 uppercase">Stale CIs</span>
              <div className="text-xl font-bold text-neutral-400">{staleCount}</div>
            </div>

            <div className="bg-neutral-950 border border-neutral-800 p-3 text-center space-y-1">
              <span className="text-[10px] text-neutral-500 uppercase">Field Conflicts</span>
              <div className="text-xl font-bold text-red-500">{conflictCount}</div>
            </div>
          </div>

          {/* Main 2-Column Dashboard Body */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Quality Distribution & Score Breakdown */}
            <div className="lg:col-span-7 bg-neutral-950 border border-neutral-800 p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-neutral-900 pb-3">
                <h2 className="text-sm font-bold uppercase text-white flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-red-600" />
                  <span>Quality Score Dimension Analysis</span>
                </h2>
                <button
                  onClick={handleRunScan}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-wider text-[10px]"
                >
                  Recalculate Health
                </button>
              </div>

              {/* Progress bars for dimensions */}
              <div className="space-y-3 bg-black border border-neutral-900 p-4">
                {[
                  { label: 'Required Field Completeness', pct: 92, note: '92% of required attributes populated' },
                  { label: 'Data Format Validity (IP/MAC)', pct: 96, note: 'Format checks passing WCAG/RFC standards' },
                  { label: 'Attribute Consistency Check', pct: 88, note: 'No brand/model inconsistencies detected' },
                  { label: 'Discovery Verification Freshness', pct: 75, note: '25% of records aging beyond 14 days' },
                  { label: 'Discovery Source Reliability', pct: 95, note: 'High agent/cloud verification coverage' }
                ].map((dim, i) => (
                  <div key={i} className="space-y-1 text-[11px]">
                    <div className="flex justify-between text-neutral-300">
                      <span>{dim.label}</span>
                      <span className="text-red-400 font-bold">{dim.pct}%</span>
                    </div>
                    <div className="w-full bg-neutral-900 h-2 border border-neutral-800">
                      <div className="bg-red-600 h-full" style={{ width: `${dim.pct}%` }} />
                    </div>
                    <div className="text-[9px] text-neutral-500">{dim.note}</div>
                  </div>
                ))}
              </div>

              {/* Historical Score Trend Bars */}
              <div className="bg-black border border-neutral-900 p-4 space-y-3">
                <div className="text-xs font-bold uppercase text-white border-b border-neutral-900 pb-2">
                  Historical Quality Trend (30-Day Evaluation Window)
                </div>
                <div className="flex items-end space-x-3 h-28 pt-4 justify-around border-b border-neutral-900 pb-2">
                  {[
                    { date: 'Week 1', score: 72 },
                    { date: 'Week 2', score: 78 },
                    { date: 'Week 3', score: 81 },
                    { date: 'Week 4', score: 86 },
                    { date: 'Current', score: avgScore || 88 }
                  ].map((bar, idx) => (
                    <div key={idx} className="flex flex-col items-center space-y-1">
                      <span className="text-[9px] text-red-400 font-bold">{bar.score}%</span>
                      <div className="w-8 bg-neutral-900 border border-neutral-800 relative h-20 flex items-end">
                        <div 
                          className="w-full bg-red-600 transition-all duration-500" 
                          style={{ height: `${bar.score}%` }} 
                        />
                      </div>
                      <span className="text-[9px] text-neutral-500">{bar.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Data Quality Alerts & Remediation */}
            <div className="lg:col-span-5 bg-neutral-950 border border-neutral-800 p-5 space-y-4">
              <div className="border-b border-neutral-900 pb-3 flex justify-between items-center">
                <h2 className="text-sm font-bold uppercase text-white flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span>Quality Degradation Alerts ({alerts.length})</span>
                </h2>
              </div>

              {alerts.length === 0 ? (
                <div className="p-6 bg-black border border-neutral-900 text-neutral-500 text-center">
                  No critical data quality alerts. All CIs meeting baseline threshold (60%+).
                </div>
              ) : (
                <div className="space-y-3">
                  {alerts.map((alt) => (
                    <div key={alt.id} className="bg-black border border-neutral-800 p-3 space-y-2">
                      <div className="flex justify-between items-center border-b border-neutral-900 pb-1">
                        <span className="font-bold text-white text-xs">{alt.ciName}</span>
                        <span className="text-[9px] bg-red-950 text-red-400 border border-red-900 px-1.5 py-0.5 font-bold uppercase">
                          {alt.severity} Severity
                        </span>
                      </div>
                      <p className="text-red-400 text-[10px]">{alt.message}</p>
                      <div className="text-neutral-400 text-[9px]">
                        <span className="text-neutral-500">Reason: </span>
                        {alt.triggerReason}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CI QUALITY TABLE & DETAIL INSPECTION */}
      {activeTab === 'ci_table' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-mono text-xs">
          {/* Left Table */}
          <div className="lg:col-span-7 bg-neutral-950 border border-neutral-800 p-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-900 pb-3">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter CIs by name or class..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-black border border-neutral-800 text-white text-xs pl-8 pr-3 py-1.5 focus:outline-none focus:border-red-600"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-black border border-neutral-800 text-white text-xs px-3 py-1.5"
              >
                <option value="ALL">All Statuses</option>
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Needs Improvement">Needs Improvement</option>
                <option value="Poor">Poor</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-800 bg-black text-[10px] text-neutral-400 uppercase">
                    <th className="p-2">CI Name</th>
                    <th className="p-2">Class</th>
                    <th className="p-2">Quality Score</th>
                    <th className="p-2">Freshness</th>
                    <th className="p-2">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-900">
                  {filteredRecords.map(rec => (
                    <tr 
                      key={rec.ciId} 
                      onClick={() => setSelectedCiRecord(rec)}
                      className={`hover:bg-neutral-900 cursor-pointer ${
                        selectedCiRecord?.ciId === rec.ciId ? 'bg-neutral-900 border-l-2 border-red-600' : ''
                      }`}
                    >
                      <td className="p-2 font-bold text-white text-xs">{rec.ciName}</td>
                      <td className="p-2 text-neutral-400">{rec.ciClass}</td>
                      <td className="p-2">
                        <span className={`px-2 py-0.5 text-[10px] font-bold border ${
                          rec.breakdown.overallScore >= 80 
                            ? 'bg-black text-white border-neutral-700' 
                            : 'bg-red-950 text-red-400 border-red-900'
                        }`}>
                          {rec.breakdown.overallScore}% ({rec.breakdown.status})
                        </span>
                      </td>
                      <td className="p-2 text-neutral-400 text-[10px]">{rec.breakdown.verificationStatus}</td>
                      <td className="p-2">
                        <button 
                          onClick={() => setSelectedCiRecord(rec)}
                          className="text-[9px] bg-red-600 text-white px-2 py-0.5 font-bold uppercase hover:bg-red-700"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Detail Inspection Panel */}
          <div className="lg:col-span-5 bg-neutral-950 border border-neutral-800 p-5 space-y-4">
            {selectedCiRecord ? (
              <div className="space-y-4">
                <div className="border-b border-neutral-900 pb-3 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-neutral-500 uppercase">Detailed CI Health Profile</span>
                    <h2 className="text-sm font-bold uppercase text-white">{selectedCiRecord.ciName}</h2>
                  </div>
                  <span className="text-xs bg-red-950 text-red-400 border border-red-900 px-2 py-1 font-bold">
                    Score: {selectedCiRecord.breakdown.overallScore}%
                  </span>
                </div>

                {/* Score Dimensional Breakdown Grid */}
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="bg-black border border-neutral-800 p-2.5">
                    <span className="text-neutral-500 uppercase">Completeness</span>
                    <div className="text-white font-bold text-xs mt-1">{selectedCiRecord.breakdown.completenessScore}%</div>
                  </div>

                  <div className="bg-black border border-neutral-800 p-2.5">
                    <span className="text-neutral-500 uppercase">Validity</span>
                    <div className="text-white font-bold text-xs mt-1">{selectedCiRecord.breakdown.validityScore}%</div>
                  </div>

                  <div className="bg-black border border-neutral-800 p-2.5">
                    <span className="text-neutral-500 uppercase">Consistency</span>
                    <div className="text-white font-bold text-xs mt-1">{selectedCiRecord.breakdown.consistencyScore}%</div>
                  </div>

                  <div className="bg-black border border-neutral-800 p-2.5">
                    <span className="text-neutral-500 uppercase">Freshness</span>
                    <div className="text-white font-bold text-xs mt-1">{selectedCiRecord.breakdown.freshnessScore}%</div>
                  </div>
                </div>

                {/* Detected Issues */}
                <div className="bg-black border border-neutral-800 p-3 space-y-2">
                  <div className="text-[10px] font-bold text-neutral-400 uppercase border-b border-neutral-900 pb-1">
                    Evaluated Issues & Findings
                  </div>
                  <div className="space-y-1">
                    {selectedCiRecord.breakdown.reasons.map((r, i) => (
                      <div key={i} className="text-[10px] text-red-400 flex items-start space-x-1.5">
                        <span className="font-bold">›</span>
                        <span>{r}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommended Actions */}
                <div className="bg-black border border-neutral-800 p-3 space-y-2">
                  <div className="text-[10px] font-bold text-neutral-400 uppercase border-b border-neutral-900 pb-1">
                    Recommended Remediation Steps
                  </div>
                  <div className="space-y-1">
                    {selectedCiRecord.breakdown.recommendedActions.map((act, i) => (
                      <div key={i} className="text-[10px] text-white flex items-start space-x-1.5">
                        <span className="text-red-500 font-bold">✓</span>
                        <span>{act}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-neutral-500 text-center">
                Select a CI record from the table to inspect detailed quality breakdown.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: QUALITY RULE BUILDER */}
      {activeTab === 'rule_builder' && (
        <div className="bg-neutral-950 border border-neutral-800 p-5 space-y-4 font-mono text-xs">
          <div className="border-b border-neutral-900 pb-3">
            <h2 className="text-sm font-bold uppercase text-white flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-red-600" />
              <span>CI Class Quality Rule Configuration</span>
            </h2>
            <p className="text-neutral-400 text-[11px] mt-1">
              Configure required fields, weighting percentages, freshness periods, and conflict penalties without altering underlying CI schemas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {classRules.map(rule => (
              <div key={rule.id} className="bg-black border border-neutral-800 p-4 space-y-3">
                <div className="flex justify-between items-center border-b border-neutral-900 pb-2">
                  <span className="text-white font-bold text-sm">Class: {rule.ciClass}</span>
                  <span className="text-[10px] text-neutral-500">{rule.id}</span>
                </div>

                <div>
                  <span className="text-[10px] text-neutral-500 uppercase">Configured Field Weightings:</span>
                  <div className="space-y-1.5 mt-2">
                    {rule.fieldWeights.map(fw => (
                      <div key={fw.fieldName} className="flex justify-between items-center text-[10px] bg-neutral-950 p-2 border border-neutral-900">
                        <span className="text-white font-bold">{fw.fieldName}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-neutral-400">{fw.validityFormat || 'String'}</span>
                          <span className="text-red-400 font-bold">{fw.weightPct}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] pt-2 border-t border-neutral-900 text-neutral-400">
                  <div>Freshness Policy: <strong className="text-white">{rule.freshnessDaysThresholds.goodDays} Days</strong></div>
                  <div>Conflict Penalty: <strong className="text-red-400">-{rule.conflictPenaltyPct}%</strong></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: SCHEDULED SCANS & API */}
      {activeTab === 'scans_api' && (
        <div className="bg-neutral-950 border border-neutral-800 p-5 space-y-4 font-mono text-xs max-w-4xl mx-auto">
          <div className="border-b border-neutral-900 pb-3">
            <h2 className="text-sm font-bold uppercase text-white flex items-center space-x-2">
              <FileCode2 className="w-4 h-4 text-red-600" />
              <span>Isolated Data Quality API & Scheduled Job Simulator</span>
            </h2>
          </div>

          <div className="bg-black border border-neutral-800 p-4 space-y-3">
            <div className="text-white font-bold text-xs uppercase">Simulate On-Demand API Endpoint GET /api/v1/data-quality/stats</div>
            <pre className="p-3 bg-neutral-950 border border-neutral-900 text-[10px] text-red-400 overflow-x-auto">
{JSON.stringify({
  tenantId: 'tenant-kspl-global',
  totalCisEvaluated: totalCis,
  avgQualityScore: avgScore,
  statusBreakdown: {
    excellent: excellentCount,
    good: goodCount,
    needsImprovement: needsImprovementCount,
    poorOrCritical: poorCriticalCount
  },
  staleCis: staleCount,
  conflictedCis: conflictCount,
  scannedAt: new Date().toISOString()
}, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
