import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Database,
  GitMerge,
  Network,
  Share2,
  Server,
  Cloud,
  Cpu,
  Building,
  Users,
  DollarSign,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Search,
  Filter,
  Sliders,
  Layers,
  History,
  Activity,
  ArrowRight,
  ExternalLink,
  Plus,
  Lock,
  Terminal,
  Zap,
  Play,
  Clock,
  Eye,
  Check,
  X,
  ChevronRight,
  FileText,
  Radio,
  BookOpen,
} from 'lucide-react';
import {
  CmdbFederationSource,
  CmdbFederationRecord,
  CmdbFederationMapping,
  CmdbFederationSyncJob,
  CmdbCiHistoryItem,
  CmdbDataConflict,
} from '../../types';

export const CmdbFederationModule: React.FC = () => {
  const { currentTenant, currentUser, addAuditEntry, configurationItems } = useApp();

  // Tab navigation
  const [activeTab, setActiveTab] = useState<
    'graph' | 'sources' | 'records' | 'mappings' | 'sync' | 'conflicts' | 'provenance' | 'history'
  >('graph');

  // Search and Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCiId, setSelectedCiId] = useState<string>('CI-10025');
  const [graphDepth, setGraphDepth] = useState<number>(2);
  const [selectedRelationshipType, setSelectedRelationshipType] = useState<string>('ALL');

  // Modal Control States
  const [isAddSourceModalOpen, setIsAddSourceModalOpen] = useState(false);
  const [newSourceName, setNewSourceName] = useState('');
  const [newSourceType, setNewSourceType] = useState<any>('HR');
  const [newSourceEndpoint, setNewSourceEndpoint] = useState('');

  const [isNewMappingModalOpen, setIsNewMappingModalOpen] = useState(false);
  const [newMapExternalId, setNewMapExternalId] = useState('');
  const [newMapCiId, setNewMapCiId] = useState('CI-10025');

  // On-demand real-time test state
  const [realtimeLookupId, setRealtimeLookupId] = useState('HR-45821');
  const [realtimeResult, setRealtimeResult] = useState<any>(null);
  const [isFetchingRealtime, setIsFetchingRealtime] = useState(false);

  // 1. FEDERATION SOURCES (External Systems of Record)
  const [federationSources, setFederationSources] = useState<CmdbFederationSource[]>([
    {
      id: 'fed-src-1',
      name: 'Workday HR Enterprise',
      systemType: 'HR',
      connectionType: 'REST API',
      status: 'Healthy',
      lastSync: '2026-08-11 12:30',
      recordsCount: 15421,
      adapterName: 'WorkdayHrAdapter',
      endpointUrl: 'https://api.workday.com/v1/tenant-01/workers',
      rateLimitMax: 1000,
      circuitBreakerState: 'Closed (Healthy)',
      tenantId: currentTenant.id,
      credentialsMasked: 'OAuth2 Token (••••••••4892)',
    },
    {
      id: 'fed-src-2',
      name: 'SAP S/4HANA Asset Procurement',
      systemType: 'ERP',
      connectionType: 'SOAP',
      status: 'Healthy',
      lastSync: '2026-08-11 11:00',
      recordsCount: 8420,
      adapterName: 'SapErpAdapter',
      endpointUrl: 'https://sap.internal.corp/sap/bc/srt/rfc',
      rateLimitMax: 500,
      circuitBreakerState: 'Closed (Healthy)',
      tenantId: currentTenant.id,
      credentialsMasked: 'Mutual TLS Cert (CN=sap-itam)',
    },
    {
      id: 'fed-src-3',
      name: 'AWS Cloud Cost Explorer & Resource API',
      systemType: 'Cloud Billing',
      connectionType: 'REST API',
      status: 'Healthy',
      lastSync: '2026-08-11 14:00',
      recordsCount: 3210,
      adapterName: 'AwsCloudAdapter',
      endpointUrl: 'https://ce.us-east-1.amazonaws.com',
      rateLimitMax: 2000,
      circuitBreakerState: 'Closed (Healthy)',
      tenantId: currentTenant.id,
      credentialsMasked: 'IAM Role ARN (arn:aws:iam::8820:role/itam)',
    },
    {
      id: 'fed-src-4',
      name: 'Microsoft Entra ID (Azure AD)',
      systemType: 'Microsoft Entra ID',
      connectionType: 'GraphQL',
      status: 'Healthy',
      lastSync: '2026-08-11 13:15',
      recordsCount: 18900,
      adapterName: 'EntraIdAdapter',
      endpointUrl: 'https://graph.microsoft.com/v1.0',
      rateLimitMax: 5000,
      circuitBreakerState: 'Closed (Healthy)',
      tenantId: currentTenant.id,
      credentialsMasked: 'Bearer Secret (••••••••9011)',
    },
    {
      id: 'fed-src-5',
      name: 'ServiceNow ITSM Incident Engine',
      systemType: 'ITSM',
      connectionType: 'REST API',
      status: 'Rate Limited',
      lastSync: '2026-08-11 10:00',
      recordsCount: 4210,
      adapterName: 'ServiceNowItsmAdapter',
      endpointUrl: 'https://corp.service-now.com/api/now/table/cmdb_ci',
      rateLimitMax: 200,
      circuitBreakerState: 'Half-Open (Testing)',
      tenantId: currentTenant.id,
      credentialsMasked: 'Basic Auth (svc_cmdb:••••••••)',
    },
  ]);

  // 2. FEDERATED RECORDS (References, not duplicated full data)
  const [federatedRecords, setFederatedRecords] = useState<CmdbFederationRecord[]>([
    {
      id: 'fed-rec-1',
      federationSourceId: 'fed-src-1',
      sourceName: 'Workday HR Enterprise',
      externalSourceId: 'HR-SYSTEM-US',
      externalRecordId: 'HR-45821',
      externalRecordType: 'Worker / Employee',
      externalUrl: 'https://workday.corp/worker/HR-45821',
      lastSeen: '2026-08-11 12:30',
      lastModified: '2026-08-10 09:15',
      mappedCiId: 'CI-10025',
      mappedCiName: 'LAP-CORP-8820 (Owner: Alex Rivera)',
      isCached: true,
      cacheSourceTag: 'FEDERATED CACHE',
      attributes: {
        fullName: 'Alex Rivera',
        title: 'Principal Systems Architect',
        department: 'Infrastructure & Cloud Operations',
        costCenter: 'CC-9082',
        status: 'Active Full-Time',
      },
      tenantId: currentTenant.id,
    },
    {
      id: 'fed-rec-2',
      federationSourceId: 'fed-src-2',
      sourceName: 'SAP S/4HANA Asset Procurement',
      externalSourceId: 'SAP-S4HANA-FIN',
      externalRecordId: 'PO-991204',
      externalRecordType: 'Purchase Order / Fixed Asset',
      externalUrl: 'https://sap.internal.corp/asset/PO-991204',
      lastSeen: '2026-08-11 11:00',
      lastModified: '2026-07-20 14:00',
      mappedCiId: 'CI-10025',
      mappedCiName: 'LAP-CORP-8820 (Dell Latitude 7450)',
      isCached: true,
      cacheSourceTag: 'FEDERATED CACHE',
      attributes: {
        poNumber: 'PO-991204',
        purchaseCost: '$2,450.00',
        vendor: 'Dell Financial Services',
        warrantyExpiration: '2029-07-20',
        capitalizedAssetId: 'FA-88102',
      },
      tenantId: currentTenant.id,
    },
    {
      id: 'fed-rec-3',
      federationSourceId: 'fed-src-3',
      sourceName: 'AWS Cloud Cost Explorer',
      externalSourceId: 'AWS-ACCT-88201',
      externalRecordId: 'i-089a81c2f901238',
      externalRecordType: 'EC2 Instance',
      externalUrl: 'https://console.aws.amazon.com/ec2/v2/home#InstanceDetails:instanceId=i-089a81c2f901238',
      lastSeen: '2026-08-11 14:00',
      lastModified: '2026-08-11 13:00',
      mappedCiId: 'CI-10088',
      mappedCiName: 'SRV-DB-PROD-01 (m6i.xlarge)',
      isCached: false,
      cacheSourceTag: 'LIVE ON-DEMAND',
      attributes: {
        instanceType: 'm6i.xlarge',
        monthlySpend: '$288.40/mo',
        launchTime: '2025-11-12',
        vpcId: 'vpc-01a2b3c4d5',
        region: 'us-east-1',
      },
      tenantId: currentTenant.id,
    },
  ]);

  // 3. FEDERATED RECORD MAPPINGS
  const [federatedMappings, setFederatedMappings] = useState<CmdbFederationMapping[]>([
    {
      id: 'map-1',
      federationSourceId: 'fed-src-1',
      sourceName: 'Workday HR Enterprise',
      externalRecordId: 'HR-45821',
      externalRecordType: 'Employee Identity',
      ciId: 'CI-10025',
      ciName: 'LAP-CORP-8820',
      mappingType: 'One-to-one',
      mappedBy: 'System Auto-Federation',
      createdAt: '2026-08-01 10:00',
      tenantId: currentTenant.id,
    },
    {
      id: 'map-2',
      federationSourceId: 'fed-src-2',
      sourceName: 'SAP S/4HANA Asset Procurement',
      externalRecordId: 'PO-991204',
      externalRecordType: 'Financial Fixed Asset',
      ciId: 'CI-10025',
      ciName: 'LAP-CORP-8820',
      mappingType: 'One-to-one',
      mappedBy: 'Admin User',
      createdAt: '2026-08-05 14:20',
      tenantId: currentTenant.id,
    },
    {
      id: 'map-3',
      federationSourceId: 'fed-src-3',
      sourceName: 'AWS Cloud Cost Explorer',
      externalRecordId: 'i-089a81c2f901238',
      externalRecordType: 'Cloud Instance',
      ciId: 'CI-10088',
      ciName: 'SRV-DB-PROD-01',
      mappingType: 'One-to-one',
      mappedBy: 'AWS Adapter Connector',
      createdAt: '2026-08-08 09:10',
      tenantId: currentTenant.id,
    },
  ]);

  // 4. SYNCHRONIZATION JOBS
  const [syncJobs, setSyncJobs] = useState<CmdbFederationSyncJob[]>([
    {
      id: 'sync-101',
      federationSourceId: 'fed-src-1',
      sourceName: 'Workday HR Enterprise',
      syncMode: 'Scheduled Sync',
      status: 'Completed',
      recordsProcessed: 15421,
      recordsUpdated: 42,
      startTime: '2026-08-11 12:00',
      endTime: '2026-08-11 12:30',
      tenantId: currentTenant.id,
    },
    {
      id: 'sync-102',
      federationSourceId: 'fed-src-3',
      sourceName: 'AWS Cloud Cost Explorer',
      syncMode: 'Incremental Sync',
      status: 'Completed',
      recordsProcessed: 3210,
      recordsUpdated: 15,
      startTime: '2026-08-11 13:50',
      endTime: '2026-08-11 14:00',
      tenantId: currentTenant.id,
    },
    {
      id: 'sync-103',
      federationSourceId: 'fed-src-5',
      sourceName: 'ServiceNow ITSM Incident Engine',
      syncMode: 'Manual Sync',
      status: 'Rate Limited',
      recordsProcessed: 120,
      recordsUpdated: 0,
      startTime: '2026-08-11 10:00',
      errorMessage: 'HTTP 429: API Rate limit exceeded (Max 200 req/hr). Circuit breaker tripped.',
      tenantId: currentTenant.id,
    },
  ]);

  // 5. DATA CONFLICTS
  const [dataConflicts, setDataConflicts] = useState<CmdbDataConflict[]>([
    {
      id: 'conflict-1',
      ciId: 'CI-10025',
      ciName: 'LAP-CORP-8820',
      attributeName: 'Asset Lifecycle Status',
      sourceAName: 'SAP S/4HANA ERP',
      sourceAValue: 'Capitalized Active Asset',
      sourceAObserved: '2026-08-11 11:00',
      sourceBName: 'CMDB Local Override',
      sourceBValue: 'Pending Hardware Refresh',
      sourceBObserved: '2026-08-10 16:00',
      sourcePriority: 'ERP System of Record for Financials',
      status: 'Data Conflict',
      tenantId: currentTenant.id,
    },
    {
      id: 'conflict-2',
      ciId: 'CI-10088',
      ciName: 'SRV-DB-PROD-01',
      attributeName: 'Allocated Monthly Cost Center',
      sourceAName: 'AWS Cloud Cost Explorer',
      sourceAValue: 'CC-9082 (Infrastructure Ops)',
      sourceAObserved: '2026-08-11 14:00',
      sourceBName: 'Workday HR Org Hierarchy',
      sourceBValue: 'CC-1004 (Database Engineering)',
      sourceBObserved: '2026-08-11 12:30',
      sourcePriority: 'AWS Billing Tag Exact Match',
      status: 'Data Conflict',
      tenantId: currentTenant.id,
    },
  ]);

  // 6. CMDB CI HISTORY
  const [ciHistory] = useState<CmdbCiHistoryItem[]>([
    {
      id: 'hist-1',
      ciId: 'CI-10025',
      ciName: 'LAP-CORP-8820',
      attributeName: 'Installed Memory (RAM)',
      previousValue: '16 GB DDR5',
      newValue: '32 GB DDR5',
      source: 'Endpoint Agent Discovery',
      updatedBy: 'Automated Agent Scan',
      timestamp: '2026-08-11 14:22',
      tenantId: currentTenant.id,
    },
    {
      id: 'hist-2',
      ciId: 'CI-10025',
      ciName: 'LAP-CORP-8820',
      attributeName: 'Assigned User (HR Reference)',
      previousValue: 'Unassigned Store',
      newValue: 'HR-45821 (Alex Rivera)',
      source: 'Workday HR Federation Adapter',
      updatedBy: 'System Auto-Sync',
      timestamp: '2026-08-01 10:00',
      tenantId: currentTenant.id,
    },
  ]);

  // TYPED RELATIONSHIP GRAPH DATA MODEL
  const sampleGraphNodes = [
    { id: 'CI-10025', label: 'LAP-CORP-8820', type: 'Laptop', class: 'Hardware', status: 'Deployed' },
    { id: 'CI-10088', label: 'SRV-DB-PROD-01', type: 'Database Server', class: 'Infrastructure', status: 'Deployed' },
    { id: 'CI-APP-01', label: 'Enterprise ERP Suite', type: 'Application', class: 'Software', status: 'Deployed' },
    { id: 'CI-SVC-01', label: 'Global Payroll Service', type: 'Business Service', class: 'Service', status: 'Deployed' },
    { id: 'CI-VM-01', label: 'AWS EC2 i-089a81c2f', type: 'Cloud Instance', class: 'Cloud', status: 'Deployed' },
    { id: 'CI-EMP-1001', label: 'Alex Rivera (HR-45821)', type: 'Employee Identity', class: 'Federated HR', status: 'Active' },
  ];

  const sampleGraphEdges = [
    { source: 'CI-SVC-01', target: 'CI-APP-01', label: 'depends_on', confidence: 100 },
    { source: 'CI-APP-01', target: 'CI-10088', label: 'connects_to', confidence: 98 },
    { source: 'CI-10088', target: 'CI-VM-01', label: 'hosted_by', confidence: 99 },
    { source: 'CI-10025', target: 'CI-EMP-1001', label: 'assigned_to', confidence: 100 },
    { source: 'CI-APP-01', target: 'CI-10025', label: 'runs_on', confidence: 92 },
  ];

  // REAL-TIME FEDERATION LOOKUP HANDLER
  const handleTestRealtimeLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!realtimeLookupId) return;

    setIsFetchingRealtime(true);
    setTimeout(() => {
      setRealtimeResult({
        externalId: realtimeLookupId,
        sourceSystem: 'Workday HR API (Live Adapter)',
        queryTimeMs: 42,
        status: '200 OK (Federated Live)',
        data: {
          employeeId: realtimeLookupId,
          fullName: 'Alex Rivera',
          jobTitle: 'Principal Systems Architect',
          manager: 'Sarah Jenkins (HR-1002)',
          securityClearance: 'Level 4 Enterprise Admin',
          assignedLaptopSerial: 'DELL-SN-8820-X1',
          lastHrSyncTimestamp: new Date().toISOString(),
        },
      });
      setIsFetchingRealtime(false);
      addAuditEntry('READ', 'CmdbFederationRealtime', realtimeLookupId, `Executed live federation lookup for: ${realtimeLookupId}`);
    }, 500);
  };

  const handleCreateSource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSourceName) return;

    const newSrc: CmdbFederationSource = {
      id: `fed-src-${Date.now()}`,
      name: newSourceName,
      systemType: newSourceType,
      connectionType: 'REST API',
      status: 'Healthy',
      lastSync: 'Just now',
      recordsCount: 0,
      adapterName: `${newSourceName.replace(/\s+/g, '')}Adapter`,
      endpointUrl: newSourceEndpoint || 'https://api.external.com/v1',
      rateLimitMax: 1000,
      circuitBreakerState: 'Closed (Healthy)',
      tenantId: currentTenant.id,
      credentialsMasked: 'API Key (••••••••3310)',
    };

    setFederationSources((prev) => [newSrc, ...prev]);
    setIsAddSourceModalOpen(false);
    setNewSourceName('');
    setNewSourceEndpoint('');
    addAuditEntry('CREATE', 'CmdbFederationSource', newSrc.id, `Connected federation source: ${newSrc.name}`);
  };

  const handleTriggerSync = (sourceId: string, sourceName: string) => {
    const newJob: CmdbFederationSyncJob = {
      id: `sync-${Date.now()}`,
      federationSourceId: sourceId,
      sourceName,
      syncMode: 'Manual Sync',
      status: 'Completed',
      recordsProcessed: 1420,
      recordsUpdated: 12,
      startTime: new Date().toISOString().replace('T', ' ').slice(0, 16),
      endTime: new Date().toISOString().replace('T', ' ').slice(0, 16),
      tenantId: currentTenant.id,
    };

    setSyncJobs((prev) => [newJob, ...prev]);
    setFederationSources((prev) =>
      prev.map((s) => (s.id === sourceId ? { ...s, lastSync: 'Just now', status: 'Healthy' } : s))
    );
    addAuditEntry('SYNC', 'CmdbFederationSync', sourceId, `Triggered sync job for: ${sourceName}`);
  };

  const handleResolveConflict = (conflictId: string, chosenSource: string) => {
    setDataConflicts((prev) => prev.filter((c) => c.id !== conflictId));
    addAuditEntry('UPDATE', 'CmdbDataConflict', conflictId, `Resolved conflict accepting: ${chosenSource}`);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 text-white font-sans">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-zinc-950 p-4 border border-zinc-800 rounded-lg">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight flex items-center space-x-2">
            <Share2 className="w-5 h-5 text-red-500" />
            <span>CMDB SYSTEM OF RECORD & FEDERATION LAYER</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1 font-mono">
            Authoritative CI Identities, Typed Relationship Graph, Field Provenance & Federated External References
          </p>
        </div>

        <div className="flex items-center space-x-2 font-mono text-xs">
          <span className="bg-zinc-900 border border-zinc-800 text-zinc-300 px-3 py-1.5 rounded flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-white" />
            <span>Tenant Isolation: {currentTenant.name}</span>
          </span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 bg-black p-1 border border-zinc-800 rounded font-mono text-xs">
        <button
          onClick={() => setActiveTab('graph')}
          className={`px-3 py-1.5 rounded transition-colors cursor-pointer flex items-center space-x-1.5 ${
            activeTab === 'graph' ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Network className="w-3.5 h-3.5" />
          <span>Typed Relationship Graph</span>
        </button>

        <button
          onClick={() => setActiveTab('sources')}
          className={`px-3 py-1.5 rounded transition-colors cursor-pointer flex items-center space-x-1.5 ${
            activeTab === 'sources' ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Building className="w-3.5 h-3.5" />
          <span>Federation Sources ({federationSources.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('records')}
          className={`px-3 py-1.5 rounded transition-colors cursor-pointer flex items-center space-x-1.5 ${
            activeTab === 'records' ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Federated References ({federatedRecords.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('mappings')}
          className={`px-3 py-1.5 rounded transition-colors cursor-pointer flex items-center space-x-1.5 ${
            activeTab === 'mappings' ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <GitMerge className="w-3.5 h-3.5" />
          <span>CI Mappings ({federatedMappings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('sync')}
          className={`px-3 py-1.5 rounded transition-colors cursor-pointer flex items-center space-x-1.5 ${
            activeTab === 'sync' ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Sync Engine ({syncJobs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('conflicts')}
          className={`px-3 py-1.5 rounded transition-colors cursor-pointer flex items-center space-x-1.5 ${
            activeTab === 'conflicts' ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Conflicts ({dataConflicts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('provenance')}
          className={`px-3 py-1.5 rounded transition-colors cursor-pointer flex items-center space-x-1.5 ${
            activeTab === 'provenance' ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Data Provenance</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-3 py-1.5 rounded transition-colors cursor-pointer flex items-center space-x-1.5 ${
            activeTab === 'history' ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>CI History & Audit</span>
        </button>
      </div>

      {/* TAB 1: TYPED RELATIONSHIP GRAPH & BLAST RADIUS */}
      {activeTab === 'graph' && (
        <div className="space-y-6 font-mono text-xs">
          {/* Controls bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-950 p-3 border border-zinc-800 rounded-lg">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center space-x-2">
                <span className="text-zinc-400 text-[11px]">Focus CI:</span>
                <select
                  value={selectedCiId}
                  onChange={(e) => setSelectedCiId(e.target.value)}
                  className="bg-black border border-zinc-800 rounded p-1.5 text-white focus:outline-none cursor-pointer"
                >
                  <option value="CI-10025">LAP-CORP-8820 (Dell Latitude 7450)</option>
                  <option value="CI-10088">SRV-DB-PROD-01 (Database Server)</option>
                  <option value="CI-APP-01">Enterprise ERP Suite (App)</option>
                  <option value="CI-SVC-01">Global Payroll Service (Service)</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-zinc-400 text-[11px]">Graph Depth:</span>
                <div className="flex space-x-1">
                  {[1, 2, 3].map((d) => (
                    <button
                      key={d}
                      onClick={() => setGraphDepth(d)}
                      className={`px-2.5 py-1 rounded text-[10px] font-bold cursor-pointer border ${
                        graphDepth === d ? 'bg-red-600 text-white border-red-500' : 'bg-black text-zinc-400 border-zinc-800'
                      }`}
                    >
                      Depth {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="text-zinc-400 text-[10px]">
              Lazy Loading Enabled • Multi-hop Typed Dependencies
            </div>
          </div>

          {/* Graphical Visualization Stage */}
          <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-lg space-y-6 relative overflow-hidden">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <span className="font-bold text-white text-sm flex items-center space-x-2">
                <Network className="w-4 h-4 text-red-500" />
                <span>INTERACTIVE TYPED RELATIONSHIP GRAPH VIEW</span>
              </span>
              <span className="text-zinc-500 text-[10px]">Canvas Engine: High-Performance Canvas Grid</span>
            </div>

            {/* Simulated Interactive Graph Canvas Layout */}
            <div className="min-h-[380px] bg-black border border-zinc-900 rounded-lg p-8 flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>

              {/* Node Hierarchy Container */}
              <div className="relative z-10 w-full max-w-3xl space-y-12">
                {/* Level 1: Business Service */}
                <div className="flex justify-center">
                  <div className="bg-zinc-900 border-2 border-red-500/80 text-white p-3 rounded-lg shadow-xl w-64 text-center space-y-1">
                    <span className="text-[10px] text-red-400 uppercase font-bold block">Business Service</span>
                    <span className="text-sm font-black text-white block">Global Payroll Service</span>
                    <span className="text-[10px] text-zinc-400 block font-mono">CI-SVC-01 • Authoritative</span>
                  </div>
                </div>

                {/* Connector Line */}
                <div className="flex justify-center items-center my-[-16px]">
                  <div className="h-8 w-0.5 bg-red-500/60"></div>
                  <span className="bg-zinc-950 text-red-400 text-[10px] px-2 py-0.5 border border-zinc-800 rounded font-bold font-mono mx-2">
                    depends_on
                  </span>
                  <div className="h-8 w-0.5 bg-red-500/60"></div>
                </div>

                {/* Level 2: Application */}
                <div className="flex justify-center">
                  <div className="bg-zinc-900 border border-zinc-700 text-white p-3 rounded-lg shadow-xl w-64 text-center space-y-1">
                    <span className="text-[10px] text-zinc-400 uppercase font-bold block">Application</span>
                    <span className="text-sm font-bold text-white block">Enterprise ERP Suite</span>
                    <span className="text-[10px] text-zinc-400 block font-mono">CI-APP-01</span>
                  </div>
                </div>

                {/* Connector Branches */}
                <div className="grid grid-cols-3 gap-4 my-[-16px] text-center">
                  <div className="flex flex-col items-center">
                    <span className="bg-zinc-950 text-zinc-300 text-[9px] px-2 py-0.5 border border-zinc-800 rounded font-bold">runs_on</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="bg-zinc-950 text-zinc-300 text-[9px] px-2 py-0.5 border border-zinc-800 rounded font-bold">connects_to</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="bg-zinc-950 text-zinc-300 text-[9px] px-2 py-0.5 border border-zinc-800 rounded font-bold">federated_to</span>
                  </div>
                </div>

                {/* Level 3: Infrastructure / Cloud / Federated */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-zinc-950 border border-zinc-800 p-3 rounded text-center space-y-1">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold block">Hardware CI</span>
                    <span className="text-xs font-bold text-white block">LAP-CORP-8820</span>
                    <span className="text-[10px] text-zinc-400 block font-mono">CI-10025</span>
                  </div>

                  <div className="bg-zinc-950 border border-zinc-800 p-3 rounded text-center space-y-1">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold block">DB Server</span>
                    <span className="text-xs font-bold text-white block">SRV-DB-PROD-01</span>
                    <span className="text-[10px] text-zinc-400 block font-mono">CI-10088</span>
                  </div>

                  <div className="bg-zinc-950 border border-zinc-800 p-3 rounded text-center space-y-1">
                    <span className="text-[10px] text-red-400 uppercase font-bold block">HR Federated</span>
                    <span className="text-xs font-bold text-white block">Alex Rivera (HR-45821)</span>
                    <span className="text-[10px] text-zinc-400 block font-mono">Federated Reference</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Blast Radius Impact Calculator */}
            <div className="bg-black border border-zinc-800 p-4 rounded-lg space-y-2 font-mono">
              <div className="text-red-500 font-bold text-xs uppercase">
                BLAST RADIUS & DEPENDENCY IMPACT ANALYSIS FOR {selectedCiId}
              </div>
              <div className="text-zinc-400 text-[11px]">
                If {selectedCiId} suffers outage, downstream impacted business services:
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="bg-zinc-900 border border-zinc-700 text-white text-[10px] px-2.5 py-1 rounded font-bold flex items-center space-x-1">
                  <AlertTriangle className="w-3 h-3 text-red-500" />
                  <span>Global Payroll Service (High Criticality)</span>
                </span>
                <span className="bg-zinc-900 border border-zinc-700 text-white text-[10px] px-2.5 py-1 rounded font-bold flex items-center space-x-1">
                  <AlertTriangle className="w-3 h-3 text-red-500" />
                  <span>Enterprise ERP Suite (Medium Criticality)</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FEDERATION SOURCES */}
      {activeTab === 'sources' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-950 p-3 border border-zinc-800 rounded-lg">
            <span className="text-white font-bold">CONNECTED FEDERATION SOURCES ({federationSources.length})</span>
            <button
              onClick={() => setIsAddSourceModalOpen(true)}
              className="bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1.5 rounded flex items-center space-x-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Connect Federation Source</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {federationSources.map((src) => (
              <div key={src.id} className="bg-zinc-950 border border-zinc-800 p-4 rounded-lg space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-red-400 text-[10px] uppercase font-bold block">{src.systemType}</span>
                    <span className="text-white font-black text-sm">{src.name}</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      src.status === 'Healthy' || src.status === 'Connected'
                        ? 'bg-zinc-900 text-white border-zinc-700'
                        : 'bg-red-600/20 text-red-400 border-red-500/40'
                    }`}
                  >
                    {src.status}
                  </span>
                </div>

                <div className="space-y-1 text-[11px] text-zinc-400 bg-black p-2.5 border border-zinc-900 rounded">
                  <div className="flex justify-between">
                    <span>Adapter:</span>
                    <span className="text-white font-bold">{src.adapterName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Connection:</span>
                    <span className="text-zinc-300">{src.connectionType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Circuit Breaker:</span>
                    <span className="text-white font-bold">{src.circuitBreakerState}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Records Referenced:</span>
                    <span className="text-white font-bold">{src.recordsCount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Credentials:</span>
                    <span className="text-zinc-400 font-mono text-[10px]">{src.credentialsMasked}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[10px] text-zinc-500 pt-1">
                  <span>Last Sync: {src.lastSync}</span>
                  <button
                    onClick={() => handleTriggerSync(src.id, src.name)}
                    className="bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-800 px-2.5 py-1 rounded cursor-pointer font-bold"
                  >
                    Trigger Sync
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Real-time Federation Test Console */}
          <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-lg space-y-4">
            <div className="space-y-0.5">
              <h3 className="font-bold text-white text-sm flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-red-500" />
                <span>ON-DEMAND REAL-TIME FEDERATION LOOKUP ENGINE</span>
              </h3>
              <p className="text-zinc-400 text-[11px]">
                Query external systems of record directly via adapter contracts without duplicating data locally.
              </p>
            </div>

            <form onSubmit={handleTestRealtimeLookup} className="flex flex-col sm:flex-row items-stretch gap-3">
              <input
                type="text"
                value={realtimeLookupId}
                onChange={(e) => setRealtimeLookupId(e.target.value)}
                placeholder="Enter External Record ID e.g. HR-45821"
                className="flex-1 bg-black border border-zinc-800 rounded p-2.5 text-white font-mono text-xs focus:outline-none focus:border-red-500"
              />
              <button
                type="submit"
                disabled={isFetchingRealtime}
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2.5 rounded flex items-center justify-center space-x-2 cursor-pointer transition-colors"
              >
                <Zap className="w-4 h-4" />
                <span>{isFetchingRealtime ? 'Querying...' : 'Live Fetch'}</span>
              </button>
            </form>

            {realtimeResult && (
              <div className="bg-black border border-zinc-800 p-4 rounded space-y-3 font-mono">
                <div className="text-red-500 font-bold border-b border-zinc-800 pb-2 flex justify-between items-center">
                  <span>LIVE FEDERATION ADAPTER RESPONSE</span>
                  <span className="bg-zinc-900 border border-zinc-700 text-white text-[10px] px-2 py-0.5 rounded">
                    Query Latency: {realtimeResult.queryTimeMs}ms
                  </span>
                </div>

                <pre className="text-zinc-300 text-[11px] p-3 bg-zinc-950 border border-zinc-900 rounded overflow-x-auto">
                  {JSON.stringify(realtimeResult, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: FEDERATED REFERENCES */}
      {activeTab === 'records' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden">
            <div className="p-3 bg-black border-b border-zinc-800 text-white font-bold flex justify-between items-center">
              <span>FEDERATED EXTERNAL REFERENCES (NO DUPLICATE STORAGE)</span>
              <span className="text-zinc-400 text-[10px]">
                Referenced On-Demand via External Source IDs
              </span>
            </div>

            <table className="w-full text-left">
              <thead className="bg-zinc-900 text-zinc-400 border-b border-zinc-800 text-[10px] uppercase">
                <tr>
                  <th className="p-3">Source System</th>
                  <th className="p-3">External Record ID</th>
                  <th className="p-3">Record Type</th>
                  <th className="p-3">Mapped CMDB CI</th>
                  <th className="p-3">Cache Mode</th>
                  <th className="p-3">Last Seen</th>
                  <th className="p-3 text-right">External Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 text-zinc-300">
                {federatedRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-zinc-900">
                    <td className="p-3 font-bold text-white">{rec.sourceName}</td>
                    <td className="p-3 font-mono text-red-400 font-bold">{rec.externalRecordId}</td>
                    <td className="p-3 text-zinc-400">{rec.externalRecordType}</td>
                    <td className="p-3 text-white font-bold">{rec.mappedCiName}</td>
                    <td className="p-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          rec.cacheSourceTag === 'FEDERATED CACHE'
                            ? 'bg-zinc-900 text-white border-zinc-700'
                            : 'bg-red-600/20 text-red-400 border-red-500/40'
                        }`}
                      >
                        {rec.cacheSourceTag}
                      </span>
                    </td>
                    <td className="p-3 text-zinc-500">{rec.lastSeen}</td>
                    <td className="p-3 text-right">
                      <a
                        href={rec.externalUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-red-400 hover:text-red-300 font-bold flex items-center justify-end space-x-1"
                      >
                        <span>Inspect</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: MAPPINGS */}
      {activeTab === 'mappings' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="flex justify-between items-center bg-zinc-950 p-3 border border-zinc-800 rounded-lg">
            <span className="text-white font-bold">EXTERNAL RECORD TO CMDB CI MAPPINGS</span>
            <button
              onClick={() => setIsNewMappingModalOpen(true)}
              className="bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1.5 rounded flex items-center space-x-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Mapping</span>
            </button>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-zinc-900 text-zinc-400 border-b border-zinc-800 text-[10px] uppercase">
                <tr>
                  <th className="p-3">Federation Source</th>
                  <th className="p-3">External ID</th>
                  <th className="p-3">Mapping Cardinality</th>
                  <th className="p-3">Canonical CMDB CI</th>
                  <th className="p-3">Mapped By</th>
                  <th className="p-3">Created At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 text-zinc-300">
                {federatedMappings.map((map) => (
                  <tr key={map.id} className="hover:bg-zinc-900">
                    <td className="p-3 font-bold text-white">{map.sourceName}</td>
                    <td className="p-3 font-mono text-red-400">{map.externalRecordId}</td>
                    <td className="p-3 font-bold text-zinc-300">{map.mappingType}</td>
                    <td className="p-3 font-bold text-white flex items-center space-x-1.5">
                      <Database className="w-3.5 h-3.5 text-red-500" />
                      <span>{map.ciName}</span>
                    </td>
                    <td className="p-3 text-zinc-400">{map.mappedBy}</td>
                    <td className="p-3 text-zinc-500">{map.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: SYNC ENGINE */}
      {activeTab === 'sync' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden">
            <div className="p-3 bg-black border-b border-zinc-800 text-white font-bold flex justify-between items-center">
              <span>FEDERATION SYNCHRONIZATION JOBS LOG</span>
              <span className="text-zinc-400 text-[10px]">Asynchronous Non-Blocking Workers</span>
            </div>

            <table className="w-full text-left">
              <thead className="bg-zinc-900 text-zinc-400 border-b border-zinc-800 text-[10px] uppercase">
                <tr>
                  <th className="p-3">Source System</th>
                  <th className="p-3">Sync Mode</th>
                  <th className="p-3">Records Processed</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Start Time</th>
                  <th className="p-3">End Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 text-zinc-300">
                {syncJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-zinc-900">
                    <td className="p-3 font-bold text-white">{job.sourceName}</td>
                    <td className="p-3 text-red-400 font-bold">{job.syncMode}</td>
                    <td className="p-3 font-bold text-white">{job.recordsProcessed.toLocaleString()}</td>
                    <td className="p-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          job.status === 'Completed'
                            ? 'bg-zinc-900 text-white border-zinc-700'
                            : 'bg-red-600/20 text-red-400 border-red-500/40'
                        }`}
                      >
                        {job.status}
                      </span>
                    </td>
                    <td className="p-3 text-zinc-500">{job.startTime}</td>
                    <td className="p-3 text-zinc-500">{job.endTime || 'Running...'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: CONFLICTS */}
      {activeTab === 'conflicts' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-4">
            <div className="font-bold text-white text-sm border-b border-zinc-800 pb-2">
              DISCREPANCY CONFLICTS BETWEEN CMDB & EXTERNAL SYSTEMS OF RECORD
            </div>

            {dataConflicts.length === 0 ? (
              <div className="text-zinc-500">No active conflicts detected across sources.</div>
            ) : (
              <div className="space-y-4">
                {dataConflicts.map((conf) => (
                  <div key={conf.id} className="bg-black border border-zinc-800 p-4 rounded space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-white font-black text-sm">{conf.ciName} ({conf.ciId})</span>
                        <span className="text-red-500 block font-bold text-xs">Conflict Attribute: {conf.attributeName}</span>
                      </div>
                      <span className="text-zinc-400 text-[10px]">Priority Rule: {conf.sourcePriority}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-zinc-950 p-3 border border-zinc-800 rounded space-y-2">
                        <span className="text-zinc-500 text-[10px] uppercase font-bold block">Source A: {conf.sourceAName}</span>
                        <span className="text-white font-bold text-sm block">{conf.sourceAValue}</span>
                        <button
                          onClick={() => handleResolveConflict(conf.id, conf.sourceAName)}
                          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-1.5 rounded cursor-pointer"
                        >
                          Accept {conf.sourceAName}
                        </button>
                      </div>

                      <div className="bg-zinc-950 p-3 border border-zinc-800 rounded space-y-2">
                        <span className="text-zinc-500 text-[10px] uppercase font-bold block">Source B: {conf.sourceBName}</span>
                        <span className="text-white font-bold text-sm block">{conf.sourceBValue}</span>
                        <button
                          onClick={() => handleResolveConflict(conf.id, conf.sourceBName)}
                          className="w-full bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700 font-bold py-1.5 rounded cursor-pointer"
                        >
                          Accept {conf.sourceBName}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 7: DATA PROVENANCE */}
      {activeTab === 'provenance' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-lg space-y-4">
            <div className="font-bold text-white text-sm border-b border-zinc-800 pb-2">
              FIELD-LEVEL SOURCE OF TRUTH & ATTRIBUTION (CI-10025)
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-black border border-zinc-800 rounded space-y-1">
                <span className="text-zinc-500 text-[10px] uppercase font-bold block">Employee Assignment</span>
                <span className="text-white font-bold text-sm block">Alex Rivera (HR-45821)</span>
                <span className="text-red-400 text-[10px] block">Authoritative System of Record: Workday HR</span>
              </div>

              <div className="p-3 bg-black border border-zinc-800 rounded space-y-1">
                <span className="text-zinc-500 text-[10px] uppercase font-bold block">Financial Purchase PO</span>
                <span className="text-white font-bold text-sm block">PO-991204 ($2,450.00)</span>
                <span className="text-red-400 text-[10px] block">Authoritative System of Record: SAP S/4HANA</span>
              </div>

              <div className="p-3 bg-black border border-zinc-800 rounded space-y-1">
                <span className="text-zinc-500 text-[10px] uppercase font-bold block">Hardware Specs & Serial</span>
                <span className="text-white font-bold text-sm block">Dell Latitude 7450 (32GB RAM)</span>
                <span className="text-red-400 text-[10px] block">Authoritative System of Record: Endpoint Agent</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: HISTORY */}
      {activeTab === 'history' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden">
            <div className="p-3 bg-black border-b border-zinc-800 text-white font-bold flex justify-between items-center">
              <span>HISTORICAL CMDB ATTRIBUTE & FEDERATION AUDIT LOG</span>
              <span className="text-zinc-400 text-[10px]">Immutable Historical Tracking</span>
            </div>

            <table className="w-full text-left">
              <thead className="bg-zinc-900 text-zinc-400 border-b border-zinc-800 text-[10px] uppercase">
                <tr>
                  <th className="p-3">CI Name / ID</th>
                  <th className="p-3">Attribute Changed</th>
                  <th className="p-3">Previous Value</th>
                  <th className="p-3">New Value</th>
                  <th className="p-3">Source Engine</th>
                  <th className="p-3">Updated At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 text-zinc-300">
                {ciHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-900">
                    <td className="p-3 font-bold text-white">{item.ciName}</td>
                    <td className="p-3 font-bold text-red-400">{item.attributeName}</td>
                    <td className="p-3 text-zinc-500">{item.previousValue}</td>
                    <td className="p-3 text-white font-bold">{item.newValue}</td>
                    <td className="p-3 text-zinc-400">{item.source}</td>
                    <td className="p-3 text-zinc-500">{item.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CONNECT FEDERATION SOURCE MODAL */}
      {isAddSourceModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-mono text-xs">
          <div className="bg-zinc-950 border border-zinc-800 w-full max-w-md rounded-lg shadow-2xl overflow-hidden">
            <div className="p-4 bg-black border-b border-zinc-800 flex justify-between items-center text-white font-bold">
              <span>CONNECT NEW FEDERATION SOURCE</span>
              <button onClick={() => setIsAddSourceModalOpen(false)} className="cursor-pointer hover:text-red-500">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateSource} className="p-4 space-y-3">
              <div>
                <label className="text-zinc-400 block mb-1">Source System Name *</label>
                <input
                  type="text"
                  required
                  value={newSourceName}
                  onChange={(e) => setNewSourceName(e.target.value)}
                  placeholder="e.g. Workday HR or SAP ERP"
                  className="w-full bg-black border border-zinc-800 rounded p-2 text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">System Type *</label>
                <select
                  value={newSourceType}
                  onChange={(e) => setNewSourceType(e.target.value as any)}
                  className="w-full bg-black border border-zinc-800 rounded p-2 text-white focus:outline-none cursor-pointer"
                >
                  <option value="HR">HR System of Record</option>
                  <option value="ERP">ERP Procurement</option>
                  <option value="Cloud Billing">Cloud Billing API</option>
                  <option value="Microsoft Entra ID">Microsoft Entra ID / Identity</option>
                  <option value="ITSM">ITSM Ticket Engine</option>
                  <option value="Contract Management">Contract Management</option>
                </select>
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">API Endpoint URL</label>
                <input
                  type="text"
                  value={newSourceEndpoint}
                  onChange={(e) => setNewSourceEndpoint(e.target.value)}
                  placeholder="https://api.external.com/v1"
                  className="w-full bg-black border border-zinc-800 rounded p-2 text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddSourceModalOpen(false)}
                  className="bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded text-zinc-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-1.5 rounded cursor-pointer"
                >
                  Connect Source
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
