import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  GitMerge,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  X,
  UserCheck,
  Shield,
  Layers,
  Zap,
  ArrowRight,
  Sliders,
  RotateCcw,
  AlertTriangle,
  FileText,
  Building,
  Ticket,
  ChevronRight,
  Search,
  Filter,
  Lock,
  RefreshCw,
  Eye,
  Check,
  Ban,
  Activity,
  Cpu,
  Server,
  BookOpen,
  Code,
  Share2,
  List,
  Terminal,
  Settings,
  HelpCircle,
} from 'lucide-react';
import {
  AdvancedWorkflowDefinition,
  WorkflowExecutionInstance,
  WorkflowTriggerEventType,
  WorkflowActivationStatus,
  WorkflowInstanceState,
  WorkflowNode,
  ITSMIntegrationLink,
  ITSMConnectorConfig,
  WebhookEventLog,
  DynamicApproverRole,
  ConditionOperator,
} from '../../types';

export const WorkflowEngineModule: React.FC = () => {
  const { currentTenant, currentUser, addAuditEntry } = useApp();

  // Navigation Sub-Tabs
  const [activeTab, setActiveTab] = useState<
    | 'executions'
    | 'builder'
    | 'rules'
    | 'templates'
    | 'itsm_bus'
    | 'connectors'
    | 'webhooks'
    | 'audit'
  >('executions');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');

  // ---------------- MOCK DATA FOR WORKFLOW ENGINE ----------------

  // 1. WORKFLOW DEFINITIONS
  const [workflowDefinitions, setWorkflowDefinitions] = useState<AdvancedWorkflowDefinition[]>([
    {
      id: 'wf-def-101',
      name: 'Automatic Asset Disposal & Security Wiping',
      category: 'Asset Lifecycle',
      description: 'Triggered when an asset is marked as Retired. Enforces IT Manager & Security Manager approvals, generates certified disposal task, and notifies asset owner.',
      currentVersion: '2.0',
      versions: [
        {
          id: 'v-2.0',
          workflowId: 'wf-def-101',
          version: '2.0',
          status: 'Active',
          createdAt: '2026-06-15',
          createdBy: 'System Administrator',
          nodes: [
            { id: 'n1', nodeType: 'Trigger', label: 'Asset Retired Trigger', description: 'Fires when Asset Status = "Retired"', config: { triggerEvent: 'Asset Retired' }, position: { x: 50, y: 50 }, nextStepIds: ['n2'] },
            { id: 'n2', nodeType: 'Condition', label: 'Check Asset Type', description: 'IF Asset Type = Laptop OR Server', config: { conditions: [{ id: 'c1', field: 'assetType', operator: 'In List', value: 'Laptop, Server' }] }, position: { x: 50, y: 150 }, nextStepIds: ['n3'] },
            { id: 'n3', nodeType: 'Approval', label: 'Manager Approval', description: 'Requires Asset Manager & Security Manager', config: { approvalRule: { id: 'ar1', approvalType: 'Sequential Approval', approverRole: 'Asset Manager', timeoutDays: 3 } }, position: { x: 50, y: 250 }, nextStepIds: ['n4'] },
            { id: 'n4', nodeType: 'Action', label: 'Create Disposal Task', description: 'Generates work order for certified physical drive wiping', config: { actionType: 'Create Task' }, position: { x: 50, y: 350 }, nextStepIds: ['n5'] },
            { id: 'n5', nodeType: 'Notification', label: 'Notify Owner & ITAM', description: 'Sends email notification upon disposal completion', config: { emailTemplate: 'DISPOSAL_COMPLETED_TEMPLATE' }, position: { x: 50, y: 450 }, nextStepIds: ['n6'] },
            { id: 'n6', nodeType: 'End', label: 'Workflow Complete', description: 'Marks lifecycle process as disproven & archived', config: {}, position: { x: 50, y: 550 }, nextStepIds: [] },
          ],
        },
        { id: 'v-1.0', workflowId: 'wf-def-101', version: '1.0', status: 'Archived', createdAt: '2025-01-10', createdBy: 'System Administrator', nodes: [] },
      ],
      triggerEvent: 'Asset Retired',
      status: 'Active',
      createdAt: '2025-01-10',
      updatedAt: '2026-06-15',
      tenantId: currentTenant.id,
    },
    {
      id: 'wf-def-102',
      name: 'Warranty Expiration & Refresh Alert',
      category: 'Asset Lifecycle',
      description: 'Triggered when asset warranty reaches <= 30 days remaining. Automatically creates warranty review task and notifies IT Procurement.',
      currentVersion: '1.1',
      versions: [
        {
          id: 'v-1.1',
          workflowId: 'wf-def-102',
          version: '1.1',
          status: 'Active',
          createdAt: '2026-04-01',
          createdBy: 'Sarah Jenkins',
          nodes: [
            { id: 'wn1', nodeType: 'Trigger', label: 'Warranty Expiring', description: 'Fires when Warranty Days <= 30', config: { triggerEvent: 'Warranty Expiring' }, position: { x: 50, y: 50 }, nextStepIds: ['wn2'] },
            { id: 'wn2', nodeType: 'Action', label: 'Create Review Task', description: 'Creates procurement evaluation ticket', config: { actionType: 'Create Task' }, position: { x: 50, y: 150 }, nextStepIds: ['wn3'] },
            { id: 'wn3', nodeType: 'End', label: 'Complete', description: 'Workflow Done', config: {}, position: { x: 50, y: 250 }, nextStepIds: [] },
          ],
        },
      ],
      triggerEvent: 'Warranty Expiring',
      status: 'Active',
      createdAt: '2026-04-01',
      updatedAt: '2026-04-01',
      tenantId: currentTenant.id,
    },
    {
      id: 'wf-def-103',
      name: 'Contract Expiration & Renewal Chain',
      category: 'Procurement',
      description: 'Triggered when contract end date <= 60 days. Escalates through Contract Owner, Procurement, and Finance if contract value > 10,00,000 INR.',
      currentVersion: '1.0',
      versions: [
        {
          id: 'v-1.0',
          workflowId: 'wf-def-103',
          version: '1.0',
          status: 'Active',
          createdAt: '2026-02-15',
          createdBy: 'Robert Vance',
          nodes: [],
        },
      ],
      triggerEvent: 'Contract Expiring',
      status: 'Active',
      createdAt: '2026-02-15',
      updatedAt: '2026-02-15',
      tenantId: currentTenant.id,
    },
    {
      id: 'wf-def-104',
      name: 'Software License Non-Compliance Remediation',
      category: 'Compliance',
      description: 'Triggered upon ELP License Deficit detection. Requires IT Manager approval to auto-issue software procurement request or harvest unused seats.',
      currentVersion: '1.0',
      versions: [
        {
          id: 'v-1.0-comp',
          workflowId: 'wf-def-104',
          version: '1.0',
          status: 'Active',
          createdAt: '2026-05-10',
          createdBy: 'Michael Chang',
          nodes: [],
        },
      ],
      triggerEvent: 'License Non-Compliant',
      status: 'Active',
      createdAt: '2026-05-10',
      updatedAt: '2026-05-10',
      tenantId: currentTenant.id,
    },
  ]);

  // Selected Workflow Definition for Low-Code Builder
  const [selectedBuilderDef, setSelectedBuilderDef] = useState<AdvancedWorkflowDefinition>(workflowDefinitions[0]);
  const [builderSimulationMode, setBuilderSimulationMode] = useState(false);
  const [simulationInputStatus, setSimulationInputStatus] = useState('Retired');
  const [simulationResult, setSimulationResult] = useState<string | null>(null);

  // 2. WORKFLOW EXECUTION INSTANCES
  const [executionInstances, setExecutionInstances] = useState<WorkflowExecutionInstance[]>([
    {
      id: 'exec-10025',
      workflowId: 'wf-def-101',
      workflowName: 'Automatic Asset Disposal & Security Wiping',
      version: '2.0',
      correlationId: 'CORR-9901-8812',
      triggerEvent: 'Asset Retired',
      targetEntityType: 'Asset',
      targetEntityId: 'AST-8812',
      targetEntityName: 'Dell Latitude 7450 (LAPTOP-10025)',
      currentStepId: 'n3',
      currentStepLabel: 'Manager Approval',
      state: 'Pending Approval',
      startedAt: '2026-08-11 09:15:00',
      retryCount: 0,
      stepLogs: [
        { id: 'sl-1', nodeId: 'n1', nodeLabel: 'Asset Retired Trigger', nodeType: 'Trigger', startedAt: '2026-08-11 09:15:00', completedAt: '2026-08-11 09:15:01', status: 'Success', inputData: { status: 'Retired', assetId: 'AST-8812' } },
        { id: 'sl-2', nodeId: 'n2', nodeLabel: 'Check Asset Type', nodeType: 'Condition', startedAt: '2026-08-11 09:15:01', completedAt: '2026-08-11 09:15:02', status: 'Success', outputData: { matchedCondition: 'Laptop' } },
        { id: 'sl-3', nodeId: 'n3', nodeLabel: 'Manager Approval', nodeType: 'Approval', startedAt: '2026-08-11 09:15:02', status: 'In Progress', approverActor: 'Sarah Jenkins (Asset Manager)' },
      ],
      tenantId: currentTenant.id,
    },
    {
      id: 'exec-10026',
      workflowId: 'wf-def-102',
      workflowName: 'Warranty Expiration & Refresh Alert',
      version: '1.1',
      correlationId: 'CORR-9902-9001',
      triggerEvent: 'Warranty Expiring',
      targetEntityType: 'Asset',
      targetEntityId: 'AST-9001',
      targetEntityName: 'Dell PowerEdge R750 Server',
      currentStepId: 'wn3',
      currentStepLabel: 'Complete',
      state: 'Completed',
      startedAt: '2026-08-10 14:00:00',
      completedAt: '2026-08-10 14:02:10',
      retryCount: 0,
      stepLogs: [
        { id: 'sl-10', nodeId: 'wn1', nodeLabel: 'Warranty Expiring', nodeType: 'Trigger', startedAt: '2026-08-10 14:00:00', completedAt: '2026-08-10 14:00:01', status: 'Success' },
        { id: 'sl-11', nodeId: 'wn2', nodeLabel: 'Create Review Task', nodeType: 'Action', startedAt: '2026-08-10 14:00:01', completedAt: '2026-08-10 14:02:00', status: 'Success', outputData: { taskId: 'TSK-9901' } },
        { id: 'sl-12', nodeId: 'wn3', nodeLabel: 'Complete', nodeType: 'End', startedAt: '2026-08-10 14:02:00', completedAt: '2026-08-10 14:02:10', status: 'Success' },
      ],
      tenantId: currentTenant.id,
    },
    {
      id: 'exec-10027',
      workflowId: 'wf-def-104',
      workflowName: 'Software License Non-Compliance Remediation',
      version: '1.0',
      correlationId: 'CORR-9903-LIC1',
      triggerEvent: 'License Non-Compliant',
      targetEntityType: 'License',
      targetEntityId: 'LIC-1002',
      targetEntityName: 'Oracle DB 19c Enterprise License',
      currentStepId: 'step-err',
      currentStepLabel: 'Call Integration API',
      state: 'Failed',
      startedAt: '2026-08-11 08:30:00',
      retryCount: 2,
      stepLogs: [
        { id: 'sl-20', nodeId: 'node-t', nodeLabel: 'Deficit Trigger', nodeType: 'Trigger', startedAt: '2026-08-11 08:30:00', completedAt: '2026-08-11 08:30:01', status: 'Success' },
        { id: 'sl-21', nodeId: 'step-err', nodeLabel: 'Call ServiceNow Procurement API', nodeType: 'Action', startedAt: '2026-08-11 08:30:01', status: 'Failed', errorMessage: '504 Gateway Timeout connecting to https://servicenow.company.com/api/now/table/sc_request' },
      ],
      tenantId: currentTenant.id,
    },
  ]);

  // Selected Instance for Step Logs Modal
  const [selectedExecution, setSelectedExecution] = useState<WorkflowExecutionInstance | null>(null);

  // 3. ITSM INTEGRATION BUS LINKS
  const [itsmLinks, setItsmLinks] = useState<ITSMIntegrationLink[]>([
    {
      id: 'itsm-link-101',
      itamEntityType: 'Asset',
      itamEntityId: 'AST-8812',
      itamEntityName: 'Dell Latitude 7450 (LAPTOP-10025)',
      itsmRecordType: 'Incident',
      itsmRecordNumber: 'INC-2026-10052',
      itsmSystem: 'ServiceNow',
      relationshipType: 'AFFECTED_BY',
      status: 'Active',
      externalRecordUrl: 'https://servicenow.company.com/nav_to.do?uri=incident.do?sys_id=INC-2026-10052',
      lastSyncedAt: '2026-08-11 10:15:00',
      syncStatus: 'Synchronized',
      tenantId: currentTenant.id,
    },
    {
      id: 'itsm-link-102',
      itamEntityType: 'CI',
      itamEntityId: 'CI-SRV-001',
      itamEntityName: 'Dell PowerEdge R750 Database Cluster',
      itsmRecordType: 'Change',
      itsmRecordNumber: 'CHG-2026-8802',
      itsmSystem: 'ServiceNow',
      relationshipType: 'IMPLEMENTED_FOR',
      status: 'Active',
      externalRecordUrl: 'https://servicenow.company.com/nav_to.do?uri=change_request.do?sys_id=CHG-2026-8802',
      lastSyncedAt: '2026-08-11 09:30:00',
      syncStatus: 'Synchronized',
      tenantId: currentTenant.id,
    },
    {
      id: 'itsm-link-103',
      itamEntityType: 'Service',
      itamEntityId: 'SVC-001',
      itamEntityName: 'M365 Enterprise Email Service',
      itsmRecordType: 'Problem',
      itsmRecordNumber: 'PRB-2026-0041',
      itsmSystem: 'Jira Service Management',
      relationshipType: 'CAUSED_BY',
      status: 'Active',
      externalRecordUrl: 'https://jira.company.com/browse/ITSM-4401',
      lastSyncedAt: '2026-08-10 16:20:00',
      syncStatus: 'Synchronized',
      tenantId: currentTenant.id,
    },
  ]);

  // 4. ITSM CONNECTORS
  const [itsmConnectors] = useState<ITSMConnectorConfig[]>([
    {
      id: 'conn-1',
      provider: 'ServiceNow',
      name: 'Corporate ServiceNow Production Instance',
      baseUrl: 'https://company.service-now.com',
      authType: 'OAuth2',
      status: 'Connected',
      lastHeartbeat: '2026-08-11 11:25:00',
      webhooksEnabled: true,
      webhookSecret: 'sec_sn_9901238471293812',
      retryPolicy: { maxRetries: 3, backoffMultiplierSec: 5 },
      tenantId: currentTenant.id,
    },
    {
      id: 'conn-2',
      provider: 'Jira Service Management',
      name: 'Engineering JSM Cloud Connector',
      baseUrl: 'https://company.atlassian.net',
      authType: 'API Key',
      status: 'Connected',
      lastHeartbeat: '2026-08-11 11:20:00',
      webhooksEnabled: true,
      webhookSecret: 'sec_jira_8812398123',
      retryPolicy: { maxRetries: 5, backoffMultiplierSec: 10 },
      tenantId: currentTenant.id,
    },
    {
      id: 'conn-3',
      provider: 'BMC Helix',
      name: 'Legacy Datacenter Remedy ITSM',
      baseUrl: 'https://remedy.internal.company.com',
      authType: 'Basic Auth',
      status: 'Disconnected',
      lastHeartbeat: '2026-08-01 00:00:00',
      webhooksEnabled: false,
      webhookSecret: 'sec_bmc_unused',
      retryPolicy: { maxRetries: 2, backoffMultiplierSec: 15 },
      tenantId: currentTenant.id,
    },
  ]);

  // 5. WEBHOOK EVENT LOGS
  const [webhookLogs, setWebhookLogs] = useState<WebhookEventLog[]>([
    {
      id: 'wh-101',
      direction: 'Inbound',
      eventPayloadType: 'incident.updated',
      sourceSystem: 'ServiceNow',
      correlationId: 'CORR-9901-8812',
      timestamp: '2026-08-11 10:15:00',
      signatureValid: true,
      status: 'Processed',
      responseCode: 200,
      payloadSnippet: '{"incident":"INC-2026-10052", "state":"In Progress", "assigned_group":"Hardware Tech Team"}',
      tenantId: currentTenant.id,
    },
    {
      id: 'wh-102',
      direction: 'Outbound',
      eventPayloadType: 'asset.disposal.approved',
      sourceSystem: 'ITAM Workflow Engine',
      correlationId: 'CORR-9901-8812',
      timestamp: '2026-08-11 09:15:02',
      signatureValid: true,
      status: 'Processed',
      responseCode: 201,
      payloadSnippet: '{"event":"ASSET_RETIRED", "asset_id":"AST-8812", "approved_by":"Sarah Jenkins"}',
      tenantId: currentTenant.id,
    },
    {
      id: 'wh-103',
      direction: 'Outbound',
      eventPayloadType: 'license.shortfall.detected',
      sourceSystem: 'ITAM Workflow Engine',
      correlationId: 'CORR-9903-LIC1',
      timestamp: '2026-08-11 08:30:01',
      signatureValid: true,
      status: 'In Dead Letter Queue',
      responseCode: 504,
      payloadSnippet: '{"event":"LICENSE_DEFICIT", "license_id":"LIC-1002", "shortfall":15}',
      tenantId: currentTenant.id,
    },
  ]);

  // HANDLERS
  const handleApproveStep = (execId: string) => {
    setExecutionInstances((prev) =>
      prev.map((inst) => {
        if (inst.id === execId) {
          return {
            ...inst,
            state: 'Approved',
            completedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
            stepLogs: inst.stepLogs.map((log) =>
              log.status === 'In Progress'
                ? { ...log, status: 'Success', completedAt: new Date().toISOString().replace('T', ' ').slice(0, 19), approverActor: `${currentUser.name} (Approved)` }
                : log
            ),
          };
        }
        return inst;
      })
    );
    addAuditEntry('UPDATE', 'WorkflowExecutionInstance', execId, 'Approved workflow step manually.');
  };

  const handleRejectStep = (execId: string) => {
    setExecutionInstances((prev) =>
      prev.map((inst) => {
        if (inst.id === execId) {
          return {
            ...inst,
            state: 'Rejected',
            completedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
            stepLogs: inst.stepLogs.map((log) =>
              log.status === 'In Progress'
                ? { ...log, status: 'Failed', errorMessage: 'Rejected by approver', completedAt: new Date().toISOString().replace('T', ' ').slice(0, 19) }
                : log
            ),
          };
        }
        return inst;
      })
    );
    addAuditEntry('UPDATE', 'WorkflowExecutionInstance', execId, 'Rejected workflow step.');
  };

  const handleRetryExecution = (execId: string) => {
    setExecutionInstances((prev) =>
      prev.map((inst) => {
        if (inst.id === execId) {
          return {
            ...inst,
            state: 'In Progress',
            retryCount: inst.retryCount + 1,
            stepLogs: inst.stepLogs.map((log) =>
              log.status === 'Failed'
                ? { ...log, status: 'In Progress', errorMessage: undefined }
                : log
            ),
          };
        }
        return inst;
      })
    );
    addAuditEntry('UPDATE', 'WorkflowExecutionInstance', execId, 'Initiated manual workflow retry attempt.');
  };

  const handleRunSimulation = () => {
    if (simulationInputStatus === 'Retired') {
      setSimulationResult('SUCCESS: Match found for Asset Retired trigger. Evaluated Asset Type = Laptop (TRUE). Sequential approvals initiated for Asset Manager & Security Manager.');
    } else {
      setSimulationResult('CONDITION NOT MET: Asset Status does not equal "Retired". Execution halted at Node n2.');
    }
  };

  // Aggregates
  const runningCount = executionInstances.filter((i) => i.state === 'In Progress' || i.state === 'Pending Approval').length;
  const completedCount = executionInstances.filter((i) => i.state === 'Completed' || i.state === 'Approved').length;
  const failedCount = executionInstances.filter((i) => i.state === 'Failed' || i.state === 'Rejected').length;

  return (
    <div className="p-4 sm:p-6 space-y-6 text-white font-sans selection:bg-red-600 selection:text-white">
      {/* Top Banner - Strict Red / Black / White Styling */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-zinc-950 p-4 border border-zinc-800 rounded-lg">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight flex items-center space-x-2">
            <GitMerge className="w-5 h-5 text-red-600" />
            <span>ITAM WORKFLOW ENGINE & ITSM INTEGRATION BUS</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1 font-mono">
            Low-Code Rule Engine, Approval Chains, Lifecycle State Machines & Bi-Directional ITSM Relationship Bus
          </p>
        </div>

        <div className="flex items-center space-x-3 font-mono text-xs">
          <span className="bg-black border border-zinc-800 text-zinc-300 px-3 py-1.5 rounded flex items-center space-x-1.5">
            <Lock className="w-3.5 h-3.5 text-white" />
            <span>Tenant Isolation: {currentTenant.name}</span>
          </span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 bg-black p-1 border border-zinc-800 rounded font-mono text-xs">
        <button
          onClick={() => setActiveTab('executions')}
          className={`px-3 py-1.5 rounded transition-colors cursor-pointer flex items-center space-x-1.5 ${
            activeTab === 'executions' ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Play className="w-3.5 h-3.5" />
          <span>Workflow Executions ({executionInstances.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('builder')}
          className={`px-3 py-1.5 rounded transition-colors cursor-pointer flex items-center space-x-1.5 ${
            activeTab === 'builder' ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Low-Code Workflow Builder</span>
        </button>

        <button
          onClick={() => setActiveTab('rules')}
          className={`px-3 py-1.5 rounded transition-colors cursor-pointer flex items-center space-x-1.5 ${
            activeTab === 'rules' ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Business Rules Engine</span>
        </button>

        <button
          onClick={() => setActiveTab('templates')}
          className={`px-3 py-1.5 rounded transition-colors cursor-pointer flex items-center space-x-1.5 ${
            activeTab === 'templates' ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Automation Templates</span>
        </button>

        <button
          onClick={() => setActiveTab('itsm_bus')}
          className={`px-3 py-1.5 rounded transition-colors cursor-pointer flex items-center space-x-1.5 ${
            activeTab === 'itsm_bus' ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Ticket className="w-3.5 h-3.5" />
          <span>ITSM Integration Bus</span>
        </button>

        <button
          onClick={() => setActiveTab('connectors')}
          className={`px-3 py-1.5 rounded transition-colors cursor-pointer flex items-center space-x-1.5 ${
            activeTab === 'connectors' ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>ITSM Connectors ({itsmConnectors.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('webhooks')}
          className={`px-3 py-1.5 rounded transition-colors cursor-pointer flex items-center space-x-1.5 ${
            activeTab === 'webhooks' ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Webhook Gateway & DLQ</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-3 py-1.5 rounded transition-colors cursor-pointer flex items-center space-x-1.5 ${
            activeTab === 'audit' ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Execution Logs</span>
        </button>
      </div>

      {/* TAB 1: WORKFLOW EXECUTIONS & MONITORING */}
      {activeTab === 'executions' && (
        <div className="space-y-6 font-mono text-xs">
          {/* Status Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-lg space-y-1">
              <span className="text-zinc-500 text-[10px] uppercase font-bold block">Active / Pending Executions</span>
              <div className="flex justify-between items-baseline">
                <span className="text-2xl font-black text-white">{runningCount}</span>
                <span className="text-[10px] text-zinc-400">In Progress</span>
              </div>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-lg space-y-1">
              <span className="text-zinc-500 text-[10px] uppercase font-bold block">Completed / Approved</span>
              <div className="flex justify-between items-baseline">
                <span className="text-2xl font-black text-white">{completedCount}</span>
                <span className="text-[10px] text-zinc-400">Success Rate: 100%</span>
              </div>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-lg space-y-1">
              <span className="text-zinc-500 text-[10px] uppercase font-bold block">Failed / Dead Letter Queue</span>
              <div className="flex justify-between items-baseline">
                <span className="text-2xl font-black text-red-500">{failedCount}</span>
                <span className="text-[10px] text-red-400 font-bold">Requires Action</span>
              </div>
            </div>
          </div>

          {/* Executions Table */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden space-y-3 p-4">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <span className="text-white font-bold text-sm">ACTIVE WORKFLOW INSTANCE MONITOR</span>
              <div className="flex items-center space-x-2">
                <Search className="w-3.5 h-3.5 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search execution, correlation ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-black border border-zinc-800 text-white px-2.5 py-1 rounded text-xs focus:outline-none focus:border-red-600"
                />
              </div>
            </div>

            <table className="w-full text-left">
              <thead className="bg-zinc-900 text-zinc-400 text-[10px] uppercase border-b border-zinc-800">
                <tr>
                  <th className="p-3">Execution Ref</th>
                  <th className="p-3">Workflow Name</th>
                  <th className="p-3">Correlation ID</th>
                  <th className="p-3">Target Entity</th>
                  <th className="p-3">Current Step</th>
                  <th className="p-3">Started At</th>
                  <th className="p-3">State</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 text-zinc-300">
                {executionInstances
                  .filter(
                    (inst) =>
                      inst.workflowName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      inst.correlationId.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((inst) => (
                    <tr key={inst.id} className="hover:bg-zinc-900">
                      <td className="p-3 font-bold text-white">{inst.id}</td>
                      <td className="p-3 font-bold text-white">{inst.workflowName} <span className="text-zinc-500 text-[10px]">v{inst.version}</span></td>
                      <td className="p-3 text-zinc-400">{inst.correlationId}</td>
                      <td className="p-3 font-bold text-red-400">{inst.targetEntityType}: {inst.targetEntityName}</td>
                      <td className="p-3 text-zinc-300">{inst.currentStepLabel}</td>
                      <td className="p-3 text-zinc-500">{inst.startedAt}</td>
                      <td className="p-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            inst.state === 'Completed' || inst.state === 'Approved'
                              ? 'bg-zinc-900 text-white border-zinc-700'
                              : inst.state === 'Failed' || inst.state === 'Rejected'
                              ? 'bg-red-600/20 text-red-500 border-red-500'
                              : 'bg-red-600 text-white border-red-600'
                          }`}
                        >
                          {inst.state}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-2">
                        <button
                          onClick={() => setSelectedExecution(inst)}
                          className="bg-black hover:bg-zinc-900 border border-zinc-800 text-white px-2.5 py-1 rounded text-[10px] font-bold cursor-pointer"
                        >
                          Logs
                        </button>

                        {inst.state === 'Pending Approval' && (
                          <>
                            <button
                              onClick={() => handleApproveStep(inst.id)}
                              className="bg-red-600 hover:bg-red-700 text-white px-2.5 py-1 rounded text-[10px] font-bold cursor-pointer"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectStep(inst.id)}
                              className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-red-400 px-2.5 py-1 rounded text-[10px] font-bold cursor-pointer"
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {inst.state === 'Failed' && (
                          <button
                            onClick={() => handleRetryExecution(inst.id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-2.5 py-1 rounded text-[10px] font-bold cursor-pointer"
                          >
                            Retry
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: LOW-CODE WORKFLOW BUILDER */}
      {activeTab === 'builder' && (
        <div className="space-y-6 font-mono text-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-950 p-4 border border-zinc-800 rounded-lg">
            <div>
              <span className="text-red-500 font-bold text-[10px] uppercase block">VISUAL WORKFLOW CANVAS</span>
              <span className="text-white font-black text-sm">{selectedBuilderDef.name} (v{selectedBuilderDef.currentVersion})</span>
              <p className="text-zinc-400 text-[11px] mt-0.5">{selectedBuilderDef.description}</p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setBuilderSimulationMode(!builderSimulationMode)}
                className={`px-3 py-1.5 rounded font-bold cursor-pointer flex items-center space-x-1.5 ${
                  builderSimulationMode ? 'bg-red-600 text-white' : 'bg-black border border-zinc-800 text-zinc-300 hover:text-white'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{builderSimulationMode ? 'Exit Test Mode' : 'Test / Simulate'}</span>
              </button>

              <span className="bg-zinc-900 border border-zinc-700 text-white text-[10px] px-2.5 py-1.5 rounded font-bold">
                Status: {selectedBuilderDef.status}
              </span>
            </div>
          </div>

          {/* Test / Simulation Bar */}
          {builderSimulationMode && (
            <div className="bg-red-950/20 border border-red-900/60 p-4 rounded-lg space-y-3">
              <span className="text-red-400 font-bold text-xs block">WORKFLOW SIMULATION & DRY-RUN ENGINE</span>
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-zinc-300">Simulate Input Event Asset Status:</span>
                <select
                  value={simulationInputStatus}
                  onChange={(e) => setSimulationInputStatus(e.target.value)}
                  className="bg-black border border-zinc-800 text-white px-3 py-1 rounded focus:outline-none"
                >
                  <option value="Retired">Status = Retired</option>
                  <option value="Active">Status = Active</option>
                  <option value="In Repair">Status = In Repair</option>
                </select>

                <button
                  onClick={handleRunSimulation}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1 rounded cursor-pointer"
                >
                  Run Dry Simulation
                </button>
              </div>

              {simulationResult && (
                <div className="bg-black p-3 border border-zinc-800 rounded text-zinc-300">
                  <strong className="text-white block mb-1">Simulation Execution Output:</strong>
                  <span>{simulationResult}</span>
                </div>
              )}
            </div>
          )}

          {/* Node Visual Connector Steps */}
          <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-lg space-y-6">
            <span className="text-zinc-400 font-bold text-[10px] uppercase block border-b border-zinc-800 pb-2">
              FLOW PIPELINE STEP CONFIGURATION
            </span>

            <div className="space-y-4">
              {selectedBuilderDef.versions[0]?.nodes.map((node, index) => (
                <div key={node.id} className="relative flex items-start space-x-4">
                  <div className="bg-black border border-zinc-800 text-red-500 font-bold w-8 h-8 rounded-full flex items-center justify-center shrink-0">
                    {index + 1}
                  </div>

                  <div className="flex-1 bg-black border border-zinc-800 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <span className="text-white font-black text-sm">{node.label}</span>
                        <span className="bg-zinc-900 text-red-400 border border-zinc-800 text-[10px] px-2 py-0.5 rounded font-bold">
                          {node.nodeType}
                        </span>
                      </div>
                      <span className="text-zinc-500 text-[10px]">Node ID: {node.id}</span>
                    </div>

                    <p className="text-zinc-400 text-[11px]">{node.description}</p>

                    {node.config.conditions && (
                      <div className="bg-zinc-950 p-2 border border-zinc-900 rounded text-[10px] text-zinc-300">
                        <strong>Evaluated Logic:</strong> IF {node.config.conditions[0].field} {node.config.conditions[0].operator} "{node.config.conditions[0].value}"
                      </div>
                    )}

                    {node.config.approvalRule && (
                      <div className="bg-zinc-950 p-2 border border-zinc-900 rounded text-[10px] text-zinc-300">
                        <strong>Approval Matrix:</strong> {node.config.approvalRule.approvalType} ({node.config.approvalRule.approverRole}) - Timeout: {node.config.approvalRule.timeoutDays} Days
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BUSINESS RULES ENGINE */}
      {activeTab === 'rules' && (
        <div className="space-y-6 font-mono text-xs">
          <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-lg space-y-2">
            <h3 className="text-white font-bold text-sm flex items-center space-x-2">
              <Shield className="w-4 h-4 text-red-600" />
              <span>DEDICATED BUSINESS RULE ENGINE (IF / AND / OR / NOT / THEN / ELSE)</span>
            </h3>
            <p className="text-zinc-400 text-[11px]">
              Configure multi-condition boolean evaluation rules that trigger lifecycle automation across ITAM assets and contracts.
            </p>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-lg space-y-4">
            <span className="text-white font-bold text-xs block">REGISTERED BUSINESS RULES MATRIX</span>

            <div className="space-y-3">
              <div className="bg-black border border-zinc-800 p-3 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-white font-bold">Rule #1: High Value Asset Disposal Threshold</span>
                  <span className="bg-zinc-900 text-white border border-zinc-700 text-[10px] px-2 py-0.5 rounded">ACTIVE</span>
                </div>
                <div className="text-zinc-400 text-[11px] font-mono space-y-1 bg-zinc-950 p-2.5 rounded border border-zinc-900">
                  <div className="text-red-500 font-bold">IF (Asset Status = "Retired" AND Asset Purchase Cost &gt; ₹5,00,000)</div>
                  <div>THEN Require Finance Approval + Security Data Destruction Certificate</div>
                  <div className="text-zinc-500">ELSE Execute Standard IT Stockroom Return Workflow</div>
                </div>
              </div>

              <div className="bg-black border border-zinc-800 p-3 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-white font-bold">Rule #2: Enterprise Software Contract Auto-Escalation</span>
                  <span className="bg-zinc-900 text-white border border-zinc-700 text-[10px] px-2 py-0.5 rounded">ACTIVE</span>
                </div>
                <div className="text-zinc-400 text-[11px] font-mono space-y-1 bg-zinc-950 p-2.5 rounded border border-zinc-900">
                  <div className="text-red-500 font-bold">IF (Contract Expiration &lt;= 30 Days AND Contract Value &gt; ₹10,00,000)</div>
                  <div>THEN Create Renewal Workflow & Enforce Department Manager Approval</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: AUTOMATION TEMPLATES */}
      {activeTab === 'templates' && (
        <div className="space-y-6 font-mono text-xs">
          <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-lg space-y-2">
            <span className="text-white font-bold text-sm block">OUT-OF-THE-BOX AUTOMATED ITAM WORKFLOW TEMPLATES</span>
            <p className="text-zinc-400 text-[11px]">Pre-built production workflow chains ready for instant activation across your tenant environment.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-lg space-y-3">
              <span className="text-red-500 font-bold text-[10px] block uppercase">TEMPLATE 1: DISPOSAL WORKFLOW</span>
              <span className="text-white font-black text-sm">Automatic Asset Retirement & Drives Wipe</span>
              <p className="text-zinc-400 text-[11px]">Triggers upon asset retirement. Enforces IT Manager and Security approvals, creates disposal work order, and sends certificate to owner.</p>
              <button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-1.5 rounded cursor-pointer">
                Deploy Template
              </button>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-lg space-y-3">
              <span className="text-red-500 font-bold text-[10px] block uppercase">TEMPLATE 2: WARRANTY WORKFLOW</span>
              <span className="text-white font-black text-sm">Hardware Warranty Review & Refresh Alert</span>
              <p className="text-zinc-400 text-[11px]">Monitors hardware end of warranty. Automatically generates refresh evaluation tasks 30 days prior to expiry.</p>
              <button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-1.5 rounded cursor-pointer">
                Deploy Template
              </button>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-lg space-y-3">
              <span className="text-red-500 font-bold text-[10px] block uppercase">TEMPLATE 3: CONTRACT WORKFLOW</span>
              <span className="text-white font-black text-sm">Software Agreement Renewal Escalation</span>
              <p className="text-zinc-400 text-[11px]">Enforces contract review 60 days before expiration. Routes approvals through procurement and finance.</p>
              <button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-1.5 rounded cursor-pointer">
                Deploy Template
              </button>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-lg space-y-3">
              <span className="text-red-500 font-bold text-[10px] block uppercase">TEMPLATE 4: COMPLIANCE WORKFLOW</span>
              <span className="text-white font-black text-sm">Software Deficit Remediation & Harvesting</span>
              <p className="text-zinc-400 text-[11px]">Detects unassigned seats or software license deficits, triggering auto-remediation task to software asset manager.</p>
              <button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-1.5 rounded cursor-pointer">
                Deploy Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: ITSM INTEGRATION BUS */}
      {activeTab === 'itsm_bus' && (
        <div className="space-y-6 font-mono text-xs">
          <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-lg space-y-2">
            <h3 className="text-white font-bold text-sm flex items-center space-x-2">
              <Ticket className="w-4 h-4 text-red-600" />
              <span>ITSM INTEGRATION BUS (BI-DIRECTIONAL RELATIONSHIP MATRIX)</span>
            </h3>
            <p className="text-zinc-400 text-[11px]">
              Loosely-coupled integration relationships linking ITAM Assets/CIs with ITSM Incidents, Problems, Changes & Service Requests.
            </p>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden p-4 space-y-3">
            <span className="text-white font-bold text-xs block border-b border-zinc-800 pb-2">
              ACTIVE ITAM ↔ ITSM RELATIONSHIP LINKS
            </span>

            <table className="w-full text-left">
              <thead className="bg-zinc-900 text-zinc-400 text-[10px] uppercase border-b border-zinc-800">
                <tr>
                  <th className="p-3">ITAM Entity</th>
                  <th className="p-3">Relationship</th>
                  <th className="p-3">ITSM Record</th>
                  <th className="p-3">System</th>
                  <th className="p-3">Last Synced</th>
                  <th className="p-3">Sync Status</th>
                  <th className="p-3 text-right">External Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 text-zinc-300">
                {itsmLinks.map((link) => (
                  <tr key={link.id} className="hover:bg-zinc-900">
                    <td className="p-3 font-bold text-white">{link.itamEntityType}: {link.itamEntityName}</td>
                    <td className="p-3 font-bold text-red-400">{link.relationshipType}</td>
                    <td className="p-3 font-bold text-white">{link.itsmRecordType}: {link.itsmRecordNumber}</td>
                    <td className="p-3 text-zinc-300">{link.itsmSystem}</td>
                    <td className="p-3 text-zinc-500">{link.lastSyncedAt}</td>
                    <td className="p-3">
                      <span className="bg-zinc-900 border border-zinc-700 text-white text-[10px] px-2 py-0.5 rounded font-bold">
                        {link.syncStatus}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {link.externalRecordUrl && (
                        <a
                          href={link.externalRecordUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold px-2.5 py-1 rounded inline-flex items-center space-x-1"
                        >
                          <span>Open ITSM</span>
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: ITSM CONNECTORS */}
      {activeTab === 'connectors' && (
        <div className="space-y-6 font-mono text-xs">
          <div className="bg-zinc-950 p-3 border border-zinc-800 rounded-lg">
            <span className="text-white font-bold">CONFIGURED ITSM PLATFORM CONNECTORS</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {itsmConnectors.map((c) => (
              <div key={c.id} className="bg-zinc-950 border border-zinc-800 p-4 rounded-lg space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-red-500 font-bold text-[10px] block uppercase">{c.provider}</span>
                    <span className="text-white font-black text-sm">{c.name}</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      c.status === 'Connected' ? 'bg-zinc-900 text-white border-zinc-700' : 'bg-red-600/20 text-red-500 border-red-500'
                    }`}
                  >
                    {c.status}
                  </span>
                </div>

                <div className="bg-black p-2.5 border border-zinc-800 rounded space-y-1 text-zinc-400 text-[11px]">
                  <div><strong>Base URL:</strong> {c.baseUrl}</div>
                  <div><strong>Auth Type:</strong> {c.authType}</div>
                  <div><strong>Last Heartbeat:</strong> {c.lastHeartbeat}</div>
                  <div><strong>Max Retries:</strong> {c.retryPolicy.maxRetries} (Backoff: {c.retryPolicy.backoffMultiplierSec}s)</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: WEBHOOK GATEWAY & DLQ */}
      {activeTab === 'webhooks' && (
        <div className="space-y-6 font-mono text-xs">
          <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-lg space-y-2">
            <h3 className="text-white font-bold text-sm flex items-center space-x-2">
              <Zap className="w-4 h-4 text-red-600" />
              <span>INBOUND / OUTBOUND WEBHOOK GATEWAY & DEAD LETTER QUEUE (DLQ)</span>
            </h3>
            <p className="text-zinc-400 text-[11px]">
              Signature verification, correlation tracking, exponential retry policies and DLQ manual inspection.
            </p>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden p-4 space-y-3">
            <span className="text-white font-bold text-xs block border-b border-zinc-800 pb-2">
              RECENT WEBHOOK LOGS
            </span>

            <table className="w-full text-left">
              <thead className="bg-zinc-900 text-zinc-400 text-[10px] uppercase border-b border-zinc-800">
                <tr>
                  <th className="p-3">Log ID</th>
                  <th className="p-3">Direction</th>
                  <th className="p-3">Event Type</th>
                  <th className="p-3">Correlation ID</th>
                  <th className="p-3">Signature Valid</th>
                  <th className="p-3">Response</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 text-zinc-300">
                {webhookLogs.map((wh) => (
                  <tr key={wh.id} className="hover:bg-zinc-900">
                    <td className="p-3 font-bold text-white">{wh.id}</td>
                    <td className="p-3 font-bold text-red-400">{wh.direction}</td>
                    <td className="p-3 font-bold text-white">{wh.eventPayloadType}</td>
                    <td className="p-3 text-zinc-400">{wh.correlationId}</td>
                    <td className="p-3 text-white font-bold">{wh.signatureValid ? 'VALID' : 'INVALID'}</td>
                    <td className="p-3 text-zinc-300">{wh.responseCode}</td>
                    <td className="p-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          wh.status === 'Processed'
                            ? 'bg-zinc-900 text-white border-zinc-700'
                            : 'bg-red-600/20 text-red-500 border-red-500'
                        }`}
                      >
                        {wh.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 8: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="space-y-6 font-mono text-xs">
          <div className="bg-zinc-950 p-3 border border-zinc-800 rounded-lg">
            <span className="text-white font-bold">WORKFLOW ENGINE AUDIT TRAIL</span>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-2">
            <div className="bg-black p-3 border border-zinc-800 rounded text-zinc-300">
              <span className="text-red-500 font-bold text-[10px] block">2026-08-11 09:15:02 | System Engine</span>
              <strong className="text-white block">Workflow Execution Triggered (CORR-9901-8812)</strong>
              <span>Target Asset: AST-8812 (Dell Latitude 7450). Evaluation result: Matched Rule #1. Manager approval pending.</span>
            </div>
            <div className="bg-black p-3 border border-zinc-800 rounded text-zinc-300">
              <span className="text-red-500 font-bold text-[10px] block">2026-08-10 14:02:10 | System Engine</span>
              <strong className="text-white block">Warranty Review Workflow Executed (CORR-9902-9001)</strong>
              <span>Target Asset: AST-9001 (PowerEdge Server). Generated review ticket TSK-9901. Completed.</span>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: STEP LOGS DRILLDOWN */}
      {selectedExecution && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-mono text-xs">
          <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-lg max-w-2xl w-full space-y-4 text-white">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <span className="font-black text-sm">STEP EXECUTION LOGS: {selectedExecution.id}</span>
              <button onClick={() => setSelectedExecution(null)} className="text-zinc-500 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
              {selectedExecution.stepLogs.map((log) => (
                <div key={log.id} className="bg-black border border-zinc-800 p-3 rounded space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-red-500">{log.nodeLabel} ({log.nodeType})</span>
                    <span className="bg-zinc-900 border border-zinc-700 text-white text-[10px] px-2 py-0.5 rounded">{log.status}</span>
                  </div>
                  <div className="text-zinc-400 text-[10px]">
                    Started: {log.startedAt} {log.completedAt ? `| Completed: ${log.completedAt}` : ''}
                  </div>
                  {log.approverActor && <div className="text-white text-[11px]"><strong>Actor:</strong> {log.approverActor}</div>}
                  {log.errorMessage && <div className="text-red-500 text-[11px]"><strong>Error:</strong> {log.errorMessage}</div>}
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button onClick={() => setSelectedExecution(null)} className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-1.5 rounded cursor-pointer">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
