import React, { useState, useEffect } from 'react';
import {
  Code,
  Globe,
  Radio,
  KeyRound,
  Shield,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Play,
  RefreshCw,
  Copy,
  Check,
  Zap,
  Sliders,
  FileCode,
  Lock,
  Eye,
  EyeOff,
  Layers,
  Terminal,
  Send,
  Database,
  Share2,
} from 'lucide-react';

import { GraphQLExecutionEngine } from '../../api_layer/graphql/GraphQLExecutionEngine';
import { RestIntegrationController } from '../../api_layer/rest/RestIntegrationController';
import { WebhookDispatcher } from '../../api_layer/webhooks/WebhookDispatcher';
import { ApiAuthAdapter } from '../../api_layer/security/ApiAuthAdapter';
import { ApiAuditAdapter } from '../../api_layer/audit/ApiAuditAdapter';
import { ApiDocumentationGenerator } from '../../api_layer/docs/ApiDocumentationGenerator';
import { ApiLayerTestSuite, ApiTestResult } from '../../api_layer/tests/ApiLayerTestSuite';
import { ApiTenantContext, WebhookDeliveryLog, ApiKeyRecord } from '../../api_layer/types/apiTypes';

export const ApiLayerModule: React.FC = () => {
  const tenantId = 'tenant-kspl-global';

  const [activeTab, setActiveTab] = useState<'graphql' | 'rest' | 'webhooks' | 'keys' | 'docs' | 'tests'>('graphql');

  // GraphQL Playground State
  const [gqlQueryPreset, setGqlQueryPreset] = useState<'asset_nested' | 'cmdb_relationships' | 'blast_radius'>('asset_nested');
  const [gqlQuery, setGqlQuery] = useState('');
  const [gqlRole, setGqlRole] = useState<'ADMIN' | 'FIELD_TECH'>('ADMIN');
  const [gqlResponse, setGqlResponse] = useState<any>(null);
  const [isGqlExecuting, setIsGqlExecuting] = useState(false);

  // REST API Dispatcher State
  const [restEndpoint, setRestEndpoint] = useState<'/assets' | '/cis' | '/software' | '/licenses' | '/contracts' | '/workflows'>('/assets');
  const [restIdempotencyKey, setRestIdempotencyKey] = useState('');
  const [restResponse, setRestResponse] = useState<any>(null);

  // Webhooks State
  const [webhookLogs, setWebhookLogs] = useState<WebhookDeliveryLog[]>([]);
  const [selectedEventType, setSelectedEventType] = useState('asset.updated');

  // API Keys State
  const [apiKeys, setApiKeys] = useState<ApiKeyRecord[]>([]);
  const [newKeyUser, setNewKeyUser] = useState('usr-dev-integration');
  const [createdSecret, setCreatedSecret] = useState<string | null>(null);

  // Test Results State
  const [testResults, setTestResults] = useState<ApiTestResult[]>([]);

  const restController = new RestIntegrationController();
  const webhookDispatcher = new WebhookDispatcher();
  const authAdapter = new ApiAuthAdapter();

  useEffect(() => {
    updateGqlQueryFromPreset(gqlQueryPreset);
    loadApiData();
  }, [gqlQueryPreset]);

  const loadApiData = () => {
    setWebhookLogs(webhookDispatcher.getDeliveryLogs(tenantId));
    setApiKeys(authAdapter.getApiKeys(tenantId));
  };

  const updateGqlQueryFromPreset = (preset: 'asset_nested' | 'cmdb_relationships' | 'blast_radius') => {
    if (preset === 'asset_nested') {
      setGqlQuery(`query GetAssetWithSoftware {
  asset(id: "ENT-AST-1001") {
    id
    name
    serialNumber
    status
    criticality
    purchaseCost
    contractValue
    operatingSystem {
      name
      version
    }
    installedSoftware {
      name
      version
      publisher
    }
    relationships {
      type
      targetId
    }
  }
}`);
    } else if (preset === 'cmdb_relationships') {
      setGqlQuery(`query GetCiRelationships {
  ci(id: "CI-10001") {
    id
    name
    type
    criticality
    relationships {
      relationshipType
      target {
        id
        name
        type
      }
    }
  }
}`);
    } else {
      setGqlQuery(`query GetBlastRadiusImpact {
  blastRadius(ciId: "CI-10001", depth: 2) {
    ciId
    name
    type
    relationshipType
    depth
    criticality
  }
}`);
    }
  };

  const handleExecuteGql = async () => {
    setIsGqlExecuting(true);

    const ctx: ApiTenantContext = {
      tenantId,
      userId: gqlRole === 'ADMIN' ? 'usr-admin' : 'usr-field-tech',
      userRole: gqlRole,
      scopes: gqlRole === 'ADMIN'
        ? ['assets.read', 'assets.write', 'cmdb.read', 'financial.view']
        : ['assets.read', 'cmdb.read'],
    };

    const res = await GraphQLExecutionEngine.executeQuery({ query: gqlQuery }, ctx);
    setGqlResponse(res);
    setIsGqlExecuting(false);
  };

  const handleExecuteRest = async () => {
    const ctx: ApiTenantContext = {
      tenantId,
      userId: 'usr-admin',
      userRole: 'ADMIN',
      scopes: ['assets.read', 'assets.write', 'cmdb.read', 'software.read', 'licenses.read', 'contracts.read', 'workflow.execute'],
    };

    let res: any;
    if (restEndpoint === '/assets') {
      res = await restController.getAssets(ctx);
    } else if (restEndpoint === '/cis') {
      res = await restController.getCis(ctx);
    } else if (restEndpoint === '/software') {
      res = await restController.getSoftwareCatalog(ctx);
    } else if (restEndpoint === '/licenses') {
      res = await restController.getSoftwareLicenses(ctx);
    } else if (restEndpoint === '/contracts') {
      res = await restController.getContracts(ctx);
    } else if (restEndpoint === '/workflows') {
      res = await restController.postWorkflowExecution(
        ctx,
        { workflowId: 'WF-ASSET-RETIREMENT-v1', targetEntityId: 'ENT-AST-1001' },
        restIdempotencyKey || undefined
      );
    }

    setRestResponse(res);
  };

  const handleDispatchWebhook = async () => {
    await webhookDispatcher.dispatchEvent(
      selectedEventType as any,
      tenantId,
      { assetId: 'ENT-AST-1001', eventName: selectedEventType, triggeredBy: 'UI Dispatcher' }
    );
    loadApiData();
  };

  const handleCreateApiKey = () => {
    const { apiKeyRecord, rawSecret } = authAdapter.createApiKey(tenantId, newKeyUser, ['assets.read', 'assets.write', 'cmdb.read', 'workflow.execute']);
    setCreatedSecret(rawSecret);
    loadApiData();
  };

  const handleRunTests = async () => {
    const results = await ApiLayerTestSuite.runAllTests(tenantId);
    setTestResults(results);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 text-white font-sans bg-black min-h-screen">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-zinc-950 p-4 border border-zinc-800 rounded-lg shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-red-600 rounded border border-red-500 shadow-sm">
            <Code className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-black text-white tracking-tight font-mono">
                ENTERPRISE API LAYER & INTEGRATION GATEWAY
              </h1>
              <span className="bg-red-600 text-white text-[10px] font-bold uppercase font-mono px-2 py-0.5 rounded border border-red-500">
                ADD-ONLY CAPABILITY
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5 font-mono">
              GraphQL (Apollo) • Versioned REST (/v1/integration) • Webhooks • Idempotency Engine • HMAC Security
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-1 bg-black p-1 border border-zinc-800 rounded font-mono text-xs overflow-x-auto">
          {[
            { id: 'graphql', label: 'GraphQL Explorer', icon: Code },
            { id: 'rest', label: 'REST API (/v1)', icon: Globe },
            { id: 'webhooks', label: 'Webhooks Subsystem', icon: Radio },
            { id: 'keys', label: 'API Keys & Auth', icon: KeyRound },
            { id: 'docs', label: 'OpenAPI & SDL Docs', icon: FileCode },
            { id: 'tests', label: 'API Unit Tests', icon: Activity },
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
            <Shield className="w-3.5 h-3.5 text-green-500" />
            <span>Multi-Tenant Auth:</span>
            <strong className="text-white">Strict Tenant Isolation ({tenantId})</strong>
          </span>
          <span className="text-zinc-600">|</span>
          <span className="flex items-center space-x-1">
            <Zap className="w-3.5 h-3.5 text-yellow-500" />
            <span>GraphQL Query Protection:</span>
            <strong className="text-white">Depth Limiter (Max 5) & DataLoader N+1 Safe</strong>
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-2 py-0.5 bg-green-500/20 text-green-400 border border-green-500/40 rounded text-[10px] font-bold">
            GATEWAY ONLINE
          </span>
        </div>
      </div>

      {/* TAB 1: GRAPHQL EXPLORER */}
      {activeTab === 'graphql' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-mono text-xs">
          {/* Editor & Controls */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-2">
              <h3 className="font-bold text-white text-xs flex items-center space-x-2">
                <Code className="w-4 h-4 text-red-500" />
                <span>APOLLO GRAPHQL INTERACTIVE QUERY EXPLORER</span>
              </h3>

              {/* Role Context Switcher */}
              <div className="flex items-center space-x-2">
                <span className="text-zinc-500 text-[10px]">Security Role:</span>
                <select
                  value={gqlRole}
                  onChange={(e) => setGqlRole(e.target.value as any)}
                  className="bg-black text-white border border-zinc-800 rounded px-2 py-1 text-[10px] focus:outline-none"
                >
                  <option value="ADMIN">ADMIN (Full Financial Access)</option>
                  <option value="FIELD_TECH">FIELD_TECH (Masked Financials)</option>
                </select>
              </div>
            </div>

            {/* Presets */}
            <div className="flex items-center space-x-2">
              <span className="text-zinc-400 text-[11px]">Query Presets:</span>
              {[
                { id: 'asset_nested', label: 'Nested Asset & Software' },
                { id: 'cmdb_relationships', label: 'CMDB Relationship Graph' },
                { id: 'blast_radius', label: 'Blast Radius Traversal' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setGqlQueryPreset(p.id as any);
                    updateGqlQueryFromPreset(p.id as any);
                  }}
                  className={`px-2.5 py-1 rounded text-[10px] border cursor-pointer transition-colors ${
                    gqlQueryPreset === p.id
                      ? 'bg-red-600/20 text-red-400 border-red-500 font-bold'
                      : 'bg-black text-zinc-400 border-zinc-800 hover:text-white'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Code Input */}
            <div className="space-y-1">
              <label className="text-zinc-500 text-[10px] uppercase font-bold block">GraphQL Query SDL:</label>
              <textarea
                value={gqlQuery}
                onChange={(e) => setGqlQuery(e.target.value)}
                rows={12}
                className="w-full bg-black text-green-400 border border-zinc-800 rounded p-3 text-xs font-mono focus:outline-none focus:border-red-500 leading-relaxed"
              />
            </div>

            <button
              onClick={handleExecuteGql}
              disabled={isGqlExecuting}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded border border-red-500 cursor-pointer flex items-center justify-center space-x-2 transition-colors"
            >
              <Play className="w-4 h-4" />
              <span>{isGqlExecuting ? 'Executing Query...' : 'Execute GraphQL Query'}</span>
            </button>
          </div>

          {/* Response Inspector */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-4">
            <h3 className="font-bold text-white text-xs border-b border-zinc-800 pb-2 flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-red-500" />
              <span>EXECUTION RESPONSE & EXTENSIONS</span>
            </h3>

            {gqlResponse ? (
              <div className="space-y-3">
                {/* Metrics Banner */}
                {gqlResponse.extensions && (
                  <div className="p-2.5 bg-black border border-zinc-800 rounded flex items-center justify-between text-[10px] text-zinc-400">
                    <div>Depth: <strong className="text-white">{gqlResponse.extensions.depth}</strong> / 5</div>
                    <div>Complexity: <strong className="text-white">{gqlResponse.extensions.complexity}</strong></div>
                    <div>Time: <strong className="text-green-400">{gqlResponse.extensions.executionTimeMs}ms</strong></div>
                  </div>
                )}

                {/* JSON Viewer */}
                <pre className="bg-black text-zinc-200 border border-zinc-800 rounded p-3 text-[11px] overflow-x-auto max-h-[380px]">
                  {JSON.stringify(gqlResponse, null, 2)}
                </pre>
              </div>
            ) : (
              <div className="text-zinc-600 py-24 text-center">
                Click "Execute GraphQL Query" to evaluate SDL resolvers, field-level security, and graph traversals.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: REST API DISPATCHER */}
      {activeTab === 'rest' && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-4 font-mono text-xs">
          <h3 className="font-bold text-white text-xs border-b border-zinc-800 pb-2 flex items-center space-x-2">
            <Globe className="w-4 h-4 text-red-500" />
            <span>VERSIONED REST INTEGRATION API CLIENT (/api/v1/integration/*)</span>
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="space-y-3 bg-black p-4 border border-zinc-800 rounded-lg">
              <div>
                <label className="text-zinc-400 block mb-1">Target Endpoint:</label>
                <select
                  value={restEndpoint}
                  onChange={(e) => setRestEndpoint(e.target.value as any)}
                  className="w-full bg-zinc-950 text-white border border-zinc-800 rounded px-2.5 py-1.5 text-xs focus:outline-none"
                >
                  <option value="/assets">GET /api/v1/integration/assets</option>
                  <option value="/cis">GET /api/v1/integration/cis</option>
                  <option value="/software">GET /api/v1/integration/software</option>
                  <option value="/licenses">GET /api/v1/integration/licenses</option>
                  <option value="/contracts">GET /api/v1/integration/contracts</option>
                  <option value="/workflows">POST /api/v1/integration/workflows</option>
                </select>
              </div>

              {restEndpoint === '/workflows' && (
                <div>
                  <label className="text-zinc-400 block mb-1">Idempotency-Key Header:</label>
                  <input
                    type="text"
                    value={restIdempotencyKey}
                    onChange={(e) => setRestIdempotencyKey(e.target.value)}
                    placeholder="e.g. idem-key-9981"
                    className="w-full bg-zinc-950 text-white border border-zinc-800 rounded px-2.5 py-1.5 text-xs focus:outline-none"
                  />
                  <span className="text-[10px] text-zinc-500 mt-1 block">
                    Supply a key to verify idempotent POST prevention.
                  </span>
                </div>
              )}

              <button
                onClick={handleExecuteRest}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded cursor-pointer transition-colors"
              >
                Send REST API Request
              </button>
            </div>

            <div className="lg:col-span-2 space-y-2 bg-black p-4 border border-zinc-800 rounded-lg">
              <span className="text-zinc-400 font-bold block">Standardized JSON Response Envelope:</span>
              {restResponse ? (
                <pre className="bg-zinc-950 text-green-400 border border-zinc-800 rounded p-3 text-[11px] overflow-x-auto max-h-[350px]">
                  {JSON.stringify(restResponse, null, 2)}
                </pre>
              ) : (
                <div className="text-zinc-600 py-16 text-center">
                  Select an endpoint and click "Send REST API Request" to test integration responses.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: WEBHOOKS SUBSYSTEM */}
      {activeTab === 'webhooks' && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-4 font-mono text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-2">
            <h3 className="font-bold text-white text-xs flex items-center space-x-2">
              <Radio className="w-4 h-4 text-red-500" />
              <span>REAL-TIME WEBHOOK EVENT SUBSYSTEM & DELIVERY LOGS</span>
            </h3>

            <div className="flex items-center space-x-2">
              <select
                value={selectedEventType}
                onChange={(e) => setSelectedEventType(e.target.value)}
                className="bg-black text-white border border-zinc-800 rounded px-2 py-1 text-xs focus:outline-none"
              >
                <option value="asset.created">asset.created</option>
                <option value="asset.updated">asset.updated</option>
                <option value="asset.retired">asset.retired</option>
                <option value="license.violation.detected">license.violation.detected</option>
                <option value="workflow.completed">workflow.completed</option>
              </select>

              <button
                onClick={handleDispatchWebhook}
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1 rounded border border-red-500 cursor-pointer flex items-center space-x-1"
              >
                <Send className="w-3 h-3" />
                <span>Trigger Event</span>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <span className="text-zinc-400 font-bold block">Webhook Delivery Stream & HMAC Signatures:</span>
            {webhookLogs.map((log, idx) => (
              <div key={idx} className="p-3 bg-black border border-zinc-800 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="font-bold text-white flex items-center space-x-2">
                    <span className="text-red-400">{log.eventType}</span>
                    <span className="text-zinc-500 text-[10px]">[{log.subscriptionId}]</span>
                  </div>
                  <div className="text-zinc-400 text-[11px] truncate max-w-xl">
                    Target: {log.targetUrl}
                  </div>
                  <div className="text-zinc-500 text-[10px]">
                    HMAC Signature: <code className="text-green-400">{log.signature}</code>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 bg-green-500/20 text-green-400 border border-green-500/40 rounded text-[10px] font-bold">
                    HTTP {log.statusCode} {log.status}
                  </span>
                </div>
              </div>
            ))}

            {webhookLogs.length === 0 && (
              <div className="text-zinc-500 text-center py-8">
                No webhook deliveries logged yet. Click "Trigger Event" above to dispatch HMAC-signed event notifications.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: API KEYS & SECURITY */}
      {activeTab === 'keys' && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-4 font-mono text-xs">
          <h3 className="font-bold text-white text-xs border-b border-zinc-800 pb-2 flex items-center space-x-2">
            <KeyRound className="w-4 h-4 text-red-500" />
            <span>API KEY MANAGEMENT & GRANULAR SCOPE GOVERNANCE</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-3 bg-black p-4 border border-zinc-800 rounded-lg">
              <span className="font-bold text-white block">Generate New API Key:</span>
              <div>
                <label className="text-zinc-400 block mb-1">Owner User/Service:</label>
                <input
                  type="text"
                  value={newKeyUser}
                  onChange={(e) => setNewKeyUser(e.target.value)}
                  className="w-full bg-zinc-950 text-white border border-zinc-800 rounded px-2.5 py-1.5 text-xs focus:outline-none"
                />
              </div>

              <button
                onClick={handleCreateApiKey}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded cursor-pointer transition-colors"
              >
                Create Tenant API Key
              </button>

              {createdSecret && (
                <div className="p-3 bg-green-500/10 border border-green-500/40 rounded text-green-400 space-y-1">
                  <span className="font-bold block text-[10px] uppercase">Secret Created (Copy Now):</span>
                  <code className="text-white text-[11px] block break-all font-mono">{createdSecret}</code>
                </div>
              )}
            </div>

            <div className="md:col-span-2 space-y-3 bg-black p-4 border border-zinc-800 rounded-lg">
              <span className="font-bold text-white block">Active API Keys ({apiKeys.length}):</span>
              {apiKeys.map((key, idx) => (
                <div key={idx} className="p-3 bg-zinc-950 border border-zinc-800 rounded flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white flex items-center space-x-2">
                      <span>{key.keyPrefix}...</span>
                      <span className="px-2 py-0.5 bg-zinc-800 text-zinc-300 rounded text-[10px]">{key.createdForUser}</span>
                    </div>
                    <div className="text-zinc-400 text-[11px] mt-1 flex flex-wrap gap-1">
                      {key.scopes.map((s, i) => (
                        <span key={i} className="px-1.5 py-0.5 bg-red-600/20 text-red-400 border border-red-500/30 rounded text-[9px]">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-[10px] font-bold">ACTIVE</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: DOCUMENTATION */}
      {activeTab === 'docs' && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-4 font-mono text-xs">
          <h3 className="font-bold text-white text-xs border-b border-zinc-800 pb-2 flex items-center space-x-2">
            <FileCode className="w-4 h-4 text-red-500" />
            <span>OPENAPI 3.0 & GRAPHQL SDL DOCUMENTATION EXPORTER</span>
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2 bg-black p-4 border border-zinc-800 rounded-lg">
              <span className="font-bold text-white block">OpenAPI 3.0 Swagger Spec:</span>
              <pre className="bg-zinc-950 text-zinc-300 border border-zinc-800 rounded p-3 text-[11px] overflow-x-auto max-h-[350px]">
                {JSON.stringify(ApiDocumentationGenerator.getOpenApiSpec(), null, 2)}
              </pre>
            </div>

            <div className="space-y-2 bg-black p-4 border border-zinc-800 rounded-lg">
              <span className="font-bold text-white block">GraphQL Schema SDL Export:</span>
              <pre className="bg-zinc-950 text-green-400 border border-zinc-800 rounded p-3 text-[11px] overflow-x-auto max-h-[350px]">
                {ApiDocumentationGenerator.getGraphQLSdl()}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: API UNIT TESTS */}
      {activeTab === 'tests' && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <h3 className="font-bold text-white text-xs flex items-center space-x-2">
              <Activity className="w-4 h-4 text-red-500" />
              <span>AUTOMATED API LAYER TEST SUITE</span>
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
                Click "Run All 7 Tests" to execute GraphQL resolver tests, field-level security, REST idempotency, and Webhook HMAC tests.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
