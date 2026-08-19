// ==================== ASSET EVENT PRODUCER ====================
// Isolated event producer publishing asset lifecycle updates and retirement events.

import { KafkaEventBusAdapter } from '../adapters/KafkaEventBusAdapter';
import { EventBusInterface } from '../interfaces/EventBusInterface';
import { StandardEventEnvelope } from '../types/cacheEventTypes';

export class AssetEventProducer {
  private static eventBus: EventBusInterface = new KafkaEventBusAdapter();

  public static async publishAssetUpdated(
    assetId: string,
    changes: Record<string, any>,
    tenantId: string
  ): Promise<boolean> {
    const event: StandardEventEnvelope = {
      eventId: `evt-asset-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      eventType: 'asset.updated',
      tenantId,
      source: 'ITAM-Inventory-Service',
      entityType: 'asset',
      entityId: assetId,
      timestamp: new Date().toISOString(),
      correlationId: `asset-upd-${Date.now()}`,
      version: '1.0',
      payload: {
        assetId,
        updatedFields: changes,
        updatedAt: new Date().toISOString(),
      },
    };

    return this.eventBus.publish('itam.asset.events', event);
  }

  public static async publishAssetRetired(
    assetId: string,
    disposalReason: string,
    tenantId: string
  ): Promise<boolean> {
    const event: StandardEventEnvelope = {
      eventId: `evt-retire-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      eventType: 'asset.retired',
      tenantId,
      source: 'ITAM-Asset-Lifecycle-Manager',
      entityType: 'asset',
      entityId: assetId,
      timestamp: new Date().toISOString(),
      correlationId: `retire-job-${Date.now()}`,
      version: '1.0',
      payload: {
        assetId,
        disposalReason,
        retiredAt: new Date().toISOString(),
      },
    };

    return this.eventBus.publish('itam.asset.events', event);
  }
}
