import React, { useState } from 'react';
import { 
  GitCommit, ArrowRight, ShieldAlert, Plus, Search, Filter, 
  CheckCircle2, AlertCircle, RefreshCw, Layers, Database, Server,
  Cloud, Workflow, Activity, Radio
} from 'lucide-react';
import { CiRelationship, RelationshipType, RelationshipSource, BlastRadiusReport } from './types';
import { relationshipGraphEngine, RELATIONSHIP_RULES } from './relationshipEngine';
import { INITIAL_CI_SEED_DATA } from '../ci_hierarchy/ciClassRegistry';

export const CiRelationshipDashboardModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'topology' | 'blast_radius' | 'add_rel' | 'rules'>('topology');
  const [relationships, setRelationships] = useState<CiRelationship[]>(
    relationshipGraphEngine.getAllRelationships('tenant-kspl-global')
  );

  // Filters
  const [typeFilter, setTypeFilter] = useState<RelationshipType | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected CI for single-hop topology view
  const [selectedCiId, setSelectedCiId] = useState<string>('ci-srv-901');

  // Blast radius state
  const [impactRootCiId, setImpactRootCiId] = useState<string>('ci-srv-901');
  const [maxDepth, setMaxDepth] = useState<number>(3);
  const [blastReport, setBlastReport] = useState<BlastRadiusReport | null>(null);

  // Form State for adding new relationship
  const [sourceCiId, setSourceCiId] = useState<string>('ci-sw-301');
  const [relType, setRelType] = useState<RelationshipType>('depends_on');
  const [targetCiId, setTargetCiId] = useState<string>('ci-srv-901');
  const [relSource, setRelSource] = useState<RelationshipSource>('Manual');
  const [confidence, setConfidence] = useState<number>(100);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const selectedCi = INITIAL_CI_SEED_DATA.find(c => c.id === selectedCiId) || INITIAL_CI_SEED_DATA[0] || null;
  const outgoingRels = selectedCiId ? relationshipGraphEngine.getOutgoingRelationships(selectedCiId) : [];
  const incomingRels = selectedCiId ? relationshipGraphEngine.getIncomingRelationships(selectedCiId) : [];

  const handleRunImpactAnalysis = () => {
    const rootCi = INITIAL_CI_SEED_DATA.find(c => c.id === impactRootCiId);
    if (!rootCi) return;

    const report = relationshipGraphEngine.calculateBlastRadius(
      rootCi.id,
      rootCi.name,
      maxDepth,
      'tenant-kspl-global'
    );
    setBlastReport(report);
  };

  const handleAddRelationship = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    const sourceCi = INITIAL_CI_SEED_DATA.find(c => c.id === sourceCiId);
    const targetCi = INITIAL_CI_SEED_DATA.find(c => c.id === targetCiId);

    if (!sourceCi || !targetCi) {
      setFormError('Source and Target CIs must be valid.');
      return;
    }

    if (sourceCi.id === targetCi.id) {
      setFormError('A CI cannot establish a directional relationship with itself.');
      return;
    }

    const result = relationshipGraphEngine.addRelationship({
      sourceCiId: sourceCi.id,
      sourceCiName: sourceCi.name,
      sourceCiClass: sourceCi.ciClass,
      relationshipType: relType,
      targetCiId: targetCi.id,
      targetCiName: targetCi.name,
      targetCiClass: targetCi.ciClass,
      direction: 'OUTGOING',
      status: 'Verified',
      source: relSource,
      confidenceScore: confidence,
      tenantId: 'tenant-kspl-global'
    });

    if (!result.success) {
      setFormError(result.message);
    } else {
      setRelationships(relationshipGraphEngine.getAllRelationships('tenant-kspl-global'));
      setFormSuccess(`Established directional relationship: ${sourceCi.name} --${relType}--> ${targetCi.name}`);
      setTimeout(() => setFormSuccess(null), 4000);
    }
  };

  const filteredRelationships = relationships.filter(r => {
    const matchesType = typeFilter === 'ALL' || r.relationshipType === typeFilter;
    const matchesSearch = 
      r.sourceCiName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.targetCiName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="bg-black text-white p-6 font-sans border border-red-900 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-red-900 pb-4 mb-6">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-red-600 animate-pulse" />
            <h1 className="text-xl font-bold uppercase tracking-wider text-white">Typed CI Relationship & Graph Engine</h1>
            <span className="text-xs bg-red-950 text-red-400 px-2 py-0.5 border border-red-800 font-mono">
              Graph Engine 2026.8
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1 font-mono">
            Directional Dependency Topology • Multi-Hop Traversal • Cascade Blast-Radius Impact Analysis
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mt-4 md:mt-0 border border-neutral-800 p-1 bg-neutral-950">
          {(['topology', 'blast_radius', 'add_rel', 'rules'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors ${
                activeTab === tab
                  ? 'bg-red-600 text-white font-bold'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              {tab === 'topology' ? 'CI Topology' : tab === 'blast_radius' ? 'Blast-Radius Analyzer' : tab === 'add_rel' ? '+ Add Relationship' : 'Compatibility Rules'}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: Relationship Topology & Directional Matrix */}
      {activeTab === 'topology' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-mono text-xs">
          {/* Left Panel: Selected CI Directional Inspector */}
          <div className="lg:col-span-5 bg-neutral-950 border border-neutral-800 p-4 space-y-4">
            <div className="text-xs font-bold uppercase text-white border-b border-neutral-900 pb-2 flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <GitCommit className="w-4 h-4 text-red-600" />
                <span>Single-Hop Dependency Node</span>
              </span>
              <span className="text-[10px] text-neutral-500">Node ID: {selectedCi?.id || 'N/A'}</span>
            </div>

            {/* Select Focus CI */}
            <div>
              <label className="block text-neutral-400 text-[10px] uppercase mb-1">Focus CI Node</label>
              <select
                value={selectedCiId}
                onChange={(e) => setSelectedCiId(e.target.value)}
                className="w-full bg-black border border-neutral-800 px-3 py-2 text-white focus:outline-none focus:border-red-600"
              >
                {INITIAL_CI_SEED_DATA.length === 0 ? (
                  <option value="">No CIs Available</option>
                ) : (
                  INITIAL_CI_SEED_DATA.map(ci => (
                    <option key={ci.id} value={ci.id}>
                      [{ci.ciClass}] {ci.name} ({ci.ciType})
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Focused CI Details */}
            {selectedCi ? (
              <div className="bg-black border border-neutral-800 p-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white">{selectedCi.name}</span>
                  <span className="text-[10px] bg-red-950 text-red-400 border border-red-900 px-1.5 py-0.5">
                    {selectedCi.ciClass} &gt; {selectedCi.ciType}
                  </span>
                </div>
                <div className="text-[10px] text-neutral-400">Owner: {selectedCi.owner} | Env: {selectedCi.environment}</div>
              </div>
            ) : (
              <div className="bg-black border border-neutral-900 p-3 text-neutral-500 text-center">
                No CI selected or registered.
              </div>
            )}

            {/* Outgoing Dependencies (Dependencies of selected CI) */}
            <div>
              <h3 className="text-xs font-bold uppercase text-red-500 mb-2 flex items-center space-x-1">
                <ArrowRight className="w-3.5 h-3.5 text-red-500" />
                <span>Outgoing Dependencies ({outgoingRels.length})</span>
              </h3>

              {outgoingRels.length === 0 ? (
                <div className="p-3 bg-black border border-neutral-900 text-neutral-500 text-[11px]">
                  No outgoing relationships recorded.
                </div>
              ) : (
                <div className="space-y-1.5">
                  {outgoingRels.map(rel => (
                    <div key={rel.id} className="p-2.5 bg-black border border-neutral-800 flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-1 text-white font-bold">
                          <span>{rel.sourceCiName}</span>
                          <span className="text-red-500 font-mono">──[{rel.relationshipType}]──&gt;</span>
                          <span>{rel.targetCiName}</span>
                        </div>
                        <div className="text-[9px] text-neutral-500 mt-0.5">
                          Source: {rel.source} | Confidence: {rel.confidenceScore}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Incoming Dependents (CIs that depend on selected CI) */}
            <div>
              <h3 className="text-xs font-bold uppercase text-white mb-2 flex items-center space-x-1">
                <ShieldAlert className="w-3.5 h-3.5 text-white" />
                <span>Incoming Dependents ({incomingRels.length})</span>
              </h3>

              {incomingRels.length === 0 ? (
                <div className="p-3 bg-black border border-neutral-900 text-neutral-500 text-[11px]">
                  No incoming dependents recorded.
                </div>
              ) : (
                <div className="space-y-1.5">
                  {incomingRels.map(rel => (
                    <div key={rel.id} className="p-2.5 bg-black border border-neutral-800 flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-1 text-white font-bold">
                          <span>{rel.sourceCiName}</span>
                          <span className="text-red-500 font-mono">──[{rel.relationshipType}]──&gt;</span>
                          <span>{rel.targetCiName}</span>
                        </div>
                        <div className="text-[9px] text-neutral-500 mt-0.5">
                          Status: {rel.status} | Source: {rel.source}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel: Global Relationship Table */}
          <div className="lg:col-span-7 bg-neutral-950 border border-neutral-800 p-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-900 pb-2 gap-2">
              <div className="text-xs font-bold uppercase text-white flex items-center space-x-2">
                <Layers className="w-4 h-4 text-red-600" />
                <span>Enterprise Directional Relationship Registry</span>
              </div>

              {/* Filter controls */}
              <div className="flex items-center space-x-2">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as any)}
                  className="bg-black border border-neutral-800 text-[10px] text-white px-2 py-1 focus:outline-none"
                >
                  <option value="ALL">All Rel Types</option>
                  <option value="runs_on">runs_on</option>
                  <option value="depends_on">depends_on</option>
                  <option value="hosted_by">hosted_by</option>
                  <option value="connects_to">connects_to</option>
                  <option value="used_by">used_by</option>
                </select>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search Relationship ID, Source or Target CI..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black border border-neutral-800 pl-8 pr-3 py-1.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-red-600"
              />
            </div>

            {/* Table */}
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {filteredRelationships.map(rel => (
                <div key={rel.id} className="bg-black border border-neutral-900 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] bg-neutral-900 border border-neutral-800 px-1.5 py-0.5 text-neutral-400 font-bold">
                      {rel.id}
                    </span>
                    <span className="text-[10px] bg-red-950 text-red-400 border border-red-900 px-1.5 py-0.5 uppercase">
                      Confidence: {rel.confidenceScore}%
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="text-white font-bold">{rel.sourceCiName} ({rel.sourceCiClass})</div>
                    <div className="text-red-500 font-mono text-[11px] font-bold">── [{rel.relationshipType}] ──&gt;</div>
                    <div className="text-white font-bold">{rel.targetCiName} ({rel.targetCiClass})</div>
                  </div>

                  <div className="flex items-center justify-between text-[9px] text-neutral-500 pt-1 border-t border-neutral-950">
                    <span>Source: {rel.source}</span>
                    <span>Last Updated: {rel.updatedAt}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Multi-Hop Blast-Radius Analysis Simulator */}
      {activeTab === 'blast_radius' && (
        <div className="space-y-6 font-mono text-xs">
          <div className="bg-neutral-950 border border-neutral-800 p-5 space-y-4">
            <div className="border-b border-neutral-900 pb-3">
              <h2 className="text-sm font-bold uppercase text-white flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 text-red-600" />
                <span>Multi-Hop Cascade Blast-Radius & Impact Simulator</span>
              </h2>
              <p className="text-neutral-400 text-[11px] mt-1">
                Simulate component failure at any graph node to calculate downstream dependent service impact.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end bg-black border border-neutral-800 p-4">
              <div>
                <label className="block text-neutral-400 text-[10px] uppercase mb-1">Simulated Failure Root Node</label>
                <select
                  value={impactRootCiId}
                  onChange={(e) => setImpactRootCiId(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 px-3 py-2 text-white focus:outline-none focus:border-red-600"
                >
                  {INITIAL_CI_SEED_DATA.map(ci => (
                    <option key={ci.id} value={ci.id}>
                      [{ci.ciClass}] {ci.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-neutral-400 text-[10px] uppercase mb-1">Max Traversal Depth (Hops)</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={maxDepth}
                  onChange={(e) => setMaxDepth(Number(e.target.value))}
                  className="w-full bg-neutral-900 border border-neutral-800 px-3 py-2 text-white focus:outline-none focus:border-red-600"
                />
              </div>

              <button
                onClick={handleRunImpactAnalysis}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-wider transition-colors"
              >
                Execute Impact Analysis
              </button>
            </div>
          </div>

          {/* Report Output */}
          {blastReport && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-neutral-950 border border-neutral-800 p-4">
                  <div className="text-neutral-500 text-[10px] uppercase">Simulated Root Failure</div>
                  <div className="text-sm font-bold text-white mt-1">{blastReport.rootCiName}</div>
                </div>

                <div className="bg-neutral-950 border border-neutral-800 p-4">
                  <div className="text-neutral-500 text-[10px] uppercase">Total Downstream Impact</div>
                  <div className="text-2xl font-bold text-red-500 mt-1">{blastReport.totalAffectedCIs} CIs</div>
                </div>

                <div className="bg-neutral-950 border border-neutral-800 p-4">
                  <div className="text-neutral-500 text-[10px] uppercase">Critical Tier Impact</div>
                  <div className="text-2xl font-bold text-white mt-1">{blastReport.criticalImpactCount}</div>
                </div>

                <div className="bg-neutral-950 border border-neutral-800 p-4">
                  <div className="text-neutral-500 text-[10px] uppercase">Max Depth Evaluated</div>
                  <div className="text-2xl font-bold text-neutral-300 mt-1">{blastReport.traversalMaxDepthReached} Hops</div>
                </div>
              </div>

              {/* Impact Tree List */}
              <div className="bg-neutral-950 border border-neutral-800 p-4">
                <div className="text-xs font-bold uppercase text-white mb-3">Cascading Affected CI Dependency Tree</div>
                {blastReport.affectedNodes.length === 0 ? (
                  <div className="text-neutral-500 p-4 bg-black border border-neutral-900">
                    No downstream dependent CIs are affected by failure of this item.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {blastReport.affectedNodes.map((node, idx) => (
                      <div key={idx} className="bg-black border border-neutral-800 p-3 flex items-center justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-white text-xs">{node.ciName}</span>
                            <span className="text-[10px] bg-neutral-900 border border-neutral-800 px-1.5 py-0.5 text-neutral-400">
                              Class: {node.ciClass}
                            </span>
                          </div>
                          <div className="text-[10px] text-neutral-500 mt-1">
                            Impacted via relationship: <span className="text-red-400">{node.relationshipVia}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] bg-red-950 text-red-400 border border-red-900 px-2 py-0.5 uppercase font-bold">
                            Hop Depth: {node.depth} ({node.impactSeverity})
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Add Directional Relationship */}
      {activeTab === 'add_rel' && (
        <form onSubmit={handleAddRelationship} className="space-y-6 font-mono text-xs max-w-3xl mx-auto bg-neutral-950 border border-neutral-800 p-6">
          <div className="border-b border-neutral-900 pb-3">
            <h2 className="text-sm font-bold uppercase text-white flex items-center space-x-2">
              <Plus className="w-4 h-4 text-red-600" />
              <span>Establish Directional CI Relationship</span>
            </h2>
            <p className="text-neutral-400 text-[11px] mt-1">
              Select Source CI, Relationship Type, and Target CI. Direction is strictly enforced.
            </p>
          </div>

          {formError && (
            <div className="p-3 bg-red-950 border border-red-700 text-red-200 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span>{formError}</span>
            </div>
          )}

          {formSuccess && (
            <div className="p-3 bg-red-950 border border-red-700 text-red-200 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-red-500" />
              <span>{formSuccess}</span>
            </div>
          )}

          <div className="space-y-4 bg-black border border-neutral-800 p-4">
            <div>
              <label className="block text-neutral-400 text-[10px] uppercase mb-1">1. Source CI Item</label>
              <select
                value={sourceCiId}
                onChange={(e) => setSourceCiId(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 px-3 py-2 text-white focus:outline-none focus:border-red-600"
              >
                {INITIAL_CI_SEED_DATA.map(ci => (
                  <option key={ci.id} value={ci.id}>
                    [{ci.ciClass}] {ci.name} ({ci.ciType})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-neutral-400 text-[10px] uppercase mb-1">2. Directional Relationship Type</label>
              <select
                value={relType}
                onChange={(e) => setRelType(e.target.value as RelationshipType)}
                className="w-full bg-neutral-900 border border-neutral-800 px-3 py-2 text-white focus:outline-none focus:border-red-600"
              >
                <option value="runs_on">runs_on (e.g. App runs on Server)</option>
                <option value="depends_on">depends_on (e.g. App depends on Database)</option>
                <option value="hosted_by">hosted_by (e.g. Container hosted by VM)</option>
                <option value="connects_to">connects_to (e.g. Host connects to Firewall)</option>
                <option value="used_by">used_by (e.g. SaaS used by Service)</option>
              </select>
            </div>

            <div>
              <label className="block text-neutral-400 text-[10px] uppercase mb-1">3. Target CI Item</label>
              <select
                value={targetCiId}
                onChange={(e) => setTargetCiId(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 px-3 py-2 text-white focus:outline-none focus:border-red-600"
              >
                {INITIAL_CI_SEED_DATA.map(ci => (
                  <option key={ci.id} value={ci.id}>
                    [{ci.ciClass}] {ci.name} ({ci.ciType})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-neutral-400 text-[10px] uppercase mb-1">Discovery Source</label>
                <select
                  value={relSource}
                  onChange={(e) => setRelSource(e.target.value as RelationshipSource)}
                  className="w-full bg-neutral-900 border border-neutral-800 px-3 py-1.5 text-white focus:outline-none focus:border-red-600"
                >
                  <option value="Manual">Manual</option>
                  <option value="Agent">Agent</option>
                  <option value="Agentless Discovery">Agentless Discovery</option>
                  <option value="Cloud API">Cloud API</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-400 text-[10px] uppercase mb-1">Confidence Score (0-100%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={confidence}
                  onChange={(e) => setConfidence(Number(e.target.value))}
                  className="w-full bg-neutral-900 border border-neutral-800 px-3 py-1.5 text-white focus:outline-none focus:border-red-600"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-wider transition-colors"
            >
              Establish Directional Relationship
            </button>
          </div>
        </form>
      )}

      {/* TAB 4: Compatibility Rules Matrix */}
      {activeTab === 'rules' && (
        <div className="space-y-6 font-mono text-xs">
          <h2 className="text-sm font-bold uppercase text-white">Relationship Type Compatibility Matrix</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {RELATIONSHIP_RULES.map(rule => (
              <div key={rule.relationshipType} className="bg-neutral-950 border border-neutral-800 p-4 space-y-2">
                <div className="flex justify-between items-center border-b border-neutral-900 pb-2">
                  <span className="font-bold text-white text-sm">{rule.relationshipType}</span>
                  <span className="text-[10px] bg-red-950 text-red-400 border border-red-900 px-2 py-0.5">
                    Directional
                  </span>
                </div>

                <p className="text-neutral-400 text-[11px]">{rule.description}</p>

                <div className="grid grid-cols-2 gap-2 text-[10px] pt-1">
                  <div className="bg-black border border-neutral-900 p-2">
                    <span className="text-neutral-500">Allowed Source Classes:</span>
                    <div className="text-white font-bold mt-0.5">{rule.allowedSourceClasses.join(', ')}</div>
                  </div>
                  <div className="bg-black border border-neutral-900 p-2">
                    <span className="text-neutral-500">Allowed Target Classes:</span>
                    <div className="text-white font-bold mt-0.5">{rule.allowedTargetClasses.join(', ')}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
