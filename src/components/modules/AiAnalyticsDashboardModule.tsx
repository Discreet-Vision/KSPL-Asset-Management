import React, { useState, useEffect } from 'react';
import {
  Bot,
  Brain,
  Sparkles,
  AlertTriangle,
  TrendingUp,
  ShieldAlert,
  Server,
  KeyRound,
  DollarSign,
  Search,
  Send,
  RefreshCw,
  FileText,
  Lock,
  Cpu,
  Layers,
  CheckCircle2,
  ListFilter,
  BarChart3,
  HelpCircle,
  Database,
  Calendar,
  Activity,
  ArrowRight,
} from 'lucide-react';

import {
  AnomalyRecord,
  FailureRiskRecord,
  EolRiskRecord,
  RenewalCostForecast,
  WarrantyExpirationForecast,
  CopilotMessage,
  AIProviderConfig,
  MLModelConfig,
  AiAuditLogRecord,
  AIRecommendation,
} from '../../analytics/types/analyticsTypes';

import { AnalyticsApiRouter } from '../../analytics/server/analyticsApiRouter';

export const AiAnalyticsDashboardModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'anomalies' | 'risks' | 'forecasts' | 'copilot' | 'models' | 'audit'
  >('overview');

  // State
  const [anomalies, setAnomalies] = useState<AnomalyRecord[]>([]);
  const [failureRisks, setFailureRisks] = useState<FailureRiskRecord[]>([]);
  const [eolRisks, setEolRisks] = useState<EolRiskRecord[]>([]);
  const [renewalForecasts, setRenewalForecasts] = useState<RenewalCostForecast[]>([]);
  const [warrantyForecasts, setWarrantyForecasts] = useState<WarrantyExpirationForecast[]>([]);
  const [providers, setProviders] = useState<AIProviderConfig[]>([]);
  const [models, setModels] = useState<MLModelConfig[]>([]);
  const [auditLogs, setAuditLogs] = useState<AiAuditLogRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Copilot State
  const [chatMessages, setChatMessages] = useState<CopilotMessage[]>([
    {
      id: 'init-1',
      sessionId: 'session-live',
      sender: 'ai',
      timestamp: '11:20 AM',
      text: 'Welcome to KSPL ITAM AI Copilot & Predictive Analytics Engine. I am powered by Gemini 3.6 Flash and read-only ITAM telemetry adapters. How can I assist you with asset risk, EOL forecasts, or license compliance today?',
      citations: ['KSPL Enterprise ITAM Knowledge Graph'],
    },
  ]);
  const [promptInput, setPromptInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Background Worker State
  const [workerRunning, setWorkerRunning] = useState(false);
  const [lastWorkerRun, setLastWorkerRun] = useState('2026-08-11 04:00:00');

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    try {
      const [anomData, failData, eolData, renData, warrData, provData, modData, logData] = await Promise.all([
        AnalyticsApiRouter.getAnomalies(),
        AnalyticsApiRouter.getHardwareFailureRisks(),
        AnalyticsApiRouter.getEolRisks(),
        AnalyticsApiRouter.getRenewalForecasts(),
        AnalyticsApiRouter.getWarrantyForecasts(),
        Promise.resolve(AnalyticsApiRouter.getProviders()),
        Promise.resolve(AnalyticsApiRouter.getModels()),
        AnalyticsApiRouter.getAuditLogs(),
      ]);

      setAnomalies(anomData);
      setFailureRisks(failData);
      setEolRisks(eolData);
      setRenewalForecasts(renData);
      setWarrantyForecasts(warrData);
      setProviders(provData);
      setModels(modData);
      setAuditLogs(logData);
    } catch (err) {
      console.error('Failed to load analytics engine data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendCopilotPrompt = async (textToSend?: string) => {
    const query = textToSend || promptInput;
    if (!query.trim() || isGenerating) return;

    const userMsg: CopilotMessage = {
      id: `usr-${Date.now()}`,
      sessionId: 'session-live',
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: query,
    };

    setChatMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setPromptInput('');
    setIsGenerating(true);

    try {
      const aiResponse = await AnalyticsApiRouter.handleCopilotQuery(query, 'Admin');
      setChatMessages((prev) => [...prev, aiResponse]);
      // Refresh audit logs
      const updatedLogs = await AnalyticsApiRouter.getAuditLogs();
      setAuditLogs(updatedLogs);
    } catch (err) {
      console.error('Error querying AI Copilot:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const triggerManualRecalculation = async () => {
    setWorkerRunning(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setWorkerRunning(false);
    setLastWorkerRun(new Date().toISOString().replace('T', ' ').substring(0, 19));
    await loadAnalyticsData();
  };

  const criticalAnomaliesCount = anomalies.filter((a) => a.severity === 'Critical').length;
  const criticalFailureCount = failureRisks.filter((r) => r.riskLevel === 'Critical').length;
  const criticalEolCount = eolRisks.filter((e) => e.eolRiskLevel === 'Critical' || e.eolRiskLevel === 'High').length;

  return (
    <div className="p-4 sm:p-6 space-y-6 text-white font-sans bg-black min-h-screen">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-950 p-4 border border-zinc-800 rounded-lg shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-red-600 rounded border border-red-500 shadow-sm">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-black text-white tracking-tight font-mono">
                KSPL ANALYTICS & AI PREDICTIVE ENGINE
              </h1>
              <span className="bg-red-600 text-white text-[10px] font-bold uppercase font-mono px-2 py-0.5 rounded border border-red-500">
                AI Copilot V1.1
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5 font-mono">
              Anomaly Detection • Failure Risk Scoring (0-100) • EOL Forecasts • Natural-Language AI Query Engine
            </p>
          </div>
        </div>

        {/* Worker Control */}
        <div className="flex items-center space-x-3 bg-black p-2 border border-zinc-800 rounded font-mono text-xs">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
            <span className="text-zinc-400 text-[11px]">Worker: Active</span>
          </div>
          <button
            onClick={triggerManualRecalculation}
            disabled={workerRunning}
            className="bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1.5 rounded flex items-center space-x-1.5 border border-red-500 cursor-pointer transition-colors text-xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${workerRunning ? 'animate-spin' : ''}`} />
            <span>Recalculate AI Telemetry</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center space-x-1 bg-zinc-950 p-1.5 border border-zinc-800 rounded-lg overflow-x-auto custom-scrollbar font-mono text-xs">
        {[
          { id: 'overview', label: 'Executive Dashboard', icon: BarChart3 },
          { id: 'copilot', label: 'AI Copilot & Query Engine', icon: Bot, badge: 'Gemini 3.6' },
          { id: 'anomalies', label: `Anomalies (${anomalies.length})`, icon: AlertTriangle, badge: criticalAnomaliesCount > 0 ? `${criticalAnomaliesCount} Critical` : undefined },
          { id: 'risks', label: `Failure & EOL Matrix (${failureRisks.length})`, icon: ShieldAlert },
          { id: 'forecasts', label: 'Financial & Warranty Forecasts', icon: TrendingUp },
          { id: 'models', label: 'AI Providers & ML Models', icon: Cpu },
          { id: 'audit', label: `Privacy & Audit Logs (${auditLogs.length})`, icon: Lock },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-3 py-2 rounded transition-colors whitespace-nowrap cursor-pointer ${
                isActive ? 'bg-red-600 text-white font-bold border border-red-500' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                    isActive ? 'bg-white text-red-600' : 'bg-red-600/20 text-red-400 border border-red-500/30'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Loading Indicator */}
      {isLoading ? (
        <div className="p-12 text-center bg-zinc-950 border border-zinc-800 rounded-lg font-mono text-xs text-zinc-400 space-y-3">
          <RefreshCw className="w-8 h-8 text-red-500 animate-spin mx-auto" />
          <p>Evaluating multi-factor ITAM telemetry, failure risk scoring & contract indexes...</p>
        </div>
      ) : (
        <>
          {/* TAB 1: EXECUTIVE OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
                <div className="bg-zinc-950 p-4 border border-zinc-800 rounded-lg space-y-2">
                  <div className="flex items-center justify-between text-zinc-400 text-xs">
                    <span>Critical Anomalies</span>
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                  </div>
                  <div className="text-2xl font-black text-white">{criticalAnomaliesCount}</div>
                  <p className="text-[10px] text-zinc-500">Unusual cost, SMART disk error or license deficit</p>
                </div>

                <div className="bg-zinc-950 p-4 border border-zinc-800 rounded-lg space-y-2">
                  <div className="flex items-center justify-between text-zinc-400 text-xs">
                    <span>Hardware Failure Risk</span>
                    <ShieldAlert className="w-4 h-4 text-red-500" />
                  </div>
                  <div className="text-2xl font-black text-red-500">{criticalFailureCount} Assets</div>
                  <p className="text-[10px] text-zinc-500">Score &gt; 80/100 (Imminent Failure / Age &gt; 5 Yrs)</p>
                </div>

                <div className="bg-zinc-950 p-4 border border-zinc-800 rounded-lg space-y-2">
                  <div className="flex items-center justify-between text-zinc-400 text-xs">
                    <span>EOL & Obsolescence Risk</span>
                    <Server className="w-4 h-4 text-red-500" />
                  </div>
                  <div className="text-2xl font-black text-white">{criticalEolCount} Assets</div>
                  <p className="text-[10px] text-zinc-500">Windows Server 2012 R2 & RHEL 7 Unsupported OS</p>
                </div>

                <div className="bg-zinc-950 p-4 border border-zinc-800 rounded-lg space-y-2">
                  <div className="flex items-center justify-between text-zinc-400 text-xs">
                    <span>30-Day Renewal Est.</span>
                    <DollarSign className="w-4 h-4 text-red-500" />
                  </div>
                  <div className="text-2xl font-black text-white">₹1.25 Cr</div>
                  <p className="text-[10px] text-zinc-500">Microsoft M365 EA & Support Renewals</p>
                </div>
              </div>

              {/* Two Column Layout: Top Risks & AI Recommendations */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Critical Failure Risks */}
                <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-4 font-mono text-xs">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                    <h3 className="font-bold text-white flex items-center space-x-2">
                      <ShieldAlert className="w-4 h-4 text-red-500" />
                      <span>CRITICAL HARDWARE FAILURE RISKS (0-100 SCORE)</span>
                    </h3>
                    <button onClick={() => setActiveTab('risks')} className="text-[10px] text-red-400 hover:text-white cursor-pointer">
                      View All →
                    </button>
                  </div>

                  <div className="space-y-3">
                    {failureRisks.map((risk) => (
                      <div key={risk.id} className="p-3 bg-black border border-zinc-800 rounded space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white">{risk.assetName} ({risk.assetId})</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white border border-red-500">
                            SCORE: {risk.failureRiskScore} / 100 ({risk.riskLevel})
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400">{risk.recommendation}</p>
                        <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1 border-t border-zinc-900">
                          <span>Warranty: {risk.warrantyStatus}</span>
                          <span>90d Incidents: {risk.incidentCount90d}</span>
                          <span>Age: {risk.ageYears} Yrs</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Recommendations */}
                <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-4 font-mono text-xs">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                    <h3 className="font-bold text-white flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-red-500" />
                      <span>EXPLICIT AI RECOMMENDATIONS (ADVISORY ONLY)</span>
                    </h3>
                    <span className="text-[10px] bg-red-600/20 text-red-400 px-2 py-0.5 rounded border border-red-500/30">
                      Human Oversight Required
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3 bg-black border border-zinc-800 rounded space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">Displace Unsupported OS Node (SRV-8803)</span>
                        <span className="text-red-400 font-bold">₹9.2 Lakh Impact</span>
                      </div>
                      <p className="text-zinc-400 text-[11px]">
                        Server running Windows Server 2012 R2 has reached EOL with disk sectoral degradation. Recommendation: Migrate database workload to Cloud VM before end-of-quarter.
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-zinc-500">
                        <span>Confidence: 99%</span>
                        <span className="text-red-500 font-bold">Status: Pending Review</span>
                      </div>
                    </div>

                    <div className="p-3 bg-black border border-zinc-800 rounded space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">Reclaim M365 License Deficit (+120 Seats)</span>
                        <span className="text-red-400 font-bold">₹38.4 Lakh True-Up</span>
                      </div>
                      <p className="text-zinc-400 text-[11px]">
                        Software discovery identified 140 M365 E5 accounts unassigned or inactive for &gt; 60 days. Reallocating inactive seats will completely eliminate the ₹38.4 Lakh true-up liability.
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-zinc-500">
                        <span>Confidence: 96%</span>
                        <span className="text-red-500 font-bold">Status: Pending Review</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: NATURAL LANGUAGE AI COPILOT */}
          {activeTab === 'copilot' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono text-xs">
              {/* Chat Column */}
              <div className="lg:col-span-2 bg-zinc-950 border border-zinc-800 rounded-lg flex flex-col h-[600px]">
                <div className="p-3 bg-black border-b border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bot className="w-5 h-5 text-red-500" />
                    <div>
                      <h3 className="font-bold text-white">KSPL Natural-Language ITAM Copilot</h3>
                      <p className="text-[10px] text-zinc-400">Google AI Gemini 3.6 Flash Server Engine • Read-Only Adapters</p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded font-bold">PII Masking Active</span>
                </div>

                {/* Messages Body */}
                <div className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar">
                  {chatMessages.map((msg) => (
                    <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                      <div className="text-[10px] text-zinc-500 mb-1">
                        {msg.sender === 'user' ? 'You (Jitin)' : 'KSPL Copilot'} • {msg.timestamp}
                      </div>
                      <div
                        className={`p-3 rounded-lg max-w-[92%] leading-relaxed ${
                          msg.sender === 'user'
                            ? 'bg-red-600 text-white font-medium border border-red-500'
                            : 'bg-black text-zinc-200 border border-zinc-800'
                        }`}
                      >
                        <p>{msg.text}</p>

                        {/* Metrics Cards in AI Response */}
                        {msg.resultData?.metrics && (
                          <div className="mt-3 grid grid-cols-3 gap-2 border-t border-zinc-800 pt-2 text-[10px]">
                            {msg.resultData.metrics.map((m, idx) => (
                              <div key={idx} className="bg-zinc-900 p-2 rounded border border-zinc-800">
                                <div className="text-zinc-400">{m.label}</div>
                                <div className="text-white font-bold">{m.value}</div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Table Result in AI Response */}
                        {msg.resultData?.tableRows && msg.resultData.tableRows.length > 0 && (
                          <div className="mt-3 overflow-x-auto border border-zinc-800 rounded">
                            <table className="w-full text-left text-[11px]">
                              <thead className="bg-zinc-900 text-zinc-400 border-b border-zinc-800 text-[9px] uppercase">
                                <tr>
                                  {msg.resultData.tableHeaders?.map((h, i) => (
                                    <th key={i} className="p-2">{h}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-zinc-800 text-zinc-300">
                                {msg.resultData.tableRows.map((row, idx) => (
                                  <tr key={idx} className="hover:bg-zinc-900">
                                    {Object.values(row).map((val: any, vIdx) => (
                                      <td key={vIdx} className="p-2 font-mono">{val}</td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}

                        {/* Citations */}
                        {msg.citations && msg.citations.length > 0 && (
                          <div className="mt-2 text-[10px] text-zinc-500 border-t border-zinc-900 pt-1.5 flex items-center space-x-1">
                            <FileText className="w-3 h-3 text-red-500 shrink-0" />
                            <span>Citations: {msg.citations.join(' • ')}</span>
                          </div>
                        )}

                        {/* Advisory Label */}
                        {msg.dataQualityNote && (
                          <div className="mt-1.5 text-[9px] text-red-400 font-bold uppercase tracking-wider">
                            {msg.dataQualityNote}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {isGenerating && (
                    <div className="flex items-center space-x-2 text-zinc-400 text-xs font-mono py-2">
                      <RefreshCw className="w-4 h-4 text-red-500 animate-spin" />
                      <span>Gemini 3.6 Flash parsing intent & validating RBAC permissions...</span>
                    </div>
                  )}
                </div>

                {/* Quick Prompts */}
                <div className="px-3 py-2 bg-zinc-900 border-t border-zinc-800 flex items-center space-x-2 overflow-x-auto text-[11px]">
                  <button
                    onClick={() => handleSendCopilotPrompt('Show servers with expiring warranties in APAC')}
                    className="bg-black hover:bg-zinc-800 text-zinc-300 border border-zinc-800 hover:border-red-500 px-2 py-1 rounded whitespace-nowrap cursor-pointer"
                  >
                    Servers with expiring warranties in APAC
                  </button>
                  <button
                    onClick={() => handleSendCopilotPrompt('Which software licenses are under-licensed?')}
                    className="bg-black hover:bg-zinc-800 text-zinc-300 border border-zinc-800 hover:border-red-500 px-2 py-1 rounded whitespace-nowrap cursor-pointer"
                  >
                    Under-licensed software deficit
                  </button>
                </div>

                {/* Input Box */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendCopilotPrompt();
                  }}
                  className="p-3 bg-black border-t border-zinc-800 flex items-center space-x-2"
                >
                  <input
                    type="text"
                    placeholder="Ask any complex ITAM question (e.g. Laptops in Finance with high failure risk)..."
                    value={promptInput}
                    onChange={(e) => setPromptInput(e.target.value)}
                    disabled={isGenerating}
                    className="flex-1 bg-zinc-900 border border-zinc-800 focus:border-red-500 text-white placeholder-zinc-500 text-xs rounded px-3 py-2 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!promptInput.trim() || isGenerating}
                    className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white p-2 rounded border border-red-500 cursor-pointer transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>

              {/* Sidebar Info: Structured Query Plan */}
              <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-4">
                <h3 className="font-bold text-white flex items-center space-x-2 border-b border-zinc-800 pb-2">
                  <Layers className="w-4 h-4 text-red-500" />
                  <span>STRUCTURED AI QUERY PLAN</span>
                </h3>

                <p className="text-zinc-400 text-[11px]">
                  Every question asked is converted into a structured, validated query plan before execution to guarantee zero hallucinations and strict RBAC authorization.
                </p>

                <div className="p-3 bg-black border border-zinc-800 rounded space-y-2">
                  <div className="text-[10px] text-zinc-500 uppercase">Target Entity Domain</div>
                  <div className="text-white font-bold">Hardware Assets & Software Licenses</div>

                  <div className="text-[10px] text-zinc-500 uppercase mt-2">Data Quality Check</div>
                  <div className="flex items-center space-x-1 text-red-400 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-red-500" />
                    <span>Sufficient Telemetry Verified</span>
                  </div>

                  <div className="text-[10px] text-zinc-500 uppercase mt-2">Privacy & Masking</div>
                  <div className="text-zinc-300">Emails, IPs, and passwords sanitized automatically</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ANOMALIES & DETAILED EXPLAINABILITY */}
          {activeTab === 'anomalies' && (
            <div className="space-y-4 font-mono text-xs">
              <div className="bg-zinc-950 p-4 border border-zinc-800 rounded-lg flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-white text-sm flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <span>ANOMALY DETECTION & AI EXPLAINABILITY ENGINE</span>
                  </h2>
                  <p className="text-zinc-400 text-[11px] mt-0.5">
                    Identifies statistical outliers in cost, growth, hardware changes, software installs, and license deficits.
                  </p>
                </div>
                <span className="bg-red-600 text-white font-bold px-3 py-1 rounded text-xs border border-red-500">
                  {anomalies.length} Total Anomalies Flagged
                </span>
              </div>

              <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-black text-zinc-400 border-b border-zinc-800 text-[10px] uppercase">
                    <tr>
                      <th className="p-3">Detected Date</th>
                      <th className="p-3">Anomaly Type</th>
                      <th className="p-3">Severity</th>
                      <th className="p-3">Target Asset / Software</th>
                      <th className="p-3">Baseline vs Observed</th>
                      <th className="p-3">AI Explainability & Reason</th>
                      <th className="p-3">Recommended Action</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800 text-zinc-300">
                    {anomalies.map((anom) => (
                      <tr key={anom.id} className="hover:bg-zinc-900">
                        <td className="p-3 text-zinc-400">{anom.detectedDate}</td>
                        <td className="p-3 font-bold text-white">{anom.anomalyType}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              anom.severity === 'Critical'
                                ? 'bg-red-600 text-white border border-red-500'
                                : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                            }`}
                          >
                            {anom.severity}
                          </span>
                        </td>
                        <td className="p-3 text-red-400 font-bold">{anom.assetName || 'Enterprise License'}</td>
                        <td className="p-3 text-zinc-400 font-mono">
                          {anom.baselineValue} → <span className="text-white font-bold">{anom.observedValue}</span>
                        </td>
                        <td className="p-3 max-w-xs text-zinc-300">{anom.reason}</td>
                        <td className="p-3 max-w-xs text-zinc-400">{anom.recommendedAction}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded bg-zinc-900 text-red-400 border border-red-500/30 text-[10px] font-bold">
                            {anom.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: FAILURE & EOL RISK MATRIX */}
          {activeTab === 'risks' && (
            <div className="space-y-6 font-mono text-xs">
              <div className="bg-zinc-950 p-4 border border-zinc-800 rounded-lg">
                <h2 className="font-bold text-white text-sm flex items-center space-x-2">
                  <ShieldAlert className="w-4 h-4 text-red-500" />
                  <span>HARDWARE FAILURE & EOL RISK PRIORITIZATION MATRIX</span>
                </h2>
                <p className="text-zinc-400 text-[11px] mt-0.5">
                  Multi-factor risk score (0-100) based on age, warranty status, repair history, SMART telemetry, and operating system EOL dates.
                </p>
              </div>

              {/* Hardware Failure Scores */}
              <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-4">
                <h3 className="font-bold text-white text-xs flex items-center space-x-2 border-b border-zinc-800 pb-2">
                  <Cpu className="w-4 h-4 text-red-500" />
                  <span>HARDWARE FAILURE RISK BREAKDOWN (0-100 SCORE)</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {failureRisks.map((fail) => (
                    <div key={fail.id} className="p-4 bg-black border border-zinc-800 rounded space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-white text-sm">{fail.assetName}</span>
                          <div className="text-[10px] text-zinc-500">{fail.assetType} • Tag: {fail.assetId}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-black text-red-500">{fail.failureRiskScore} / 100</div>
                          <span className="px-2 py-0.5 bg-red-600 text-white text-[9px] font-bold uppercase rounded border border-red-500">
                            {fail.riskLevel} RISK
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1.5 border-t border-b border-zinc-900 py-2">
                        <div className="text-[10px] text-zinc-400 font-bold uppercase">Contributing Factors:</div>
                        {fail.factors.map((f, i) => (
                          <div key={i} className="flex items-center justify-between text-[11px] text-zinc-300">
                            <span>• {f.factorName} ({f.description})</span>
                            <span className="text-red-400 font-bold">+{f.scoreContribution} pts</span>
                          </div>
                        ))}
                      </div>

                      <p className="text-zinc-400 text-[11px]">{fail.recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: FINANCIAL & WARRANTY FORECASTS */}
          {activeTab === 'forecasts' && (
            <div className="space-y-6 font-mono text-xs">
              <div className="bg-zinc-950 p-4 border border-zinc-800 rounded-lg">
                <h2 className="font-bold text-white text-sm flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-red-500" />
                  <span>TIME-SERIES RENEWAL & WARRANTY COST FORECAST ENGINE</span>
                </h2>
                <p className="text-zinc-400 text-[11px] mt-0.5">
                  Multi-horizon forecast (30d, 60d, 90d, 6m, 12m, 24m) predicting license renewals, hardware maintenance, and replacement costs.
                </p>
              </div>

              {/* Renewal Cost Forecast Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {renewalForecasts.map((ren) => (
                  <div key={ren.id} className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                      <span className="font-bold text-white text-sm">{ren.timeframeLabel} Renewal Forecast</span>
                      <span className="px-2 py-0.5 bg-red-600/20 text-red-400 border border-red-500/30 font-bold rounded text-[10px]">
                        Confidence: {ren.confidenceScore}%
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="text-zinc-400 text-[10px]">Estimated Renewal Liability:</div>
                      <div className="text-2xl font-black text-white">₹{(ren.estimatedRenewalCost / 100000).toFixed(2)} Lakhs</div>
                    </div>

                    <div className="text-[10px] text-zinc-400 space-y-1 border-t border-zinc-900 pt-2">
                      <div>Methodology: {ren.methodology}</div>
                      <div>Records Analyzed: {ren.historicalRecordsUsed}</div>
                    </div>

                    <div className="space-y-1 border-t border-zinc-900 pt-2">
                      <div className="text-[10px] font-bold text-zinc-300">Top Cost Drivers:</div>
                      {ren.majorCostDrivers.map((d, i) => (
                        <div key={i} className="flex items-center justify-between text-[10px] text-zinc-400">
                          <span>{d.vendorName} ({d.productName})</span>
                          <span className="text-white font-bold">{d.percentageOfTotal}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: AI PROVIDERS & ML MODELS */}
          {activeTab === 'models' && (
            <div className="space-y-6 font-mono text-xs">
              <div className="bg-zinc-950 p-4 border border-zinc-800 rounded-lg">
                <h2 className="font-bold text-white text-sm flex items-center space-x-2">
                  <Cpu className="w-4 h-4 text-red-500" />
                  <span>AI PROVIDER ABSTRACTION & ML MODEL REGISTRY</span>
                </h2>
                <p className="text-zinc-400 text-[11px] mt-0.5">
                  Configure active LLM provider adapters (Google AI Gemini 3.6 Flash, Enterprise LLM, Local LLM) and inspect ML model accuracy metrics.
                </p>
              </div>

              {/* Provider Configs */}
              <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-4">
                <h3 className="font-bold text-white border-b border-zinc-800 pb-2">ACTIVE AI PROVIDER ADAPTERS</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {providers.map((prov) => (
                    <div key={prov.id} className="p-3 bg-black border border-zinc-800 rounded space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{prov.providerName}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${prov.isEnabled ? 'bg-red-600 text-white' : 'bg-zinc-800 text-zinc-500'}`}>
                          {prov.status}
                        </span>
                      </div>
                      <div className="text-[10px] text-zinc-400 space-y-0.5">
                        <div>Model Alias: <span className="text-white">{prov.modelAlias}</span></div>
                        <div>PII Masking: <span className="text-red-400 font-bold">{prov.privacyMaskPii ? 'Enabled' : 'Disabled'}</span></div>
                        <div>Avg Latency: <span className="text-white">{prov.latencyMsAvg} ms</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: PRIVACY & AUDIT LOGS */}
          {activeTab === 'audit' && (
            <div className="space-y-4 font-mono text-xs">
              <div className="bg-zinc-950 p-4 border border-zinc-800 rounded-lg flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-white text-sm flex items-center space-x-2">
                    <Lock className="w-4 h-4 text-red-500" />
                    <span>AI DATA PRIVACY & IMMUTABLE AI QUERY AUDIT LOGS</span>
                  </h2>
                  <p className="text-zinc-400 text-[11px] mt-0.5">
                    Records every natural-language query, sanitized prompt, PII masking status, data sources queried, and execution latency.
                  </p>
                </div>
                <span className="bg-red-600 text-white font-bold px-3 py-1 rounded text-xs border border-red-500">
                  {auditLogs.length} Logged Sessions
                </span>
              </div>

              <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-black text-zinc-400 border-b border-zinc-800 text-[10px] uppercase">
                    <tr>
                      <th className="p-3">Timestamp</th>
                      <th className="p-3">User</th>
                      <th className="p-3">Sanitized Prompt</th>
                      <th className="p-3">Data Sources Used</th>
                      <th className="p-3">Provider</th>
                      <th className="p-3">Confidence</th>
                      <th className="p-3">Latency</th>
                      <th className="p-3">PII Mask</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800 text-zinc-300">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-zinc-900">
                        <td className="p-3 text-zinc-400">{log.timestamp}</td>
                        <td className="p-3 font-bold text-white">{log.userName}</td>
                        <td className="p-3 max-w-xs truncate text-red-400">{log.questionText}</td>
                        <td className="p-3 text-zinc-400">{log.dataSourcesUsed.join(', ')}</td>
                        <td className="p-3 text-white">{log.providerUsed}</td>
                        <td className="p-3 text-red-400 font-bold">{log.confidenceScore}%</td>
                        <td className="p-3 text-zinc-400">{log.executionTimeMs} ms</td>
                        <td className="p-3 font-bold text-red-500">{log.piiMaskApplied ? 'PASSED' : 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
