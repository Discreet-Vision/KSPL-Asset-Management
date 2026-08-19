import React, { useState } from 'react';
import { 
  GitMerge, ShieldAlert, CheckCircle2, AlertCircle, RefreshCw, 
  Layers, Search, Sliders, Play, ArrowRight, Eye, Check, X,
  FileCheck, ShieldCheck, HelpCircle, History, Database, Cpu
} from 'lucide-react';
import { 
  FieldPrecedenceRule, 
  IdentificationConfig, 
  CanonicalCiRecord, 
  FieldProvenanceRecord,
  ReconciliationResult, 
  DryRunSimulationReport,
  ReconciliationSource
} from './types';
import { configurableReconciliationEngine } from './reconciliationEngine';
import { multiMethodDiscoveryEngine } from '../discovery_engine/discoveryEngine';

export const ReconciliationDashboardModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'rules_builder' | 'confidence_config' | 'provenance_inspector' | 'simulation_dryrun' | 'review_queue' | 'canonical_cis'
  >('rules_builder');

  const [rules, setRules] = useState<FieldPrecedenceRule[]>(
    configurableReconciliationEngine.getPrecedenceRules()
  );
  const [identConfig, setIdentConfig] = useState<IdentificationConfig>(
    configurableReconciliationEngine.getIdentificationConfig()
  );
  const [canonicalCis, setCanonicalCis] = useState<CanonicalCiRecord[]>(
    configurableReconciliationEngine.getCanonicalCis()
  );
  const [pendingApprovals, setPendingApprovals] = useState(
    configurableReconciliationEngine.getPendingApprovals()
  );

  // Selected CI for Provenance Inspector
  const [selectedCiId, setSelectedCiId] = useState<string>(canonicalCis[0]?.id || 'ci-srv-901');

  // Simulation State
  const [simReport, setSimReport] = useState<DryRunSimulationReport | null>(null);

  // New Rule Form State
  const [selectedField, setSelectedField] = useState<string>('osVersion');
  const [selectedClass, setSelectedClass] = useState<string>('Hardware');
  const [sourceOrder, setSourceOrder] = useState<ReconciliationSource[]>([
    'Agent', 'WMI', 'SSH', 'Agentless', 'Manual', 'Import'
  ]);
  const [ruleSaveSuccess, setRuleSaveSuccess] = useState<string | null>(null);

  // Search filter
  const [searchQuery, setSearchQuery] = useState<string>('');

  const selectedCi = canonicalCis.find(c => c.id === selectedCiId) || canonicalCis[0];

  const handleRunSimulation = () => {
    const discoveryCandidates = multiMethodDiscoveryEngine.getAllResults();
    const report = configurableReconciliationEngine.runSimulation(discoveryCandidates);
    setSimReport(report);
  };

  const handleSaveRule = (e: React.FormEvent) => {
    e.preventDefault();
    const newRule: FieldPrecedenceRule = {
      id: `rule-${selectedField}-${Date.now()}`,
      ciClass: selectedClass,
      fieldName: selectedField,
      sourcePriority: sourceOrder,
      freshnessWeightPct: 20,
      ignoreEmptyValues: true,
      enabled: true,
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      updatedBy: 'Admin'
    };

    configurableReconciliationEngine.updatePrecedenceRule(newRule);
    setRules(configurableReconciliationEngine.getPrecedenceRules());
    setRuleSaveSuccess(`Reconciliation precedence rule for '${selectedField}' saved successfully (Rule Version v${identConfig.ruleVersion + 1}).`);
    setTimeout(() => setRuleSaveSuccess(null), 4000);
  };

  const handleApproveMerge = (candidateId: string) => {
    setPendingApprovals(pendingApprovals.filter(p => p.candidate.id !== candidateId));
  };

  return (
    <div className="bg-black text-white p-6 font-sans border border-red-900 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-red-900 pb-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-red-600 animate-pulse" />
            <h1 className="text-xl font-bold uppercase tracking-wider text-white">
              Configurable Reconciliation & CI Identification Engine
            </h1>
            <span className="text-xs bg-red-950 text-red-400 px-2 py-0.5 border border-red-800 font-mono">
              Rule Engine v{identConfig.ruleVersion}.0
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1 font-mono">
            Attribute-Level Source Precedence • Multi-Identifier Confidence Scoring • Dry-Run Simulation • Conflict Provenance
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-1 mt-4 md:mt-0 border border-neutral-800 p-1 bg-neutral-950">
          {(
            [
              ['rules_builder', 'Field Precedence Rules'],
              ['confidence_config', 'Confidence Thresholds'],
              ['provenance_inspector', 'Conflict & Provenance'],
              ['simulation_dryrun', 'Dry-Run Simulation'],
              ['review_queue', `Review Queue (${pendingApprovals.length})`],
              ['canonical_cis', 'Canonical CIs']
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors ${
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

      {/* TAB 1: FIELD PRECEDENCE RULES BUILDER */}
      {activeTab === 'rules_builder' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-mono text-xs">
          {/* Left Form: Rule Creator */}
          <form onSubmit={handleSaveRule} className="lg:col-span-5 bg-neutral-950 border border-neutral-800 p-5 space-y-4">
            <div className="border-b border-neutral-900 pb-3">
              <h2 className="text-sm font-bold uppercase text-white flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-red-600" />
                <span>Field-Level Source Precedence Builder</span>
              </h2>
              <p className="text-neutral-400 text-[11px] mt-1">
                Configure attribute-level winning priority across discovery sources.
              </p>
            </div>

            {ruleSaveSuccess && (
              <div className="p-3 bg-red-950 border border-red-700 text-red-200 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-red-500" />
                <span>{ruleSaveSuccess}</span>
              </div>
            )}

            <div className="space-y-3 bg-black border border-neutral-800 p-4">
              <div>
                <label className="block text-neutral-400 text-[10px] uppercase mb-1">Target CI Class</label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 px-3 py-2 text-white focus:outline-none focus:border-red-600"
                >
                  <option value="Hardware">Hardware (Servers, Laptops, Switches)</option>
                  <option value="Software">Software (Apps, SaaS, Licenses)</option>
                  <option value="Cloud">Cloud (Compute, Storage, DBs)</option>
                  <option value="ALL">Global Rule (All CI Classes)</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-400 text-[10px] uppercase mb-1">Target Attribute / Field</label>
                <select
                  value={selectedField}
                  onChange={(e) => setSelectedField(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 px-3 py-2 text-white focus:outline-none focus:border-red-600"
                >
                  <option value="osVersion">Operating System Version (osVersion)</option>
                  <option value="serialNumber">Hardware Serial Number (serialNumber)</option>
                  <option value="ramGb">RAM Memory Capacity (ramGb)</option>
                  <option value="ipAddress">Primary IP Address (ipAddress)</option>
                  <option value="macAddress">Primary MAC Address (macAddress)</option>
                  <option value="cloudResourceId">Cloud Resource Identifier (cloudResourceId)</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-400 text-[10px] uppercase mb-1">Source Priority Hierarchy (Highest to Lowest)</label>
                <div className="space-y-1 bg-neutral-900 border border-neutral-800 p-2">
                  {sourceOrder.map((src, idx) => (
                    <div key={src} className="flex items-center justify-between p-1.5 bg-black border border-neutral-800 text-[10px]">
                      <span className="text-white font-bold">Priority #{idx + 1}: {src}</span>
                      <span className="text-neutral-500">Tier {idx + 1}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-2.5 bg-neutral-900 border border-neutral-800 text-[10px] text-neutral-400">
                <span className="text-red-400 font-bold">Quality Rule:</span> Empty, NULL, or 'N/A' incoming values will automatically be ignored and will NOT overwrite valid existing field data.
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-wider transition-colors"
            >
              Save Precedence Rule
            </button>
          </form>

          {/* Right Panel: Active Rules Registry */}
          <div className="lg:col-span-7 bg-neutral-950 border border-neutral-800 p-5 space-y-4">
            <div className="text-xs font-bold uppercase text-white border-b border-neutral-900 pb-2 flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-red-600" />
                <span>Active Reconciliation Rules Hierarchy</span>
              </span>
              <span className="text-[10px] text-neutral-500">Total Rules: {rules.length}</span>
            </div>

            <div className="space-y-3">
              {rules.map(rule => (
                <div key={rule.id} className="bg-black border border-neutral-800 p-4 space-y-2">
                  <div className="flex justify-between items-center border-b border-neutral-900 pb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-white text-sm">[{rule.ciClass}] {rule.fieldName}</span>
                      <span className="text-[10px] bg-red-950 text-red-400 border border-red-900 px-2 py-0.5 font-bold">
                        Rule ID: {rule.id}
                      </span>
                    </div>
                    <span className="text-[10px] text-neutral-400">Updated: {rule.updatedAt}</span>
                  </div>

                  <div>
                    <span className="text-neutral-500 text-[10px]">Configured Source Precedence:</span>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1 font-bold text-white text-[10px]">
                      {rule.sourcePriority.map((src, i) => (
                        <span key={src} className="flex items-center">
                          <span className="bg-neutral-900 border border-neutral-800 px-2 py-0.5 text-neutral-200">
                            #{i + 1} {src}
                          </span>
                          {i < rule.sourcePriority.length - 1 && (
                            <ArrowRight className="w-3 h-3 text-red-600 mx-1" />
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CONFIDENCE THRESHOLDS & ATTRIBUTE WEIGHTS */}
      {activeTab === 'confidence_config' && (
        <div className="space-y-6 font-mono text-xs max-w-4xl mx-auto bg-neutral-950 border border-neutral-800 p-6">
          <div className="border-b border-neutral-900 pb-3">
            <h2 className="text-sm font-bold uppercase text-white flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-red-600" />
              <span>CI Identification Confidence Thresholds & Attribute Weights</span>
            </h2>
            <p className="text-neutral-400 text-[11px] mt-1">
              Configure score cutoffs for automatic reconciliation vs admin review queue.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-black border border-neutral-800 p-4">
            <div>
              <label className="block text-neutral-400 text-[10px] uppercase mb-1">Automatic Merge Threshold Score (0-100)</label>
              <input
                type="number"
                min="50"
                max="100"
                value={identConfig.autoMergeThreshold}
                onChange={(e) => setIdentConfig({ ...identConfig, autoMergeThreshold: Number(e.target.value) })}
                className="w-full bg-neutral-900 border border-neutral-800 px-3 py-2 text-white font-bold text-lg focus:outline-none focus:border-red-600"
              />
              <p className="text-[10px] text-red-400 mt-1">
                Matches with score &gt;= {identConfig.autoMergeThreshold}% merge automatically into Canonical CI.
              </p>
            </div>

            <div>
              <label className="block text-neutral-400 text-[10px] uppercase mb-1">Admin Review Threshold Score (0-100)</label>
              <input
                type="number"
                min="30"
                max="90"
                value={identConfig.reviewThreshold}
                onChange={(e) => setIdentConfig({ ...identConfig, reviewThreshold: Number(e.target.value) })}
                className="w-full bg-neutral-900 border border-neutral-800 px-3 py-2 text-white font-bold text-lg focus:outline-none focus:border-red-600"
              />
              <p className="text-[10px] text-neutral-400 mt-1">
                Matches between {identConfig.reviewThreshold}% - {identConfig.autoMergeThreshold - 1}% are sent to Admin Review Queue.
              </p>
            </div>
          </div>

          {/* Attribute Weights */}
          <div className="bg-black border border-neutral-800 p-4 space-y-3">
            <div className="text-xs font-bold uppercase text-white border-b border-neutral-900 pb-2">
              Identifier Match Weight Distribution
            </div>

            <div className="space-y-2">
              {identConfig.attributeWeights.map((w, idx) => (
                <div key={idx} className="p-3 bg-neutral-950 border border-neutral-800 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white uppercase text-xs">{w.attributeName}</span>
                  </div>
                  <div className="flex items-center space-x-4 text-[10px]">
                    <span className="text-red-400 font-bold">Exact Match: +{w.exactMatchScore} pts</span>
                    <span className="text-neutral-400">Fuzzy Match: +{w.fuzzyMatchScore} pts</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PROVENANCE & CONFLICT INSPECTOR */}
      {activeTab === 'provenance_inspector' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-mono text-xs">
          {/* Left: Select CI */}
          <div className="lg:col-span-4 bg-neutral-950 border border-neutral-800 p-4 space-y-3">
            <div className="text-xs font-bold uppercase text-white border-b border-neutral-900 pb-2">
              Select Canonical CI Item
            </div>

            <div className="space-y-2">
              {canonicalCis.map(ci => (
                <div
                  key={ci.id}
                  onClick={() => setSelectedCiId(ci.id)}
                  className={`p-3 border cursor-pointer transition-colors ${
                    selectedCiId === ci.id
                      ? 'bg-red-950 border-red-600 text-white font-bold'
                      : 'bg-black border-neutral-900 text-neutral-300 hover:border-neutral-700'
                  }`}
                >
                  <div className="text-xs">{ci.ciName}</div>
                  <div className="text-[9px] text-neutral-500 mt-1">{ci.id} | Class: {ci.ciClass}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Provenance Inspector */}
          <div className="lg:col-span-8 bg-neutral-950 border border-neutral-800 p-5 space-y-4">
            <div className="border-b border-neutral-900 pb-3 flex justify-between items-center">
              <div>
                <h2 className="text-sm font-bold uppercase text-white flex items-center space-x-2">
                  <History className="w-4 h-4 text-red-600" />
                  <span>Field Provenance & Historical Conflicts</span>
                </h2>
                <p className="text-neutral-400 text-[10px] mt-0.5">
                  CI: <strong className="text-white">{selectedCi.ciName}</strong> ({selectedCi.id})
                </p>
              </div>

              <span className="text-[10px] bg-red-950 text-red-400 border border-red-900 px-2 py-0.5 font-bold">
                Sources: {selectedCi.associatedDiscoverySources.join(', ')}
              </span>
            </div>

            {/* Field Provenance Table */}
            <div className="space-y-3">
              {Object.entries(selectedCi.fieldProvenance as Record<string, FieldProvenanceRecord>).map(([field, prov]) => (
                <div key={field} className="bg-black border border-neutral-800 p-4 space-y-2">
                  <div className="flex justify-between items-center border-b border-neutral-900 pb-2">
                    <span className="font-bold text-white text-xs uppercase">{field}</span>
                    <span className="text-[10px] text-neutral-400">Winning Source: <strong className="text-red-400">{prov.winningSource}</strong></span>
                  </div>

                  <div className="text-sm font-bold text-white bg-neutral-950 p-2 border border-neutral-900">
                    Current Canonical Value: {String(prov.winningValue)}
                  </div>

                  {prov.conflictingValues.length > 0 && (
                    <div className="pt-2 border-t border-neutral-900 space-y-1 text-[10px]">
                      <span className="text-red-500 font-bold">Conflicting Historical Values Detected:</span>
                      {prov.conflictingValues.map((conf, i) => (
                        <div key={i} className="p-1.5 bg-neutral-900 border border-neutral-800 flex justify-between text-neutral-400">
                          <span>Source {conf.source}: "{String(conf.value)}"</span>
                          <span>Timestamp: {conf.timestamp}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: DRY-RUN SIMULATION ENGINE */}
      {activeTab === 'simulation_dryrun' && (
        <div className="space-y-6 font-mono text-xs">
          <div className="bg-neutral-950 border border-neutral-800 p-5 space-y-4">
            <div className="border-b border-neutral-900 pb-3 flex justify-between items-center">
              <div>
                <h2 className="text-sm font-bold uppercase text-white flex items-center space-x-2">
                  <Play className="w-4 h-4 text-red-600" />
                  <span>Reconciliation Rule Dry-Run Simulation Engine</span>
                </h2>
                <p className="text-neutral-400 text-[11px] mt-1">
                  Evaluate rules against discovery candidate records in-memory without altering live CMDB data.
                </p>
              </div>

              <button
                onClick={handleRunSimulation}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-wider transition-colors"
              >
                Execute Dry-Run Simulation
              </button>
            </div>

            {simReport && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-black border border-neutral-800 p-4">
                    <div className="text-neutral-500 text-[10px] uppercase">Records Evaluated</div>
                    <div className="text-2xl font-bold text-white mt-1">{simReport.recordsTested}</div>
                  </div>

                  <div className="bg-black border border-neutral-800 p-4">
                    <div className="text-neutral-500 text-[10px] uppercase">Potential Auto Merges</div>
                    <div className="text-2xl font-bold text-red-500 mt-1">{simReport.potentialAutoMerges}</div>
                  </div>

                  <div className="bg-black border border-neutral-800 p-4">
                    <div className="text-neutral-500 text-[10px] uppercase">Flagged for Review</div>
                    <div className="text-2xl font-bold text-white mt-1">{simReport.potentialReviewNeeded}</div>
                  </div>

                  <div className="bg-black border border-neutral-800 p-4">
                    <div className="text-neutral-500 text-[10px] uppercase">New CIs to Create</div>
                    <div className="text-2xl font-bold text-neutral-300 mt-1">{simReport.potentialNewCis}</div>
                  </div>
                </div>

                <div className="bg-black border border-neutral-800 p-4 space-y-2">
                  <div className="text-xs font-bold uppercase text-white border-b border-neutral-900 pb-2">
                    Simulation Outcome Details
                  </div>
                  {simReport.details.map((d, i) => (
                    <div key={i} className="p-2.5 bg-neutral-950 border border-neutral-800 flex justify-between items-center text-[10px]">
                      <div>
                        <span className="text-white font-bold">{d.candidateHostname}</span>
                        {d.targetCiName && <span className="text-neutral-400"> ──&gt; Target CI: {d.targetCiName}</span>}
                      </div>

                      <div className="flex items-center space-x-3">
                        <span className="text-red-400 font-bold">Match Score: {d.matchScore}%</span>
                        <span className="bg-red-950 text-red-400 border border-red-900 px-2 py-0.5 font-bold uppercase">
                          {d.recommendedAction}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: ADMIN REVIEW QUEUE */}
      {activeTab === 'review_queue' && (
        <div className="space-y-6 font-mono text-xs">
          <div className="bg-neutral-950 border border-neutral-800 p-5 space-y-4">
            <div className="border-b border-neutral-900 pb-3">
              <h2 className="text-sm font-bold uppercase text-white flex items-center space-x-2">
                <HelpCircle className="w-4 h-4 text-red-600" />
                <span>Ambiguous Match Admin Review Queue</span>
              </h2>
              <p className="text-neutral-400 text-[11px] mt-1">
                Candidate records requiring manual approval before merging into Canonical CI.
              </p>
            </div>

            {pendingApprovals.length === 0 ? (
              <div className="p-6 bg-black border border-neutral-900 text-neutral-500 text-center">
                No ambiguous matches pending review. All candidate records reconciled cleanly.
              </div>
            ) : (
              <div className="space-y-3">
                {pendingApprovals.map(item => (
                  <div key={item.candidate.id} className="bg-black border border-neutral-800 p-4 space-y-3">
                    <div className="flex justify-between items-center border-b border-neutral-900 pb-2">
                      <span className="font-bold text-white text-sm">
                        Candidate Host: {item.candidate.hostname}
                      </span>
                      <span className="text-[10px] bg-red-950 text-red-400 border border-red-900 px-2 py-0.5 font-bold">
                        Match Score: {item.matchScore}%
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-[10px]">
                      <div className="bg-neutral-950 border border-neutral-900 p-3">
                        <span className="text-neutral-500 uppercase">Incoming Candidate</span>
                        <div className="text-white font-bold mt-1">Host: {item.candidate.hostname}</div>
                        <div className="text-neutral-400">IP: {item.candidate.ipAddress}</div>
                        <div className="text-neutral-400">Serial: {item.candidate.serialNumber}</div>
                      </div>

                      <div className="bg-neutral-950 border border-neutral-900 p-3">
                        <span className="text-neutral-500 uppercase">Existing Canonical CI Target</span>
                        <div className="text-white font-bold mt-1">Name: {item.targetCi.ciName}</div>
                        <div className="text-neutral-400">IP: {item.targetCi.attributes.ipAddress}</div>
                        <div className="text-neutral-400">Serial: {item.targetCi.attributes.serialNumber}</div>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-2">
                      <button
                        onClick={() => handleApproveMerge(item.candidate.id)}
                        className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold uppercase"
                      >
                        Approve Merge
                      </button>
                      <button
                        onClick={() => handleApproveMerge(item.candidate.id)}
                        className="px-4 py-1.5 bg-neutral-900 border border-neutral-700 text-white hover:border-neutral-500 uppercase"
                      >
                        Keep Separate
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 6: CANONICAL CIS */}
      {activeTab === 'canonical_cis' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="bg-neutral-950 border border-neutral-800 p-4 space-y-3">
            <div className="text-xs font-bold uppercase text-white border-b border-neutral-900 pb-2">
              Canonical CMDB Records Repository
            </div>

            <div className="space-y-2">
              {canonicalCis.map(ci => (
                <div key={ci.id} className="bg-black border border-neutral-900 p-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] bg-neutral-900 border border-neutral-800 px-1.5 py-0.5 text-neutral-400 font-bold">
                      {ci.id}
                    </span>
                    <span className="text-[10px] bg-red-950 text-red-400 border border-red-900 px-1.5 py-0.5 uppercase font-bold">
                      Sources: {ci.associatedDiscoverySources.join(', ')}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <div className="text-white font-bold">{ci.ciName}</div>
                    <div className="text-red-400 font-mono text-[11px] font-bold">[{ci.ciClass}] {ci.ciType}</div>
                  </div>

                  <div className="text-[10px] text-neutral-400 pt-1 border-t border-neutral-950">
                    Serial: {ci.attributes.serialNumber || 'N/A'} | MAC: {ci.attributes.macAddress || 'N/A'} | OS: {ci.attributes.osVersion || 'N/A'}
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
