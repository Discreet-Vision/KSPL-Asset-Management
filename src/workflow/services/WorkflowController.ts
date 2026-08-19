// ==================== WORKFLOW REST CONTROLLER ====================
// REST API Controller exposing /api/v1/workflows and /api/v1/workflow-tasks endpoints.

import { TemporalWorkflowAdapter } from '../adapters/TemporalWorkflowAdapter';
import { DeclarativeRulesEngineAdapter } from '../adapters/DeclarativeRulesEngineAdapter';
import { WorkflowAuditService } from './WorkflowAuditService';
import { ApiResponseEnvelope } from '../../enterprise/common/types/enterpriseTypes';

export class WorkflowController {
  private adapter = new TemporalWorkflowAdapter();
  private rulesEngine = new DeclarativeRulesEngineAdapter();

  public async getExecutions(tenantId: string, correlationId: string): Promise<ApiResponseEnvelope> {
    const execs = this.adapter.getAllExecutions(tenantId);
    return {
      success: true,
      statusCode: 200,
      data: execs,
      meta: {
        requestId: `req-wf-exec-${Date.now()}`,
        correlationId,
        timestamp: new Date().toISOString(),
        domain: 'workflow_engine',
        tenantId,
        executionTimeMs: 2,
      },
    };
  }

  public async getPendingTasks(tenantId: string, correlationId: string): Promise<ApiResponseEnvelope> {
    const tasks = this.adapter.getPendingTasks(tenantId);
    return {
      success: true,
      statusCode: 200,
      data: tasks,
      meta: {
        requestId: `req-wf-tasks-${Date.now()}`,
        correlationId,
        timestamp: new Date().toISOString(),
        domain: 'workflow_engine',
        tenantId,
        executionTimeMs: 2,
      },
    };
  }

  public async executeWorkflow(
    workflowId: string,
    targetEntityId: string,
    tenantId: string,
    initiatedBy: string,
    correlationId: string
  ): Promise<ApiResponseEnvelope> {
    const execution = await this.adapter.startWorkflow(workflowId, targetEntityId, tenantId, initiatedBy);
    WorkflowAuditService.log(initiatedBy, tenantId, 'WORKFLOW_STARTED', `Started workflow '${workflowId}' for target '${targetEntityId}'.`, correlationId);

    return {
      success: true,
      statusCode: 201,
      data: execution,
      meta: {
        requestId: `req-wf-start-${Date.now()}`,
        correlationId,
        timestamp: new Date().toISOString(),
        domain: 'workflow_engine',
        tenantId,
        executionTimeMs: 6,
      },
    };
  }

  public async approveTask(
    taskId: string,
    decision: 'APPROVE' | 'REJECT' | 'DELEGATE',
    userId: string,
    tenantId: string,
    correlationId: string,
    comments?: string
  ): Promise<ApiResponseEnvelope> {
    const task = await this.adapter.signalApprovalTask(taskId, decision, userId, tenantId, comments);
    WorkflowAuditService.log(userId, tenantId, `TASK_${decision}`, `Task '${taskId}' set to ${decision}. Comments: ${comments || 'None'}`, correlationId);

    return {
      success: true,
      statusCode: 200,
      data: task,
      meta: {
        requestId: `req-wf-appr-${Date.now()}`,
        correlationId,
        timestamp: new Date().toISOString(),
        domain: 'workflow_engine',
        tenantId,
        executionTimeMs: 4,
      },
    };
  }

  public async simulateDryRun(
    workflowId: string,
    targetEntityId: string,
    tenantId: string,
    entityData: Record<string, any>,
    correlationId: string
  ): Promise<ApiResponseEnvelope> {
    const dryRun = await this.adapter.simulateWorkflowDryRun(workflowId, targetEntityId, tenantId, entityData);

    return {
      success: true,
      statusCode: 200,
      data: dryRun,
      meta: {
        requestId: `req-wf-dry-${Date.now()}`,
        correlationId,
        timestamp: new Date().toISOString(),
        domain: 'workflow_engine',
        tenantId,
        executionTimeMs: 5,
      },
    };
  }
}
