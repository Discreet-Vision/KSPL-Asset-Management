// ==================== WORKFLOW ENGINE INTERFACE ====================
// Abstract interface for Temporal.io / Camunda BPMN workflow engines.

import {
  WorkflowDefinition,
  WorkflowExecution,
  ApprovalTask,
  DryRunResult,
} from '../types/workflowTypes';

export interface WorkflowEngineInterface {
  registerWorkflow(definition: WorkflowDefinition): Promise<void>;
  startWorkflow(
    workflowId: string,
    targetEntityId: string,
    tenantId: string,
    initiatedBy: string,
    initialData?: Record<string, any>
  ): Promise<WorkflowExecution>;

  signalApprovalTask(
    taskId: string,
    decision: 'APPROVE' | 'REJECT' | 'DELEGATE',
    userId: string,
    tenantId: string,
    comments?: string
  ): Promise<ApprovalTask>;

  queryExecutionState(executionId: string, tenantId: string): Promise<WorkflowExecution | null>;
  cancelExecution(executionId: string, tenantId: string, reason: string): Promise<boolean>;
  simulateWorkflowDryRun(workflowId: string, targetEntityId: string, tenantId: string, entityData: Record<string, any>): Promise<DryRunResult>;
}
