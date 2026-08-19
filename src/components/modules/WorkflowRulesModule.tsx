import React, { useState, useEffect } from 'react';
import {
  GitBranch,
  Play,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Shield,
  Layers,
  Terminal,
  Radio,
  Activity,
  Check,
  X,
  UserCheck,
  Zap,
  Sliders,
  FileCode,
  Box,
  CornerDownRight,
  RotateCcw,
  RefreshCw,
} from 'lucide-react';

import { TemporalWorkflowAdapter } from '../../workflow/adapters/TemporalWorkflowAdapter';
import { DeclarativeRulesEngineAdapter } from '../../workflow/adapters/DeclarativeRulesEngineAdapter';
import { WorkflowController } from '../../workflow/services/WorkflowController';
import { WorkflowRulesTestSuite, WorkflowTestResult } from '../../workflow/tests/WorkflowRulesTestSuite';
import {
  WorkflowExecution,
  ApprovalTask,
  BusinessRule,
  DryRunResult,
} from '../../workflow/types/workflowTypes';

export const WorkflowRulesModule: React.FC = () => {
  const tenantId = 'tenant-kspl-global';

  const [activeTab, setActiveTab] = useState<'executions' | 'approvals' | 'rules' | 'dry_run' | 'tests'>('executions');

  // State
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [tasks, setTasks] = useState<ApprovalTask[]>([]);
  const [dryRunResult, setDryRunResult] = useState<DryRunResult | null>(null);
  const [testResults, setTestResults] = useState<WorkflowTestResult[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);

  // Simulation Form State
  const [simTargetAsset, setSimTargetAsset] = useState('ENT-AST-1001');
  const [simPurchaseCost, setSimPurchaseCost] = useState(3500);
  const [simCriticality, setSimCriticality] = useState('CRITICAL');

  const controller = new WorkflowController();
  const adapter = new TemporalWorkflowAdapter();

  useEffect(() => {
    loadWorkflowData();
  }, []);

  const loadWorkflowData = () => {
    setExecutions(adapter.getAllExecutions(tenantId));
    setTasks(adapter.getPendingTasks(tenantId));
  };

  const handleStartWorkflow = async () => {
    await controller.executeWorkflow('WF-ASSET-RETIREMENT-v1', 'ENT-AST-1001', tenantId, 'usr-alexander-wright', `corr-${Date.now()}`);
    loadWorkflowData();
  };

  const handleApproveTask = async (taskId: string, decision: 'APPROVE' | 'REJECT') => {
    await controller.approveTask(taskId, decision, 'usr-dept-mgr', tenantId, `corr-${Date.now()}`, 'Approved via Workflow UI');
    loadWorkflowData();
  };

  const handleRunDryRun = async () => {
    setIsSimulating(true);
    const res = await controller.simulateDryRun(
      'WF-ASSET-RETIREMENT-v1',
      simTargetAsset,
      tenantId,
      { purchaseCost: Number(simPurchaseCost), criticality: simCriticality },
      `corr-${Date.now()}`
    );
    setDryRunResult(res.data);
    setIsSimulating(false);
  };

  const handleRunTests = async () => {
    const results = await WorkflowRulesTestSuite.runAllTests(tenantId);
    setTestResults(results);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 text-white font-sans bg-black min-h-screen">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-zinc-950 p-4 border border-zinc-800 rounded-lg shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-red-600 rounded border border-red-500 shadow-sm">
            <GitBranch className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-black text-white tracking-tight font-mono">
                TEMPORAL.IO & CAMUNDA WORKFLOW ENGINE
              </h1>
              <span className="bg-red-600 text-white text-[10px] font-bold uppercase font-mono px-2 py-0.5 rounded border border-red-500">
                DURABLE EXECUTION
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5 font-mono">
              Configurable Approval Chains • Long-Running Workflows • Rules Engine • Lifecycle State Machines • Dry-Run Simulation
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-1 bg-black p-1 border border-zinc-800 rounded font-mono text-xs overflow-x-auto">
          {[
            { id: 'executions', label: 'Workflow Executions', icon: Play },
            { id: 'approvals', label: 'Approval Queue', icon: UserCheck },
            { id: 'rules', label: 'Business Rules', icon: Sliders },
            { id: 'dry_run', label: 'Dry-Run Simulator', icon: Zap },
            { id: 'tests', label: 'Workflow Tests', icon: Activity },
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
            <GitBranch className="w-3.5 h-3.5 text-red-500" />
            <span>Workflow Engine:</span>
            <strong className="text-white">Temporal.io Durable Execution</strong>
          </span>
          <span className="text-zinc-600">|</span>
          <span className="flex items-center space-x-1">
            <Shield className="w-3.5 h-3.5 text-green-500" />
            <span>Tenant Isolation:</span>
            <strong className="text-white">Enforced (itam:{tenantId})</strong>
          </span>
        </div>

        <button
          onClick={handleStartWorkflow}
          className="bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1 rounded border border-red-500 text-xs font-mono flex items-center space-x-1 cursor-pointer"
        >
          <Play className="w-3 h-3" />
          <span>Trigger Asset Retirement Workflow</span>
        </button>
      </div>

      {/* TAB 1: WORKFLOW EXECUTIONS */}
      {activeTab === 'executions' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-4">
            <h3 className="font-bold text-white text-xs border-b border-zinc-800 pb-2 flex items-center space-x-2">
              <Play className="w-4 h-4 text-red-500" />
              <span>ACTIVE & HISTORICAL WORKFLOW EXECUTIONS</span>
            </h3>

            <div className="space-y-3">
              {executions.map((exec, idx) => (
                <div key={idx} className="p-4 bg-black border border-zinc-800 rounded-lg space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-2">
                    <div>
                      <div className="font-bold text-white text-sm flex items-center space-x-2">
                        <span>{exec.workflowName}</span>
                        <span className="text-zinc-500 text-xs">v{exec.version}</span>
                      </div>
                      <div className="text-zinc-400 text-[11px]">
                        Execution ID: <span className="text-red-400">{exec.executionId}</span> | Target: <strong className="text-zinc-200">{exec.targetEntityId}</strong>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className={`px-2.5 py-1 rounded font-bold text-[10px] ${
                        exec.status === 'WAITING_APPROVAL' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40' :
                        exec.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400 border border-green-500/40' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {exec.status}
                      </span>
                    </div>
                  </div>

                  {/* Execution Event Trail */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-zinc-500 text-[10px] font-bold uppercase">Audit History Log Trail:</span>
                    {exec.history.map((h, i) => (
                      <div key={i} className="flex items-center space-x-2 text-[11px] text-zinc-300">
                        <CornerDownRight className="w-3 h-3 text-red-500" />
                        <span className="text-zinc-500 text-[10px]">{new Date(h.timestamp).toLocaleTimeString()}</span>
                        <span className="font-bold text-white">[{h.eventName}]</span>
                        <span className="text-zinc-400">{h.details}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {executions.length === 0 && (
                <div className="text-zinc-500 text-center py-8">
                  No active workflow executions found. Click "Trigger Asset Retirement Workflow" above to launch a durable workflow.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: APPROVAL QUEUE */}
      {activeTab === 'approvals' && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-4 font-mono text-xs">
          <h3 className="font-bold text-white text-xs border-b border-zinc-800 pb-2 flex items-center space-x-2">
            <UserCheck className="w-4 h-4 text-red-500" />
            <span>HUMAN APPROVAL TASK QUEUE & SLA MONITOR</span>
          </h3>

          <div className="space-y-3">
            {tasks.map((task, idx) => (
              <div key={idx} className="p-4 bg-black border border-zinc-800 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="font-bold text-white text-sm flex items-center space-x-2">
                    <span>{task.workflowName}</span>
                    <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[10px]">{task.assignedRole}</span>
                  </div>
                  <div className="text-zinc-400 text-[11px]">
                    Task ID: <span className="text-zinc-200">{task.taskId}</span> | Assigned: <strong className="text-white">{task.assignedUserId}</strong>
                  </div>
                  <div className="text-zinc-500 text-[10px] flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-yellow-500" />
                    <span>SLA Expiration: {new Date(task.slaExpiresAt).toLocaleString()}</span>
                  </div>
                </div>

                {task.status === 'PENDING' ? (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleApproveTask(task.taskId, 'APPROVE')}
                      className="bg-green-600 hover:bg-green-700 text-white font-bold px-3 py-1.5 rounded cursor-pointer transition-colors flex items-center space-x-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => handleApproveTask(task.taskId, 'REJECT')}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1.5 rounded cursor-pointer transition-colors flex items-center space-x-1"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  </div>
                ) : (
                  <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${task.status === 'APPROVED' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {task.status}
                  </span>
                )}
              </div>
            ))}

            {tasks.length === 0 && (
              <div className="text-zinc-500 text-center py-8">
                No pending approval tasks in queue.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: BUSINESS RULES */}
      {activeTab === 'rules' && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-4 font-mono text-xs">
          <h3 className="font-bold text-white text-xs border-b border-zinc-800 pb-2 flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-red-500" />
            <span>DECLARATIVE BUSINESS RULES ENGINE CONFIGURATOR</span>
          </h3>

          <div className="space-y-3">
            {[
              { ruleId: 'RULE-FIN-101', name: 'High Value Asset Retirement Finance Approval', priority: 10, condition: 'purchaseCost > 2000 USD', action: 'REQUIRE_FINANCE_APPROVAL' },
              { ruleId: 'RULE-SEC-202', name: 'Critical Database CI Data Wipe Security Verification', priority: 20, condition: 'criticality == CRITICAL', action: 'REQUIRE_SECURITY_APPROVAL' },
              { ruleId: 'RULE-COMP-303', name: 'Non-Compliant SAM License Escalation', priority: 30, condition: 'complianceStatus == NON_COMPLIANT', action: 'FLAG_COMPLIANCE' },
            ].map((rule, idx) => (
              <div key={idx} className="p-3 bg-black border border-zinc-800 rounded-lg flex items-center justify-between">
                <div>
                  <div className="font-bold text-white flex items-center space-x-2">
                    <span>{rule.name}</span>
                    <span className="px-2 py-0.5 bg-red-600/20 text-red-400 border border-red-500/30 rounded text-[10px] font-bold">
                      P{rule.priority}
                    </span>
                  </div>
                  <div className="text-zinc-400 text-[11px] mt-0.5">
                    Condition: <code className="text-green-400">{rule.condition}</code> | Action: <strong className="text-zinc-200">{rule.action}</strong>
                  </div>
                </div>

                <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-[10px] font-bold">ACTIVE</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: DRY RUN SIMULATOR */}
      {activeTab === 'dry_run' && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-4 font-mono text-xs">
          <h3 className="font-bold text-white text-xs border-b border-zinc-800 pb-2 flex items-center space-x-2">
            <Zap className="w-4 h-4 text-red-500" />
            <span>WORKFLOW DRY-RUN SIMULATION STUDIO ("WHAT IF" ANALYSIS)</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-3 bg-black p-3 border border-zinc-800 rounded-lg">
              <div>
                <label className="text-zinc-400 block mb-1">Target Asset ID:</label>
                <input
                  type="text"
                  value={simTargetAsset}
                  onChange={(e) => setSimTargetAsset(e.target.value)}
                  className="w-full bg-zinc-950 text-white border border-zinc-800 rounded px-2.5 py-1.5 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Asset Purchase Cost (USD):</label>
                <input
                  type="number"
                  value={simPurchaseCost}
                  onChange={(e) => setSimPurchaseCost(Number(e.target.value))}
                  className="w-full bg-zinc-950 text-white border border-zinc-800 rounded px-2.5 py-1.5 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Asset Criticality:</label>
                <select
                  value={simCriticality}
                  onChange={(e) => setSimCriticality(e.target.value)}
                  className="w-full bg-zinc-950 text-white border border-zinc-800 rounded px-2.5 py-1.5 text-xs focus:outline-none"
                >
                  <option value="CRITICAL">CRITICAL</option>
                  <option value="HIGH">HIGH</option>
                  <option value="STANDARD">STANDARD</option>
                </select>
              </div>

              <button
                onClick={handleRunDryRun}
                disabled={isSimulating}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded cursor-pointer transition-colors"
              >
                {isSimulating ? 'Simulating...' : 'Run Simulation'}
              </button>
            </div>

            <div className="md:col-span-2 space-y-2 bg-black p-3 border border-zinc-800 rounded-lg">
              <span className="text-zinc-400 block font-bold">Simulation Outcome & Predicted Chain:</span>
              {dryRunResult ? (
                <div className="space-y-2 text-zinc-300">
                  <div className="flex items-center space-x-2 text-green-400 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Dry Run Succeeded (Zero ITAM Data Modified)</span>
                  </div>

                  <div className="text-[11px] space-y-1 bg-zinc-950 p-3 border border-zinc-800 rounded">
                    <div>Target: <strong className="text-white">{dryRunResult.targetEntityId}</strong></div>
                    <div>Estimated Duration: <strong className="text-white">{dryRunResult.estimatedDurationHours} Hours</strong></div>
                    <div className="pt-1 font-bold text-white">Required Approval Chain:</div>
                    {dryRunResult.requiredApprovals.map((app, i) => (
                      <div key={i} className="flex items-center space-x-1 text-zinc-300">
                        <Check className="w-3 h-3 text-green-500" />
                        <span>{app}</span>
                      </div>
                    ))}

                    <div className="pt-1 font-bold text-white">Matched Rules:</div>
                    {dryRunResult.matchedRules.map((m, i) => (
                      <div key={i} className="flex items-center space-x-1 text-red-400">
                        <Zap className="w-3 h-3" />
                        <span>{m}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-zinc-600 py-8 text-center">
                  Configure asset parameters and click "Run Simulation" to forecast approvals and rule triggers.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: WORKFLOW TESTS */}
      {activeTab === 'tests' && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <h3 className="font-bold text-white text-xs flex items-center space-x-2">
              <Activity className="w-4 h-4 text-red-500" />
              <span>AUTOMATED WORKFLOW & RULES ENGINE TEST SUITE</span>
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
                Click "Run All 7 Tests" to execute Temporal durable state machine, approval SLAs, delegation, rules, and tenant isolation tests.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
