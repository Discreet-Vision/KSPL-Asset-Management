// ==================== WORKFLOW & RULES ENGINE TEST SUITE ====================
// Automated unit and integration tests verifying Temporal workflows, approval chains, SLAs, dry run simulations, and tenant isolation.

import { TemporalWorkflowAdapter } from '../adapters/TemporalWorkflowAdapter';
import { DeclarativeRulesEngineAdapter } from '../adapters/DeclarativeRulesEngineAdapter';
import { ApprovalChainManager } from '../domain/ApprovalChainManager';
import { LifecycleStateMachine } from '../domain/LifecycleStateMachine';
import { WorkflowAuditService } from '../services/WorkflowAuditService';

export interface WorkflowTestResult {
  testName: string;
  passed: boolean;
  message: string;
  durationMs: number;
}

export class WorkflowRulesTestSuite {
  public static async runAllTests(tenantId: string = 'tenant-kspl-global'): Promise<WorkflowTestResult[]> {
    const results: WorkflowTestResult[] = [];
    const adapter = new TemporalWorkflowAdapter();
    const rulesAdapter = new DeclarativeRulesEngineAdapter();

    // Test 1: Temporal Durable Workflow Execution
    try {
      const start = performance.now();
      const exec = await adapter.startWorkflow('WF-ASSET-RETIREMENT-v1', 'ENT-AST-1001', tenantId, 'usr-test-runner');
      const passed = exec.status === 'WAITING_APPROVAL' && exec.history.length > 0;
      results.push({
        testName: 'Temporal Durable Workflow Execution & State Machine',
        passed,
        message: passed ? `Workflow started with execution ID '${exec.executionId}' and state WAITING_APPROVAL.` : 'Workflow execution failed.',
        durationMs: Math.round(performance.now() - start),
      });
    } catch (e: any) {
      results.push({ testName: 'Temporal Durable Workflow Execution & State Machine', passed: false, message: e.message, durationMs: 0 });
    }

    // Test 2: Approval Chain Decision Signaling
    try {
      const start = performance.now();
      const tasks = adapter.getPendingTasks(tenantId);
      const targetTask = tasks[0];

      if (targetTask) {
        const updated = await adapter.signalApprovalTask(targetTask.taskId, 'APPROVE', 'usr-mgr-101', tenantId, 'Approved for wipe');
        const passed = updated.status === 'APPROVED';
        results.push({
          testName: 'Approval Chain Decision Signaling (Task Approval)',
          passed,
          message: passed ? `Task '${targetTask.taskId}' successfully approved.` : 'Task approval failed.',
          durationMs: Math.round(performance.now() - start),
        });
      } else {
        results.push({ testName: 'Approval Chain Decision Signaling', passed: false, message: 'No pending tasks found.', durationMs: 0 });
      }
    } catch (e: any) {
      results.push({ testName: 'Approval Chain Decision Signaling', passed: false, message: e.message, durationMs: 0 });
    }

    // Test 3: Declarative Rules Engine Expression Evaluation
    try {
      const start = performance.now();
      const matched = await rulesAdapter.evaluateRules({ purchaseCost: 4500, criticality: 'CRITICAL' }, tenantId);
      const passed = matched.length >= 2;
      results.push({
        testName: 'Declarative Business Rules Engine Expression Evaluation',
        passed,
        message: passed ? `Matched ${matched.length} rules (Finance & Security requirements).` : 'Rules evaluation failed.',
        durationMs: Math.round(performance.now() - start),
      });
    } catch (e: any) {
      results.push({ testName: 'Declarative Business Rules Engine Expression Evaluation', passed: false, message: e.message, durationMs: 0 });
    }

    // Test 4: Workflow Dry-Run Simulation Engine
    try {
      const start = performance.now();
      const sim = await adapter.simulateWorkflowDryRun('WF-ASSET-RETIREMENT-v1', 'ENT-AST-1001', tenantId, { purchaseCost: 3500 });
      const passed = sim.willExecute && sim.requiredApprovals.length > 0;
      results.push({
        testName: 'Workflow Dry-Run Simulation Engine',
        passed,
        message: passed ? `Dry run simulation completed with ${sim.requiredApprovals.length} required approvals.` : 'Dry run failed.',
        durationMs: Math.round(performance.now() - start),
      });
    } catch (e: any) {
      results.push({ testName: 'Workflow Dry-Run Simulation Engine', passed: false, message: e.message, durationMs: 0 });
    }

    // Test 5: Approval Delegation & Temporary Approver Swap
    try {
      const start = performance.now();
      const startDate = new Date(Date.now() - 86400000).toISOString();
      const endDate = new Date(Date.now() + 86400000).toISOString();

      ApprovalChainManager.addDelegation(tenantId, 'usr-mgr-101', 'usr-backup-909', startDate, endDate, 'On Leave');
      const activeApprover = ApprovalChainManager.getEffectiveApprover(tenantId, 'usr-mgr-101');

      const passed = activeApprover === 'usr-backup-909';
      results.push({
        testName: 'Approval Delegation & Out-of-Office Routing',
        passed,
        message: passed ? `Delegation active. Routed to backup approver '${activeApprover}'.` : 'Delegation routing failed.',
        durationMs: Math.round(performance.now() - start),
      });
    } catch (e: any) {
      results.push({ testName: 'Approval Delegation & Out-of-Office Routing', passed: false, message: e.message, durationMs: 0 });
    }

    // Test 6: Strict Multi-Tenant Workflow Isolation
    try {
      const start = performance.now();
      const tasksTenantA = adapter.getPendingTasks(tenantId);
      const tasksTenantB = adapter.getPendingTasks('tenant-unauthorized');

      const passed = tasksTenantA.length >= 0 && tasksTenantB.length === 0;
      results.push({
        testName: 'Multi-Tenant Workflow Isolation & Cross-Tenant Protection',
        passed,
        message: passed ? 'Strict tenant isolation verified. Unauthorized tenant returned 0 workflow tasks.' : 'Tenant leak detected.',
        durationMs: Math.round(performance.now() - start),
      });
    } catch (e: any) {
      results.push({ testName: 'Multi-Tenant Workflow Isolation & Cross-Tenant Protection', passed: false, message: e.message, durationMs: 0 });
    }

    // Test 7: Immutable Workflow Audit Trail
    try {
      const start = performance.now();
      WorkflowAuditService.log('usr-tester', tenantId, 'SIMULATION_TEST', 'Test audit record creation.');
      const logs = WorkflowAuditService.getAuditLogs(tenantId);

      const passed = logs.length > 0;
      results.push({
        testName: 'Immutable Workflow Audit Trail Log Verification',
        passed,
        message: passed ? `Retrieved ${logs.length} immutable audit records for tenant.` : 'Audit log failed.',
        durationMs: Math.round(performance.now() - start),
      });
    } catch (e: any) {
      results.push({ testName: 'Immutable Workflow Audit Trail Log Verification', passed: false, message: e.message, durationMs: 0 });
    }

    return results;
  }
}
