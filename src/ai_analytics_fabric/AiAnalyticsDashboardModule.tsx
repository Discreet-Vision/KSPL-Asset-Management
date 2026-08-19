import React, { useState } from 'react';
import { 
  Bot, AlertTriangle, TrendingUp, Cpu, Network, Send, 
  RefreshCw, CheckCircle2, Search, Zap, Layers, Server
} from 'lucide-react';
import { 
  PredictiveMaintenanceAsset, 
  CopilotQueryHistory, 
  AssetAnomalyRecord, 
  SpendRenewalForecastItem, 
  MarketplaceConnector, 
  WebhookEventRecord, 
  AiAnalyticsStats 
} from './types';
import { aiAnalyticsEngine } from './aiAnalyticsEngine';

export const AiAnalyticsDashboardModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'predictive_maintenance' | 'copilot' | 'anomalies' | 'forecasts' | 'marketplace' | 'event_bus'
  >('predictive_maintenance');

  const [predictiveAssets] = useState<PredictiveMaintenanceAsset[]>(aiAnalyticsEngine.getPredictiveAssets());
  const [copilotHistory, setCopilotHistory] = useState<CopilotQueryHistory[]>(aiAnalyticsEngine.getCopilotHistory());
  const [anomalies] = useState<AssetAnomalyRecord[]>(aiAnalyticsEngine.getAnomalies());
  const [forecasts] = useState<SpendRenewalForecastItem[]>(aiAnalyticsEngine.getForecasts());
  const [connectors] = useState<MarketplaceConnector[]>(aiAnalyticsEngine.getConnectors());
  const [webhookEvents, setWebhookEvents] = useState<WebhookEventRecord[]>(aiAnalyticsEngine.getWebhookEvents());
  const [stats, setStats] = useState<AiAnalyticsStats>(aiAnalyticsEngine.getStats());

  const [copilotInput, setCopilotInput] = useState('Show all high-risk servers approaching EOL in EMEA');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleRunCopilot = () => {
    if (!copilotInput.trim()) return;
    aiAnalyticsEngine.runCopilotQuery(copilotInput);
    setCopilotHistory([...aiAnalyticsEngine.getCopilotHistory()]);
    setStats(aiAnalyticsEngine.getStats());
    setSuccessMsg(`Copilot query processed with RBAC filtering & zero data leaks.`);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleSimulateWebhook = () => {
    aiAnalyticsEngine.triggerWebhook(
      'risk.created.v1', 
      JSON.stringify({ event: 'risk.created.v1', assetId: 'AST-LPT-9901', risk: 'CRITICAL', timestamp: new Date().toISOString() })
    );
    setWebhookEvents([...aiAnalyticsEngine.getWebhookEvents()]);
    setStats(aiAnalyticsEngine.getStats());
    setSuccessMsg(`Dispatched webhook event 'risk.created.v1' over Event Bus.`);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  return (
    <div className="bg-black text-white p-6 font-sans border border-red-900 shadow-2xl space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-red-900 pb-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-red-600 animate-pulse" />
            <h1 className="text-xl font-bold uppercase tracking-wider text-white">
              AI, Analytics & Integration Fabric Engine
            </h1>
            <span className="text-xs bg-red-950 text-red-400 px-2 py-0.5 border border-red-800 font-mono">
              Enterprise AI v2026.8
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1 font-mono">
            Predictive Maintenance • Natural Language Copilot • Anomaly Engine • Spend Forecasts • Open API Connector Marketplace • Webhook Event Bus
          </p>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="flex flex-wrap gap-1 mt-4 md:mt-0 border border-neutral-800 p-1 bg-neutral-950 font-mono text-xs">
          {(
            [
              ['predictive_maintenance', `Predictive (${predictiveAssets.length})`],
              ['copilot', `AI Copilot (${copilotHistory.length})`],
              ['anomalies', `Anomalies (${anomalies.length})`],
              ['forecasts', `Forecasts (${forecasts.length})`],
              ['marketplace', `Marketplace (${connectors.length})`],
              ['event_bus', `Event Bus (${webhookEvents.length})`]
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

      {/* Stats KPI Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-7 gap-3 font-mono text-xs">
        <div className="bg-neutral-950 border border-neutral-800 p-3 text-center">
          <span className="text-[10px] text-neutral-500 uppercase">High/Critical Risk Assets</span>
          <div className="text-xl font-bold text-red-500 mt-1">{stats.highRiskAssetsCount}</div>
        </div>

        <div className="bg-neutral-950 border border-neutral-800 p-3 text-center">
          <span className="text-[10px] text-neutral-500 uppercase">Active Anomalies</span>
          <div className="text-xl font-bold text-red-400 mt-1">{stats.activeAnomaliesCount}</div>
        </div>

        <div className="bg-neutral-950 border border-neutral-800 p-3 text-center">
          <span className="text-[10px] text-neutral-500 uppercase">12M Forecasted Spend</span>
          <div className="text-xl font-bold text-white mt-1">${(stats.forecastedSpendNext12m / 1000).toFixed(0)}k</div>
        </div>

        <div className="bg-neutral-950 border border-neutral-800 p-3 text-center">
          <span className="text-[10px] text-neutral-500 uppercase">Connected Marketplaces</span>
          <div className="text-xl font-bold text-white mt-1">{stats.connectedMarketplaceCount}</div>
        </div>

        <div className="bg-neutral-950 border border-neutral-800 p-3 text-center">
          <span className="text-[10px] text-neutral-500 uppercase">Webhooks Dispatched</span>
          <div className="text-xl font-bold text-white mt-1">{stats.webhooksDeliveredCount}</div>
        </div>

        <div className="bg-neutral-950 border border-neutral-800 p-3 text-center">
          <span className="text-[10px] text-neutral-500 uppercase">Copilot Queries</span>
          <div className="text-xl font-bold text-white mt-1">{stats.copilotQueriesProcessed}</div>
        </div>

        <div className="bg-neutral-950 border border-neutral-800 p-3 text-center">
          <span className="text-[10px] text-neutral-500 uppercase">Model Security</span>
          <div className="text-xl font-bold text-red-500 mt-1">RBAC Enforced</div>
        </div>
      </div>

      {/* TAB 1: PREDICTIVE MAINTENANCE & EOL FORECASTING */}
      {activeTab === 'predictive_maintenance' && (
        <div className="space-y-6 font-mono text-xs">
          <div className="bg-neutral-950 border border-neutral-800 p-5 space-y-4">
            <div className="border-b border-neutral-900 pb-2 font-bold uppercase text-white flex justify-between items-center">
              <span>Predictive Hardware Failure Risk & EOL / EOS Forecasts</span>
              <span className="text-[10px] text-red-500 font-bold">AI/ML Failure Risk Matrix</span>
            </div>

            <div className="space-y-3">
              {predictiveAssets.map(asset => (
                <div key={asset.assetId} className="bg-black border border-neutral-800 p-4 space-y-3">
                  <div className="flex justify-between items-start border-b border-neutral-900 pb-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-white">{asset.assetTag}</span>
                        <span className="text-[10px] text-neutral-400">({asset.category})</span>
                      </div>
                      <span className="text-[10px] text-neutral-500">Asset Age: {asset.ageYears} Years • Model: {asset.model}</span>
                    </div>

                    <div className="text-right">
                      <span className={`px-2 py-0.5 text-[9px] font-bold border ${
                        asset.failureRisk === 'CRITICAL' || asset.failureRisk === 'HIGH'
                          ? 'bg-red-950 text-red-500 border-red-900'
                          : 'bg-black text-white border-neutral-800'
                      }`}>
                        Risk: {asset.failureRisk} ({asset.failureProbabilityPercent}% Prob)
                      </span>
                      <span className="block text-[9px] text-neutral-500 mt-1">Confidence: {asset.confidencePercent}%</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[10px] bg-neutral-950 p-2 border border-neutral-900">
                    <div>
                      <span className="text-neutral-500 uppercase block">Hardware EOL Date</span>
                      <span className="text-white font-bold">{asset.hardwareEolDate}</span>
                    </div>

                    <div>
                      <span className="text-neutral-500 uppercase block">Hardware EOS Date</span>
                      <span className="text-white font-bold">{asset.hardwareEosDate}</span>
                    </div>

                    <div>
                      <span className="text-neutral-500 uppercase block">OS EOL Date</span>
                      <span className="text-white font-bold">{asset.osEolDate}</span>
                    </div>
                  </div>

                  <p className="text-[10px] text-neutral-300">
                    <strong className="text-red-500 uppercase">Recommended AI Action: </strong>
                    {asset.recommendedAction}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: NATURAL LANGUAGE AI COPILOT */}
      {activeTab === 'copilot' && (
        <div className="space-y-6 font-mono text-xs">
          <div className="bg-neutral-950 border border-neutral-800 p-5 space-y-4">
            <div className="border-b border-neutral-900 pb-2 font-bold uppercase text-white">
              Natural-Language AI Copilot (Security & RBAC Enforced)
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={copilotInput}
                onChange={(e) => setCopilotInput(e.target.value)}
                placeholder="Ask anything about assets, CIs, software, or risks..."
                className="flex-1 bg-black border border-neutral-800 p-2.5 text-white font-bold focus:border-red-600 outline-none"
              />
              <button
                onClick={handleRunCopilot}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-wider text-[10px] flex items-center space-x-1"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Ask Copilot</span>
              </button>
            </div>

            <div className="space-y-3 pt-2">
              <span className="text-[10px] text-neutral-500 uppercase font-bold">Copilot Query History</span>

              {copilotHistory.map(cop => (
                <div key={cop.queryId} className="bg-black border border-neutral-800 p-4 space-y-2">
                  <div className="flex justify-between items-center border-b border-neutral-900 pb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-white">{cop.queryId}</span>
                      <span className="text-[10px] text-red-500 font-bold">[{cop.intentDetected}]</span>
                    </div>
                    <span className="text-[10px] text-neutral-500">{cop.queryTimestamp}</span>
                  </div>

                  <p className="text-xs text-white font-bold">"{cop.userQuery}"</p>

                  <div className="bg-neutral-950 p-2 border border-neutral-900 text-[10px] text-neutral-300 space-y-1">
                    <p className="text-red-400 font-bold">AI Explanation:</p>
                    <p>{cop.aiExplanation}</p>
                    <div className="flex justify-between text-[9px] text-neutral-500 pt-1 border-t border-neutral-900">
                      <span>Records Returned: {cop.recordsFoundCount}</span>
                      <span>RBAC / Field Filter: {cop.permissionFiltered ? 'Enforced (CONFIDENTIAL hidden)' : 'None'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ASSET ANOMALY DETECTION */}
      {activeTab === 'anomalies' && (
        <div className="space-y-6 font-mono text-xs">
          <div className="bg-neutral-950 border border-neutral-800 p-5 space-y-4">
            <div className="border-b border-neutral-900 pb-2 font-bold uppercase text-white">
              Behavioral Asset Anomaly Detection Engine
            </div>

            <div className="space-y-3">
              {anomalies.map(anom => (
                <div key={anom.anomalyId} className="bg-black border border-neutral-800 p-4 space-y-3">
                  <div className="flex justify-between items-center border-b border-neutral-900 pb-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-white">{anom.anomalyId}</span>
                        <span className="text-[10px] text-red-500 font-bold">[{anom.anomalyType}]</span>
                      </div>
                      <span className="text-[10px] text-neutral-400">Target CI: {anom.assetOrCiTag}</span>
                    </div>

                    <span className="px-2 py-0.5 text-[9px] bg-red-950 text-red-500 border border-red-900 font-bold uppercase">
                      Severity: {anom.severity} (Deviation: {anom.deviationScore}x)
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] bg-neutral-950 p-2 border border-neutral-900">
                    <div>
                      <span className="text-neutral-500 uppercase block">Observed Metric Value</span>
                      <span className="text-white font-bold">{anom.observedValue}</span>
                    </div>

                    <div>
                      <span className="text-neutral-500 uppercase block">Expected Baseline Value</span>
                      <span className="text-white font-bold">{anom.expectedValue}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[9px] text-neutral-500">
                    <span>Detected At: {anom.detectedAt}</span>
                    <span>Status: {anom.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: RENEWAL & SPEND FORECASTING */}
      {activeTab === 'forecasts' && (
        <div className="space-y-6 font-mono text-xs">
          <div className="bg-neutral-950 border border-neutral-800 p-5 space-y-4">
            <div className="border-b border-neutral-900 pb-2 font-bold uppercase text-white">
              AI Renewal & Spend Forecasting Engine
            </div>

            <div className="space-y-3">
              {forecasts.map(fc => (
                <div key={fc.forecastId} className="bg-black border border-neutral-800 p-4 space-y-3">
                  <div className="flex justify-between items-center border-b border-neutral-900 pb-2">
                    <div>
                      <span className="text-sm font-bold text-white">{fc.itemRef}</span>
                      <span className="text-[10px] text-red-500 block font-bold">[{fc.category}]</span>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-bold text-white">${fc.forecastedCost.toLocaleString()}</span>
                      <span className="block text-[9px] text-neutral-500">Range: ${fc.forecastRangeLow.toLocaleString()} - ${fc.forecastRangeHigh.toLocaleString()}</span>
                    </div>
                  </div>

                  <p className="text-[10px] text-neutral-300 bg-neutral-950 p-2 border border-neutral-900">
                    <strong className="text-white uppercase">Primary Cost Driver: </strong>
                    {fc.primaryCostDriver}
                  </p>

                  <div className="flex justify-between items-center text-[9px] text-neutral-500">
                    <span>Historical Baseline Cost: ${fc.historicalPeriodCost.toLocaleString()}</span>
                    <span>Forecast Confidence: {fc.confidencePercent}% ({fc.forecastPeriod})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: CONNECTOR MARKETPLACE */}
      {activeTab === 'marketplace' && (
        <div className="space-y-6 font-mono text-xs">
          <div className="bg-neutral-950 border border-neutral-800 p-5 space-y-4">
            <div className="border-b border-neutral-900 pb-2 font-bold uppercase text-white">
              Open API & Enterprise Connector Marketplace
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {connectors.map(conn => (
                <div key={conn.connectorId} className="bg-black border border-neutral-800 p-4 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start border-b border-neutral-900 pb-2">
                      <span className="text-xs font-bold text-white">{conn.name}</span>
                      <span className="px-2 py-0.5 text-[8px] bg-red-950 text-red-400 border border-red-900 font-bold uppercase">
                        {conn.category}
                      </span>
                    </div>

                    <span className="text-[10px] text-neutral-400 block">Provider: {conn.provider}</span>
                    <span className="text-[10px] text-neutral-500 block">Auth Mechanism: {conn.authMethod}</span>
                  </div>

                  <div className="pt-2 border-t border-neutral-900 flex justify-between items-center text-[9px]">
                    <span className="text-white font-bold">Synced Records: {conn.recordsSyncedCount}</span>
                    <span className="text-red-500 font-bold">{conn.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: WEBHOOK & EVENT BUS */}
      {activeTab === 'event_bus' && (
        <div className="space-y-6 font-mono text-xs">
          <div className="bg-neutral-950 border border-neutral-800 p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-neutral-900 pb-2">
              <span className="font-bold uppercase text-white">Real-Time Event Bus & Webhook Dispatcher</span>
              <button
                onClick={handleSimulateWebhook}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white font-bold text-[9px] uppercase"
              >
                Dispatch Test Event
              </button>
            </div>

            <div className="space-y-2">
              {webhookEvents.map(evt => (
                <div key={evt.eventId} className="bg-black border border-neutral-800 p-3 space-y-1">
                  <div className="flex justify-between items-center text-[10px]">
                    <div className="flex items-center space-x-2">
                      <span className="text-red-500 font-bold">{evt.eventId}</span>
                      <span className="text-white font-bold">[{evt.eventType}]</span>
                      <span className="text-neutral-400">Target: {evt.targetUrl}</span>
                    </div>
                    <span className="text-neutral-500">{evt.timestamp}</span>
                  </div>

                  <div className="text-[9px] text-neutral-400 font-mono bg-neutral-950 p-2 border border-neutral-900">
                    {evt.payloadEnvelope}
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
