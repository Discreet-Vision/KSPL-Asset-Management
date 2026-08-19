// ==================== WORKFLOW MODULE ====================
// Workflow Engine Bounded Context orchestrating automated asset onboarding, offboarding, and disposal steps.

import { AggregateRoot } from '../../shared/domain/AggregateRoot';
import { DomainEvent } from '../../shared/domain/DomainEvent';
import { ApiResponseEnvelope } from '../../common/types/enterpriseTypes';
import { EventBusPort } from '../../shared/ports/EventBusPort';

export interface WorkflowProps {
  id: string;
  name: string;
  triggerEvent: string;
  stepsCount: number;
  status: 'ACTIVE' | 'PAUSED' | 'EXECUTING';
  tenantId: string;
}

export class WorkflowTriggeredEvent extends DomainEvent<{ workflowName: string; targetId: string }> {
  constructor(aggregateId: string, tenantId: string, correlationId: string, workflowName: string, targetId: string) {
    super('WorkflowTriggered', aggregateId, 'workflow', tenantId, correlationId, { workflowName, targetId });
  }
}

export class WorkflowEntity extends AggregateRoot {
  private props: WorkflowProps;

  constructor(props: WorkflowProps) {
    super(props.id, props.tenantId);
    this.props = { ...props };
  }

  public triggerExecution(targetAssetId: string, correlationId: string): void {
    this.props.status = 'EXECUTING';
    this.addDomainEvent(new WorkflowTriggeredEvent(this.id, this.tenantId, correlationId, this.props.name, targetAssetId));
  }

  public toJSON() {
    return { ...this.props };
  }
}

export class InMemoryWorkflowRepository {
  private static store: Map<string, WorkflowEntity> = new Map();

  constructor() {
    this.seedDefaults();
  }

  private seedDefaults() {
    if (InMemoryWorkflowRepository.store.size > 0) return;
    const wf1 = new WorkflowEntity({
      id: 'WF-OFFBOARD-01',
      name: 'Automated Employee Offboarding Hardware Wipe Workflow',
      triggerEvent: 'asset.retired',
      stepsCount: 5,
      status: 'ACTIVE',
      tenantId: 'tenant-kspl-global',
    });

    const wf2 = new WorkflowEntity({
      id: 'WF-DISCOVERY-RECON',
      name: 'Automated CMDB Reconciliation on Unregistered Device Discovery',
      triggerEvent: 'asset.discovered',
      stepsCount: 3,
      status: 'ACTIVE',
      tenantId: 'tenant-kspl-global',
    });

    InMemoryWorkflowRepository.store.set('tenant-kspl-global:WF-OFFBOARD-01', wf1);
    InMemoryWorkflowRepository.store.set('tenant-kspl-global:WF-DISCOVERY-RECON', wf2);
  }

  public async findAll(tenantId: string): Promise<WorkflowEntity[]> {
    const list: WorkflowEntity[] = [];
    for (const [k, wf] of InMemoryWorkflowRepository.store.entries()) {
      if (k.startsWith(`${tenantId}:`)) list.push(wf);
    }
    return list;
  }
}

export class WorkflowController {
  constructor(
    private readonly wfRepo: InMemoryWorkflowRepository,
    private readonly eventBus: EventBusPort
  ) {}

  public async getWorkflows(tenantId: string, correlationId: string): Promise<ApiResponseEnvelope> {
    const workflows = await this.wfRepo.findAll(tenantId);
    return {
      success: true,
      statusCode: 200,
      data: workflows.map((w) => w.toJSON()),
      meta: {
        requestId: `req-wf-${Date.now()}`,
        correlationId,
        timestamp: new Date().toISOString(),
        domain: 'workflow',
        tenantId,
        executionTimeMs: 2,
      },
    };
  }

  public async triggerWorkflow(wfId: string, targetId: string, tenantId: string, correlationId: string): Promise<ApiResponseEnvelope> {
    const workflows = await this.wfRepo.findAll(tenantId);
    const wf = workflows.find((w) => w.id === wfId);

    if (!wf) {
      return {
        success: false,
        statusCode: 404,
        data: null,
        meta: { requestId: `req-wf-err-${Date.now()}`, correlationId, timestamp: new Date().toISOString(), domain: 'workflow', tenantId, executionTimeMs: 1 },
        error: { code: 'NOT_FOUND', message: `Workflow '${wfId}' not found.` },
      };
    }

    wf.triggerExecution(targetId || 'ASSET-8812', correlationId);
    await this.eventBus.publishAll(wf.getDomainEvents());
    wf.clearDomainEvents();

    return {
      success: true,
      statusCode: 202,
      data: wf.toJSON(),
      meta: {
        requestId: `req-wf-trig-${Date.now()}`,
        correlationId,
        timestamp: new Date().toISOString(),
        domain: 'workflow',
        tenantId,
        executionTimeMs: 6,
      },
    };
  }
}

export class WorkflowModule {
  public static repository = new InMemoryWorkflowRepository();

  public static getController(eventBus: EventBusPort): WorkflowController {
    return new WorkflowController(this.repository, eventBus);
  }
}
