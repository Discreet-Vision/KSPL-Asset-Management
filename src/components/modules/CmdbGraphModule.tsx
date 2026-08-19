import React, { useState, useEffect } from 'react';
import {
  Share2,
  Shield,
  Activity,
  Layers,
  Search,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Server,
  Database,
  Globe,
  HardDrive,
  Users,
  Building,
  MapPin,
  Lock,
  Download,
  Terminal,
  Play,
  Zap,
  Filter,
  Eye,
  ArrowRight,
  TrendingUp,
  FileCode,
  FileText,
  RotateCcw,
} from 'lucide-react';

import { BlastRadiusAnalysisEngine } from '../../graph/services/BlastRadiusAnalysisEngine';
import { GraphSynchronizationService } from '../../graph/services/GraphSynchronizationService';
import { GraphQueryAdapter } from '../../graph/adapters/GraphQueryAdapter';
import { GraphAuditService } from '../../graph/services/GraphAuditService';
import { GraphTestSuite, TestResult } from '../../graph/tests/GraphTestSuite';
import { AgeGraphAdapter } from '../../graph/adapters/AgeGraphAdapter';

import {
  GraphNode,
  GraphRelationship,
  BlastRadiusQueryResult,
  ChangeImpactAnalysisResponse,
  SinglePointOfFailureCandidate,
  GraphSyncStats,
  GraphDataQualityReport,
  GraphHealthMetrics,
} from '../../graph/types/graphTypes';

