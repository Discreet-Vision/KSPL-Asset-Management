import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import {
  Database,
  Cloud,
  Server,
  Radar,
  GitMerge,
  Share2,
  Activity,
  AlertTriangle,
  Layers,
  Cpu,
  Globe,
  Radio,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

export const CmdbAdminDashboard: React.FC = () => {
  const {
    configurationItems,
    ciRelationships,
    discoveryJobs,
    driftEvents,
    setActiveModule,
  } = useApp();

  const safeCis = configurationItems || [];
  const safeRels = ciRelationships || [];
  const safeJobs = discoveryJobs || [];
  const safeDrifts = driftEvents || [];

  const totalCis = safeCis.length;
  const cloudCis = safeCis.filter((ci) => ci && (ci.category === 'Cloud' || ci.type?.toLowerCase().includes('cloud') || ci.type?.toLowerCase().includes('aws') || ci.type?.toLowerCase().includes('azure'))).length;
  const serverCis = safeCis.filter((ci) => ci && (ci.type?.toLowerCase().includes('server') || ci.type?.toLowerCase().includes('linux') || ci.type?.toLowerCase().includes('windows'))).length;
  const dbCis = safeCis.filter((ci) => ci && (ci.type?.toLowerCase().includes('database') || ci.type?.toLowerCase().includes('sql') || ci.type?.toLowerCase().includes('postgres'))).length;
  const networkCis = safeCis.filter((ci) => ci && (ci.type?.toLowerCase().includes('network') || ci.type?.toLowerCase().includes('router') || ci.type?.toLowerCase().includes('switch'))).length;

  const mappedCiIds = new Set([
    ...safeRels.map((r) => r?.sourceId || (r as any)?.sourceCiId).filter(Boolean),
    ...safeRels.map((r) => r?.targetId || (r as any)?.targetCiId).filter(Boolean),
  ]);
  const orphanCisCount = safeCis.filter((ci) => ci && !mappedCiIds.has(ci.id)).length;
  const topologyHealth = Math.round(((totalCis - orphanCisCount) / (totalCis || 1)) * 100);

  const activeDriftEvents = safeDrifts.filter((d) => d && (d.status === 'Open' || d.status === 'Investigating'));
  const activeScans = safeJobs.filter((j) => j && j.status === 'Running');

  return (
    <div className="space-y-6">
      {/* CMDB Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-950 p-4 border border-zinc-800 rounded-xl shadow-lg">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 bg-purple-950 text-purple-400 border border-purple-800 rounded-md text-[10px] font-mono font-bold tracking-wider uppercase">
              CMDB Architecture & Topology Hub
            </span>
            <span className="bg-zinc-800 text-zinc-300 border border-zinc-700 text-[10px] font-mono px-2 py-0.5 rounded">
              System of Record
            </span>
          </div>
          <h1 className="text-xl font-black text-white tracking-tight mt-1">
            ENTERPRISE CMDB TOPOLOGY & CLOUD INFRASTRUCTURE
          </h1>
          <p className="text-xs text-zinc-400 font-mono">
            Configuration Item Taxonomy, Service Mapping, Discovery Schedules & Drift Detection
          </p>
        </div>

        {/* Quick Action Toolkit */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <button
            onClick={() => setActiveModule('discovery')}
            className="flex items-center space-x-1.5 bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-colors shadow-md shadow-purple-950"
          >
            <Radar className="w-3.5 h-3.5" />
            <span>Launch Discovery</span>
          </button>

          <button
            onClick={() => setActiveModule('cmdb_federation')}
            className="flex items-center space-x-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 hover:text-white px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-colors"
          >
            <Share2 className="w-3.5 h-3.5 text-purple-400" />
            <span>Federation Sync</span>
          </button>

          <button
            onClick={() => setActiveModule('reconciliation')}
            className="flex items-center space-x-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 hover:text-white px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-colors"
          >
            <GitMerge className="w-3.5 h-3.5 text-cyan-400" />
            <span>Reconciliation</span>
          </button>
        </div>
      </div>

      {/* CMDB Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total CIs */}
        <div
          onClick={() => setActiveModule('cmdb')}
          className="bg-zinc-950 border border-zinc-800 hover:border-purple-500/50 p-4 rounded-xl transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">CMDB Entities</span>
            <Database className="w-5 h-5 text-purple-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-white mt-2">{totalCis} CIs</div>
          <div className="text-[11px] text-zinc-400 font-mono mt-1 flex items-center space-x-2">
            <span className="text-purple-400 font-bold">{cloudCis} Cloud</span>
            <span>•</span>
            <span>{serverCis} Compute</span>
          </div>
        </div>

        {/* CI Relationships & Topology */}
        <div
          onClick={() => setActiveModule('cmdb')}
          className="bg-zinc-950 border border-zinc-800 hover:border-purple-500/50 p-4 rounded-xl transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">Relationship Links</span>
            <GitMerge className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-white mt-2">{ciRelationships.length} Mappings</div>
          <div className="text-[11px] text-zinc-400 font-mono mt-1 flex items-center space-x-2">
            <span className="text-emerald-400 font-bold">{topologyHealth}% Topology Graph Mapped</span>
          </div>
        </div>

        {/* Discovery Scan Status */}
        <div
          onClick={() => setActiveModule('discovery')}
          className="bg-zinc-950 border border-zinc-800 hover:border-cyan-500/50 p-4 rounded-xl transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">Discovery Engine</span>
            <Radar className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-white mt-2">{discoveryJobs.length} Scan Jobs</div>
          <div className="text-[11px] text-zinc-400 font-mono mt-1 flex items-center space-x-2">
            <span className="text-emerald-400">{activeScans.length} Active Jobs</span>
            <span>•</span>
            <span>Cloud & Agentless</span>
          </div>
        </div>

        {/* Configuration Drift Alerts */}
        <div
          onClick={() => setActiveModule('cmdb')}
          className="bg-zinc-950 border border-zinc-800 hover:border-amber-500/50 p-4 rounded-xl transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">Config Drift Events</span>
            <Activity className="w-5 h-5 text-amber-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-white mt-2 flex items-center space-x-2">
            <span>{driftEvents.length}</span>
            {activeDriftEvents.length > 0 && (
              <span className="bg-amber-600 text-black text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                DRIFT DETECTED
              </span>
            )}
          </div>
          <div className="text-[11px] text-amber-400 font-mono mt-1 font-bold">
            {activeDriftEvents.length} Open Discrepancies
          </div>
        </div>
      </div>

      {/* CI Class Distribution & Cloud Multi-Tenant Architecture */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Class Taxonomy */}
        <div className="bg-zinc-950 p-4 border border-zinc-800 rounded-xl">
          <div className="font-bold text-sm text-white flex items-center space-x-2 border-b border-zinc-800 pb-3 mb-3">
            <Layers className="w-4 h-4 text-purple-400" />
            <span>CI Taxonomy Distribution</span>
          </div>
          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between items-center bg-black/60 p-2 rounded border border-zinc-800/80">
              <span className="text-zinc-400">Cloud VPCs & Instances:</span>
              <span className="font-bold text-purple-400">{cloudCis} CIs</span>
            </div>
            <div className="flex justify-between items-center bg-black/60 p-2 rounded border border-zinc-800/80">
              <span className="text-zinc-400">Physical & Virtual Servers:</span>
              <span className="font-bold text-white">{serverCis} CIs</span>
            </div>
            <div className="flex justify-between items-center bg-black/60 p-2 rounded border border-zinc-800/80">
              <span className="text-zinc-400">Managed Databases:</span>
              <span className="font-bold text-white">{dbCis} CIs</span>
            </div>
            <div className="flex justify-between items-center bg-black/60 p-2 rounded border border-zinc-800/80">
              <span className="text-zinc-400">Network & Security Switches:</span>
              <span className="font-bold text-white">{networkCis} CIs</span>
            </div>
          </div>
        </div>

        {/* Discovery Schedule */}
        <div className="bg-zinc-950 p-4 border border-zinc-800 rounded-xl">
          <div className="font-bold text-sm text-white flex items-center space-x-2 border-b border-zinc-800 pb-3 mb-3">
            <Radio className="w-4 h-4 text-cyan-400" />
            <span>Discovery Collector Pipelines</span>
          </div>
          <div className="space-y-2 text-xs font-mono">
            {discoveryJobs.slice(0, 3).map((job) => (
              <div key={job.id} className="bg-black/60 p-2 rounded border border-zinc-800/80 flex justify-between items-center">
                <div>
                  <div className="font-bold text-white">{job.name}</div>
                  <div className="text-[10px] text-zinc-500">{job.targetRange}</div>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    job.status === 'Completed'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                  }`}>
                    {job.status}
                  </span>
                  <div className="text-[10px] text-zinc-500 mt-0.5">{job.itemsDiscovered} Found</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Topology Integrity */}
        <div className="bg-zinc-950 p-4 border border-zinc-800 rounded-xl">
          <div className="font-bold text-sm text-white flex items-center space-x-2 border-b border-zinc-800 pb-3 mb-3">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>Topology Graph Completeness</span>
          </div>
          <div className="space-y-3 text-xs font-mono">
            <div className="flex justify-between items-center">
              <span className="text-zinc-400">Dependency Mapping Rate:</span>
              <span className="font-bold text-emerald-400">{topologyHealth}%</span>
            </div>
            <div className="w-full bg-black h-2.5 rounded-full overflow-hidden border border-zinc-800">
              <div
                className="bg-purple-600 h-full transition-all duration-500"
                style={{ width: `${topologyHealth}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[11px] text-zinc-400 pt-1">
              <span>Orphan (Unlinked) CIs:</span>
              <span className="font-bold text-amber-400">{orphanCisCount} CIs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Configuration Drift & Unmapped Entities Table */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-4 border-b border-zinc-800 pb-3">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-sm text-white uppercase tracking-wider">
              Real-Time Configuration Drift & Schema Discrepancy Stream
            </h3>
          </div>
          <button
            onClick={() => setActiveModule('cmdb')}
            className="text-xs text-purple-400 hover:text-white font-mono underline cursor-pointer"
          >
            Open Topology Explorer →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="bg-black text-zinc-400 border-b border-zinc-800 uppercase text-[10px] tracking-wider">
                <th className="p-3">CI Entity</th>
                <th className="p-3">Attribute Changed</th>
                <th className="p-3">Previous Baseline</th>
                <th className="p-3">Discovered State</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 text-zinc-300">
              {driftEvents.slice(0, 5).map((d) => (
                <tr key={d.id} className="hover:bg-zinc-900 transition-colors">
                  <td className="p-3 font-bold text-white">{d.ciName}</td>
                  <td className="p-3 text-amber-400">{d.attributeName}</td>
                  <td className="p-3 text-zinc-500 line-through">{d.expectedValue}</td>
                  <td className="p-3 text-red-400 font-bold">{d.detectedValue}</td>
                  <td className="p-3">
                    <span className="bg-amber-950 text-amber-400 border border-amber-800 text-[10px] px-2 py-0.5 rounded font-bold">
                      {d.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => setActiveModule('cmdb')}
                      className="bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-bold px-2.5 py-1 rounded cursor-pointer transition-colors"
                    >
                      Accept / Reconcile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
