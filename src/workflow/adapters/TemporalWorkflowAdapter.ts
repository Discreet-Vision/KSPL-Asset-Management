// ==================== TEMPORAL WORKFLOW ADAPTER ====================
// Durable execution workflow engine supporting Temporal.io pattern, long-running state machines, approval tasks, and SLAs.

import { WorkflowEngineInterface } from '../interfaces/WorkflowEngineInterface';
import { DeclarativeRulesEngineAdapter } from './DeclarativeRulesEngineAdapter';
import {
  WorkflowDefinition,
  WorkflowExecution,
  ApprovalTask,
  DryRunResult,
  WorkflowStep,
} from '../types/workflowTypes';

export class TemporalWorkflowAdapter implements WorkflowEngineInterface {
  private static definitions: Map<string, WorkflowDefinition> = new Map();
  private static executions: Map<string, WorkflowExecution> = new Map();
  private static tasks: Map<string, ApprovalTask> = new Map();

  private rulesEngine = new DeclarativeRulesEngineAdapter();

  constructor() {
    this.seedDefaultDefinitions();
  }

  private seedDefaultDefinitions() {
    if (TemporalWorkflowAdapter.definitions.size > 0) return;

    const retirementWf: WorkflowDefinition = {
      id: 'WF-ASSET-RETIREMENT-v1',
      name: 'Enterprise Asset Offboarding & Data Wipe Workflow',
      version: 1,
      description: 'Multi-stage approval chain for server and endpoint retirement with financial and security checks.',
      status: 'PUBLISHED',
      triggerType: 'ASSET_STATE',
      tenantId: 'tenant-kspl-global',
      steps: [
        {
          stepId: 'STEP-1-DEPT-MGR',
          stepName: 'Department Manager Approval',
          stepType: 'APPROVAL',
          assigneeRole: 'DEPARTMENT_MANAGER',
          approverUserId: 'usr-mgr-101',
          slaHours: 24,
          nextStepOnSuccess: 'STEP-2-FINANCE',
        },
        {
          stepId: 'STEP-2-FINANCE',
          stepName: 'Finance Capital Asset Review',
          stepType: 'APPROVAL',
          assigneeRole: 'FINANCE_CONTROLLER',
          approverUserId: 'usr-fin-202',
          slaHours: 48,
          nextStepOnSuccess: 'STEP-3-SEC-WIPE',
        },
        {
          stepId: 'STEP-3-SEC-WIPE',
          stepName: 'Security Automated Sanitization & Data Wipe',
          stepType: 'ACTION',
          actionType: 'DATA_WIPE',
          nextStepOnSuccess: 'STEP-4-RETIRE',
        },
        {
          stepId: 'STEP-4-RETIRE',
          stepName: 'Mark Asset Status Retired',
          stepType: 'ACTION',
          actionType: 'RETIRE_ASSET',
        },
      ],
    };

    TemporalWorkflowAdapter.definitions.set(`${retirementWf.tenantId}:${retirementWf.id}`, retirementWf);
  }

  public async registerWorkflow(definition: WorkflowDefinition): Promise<void> {
    const key = `${definition.tenantId}:${definition.id}`;
    TemporalWorkflowAdapter.definitions.set(key, definition);
  }

