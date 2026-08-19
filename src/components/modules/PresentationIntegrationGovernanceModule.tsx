import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Plug,
  Shield,
  Layers,
  QrCode,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  Lock,
  FileText,
  Database,
  Cpu,
  BarChart3,
  ListFilter,
  Send,
  UserCheck,
  Building,
  KeyRound,
  DollarSign,
  Activity,
  UserPlus,
  ShieldAlert,
  Zap,
  Globe,
  Settings,
  HardDrive,
  Download,
  Terminal,
  Code,
} from 'lucide-react';

import { PresentationService } from '../../presentation/services/PresentationService';
import { IntegrationFabricEngine } from '../../integration/services/IntegrationFabricEngine';
import { GovernanceEngine } from '../../governance/services/GovernanceEngine';

import {
  UserRoleType,
  RoleDashboardWidget,
  SelfServiceAssetAction,
  MobileScanResult,
  OfflineSyncQueueItem,
} from '../../presentation/types/presentationTypes';

import {
  ApiEndpointContract,
  WebhookSubscription,
  WebhookEventDelivery,
  EtlConnectorConfig,
  EtlErrorLogRecord,
} from '../../integration/types/integrationTypes';

import {
  FieldPermissionRule,
  ImmutableAuditRecord,
  GovernancePolicyRule,
  DataExportGovernanceLog,
  SecurityAccessMonitoringEvent,
} from '../../governance/types/governanceTypes';

