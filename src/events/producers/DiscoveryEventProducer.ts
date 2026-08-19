// ==================== DISCOVERY EVENT PRODUCER ====================
// Isolated event producer publishing high-volume discovery scanner events without modifying existing discovery code.

import { KafkaEventBusAdapter } from '../adapters/KafkaEventBusAdapter';
import { EventBusInterface } from '../interfaces/EventBusInterface';
import { StandardEventEnvelope } from '../types/cacheEventTypes';

export class DiscoveryEventProducer {
  private static eventBus: EventBusInterface = new KafkaEventBusAdapter();

  /**
   * Publishes 'asset.discovered' event to Kafka topic 'itam.discovery.events'
   */
  public static async publishDiscoveredAsset(
    assetId: string,
    assetName: string,
    ipAddress: string,
    macAddress: string,
    tenantId: string
  ): Promise<boolean> {
    const event: StandardEventEnvelope = {
      eventId: `evt-disc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      eventType: 'asset.discovered',
      tenantId,
      source: 'Discovery-Agent-v3.2',
      entityType: 'asset',
      entityId: assetId,
      timestamp: new Date().toISOString(),
      correlationId: `disc-job-${Date.now()}`,
      version: '1.0',
      payload: {
        assetId,
        assetName,
        ipAddress,
        macAddress,
        discoveryMethod: 'Subnet Ping Sweep & SNMP v3',
        discoveredAt: new Date().toISOString(),
      },
    };

    return this.eventBus.publish('itam.discovery.events', event);
  }
}
