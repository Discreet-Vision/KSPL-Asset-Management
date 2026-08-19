import React, { useState } from 'react';
import { 
  Globe, Database, ShieldCheck, RefreshCw, Search, CheckCircle2, 
  AlertTriangle, Server, ArrowRight, Activity, Layers, Lock, Cpu
} from 'lucide-react';
import { 
  FederationConnectorConfig, 
  FederatedEntityRecord, 
  ResolvedFederatedField,
  SourceConflictRecord, 
  FederationHealthStats 
} from './types';
import { cmdbFederationEngine } from './federationEngine';

export const FederationDashboardModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'connectors' | 'read_through_resolver' | 'source_conflicts'>('connectors');

  const [connectors, setConnectors] = useState<FederationConnectorConfig[]>(cmdbFederationEngine.getConnectors());
  const [conflicts, setConflicts] = useState<SourceConflictRecord[]>(cmdbFederationEngine.getSourceConflicts());
  const [stats, setStats] = useState<FederationHealthStats>(cmdbFederationEngine.getHealthStats());

  // Resolver Input State
  const [lookupRefId, setLookupRefId] = useState<string>('EMP-1024');
  const [resolvedRecord, setResolvedRecord] = useState<FederatedEntityRecord>(
    cmdbFederationEngine.resolveFederatedRecord('EMP-1024')
  );

  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleTestConnection = (connId: string) => {
    cmdbFederationEngine.testConnector(connId);
    setConnectors([...cmdbFederationEngine.getConnectors()]);
    setStats(cmdbFederationEngine.getHealthStats());
    setSuccessMsg(`Tested connector ${connId}. Read-through connection verified with Live status.`);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleResolveLookup = () => {
    const res = cmdbFederationEngine.resolveFederatedRecord(lookupRefId);
    setResolvedRecord(res);
    setSuccessMsg(`Resolved external reference '${lookupRefId}' from ${res.sourceSystem}.`);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleResolveConflict = (conflictId: string, action: 'Local Overridden' | 'Source Kept') => {
    cmdbFederationEngine.resolveConflict(conflictId, action);
    setConflicts([...cmdbFederationEngine.getSourceConflicts()]);
    setStats(cmdbFederationEngine.getHealthStats());
    setSuccessMsg(`Conflict ${conflictId} resolved: set to '${action}'.`);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  return (
    <div className="bg-black text-white p-6 font-sans border border-red-900 shadow-2xl space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-red-900 pb-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-red-600 animate-pulse" />
            <h1 className="text-xl font-bold uppercase tracking-wider text-white">
              CMDB Federation / Read-Through External Systems Engine
            </h1>
            <span className="text-xs bg-red-950 text-red-400 px-2 py-0.5 border border-red-800 font-mono">
              Federation v2026.8
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1 font-mono">
            Authoritative Systems of Record (HRIS, ERP, Procurement, Entra ID) • Zero Data Duplication • Read-Through Proxies
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-1 mt-4 md:mt-0 border border-neutral-800 p-1 bg-neutral-950 font-mono text-xs">
          {(
            [
              ['connectors', `External Connectors (${connectors.length})`],
              ['read_through_resolver', 'Read-Through Reference Resolver'],
              ['source_conflicts', `Source Conflicts (${stats.sourceConflictsCount})`]
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

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 font-mono text-xs">
        <div className="bg-neutral-950 border border-neutral-800 p-3 text-center">
          <span className="text-[10px] text-neutral-500 uppercase">Total Connectors</span>
          <div className="text-xl font-bold text-white mt-1">{stats.totalConnectors}</div>
        </div>

        <div className="bg-neutral-950 border border-neutral-800 p-3 text-center">
          <span className="text-[10px] text-neutral-500 uppercase">Active (Live / Cached)</span>
          <div className="text-xl font-bold text-red-500 mt-1">{stats.activeConnectors}</div>
        </div>

        <div className="bg-neutral-950 border border-neutral-800 p-3 text-center">
          <span className="text-[10px] text-neutral-500 uppercase">24h Records Resolved</span>
          <div className="text-xl font-bold text-neutral-300 mt-1">{stats.recordsResolved24h}</div>
        </div>

        <div className="bg-neutral-950 border border-neutral-800 p-3 text-center">
          <span className="text-[10px] text-neutral-500 uppercase">Cache Hit Ratio</span>
          <div className="text-xl font-bold text-white mt-1">{stats.cacheHitRatioPercent}%</div>
        </div>

        <div className="bg-neutral-950 border border-neutral-800 p-3 text-center">
          <span className="text-[10px] text-neutral-500 uppercase">Source Conflicts</span>
          <div className="text-xl font-bold text-red-400 mt-1">{stats.sourceConflictsCount}</div>
        </div>
      </div>

      {/* TAB 1: EXTERNAL CONNECTORS MANAGEMENT */}
      {activeTab === 'connectors' && (
        <div className="space-y-6 font-mono text-xs">
          <div className="bg-neutral-950 border border-neutral-800 p-5 space-y-4">
            <div className="border-b border-neutral-900 pb-2 font-bold uppercase text-white flex justify-between items-center">
              <span>Authoritative External Systems of Record Connectors</span>
              <span className="text-[10px] text-neutral-500 font-normal">Isolated Read-Through Adapters</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {connectors.map(conn => (
                <div key={conn.connectorId} className="bg-black border border-neutral-800 p-4 space-y-3">
                  <div className="flex justify-between items-start border-b border-neutral-900 pb-2">
                    <div>
                      <h3 className="font-bold text-white text-sm">{conn.connectorName}</h3>
                      <span className="text-[10px] text-neutral-500 uppercase">{conn.systemType}</span>
                    </div>
                    <span className={`px-2 py-0.5 text-[9px] font-bold border ${
                      conn.status.includes('Live')
                        ? 'bg-red-950 text-red-400 border-red-900'
                        : 'bg-neutral-900 text-neutral-400 border-neutral-800'
                    }`}>
                      {conn.status}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-[10px] text-neutral-400">
                    <div className="flex justify-between">
                      <span className="text-neutral-500 uppercase">Endpoint API:</span>
                      <span className="text-neutral-300 font-mono text-[9px] truncate max-w-[200px]">{conn.endpointUrl}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500 uppercase">Auth Method:</span>
                      <span className="text-white font-bold">{conn.authMethod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500 uppercase">Cache TTL:</span>
                      <span className="text-neutral-300">{conn.cacheDurationMinutes} Minutes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500 uppercase">Records Resolved:</span>
                      <span className="text-white font-bold">{conn.recordsResolvedCount}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-neutral-900 flex justify-between items-center">
                    <span className="text-[9px] text-neutral-600">Last Sync: {conn.lastSyncTimestamp}</span>
                    <button
                      onClick={() => handleTestConnection(conn.connectorId)}
                      className="px-3 py-1 bg-black border border-neutral-800 hover:border-white text-white font-bold text-[9px] uppercase flex items-center space-x-1"
                    >
                      <RefreshCw className="w-3 h-3 text-red-500" />
                      <span>Test Connection</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: READ-THROUGH REFERENCE RESOLVER */}
      {activeTab === 'read_through_resolver' && (
        <div className="space-y-6 font-mono text-xs">
          {/* Lookup Input */}
          <div className="bg-neutral-950 border border-neutral-800 p-5 space-y-4">
            <div className="border-b border-neutral-900 pb-2 font-bold uppercase text-white">
              Read-Through Reference Resolver Inspector
            </div>

            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1">
                <label className="text-[10px] text-neutral-500 uppercase block mb-1">Enter External Reference ID</label>
                <input
                  type="text"
                  placeholder="e.g. EMP-1024, CC-1005, PO-99021..."
                  value={lookupRefId}
                  onChange={(e) => setLookupRefId(e.target.value)}
                  className="w-full bg-black border border-neutral-800 p-2 text-white font-bold"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleResolveLookup}
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-wider text-[10px]"
                >
                  Execute Read-Through Resolution
                </button>
              </div>
            </div>
          </div>

          {/* Resolution Result Display */}
          {resolvedRecord && (
            <div className="bg-neutral-950 border border-neutral-800 p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-neutral-900 pb-3">
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase">Resolved Entity</span>
                  <h3 className="text-sm font-bold uppercase text-white">{resolvedRecord.referenceId} ({resolvedRecord.entityType})</h3>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-neutral-500 uppercase">Authoritative System</span>
                  <div className="text-xs font-bold text-red-500">{resolvedRecord.sourceSystem}</div>
                </div>
              </div>

              {/* Resolved Fields Grid */}
              <div className="space-y-3">
                <span className="text-[10px] text-neutral-500 uppercase font-bold">Field-Level Provenance Attributes</span>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(Object.values(resolvedRecord.resolvedFields) as ResolvedFederatedField[]).map((f, i) => (
                    <div key={i} className="bg-black border border-neutral-900 p-3 space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] text-neutral-500 uppercase">{f.fieldName}</span>
                        <span className="text-[8px] bg-red-950 text-red-400 border border-red-900 px-1.5 py-0.5 font-bold uppercase">
                          [FEDERATED • {f.sourceSystem}]
                        </span>
                      </div>
                      <div className="text-sm font-bold text-white">{f.fieldValue}</div>
                      <div className="text-[8px] text-neutral-600 flex justify-between pt-1">
                        <span>Freshness: {f.freshness}</span>
                        <span>Retrieved: {f.retrievedAt}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SOURCE CONFLICTS */}
      {activeTab === 'source_conflicts' && (
        <div className="space-y-6 font-mono text-xs">
          <div className="bg-neutral-950 border border-neutral-800 p-5 space-y-4">
            <div className="border-b border-neutral-900 pb-2 font-bold uppercase text-white">
              Data Source Conflict Resolution Review ({conflicts.length})
            </div>

            <div className="space-y-3">
              {conflicts.map(c => (
                <div key={c.conflictId} className="bg-black border border-neutral-800 p-4 space-y-3">
                  <div className="flex justify-between items-center border-b border-neutral-900 pb-2">
                    <span className="font-bold text-white text-sm">{c.ciName} ({c.fieldName})</span>
                    <span className={`px-2 py-0.5 text-[9px] font-bold border ${
                      c.resolutionStatus === 'Unresolved Conflict'
                        ? 'bg-red-950 text-red-500 border-red-900'
                        : 'bg-black text-white border-neutral-800'
                    }`}>
                      {c.resolutionStatus}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[10px]">
                    <div className="bg-neutral-950 p-3 border border-neutral-800">
                      <span className="text-[8px] text-neutral-500 uppercase block">Local CMDB Value</span>
                      <span className="text-neutral-300 font-bold mt-1 block">{c.localValue}</span>
                    </div>
                    <div className="bg-neutral-950 p-3 border border-red-950">
                      <span className="text-[8px] text-red-500 uppercase block">External Authoritative ({c.sourceSystem})</span>
                      <span className="text-white font-bold mt-1 block">{c.externalAuthoritativeValue}</span>
                    </div>
                  </div>

                  {c.resolutionStatus === 'Unresolved Conflict' && (
                    <div className="flex justify-end space-x-2 pt-2 border-t border-neutral-900">
                      <button
                        onClick={() => handleResolveConflict(c.conflictId, 'Local Overridden')}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-[9px] uppercase"
                      >
                        Accept Authoritative Source
                      </button>
                      <button
                        onClick={() => handleResolveConflict(c.conflictId, 'Source Kept')}
                        className="px-3 py-1.5 bg-black border border-neutral-800 hover:border-white text-white font-bold text-[9px] uppercase"
                      >
                        Retain Local Exception
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