export const PresentationIntegrationGovernanceModule: React.FC = () => {
  const [activeMainPillar, setActiveMainPillar] = useState<'presentation' | 'integration' | 'governance'>('presentation');

  // Pillar 1: Presentation State
  const [selectedRole, setSelectedRole] = useState<UserRoleType>('IT Manager');
  const [dashboardWidgets, setDashboardWidgets] = useState<RoleDashboardWidget[]>([]);
  const [scanInput, setScanInput] = useState('LAPTOP-10025');
  const [scanResult, setScanResult] = useState<MobileScanResult | null>(null);
  const [offlineQueue, setOfflineQueue] = useState<OfflineSyncQueueItem[]>([]);
  const [selfServiceList, setSelfServiceList] = useState<SelfServiceAssetAction[]>([]);
  const [selfServiceForm, setSelfServiceForm] = useState({
    actionType: 'Request Asset' as const,
    assetName: 'Dell Latitude 7450',
    reason: 'Hardware upgrade for Q3 deliverables',
    urgency: 'Standard' as const,
  });

  // Pillar 2: Integration State
  const [apiEndpoints, setApiEndpoints] = useState<ApiEndpointContract[]>([]);
  const [apiCallOutput, setApiCallOutput] = useState<string>('');
  const [webhooks, setWebhooks] = useState<WebhookSubscription[]>([]);
  const [webhookDeliveries, setWebhookDeliveries] = useState<WebhookEventDelivery[]>([]);
  const [etlConnectors, setEtlConnectors] = useState<EtlConnectorConfig[]>([]);
  const [etlErrorLogs, setEtlErrorLogs] = useState<EtlErrorLogRecord[]>([]);

  // Pillar 3: Governance State
  const [fieldPermissions, setFieldPermissions] = useState<FieldPermissionRule[]>([]);
  const [auditChain, setAuditChain] = useState<ImmutableAuditRecord[]>([]);
  const [chainIntegrity, setChainIntegrity] = useState<{ isValid: boolean; verifiedRecordsCount: number } | null>(null);
  const [policies, setPolicies] = useState<GovernancePolicyRule[]>([]);
  const [exportLogs, setExportLogs] = useState<DataExportGovernanceLog[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityAccessMonitoringEvent[]>([]);

  // Sub-tabs
  const [presTab, setPresTab] = useState<'dashboards' | 'selfservice' | 'mobile_ops' | 'offline_sync'>('dashboards');
  const [integTab, setIntegTab] = useState<'rest_api' | 'graphql' | 'webhooks' | 'etl_connectors'>('rest_api');
  const [govTab, setGovTab] = useState<'permissions' | 'classification' | 'immutable_audit' | 'policies'>('permissions');

  useEffect(() => {
    loadAllData();
  }, [selectedRole]);

  const loadAllData = async () => {
    // Presentation
    setDashboardWidgets(PresentationService.getDashboardWidgetsForRole(selectedRole));
    setOfflineQueue(PresentationService.getOfflineQueue());
    setSelfServiceList(PresentationService.getSelfServiceRequests());

    // Integration
    setApiEndpoints(IntegrationFabricEngine.getEndpoints());
    setWebhooks(IntegrationFabricEngine.getWebhooks());
    setWebhookDeliveries(IntegrationFabricEngine.getWebhookDeliveries());
    setEtlConnectors(IntegrationFabricEngine.getEtlConnectors());
    setEtlErrorLogs(IntegrationFabricEngine.getEtlErrorLogs());

    // Governance
    setFieldPermissions(GovernanceEngine.getFieldPermissions());
    setAuditChain(GovernanceEngine.getAuditChain());
    setChainIntegrity(GovernanceEngine.verifyAuditChainIntegrity());
    setPolicies(GovernanceEngine.getGovernancePolicies());
    setExportLogs(GovernanceEngine.getExportLogs());
    setSecurityEvents(GovernanceEngine.getSecurityEvents());
  };

  const handleBarcodeScan = async () => {
    const res = await PresentationService.scanAssetIdentifier(scanInput, 'Asset Tag');
    setScanResult(res);
  };

  const handleSyncOffline = async () => {
    await PresentationService.syncOfflineQueue();
    setOfflineQueue([]);
  };

  const handleTestApiCall = async (path: string, method: string) => {
    const resp = await IntegrationFabricEngine.executeRestApiCall(path, method);
    setApiCallOutput(JSON.stringify(resp, null, 2));
  };

  const handleRetryDlq = async (delId: string) => {
    await IntegrationFabricEngine.retryDeadLetterWebhook(delId);
    setWebhookDeliveries(IntegrationFabricEngine.getWebhookDeliveries());
  };

  const handleSubmitSelfService = async (e: React.FormEvent) => {
    e.preventDefault();
    await PresentationService.submitSelfServiceAction({
      actionType: selfServiceForm.actionType,
      assetName: selfServiceForm.assetName,
      requestedBy: 'Rahul Sharma',
      userEmail: 'r.sharma@company.com',
      department: 'Finance',
      urgency: selfServiceForm.urgency,
      reason: selfServiceForm.reason,
      tenantId: 'tenant-kspl-global',
    });
    setSelfServiceList(PresentationService.getSelfServiceRequests());
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 text-white font-sans bg-black min-h-screen">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-zinc-950 p-4 border border-zinc-800 rounded-lg shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-red-600 rounded border border-red-500 shadow-sm">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-black text-white tracking-tight font-mono">
                PRESENTATION, INTEGRATION FABRIC & GOVERNANCE SUITE
              </h1>
              <span className="bg-red-600 text-white text-[10px] font-bold uppercase font-mono px-2 py-0.5 rounded border border-red-500">
                ADD-ON FABRIC
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5 font-mono">
              Web SPA + Mobile Ops • REST/GraphQL & Webhook Bus • Field-Level Governance & Cryptographic Hash Auditing
            </p>
          </div>
        </div>

        {/* Pillar Switcher */}
        <div className="flex items-center space-x-1.5 bg-black p-1 border border-zinc-800 rounded font-mono text-xs">
          <button
            onClick={() => setActiveMainPillar('presentation')}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded cursor-pointer transition-colors ${
              activeMainPillar === 'presentation'
                ? 'bg-red-600 text-white font-bold border border-red-500'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>1. Presentation Layer</span>
          </button>
          <button
            onClick={() => setActiveMainPillar('integration')}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded cursor-pointer transition-colors ${
              activeMainPillar === 'integration'
                ? 'bg-red-600 text-white font-bold border border-red-500'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Plug className="w-4 h-4" />
            <span>2. Integration Fabric</span>
          </button>
          <button
            onClick={() => setActiveMainPillar('governance')}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded cursor-pointer transition-colors ${
              activeMainPillar === 'governance'
                ? 'bg-red-600 text-white font-bold border border-red-500'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>3. Governance Layer</span>
          </button>
        </div>
      </div>

      {/* PILLAR 1: PRESENTATION LAYER */}
      {activeMainPillar === 'presentation' && (
        <div className="space-y-6 font-mono text-xs">
          {/* Sub-navigation */}
          <div className="flex items-center space-x-2 bg-zinc-950 p-1.5 border border-zinc-800 rounded-lg overflow-x-auto text-xs">
            {[
              { id: 'dashboards', label: 'Role-Based Dashboards', icon: BarChart3 },
              { id: 'selfservice', label: 'Self-Service Portal', icon: UserPlus },
              { id: 'mobile_ops', label: 'Mobile Ops & Barcode Scanner', icon: QrCode },
              { id: 'offline_sync', label: `Offline Sync Queue (${offlineQueue.length})`, icon: RefreshCw },
            ].map((t) => {
              const Icon = t.icon;
              const isActive = presTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setPresTab(t.id as any)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded transition-colors whitespace-nowrap cursor-pointer ${
                    isActive ? 'bg-red-600 text-white font-bold border border-red-500' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* SUB-TAB 1: ROLE DASHBOARDS */}
          {presTab === 'dashboards' && (
            <div className="space-y-4">
              <div className="bg-zinc-950 p-4 border border-zinc-800 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-white text-sm flex items-center space-x-2">
                    <BarChart3 className="w-4 h-4 text-red-500" />
                    <span>ROLE-BASED SPA PRESENTATION DASHBOARD</span>
                  </h3>
                  <p className="text-zinc-400 text-[11px] mt-0.5">
                    Filters view widgets strictly according to user role authorization without backend changes.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-zinc-400">Select Role:</span>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as any)}
                    className="bg-black text-white border border-zinc-800 focus:border-red-500 rounded px-2 py-1 text-xs focus:outline-none"
                  >
                    <option value="IT Manager">IT Manager</option>
                    <option value="Finance Manager">Finance Manager</option>
                    <option value="Compliance Manager">Compliance Manager</option>
                    <option value="System Administrator">System Administrator</option>
                    <option value="Employee / End User">Employee / End User</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {dashboardWidgets.map((w) => (
                  <div key={w.id} className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                      <span className="font-bold text-white">{w.title}</span>
                      <span className="text-[10px] bg-red-600/20 text-red-400 px-2 py-0.5 rounded border border-red-500/30 font-bold">
                        {w.widgetType.toUpperCase()}
                      </span>
                    </div>

                    <p className="text-zinc-400 text-[11px]">{w.dataSummary}</p>

                    {w.metricValue && (
                      <div className="space-y-1">
                        <div className="text-2xl font-black text-white">{w.metricValue}</div>
                        <div className="text-red-400 text-[10px] font-bold">{w.metricChange}</div>
                      </div>
                    )}

                    {w.tableData && (
                      <div className="overflow-x-auto border border-zinc-800 rounded">
                        <table className="w-full text-left text-[10px]">
                          <thead className="bg-black text-zinc-400 border-b border-zinc-800">
                            <tr>
                              {Object.keys(w.tableData[0]).map((k, i) => (
                                <th key={i} className="p-1.5">{k}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-800 text-zinc-300">
                            {w.tableData.map((row, i) => (
                              <tr key={i}>
                                {Object.values(row).map((v: any, j) => (
                                  <td key={j} className="p-1.5">{v}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SUB-TAB 2: SELF SERVICE PORTAL */}
          {presTab === 'selfservice' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Request Form */}
              <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-4">
                <h3 className="font-bold text-white text-sm flex items-center space-x-2 border-b border-zinc-800 pb-2">
                  <UserPlus className="w-4 h-4 text-red-500" />
                  <span>SUBMIT SELF-SERVICE REQUEST</span>
                </h3>

                <form onSubmit={handleSubmitSelfService} className="space-y-3">
                  <div>
                    <label className="text-zinc-400 text-[10px] uppercase">Action Type</label>
                    <select
                      value={selfServiceForm.actionType}
                      onChange={(e) => setSelfServiceForm({ ...selfServiceForm, actionType: e.target.value as any })}
                      className="w-full mt-1 bg-black text-white border border-zinc-800 focus:border-red-500 p-2 rounded text-xs focus:outline-none"
                    >
                      <option value="Request Asset">Request Asset</option>
                      <option value="Return Asset">Return Asset</option>
                      <option value="Report Lost Asset">Report Lost Asset</option>
                      <option value="Report Damaged Asset">Report Damaged Asset</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-zinc-400 text-[10px] uppercase">Asset / Item Name</label>
                    <input
                      type="text"
                      value={selfServiceForm.assetName}
                      onChange={(e) => setSelfServiceForm({ ...selfServiceForm, assetName: e.target.value })}
                      className="w-full mt-1 bg-black text-white border border-zinc-800 focus:border-red-500 p-2 rounded text-xs focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-400 text-[10px] uppercase">Urgency Level</label>
                    <select
                      value={selfServiceForm.urgency}
                      onChange={(e) => setSelfServiceForm({ ...selfServiceForm, urgency: e.target.value as any })}
                      className="w-full mt-1 bg-black text-white border border-zinc-800 focus:border-red-500 p-2 rounded text-xs focus:outline-none"
                    >
                      <option value="Standard">Standard</option>
                      <option value="Urgent">Urgent</option>
                      <option value="Emergency">Emergency</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-zinc-400 text-[10px] uppercase">Business Reason</label>
                    <textarea
                      value={selfServiceForm.reason}
                      onChange={(e) => setSelfServiceForm({ ...selfServiceForm, reason: e.target.value })}
                      rows={3}
                      className="w-full mt-1 bg-black text-white border border-zinc-800 focus:border-red-500 p-2 rounded text-xs focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded border border-red-500 cursor-pointer transition-colors"
                  >
                    Submit Request
                  </button>
                </form>
              </div>

              {/* Request List */}
              <div className="lg:col-span-2 bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-4">
                <h3 className="font-bold text-white text-sm flex items-center space-x-2 border-b border-zinc-800 pb-2">
                  <FileText className="w-4 h-4 text-red-500" />
                  <span>ACTIVE SELF-SERVICE REQUESTS ({selfServiceList.length})</span>
                </h3>

                <div className="space-y-3">
                  {selfServiceList.map((req) => (
                    <div key={req.id} className="p-3 bg-black border border-zinc-800 rounded space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{req.actionType}: {req.assetName}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-600/20 text-red-400 border border-red-500/30">
                          {req.status}
                        </span>
                      </div>
                      <p className="text-zinc-400 text-[11px]">{req.reason}</p>
                      <div className="flex items-center justify-between text-[10px] text-zinc-500 border-t border-zinc-900 pt-1">
                        <span>Requested By: {req.requestedBy} ({req.department})</span>
                        <span>{req.timestamp}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SUB-TAB 3: MOBILE OPS & BARCODE SCANNING */}
          {presTab === 'mobile_ops' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Scanner Simulation */}
              <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-4">
                <h3 className="font-bold text-white text-sm flex items-center space-x-2 border-b border-zinc-800 pb-2">
                  <QrCode className="w-4 h-4 text-red-500" />
                  <span>MOBILE BARCODE / QR SCANNER SIMULATION</span>
                </h3>

                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Enter Asset Tag or Serial Number (e.g. LAPTOP-10025)..."
                      value={scanInput}
                      onChange={(e) => setScanInput(e.target.value)}
                      className="flex-1 bg-black text-white border border-zinc-800 focus:border-red-500 px-3 py-2 rounded text-xs focus:outline-none"
                    />
                    <button
                      onClick={handleBarcodeScan}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded border border-red-500 cursor-pointer"
                    >
                      Scan
                    </button>
                  </div>

                  {scanResult && (
                    <div className="p-4 bg-black border border-zinc-800 rounded space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-white border-b border-zinc-800 pb-1">
                        <span>SCAN RESULT: {scanResult.scanCode}</span>
                        <span className={scanResult.found ? 'text-red-400' : 'text-zinc-500'}>
                          {scanResult.found ? 'MATCH FOUND' : 'NOT FOUND'}
                        </span>
                      </div>

                      {scanResult.assetData ? (
                        <div className="space-y-1 text-[11px] text-zinc-300">
                          <div>Asset Tag: <span className="text-white font-bold">{scanResult.assetData.assetTag}</span></div>
                          <div>Model: <span className="text-white">{scanResult.assetData.name}</span></div>
                          <div>Serial: <span className="text-white">{scanResult.assetData.serialNumber}</span></div>
                          <div>Assigned To: <span className="text-white">{scanResult.assetData.assignedTo}</span></div>
                          <div>Location: <span className="text-white">{scanResult.assetData.location}</span></div>
                          <div>Warranty: <span className="text-red-400 font-bold">{scanResult.assetData.warrantyExpiration}</span></div>
                        </div>
                      ) : (
                        <div className="text-zinc-500 text-xs">No matching asset identifier found in read-only adapter index.</div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Mobile Security & Devices */}
              <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-4">
                <h3 className="font-bold text-white text-sm flex items-center space-x-2 border-b border-zinc-800 pb-2">
                  <Smartphone className="w-4 h-4 text-red-500" />
                  <span>REGISTERED MOBILE FIELD DEVICE SECURITY</span>
                </h3>

                <div className="p-3 bg-black border border-zinc-800 rounded space-y-2 text-[11px]">
                  <div className="flex items-center justify-between font-bold text-white">
                    <span>Samsung Galaxy S24 Ultra (Field Tech)</span>
                    <span className="text-red-400">TRUSTED DEVICE</span>
                  </div>
                  <div className="text-zinc-400 space-y-0.5">
                    <div>Platform: <span className="text-white">Android Mobile App</span></div>
                    <div>Biometric Auth: <span className="text-red-400 font-bold">ACTIVE</span></div>
                    <div>Encrypted Local Storage: <span className="text-red-400 font-bold">AES-256</span></div>
                    <div>Session Timeout: <span className="text-white">15 Minutes</span></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SUB-TAB 4: OFFLINE SYNC QUEUE */}
          {presTab === 'offline_sync' && (
            <div className="space-y-4">
              <div className="bg-zinc-950 p-4 border border-zinc-800 rounded-lg flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white text-sm flex items-center space-x-2">
                    <RefreshCw className="w-4 h-4 text-red-500" />
                    <span>CONTROLLED OFFLINE MOBILE TRANSACTION QUEUE</span>
                  </h3>
                  <p className="text-zinc-400 text-[11px] mt-0.5">
                    Stores offline mobile scans and check-outs locally. Validates and resolves conflicts before committing.
                  </p>
                </div>

                <button
                  onClick={handleSyncOffline}
                  disabled={offlineQueue.length === 0}
                  className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold px-3 py-1.5 rounded border border-red-500 cursor-pointer"
                >
                  Synchronize Queue Now ({offlineQueue.length})
                </button>
              </div>

              <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-black text-zinc-400 border-b border-zinc-800 text-[10px] uppercase">
                    <tr>
                      <th className="p-3">Created Offline</th>
                      <th className="p-3">Action Type</th>
                      <th className="p-3">Device ID</th>
                      <th className="p-3">Payload Details</th>
                      <th className="p-3">Sync Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800 text-zinc-300">
                    {offlineQueue.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-zinc-500">
                          All offline queue items successfully synchronized with server.
                        </td>
                      </tr>
                    ) : (
                      offlineQueue.map((item) => (
                        <tr key={item.id} className="hover:bg-zinc-900">
                          <td className="p-3 text-zinc-400">{item.createdOfflineAt}</td>
                          <td className="p-3 font-bold text-white">{item.actionType}</td>
                          <td className="p-3 text-zinc-400">{item.deviceRegistrationId}</td>
                          <td className="p-3 text-zinc-300 font-mono text-[10px]">{JSON.stringify(item.payload)}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded bg-zinc-900 text-red-400 border border-red-500/30 font-bold text-[10px]">
                              {item.syncStatus}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* PILLAR 2: INTEGRATION FABRIC */}
      {activeMainPillar === 'integration' && (
        <div className="space-y-6 font-mono text-xs">
          {/* Sub-navigation */}
          <div className="flex items-center space-x-2 bg-zinc-950 p-1.5 border border-zinc-800 rounded-lg overflow-x-auto text-xs">
            {[
              { id: 'rest_api', label: 'Versioned REST API', icon: Terminal },
              { id: 'graphql', label: 'GraphQL Console (/graphql/v1)', icon: Code },
              { id: 'webhooks', label: 'Webhook Bus & DLQ', icon: Zap },
              { id: 'etl_connectors', label: 'ETL Connectors & Field Mapping', icon: Plug },
            ].map((t) => {
              const Icon = t.icon;
              const isActive = integTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setIntegTab(t.id as any)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded transition-colors whitespace-nowrap cursor-pointer ${
                    isActive ? 'bg-red-600 text-white font-bold border border-red-500' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* SUB-TAB 1: REST API EXPLORER */}
          {integTab === 'rest_api' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Endpoint Catalog */}
              <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-4">
                <h3 className="font-bold text-white text-sm flex items-center space-x-2 border-b border-zinc-800 pb-2">
                  <Terminal className="w-4 h-4 text-red-500" />
                  <span>ISOLATED VERSIONED REST API SURFACE (/api/v1/integration)</span>
                </h3>

                <div className="space-y-3">
                  {apiEndpoints.map((ep, idx) => (
                    <div key={idx} className="p-3 bg-black border border-zinc-800 rounded space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="bg-red-600 text-white font-bold px-2 py-0.5 rounded text-[10px]">
                            {ep.method}
                          </span>
                          <span className="font-bold text-white">{ep.path}</span>
                        </div>
                        <button
                          onClick={() => handleTestApiCall(ep.path, ep.method)}
                          className="text-[10px] bg-zinc-900 hover:bg-zinc-800 text-red-400 border border-zinc-700 hover:border-red-500 px-2.5 py-1 rounded cursor-pointer"
                        >
                          Execute Test →
                        </button>
                      </div>
                      <p className="text-zinc-400 text-[11px]">{ep.description}</p>
                      <div className="flex items-center justify-between text-[10px] text-zinc-500">
                        <span>Category: {ep.category}</span>
                        <span>Rate Limit: {ep.rateLimitPerMin} req/min</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* API Output */}
              <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-4">
                <h3 className="font-bold text-white text-sm flex items-center space-x-2 border-b border-zinc-800 pb-2">
                  <Activity className="w-4 h-4 text-red-500" />
                  <span>API EXECUTION OUTPUT & CORRELATION TRACE</span>
                </h3>

                {apiCallOutput ? (
                  <pre className="p-3 bg-black border border-zinc-800 rounded text-[10px] text-zinc-300 font-mono overflow-x-auto max-h-[400px]">
                    {apiCallOutput}
                  </pre>
                ) : (
                  <div className="p-12 text-center text-zinc-500 font-mono">
                    Click "Execute Test" on any REST endpoint to trace response, correlation ID, and rate limits.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SUB-TAB 2: GRAPHQL CONSOLE */}
          {integTab === 'graphql' && (
            <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-4">
              <h3 className="font-bold text-white text-sm flex items-center space-x-2 border-b border-zinc-800 pb-2">
                <Code className="w-4 h-4 text-red-500" />
                <span>GRAPHQL QUERY ENGINE (/graphql/v1)</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-black border border-zinc-800 rounded space-y-2">
                  <div className="text-[10px] text-zinc-400 uppercase font-bold">GraphQL Query Payload</div>
                  <pre className="text-red-400 text-[11px] font-mono">
{`query GetAssetsAndContracts {
  assets(limit: 10) {
    id
    name
    assetType
    riskScore
  }
  contracts {
    contractNumber
    annualCost
  }
}`}
                  </pre>
                </div>

                <div className="p-3 bg-black border border-zinc-800 rounded space-y-2">
                  <div className="text-[10px] text-zinc-400 uppercase font-bold">Enforced GraphQL Output</div>
                  <pre className="text-zinc-300 text-[10px] font-mono">
{`{
  "data": {
    "assets": [
      { "id": "AST-10025", "name": "Dell Latitude 7450", "riskScore": 82 }
    ],
    "contracts": [
      { "contractNumber": "MS-M365-2026", "annualCost": 12500000 }
    ]
  }
}`}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* SUB-TAB 3: WEBHOOK BUS & DEAD LETTER QUEUE */}
          {integTab === 'webhooks' && (
            <div className="space-y-6">
              <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-4">
                <h3 className="font-bold text-white text-sm flex items-center space-x-2 border-b border-zinc-800 pb-2">
                  <Zap className="w-4 h-4 text-red-500" />
                  <span>ACTIVE WEBHOOK EVENT SUBSCRIPTIONS ({webhooks.length})</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {webhooks.map((wh) => (
                    <div key={wh.id} className="p-3 bg-black border border-zinc-800 rounded space-y-2">
                      <div className="flex items-center justify-between font-bold text-white">
                        <span>{wh.subscriberName}</span>
                        <span className="text-red-400 text-[10px]">HMAC-SHA256 ACTIVE</span>
                      </div>
                      <div className="text-[10px] text-zinc-400 space-y-0.5">
                        <div>Target URL: <span className="text-white">{wh.targetUrl}</span></div>
                        <div>Events: <span className="text-zinc-300">{wh.subscribedEvents.join(', ')}</span></div>
                        <div>Last Triggered: <span className="text-white">{wh.lastTriggeredAt}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dead Letter Queue */}
              <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-4">
                <h3 className="font-bold text-white text-sm flex items-center space-x-2 border-b border-zinc-800 pb-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <span>WEBHOOK DEAD LETTER QUEUE (DLQ) & RETRIES</span>
                </h3>

                <div className="space-y-3">
                  {webhookDeliveries.map((del) => (
                    <div key={del.id} className="p-3 bg-black border border-zinc-800 rounded space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">Event: {del.eventType} ({del.eventId})</span>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            del.status === 'Delivered' ? 'bg-zinc-800 text-zinc-300' : 'bg-red-600 text-white'
                          }`}>
                            {del.status}
                          </span>
                          {del.status === 'In Dead Letter Queue' && (
                            <button
                              onClick={() => handleRetryDlq(del.id)}
                              className="bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold px-2 py-0.5 rounded border border-red-500 cursor-pointer"
                            >
                              Manual Retry
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="text-[10px] text-zinc-400 flex items-center justify-between border-t border-zinc-900 pt-1">
                        <span>Signature: {del.signature.substring(0, 30)}...</span>
                        <span>Attempts: {del.attemptNumber}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SUB-TAB 4: ETL CONNECTORS */}
          {integTab === 'etl_connectors' && (
            <div className="space-y-6">
              <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-4">
                <h3 className="font-bold text-white text-sm flex items-center space-x-2 border-b border-zinc-800 pb-2">
                  <Plug className="w-4 h-4 text-red-500" />
                  <span>PREBUILT ETL CONNECTOR PIPELINES</span>
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {etlConnectors.map((etl) => (
                    <div key={etl.id} className="p-4 bg-black border border-zinc-800 rounded space-y-3">
                      <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                        <span className="font-bold text-white">{etl.name}</span>
                        <span className="bg-red-600 text-white font-bold px-2 py-0.5 rounded text-[10px]">
                          {etl.connectorType}
                        </span>
                      </div>

                      <div className="text-[10px] text-zinc-400 space-y-1">
                        <div>Source System: <span className="text-white">{etl.sourceSystemName}</span></div>
                        <div>Processed Count: <span className="text-white font-bold">{etl.recordsProcessedCount.toLocaleString()}</span></div>
                        <div>Last Sync: <span className="text-white">{etl.lastSyncAt}</span></div>
                      </div>

                      <div className="border-t border-zinc-900 pt-2 space-y-1">
                        <div className="text-[10px] font-bold text-zinc-300">Field Mappings:</div>
                        {etl.mappings.map((m, i) => (
                          <div key={i} className="text-[10px] text-zinc-400 flex justify-between">
                            <span>{m.externalField} → {m.itamField}</span>
                            <span className="text-red-400 font-bold">{m.transformation}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* PILLAR 3: GOVERNANCE LAYER */}
      {activeMainPillar === 'governance' && (
        <div className="space-y-6 font-mono text-xs">
          {/* Sub-navigation */}
          <div className="flex items-center space-x-2 bg-zinc-950 p-1.5 border border-zinc-800 rounded-lg overflow-x-auto text-xs">
            {[
              { id: 'permissions', label: 'Field Permissions & RBAC', icon: Lock },
              { id: 'immutable_audit', label: 'Immutable Audit Trail (Cryptographic Hash)', icon: FileText },
              { id: 'policies', label: 'Governance Policy Rules Engine', icon: ShieldAlert },
            ].map((t) => {
              const Icon = t.icon;
              const isActive = govTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setGovTab(t.id as any)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded transition-colors whitespace-nowrap cursor-pointer ${
                    isActive ? 'bg-red-600 text-white font-bold border border-red-500' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* SUB-TAB 1: FIELD PERMISSIONS MATRIX */}
          {govTab === 'permissions' && (
            <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden">
              <div className="p-4 bg-black border-b border-zinc-800 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white text-sm flex items-center space-x-2">
                    <Lock className="w-4 h-4 text-red-500" />
                    <span>FIELD-LEVEL PERMISSIONS & DATA CLASSIFICATION MATRIX</span>
                  </h3>
                  <p className="text-zinc-400 text-[11px] mt-0.5">
                    Restricts viewing, exporting, and querying based on record classification (Confidential, Restricted, etc.).
                  </p>
                </div>
              </div>

              <table className="w-full text-left">
                <thead className="bg-black text-zinc-400 border-b border-zinc-800 text-[10px] uppercase">
                  <tr>
                    <th className="p-3">Module</th>
                    <th className="p-3">Field Name</th>
                    <th className="p-3">Classification</th>
                    <th className="p-3">Allowed Roles</th>
                    <th className="p-3">Masking Strategy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800 text-zinc-300">
                  {fieldPermissions.map((fp) => (
                    <tr key={fp.id} className="hover:bg-zinc-900">
                      <td className="p-3 text-zinc-400">{fp.moduleName}</td>
                      <td className="p-3 font-bold text-white">{fp.fieldName}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white">
                          {fp.classification}
                        </span>
                      </td>
                      <td className="p-3 text-zinc-300">{fp.allowedRoles.join(', ')}</td>
                      <td className="p-3 text-red-400 font-bold">{fp.maskingPattern}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* SUB-TAB 2: IMMUTABLE AUDIT TRAIL */}
          {govTab === 'immutable_audit' && (
            <div className="space-y-4">
              <div className="bg-zinc-950 p-4 border border-zinc-800 rounded-lg flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white text-sm flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-red-500" />
                    <span>CRYPTOGRAPHICALLY HASH-CHAINED IMMUTABLE AUDIT TRAIL</span>
                  </h3>
                  <p className="text-zinc-400 text-[11px] mt-0.5">
                    Every audit record includes aSHA-256 hash chaining back to previous records. Modifying audit records breaks chain integrity.
                  </p>
                </div>

                {chainIntegrity && (
                  <div className="flex items-center space-x-2 bg-black px-3 py-1.5 border border-zinc-800 rounded">
                    <CheckCircle2 className="w-4 h-4 text-red-500" />
                    <span className="text-white font-bold text-xs">
                      Chain Verified ({chainIntegrity.verifiedRecordsCount} Blocks Integrity OK)
                    </span>
                  </div>
                )}
              </div>

              <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-black text-zinc-400 border-b border-zinc-800 text-[10px] uppercase">
                    <tr>
                      <th className="p-3">Seq #</th>
                      <th className="p-3">Timestamp</th>
                      <th className="p-3">User & Role</th>
                      <th className="p-3">Action</th>
                      <th className="p-3">Module & Record</th>
                      <th className="p-3">Cryptographic SHA-256 Hash Link</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800 text-zinc-300">
                    {auditChain.map((rec) => (
                      <tr key={rec.id} className="hover:bg-zinc-900">
                        <td className="p-3 font-bold text-red-500">#{rec.sequenceNumber}</td>
                        <td className="p-3 text-zinc-400">{rec.timestamp}</td>
                        <td className="p-3 font-bold text-white">{rec.userName} ({rec.userRole})</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-600/20 text-red-400 border border-red-500/30">
                            {rec.actionType}
                          </span>
                        </td>
                        <td className="p-3 text-zinc-300">{rec.module} ({rec.recordId})</td>
                        <td className="p-3 font-mono text-[9px] text-zinc-400 max-w-xs truncate">
                          Prev: {rec.previousHash.substring(0, 16)}... → <span className="text-white font-bold">Curr: {rec.currentHash.substring(0, 16)}...</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SUB-TAB 3: POLICY ENGINE */}
          {govTab === 'policies' && (
            <div className="space-y-4">
              <div className="bg-zinc-950 p-4 border border-zinc-800 rounded-lg">
                <h3 className="font-bold text-white text-sm flex items-center space-x-2">
                  <ShieldAlert className="w-4 h-4 text-red-500" />
                  <span>GOVERNANCE POLICY ENGINE & COMPLIANCE SAFEGUARDS</span>
                </h3>
                <p className="text-zinc-400 text-[11px] mt-0.5">
                  Automated rules that evaluate export size, financial access, and PII views to trigger security alerts or step-up auth.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {policies.map((p) => (
                  <div key={p.id} className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg space-y-2">
                    <div className="flex items-center justify-between font-bold text-white">
                      <span>{p.policyName}</span>
                      <span className="text-red-400 text-[10px] font-bold">ENABLED</span>
                    </div>
                    <div className="text-[11px] text-zinc-400 space-y-1">
                      <div>Trigger Condition: <span className="text-white">{p.triggerCondition}</span></div>
                      <div>Required Permission: <span className="text-zinc-300">{p.requiredPermission}</span></div>
                      <div>Action on Violation: <span className="text-red-400 font-bold">{p.actionIfViolated}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