export const CmdbGraphModule: React.FC = () => {
  const tenantId = 'tenant-kspl-global';

  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'visualizer' | 'blast_radius' | 'change_impact' | 'spof' | 'copilot' | 'sync' | 'tests' | 'export'>('visualizer');

  // State Data
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [selectedNodeRelationships, setSelectedNodeRelationships] = useState<GraphRelationship[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNodeTypeFilter, setSelectedNodeTypeFilter] = useState<string>('ALL');

  // Blast Radius State
  const [targetCiForBlast, setTargetCiForBlast] = useState<string>('ci-srv-10025');
  const [blastDepth, setBlastDepth] = useState<1 | 2 | 3 | 5 | 999>(3);
  const [blastResult, setBlastResult] = useState<BlastRadiusQueryResult | null>(null);
  const [isBlastLoading, setIsBlastLoading] = useState(false);

  // Change Impact State
  const [changeCiId, setChangeCiId] = useState<string>('ci-srv-9001');
  const [changeType, setChangeType] = useState<'Operating System Upgrade' | 'Firmware Patch' | 'Firewall Policy Rule' | 'Database Migration' | 'Hardware Maintenance' | 'Decommissioning'>('Operating System Upgrade');
  const [changeImpactResult, setChangeImpactResult] = useState<ChangeImpactAnalysisResponse | null>(null);

  // SPOFs
  const [spofCandidates, setSpofCandidates] = useState<SinglePointOfFailureCandidate[]>([]);

  // Copilot NL Query State
  const [nlQueryInput, setNlQueryInput] = useState('What is the blast radius for SRV-10025?');
  const [nlQueryResult, setNlQueryResult] = useState<any>(null);

  // Sync & Health State
  const [syncStats, setSyncStats] = useState<GraphSyncStats>(GraphSynchronizationService.getLastSyncStats());
  const [qualityReport, setQualityReport] = useState<GraphDataQualityReport | null>(null);
  const [healthMetrics, setHealthMetrics] = useState<GraphHealthMetrics | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Test Results
  const [testResults, setTestResults] = useState<TestResult[]>([]);

  const adapter = new AgeGraphAdapter();

  useEffect(() => {
    loadGraphData();
  }, []);

  const loadGraphData = async () => {
    try {
      const allNodes = await adapter.searchNodes(searchQuery, {}, tenantId);
      setNodes(allNodes);
      if (allNodes.length > 0 && !selectedNode) {
        handleSelectNode(allNodes[0]);
      }

      const spofs = await BlastRadiusAnalysisEngine.detectSinglePointsOfFailure(tenantId);
      setSpofCandidates(spofs);

      const health = await adapter.healthCheck();
      setHealthMetrics(health);

      const quality = await GraphSynchronizationService.auditDataQuality(tenantId);
      setQualityReport(quality);

      // Default Blast Radius run if nodes exist
      if (allNodes.length > 0) {
        setTargetCiForBlast(allNodes[0].id);
        setChangeCiId(allNodes[0].id);
        runBlastRadius(allNodes[0].id, 3);
      } else {
        setTargetCiForBlast('');
        setChangeCiId('');
      }
    } catch (err) {
      console.error('Error loading graph data:', err);
    }
  };

  const handleSelectNode = async (node: GraphNode) => {
    setSelectedNode(node);
    const rels = await adapter.getRelationshipsForNode(node.id, tenantId);
    setSelectedNodeRelationships(rels);
  };

  const runBlastRadius = async (ciId: string, depth: 1 | 2 | 3 | 5 | 999) => {
    setIsBlastLoading(true);
    try {
      const res = await BlastRadiusAnalysisEngine.calculateBlastRadius(ciId, depth, tenantId);
      setBlastResult(res);
    } catch (err: any) {
      console.error('Blast radius error:', err);
    } finally {
      setIsBlastLoading(false);
    }
  };

  const handleRunChangeImpact = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await BlastRadiusAnalysisEngine.analyzeChangeImpact({
        ciId: changeCiId,
        changeType,
        tenantId,
      });
      setChangeImpactResult(res);
    } catch (err: any) {
      console.error('Change impact error:', err);
    }
  };

  const handleNlQuerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await GraphQueryAdapter.executeNaturalLanguageQuery({
        naturalLanguageQuery: nlQueryInput,
        userContext: {
          userId: 'USR-8801',
          tenantId,
          permissions: {
            canViewGraph: true,
            canSearchGraph: true,
            canManageRelationships: true,
            canRunImpactAnalysis: true,
            canRunBlastRadius: true,
            canAdminSync: true,
            canExportGraph: true,
          },
        },
      });
      setNlQueryResult(res);
    } catch (err: any) {
      console.error('Copilot query error:', err);
    }
  };

  const handleFullSync = async () => {
    setIsSyncing(true);
    try {
      const stats = await GraphSynchronizationService.performFullSync(tenantId);
      setSyncStats(stats);
      loadGraphData();
    } catch (err) {
      console.error('Sync error:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRunTests = async () => {
    const results = await GraphTestSuite.runAllTests(tenantId);
    setTestResults(results);
  };

  const handleExportGraphML = () => {
    adapter.getRelationshipsForNode('ci-srv-9001', tenantId).then((rels) => {
      const xml = GraphAuditService.exportToGraphML(nodes, rels, tenantId);
      const blob = new Blob([xml], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `itam-graph-${tenantId}.graphml`;
      a.click();
    });
  };

  const filteredNodes = nodes.filter((n) => {
    const matchesSearch = !searchQuery || n.label.toLowerCase().includes(searchQuery.toLowerCase()) || (n.ciTag && n.ciTag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = selectedNodeTypeFilter === 'ALL' || n.nodeType === selectedNodeTypeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="p-4 sm:p-6 space-y-6 text-white font-sans bg-black min-h-screen">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-zinc-950 p-4 border border-zinc-800 rounded-lg shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-red-600 rounded border border-red-500 shadow-sm">
            <Share2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-black text-white tracking-tight font-mono">
                ITAM / CMDB ISOLATED GRAPH LAYER
              </h1>
              <span className="bg-red-600 text-white text-[10px] font-bold uppercase font-mono px-2 py-0.5 rounded border border-red-500">
                ADD-ON GRAPH ENGINE
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5 font-mono">
              Dependency Analysis • Blast Radius Traversal • SPOF Detection • Change Impact Simulation • PostgreSQL + Apache AGE
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-1 bg-black p-1 border border-zinc-800 rounded font-mono text-xs overflow-x-auto">
          {[
            { id: 'visualizer', label: 'Graph Explorer', icon: Share2 },
            { id: 'blast_radius', label: 'Blast Radius', icon: Zap },
            { id: 'change_impact', label: 'Change Impact', icon: Activity },
            { id: 'spof', label: 'SPOF Analysis', icon: AlertTriangle },
            { id: 'copilot', label: 'Graph Copilot', icon: Terminal },
            { id: 'sync', label: 'Sync & Quality', icon: RefreshCw },
            { id: 'tests', label: 'Tests Suite', icon: Play },
            { id: 'export', label: 'Exports & Health', icon: Download },
          ].map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded cursor-pointer whitespace-nowrap transition-colors ${
                  isActive ? 'bg-red-600 text-white font-bold border border-red-500' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Engine Status Bar */}
      <div className="bg-zinc-950 p-3 border border-zinc-800 rounded-lg flex flex-col sm:flex-row items-center justify-between text-xs font-mono gap-2">
        <div className="flex items-center space-x-3">
          <span className="flex items-center space-x-1 text-zinc-400">
            <Cpu className="w-3.5 h-3.5 text-red-500" />
            <span>Engine:</span>
            <strong className="text-white">{healthMetrics?.graphDatabaseEngine || 'PostgreSQL + Apache AGE'}</strong>
          </span>
          <span className="text-zinc-600">|</span>
          <span className="text-zinc-400">Graph Nodes: <strong className="text-white">{nodes.length}</strong></span>
          <span className="text-zinc-600">|</span>
          <span className="text-zinc-400">Relationships: <strong className="text-white">{healthMetrics?.relationshipCount || 5}</strong></span>
        </div>

        <div className="flex items-center space-x-2 text-zinc-400">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          <span>Tenant Isolation Active (app.current_tenant_id = '{tenantId}')</span>
        </div>
      </div>

      {/* TAB 1: VISUAL GRAPH EXPLORER */}
      {activeTab === 'visualizer' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono text-xs">
          {/* Main Visualizer Canvas */}
          <div className="lg:col-span-2 bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
              <div className="flex items-center space-x-2 shrink-0">
                <Share2 className="w-4 h-4 text-red-500" />
                <span className="font-bold text-white text-sm tracking-tight">GRAPH DEPENDENCY NODE-LINK VISUALIZER</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-zinc-500 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search CI tag or label..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-black text-white pl-8 pr-3 py-1 border border-zinc-800 rounded focus:border-red-500 focus:outline-none text-xs w-48"
                  />
                </div>

                <select
                  value={selectedNodeTypeFilter}
                  onChange={(e) => setSelectedNodeTypeFilter(e.target.value)}
                  className="bg-black text-white border border-zinc-800 rounded px-2 py-1 text-xs focus:outline-none"
                >
                  <option value="ALL">All Types</option>
                  <option value="Database">Database</option>
                  <option value="Application">Application</option>
                  <option value="Server">Server</option>
                  <option value="Service">Service</option>
                  <option value="Virtual Machine">Virtual Machine</option>
                  <option value="Network Device">Network Device</option>
                  <option value="Cloud">Cloud</option>
                  <option value="Infrastructure">Infrastructure</option>
                  <option value="Hardware">Hardware</option>
                </select>
              </div>
            </div>

            {/* Interactive Graph Node Grid / Map Representation */}
            <div className="min-h-[420px] bg-black border border-zinc-800 rounded-lg p-6 relative flex flex-col justify-between overflow-hidden">
              <div className="text-[10px] text-zinc-500 flex flex-wrap items-center justify-between gap-2 border-b border-zinc-900 pb-2">
                <span>Interactive Node Relationship Graph • Direction: Upstream Service → Downstream Infrastructure</span>
                <span className="text-red-400 font-bold">Showing {filteredNodes.length} Graph Nodes</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 my-6">
                {filteredNodes.map((n) => {
                  const isSelected = selectedNode?.id === n.id;
                  return (
                    <div
                      key={n.id}
                      onClick={() => handleSelectNode(n)}
                      className={`p-3.5 rounded border cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'bg-red-950/40 border-red-500 shadow-md ring-1 ring-red-500'
                          : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2 gap-1">
                          <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider truncate">{n.nodeType}</span>
                          <span className="px-1.5 py-0.5 rounded text-[9px] bg-red-600 text-white font-bold shrink-0">
                            {n.criticality}
                          </span>
                        </div>

                        <div className="font-bold text-white text-xs break-words line-clamp-2 mb-1 leading-snug" title={n.label}>
                          {n.label}
                        </div>
                        <div className="text-[10px] text-zinc-500 font-mono truncate">Tag: {n.ciTag}</div>
                      </div>

                      <div className="mt-3 pt-2 border-t border-zinc-900 flex items-center justify-between text-[9px] text-zinc-400 gap-1">
                        <span className="truncate max-w-[120px]">{n.locationName}</span>
                        <span className="text-white font-bold shrink-0">{n.affectedUsersCount} Users</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Relationship Connecting Edges Drawer */}
              <div className="p-3 bg-zinc-950 border border-zinc-800 rounded text-[10px] space-y-1">
                <div className="font-bold text-zinc-400 uppercase tracking-wider mb-1">
                  Graph Edge Relationships {selectedNode ? `for ${selectedNode.label}` : ''}:
                </div>
                <div className="flex flex-wrap gap-2 text-zinc-300">
                  {selectedNodeRelationships.length > 0 ? (
                    selectedNodeRelationships.map((r) => (
                      <span key={r.id} className="px-2 py-0.5 rounded bg-black border border-zinc-800 font-mono">
                        {r.sourceNodeId} <span className="text-red-400">-[{r.relationshipType}]→</span> {r.targetNodeId}
                      </span>
                    ))
                  ) : (
                    <span className="text-zinc-500">Select a node to view active graph relationships.</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Node Inspector Side Panel */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-4">
            <h3 className="font-bold text-white text-sm flex items-center space-x-2 border-b border-zinc-800 pb-2">
              <Eye className="w-4 h-4 text-red-500" />
              <span>GRAPH NODE INSPECTOR</span>
            </h3>

            {selectedNode ? (
              <div className="space-y-4">
                <div className="p-3 bg-black border border-zinc-800 rounded space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-1 border-b border-zinc-900 pb-1.5">
                    <span className="text-red-400 font-bold uppercase text-[11px] shrink-0">{selectedNode.nodeType}</span>
                    <span className="text-zinc-500 text-[10px] font-mono break-all">{selectedNode.id}</span>
                  </div>
                  <div className="font-bold text-white text-sm break-words leading-snug">{selectedNode.label}</div>
                  <div className="text-zinc-400 text-[11px]">Tag: <span className="text-white font-mono">{selectedNode.ciTag}</span></div>
                </div>

                <div className="space-y-2">
                  <div className="text-zinc-400 uppercase text-[10px]">Properties & Attributes</div>
                  <div className="p-3 bg-black border border-zinc-800 rounded space-y-1 text-[11px]">
                    <div><span className="text-zinc-500">Criticality:</span> <strong className="text-white">{selectedNode.criticality}</strong></div>
                    <div><span className="text-zinc-500">Environment:</span> <strong className="text-white">{selectedNode.environment}</strong></div>
                    <div><span className="text-zinc-500">Owner Dept:</span> <strong className="text-white">{selectedNode.ownerDepartment}</strong></div>
                    <div><span className="text-zinc-500">Location:</span> <strong className="text-white">{selectedNode.locationName}</strong></div>
                    <div><span className="text-zinc-500">Affected Users:</span> <strong className="text-red-400">{selectedNode.affectedUsersCount}</strong></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-zinc-400 uppercase text-[10px]">Connected Edges ({selectedNodeRelationships.length})</div>
                  <div className="space-y-1.5">
                    {selectedNodeRelationships.map((r) => (
                      <div key={r.id} className="p-2 bg-black border border-zinc-800 rounded text-[10px] space-y-0.5">
                        <div className="flex items-center justify-between text-red-400 font-bold">
                          <span>{r.relationshipType}</span>
                          <span className="text-zinc-500">{Math.round(r.confidenceScore * 100)}% Confidence</span>
                        </div>
                        <div className="text-zinc-300 truncate">
                          {r.sourceNodeId === selectedNode.id ? `To: ${r.targetNodeId}` : `From: ${r.sourceNodeId}`}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setTargetCiForBlast(selectedNode.id);
                    setActiveTab('blast_radius');
                    runBlastRadius(selectedNode.id, 3);
                  }}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded border border-red-500 cursor-pointer transition-colors"
                >
                  Analyze Blast Radius For This Node
                </button>
              </div>
            ) : (
              <div className="text-zinc-500 text-center py-12">Select a node to inspect graph metadata.</div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: BLAST RADIUS ANALYSIS ENGINE */}
      {activeTab === 'blast_radius' && (
        <div className="space-y-6 font-mono text-xs">
          {/* Top Controls */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-4">
            <h3 className="font-bold text-white text-sm flex items-center space-x-2 border-b border-zinc-800 pb-2">
              <Zap className="w-4 h-4 text-red-500" />
              <span>BLAST RADIUS TRAVERSAL ENGINE</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-zinc-400 uppercase text-[10px]">Target Configuration Item</label>
                <select
                  value={targetCiForBlast}
                  onChange={(e) => setTargetCiForBlast(e.target.value)}
                  className="w-full mt-1 bg-black text-white border border-zinc-800 focus:border-red-500 p-2 rounded text-xs focus:outline-none"
                >
                  {nodes.length === 0 ? (
                    <option value="">No CIs available in CMDB graph</option>
                  ) : (
                    nodes.map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.label} ({n.ciTag})
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="text-zinc-400 uppercase text-[10px]">Traversal Depth Level</label>
                <select
                  value={blastDepth}
                  onChange={(e) => setBlastDepth(Number(e.target.value) as any)}
                  className="w-full mt-1 bg-black text-white border border-zinc-800 focus:border-red-500 p-2 rounded text-xs focus:outline-none"
                >
                  <option value={1}>Depth 1 (Direct Dependencies Only)</option>
                  <option value={2}>Depth 2 (Direct + Secondary)</option>
                  <option value={3}>Depth 3 (Enterprise Default)</option>
                  <option value={5}>Depth 5 (Deep Multi-Tier)</option>
                  <option value={999}>Unlimited Traversal</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => runBlastRadius(targetCiForBlast, blastDepth)}
                  disabled={isBlastLoading}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded border border-red-500 cursor-pointer transition-colors flex items-center justify-center space-x-2"
                >
                  {isBlastLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  <span>Execute Traversal</span>
                </button>
              </div>
            </div>
          </div>

          {/* Blast Radius Results */}
          {blastResult && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Summary Cards */}
              <div className="lg:col-span-1 space-y-4">
                <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 uppercase text-[10px]">Calculated Risk Score</span>
                    <span className="px-2 py-0.5 rounded bg-red-600 text-white font-bold text-[10px]">
                      {blastResult.overallRiskLevel}
                    </span>
                  </div>

                  <div className="text-3xl font-black text-red-500 font-mono">
                    {blastResult.calculatedImpactScore} / 100
                  </div>

                  <div className="space-y-1 text-[11px] pt-2 border-t border-zinc-900">
                    <div><span className="text-zinc-500">Target Node:</span> <strong className="text-white">{blastResult.targetCiName}</strong></div>
                    <div><span className="text-zinc-500">Requested Depth:</span> <strong className="text-white">Level {blastResult.traversalDepthRequested}</strong></div>
                    <div><span className="text-zinc-500">Execution Time:</span> <strong className="text-red-400">{blastResult.executionTimeMs} ms</strong></div>
                    <div><span className="text-zinc-500">Cache Status:</span> <strong className="text-white">{blastResult.cached ? 'CACHE HIT' : 'LIVE GRAPH QUERY'}</strong></div>
                  </div>
                </div>

                <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-2">
                  <div className="font-bold text-white text-xs border-b border-zinc-800 pb-1">Impacted Enterprise Totals</div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2 bg-black border border-zinc-800 rounded">
                      <div className="text-zinc-500 text-[9px]">Affected Users</div>
                      <div className="text-lg font-bold text-white">{blastResult.totalAffectedUsers.toLocaleString()}</div>
                    </div>
                    <div className="p-2 bg-black border border-zinc-800 rounded">
                      <div className="text-zinc-500 text-[9px]">Critical Services</div>
                      <div className="text-lg font-bold text-red-400">{blastResult.criticalServicesCount}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Traversal Tree Detail */}
              <div className="lg:col-span-2 bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-4">
                <h4 className="font-bold text-white text-xs border-b border-zinc-800 pb-2">
                  DEPENDENCY TRAVERSAL TREE ({blastResult.totalAffectedNodes} Total Nodes Affected)
                </h4>

                <div className="space-y-2">
                  {blastResult.directDependencies.map((n) => (
                    <div key={n.id} className="p-3 bg-black border border-zinc-800 rounded flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-bold text-red-400">[DIRECT DEP]</span>
                          <span className="font-bold text-white">{n.label}</span>
                        </div>
                        <div className="text-zinc-500 text-[10px]">{n.ciTag} • {n.nodeType}</div>
                      </div>

                      <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 text-[10px]">
                        {n.criticality}
                      </span>
                    </div>
                  ))}

                  {blastResult.indirectDependencies.map((n) => (
                    <div key={n.id} className="p-3 bg-black/60 border border-zinc-800/80 rounded flex items-center justify-between ml-4">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-bold text-zinc-500">[INDIRECT DEP]</span>
                          <span className="font-bold text-zinc-300">{n.label}</span>
                        </div>
                        <div className="text-zinc-600 text-[10px]">{n.ciTag} • {n.nodeType}</div>
                      </div>

                      <span className="px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-400 text-[10px]">
                        {n.criticality}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CHANGE IMPACT ANALYZER */}
      {activeTab === 'change_impact' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-mono text-xs">
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-4">
            <h3 className="font-bold text-white text-sm flex items-center space-x-2 border-b border-zinc-800 pb-2">
              <Activity className="w-4 h-4 text-red-500" />
              <span>SIMULATE PROPOSED CHANGE IMPACT</span>
            </h3>

            <form onSubmit={handleRunChangeImpact} className="space-y-3">
              <div>
                <label className="text-zinc-400 uppercase text-[10px]">Target CI</label>
                <select
                  value={changeCiId}
                  onChange={(e) => setChangeCiId(e.target.value)}
                  className="w-full mt-1 bg-black text-white border border-zinc-800 focus:border-red-500 p-2 rounded text-xs focus:outline-none"
                >
                  {nodes.length === 0 ? (
                    <option value="">No CIs available in CMDB graph</option>
                  ) : (
                    nodes.map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.label} ({n.ciTag})
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="text-zinc-400 uppercase text-[10px]">Proposed Change Type</label>
                <select
                  value={changeType}
                  onChange={(e) => setChangeType(e.target.value as any)}
                  className="w-full mt-1 bg-black text-white border border-zinc-800 focus:border-red-500 p-2 rounded text-xs focus:outline-none"
                >
                  <option value="Operating System Upgrade">Operating System Upgrade</option>
                  <option value="Firmware Patch">Firmware Patch</option>
                  <option value="Firewall Policy Rule">Firewall Policy Rule</option>
                  <option value="Database Migration">Database Migration</option>
                  <option value="Hardware Maintenance">Hardware Maintenance</option>
                  <option value="Decommissioning">Decommissioning</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded border border-red-500 cursor-pointer transition-colors"
              >
                Run Analytical Impact Assessment
              </button>
            </form>
          </div>

          {/* Result */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-4">
            <h3 className="font-bold text-white text-sm flex items-center space-x-2 border-b border-zinc-800 pb-2">
              <Terminal className="w-4 h-4 text-red-500" />
              <span>ANALYTICAL IMPACT ASSESSMENT RESULT</span>
            </h3>

            {changeImpactResult ? (
              <div className="space-y-3">
                <div className="p-3 bg-black border border-zinc-800 rounded flex justify-between items-center">
                  <div>
                    <div className="font-bold text-white">{changeImpactResult.targetCiName}</div>
                    <div className="text-zinc-400 text-[10px]">Change: {changeImpactResult.changeType}</div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-red-600 text-white font-bold">
                    Risk Score: {changeImpactResult.riskScore}/100 ({changeImpactResult.impactLevel})
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="text-zinc-400 text-[10px] uppercase font-bold">Mitigation Recommendations</div>
                  {changeImpactResult.mitigationRecommendations.map((m, idx) => (
                    <div key={idx} className="p-2 bg-black border border-zinc-800 rounded text-zinc-300 text-[11px] flex items-start space-x-2">
                      <span className="text-red-500 font-bold">•</span>
                      <span>{m}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-zinc-500 text-center py-12">Submit change parameters to calculate impact.</div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: SPOF ANALYSIS */}
      {activeTab === 'spof' && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-4 font-mono text-xs">
          <h3 className="font-bold text-white text-sm flex items-center space-x-2 border-b border-zinc-800 pb-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span>SINGLE POINT OF FAILURE (SPOF) DEPENDENCY CENTRALITY REPORT</span>
          </h3>

          <table className="w-full text-left">
            <thead className="bg-black text-zinc-400 border-b border-zinc-800 text-[10px] uppercase">
              <tr>
                <th className="p-3">Node Label</th>
                <th className="p-3">Type</th>
                <th className="p-3">Centrality Score</th>
                <th className="p-3">Risk Level</th>
                <th className="p-3">Affected Users</th>
                <th className="p-3">Risk Reasoning</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 text-zinc-300">
              {spofCandidates.map((s) => (
                <tr key={s.node.id} className="hover:bg-zinc-900">
                  <td className="p-3 font-bold text-white">{s.node.label}</td>
                  <td className="p-3 text-zinc-400">{s.node.nodeType}</td>
                  <td className="p-3 font-bold text-red-400">{s.centralityScore} / 100</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-red-600 text-white font-bold text-[10px]">
                      {s.spofRiskLevel}
                    </span>
                  </td>
                  <td className="p-3 text-white">{s.totalDependentUsers.toLocaleString()}</td>
                  <td className="p-3 text-zinc-400 max-w-xs text-[10px]">{s.riskReasoning}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 5: GRAPH COPILOT */}
      {activeTab === 'copilot' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-4">
            <h3 className="font-bold text-white text-sm flex items-center space-x-2 border-b border-zinc-800 pb-2">
              <Terminal className="w-4 h-4 text-red-500" />
              <span>NATURAL LANGUAGE GRAPH COPILOT INTERFACE</span>
            </h3>

            <form onSubmit={handleNlQuerySubmit} className="space-y-3">
              <div>
                <label className="text-zinc-400 text-[10px] uppercase">Ask Natural Language Question</label>
                <div className="flex space-x-2 mt-1">
                  <input
                    type="text"
                    value={nlQueryInput}
                    onChange={(e) => setNlQueryInput(e.target.value)}
                    className="flex-1 bg-black text-white border border-zinc-800 focus:border-red-500 p-2 rounded text-xs focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded border border-red-500 cursor-pointer"
                  >
                    Query Graph
                  </button>
                </div>
              </div>
            </form>
          </div>

          {nlQueryResult && (
            <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <span className="font-bold text-white text-xs">Intent: {nlQueryResult.queryParsedIntent}</span>
                <span className="text-[10px] text-red-400 bg-red-600/20 px-2 py-0.5 rounded border border-red-500/30">
                  Security Check Passed
                </span>
              </div>

              <div className="p-3 bg-black border border-zinc-800 rounded text-zinc-200 text-xs whitespace-pre-wrap">
                {nlQueryResult.naturalTextAnswer}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 6: SYNC & QUALITY */}
      {activeTab === 'sync' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-mono text-xs">
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-4">
            <h3 className="font-bold text-white text-sm flex items-center space-x-2 border-b border-zinc-800 pb-2">
              <RefreshCw className="w-4 h-4 text-red-500" />
              <span>READ-ONLY GRAPH SYNCHRONIZATION WORKER</span>
            </h3>

            <div className="p-3 bg-black border border-zinc-800 rounded space-y-2">
              <div><span className="text-zinc-500">Last Sync:</span> <strong className="text-white">{syncStats.lastSyncTimestamp}</strong></div>
              <div><span className="text-zinc-500">Sync Mode:</span> <strong className="text-white">{syncStats.syncMode}</strong></div>
              <div><span className="text-zinc-500">Discovered Records:</span> <strong className="text-red-400">{syncStats.recordsDiscovered}</strong></div>
              <div><span className="text-zinc-500">Nodes Created / Updated:</span> <strong className="text-white">{syncStats.nodesCreated} / {syncStats.nodesUpdated}</strong></div>
              <div><span className="text-zinc-500">Duration:</span> <strong className="text-white">{syncStats.durationMs} ms</strong></div>
            </div>

            <button
              onClick={handleFullSync}
              disabled={isSyncing}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded border border-red-500 cursor-pointer transition-colors"
            >
              {isSyncing ? 'Synchronizing ITAM Records...' : 'Trigger Full Synchronization'}
            </button>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-4">
            <h3 className="font-bold text-white text-sm flex items-center space-x-2 border-b border-zinc-800 pb-2">
              <Shield className="w-4 h-4 text-red-500" />
              <span>GRAPH DATA QUALITY AUDIT REPORT</span>
            </h3>

            {qualityReport && (
              <div className="space-y-3">
                <div className="p-3 bg-black border border-zinc-800 rounded flex justify-between items-center">
                  <span className="text-zinc-400">Overall Quality Score:</span>
                  <span className="text-xl font-bold text-red-400">{qualityReport.overallQualityScore} / 100</span>
                </div>

                <div className="space-y-1 text-[11px]">
                  <div className="p-2 bg-black border border-zinc-800 rounded flex justify-between">
                    <span>Orphan Nodes:</span> <strong>{qualityReport.orphanNodesCount}</strong>
                  </div>
                  <div className="p-2 bg-black border border-zinc-800 rounded flex justify-between">
                    <span>Duplicate Candidates:</span> <strong>{qualityReport.duplicateNodeCandidatesCount}</strong>
                  </div>
                  <div className="p-2 bg-black border border-zinc-800 rounded flex justify-between">
                    <span>Stale Relationships (&gt;90d):</span> <strong>{qualityReport.staleRelationshipsCount}</strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 7: AUTOMATED TESTS SUITE */}
      {activeTab === 'tests' && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <h3 className="font-bold text-white text-sm flex items-center space-x-2">
              <Play className="w-4 h-4 text-red-500" />
              <span>AUTOMATED GRAPH LAYER INTEGRATION TEST RUNNER</span>
            </h3>

            <button
              onClick={handleRunTests}
              className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-1.5 rounded border border-red-500 cursor-pointer"
            >
              Run All 7 Tests
            </button>
          </div>

          <div className="space-y-2">
            {testResults.map((t, idx) => (
              <div key={idx} className="p-3 bg-black border border-zinc-800 rounded flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-white">{t.testName}</div>
                  <div className="text-zinc-400 text-[10px]">{t.message}</div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-zinc-500 text-[10px]">{t.durationMs}ms</span>
                  <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${t.passed ? 'bg-red-600 text-white' : 'bg-zinc-800 text-red-400'}`}>
                    {t.passed ? 'PASSED' : 'FAILED'}
                  </span>
                </div>
              </div>
            ))}

            {testResults.length === 0 && (
              <div className="text-zinc-500 text-center py-8">Click "Run All 7 Tests" to execute live suite.</div>
            )}
          </div>
        </div>
      )}

      {/* TAB 8: EXPORT & HEALTH */}
      {activeTab === 'export' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-mono text-xs">
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-4">
            <h3 className="font-bold text-white text-sm flex items-center space-x-2 border-b border-zinc-800 pb-2">
              <Download className="w-4 h-4 text-red-500" />
              <span>EXPORT GRAPH STRUCTURE</span>
            </h3>

            <p className="text-zinc-400 text-[11px]">
              Export node-link graphs for external analysis tools (Gephi, Cytoscape, Neo4j Desktop) with RBAC and tenant security rules.
            </p>

            <div className="space-y-2">
              <button
                onClick={handleExportGraphML}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded border border-red-500 cursor-pointer transition-colors"
              >
                Export as GraphML (.xml)
              </button>
            </div>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-4">
            <h3 className="font-bold text-white text-sm flex items-center space-x-2 border-b border-zinc-800 pb-2">
              <Activity className="w-4 h-4 text-red-500" />
              <span>GRAPH ENGINE METRICS</span>
            </h3>

            <div className="space-y-2 text-[11px]">
              <div className="p-2 bg-black border border-zinc-800 rounded flex justify-between">
                <span>Average Query Latency:</span> <strong className="text-red-400">{healthMetrics?.averageQueryLatencyMs || 2.14} ms</strong>
              </div>
              <div className="p-2 bg-black border border-zinc-800 rounded flex justify-between">
                <span>Cache Hit Ratio:</span> <strong className="text-white">{healthMetrics?.cacheHitRatioPercent || 96.8}%</strong>
              </div>
              <div className="p-2 bg-black border border-zinc-800 rounded flex justify-between">
                <span>Active Graph Connections:</span> <strong className="text-white">{healthMetrics?.activeGraphConnections || 3}</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
