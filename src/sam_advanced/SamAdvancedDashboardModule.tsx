import React, { useState } from 'react';
import { 
  ShieldCheck, AlertTriangle, FileText, CheckCircle2, RefreshCw, 
  Search, Cpu, Lock, Layers, Server, Activity, ArrowRight, Download
} from 'lucide-react';
import { 
  SoftwareEntitlement, 
  EffectiveLicensePosition, 
  PublisherCompliancePack, 
  CanonicalMapping, 
  ShadowItApplication, 
  AuditSimulationResult, 
  SamSummaryStats, 
  PublisherPackType 
} from './types';
import { samAdvancedEngine } from './samEngine';

export const SamAdvancedDashboardModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'elp' | 'publisher_packs' | 'normalization' | 'shadow_it' | 'audit_simulation'
  >('elp');

  const [entitlements, setEntitlements] = useState<SoftwareEntitlement[]>(samAdvancedEngine.getEntitlements());
  const [elpRecords, setElpRecords] = useState<EffectiveLicensePosition[]>(samAdvancedEngine.getElpRecords());
  const [publisherPacks, setPublisherPacks] = useState<PublisherCompliancePack[]>(samAdvancedEngine.getPublisherPacks());
  const [normalizationQueue, setNormalizationQueue] = useState<CanonicalMapping[]>(samAdvancedEngine.getNormalizationQueue());
  const [shadowItApps, setShadowItApps] = useState<ShadowItApplication[]>(samAdvancedEngine.getShadowItApps());
  const [auditSimulations, setAuditSimulations] = useState<AuditSimulationResult[]>(samAdvancedEngine.getAuditSimulations());
  const [stats, setStats] = useState<SamSummaryStats>(samAdvancedEngine.getSummaryStats());

  const [selectedPublisherForSim, setSelectedPublisherForSim] = useState<PublisherPackType>('Oracle');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleRunAuditSim = () => {
    const res = samAdvancedEngine.runAuditSimulation(selectedPublisherForSim);
    setAuditSimulations([...samAdvancedEngine.getAuditSimulations()]);
    setStats(samAdvancedEngine.getSummaryStats());
    setSuccessMsg(`Simulated audit for ${selectedPublisherForSim}. Readiness Score: ${res.readinessScore}%.`);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleApproveNorm = (rawString: string) => {
    samAdvancedEngine.approveNormalization(rawString);
    setNormalizationQueue([...samAdvancedEngine.getNormalizationQueue()]);
    setSuccessMsg(`Approved normalization mapping for '${rawString}'.`);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleUpdateShadowItStatus = (appId: string, newStatus: ShadowItApplication['approvalStatus']) => {
    samAdvancedEngine.updateShadowItStatus(appId, newStatus);
    setShadowItApps([...samAdvancedEngine.getShadowItApps()]);
    setStats(samAdvancedEngine.getSummaryStats());
    setSuccessMsg(`Updated Shadow IT App status to '${newStatus}'.`);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  return (
    <div className="bg-black text-white p-6 font-sans border border-red-900 shadow-2xl space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-red-900 pb-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-red-600 animate-pulse" />
            <h1 className="text-xl font-bold uppercase tracking-wider text-white">
              Software Asset Management (SAM) Advanced Engine
            </h1>
            <span className="text-xs bg-red-950 text-red-400 px-2 py-0.5 border border-red-800 font-mono">
              ELP & Compliance v2026.8
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1 font-mono">
            Effective License Position • Publisher Compliance Packs • Canonical Normalization • SaaS Shadow-IT • Audit Simulation
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-1 mt-4 md:mt-0 border border-neutral-800 p-1 bg-neutral-950 font-mono text-xs">
          {(
            [
              ['elp', 'Effective License Position (ELP)'],
              ['publisher_packs', `Publisher Packs (${publisherPacks.length})`],
              ['normalization', `Normalization (${normalizationQueue.length})`],
              ['shadow_it', `SaaS / Shadow-IT (${shadowItApps.length})`],
              ['audit_simulation', `Audit Simulator (${auditSimulations.length})`]
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

      {/* Summary Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 font-mono text-xs">
        <div className="bg-neutral-950 border border-neutral-800 p-3 text-center">
          <span className="text-[10px] text-neutral-500 uppercase">Total Entitlements</span>
          <div className="text-xl font-bold text-white mt-1">{stats.totalEntitlements}</div>
        </div>

        <div className="bg-neutral-950 border border-neutral-800 p-3 text-center">
          <span className="text-[10px] text-neutral-500 uppercase">Monitored Products</span>
          <div className="text-xl font-bold text-white mt-1">{stats.totalProductsMonitored}</div>
        </div>

        <div className="bg-neutral-950 border border-neutral-800 p-3 text-center">
          <span className="text-[10px] text-neutral-500 uppercase">Compliant Products</span>
          <div className="text-xl font-bold text-red-500 mt-1">{stats.compliantCount}</div>
        </div>

        <div className="bg-neutral-950 border border-neutral-800 p-3 text-center">
          <span className="text-[10px] text-neutral-500 uppercase">Under-Licensed</span>
          <div className="text-xl font-bold text-red-400 mt-1">{stats.underLicensedCount}</div>
        </div>

        <div className="bg-neutral-950 border border-neutral-800 p-3 text-center">
          <span className="text-[10px] text-neutral-500 uppercase">Shadow-IT Apps</span>
          <div className="text-xl font-bold text-neutral-300 mt-1">{stats.shadowItAppsCount}</div>
        </div>

        <div className="bg-neutral-950 border border-neutral-800 p-3 text-center">
          <span className="text-[10px] text-neutral-500 uppercase">Audit Readiness</span>
          <div className="text-xl font-bold text-white mt-1">{stats.avgAuditReadinessScore}%</div>
        </div>
      </div>

      {/* TAB 1: EFFECTIVE LICENSE POSITION (ELP) */}
      {activeTab === 'elp' && (
        <div className="space-y-6 font-mono text-xs">
          {/* ELP Table */}
          <div className="bg-neutral-950 border border-neutral-800 p-5 space-y-4">
            <div className="border-b border-neutral-900 pb-2 font-bold uppercase text-white flex justify-between items-center">
              <span>Effective License Position (ELP) Reconciliation Ledger</span>
              <span className="text-[10px] text-neutral-500 font-normal">Owned Entitlements vs Discovered Consumption</span>
            </div>

            <div className="space-y-3">
              {elpRecords.map(elp => (
                <div key={elp.elpId} className="bg-black border border-neutral-800 p-4 space-y-3">
                  <div className="flex justify-between items-start border-b border-neutral-900 pb-2">
                    <div>
                      <span className="text-[10px] text-red-500 uppercase font-bold">{elp.publisher}</span>
                      <h3 className="font-bold text-white text-sm">{elp.product} ({elp.edition})</h3>
                    </div>
                    <span className={`px-2 py-0.5 text-[9px] font-bold border ${
                      elp.complianceStatus === 'Compliant'
                        ? 'bg-red-950 text-red-400 border-red-900'
                        : 'bg-red-900 text-white border-red-600'
                    }`}>
                      {elp.complianceStatus}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-[10px]">
                    <div className="bg-neutral-950 p-2 border border-neutral-900">
                      <span className="text-neutral-500 uppercase block">License Metric</span>
                      <span className="text-white font-bold">{elp.metric}</span>
                    </div>

                    <div className="bg-neutral-950 p-2 border border-neutral-900">
                      <span className="text-neutral-500 uppercase block">Owned Entitlements</span>
                      <span className="text-white font-bold">{elp.ownedQuantity}</span>
                    </div>

                    <div className="bg-neutral-950 p-2 border border-neutral-900">
                      <span className="text-neutral-500 uppercase block">Discovered Consumption</span>
                      <span className="text-white font-bold">{elp.consumedQuantity}</span>
                    </div>

                    <div className="bg-neutral-950 p-2 border border-neutral-900">
                      <span className="text-neutral-500 uppercase block">ELP Delta</span>
                      <span className={`font-bold ${elp.elpDelta < 0 ? 'text-red-500' : 'text-white'}`}>
                        {elp.elpDelta > 0 ? `+${elp.elpDelta}` : elp.elpDelta}
                      </span>
                    </div>

                    <div className="bg-neutral-950 p-2 border border-neutral-900">
                      <span className="text-neutral-500 uppercase block">Utilization Rate</span>
                      <span className="text-white font-bold">{elp.utilizationPercent}%</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-neutral-900 flex justify-between text-[9px] text-neutral-500">
                    <span>Applied Rule: {elp.ruleVersionUsed}</span>
                    <span>Calculated At: {elp.calculatedAt}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PUBLISHER COMPLIANCE PACKS */}
      {activeTab === 'publisher_packs' && (
        <div className="space-y-6 font-mono text-xs">
          <div className="bg-neutral-950 border border-neutral-800 p-5 space-y-4">
            <div className="border-b border-neutral-900 pb-2 font-bold uppercase text-white">
              Publisher-Specific Licensing Compliance Framework Packs
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {publisherPacks.map(pack => (
                <div key={pack.packId} className="bg-black border border-neutral-800 p-4 space-y-3">
                  <div className="flex justify-between items-start border-b border-neutral-900 pb-2">
                    <div>
                      <h3 className="font-bold text-white text-sm">{pack.publisher} Pack</h3>
                      <span className="text-[10px] text-red-500 font-bold">{pack.packVersion}</span>
                    </div>
                    <span className="px-2 py-0.5 text-[9px] bg-red-950 text-red-400 border border-red-900 font-bold">
                      {pack.status}
                    </span>
                  </div>

                  <p className="text-[10px] text-neutral-300 leading-relaxed bg-neutral-950 p-2 border border-neutral-900">
                    {pack.rulesDescription}
                  </p>

                  <div className="space-y-1 text-[10px] text-neutral-400">
                    <div className="flex justify-between">
                      <span className="text-neutral-500 uppercase">Effective Date:</span>
                      <span className="text-white">{pack.effectiveDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500 uppercase">Supported Metrics:</span>
                      <span className="text-neutral-300 font-bold">{pack.supportedMetrics.join(', ')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SOFTWARE NORMALIZATION REVIEW */}
      {activeTab === 'normalization' && (
        <div className="space-y-6 font-mono text-xs">
          <div className="bg-neutral-950 border border-neutral-800 p-5 space-y-4">
            <div className="border-b border-neutral-900 pb-2 font-bold uppercase text-white">
              Canonical Software Normalization Queue
            </div>

            <div className="space-y-3">
              {normalizationQueue.map((item, idx) => (
                <div key={idx} className="bg-black border border-neutral-800 p-4 space-y-3">
                  <div className="flex justify-between items-center border-b border-neutral-900 pb-2">
                    <div>
                      <span className="text-[9px] text-neutral-500 uppercase block">Raw Discovered String</span>
                      <span className="text-sm font-bold text-white font-mono">{item.rawString}</span>
                    </div>
                    <span className={`px-2 py-0.5 text-[9px] font-bold border ${
                      item.reviewStatus === 'Approved' || item.reviewStatus === 'Auto-Approved'
                        ? 'bg-red-950 text-red-400 border-red-900'
                        : 'bg-black text-white border-neutral-800'
                    }`}>
                      {item.reviewStatus} ({item.confidenceScore}% Confidence)
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[10px]">
                    <div className="bg-neutral-950 p-2 border border-neutral-900">
                      <span className="text-neutral-500 uppercase block">Publisher</span>
                      <span className="text-white font-bold">{item.publisher}</span>
                    </div>
                    <div className="bg-neutral-950 p-2 border border-neutral-900">
                      <span className="text-neutral-500 uppercase block">Product</span>
                      <span className="text-white font-bold">{item.product}</span>
                    </div>
                    <div className="bg-neutral-950 p-2 border border-neutral-900">
                      <span className="text-neutral-500 uppercase block">Edition / Version</span>
                      <span className="text-white font-bold">{item.edition} ({item.version})</span>
                    </div>
                    <div className="bg-neutral-950 p-2 border border-neutral-900">
                      <span className="text-neutral-500 uppercase block">Matching Method</span>
                      <span className="text-white font-bold">{item.matchingMethod}</span>
                    </div>
                  </div>

                  {item.reviewStatus === 'Pending Review' && (
                    <div className="flex justify-end space-x-2 pt-2 border-t border-neutral-900">
                      <button
                        onClick={() => handleApproveNorm(item.rawString)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white font-bold text-[9px] uppercase"
                      >
                        Approve Mapping
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SAAS / SHADOW-IT DISCOVERY */}
      {activeTab === 'shadow_it' && (
        <div className="space-y-6 font-mono text-xs">
          <div className="bg-neutral-950 border border-neutral-800 p-5 space-y-4">
            <div className="border-b border-neutral-900 pb-2 font-bold uppercase text-white">
              SaaS / Shadow-IT Discovery & Risk Classification
            </div>

            <div className="space-y-3">
              {shadowItApps.map(app => (
                <div key={app.appId} className="bg-black border border-neutral-800 p-4 space-y-3">
                  <div className="flex justify-between items-start border-b border-neutral-900 pb-2">
                    <div>
                      <h3 className="font-bold text-white text-sm">{app.appName} ({app.publisher})</h3>
                      <span className="text-[10px] text-neutral-500">{app.appUrl}</span>
                    </div>
                    <div className="flex space-x-2">
                      <span className={`px-2 py-0.5 text-[9px] font-bold border ${
                        app.riskLevel === 'High' || app.riskLevel === 'Critical'
                          ? 'bg-red-950 text-red-500 border-red-900'
                          : 'bg-black text-neutral-300 border-neutral-800'
                      }`}>
                        Risk: {app.riskLevel}
                      </span>
                      <span className="px-2 py-0.5 text-[9px] bg-neutral-900 text-white border border-neutral-800 font-bold">
                        Status: {app.approvalStatus}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[10px]">
                    <div className="bg-neutral-950 p-2 border border-neutral-900">
                      <span className="text-neutral-500 uppercase block">Discovery Source</span>
                      <span className="text-white font-bold">{app.discoverySource}</span>
                    </div>
                    <div className="bg-neutral-950 p-2 border border-neutral-900">
                      <span className="text-neutral-500 uppercase block">Active Users</span>
                      <span className="text-white font-bold">{app.userCount}</span>
                    </div>
                    <div className="bg-neutral-950 p-2 border border-neutral-900">
                      <span className="text-neutral-500 uppercase block">Est. Monthly Spend</span>
                      <span className="text-white font-bold">{app.estimatedMonthlySpend}</span>
                    </div>
                    <div className="bg-neutral-950 p-2 border border-neutral-900">
                      <span className="text-neutral-500 uppercase block">First / Last Seen</span>
                      <span className="text-neutral-300 text-[9px]">{app.firstSeen} to {app.lastSeen}</span>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-2 border-t border-neutral-900">
                    <button
                      onClick={() => handleUpdateShadowItStatus(app.appId, 'Approved')}
                      className="px-3 py-1 bg-black border border-neutral-800 hover:border-white text-white font-bold text-[9px] uppercase"
                    >
                      Approve App
                    </button>
                    <button
                      onClick={() => handleUpdateShadowItStatus(app.appId, 'Blocked')}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white font-bold text-[9px] uppercase"
                    >
                      Block & Restrict
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: AUDIT SIMULATOR & READINESS */}
      {activeTab === 'audit_simulation' && (
        <div className="space-y-6 font-mono text-xs">
          {/* Action Header */}
          <div className="bg-neutral-950 border border-neutral-800 p-5 space-y-4">
            <div className="border-b border-neutral-900 pb-2 font-bold uppercase text-white">
              Software Publisher Audit Simulator & Defense Packet Engine
            </div>

            <div className="flex flex-col md:flex-row gap-3 items-end">
              <div className="flex-1">
                <label className="text-[10px] text-neutral-500 uppercase block mb-1">Select Publisher to Simulate</label>
                <select
                  value={selectedPublisherForSim}
                  onChange={(e) => setSelectedPublisherForSim(e.target.value as PublisherPackType)}
                  className="w-full bg-black border border-neutral-800 p-2 text-white font-bold"
                >
                  <option value="Oracle">Oracle Corporation</option>
                  <option value="Microsoft">Microsoft Corporation</option>
                  <option value="SAP">SAP SE</option>
                  <option value="Adobe">Adobe Inc.</option>
                  <option value="IBM">IBM Corporation</option>
                </select>
              </div>

              <button
                onClick={handleRunAuditSim}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-wider text-[10px]"
              >
                Execute Audit Simulation
              </button>
            </div>
          </div>

          {/* Simulations List */}
          <div className="bg-neutral-950 border border-neutral-800 p-5 space-y-4">
            <div className="border-b border-neutral-900 pb-2 font-bold uppercase text-white">
              Historical Audit Readiness Simulations
            </div>

            <div className="space-y-3">
              {auditSimulations.map(sim => (
                <div key={sim.simulationId} className="bg-black border border-neutral-800 p-4 space-y-3">
                  <div className="flex justify-between items-start border-b border-neutral-900 pb-2">
                    <div>
                      <h3 className="font-bold text-white text-sm">{sim.publisher} Audit Simulation</h3>
                      <span className="text-[10px] text-neutral-500">{sim.ruleVersion}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-neutral-500 uppercase block">Readiness Score</span>
                      <span className="text-base font-bold text-red-500">{sim.readinessScore}%</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[10px]">
                    <div className="bg-neutral-950 p-2 border border-neutral-900">
                      <span className="text-neutral-500 uppercase block">Financial Exposure</span>
                      <span className="text-red-400 font-bold">{sim.estimatedFinancialExposure}</span>
                    </div>
                    <div className="bg-neutral-950 p-2 border border-neutral-900">
                      <span className="text-neutral-500 uppercase block">Under-Licensed Items</span>
                      <span className="text-white font-bold">{sim.findingsCount.underLicensed}</span>
                    </div>
                    <div className="bg-neutral-950 p-2 border border-neutral-900">
                      <span className="text-neutral-500 uppercase block">Unlicensed Deployments</span>
                      <span className="text-white font-bold">{sim.findingsCount.unlicensedDeployments}</span>
                    </div>
                    <div className="bg-neutral-950 p-2 border border-neutral-900">
                      <span className="text-neutral-500 uppercase block">Simulated Timestamp</span>
                      <span className="text-neutral-300 text-[9px]">{sim.simulatedAt}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-neutral-900">
                    <span className="text-[9px] text-neutral-500">Immutable Audit Snapshot ID: {sim.simulationId}</span>
                    <button className="px-3 py-1 bg-black border border-neutral-800 hover:border-white text-white font-bold text-[9px] uppercase flex items-center space-x-1">
                      <Download className="w-3 h-3 text-red-500" />
                      <span>Export Defense Packet</span>
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
