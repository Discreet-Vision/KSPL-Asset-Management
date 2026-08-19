import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ConfigurationItem, CIRelationship } from '../../types';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Zap,
  Network,
  Server,
  Layers,
  Search,
  Filter,
  CheckCheck,
  Cpu,
  Database,
  Radio,
  Sliders,
  ShieldCheck,
  Share2,
  RefreshCw,
  Info,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import {
  analyzeServerNamingAndTopology,
  CiRelationshipProposal,
} from '../../backend/aiRelationshipSuggester';

interface AiCiRelationshipSuggesterProps {
  onNavigateToGraph?: () => void;
}

export const AiCiRelationshipSuggester: React.FC<AiCiRelationshipSuggesterProps> = ({
  onNavigateToGraph,
}) => {
  const { configurationItems, ciRelationships, addRelationship, addAuditEntry } = useApp();

  const [proposals, setProposals] = useState<CiRelationshipProposal[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [minConfidence, setMinConfidence] = useState(75);
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [selectedProposal, setSelectedProposal] = useState<CiRelationshipProposal | null>(null);
  const [lastAnalysisTimestamp, setLastAnalysisTimestamp] = useState<string | null>(null);

  // Run AI analysis on mount or on demand
  const runAiAnalysis = async () => {
    setIsAnalyzing(true);
    setSuccessToast(null);

    try {
      // First try server-side AI endpoint with Gemini / server logic
      const res = await fetch('/api/cmdb/relationships/suggest-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          configurationItems,
          existingRelationships: ciRelationships,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.suggestions && data.suggestions.length > 0) {
          setProposals(data.suggestions);
          setSelectedProposal(data.suggestions[0] || null);
          setLastAnalysisTimestamp(new Date().toLocaleTimeString());
          return;
        }
      }
      throw new Error('Fallback to client heuristic engine');
    } catch (e) {
      // Deterministic Client Heuristic AI Engine
      const results = analyzeServerNamingAndTopology(
        configurationItems.map((c) => ({
          id: c.id,
          name: c.name,
          ciClassName: c.ciClassName,
          category: c.category,
          ipAddress: c.ipAddress,
          locationId: c.locationId,
          locationName: c.locationName,
          manufacturer: c.manufacturer,
          model: c.model,
        })),
        ciRelationships.map((r) => ({
          sourceCiId: r.sourceCiId,
          targetCiId: r.targetCiId,
          type: r.type,
        }))
      );

      setProposals(results);
      setSelectedProposal(results[0] || null);
      setLastAnalysisTimestamp(new Date().toLocaleTimeString());
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    if (proposals.length === 0 && configurationItems.length > 0) {
      runAiAnalysis();
    }
  }, [configurationItems.length]);

  const handleApproveProposal = (proposal: CiRelationshipProposal) => {
    // Add relationship into CMDB
    addRelationship({
      sourceCiId: proposal.sourceCiId,
      sourceCiName: proposal.sourceCiName,
      targetCiId: proposal.targetCiId,
      targetCiName: proposal.targetCiName,
      type: proposal.relationshipType as CIRelationship['type'],
    });

    addAuditEntry(
      'CREATE',
      'CIRelationship',
      `rel-${Date.now()}`,
      `AI-Inferred: ${proposal.sourceCiName} --${proposal.relationshipType}--> ${proposal.targetCiName} (${proposal.confidenceScore}% confidence)`
    );

    // Remove approved proposal from pending list
    setProposals((prev) => prev.filter((p) => p.id !== proposal.id));
    setSuccessToast(
      `Approved and linked '${proposal.sourceCiName}' --[${proposal.relationshipType}]--> '${proposal.targetCiName}' in CMDB graph.`
    );
    setTimeout(() => setSuccessToast(null), 4500);
  };

  const handleRejectProposal = (proposalId: string) => {
    setProposals((prev) => prev.filter((p) => p.id !== proposalId));
  };

  const handleBatchApproveHighConfidence = () => {
    const highConf = proposals.filter((p) => p.confidenceScore >= 85);
    if (highConf.length === 0) return;

    highConf.forEach((prop) => {
      addRelationship({
        sourceCiId: prop.sourceCiId,
        sourceCiName: prop.sourceCiName,
        targetCiId: prop.targetCiId,
        targetCiName: prop.targetCiName,
        type: prop.relationshipType as CIRelationship['type'],
      });
    });

    addAuditEntry(
      'CREATE',
      'CIRelationship',
      `batch-ai-${Date.now()}`,
      `Batch approved ${highConf.length} AI-inferred CI relationships`
    );

    setProposals((prev) => prev.filter((p) => p.confidenceScore < 85));
    setSuccessToast(
      `Batch accepted ${highConf.length} high-confidence relationships into CMDB topology.`
    );
    setTimeout(() => setSuccessToast(null), 4500);
  };

  // Filtered proposals
  const filteredProposals = proposals.filter((p) => {
    if (p.confidenceScore < minConfidence) return false;
    if (selectedTypeFilter !== 'ALL' && p.relationshipType !== selectedTypeFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const match =
        p.sourceCiName.toLowerCase().includes(q) ||
        p.targetCiName.toLowerCase().includes(q) ||
        p.reasoning.toLowerCase().includes(q) ||
        p.sourceIp.toLowerCase().includes(q) ||
        p.targetIp.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const highConfidenceCount = proposals.filter((p) => p.confidenceScore >= 85).length;
  const avgConfidence =
    proposals.length > 0
      ? Math.round(proposals.reduce((acc, p) => acc + p.confidenceScore, 0) / proposals.length)
      : 0;

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* AI Header Banner */}
      <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center space-x-2">
            <span className="p-1 bg-red-600/20 text-red-500 rounded border border-red-500/30">
              <Sparkles className="w-4 h-4" />
            </span>
            <span>AI CI RELATIONSHIP SUGGESTER & TOPOLOGY INFERENCE</span>
          </h2>
          <p className="text-zinc-400 text-[11px] mt-1 font-mono">
            Analyzes hostname naming patterns (e.g. <code className="text-red-400">web-* → app-* → db-*</code>) and network subnet proximity to propose logical <code className="text-white">connects_to</code>, <code className="text-white">depends_on</code>, and <code className="text-white">runs_on</code> relationships.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={runAiAnalysis}
            disabled={isAnalyzing}
            className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded flex items-center space-x-1.5 cursor-pointer disabled:opacity-50 shadow-lg shadow-red-950"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span>{isAnalyzing ? 'Analyzing Server Topology...' : 'Re-Run AI Analysis'}</span>
          </button>

          {highConfidenceCount > 0 && (
            <button
              onClick={handleBatchApproveHighConfidence}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded flex items-center space-x-1.5 cursor-pointer shadow-lg shadow-emerald-950"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Accept High Confidence ({highConfidenceCount})</span>
            </button>
          )}

          {onNavigateToGraph && (
            <button
              onClick={onNavigateToGraph}
              className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 rounded flex items-center space-x-1.5 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-red-400" />
              <span>View CMDB Graph</span>
            </button>
          )}
        </div>
      </div>

      {/* Success Toast */}
      {successToast && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-800 text-emerald-300 rounded flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-zinc-500 hover:text-white text-xs">
            ✕
          </button>
        </div>
      )}

      {/* Metric Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-zinc-950 border border-zinc-800 p-3 rounded">
          <span className="text-zinc-500 text-[10px] uppercase block">Inferred Relationships</span>
          <span className="text-xl font-bold text-white mt-1 block">{proposals.length} Proposals</span>
          <span className="text-[10px] text-red-400 mt-0.5 block">{highConfidenceCount} High Confidence (&gt;=85%)</span>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 p-3 rounded">
          <span className="text-zinc-500 text-[10px] uppercase block">Average AI Confidence</span>
          <span className="text-xl font-bold text-emerald-400 mt-1 block">{avgConfidence}% Score</span>
          <span className="text-[10px] text-zinc-400 mt-0.5 block">Subnet & Naming Match</span>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 p-3 rounded">
          <span className="text-zinc-500 text-[10px] uppercase block">Total Analyzed Assets</span>
          <span className="text-xl font-bold text-white mt-1 block">{configurationItems.length} CIs</span>
          <span className="text-[10px] text-zinc-400 mt-0.5 block">Servers, VMs, Switches, DBs</span>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 p-3 rounded">
          <span className="text-zinc-500 text-[10px] uppercase block">Active CMDB Edges</span>
          <span className="text-xl font-bold text-red-500 mt-1 block">{ciRelationships.length} Existing</span>
          <span className="text-[10px] text-zinc-400 mt-0.5 block">Zero duplicate proposals</span>
        </div>
      </div>

      {/* Control Filter Bar */}
      <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter by server hostname, IP, subnet, or reasoning..."
            className="w-full bg-black border border-zinc-800 pl-9 pr-3 py-1.5 text-zinc-200 text-xs rounded focus:outline-none focus:border-red-500"
          />
        </div>

        {/* Relationship Type Filter */}
        <div className="flex items-center space-x-2">
          <span className="text-zinc-400 text-[11px]">Type:</span>
          <select
            value={selectedTypeFilter}
            onChange={(e) => setSelectedTypeFilter(e.target.value)}
            className="bg-black border border-zinc-800 px-2.5 py-1.5 text-zinc-200 text-xs rounded focus:outline-none focus:border-red-500 cursor-pointer"
          >
            <option value="ALL">All Types</option>
            <option value="connects_to">connects_to</option>
            <option value="depends_on">depends_on</option>
            <option value="runs_on">runs_on</option>
            <option value="hosted_by">hosted_by</option>
          </select>
        </div>

        {/* Confidence Slider */}
        <div className="flex items-center space-x-2.5">
          <span className="text-zinc-400 text-[11px] whitespace-nowrap">Min Confidence:</span>
          <input
            type="range"
            min="60"
            max="95"
            step="5"
            value={minConfidence}
            onChange={(e) => setMinConfidence(Number(e.target.value))}
            className="w-24 accent-red-600 cursor-pointer"
          />
          <span className="text-red-400 font-bold text-xs w-8">{minConfidence}%</span>
        </div>
      </div>

      {/* Main Content Layout: Proposal Cards List & Interactive Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Proposals List (Left) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between bg-black p-3 border border-zinc-800 rounded">
            <span className="font-bold text-white text-xs uppercase flex items-center space-x-2">
              <Zap className="w-3.5 h-3.5 text-red-500" />
              <span>Pending AI Relationship Suggestions ({filteredProposals.length})</span>
            </span>
            {lastAnalysisTimestamp && (
              <span className="text-[10px] text-zinc-500">Analyzed at {lastAnalysisTimestamp}</span>
            )}
          </div>

          {filteredProposals.length === 0 ? (
            <div className="bg-zinc-950 border border-zinc-800 p-8 rounded text-center space-y-3">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <p className="text-white font-bold">No Pending Suggestions with Current Filters</p>
              <p className="text-zinc-500 text-[11px]">
                All logical server connections for the current confidence threshold ({minConfidence}%) are verified or already existing in the CMDB graph.
              </p>
              <button
                onClick={() => setMinConfidence(60)}
                className="px-3 py-1.5 bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white rounded text-xs cursor-pointer"
              >
                Lower Confidence Threshold to 60%
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredProposals.map((prop) => {
                const isSelected = selectedProposal?.id === prop.id;
                const isHigh = prop.confidenceScore >= 85;

                return (
                  <div
                    key={prop.id}
                    onClick={() => setSelectedProposal(prop)}
                    className={`p-4 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-zinc-900 border-red-500 shadow-md shadow-red-950/30'
                        : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    {/* Proposal Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-2.5">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            isHigh
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : 'bg-amber-950 text-amber-400 border border-amber-800'
                          }`}
                        >
                          {prop.confidenceScore}% Confidence
                        </span>
                        <span className="text-[10px] bg-red-950 text-red-300 border border-red-900 px-2 py-0.5 rounded font-mono font-bold">
                          {prop.relationshipType}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApproveProposal(prop);
                          }}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold flex items-center space-x-1 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRejectProposal(prop.id);
                          }}
                          className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-red-400 rounded text-[11px] cursor-pointer"
                        >
                          <XCircle className="w-3 h-3" />
                          <span>Reject</span>
                        </button>
                      </div>
                    </div>

                    {/* CI Connection Visual Pair */}
                    <div className="grid grid-cols-1 sm:grid-cols-11 items-center gap-2 py-3">
                      {/* Source */}
                      <div className="sm:col-span-5 bg-black p-2.5 rounded border border-zinc-800 space-y-1">
                        <div className="text-[10px] text-zinc-500 flex items-center justify-between">
                          <span>SOURCE (Originating)</span>
                          <span className="text-zinc-400">{prop.sourceCiClass}</span>
                        </div>
                        <div className="text-white font-bold text-xs truncate flex items-center space-x-1.5">
                          <Server className="w-3.5 h-3.5 text-red-500 shrink-0" />
                          <span>{prop.sourceCiName}</span>
                        </div>
                        <div className="text-[10px] text-red-400 font-mono">{prop.sourceIp}</div>
                      </div>

                      {/* Direction Arrow */}
                      <div className="sm:col-span-1 flex justify-center text-zinc-500">
                        <ArrowRight className="w-4 h-4 text-red-500" />
                      </div>

                      {/* Target */}
                      <div className="sm:col-span-5 bg-black p-2.5 rounded border border-zinc-800 space-y-1">
                        <div className="text-[10px] text-zinc-500 flex items-center justify-between">
                          <span>TARGET (Destination)</span>
                          <span className="text-zinc-400">{prop.targetCiClass}</span>
                        </div>
                        <div className="text-white font-bold text-xs truncate flex items-center space-x-1.5">
                          <Database className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>{prop.targetCiName}</span>
                        </div>
                        <div className="text-[10px] text-emerald-400 font-mono">{prop.targetIp}</div>
                      </div>
                    </div>

                    {/* Reasoning & Evidence Snip */}
                    <div className="text-[11px] text-zinc-300 bg-black/60 p-2.5 rounded border border-zinc-900 space-y-1">
                      <div className="flex items-center space-x-1.5 text-zinc-400">
                        <Info className="w-3.5 h-3.5 text-red-400 shrink-0" />
                        <span className="font-semibold text-zinc-200">{prop.detectionEvidence.architecturalRole}</span>
                      </div>
                      <p className="text-zinc-400 text-[10px] leading-relaxed">{prop.reasoning}</p>
                      <div className="flex flex-wrap items-center gap-2 pt-1 text-[9px] text-zinc-500">
                        <span className="bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 text-zinc-300">
                          {prop.detectionEvidence.namingPatternMatch}
                        </span>
                        <span className="bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 text-zinc-300">
                          {prop.detectionEvidence.networkProximity}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* AI Evidence & Topology Inspector (Right) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-black border border-zinc-800 rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="font-bold text-white uppercase text-xs flex items-center space-x-2">
                <Network className="w-4 h-4 text-red-500" />
                <span>AI Inference & Topology Inspector</span>
              </span>
              <span className="text-[10px] bg-red-950 text-red-400 px-2 py-0.5 rounded font-bold">
                Live Evidence Graph
              </span>
            </div>

            {selectedProposal ? (
              <div className="space-y-4">
                {/* Visual Topology Connection Preview */}
                <div className="bg-zinc-950 border border-zinc-800 rounded p-4 text-center space-y-3">
                  <div className="text-[10px] text-zinc-400 uppercase font-bold">Proposed Relationship Topology</div>

                  <div className="flex items-center justify-between gap-2">
                    <div className="p-3 bg-black border border-zinc-800 rounded text-left flex-1">
                      <div className="text-[9px] text-zinc-500 uppercase">Source Node</div>
                      <div className="font-bold text-white text-xs truncate">{selectedProposal.sourceCiName}</div>
                      <div className="text-[10px] text-red-400">{selectedProposal.sourceIp}</div>
                    </div>

                    <div className="flex flex-col items-center px-1">
                      <span className="text-[9px] text-red-400 font-mono font-bold uppercase mb-1">
                        {selectedProposal.relationshipType}
                      </span>
                      <div className="w-16 h-0.5 bg-red-500 relative">
                        <div className="w-2 h-2 rounded-full bg-red-400 absolute right-0 -top-[3px]" />
                      </div>
                      <span className="text-[8px] text-zinc-500 mt-1">
                        {selectedProposal.confidenceScore}% match
                      </span>
                    </div>

                    <div className="p-3 bg-black border border-zinc-800 rounded text-left flex-1">
                      <div className="text-[9px] text-zinc-500 uppercase">Target Node</div>
                      <div className="font-bold text-white text-xs truncate">{selectedProposal.targetCiName}</div>
                      <div className="text-[10px] text-emerald-400">{selectedProposal.targetIp}</div>
                    </div>
                  </div>
                </div>

                {/* AI Detection Evidence Breakdown */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-white uppercase">Detection Evidence Breakdown</div>

                  <div className="space-y-2 text-[11px]">
                    <div className="bg-zinc-950 p-3 rounded border border-zinc-800 space-y-1">
                      <span className="text-zinc-400 block font-semibold">1. Naming Convention Matching</span>
                      <p className="text-zinc-300">{selectedProposal.detectionEvidence.namingPatternMatch}</p>
                    </div>

                    <div className="bg-zinc-950 p-3 rounded border border-zinc-800 space-y-1">
                      <span className="text-zinc-400 block font-semibold">2. Network Subnet Proximity</span>
                      <p className="text-zinc-300">{selectedProposal.detectionEvidence.networkProximity}</p>
                    </div>

                    <div className="bg-zinc-950 p-3 rounded border border-zinc-800 space-y-1">
                      <span className="text-zinc-400 block font-semibold">3. Architectural Role Hierarchy</span>
                      <p className="text-zinc-300">{selectedProposal.detectionEvidence.architecturalRole}</p>
                    </div>
                  </div>
                </div>

                {/* Quick Action in Inspector */}
                <div className="pt-2 flex items-center space-x-2">
                  <button
                    onClick={() => handleApproveProposal(selectedProposal)}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded flex items-center justify-center space-x-1.5 cursor-pointer shadow-lg shadow-emerald-950"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve & Add to CMDB</span>
                  </button>
                  <button
                    onClick={() => handleRejectProposal(selectedProposal.id)}
                    className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-red-400 rounded cursor-pointer"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-zinc-500 text-center py-10">
                Select a proposal from the list on the left to view detailed AI reasoning and topological evidence.
              </div>
            )}
          </div>

          {/* Rules & Naming Convention Matrix Reference */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-3">
            <div className="text-xs font-bold text-white uppercase flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-red-500" />
              <span>Supported Server Naming Patterns</span>
            </div>
            <div className="space-y-1.5 text-[10px] text-zinc-400">
              <div className="flex justify-between border-b border-zinc-900 pb-1">
                <code className="text-red-400">web-* / fe-* → app-*</code>
                <span className="text-zinc-500">connects_to (Web → App)</span>
              </div>
              <div className="flex justify-between border-b border-zinc-900 pb-1">
                <code className="text-red-400">app-* / srv-* → db-* / sql-*</code>
                <span className="text-zinc-500">depends_on (App → DB)</span>
              </div>
              <div className="flex justify-between border-b border-zinc-900 pb-1">
                <code className="text-red-400">k8s-worker-* → k8s-master-*</code>
                <span className="text-zinc-500">connects_to (Control Plane)</span>
              </div>
              <div className="flex justify-between border-b border-zinc-900 pb-1">
                <code className="text-red-400">vm-* / guest-* → esxi-* / hyperv-*</code>
                <span className="text-zinc-500">runs_on (Virtualization)</span>
              </div>
              <div className="flex justify-between">
                <code className="text-red-400">Same /24 Subnet (Δ &lt; 16 IPs)</code>
                <span className="text-zinc-500">+10% Network Proximity Boost</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
