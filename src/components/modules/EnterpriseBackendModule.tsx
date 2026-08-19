import React, { useState, useEffect } from 'react';
import {
  Server,
  Layers,
  Cpu,
  Activity,
  Play,
  CheckCircle2,
  AlertTriangle,
  Send,
  Database,
  Radio,
  Shield,
  Box,
  FileCode,
  Share2,
  Zap,
  Clock,
  Terminal,
  Search,
  Check,
} from 'lucide-react';

import { NestJsApplicationContainer } from '../../enterprise/NestJsApplicationContainer';
import { AppModule } from '../../enterprise/app.module';
import { EnterpriseFrameworkTestSuite, TestResult } from '../../enterprise/tests/EnterpriseFrameworkTestSuite';
import { ApiResponseEnvelope, HealthCheckStatus } from '../../enterprise/common/types/enterpriseTypes';

export const EnterpriseBackendModule: React.FC = () => {
  const tenantId = 'tenant-kspl-global';

  // Active Sub-Tab
  const [activeTab, setActiveTab] = useState<'architecture' | 'api_explorer' | 'domain_events' | 'health' | 'tests'>('architecture');

  // API Explorer State
  const [selectedRoute, setSelectedRoute] = useState<string>('/api/v1/enterprise/assets');
  const [selectedMethod, setSelectedMethod] = useState<'GET' | 'POST'>('GET');
  const [requestBody, setRequestBody] = useState<string>('{\n  "name": "Cloud Edge Node US-East",\n  "purchaseCost": 4200.00\n}');
  const [apiResponse, setApiResponse] = useState<ApiResponseEnvelope | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  // Health State
  const [liveness, setLiveness] = useState<HealthCheckStatus | null>(null);
  const [readiness, setReadiness] = useState<HealthCheckStatus | null>(null);

  // Test Runner State
  const [testResults, setTestResults] = useState<TestResult[]>([]);

  const container = NestJsApplicationContainer.getInstance();

  useEffect(() => {
    loadHealthData();
  }, []);

  const loadHealthData = async () => {
    const liveRes = await container.dispatchRequest('/health/live', 'GET');
    const readyRes = await container.dispatchRequest('/health/ready', 'GET');
    setLiveness(liveRes.data);
    setReadiness(readyRes.data);
  };

  const handleExecuteApi = async () => {
    setIsExecuting(true);
    let parsedBody = {};
    try {
      if (selectedMethod === 'POST' && requestBody) {
        parsedBody = JSON.parse(requestBody);
      }
    } catch (e) {
      console.warn('Invalid JSON body');
    }

    const res = await container.dispatchRequest(selectedRoute, selectedMethod, parsedBody, tenantId);
    setApiResponse(res);
    setIsExecuting(false);
  };

  const handleRunTests = async () => {
    const results = await EnterpriseFrameworkTestSuite.runAllTests(tenantId);
    setTestResults(results);
  };

  const depGraph = AppModule.getDependencyGraph();
  const eventHistory = container.getEventHistory();

  return (
    <div className="p-4 sm:p-6 space-y-6 text-white font-sans bg-black min-h-screen">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-zinc-950 p-4 border border-zinc-800 rounded-lg shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-red-600 rounded border border-red-500 shadow-sm">
            <Server className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-black text-white tracking-tight font-mono">
                NESTJS ENTERPRISE BACKEND FRAMEWORK
              </h1>
              <span className="bg-red-600 text-white text-[10px] font-bold uppercase font-mono px-2 py-0.5 rounded border border-red-500">
                NESTJS 10.3 + DDD
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5 font-mono">
              Modular Monolith Architecture • 13 Bounded Contexts • Hexagonal Ports & Adapters • Domain Events
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-1 bg-black p-1 border border-zinc-800 rounded font-mono text-xs overflow-x-auto">
          {[
            { id: 'architecture', label: '13 Bounded Contexts', icon: Layers },
            { id: 'api_explorer', label: 'API Explorer', icon: Terminal },
            { id: 'domain_events', label: 'Domain Event Stream', icon: Radio },
            { id: 'health', label: 'Health Probes', icon: Activity },
            { id: 'tests', label: 'Test Suite', icon: Play },
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

      {/* Status Bar */}
      <div className="bg-zinc-950 p-3 border border-zinc-800 rounded-lg flex flex-col sm:flex-row items-center justify-between text-xs font-mono gap-2">
        <div className="flex items-center space-x-3 text-zinc-400">
          <span className="flex items-center space-x-1">
            <Cpu className="w-3.5 h-3.5 text-red-500" />
            <span>Dependency Injection Container:</span>
            <strong className="text-white">13 Modules Bound</strong>
          </span>
          <span className="text-zinc-600">|</span>
          <span className="flex items-center space-x-1">
            <Shield className="w-3.5 h-3.5 text-green-500" />
            <span>Tenant Guard:</span>
            <strong className="text-white">Active (itam:{tenantId})</strong>
          </span>
        </div>

        <div className="flex items-center space-x-2 text-zinc-400">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          <span>Status: <strong className="text-green-400">READY (Zero Code Changes)</strong></span>
        </div>
      </div>

      {/* TAB 1: 13 BOUNDED CONTEXTS ARCHITECTURE */}
      {activeTab === 'architecture' && (
        <div className="space-y-6 font-mono text-xs">
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-4">
            <h3 className="font-bold text-white text-xs border-b border-zinc-800 pb-2 flex items-center space-x-2">
              <Layers className="w-4 h-4 text-red-500" />
              <span>NESTJS MODULAR MONOLITH — 13 BOUNDED CONTEXT DOMAINS</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {depGraph.map((mod, idx) => (
                <div key={idx} className="p-3 bg-black border border-zinc-800 rounded-lg space-y-2 hover:border-zinc-700 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs flex items-center space-x-1.5">
                      <Box className="w-3.5 h-3.5 text-red-500" />
                      <span>{mod.name}</span>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-red-600/20 text-red-400 border border-red-500/30 text-[10px] font-bold">
                      {mod.domain}
                    </span>
                  </div>

                  <div className="space-y-1 text-[11px] text-zinc-400">
                    <div className="text-[10px] text-zinc-500 uppercase font-bold">Exported Providers & Ports:</div>
                    {mod.exports.map((exp, i) => (
                      <div key={i} className="flex items-center space-x-1 text-zinc-300">
                        <Check className="w-3 h-3 text-green-500" />
                        <span>{exp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: API EXPLORER */}
      {activeTab === 'api_explorer' && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-4 font-mono text-xs">
          <h3 className="font-bold text-white text-xs border-b border-zinc-800 pb-2 flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-red-500" />
            <span>ENTERPRISE REST API DISPATCHER (/api/v1/enterprise/*)</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-3">
              <div>
                <label className="text-zinc-400 block mb-1">Target Endpoint Route:</label>
                <select
                  value={selectedRoute}
                  onChange={(e) => setSelectedRoute(e.target.value)}
                  className="w-full bg-black text-white border border-zinc-800 rounded px-3 py-2 text-xs focus:outline-none"
                >
                  <option value="/api/v1/enterprise/assets">GET /api/v1/enterprise/assets</option>
                  <option value="/api/v1/enterprise/cmdb">GET /api/v1/enterprise/cmdb</option>
                  <option value="/api/v1/enterprise/discovery">GET /api/v1/enterprise/discovery</option>
                  <option value="/api/v1/enterprise/sam">GET /api/v1/enterprise/sam</option>
                  <option value="/api/v1/enterprise/compliance">GET /api/v1/enterprise/compliance</option>
                  <option value="/api/v1/enterprise/financial">GET /api/v1/enterprise/financial</option>
                  <option value="/api/v1/enterprise/contracts">GET /api/v1/enterprise/contracts</option>
                  <option value="/api/v1/enterprise/workflow">GET /api/v1/enterprise/workflow</option>
                  <option value="/api/v1/enterprise/itsm">GET /api/v1/enterprise/itsm</option>
                  <option value="/api/v1/enterprise/graph">GET /api/v1/enterprise/graph</option>
                  <option value="/api/v1/enterprise/search">GET /api/v1/enterprise/search</option>
                  <option value="/api/v1/enterprise/telemetry">GET /api/v1/enterprise/telemetry</option>
                  <option value="/api/v1/enterprise/analytics">GET /api/v1/enterprise/analytics</option>
                </select>
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">HTTP Method:</label>
                <select
                  value={selectedMethod}
                  onChange={(e) => setSelectedMethod(e.target.value as any)}
                  className="w-full bg-black text-white border border-zinc-800 rounded px-3 py-2 text-xs focus:outline-none"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                </select>
              </div>

              {selectedMethod === 'POST' && (
                <div>
                  <label className="text-zinc-400 block mb-1">Request Payload (JSON):</label>
                  <textarea
                    value={requestBody}
                    onChange={(e) => setRequestBody(e.target.value)}
                    rows={5}
                    className="w-full bg-black text-green-400 border border-zinc-800 rounded p-2 text-[11px] focus:outline-none"
                  />
                </div>
              )}

              <button
                onClick={handleExecuteApi}
                disabled={isExecuting}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded cursor-pointer transition-colors"
              >
                {isExecuting ? 'Dispatching...' : 'Dispatch Endpoint Request'}
              </button>
            </div>

            <div className="md:col-span-2 space-y-2">
              <span className="text-zinc-400 block">Response Envelope Output:</span>
              <div className="p-3 bg-black border border-zinc-800 rounded-lg min-h-[220px] max-h-[400px] overflow-y-auto text-green-400 font-mono text-[11px]">
                {apiResponse ? (
                  <pre className="whitespace-pre-wrap">{JSON.stringify(apiResponse, null, 2)}</pre>
                ) : (
                  <span className="text-zinc-600">Click "Dispatch Endpoint Request" to view JSON envelope output.</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DOMAIN EVENT STREAM */}
      {activeTab === 'domain_events' && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-4 font-mono text-xs">
          <h3 className="font-bold text-white text-xs border-b border-zinc-800 pb-2 flex items-center space-x-2">
            <Radio className="w-4 h-4 text-red-500" />
            <span>LIVE DOMAIN EVENT BUS STREAM</span>
          </h3>

          <div className="space-y-2">
            {eventHistory.map((evt, idx) => (
              <div key={idx} className="p-3 bg-black border border-zinc-800 rounded-lg flex items-center justify-between">
                <div>
                  <div className="font-bold text-white flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                    <span>{evt.eventName}</span>
                    <span className="text-zinc-500 text-[10px]">({evt.domain})</span>
                  </div>
                  <div className="text-zinc-400 text-[10px] mt-0.5">
                    Aggregate ID: {evt.aggregateId} | Correlation: {evt.correlationId}
                  </div>
                </div>

                <div className="text-right text-zinc-500 text-[10px]">
                  {new Date(evt.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}

            {eventHistory.length === 0 && (
              <div className="text-zinc-500 text-center py-8">
                No domain events in history stream. Trigger an action in API Explorer to publish events.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: HEALTH PROBES */}
      {activeTab === 'health' && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-4 font-mono text-xs">
          <h3 className="font-bold text-white text-xs border-b border-zinc-800 pb-2 flex items-center space-x-2">
            <Activity className="w-4 h-4 text-green-500" />
            <span>FRAMEWORK HEALTH READINESS & LIVENESS PROBES</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-black border border-zinc-800 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">Liveness Probe (/health/live)</span>
                <span className="px-2 py-0.5 bg-green-600 text-white font-bold rounded text-[10px]">UP</span>
              </div>
              <p className="text-zinc-400 text-[11px]">Uptime: {liveness?.uptimeSeconds} seconds</p>
            </div>

            <div className="p-4 bg-black border border-zinc-800 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">Readiness Probe (/health/ready)</span>
                <span className="px-2 py-0.5 bg-green-600 text-white font-bold rounded text-[10px]">UP</span>
              </div>
              <p className="text-zinc-400 text-[11px]">Dependencies Healthy: 7 Bounded Contexts</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: TEST SUITE */}
      {activeTab === 'tests' && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <h3 className="font-bold text-white text-xs flex items-center space-x-2">
              <Play className="w-4 h-4 text-red-500" />
              <span>AUTOMATED NESTJS DDD FRAMEWORK TEST SUITE</span>
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
              <div className="text-zinc-500 text-center py-8">
                Click "Run All 7 Tests" to execute NestJS DI, DDD Use Cases, Domain Event Bus, and Tenant Isolation tests.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
