// ==================== WORKFLOW EVENT CONSUMER ====================
// Isolated consumer processing automated workflow triggers.

import { RedisCacheAdapter } from '../adapters/RedisCacheAdapter';
import { DeadLetterQueueService } from '../services/DeadLetterQueueService';
import { StandardEventEnvelope } from '../types/cacheEventTypes';

export class WorkflowEventConsumer {
  private static cacheAdapter = new RedisCacheAdapter();
  private static processedCount = 310;

  public static async processEvent(event: StandardEventEnvelope): Promise<boolean> {
    const { eventId, tenantId } = event;

    const alreadyProcessed = await this.cacheAdapter.hasProcessedEvent(eventId, tenantId);
    if (alreadyProcessed) return true;

    try {
      await this.cacheAdapter.markEventProcessed(eventId, tenantId);
      this.processedCount++;
      return true;
    } catch (err: any) {
      await DeadLetterQueueService.pushToDeadLetterQueue(
        event,
        'WorkflowEventConsumer',
        err.message || 'Workflow consumer failure'
      );
      return false;
    }
  }

  public static getProcessedCount(): number {
    return this.processedCount;
  }
}
