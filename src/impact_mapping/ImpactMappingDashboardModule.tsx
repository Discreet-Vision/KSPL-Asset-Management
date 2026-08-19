import React, { useState } from 'react';
import { 
  Network, Search, AlertTriangle, Layers, ArrowRight, Activity, 
  CheckCircle2, ShieldCheck, FileCheck, Eye, RefreshCw, Sparkles, Filter
} from 'lucide-react';
import { 
  BlastRadiusResult, 
  ImpactNode, 
  DependencyDirection, 
  ImpactAnalysisSnapshot 
} from './types';
import { impactDependencyMappingEngine } from './impactEngine';
import { configurableReconciliationEngine } from '../reconciliation_engine/reconciliationEngine';

export const ImpactMappingDashboardModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'visual_graph' | 'change_simulation' | 'snapshots'>('visual_graph');

  // Engine Data
  const canonicalCis = configurableReconciliationEngine.getCanonicalCis() || [];
  const safeCanonicalCis = canonicalCis || [];
  const [selectedCiId, setSelectedCiId] = useState<string>(safeCanonicalCis[0]?.id || 'ci-101');
  const [direction, setDirection] = useState<DependencyDirection>('Downstream');
  const [traversalDepth, setTraversalDepth] = useState<number>(3);

  // Analysis Result State
  const [blastResult, setBlastResult] = useState<BlastRadiusResult>(
    impactDependencyMappingEngine.analyzeBlastRadius([selectedCiId], direction, traversalDepth) || { nodes: [], edges: [], dependencyPaths: [], totalImpactedCount: 0, criticalServicesAffected: 0, maxTraversalDepth: 0, riskScore: 0, riskCategory: 'Low', singlePointOfFailureDetected: false, spofNodeIds: [], multiTenantImpactSummary: {} }
  );
  const [snapshots, setSnapshots] = useState<ImpactAnalysisSnapshot[]>(
    impactDependencyMappingEngine.getSnapshots() || []
  );

  const safeSnapshots = snapshots || [];

  // Selected Node for Detail Inspector
  const [inspectedNode, setInspectedNode] = useState<ImpactNode | null>(
    blastResult?.nodes?.[0] || null
  );

  // Search
  const [searchTerm, setSearchTerm] = useState('');

  // Simulation Form State
  const [simChangeTitle, setSimChangeTitle] = useState('Production Database Engine Patch');
  const [simChangeType, setSimChangeType] = useState<'Patching' | 'Hardware Swap' | 'OS Upgrade' | 'Decommissioning' | 'Network Reconfiguration'>('Patching');

  // Success Msg
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleRunAnalysis = (ciId: string, dir: DependencyDirection, depth: number) => {
    const res = impactDependencyMappingEngine.analyzeBlastRadius([ciId], dir, depth);
    setBlastResult(res);
    setInspectedNode(res.nodes[0] || null);
  };

  const handleRunSimulation = () => {
    const res = impactDependencyMappingEngine.simulateChangeRisk({
      targetCiIds: [selectedCiId],
      proposedChangeTitle: simChangeTitle,
      changeType: simChangeType,
      traversalDepth
    });
    setBlastResult(res);
    setInspectedNode(res.nodes[0] || null);
    setSuccessMsg(`Simulated change impact for "${simChangeTitle}". Risk Score: ${res.riskScore}% (${res.riskCategory}).`);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleCreateSnapshot = () => {
    const selCi = canonicalCis.find(c => c.id === selectedCiId);
    const snap = impactDependencyMappingEngine.saveSnapshot(
      `Impact Analysis: ${selCi?.ciName || selectedCiId}`,
      [selCi?.ciName || selectedCiId],
      blastResult
    );
    setSnapshots(impactDependencyMappingEngine.getSnapshots());
    setSuccessMsg(`Snapshot "${snap.title}" saved successfully to Audit log.`);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const filteredCis = canonicalCis.filter(c => 
    c.ciName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.ciClass.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-black text-white p-6 font-sans border border-red-900 shadow-2xl space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-red-900 pb-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-red-600 animate-pulse" />
            <h1 className="text-xl font-bold uppercase tracking-wider text-white">
              CI Impact & Dependency Mapping / Blast-Radius Engine
            </h1>
            <span className="text-xs bg-red-950 text-red-400 px-2 py-0.5 border border-red-800 font-mono">
              Blast-Radius v2026.8
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1 font-mono">
            Downstream/Upstream Relationship Traversal • Change Risk Assessment • Single Point of Failure (SPOF) Detection
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-1 mt-4 md:mt-0 border border-neutral-800 p-1 bg-neutral-950 font-mono text-xs">
          {(
            [
              ['visual_graph', 'Visual Dependency Graph'],
              ['change_simulation', 'Change Risk Simulator'],
              ['snapshots', `Saved Snapshots (${safeSnapshots.length})`]
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

      {/* TAB 1: VISUAL DEPENDENCY GRAPH & BLAST RADIUS INSPECTOR */}
      {activeTab === 'visual_graph' && (
        <div className="space-y-6 font-mono text-xs">
          {/* Controls Header */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-neutral-950 border border-neutral-800 p-4">
            <div className="md:col-span-4 space-y-1">
              <label className="text-[10px] text-neutral-500 uppercase">Select Target CI for Analysis</label>
              <select
                value={selectedCiId}
                onChange={(e) => {
                  setSelectedCiId(e.target.value);
                  handleRunAnalysis(e.target.value, direction, traversalDepth);
                }}
                className="w-full bg-black border border-neutral-800 p-2 text-white font-bold text-xs"
              >
                {canonicalCis.map(c => (
                  <option key={c.id} value={c.id}>{c.ciName} ({c.ciClass})</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-3 space-y-1">
              <label className="text-[10px] text-neutral-500 uppercase">Traversal Direction</label>
              <div className="flex border border-neutral-800 p-0.5 bg-black">
                {(['Downstream', 'Upstream', 'Both'] as const).map(dir => (
                  <button
                    key={dir}
                    onClick={() => {
                      setDirection(dir);
                      handleRunAnalysis(selectedCiId, dir, traversalDepth);
                    }}
                    className={`flex-1 py-1 text-[10px] font-bold uppercase ${
                      direction === dir ? 'bg-red-600 text-white' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    {dir}
                  </button>
                ))}
              </div>
            </div>

            <div className="md:col-span-3 space-y-1">
              <label className="text-[10px] text-neutral-500 uppercase">Traversal Depth Limit</label>
              <select
                value={traversalDepth}
                onChange={(e) => {
                  const d = parseInt(e.target.value);
                  setTraversalDepth(d);
                  handleRunAnalysis(selectedCiId, direction, d);
                }}
                className="w-full bg-black border border-neutral-800 p-2 text-white text-xs"
              >
                <option value={1}>Depth 1 (Direct Dependencies Only)</option>
                <option value={2}>Depth 2 (Direct + 2nd Level)</option>
                <option value={3}>Depth 3 (Extended Chain)</option>
                <option value={5}>Depth 5 (Deep Analysis)</option>
              </select>
            </div>

            <div className="md:col-span-2 flex items-end">
              <button
                onClick={handleCreateSnapshot}
                className="w-full py-2 bg-red-600 hover:bg-red-700 text-white font-bold uppercase text-[10px]"
              >
                Save Snapshot
              </button>
            </div>
          </div>

          {/* Blast Radius Executive Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            <div className="bg-neutral-950 border border-neutral-800 p-3 text-center">
              <span className="text-[10px] text-neutral-500 uppercase">Risk Score</span>
              <div className="text-xl font-bold text-red-500 mt-1">{blastResult.riskScore}% ({blastResult.riskCategory})</div>
            </div>

            <div className="bg-neutral-950 border border-neutral-800 p-3 text-center">
              <span className="text-[10px] text-neutral-500 uppercase">Total Affected CIs</span>
              <div className="text-xl font-bold text-white mt-1">{blastResult.affectedCisCount}</div>
            </div>

            <div className="bg-neutral-950 border border-neutral-800 p-3 text-center">
              <span className="text-[10px] text-neutral-500 uppercase">Direct Downstream</span>
              <div className="text-xl font-bold text-red-400 mt-1">{blastResult.directImpactCount}</div>
            </div>

            <div className="bg-neutral-950 border border-neutral-800 p-3 text-center">
              <span className="text-[10px] text-neutral-500 uppercase">Indirect Downstream</span>
              <div className="text-xl font-bold text-neutral-300 mt-1">{blastResult.indirectImpactCount}</div>
            </div>

            <div className="bg-neutral-950 border border-neutral-800 p-3 text-center">
              <span className="text-[10px] text-neutral-500 uppercase">Affected Applications</span>
              <div className="text-xl font-bold text-white mt-1">{blastResult.affectedApplicationsCount}</div>
            </div>

            <div className="bg-neutral-950 border border-neutral-800 p-3 text-center">
              <span className="text-[10px] text-neutral-500 uppercase">SPOF Identified?</span>
              <div className={`text-xl font-bold mt-1 ${blastResult.isSinglePointOfFailure ? 'text-red-500' : 'text-neutral-400'}`}>
                {blastResult.isSinglePointOfFailure ? 'YES (Critical)' : 'NO'}
              </div>
            </div>
          </div>

          {blastResult.spofDetails && (
            <div className="p-3 bg-red-950 border border-red-800 text-red-200 text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <span>{blastResult.spofDetails}</span>
            </div>
          )}

          {/* Graph Visualizer + Node Detail Inspector */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Visual Node Graph Projection */}
            <div className="lg:col-span-8 bg-neutral-950 border border-neutral-800 p-5 space-y-4">
              <div className="border-b border-neutral-900 pb-2 flex justify-between items-center">
                <h3 className="text-xs font-bold uppercase text-white flex items-center space-x-2">
                  <Network className="w-4 h-4 text-red-600" />
                  <span>Interactive Dependency Graph Visualization ({blastResult.nodes.length} Nodes)</span>
                </h3>
                <span className="text-[10px] text-neutral-500 uppercase">Click node to inspect</span>
              </div>

              {/* Graphical Layout Simulation */}
              <div className="bg-black border border-neutral-900 p-6 min-h-[300px] flex flex-col justify-center items-center space-y-6 relative overflow-hidden">
                <div className="absolute top-2 left-2 text-[9px] text-neutral-600 uppercase font-mono">
                  Traversal Direction: {direction} | Depth: {traversalDepth}
                </div>

                <div className="flex flex-wrap justify-center items-center gap-6 z-10">
                  {blastResult.nodes.map((node, idx) => {
                    const isRoot = blastResult.rootCiIds.includes(node.id);
                    const isSelected = inspectedNode?.id === node.id;

                    return (
                      <div
                        key={node.id}
                        onClick={() => setInspectedNode(node)}
                        className={`p-4 border text-center cursor-pointer transition-all ${
                          isRoot
                            ? 'bg-red-950 border-red-600 text-white shadow-lg shadow-red-900/50 scale-105'
                            : isSelected
                            ? 'bg-neutral-900 border-white text-white'
                            : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-600'
                        }`}
                      >
                        <div className="text-[9px] text-neutral-500 uppercase font-mono">{node.ciClass}</div>
                        <div className="text-xs font-bold uppercase mt-1">{node.ciName}</div>
                        <div className="mt-2 flex justify-center space-x-1">
                          <span className={`px-1.5 py-0.5 text-[8px] font-bold border ${
                            node.criticality === 'Critical' ? 'bg-red-950 text-red-400 border-red-900' : 'bg-black text-neutral-400 border-neutral-800'
                          }`}>
                            {node.criticality}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Dependency Paths Explanation List */}
              <div className="bg-black border border-neutral-900 p-4 space-y-2">
                <div className="text-xs font-bold uppercase text-white border-b border-neutral-900 pb-2">
                  Impact Dependency Path Explanations ({blastResult.dependencyPaths.length})
                </div>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {blastResult.dependencyPaths.map((dp, i) => (
                    <div key={i} className="p-2 bg-neutral-950 border border-neutral-900 text-[10px] text-neutral-300 flex items-center space-x-2">
                      <span className="text-red-600 font-bold">›</span>
                      <span>{dp.explanation}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Node Detail Inspector */}
            <div className="lg:col-span-4 bg-neutral-950 border border-neutral-800 p-5 space-y-4">
              {inspectedNode ? (
                <div className="space-y-4 text-[10px]">
                  <div className="border-b border-neutral-900 pb-2">
                    <span className="text-neutral-500 uppercase">Selected Graph Node Inspector</span>
                    <h3 className="text-sm font-bold uppercase text-white mt-0.5">{inspectedNode.ciName}</h3>
                  </div>

                  <div className="space-y-2 bg-black border border-neutral-900 p-3">
                    <div className="flex justify-between">
                      <span className="text-neutral-500 uppercase">CI Class:</span>
                      <span className="text-white font-bold">{inspectedNode.ciClass}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500 uppercase">Criticality:</span>
                      <span className="text-red-400 font-bold">{inspectedNode.criticality}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500 uppercase">Environment:</span>
                      <span className="text-neutral-300">{inspectedNode.environment}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500 uppercase">Location:</span>
                      <span className="text-neutral-300">{inspectedNode.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500 uppercase">Last Verified:</span>
                      <span className="text-neutral-300">{inspectedNode.lastVerified}</span>
                    </div>
                  </div>

                  <div className="bg-black border border-neutral-900 p-3 space-y-1">
                    <span className="text-neutral-500 uppercase">Single Point of Failure Status</span>
                    <div className={`font-bold mt-1 ${inspectedNode.isSinglePointOfFailure ? 'text-red-500' : 'text-neutral-400'}`}>
                      {inspectedNode.isSinglePointOfFailure ? 'Identified SPOF Node' : 'Redundant Path Available'}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-neutral-500 text-center">
                  Click any node in the graph projection to inspect detailed attributes.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CHANGE RISK SIMULATOR */}
      {activeTab === 'change_simulation' && (
        <div className="space-y-6 font-mono text-xs">
          <div className="bg-neutral-950 border border-neutral-800 p-5 space-y-4 max-w-3xl mx-auto">
            <div className="border-b border-neutral-900 pb-3">
              <h2 className="text-sm font-bold uppercase text-white flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-red-600" />
                <span>Proposed Change Impact Simulator</span>
              </h2>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-neutral-400 uppercase text-[10px] mb-1">Proposed Change Title</label>
                <input
                  type="text"
                  value={simChangeTitle}
                  onChange={(e) => setSimChangeTitle(e.target.value)}
                  className="w-full bg-black border border-neutral-800 p-2 text-white font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 uppercase text-[10px] mb-1">Target CI</label>
                  <select
                    value={selectedCiId}
                    onChange={(e) => setSelectedCiId(e.target.value)}
                    className="w-full bg-black border border-neutral-800 p-2 text-white"
                  >
                    {canonicalCis.map(c => (
                      <option key={c.id} value={c.id}>{c.ciName}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-400 uppercase text-[10px] mb-1">Change Type</label>
                  <select
                    value={simChangeType}
                    onChange={(e) => setSimChangeType(e.target.value as any)}
                    className="w-full bg-black border border-neutral-800 p-2 text-white"
                  >
                    <option value="Patching">Patching</option>
                    <option value="Hardware Swap">Hardware Swap</option>
                    <option value="OS Upgrade">OS Upgrade</option>
                    <option value="Decommissioning">Decommissioning</option>
                    <option value="Network Reconfiguration">Network Reconfiguration</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleRunSimulation}
                className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-wider"
              >
                Run Change Risk Simulation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SAVED SNAPSHOTS */}
      {activeTab === 'snapshots' && (
        <div className="bg-neutral-950 border border-neutral-800 p-5 space-y-4 font-mono text-xs">
          <div className="border-b border-neutral-900 pb-3">
            <h2 className="text-sm font-bold uppercase text-white flex items-center space-x-2">
              <FileCheck className="w-4 h-4 text-red-600" />
              <span>Historical Impact Analysis Snapshots</span>
            </h2>
          </div>

          <div className="space-y-3">
            {snapshots.map(snap => (
              <div key={snap.snapshotId} className="bg-black border border-neutral-800 p-4 space-y-2">
                <div className="flex justify-between items-center border-b border-neutral-900 pb-2">
                  <span className="font-bold text-white text-sm">{snap.title}</span>
                  <span className="text-xs bg-red-950 text-red-400 border border-red-900 px-2 py-0.5 font-bold">
                    Risk: {snap.riskScore}% ({snap.riskCategory})
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-[10px] text-neutral-400">
                  <div>Affected CIs: <strong className="text-white">{snap.affectedCount}</strong></div>
                  <div>Created By: <strong className="text-white">{snap.createdByName}</strong></div>
                  <div>Timestamp: <strong className="text-white">{snap.createdAt}</strong></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
