// ==================== TELEMETRY EVENT PRODUCER ====================
// Isolated event producer publishing high-volume metric events to Kafka.

import { KafkaEventBusAdapter } from '../adapters/KafkaEventBusAdapter';
import { EventBusInterface } from '../interfaces/EventBusInterface';
import { StandardEventEnvelope } from '../types/cacheEventTypes';

export class TelemetryEventProducer {
  private static eventBus: EventBusInterface = new KafkaEventBusAdapter();

  public static async publishTelemetryReceived(
    assetId: string,
    metricName: string,
    metricValue: number,
    tenantId: string
  ): Promise<boolean> {
    const event: StandardEventEnvelope = {
      eventId: `evt-telem-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      eventType: 'telemetry.received',
      tenantId,
      source: 'Telemetry-Ingest-Worker',
      entityType: 'telemetry',
      entityId: assetId,
      timestamp: new Date().toISOString(),
      correlationId: `telem-stream-${Date.now()}`,
      version: '1.0',
      payload: {
        assetId,
        metricName,
        metricValue,
        receivedAt: new Date().toISOString(),
      },
    };

    return this.eventBus.publish('itam.telemetry.events', event);
  }
}
