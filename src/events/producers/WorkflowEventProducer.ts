// ==================== WORKFLOW EVENT PRODUCER ====================
// Isolated event producer publishing workflow trigger events.

import { KafkaEventBusAdapter } from '../adapters/KafkaEventBusAdapter';
import { EventBusInterface } from '../interfaces/EventBusInterface';
import { StandardEventEnvelope } from '../types/cacheEventTypes';

export class WorkflowEventProducer {
  private static eventBus: EventBusInterface = new KafkaEventBusAdapter();

  public static async publishWorkflowTriggered(
    workflowName: string,
    targetAssetId: string,
    triggerSource: string,
    tenantId: string
  ): Promise<boolean> {
    const event: StandardEventEnvelope = {
      eventId: `evt-wf-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      eventType: 'workflow.triggered',
      tenantId,
      source: triggerSource,
      entityType: 'workflow',
      entityId: `wf-${Date.now()}`,
      timestamp: new Date().toISOString(),
      correlationId: `wf-exec-${Date.now()}`,
      version: '1.0',
      payload: {
        workflowName,
        targetAssetId,
        triggeredAt: new Date().toISOString(),
      },
    };

    return this.eventBus.publish('itam.workflow.events', event);
  }
}
