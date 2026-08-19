// ==================== ASSET EVENT CONSUMER ====================
// Isolated consumer for 'itam.asset.events' updating cache states and triggering downstream workflows on retirement.

import { RedisCacheAdapter } from '../adapters/RedisCacheAdapter';
import { WorkflowEventProducer } from '../producers/WorkflowEventProducer';
import { DeadLetterQueueService } from '../services/DeadLetterQueueService';
import { StandardEventEnvelope } from '../types/cacheEventTypes';

export class AssetEventConsumer {
  private static cacheAdapter = new RedisCacheAdapter();
  private static processedCount = 890;

  public static async processEvent(event: StandardEventEnvelope): Promise<boolean> {
    const { eventId, tenantId, entityId, eventType, payload } = event;

    const alreadyProcessed = await this.cacheAdapter.hasProcessedEvent(eventId, tenantId);
    if (alreadyProcessed) return true;

    try {
      // Invalidate Asset Cache
      await this.cacheAdapter.invalidatePrefix(`asset:${entityId}`, tenantId);

      // If Asset Retired, publish Workflow Trigger
      if (eventType === 'asset.retired') {
        await WorkflowEventProducer.publishWorkflowTriggered(
          'Asset Hardware Disposal & Wipe Workflow',
          entityId,
          'AssetEventConsumer',
          tenantId
        );
      }

      await this.cacheAdapter.markEventProcessed(eventId, tenantId);
      this.processedCount++;
      return true;
    } catch (err: any) {
      await DeadLetterQueueService.pushToDeadLetterQueue(
        event,
        'AssetEventConsumer',
        err.message || 'Asset event processing failure'
      );
      return false;
    }
  }

  public static getProcessedCount(): number {
    return this.processedCount;
  }
}
