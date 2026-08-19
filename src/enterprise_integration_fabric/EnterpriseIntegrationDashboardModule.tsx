import React, { useState } from 'react';
import { 
  Network, RefreshCw, CheckCircle2, ShieldAlert, DollarSign, 
  Cpu, FileText, AlertTriangle, Activity, ArrowRight, UserCheck, 
  Plus, Key, Database, Globe, Radio, Layers, Lock, Zap, Server
} from 'lucide-react';
import { 
  IntegrationConnector, 
  SyncJobRecord, 
  OutboundWebhookConfig, 
  FieldSourcePrecedenceRule, 
  CloudCostRecord, 
  SaasUsageSignal, 
  FabricEventMessage, 
  IntegrationFabricStats 
} from './types';
import { enterpriseIntegrationAdapter } from './enterpriseIntegrationAdapter';

export const EnterpriseIntegrationDashboardModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'enterprise_connectors' | 'cloud_cost_and_saas' | 'event_stream_and_webhooks' | 'source_precedence'
  >('enterprise_connectors');

  const [connectors, setConnectors] = useState<IntegrationConnector[]>(enterpriseIntegrationAdapter.getConnectors());
  const [syncJobs, setSyncJobs] = useState<SyncJobRecord[]>(enterpriseIntegrationAdapter.getSyncJobs());
  const [webhooks] = useState<OutboundWebhookConfig[]>(enterpriseIntegrationAdapter.getWebhooks());
  const [precedenceRules] = useState<FieldSourcePrecedenceRule[]>(enterpriseIntegrationAdapter.getPrecedenceRules());
  const [cloudCosts] = useState<CloudCostRecord[]>(enterpriseIntegrationAdapter.getCloudCosts());
  const [saasSignals] = useState<SaasUsageSignal[]>(enterpriseIntegrationAdapter.getSaasSignals());
  const [eventStream, setEventStream] = useState<FabricEventMessage[]>(enterpriseIntegrationAdapter.getEventStream());
  const [stats, setStats] = useState<IntegrationFabricStats>(enterpriseIntegrationAdapter.getStats());

  const [syncingConnId, setSyncingConnId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleManualSync = (connectorId: string, name: string) => {
    setSyncingConnId(connectorId);
    setTimeout(() => {
      enterpriseIntegrationAdapter.triggerSync(connectorId);
      setConnectors([...enterpriseIntegrationAdapter.getConnectors()]);
      setSyncJobs([...enterpriseIntegrationAdapter.getSyncJobs()]);
      setEventStream([...enterpriseIntegrationAdapter.getEventStream()]);
      setStats(enterpriseIntegrationAdapter.getStats());
      setSyncingConnId(null);
      setSuccessMsg(`Synchronization successfully executed for '${name}'. Records ingested and reconciled.`);
      setTimeout(() => setSuccessMsg(null), 4000);
    }, 1200);
  };

  return (
    <div className="bg-black text-white p-3 sm:p-6 font-sans border border-red-900 shadow-2xl space-y-4 sm:space-y-6 max-w-full overflow-x-hidden">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-red-900 pb-4 gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="w-3 h-3 bg-red-600 animate-pulse shrink-0" />
            <h1 className="text-base sm:text-xl font-bold uppercase tracking-wider text-white">
              Enterprise Integration Fabric Subsystem
            </h1>
            <span className="text-[10px] sm:text-xs bg-red-950 text-red-400 px-2 py-0.5 border border-red-800 font-mono">
              Hybrid Multi-Cloud Connector Engine
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-neutral-400 mt-1 font-mono leading-relaxed">
            HRIS • ERP/Finance • External ITSM • Cloud Providers (AWS/Azure/GCP) • MDM/UEM • SSO/IdP • SaaS Signals • Webhooks & Event Streaming
          </p>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex flex-wrap gap-1 border border-neutral-800 p-1 bg-neutral-950 font-mono text-xs max-w-full overflow-x-auto">
          {(
            [
              ['enterprise_connectors', `Connectors (${connectors.length})`],
              ['cloud_cost_and_saas', `Cloud & SaaS Signals (${saasSignals.length})`],
              ['event_stream_and_webhooks', `Events & Webhooks (${webhooks.length})`],
              ['source_precedence', `Source Precedence (${precedenceRules.length})`]
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
          <span className="text-[9px] sm:text-[10px] text-neutral-500 uppercase block truncate">Connectors Total</span>
          <div className="text-lg sm:text-xl font-bold text-white mt-1">{stats.totalConnectorsCount}</div>
        </div>

        <div className="bg-neutral-950 border border-neutral-800 p-2.5 sm:p-3 text-center">
          <span className="text-[9px] sm:text-[10px] text-neutral-500 uppercase block truncate">Active Status</span>
          <div className="text-lg sm:text-xl font-bold text-white mt-1">{stats.activeConnectorsCount} / {stats.totalConnectorsCount}</div>
        </div>

        <div className="bg-neutral-950 border border-neutral-800 p-2.5 sm:p-3 text-center">
          <span className="text-[9px] sm:text-[10px] text-neutral-500 uppercase block truncate">Sync Success</span>
          <div className="text-lg sm:text-xl font-bold text-white mt-1">{stats.syncSuccessRatePercent}%</div>
        </div>

        <div className="bg-neutral-950 border border-neutral-800 p-2.5 sm:p-3 text-center">
          <span className="text-[9px] sm:text-[10px] text-neutral-500 uppercase block truncate">Active Webhooks</span>
          <div className="text-lg sm:text-xl font-bold text-white mt-1">{stats.activeWebhooksCount}</div>
        </div>

        <div className="bg-neutral-950 border border-neutral-800 p-2.5 sm:p-3 text-center">
          <span className="text-[9px] sm:text-[10px] text-neutral-500 uppercase block truncate">Cloud Spend</span>
          <div className="text-base sm:text-xl font-bold text-red-500 mt-1">${stats.cloudCostTrackedUsd.toLocaleString()}/mo</div>
        </div>

        <div className="bg-neutral-950 border border-neutral-800 p-2.5 sm:p-3 text-center">
          <span className="text-[9px] sm:text-[10px] text-neutral-500 uppercase block truncate">24h Ingested</span>
          <div className="text-lg sm:text-xl font-bold text-white mt-1">3.5M</div>
        </div>
      </div>

      {/* TAB 1: ENTERPRISE CONNECTORS */}
      {activeTab === 'enterprise_connectors' && (
        <div className="space-y-4 sm:space-y-6 font-mono text-xs">
          <div className="bg-neutral-950 border border-neutral-800 p-3 sm:p-5 space-y-4">
            <div className="border-b border-neutral-900 pb-2 font-bold uppercase text-white flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span>Enterprise System Connectors & Adapters</span>
              <span className="text-[10px] text-neutral-400">Rate Limits & Idempotent Sync</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {connectors.map(conn => (
                <div key={conn.id} className="bg-black border border-neutral-800 p-3 sm:p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row justify-between items-start border-b border-neutral-900 pb-2 gap-2">
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-sm font-bold text-white">{conn.name}</span>
                        <span className="px-2 py-0.5 text-[8px] bg-red-950 text-red-400 border border-red-900 font-bold uppercase">
                          {conn.category}
                        </span>
                      </div>
                      <span className="text-[10px] text-neutral-400 block mt-1">Auth: {conn.authMethod} | Provider: {conn.provider}</span>
                    </div>

                    <span className="px-2 py-0.5 text-[9px] bg-black text-white border border-neutral-800 font-bold uppercase">
                      {conn.status}
                    </span>
                  </div>

                  <div className="bg-neutral-950 p-2 border border-neutral-900 space-y-1 text-[10px] text-neutral-300 break-all">
                    <p><strong className="text-white">Endpoint: </strong>{conn.endpointUrl}</p>
                    <p><strong className="text-white">Last Sync: </strong>{conn.lastSyncAt}</p>
                    <p><strong className="text-white">Rate Limit: </strong>{conn.rateLimitPerMinute} req/min</p>
                    <p><strong className="text-white">Records Processed: </strong>{conn.recordsProcessedCount.toLocaleString()}</p>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between sm:items-center pt-2 border-t border-neutral-900 gap-2">
                    <span className="text-[9px] text-neutral-500">Tenant: {conn.tenantId}</span>
                    <button
                      onClick={() => handleManualSync(conn.id, conn.name)}
                      disabled={syncingConnId === conn.id}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white font-bold text-[9px] uppercase tracking-wider flex items-center justify-center space-x-1"
                    >
                      <RefreshCw className={`w-3 h-3 ${syncingConnId === conn.id ? 'animate-spin' : ''}`} />
                      <span>{syncingConnId === conn.id ? 'Syncing...' : 'Trigger Sync'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sync Jobs Log */}
          <div className="bg-neutral-950 border border-neutral-800 p-3 sm:p-5 space-y-3">
            <span className="text-xs font-bold uppercase text-white block border-b border-neutral-900 pb-2">
              Recent Execution Jobs
            </span>

            <div className="space-y-2">
              {syncJobs.map(job => (
                <div key={job.id} className="bg-black border border-neutral-800 p-3 flex flex-col sm:flex-row justify-between sm:items-center text-[10px] gap-2">
                  <div>
                    <span className="text-white font-bold block">{job.connectorName} ({job.id})</span>
                    <span className="text-neutral-500">Started: {job.startedAt} | Completed: {job.completedAt}</span>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end space-x-4">
                    <div className="text-left sm:text-right">
                      <span className="text-neutral-400 block">Read: {job.recordsRead} | Updated: {job.recordsUpdated}</span>
                      <span className="text-neutral-500 text-[9px]">Skipped: {job.recordsSkipped} | Failed: {job.recordsFailed}</span>
                    </div>

                    <span className="px-2 py-0.5 bg-red-950 text-red-400 border border-red-900 font-bold uppercase text-[9px] shrink-0">
                      {job.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CLOUD COST & SAAS SIGNALS */}
      {activeTab === 'cloud_cost_and_saas' && (
        <div className="space-y-4 sm:space-y-6 font-mono text-xs">
          {/* Cloud Costs */}
          <div className="bg-neutral-950 border border-neutral-800 p-3 sm:p-5 space-y-4">
            <div className="border-b border-neutral-900 pb-2 font-bold uppercase text-white">
              Cloud Cost & Billing Ingestion (AWS Cost Explorer / Azure Cost / GCP Billing)
            </div>

            <div className="space-y-3">
              {cloudCosts.map(cost => (
                <div key={cost.id} className="bg-black border border-neutral-800 p-3 sm:p-4 space-y-2">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-neutral-900 pb-2 gap-1">
                    <span className="text-xs sm:text-sm font-bold text-white">{cost.cloudProvider}: {cost.serviceName}</span>
                    <span className="text-xs sm:text-sm font-bold text-red-500">${cost.monthlyProjectedCostUsd.toLocaleString()} /mo</span>
                  </div>

                  <div className="bg-neutral-950 p-2 border border-neutral-900 text-[10px] text-neutral-300 break-all space-y-1">
                    <p><strong className="text-white">Resource ARN/ID: </strong>{cost.resourceArn}</p>
                    <p><strong className="text-white">Billing Account: </strong>{cost.billingAccount} | Region: {cost.region} | Cost Center: {cost.costCenter}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SaaS Discovery Signals */}
          <div className="bg-neutral-950 border border-neutral-800 p-3 sm:p-5 space-y-4">
            <div className="border-b border-neutral-900 pb-2 font-bold uppercase text-white">
              SaaS Discovery Signals & Shadow IT Detection (IdP / CASB Signals)
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {saasSignals.map(sig => (
                <div key={sig.id} className="bg-black border border-neutral-800 p-3 space-y-2">
                  <div className="flex justify-between items-center border-b border-neutral-900 pb-1">
                    <span className="font-bold text-white">{sig.appName}</span>
                    <span className={`px-2 py-0.5 text-[8px] font-bold border ${
                      sig.classification === 'Shadow_IT' 
                        ? 'bg-red-950 text-red-500 border-red-900' 
                        : 'bg-black text-white border-neutral-800'
                    }`}>
                      {sig.classification}
                    </span>
                  </div>

                  <div className="text-[10px] text-neutral-400 space-y-0.5">
                    <p><strong className="text-white">User: </strong>{sig.userEmail}</p>
                    <p><strong className="text-white">Dept: </strong>{sig.department}</p>
                    <p><strong className="text-white">Logins: </strong>{sig.loginCount} logins</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: EVENT STREAM & WEBHOOKS */}
      {activeTab === 'event_stream_and_webhooks' && (
        <div className="space-y-4 sm:space-y-6 font-mono text-xs">
          {/* Webhooks */}
          <div className="bg-neutral-950 border border-neutral-800 p-3 sm:p-5 space-y-4">
            <div className="border-b border-neutral-900 pb-2 font-bold uppercase text-white">
              Outbound Webhook Delivery Policies & HMAC Signing
            </div>

            {webhooks.map(wh => (
              <div key={wh.id} className="bg-black border border-neutral-800 p-3 sm:p-4 space-y-2">
                <div className="flex justify-between items-center border-b border-neutral-900 pb-2">
                  <span className="text-xs sm:text-sm font-bold text-white">{wh.name}</span>
                  <span className="px-2 py-0.5 text-[8px] bg-red-950 text-red-400 border border-red-900 font-bold uppercase">
                    {wh.status}
                  </span>
                </div>

                <div className="bg-neutral-950 p-2 border border-neutral-900 text-[10px] text-neutral-300 break-all space-y-1">
                  <p><strong className="text-white">Endpoint URL: </strong>{wh.endpointUrl}</p>
                  <p><strong className="text-white">Events: </strong>{wh.subscribedEvents.join(', ')}</p>
                  <p><strong className="text-white">Retry Policy: </strong>{wh.retryPolicy} | Total Delivered: {wh.totalDelivered}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Real-time Event Log */}
          <div className="bg-neutral-950 border border-neutral-800 p-3 sm:p-5 space-y-3">
            <span className="text-xs font-bold uppercase text-white block border-b border-neutral-900 pb-2">
              Standardized Integration Event Stream Log
            </span>

            <div className="space-y-2">
              {eventStream.map(evt => (
                <div key={evt.eventId} className="bg-black border border-neutral-800 p-3 space-y-1">
                  <div className="flex flex-col sm:flex-row justify-between text-[10px] gap-1">
                    <span className="text-red-500 font-bold">{evt.eventType} ({evt.eventId})</span>
                    <span className="text-neutral-500">{evt.timestamp}</span>
                  </div>

                  <div className="bg-neutral-950 p-2 border border-neutral-900 text-[10px] text-neutral-300 overflow-x-auto">
                    <pre className="text-[9px] text-neutral-400 whitespace-pre-wrap">{JSON.stringify(evt.payload, null, 2)}</pre>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SOURCE PRECEDENCE */}
      {activeTab === 'source_precedence' && (
        <div className="space-y-4 sm:space-y-6 font-mono text-xs">
          <div className="bg-neutral-950 border border-neutral-800 p-3 sm:p-5 space-y-4">
            <div className="border-b border-neutral-900 pb-2 font-bold uppercase text-white">
              Field-Level Source Precedence Matrix
            </div>

            <div className="space-y-3">
              {precedenceRules.map(rule => (
                <div key={rule.id} className="bg-black border border-neutral-800 p-3 sm:p-4 space-y-2">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-neutral-900 pb-2 gap-1">
                    <span className="text-xs sm:text-sm font-bold text-white">{rule.fieldCategory} (Target: {rule.targetAttribute})</span>
                    <span className="text-[10px] text-neutral-500">ID: {rule.id}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
                    <span className="text-neutral-500 uppercase text-[10px]">Precedence Chain:</span>
                    {rule.precedenceChain.map((sys, idx) => (
                      <React.Fragment key={sys}>
                        {idx > 0 && <span className="text-red-600 font-bold">&gt;</span>}
                        <span className="px-2 py-0.5 bg-neutral-950 border border-neutral-800 text-white font-bold text-[10px]">
                          {sys}
                        </span>
                      </React.Fragment>
                    ))}
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
