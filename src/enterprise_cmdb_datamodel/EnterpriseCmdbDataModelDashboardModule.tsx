import React, { useState } from 'react';
import { 
  Database, GitFork, Layers, FileCode, CheckCircle2, 
  ShieldAlert, DollarSign, Cpu, FileText, AlertTriangle, 
  Activity, ArrowRight, UserCheck, Plus, RefreshCw, Key
} from 'lucide-react';
import { 
  CiClass, 
  ConfigurationItem, 
  CiRelationship, 
  CanonicalProduct, 
  EffectiveLicensePosition, 
  ContractRecord, 
  DepreciationSchedule, 
  PolicyViolationRecord, 
  AuditLogRecord, 
  CmdbDataModelStats 
} from './types';
import { enterpriseCmdbAdapter } from './enterpriseCmdbAdapter';

export const EnterpriseCmdbDataModelDashboardModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'ci_classes_and_cis' | 'graph_relationships' | 'normalization_catalog' | 'licenses_and_elp' | 'governance_audit'
  >('ci_classes_and_cis');

  const [ciClasses] = useState<CiClass[]>(enterpriseCmdbAdapter.getCiClasses());
  const [CIs, setCIs] = useState<ConfigurationItem[]>(enterpriseCmdbAdapter.getCIs());
  const [relationships] = useState<CiRelationship[]>(enterpriseCmdbAdapter.getRelationships());
  const [canonicalProducts] = useState<CanonicalProduct[]>(enterpriseCmdbAdapter.getCanonicalProducts());
  const [elpPositions] = useState<EffectiveLicensePosition[]>(enterpriseCmdbAdapter.getEffectiveLicensePositions());
  const [contracts] = useState<ContractRecord[]>(enterpriseCmdbAdapter.getContracts());
  const [depreciations] = useState<DepreciationSchedule[]>(enterpriseCmdbAdapter.getDepreciationSchedules());
  const [policyViolations] = useState<PolicyViolationRecord[]>(enterpriseCmdbAdapter.getPolicyViolations());
  const [auditLogs] = useState<AuditLogRecord[]>(enterpriseCmdbAdapter.getAuditLogs());
  const [stats, setStats] = useState<CmdbDataModelStats>(enterpriseCmdbAdapter.getStats());

  // Form state to add new CI
  const [newCiName, setNewCiName] = useState('mumbai-app-srv-02.internal');
  const [selectedClassId, setSelectedClassId] = useState('cls-server');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleAddCi = () => {
    if (!newCiName.trim()) return;
    enterpriseCmdbAdapter.addConfigurationItem(
      newCiName,
      selectedClassId,
      'Manual Import / Admin Interface',
      { cpuCores: 32, ramGb: 256, os: 'Ubuntu 24.04 LTS' }
    );
    setCIs([...enterpriseCmdbAdapter.getCIs()]);
    setStats(enterpriseCmdbAdapter.getStats());
    setSuccessMsg(`Successfully registered new Configuration Item '${newCiName}' in Enterprise CMDB.`);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  return (
    <div className="bg-black text-white p-3 sm:p-6 font-sans border border-red-900 shadow-2xl space-y-4 sm:space-y-6 max-w-full overflow-x-hidden">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-red-900 pb-4 gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="w-3 h-3 bg-red-600 animate-pulse shrink-0" />
            <h1 className="text-base sm:text-xl font-bold uppercase tracking-wider text-white">
              Enterprise ITAM / CMDB Data Model Subsystem
            </h1>
            <span className="text-[10px] sm:text-xs bg-red-950 text-red-400 px-2 py-0.5 border border-red-800 font-mono">
              Schema Standard v2026.8
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-neutral-400 mt-1 font-mono leading-relaxed">
            Hierarchical CI Classes • JSONB Dynamic Schema • Directional Relationship Graph • Software Normalization & ELP • Financial Depreciation & Audit
          </p>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex flex-wrap gap-1 border border-neutral-800 p-1 bg-neutral-950 font-mono text-xs max-w-full overflow-x-auto">
          {(
            [
              ['ci_classes_and_cis', `Classes & CIs (${CIs.length})`],
              ['graph_relationships', `CI Graph (${relationships.length})`],
              ['normalization_catalog', `Canonical Catalog (${canonicalProducts.length})`],
              ['licenses_and_elp', `ELP Ledger (${elpPositions.length})`],
              ['governance_audit', `Audit & Violations (${policyViolations.length})`]
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
          <span className="text-[9px] sm:text-[10px] text-neutral-500 uppercase block truncate">CI Classes</span>
          <div className="text-lg sm:text-xl font-bold text-white mt-1">{stats.totalClassesCount}</div>
        </div>

        <div className="bg-neutral-950 border border-neutral-800 p-2.5 sm:p-3 text-center">
          <span className="text-[9px] sm:text-[10px] text-neutral-500 uppercase block truncate">Config Items</span>
          <div className="text-lg sm:text-xl font-bold text-white mt-1">{stats.totalCisCount}</div>
        </div>

        <div className="bg-neutral-950 border border-neutral-800 p-2.5 sm:p-3 text-center">
          <span className="text-[9px] sm:text-[10px] text-neutral-500 uppercase block truncate">Graph Links</span>
          <div className="text-lg sm:text-xl font-bold text-white mt-1">{stats.totalRelationshipsCount}</div>
        </div>

        <div className="bg-neutral-950 border border-neutral-800 p-2.5 sm:p-3 text-center">
          <span className="text-[9px] sm:text-[10px] text-neutral-500 uppercase block truncate">Software</span>
          <div className="text-lg sm:text-xl font-bold text-white mt-1">{stats.totalCanonicalProductsCount}</div>
        </div>

        <div className="bg-neutral-950 border border-neutral-800 p-2.5 sm:p-3 text-center">
          <span className="text-[9px] sm:text-[10px] text-neutral-500 uppercase block truncate">ELP Compliance</span>
          <div className="text-lg sm:text-xl font-bold text-white mt-1">{stats.elpCompliantPercent}%</div>
        </div>

        <div className="bg-neutral-950 border border-neutral-800 p-2.5 sm:p-3 text-center">
          <span className="text-[9px] sm:text-[10px] text-neutral-500 uppercase block truncate">Violations</span>
          <div className="text-lg sm:text-xl font-bold text-red-500 mt-1">{stats.policyViolationsCount}</div>
        </div>
      </div>

      {/* TAB 1: CI CLASSES & CONFIGURATION ITEMS */}
      {activeTab === 'ci_classes_and_cis' && (
        <div className="space-y-4 sm:space-y-6 font-mono text-xs">
          {/* Quick Registration Bar */}
          <div className="bg-neutral-950 border border-neutral-800 p-3 sm:p-4 space-y-3">
            <span className="text-xs font-bold uppercase text-white block border-b border-neutral-900 pb-2">
              Add Enterprise Configuration Item
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
              <div>
                <label className="text-[10px] text-neutral-500 uppercase block mb-1">CI Name / FQDN</label>
                <input
                  type="text"
                  value={newCiName}
                  onChange={(e) => setNewCiName(e.target.value)}
                  className="w-full bg-black border border-neutral-800 p-2 text-white font-bold text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] text-neutral-500 uppercase block mb-1">Hierarchical Class</label>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full bg-black border border-neutral-800 p-2 text-white font-bold text-xs"
                >
                  {ciClasses.map(cls => (
                    <option key={cls.id} value={cls.id}>{cls.name} ({cls.parentClassId || 'Root'})</option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleAddCi}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-wider text-[10px] flex items-center justify-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Register CI</span>
              </button>
            </div>
          </div>

          {/* CI Catalog */}
          <div className="bg-neutral-950 border border-neutral-800 p-3 sm:p-5 space-y-4">
            <div className="border-b border-neutral-900 pb-2 font-bold uppercase text-white">
              Enterprise Configuration Items & JSONB Attributes
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {CIs.map(ci => (
                <div key={ci.id} className="bg-black border border-neutral-800 p-3 sm:p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row justify-between items-start border-b border-neutral-900 pb-2 gap-2">
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-xs sm:text-sm font-bold text-white">{ci.name}</span>
                        <span className="px-2 py-0.5 text-[8px] bg-red-950 text-red-400 border border-red-900 font-bold uppercase">
                          {ci.className}
                        </span>
                      </div>
                      <span className="text-[10px] text-neutral-400 block mt-1">Source: {ci.discoverySource} (Confidence: {ci.confidenceScore}%)</span>
                    </div>

                    <span className="px-2 py-0.5 text-[9px] bg-black text-white border border-neutral-800 font-bold uppercase self-start sm:self-auto">
                      {ci.status}
                    </span>
                  </div>

                  <div className="bg-neutral-950 p-2 sm:p-3 border border-neutral-900 space-y-1 text-[10px] break-all">
                    <span className="text-[9px] text-neutral-500 uppercase font-bold block mb-1">Dynamic JSONB Attributes:</span>
                    {Object.entries(ci.attributes).map(([k, v]) => (
                      <p key={k} className="text-neutral-300">
                        <strong className="text-white">{k}: </strong>{String(v)}
                      </p>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between text-[9px] text-neutral-500 pt-1 border-t border-neutral-900 gap-1">
                    <span>Tenant: {ci.tenantId}</span>
                    <span>ID: {ci.id}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GRAPH RELATIONSHIPS */}
      {activeTab === 'graph_relationships' && (
        <div className="space-y-4 sm:space-y-6 font-mono text-xs">
          <div className="bg-neutral-950 border border-neutral-800 p-3 sm:p-5 space-y-4">
            <div className="border-b border-neutral-900 pb-2 font-bold uppercase text-white">
              CI Relationship Graph & Dependency Traversal
            </div>

            <div className="space-y-3">
              {relationships.map(rel => (
                <div key={rel.id} className="bg-black border border-neutral-800 p-3 sm:p-4 flex flex-col md:flex-row items-center justify-between gap-3">
                  <div className="bg-neutral-950 p-3 border border-neutral-900 text-center w-full md:w-5/12">
                    <span className="text-[9px] text-neutral-500 uppercase block">Source CI</span>
                    <span className="text-xs font-bold text-white">{rel.sourceCiName}</span>
                  </div>

                  <div className="text-center space-y-1">
                    <span className="px-3 py-1 bg-red-950 text-red-400 border border-red-900 font-bold text-[9px] uppercase whitespace-nowrap">
                      -- [{rel.relationshipType}] ---&gt;
                    </span>
                  </div>

                  <div className="bg-neutral-950 p-3 border border-neutral-900 text-center w-full md:w-5/12">
                    <span className="text-[9px] text-neutral-500 uppercase block">Target CI</span>
                    <span className="text-xs font-bold text-white">{rel.targetCiName}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: NORMALIZATION CATALOG */}
      {activeTab === 'normalization_catalog' && (
        <div className="space-y-4 sm:space-y-6 font-mono text-xs">
          <div className="bg-neutral-950 border border-neutral-800 p-3 sm:p-5 space-y-4">
            <div className="border-b border-neutral-900 pb-2 font-bold uppercase text-white">
              Canonical Software Products & Normalization Rules
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {canonicalProducts.map(prod => (
                <div key={prod.id} className="bg-black border border-neutral-800 p-3 sm:p-4 space-y-2">
                  <div className="flex justify-between items-center border-b border-neutral-900 pb-2 gap-2">
                    <span className="text-xs sm:text-sm font-bold text-white">{prod.publisher} {prod.productName}</span>
                    <span className="px-2 py-0.5 text-[8px] bg-red-950 text-red-400 border border-red-900 font-bold uppercase shrink-0">
                      {prod.edition}
                    </span>
                  </div>

                  <div className="bg-neutral-950 p-2 border border-neutral-900 text-[10px] text-neutral-300 break-all space-y-1">
                    <p><strong className="text-white">Version Family: </strong>{prod.versionFamily}</p>
                    <p><strong className="text-white">Canonical ID: </strong>{prod.id}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: LICENSES & ELP LEDGER */}
      {activeTab === 'licenses_and_elp' && (
        <div className="space-y-4 sm:space-y-6 font-mono text-xs">
          <div className="bg-neutral-950 border border-neutral-800 p-3 sm:p-5 space-y-4">
            <div className="border-b border-neutral-900 pb-2 font-bold uppercase text-white">
              Effective License Position (ELP) Ledger
            </div>

            <div className="space-y-3">
              {elpPositions.map(elp => (
                <div key={elp.canonicalProductId} className="bg-black border border-neutral-800 p-3 sm:p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-neutral-900 pb-2 gap-2">
                    <span className="text-xs sm:text-sm font-bold text-white">{elp.productName}</span>
                    <span className={`px-2 py-0.5 text-[9px] font-bold border self-start sm:self-auto ${
                      elp.complianceStatus === 'Over-Allocated' 
                        ? 'bg-red-950 text-red-500 border-red-900' 
                        : 'bg-black text-white border-neutral-800'
                    }`}>
                      Status: {elp.complianceStatus}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 text-center text-[10px]">
                    <div className="bg-neutral-950 p-2 border border-neutral-900">
                      <span className="text-neutral-500 uppercase block text-[9px]">Entitled</span>
                      <span className="text-white font-bold">{elp.entitledQuantity}</span>
                    </div>

                    <div className="bg-neutral-950 p-2 border border-neutral-900">
                      <span className="text-neutral-500 uppercase block text-[9px]">Consumed</span>
                      <span className="text-white font-bold">{elp.consumedQuantity}</span>
                    </div>

                    <div className="bg-neutral-950 p-2 border border-neutral-900">
                      <span className="text-neutral-500 uppercase block text-[9px]">Effective Position</span>
                      <span className={`font-bold ${elp.effectiveLicensePosition < 0 ? 'text-red-500' : 'text-white'}`}>
                        {elp.effectiveLicensePosition > 0 ? `+${elp.effectiveLicensePosition}` : elp.effectiveLicensePosition}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: GOVERNANCE, AUDIT & POLICY VIOLATIONS */}
      {activeTab === 'governance_audit' && (
        <div className="space-y-4 sm:space-y-6 font-mono text-xs">
          <div className="bg-neutral-950 border border-neutral-800 p-3 sm:p-5 space-y-4">
            <div className="border-b border-neutral-900 pb-2 font-bold uppercase text-white">
              Policy Violations & Audit Logs
            </div>

            <div className="space-y-3">
              {policyViolations.map(viol => (
                <div key={viol.id} className="bg-black border border-neutral-800 p-3 sm:p-4 space-y-2">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-neutral-900 pb-2 gap-2">
                    <span className="text-xs sm:text-sm font-bold text-red-500">{viol.policyName}</span>
                    <span className="px-2 py-0.5 text-[8px] bg-red-950 text-red-400 border border-red-900 font-bold uppercase self-start sm:self-auto">
                      {viol.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-neutral-300">Detected on CI: {viol.ciId} at {viol.detectedAt}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
