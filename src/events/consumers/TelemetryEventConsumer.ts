// ==================== TELEMETRY EVENT CONSUMER ====================
// Isolated consumer processing high-volume telemetry streams from Kafka.

import { RedisCacheAdapter } from '../adapters/RedisCacheAdapter';
import { DeadLetterQueueService } from '../services/DeadLetterQueueService';
import { StandardEventEnvelope } from '../types/cacheEventTypes';

export class TelemetryEventConsumer {
  private static cacheAdapter = new RedisCacheAdapter();
  private static processedCount = 14200;

  public static async processEvent(event: StandardEventEnvelope): Promise<boolean> {
    const { eventId, tenantId } = event;

    const alreadyProcessed = await this.cacheAdapter.hasProcessedEvent(eventId, tenantId);
    if (alreadyProcessed) return true;

    try {
      await this.cacheAdapter.markEventProcessed(eventId, tenantId, 3600);
      this.processedCount++;
      return true;
    } catch (err: any) {
      await DeadLetterQueueService.pushToDeadLetterQueue(
        event,
        'TelemetryEventConsumer',
        err.message || 'Telemetry stream failure'
      );
      return false;
    }
  }

  public static getProcessedCount(): number {
    return this.processedCount;
  }
}
