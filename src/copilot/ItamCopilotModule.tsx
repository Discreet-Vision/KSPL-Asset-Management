import React, { useState } from 'react';
import { 
  Bot, Send, ShieldAlert, FileText, Activity, AlertCircle, 
  HelpCircle, RefreshCw, Cpu, Database, Check, Lock, ChevronRight,
  ThumbsUp, ThumbsDown, Search, Filter, Layers, ExternalLink
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  queryPlan?: {
    intent: string;
    filters: Record<string, any>;
  };
  references?: Array<{
    type: string;
    summary: string;
  }>;
  feedback?: 'helpful' | 'unhelpful';
}

export const ItamCopilotModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'chat' | 'audit' | 'anomaly' | 'settings'>('chat');
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Chat conversation state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-01',
      sender: 'assistant',
      text: 'Greetings. I am your Enterprise ITAM & CMDB Natural-Language Copilot powered by Claude 3.5 Sonnet & RAG.\n\nHow can I assist your asset, CMDB, or audit investigation today?',
      timestamp: '06:15:00',
      references: []
    }
  ]);

  // Suggested queries list
  const suggestedQueries = [
    "Show critical servers with warranties expiring in 90 days",
    "Which applications have the highest dependency risk if SERVER-001 fails?",
    "Prepare an ISO 27001 asset-management audit readiness summary",
    "Explain today's CPU utilization anomaly on SERVER-001",
    "Show unassigned laptops with missing owner records"
  ];

  const handleSendMessage = (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsProcessing(true);

    setTimeout(() => {
      let botResponse = "";
      let planIntent = "general_search";
      let refs: Array<{ type: string; summary: string }> = [];

      const qLower = query.toLowerCase();

      if (qLower.includes("server") || qLower.includes("warranty") || qLower.includes("expir")) {
        planIntent = "server_warranty_investigation";
        botResponse = `FACT:\nRetrieved 3 critical servers matching warranty criteria:\n- SERVER-001 (Windows Server 2019, Warranty Expiry: 2026-09-15)\n- SERVER-002 (RHEL 9.4, Primary DB Cluster Node)\n- SERVER-003 (Windows Server 2022, Active)\n\nINFERENCE:\nSERVER-001 requires warranty renewal within 35 days to ensure vendor SLA support.\n\nRECOMMENDATION:\nInitiate hardware warranty extension workflow before the 2026-09-15 cutoff date.`;
        refs = [
          { type: "CI / Server", summary: "SERVER-001 (Windows Server 2019) - Warranty Expiry 2026-09-15" },
          { type: "Contract", summary: "CTR-DELL-8821 Dell Enterprise ProSupport Plus" }
        ];
      } else if (qLower.includes("audit") || qLower.includes("iso")) {
        planIntent = "audit_readiness_summary";
        botResponse = `FACT:\nISO 27001 Asset Management Control (A.8) Audit Readiness Assessment:\n- Registered Configuration Items: 1,240\n- Verified Asset Ownership: 98.4%\n- Unassigned Laptops Identified: 18 workstations\n\nINFERENCE:\nHigh audit readiness posture. The primary compliance gap is incomplete owner annotations on 18 workstations.\n\nRECOMMENDATION:\nAssign verified custodian departments to the 18 pending workstation records.`;
        refs = [
          { type: "Audit Framework", summary: "ISO 27001 Annex A.8 Asset Governance" },
          { type: "Inventory Scan", summary: "AGENTLESS-SCAN-20260810 (18 Pending Items)" }
        ];
      } else if (qLower.includes("depend") || qLower.includes("blast") || qLower.includes("fail")) {
        planIntent = "blast_radius_analysis";
        botResponse = `FACT:\nBlast-Radius & Dependency Evaluation for SERVER-001:\n- Direct Dependencies: SAP ERP Core (CI-APP-303), Oracle DB Host 02\n- Secondary Impact: Financial Reporting Portal, Payroll Processing Service\n\nINFERENCE:\nUnannounced outage on SERVER-001 affects 4 critical business applications.\n\nRECOMMENDATION:\nEnsure secondary cluster failover test is verified prior to planned maintenance.`;
        refs = [
          { type: "Application CI", summary: "SAP ERP Core (CI-APP-303) - Severity: CRITICAL" },
          { type: "Graph Link", summary: "SERVER-001 -> Hosts -> Oracle DB -> Supports -> SAP ERP" }
        ];
      } else if (qLower.includes("anomal")) {
        planIntent = "anomaly_investigation";
        botResponse = `FACT:\nCPU Utilization Spike Diagnostic:\n- Affected Asset: SERVER-001\n- Metric: CPU Spike > 92% sustained for 45 minutes\n- Correlated Change: Application patch v2.4 deployed at 14:15 UTC\n\nINFERENCE:\nThe timing strongly correlates with the application patch deployment.\n\nRECOMMENDATION:\nInspect application thread logs and verify database query execution plans.`;
        refs = [
          { type: "Analytics Alert", summary: "ANOMALY-8812 CPU Spike > 92%" },
          { type: "Change Record", summary: "CHG-2026-901 App Patch v2.4 Deployment" }
        ];
      } else {
        planIntent = "general_itam_query";
        botResponse = `FACT:\nRetrieved authorized ITAM & CMDB records matching query criteria.\n- Active CIs Analyzed: 42 records\n- Data Classification: Internal / Confidential\n- Tenant Context: tenant-kspl-global (Strictly Scoped)\n\nINFERENCE:\nAll target CIs are active and reporting telemetry within normal baseline thresholds.`;
        refs = [
          { type: "CMDB Entity", summary: "Tenant Asset Registry - 42 Scoped Records" }
        ];
      }

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: botResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        queryPlan: {
          intent: planIntent,
          filters: { tenant_id: "tenant-kspl-global", read_only: true }
        },
        references: refs
      };

      setMessages(prev => [...prev, botMsg]);
      setIsProcessing(false);
    }, 700);
  };

  const handleFeedback = (msgId: string, type: 'helpful' | 'unhelpful') => {
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, feedback: type } : m));
  };

  return (
    <div className="p-6 bg-black text-white min-h-screen font-sans border border-red-950 rounded-xl space-y-6">
      {/* Top Banner & Header strictly adhering to RED, BLACK, WHITE styling */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-5 border-b border-red-900/60 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-red-950/80 border border-red-600/40 rounded-lg text-red-500 shadow-lg shadow-red-950/50">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-wide text-white uppercase font-mono">
                ITAM & CMDB AI Copilot
              </h1>
              <span className="px-2 py-0.5 bg-red-900/40 text-red-400 border border-red-600/30 text-[10px] font-mono font-bold rounded">
                READ-ONLY
              </span>
            </div>
            <p className="text-xs text-red-300/80 mt-0.5">
              Anthropic Claude 3.5 Sonnet • RAG CMDB Retrieval Engine • Tenant & RBAC Scoped
            </p>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="px-3 py-1 bg-black border border-red-900 text-red-400 rounded flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-red-500" />
            <span>Tenant: tenant-kspl-global</span>
          </div>
          <div className="px-3 py-1 bg-red-950 border border-red-700/60 text-red-300 rounded flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-red-500" />
            <span>Claude 3.5 Sonnet</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs (Red / Black / White strictly) */}
      <div className="flex border-b border-red-900/60 space-x-6 text-sm font-mono">
        {[
          { id: 'chat', label: 'Copilot Chat & RAG', icon: Bot },
          { id: 'audit', label: 'Audit-Readiness Summaries', icon: FileText },
          { id: 'anomaly', label: 'Anomaly Investigation', icon: Activity },
          { id: 'settings', label: 'Model & Rate Limits', icon: Layers }
        ].map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-2.5 font-semibold transition-colors border-b-2 ${
                active 
                  ? 'border-red-600 text-red-500' 
                  : 'border-transparent text-zinc-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: CHAT & RAG */}
      {activeTab === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Chat Interface */}
          <div className="lg:col-span-8 bg-zinc-950 border border-red-900/50 rounded-xl flex flex-col h-[650px] overflow-hidden">
            {/* Conversation Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono uppercase text-red-400 font-bold">
                      {msg.sender === 'user' ? 'ITAM Analyst' : 'Claude Copilot'}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500">{msg.timestamp}</span>
                  </div>

                  <div 
                    className={`max-w-[88%] p-4 rounded-xl border font-sans text-sm whitespace-pre-wrap leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-red-950/70 border-red-700/60 text-white self-end'
                        : 'bg-black border-red-900/80 text-zinc-200 self-start shadow-md'
                    }`}
                  >
                    {msg.text}

                    {/* Query Plan Display */}
                    {msg.queryPlan && (
                      <div className="mt-3 p-2.5 bg-zinc-950 border border-red-900/60 rounded font-mono text-[11px] text-red-300">
                        <span className="text-[10px] text-red-400 uppercase font-bold block mb-1">Generated Query Plan</span>
                        <div>Intent: <span className="text-white font-semibold">{msg.queryPlan.intent}</span></div>
                        <div>Filters: <span className="text-zinc-400">{JSON.stringify(msg.queryPlan.filters)}</span></div>
                      </div>
                    )}

                    {/* Evidence & References */}
                    {msg.references && msg.references.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-red-900/40 space-y-1">
                        <span className="text-[10px] uppercase font-mono font-bold text-red-400 block">Grounding Evidence & Referenced Records:</span>
                        {msg.references.map((ref, idx) => (
                          <div key={idx} className="flex items-center justify-between p-1.5 bg-red-950/40 border border-red-900/30 rounded text-xs font-mono">
                            <span className="text-red-300 font-bold">[{ref.type}]</span>
                            <span className="text-zinc-300 truncate ml-2">{ref.summary}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Feedback buttons */}
                    {msg.sender === 'assistant' && (
                      <div className="mt-3 pt-2 border-t border-red-950 flex items-center justify-between text-[11px] text-zinc-500">
                        <span>Read-only validated response</span>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleFeedback(msg.id, 'helpful')}
                            className={`p-1 rounded hover:text-red-400 ${msg.feedback === 'helpful' ? 'text-red-500 font-bold' : ''}`}
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => handleFeedback(msg.id, 'unhelpful')}
                            className={`p-1 rounded hover:text-red-400 ${msg.feedback === 'unhelpful' ? 'text-red-500 font-bold' : ''}`}
                          >
                            <ThumbsDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isProcessing && (
                <div className="flex items-center gap-2 text-xs font-mono text-red-400 p-3 bg-red-950/20 border border-red-900/40 rounded-lg">
                  <RefreshCw className="w-4 h-4 animate-spin text-red-500" />
                  <span>Generating RAG query plan & retrieving authorized CMDB context...</span>
                </div>
              )}
            </div>

            {/* Input Form */}
            <div className="p-3 bg-black border-t border-red-900/60 flex items-center gap-2">
              <input 
                type="text" 
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask Copilot about assets, servers, warranties, anomalies, or audit readiness..."
                className="flex-1 bg-zinc-950 border border-red-900/60 rounded-lg px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-600 font-sans"
              />
              <button 
                onClick={() => handleSendMessage()}
                disabled={isProcessing || !inputText.trim()}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white rounded-lg font-mono text-xs font-bold transition-colors flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Query
              </button>
            </div>
          </div>

          {/* Right Sidebar: Suggested Questions & Guardrails */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-4 bg-zinc-950 border border-red-900/50 rounded-xl space-y-3">
              <h3 className="text-xs font-mono font-bold uppercase text-red-500 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-red-500" />
                Suggested ITAM Investigation Queries
              </h3>
              <div className="space-y-2">
                {suggestedQueries.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(q)}
                    className="w-full text-left p-2.5 bg-black hover:bg-red-950/40 border border-red-900/40 rounded-lg text-xs font-sans text-zinc-300 transition-colors flex items-center justify-between group"
                  >
                    <span>{q}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-red-500 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                ))}
              </div>
            </div>

            {/* Security & Safety Guardrails Card */}
            <div className="p-4 bg-zinc-950 border border-red-900/50 rounded-xl space-y-2 font-mono text-xs">
              <h3 className="text-xs font-bold uppercase text-red-500 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-500" />
                AI Safety & Multi-Tenant Enforcement
              </h3>
              <ul className="space-y-1.5 text-zinc-400 text-[11px]">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-red-500" />
                  Prompt Injection Filter: ACTIVE
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-red-500" />
                  Server-Side Tenant Scoping: ACTIVE
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-red-500" />
                  PII & Financial Redaction: ACTIVE
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-red-500" />
                  Read-Only Database Enforcement: STRICT
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: AUDIT READINESS SUMMARIES */}
      {activeTab === 'audit' && (
        <div className="p-6 bg-zinc-950 border border-red-900/50 rounded-xl space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-red-900/40">
            <div>
              <h3 className="text-base font-bold text-white uppercase font-mono">ISO 27001 Asset Governance Audit Summary</h3>
              <p className="text-xs text-zinc-400 mt-1">Grounded evidence compilation for enterprise compliance reporting.</p>
            </div>
            <span className="px-3 py-1 bg-red-950 border border-red-600/40 text-red-400 font-mono text-xs rounded">
              Compliance Score: 94.2%
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            <div className="p-4 bg-black border border-red-900/60 rounded-lg">
              <span className="text-zinc-500 block uppercase text-[10px]">Total Scoped Assets</span>
              <span className="text-xl font-bold text-white mt-1 block">1,240 CIs</span>
            </div>
            <div className="p-4 bg-black border border-red-900/60 rounded-lg">
              <span className="text-zinc-500 block uppercase text-[10px]">Ownership Verifications</span>
              <span className="text-xl font-bold text-red-400 mt-1 block">98.4% Verified</span>
            </div>
            <div className="p-4 bg-black border border-red-900/60 rounded-lg">
              <span className="text-zinc-500 block uppercase text-[10px]">Unassigned Laptops</span>
              <span className="text-xl font-bold text-red-500 mt-1 block">18 Workstations</span>
            </div>
          </div>

          <div className="p-4 bg-black border border-red-900/60 rounded-lg font-mono text-xs text-zinc-300 space-y-2">
            <h4 className="text-xs font-bold text-red-400 uppercase">Executive Evidence Statement</h4>
            <p className="leading-relaxed">
              FACT: All 1,240 configuration items are indexed within the authorized ITAM registry. Audit evidence verifies that 98.4% of assets have assigned custodians and active warranty records.
            </p>
            <p className="leading-relaxed">
              RECOMMENDED NEXT ACTION: Assign custodians to the 18 unassigned workstations before the Q3 audit cutoff.
            </p>
          </div>
        </div>
      )}

      {/* Tab 3: ANOMALY INVESTIGATION */}
      {activeTab === 'anomaly' && (
        <div className="p-6 bg-zinc-950 border border-red-900/50 rounded-xl space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-red-900/40">
            <div>
              <h3 className="text-base font-bold text-white uppercase font-mono">CMDB Anomaly Explanation Engine</h3>
              <p className="text-xs text-zinc-400 mt-1">Correlates telemetry spikes with change logs and dependency graphs.</p>
            </div>
            <span className="px-3 py-1 bg-red-950 border border-red-600/40 text-red-400 font-mono text-xs rounded">
              Active Anomaly: ANOMALY-8812
            </span>
          </div>

          <div className="p-4 bg-black border border-red-900/60 rounded-lg font-mono text-xs space-y-3">
            <div className="flex justify-between items-center text-red-400 font-bold border-b border-red-900/40 pb-2">
              <span>Target CI: SERVER-001 (Windows Server 2019)</span>
              <span>Metric: CPU Spike &gt; 92%</span>
            </div>
            <p className="text-zinc-300 leading-relaxed">
              OBSERVED FACT: Sustained CPU utilization spike detected at 14:30 UTC.
            </p>
            <p className="text-zinc-300 leading-relaxed">
              CORRELATED CHANGE: Application patch v2.4 deployment recorded 15 minutes prior (CHG-2026-901).
            </p>
            <p className="text-zinc-300 leading-relaxed">
              BLAST RADIUS: Downstream service SAP ERP Core (CI-APP-303) experiencing slight latency increase.
            </p>
          </div>
        </div>
      )}

      {/* Tab 4: SETTINGS & RATE LIMITS */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
          <div className="p-5 bg-zinc-950 border border-red-900/50 rounded-xl space-y-3">
            <h3 className="text-sm font-bold text-red-500 uppercase">Anthropic Model Configuration</h3>
            <div className="space-y-2 text-zinc-300">
              <div className="flex justify-between p-2 bg-black border border-red-900/40 rounded">
                <span>Model Alias</span>
                <span className="text-white font-bold">claude-3-5-sonnet-20241022</span>
              </div>
              <div className="flex justify-between p-2 bg-black border border-red-900/40 rounded">
                <span>Prompt Version</span>
                <span className="text-red-400 font-bold">v1.0.0</span>
              </div>
              <div className="flex justify-between p-2 bg-black border border-red-900/40 rounded">
                <span>Temperature</span>
                <span className="text-white font-bold">0.2 (Low / Factual)</span>
              </div>
            </div>
          </div>

          <div className="p-5 bg-zinc-950 border border-red-900/50 rounded-xl space-y-3">
            <h3 className="text-sm font-bold text-red-500 uppercase">Rate Limits & Cost Budget</h3>
            <div className="space-y-2 text-zinc-300">
              <div className="flex justify-between p-2 bg-black border border-red-900/40 rounded">
                <span>Requests / Minute Limit</span>
                <span className="text-white font-bold">30 req/min</span>
              </div>
              <div className="flex justify-between p-2 bg-black border border-red-900/40 rounded">
                <span>Daily Token Budget</span>
                <span className="text-red-400 font-bold">500,000 Tokens</span>
              </div>
              <div className="flex justify-between p-2 bg-black border border-red-900/40 rounded">
                <span>Database Mode</span>
                <span className="text-red-500 font-bold">Read-Only Guard Active</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItamCopilotModule;
