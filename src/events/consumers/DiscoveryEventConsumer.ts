// ==================== DISCOVERY EVENT CONSUMER ====================
// Isolated consumer for 'itam.discovery.events' enforcing idempotency, cache invalidation, and DLQ routing on failure.

import { RedisCacheAdapter } from '../adapters/RedisCacheAdapter';
import { DeadLetterQueueService } from '../services/DeadLetterQueueService';
import { StandardEventEnvelope } from '../types/cacheEventTypes';

export class DiscoveryEventConsumer {
  private static cacheAdapter = new RedisCacheAdapter();
  private static processedCount = 420;

  /**
   * Processes incoming 'asset.discovered' event
   */
  public static async processEvent(event: StandardEventEnvelope): Promise<boolean> {
    const { eventId, tenantId, entityId } = event;

    // 1. Idempotency Check: Ignore duplicate event processing
    const alreadyProcessed = await this.cacheAdapter.hasProcessedEvent(eventId, tenantId);
    if (alreadyProcessed) {
      console.log(`[DiscoveryEventConsumer] Duplicate event detected. Skipping eventId: ${eventId}`);
      return true;
    }

    try {
      // 2. Business Execution (e.g. Cache Invalidation for Asset/Discovery)
      await this.cacheAdapter.invalidatePrefix(`asset:${entityId}`, tenantId);
      await this.cacheAdapter.invalidatePrefix(`search:`, tenantId);

      // 3. Mark Event Processed in Redis
      await this.cacheAdapter.markEventProcessed(eventId, tenantId);
      this.processedCount++;

      return true;
    } catch (err: any) {
      // 4. Dead Letter Queue Routing on Failure
      await DeadLetterQueueService.pushToDeadLetterQueue(
        event,
        'DiscoveryEventConsumer',
        err.message || 'Processing failure'
      );
      return false;
    }
  }

  public static getProcessedCount(): number {
    return this.processedCount;
  }
}