  public async startWorkflow(
    workflowId: string,
    targetEntityId: string,
    tenantId: string,
    initiatedBy: string,
    initialData: Record<string, any> = {}
  ): Promise<WorkflowExecution> {
    const key = `${tenantId}:${workflowId}`;
    const def = TemporalWorkflowAdapter.definitions.get(key);

    if (!def) {
      throw new Error(`Workflow definition '${workflowId}' not found for tenant '${tenantId}'.`);
    }

    const executionId = `exec-temporal-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const firstStep = def.steps[0];

    const execution: WorkflowExecution = {
      executionId,
      workflowId: def.id,
      workflowName: def.name,
      version: def.version,
      tenantId,
      status: firstStep.stepType === 'APPROVAL' ? 'WAITING_APPROVAL' : 'RUNNING',
      currentStepId: firstStep.stepId,
      startedAt: new Date().toISOString(),
      initiatedBy,
      targetEntityId,
      targetEntityType: 'ASSET',
      contextData: initialData,
      history: [
        {
          timestamp: new Date().toISOString(),
          stepId: firstStep.stepId,
          eventName: 'WORKFLOW_STARTED',
          details: `Durable execution initialized for target '${targetEntityId}'.`,
          performedBy: initiatedBy,
          status: 'RUNNING',
        },
      ],
    };

    TemporalWorkflowAdapter.executions.set(`${tenantId}:${executionId}`, execution);

    // If first step is an approval task, create it
    if (firstStep.stepType === 'APPROVAL') {
      const taskId = `task-${Date.now()}`;
      const slaExpiresAt = new Date(Date.now() + (firstStep.slaHours || 24) * 3600 * 1000).toISOString();

      const task: ApprovalTask = {
        taskId,
        executionId,
        workflowName: def.name,
        targetEntityId,
        assignedRole: firstStep.assigneeRole || 'APPROVER',
        assignedUserId: firstStep.approverUserId || 'usr-default',
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        slaExpiresAt,
        tenantId,
      };

      TemporalWorkflowAdapter.tasks.set(`${tenantId}:${taskId}`, task);
    }

    return execution;
  }

  public async signalApprovalTask(
    taskId: string,
    decision: 'APPROVE' | 'REJECT' | 'DELEGATE',
    userId: string,
    tenantId: string,
    comments?: string
  ): Promise<ApprovalTask> {
    const taskKey = `${tenantId}:${taskId}`;
    const task = TemporalWorkflowAdapter.tasks.get(taskKey);

    if (!task) {
      throw new Error(`Approval task '${taskId}' not found for tenant '${tenantId}'.`);
    }

    task.status = decision === 'APPROVE' ? 'APPROVED' : decision === 'REJECT' ? 'REJECTED' : 'PENDING';
    task.comments = comments;

    const execKey = `${tenantId}:${task.executionId}`;
    const execution = TemporalWorkflowAdapter.executions.get(execKey);

    if (execution) {
      execution.history.push({
        timestamp: new Date().toISOString(),
        stepId: execution.currentStepId,
        eventName: `TASK_${decision}`,
        details: `Approval task decision: '${decision}' by user '${userId}'.`,
        performedBy: userId,
        status: task.status,
      });

      if (decision === 'APPROVE') {
        execution.status = 'COMPLETED';
        execution.completedAt = new Date().toISOString();
      } else if (decision === 'REJECT') {
        execution.status = 'FAILED';
        execution.completedAt = new Date().toISOString();
      }
    }

    return task;
  }

  public async queryExecutionState(executionId: string, tenantId: string): Promise<WorkflowExecution | null> {
    return TemporalWorkflowAdapter.executions.get(`${tenantId}:${executionId}`) || null;
  }

  public async cancelExecution(executionId: string, tenantId: string, reason: string): Promise<boolean> {
    const exec = TemporalWorkflowAdapter.executions.get(`${tenantId}:${executionId}`);
    if (!exec) return false;

    exec.status = 'CANCELLED';
    exec.completedAt = new Date().toISOString();
    exec.history.push({
      timestamp: new Date().toISOString(),
      stepId: exec.currentStepId,
      eventName: 'WORKFLOW_CANCELLED',
      details: `Execution cancelled. Reason: ${reason}`,
      status: 'CANCELLED',
    });

    return true;
  }

  public async simulateWorkflowDryRun(
    workflowId: string,
    targetEntityId: string,
    tenantId: string,
    entityData: Record<string, any>
  ): Promise<DryRunResult> {
    const key = `${tenantId}:${workflowId}`;
    const def = TemporalWorkflowAdapter.definitions.get(key);

    const matchedRules = await this.rulesEngine.evaluateRules(entityData, tenantId);

    const requiredApprovals = def
      ? def.steps.filter((s) => s.stepType === 'APPROVAL').map((s) => s.stepName)
      : ['Manager Approval', 'Finance Review'];

    matchedRules.forEach((rule) => {
      if (rule.actionRequired === 'REQUIRE_FINANCE_APPROVAL') requiredApprovals.push('Finance Approval Rule Match');
      if (rule.actionRequired === 'REQUIRE_SECURITY_APPROVAL') requiredApprovals.push('Security Verification Rule Match');
    });

    return {
      workflowId,
      targetEntityId,
      tenantId,
      willExecute: true,
      requiredApprovals,
      matchedRules: matchedRules.map((r) => r.ruleName),
      estimatedDurationHours: 72,
      potentialActions: ['Data Wipe Sanitization', 'CMDB CI Record Status -> Retired', 'SLA Expiration Reminders'],
    };
  }

  public getPendingTasks(tenantId: string): ApprovalTask[] {
    const list: ApprovalTask[] = [];
    for (const [k, task] of TemporalWorkflowAdapter.tasks.entries()) {
      if (k.startsWith(`${tenantId}:`)) {
        list.push(task);
      }
    }
    return list;
  }

  public getAllExecutions(tenantId: string): WorkflowExecution[] {
    const list: WorkflowExecution[] = [];
    for (const [k, exec] of TemporalWorkflowAdapter.executions.entries()) {
      if (k.startsWith(`${tenantId}:`)) {
        list.push(exec);
      }
    }
    return list;
  }
}
