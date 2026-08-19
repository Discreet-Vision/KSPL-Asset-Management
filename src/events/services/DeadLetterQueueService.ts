// ==================== DEAD LETTER QUEUE SERVICE ====================
// Isolated DLQ service storing failed events with inspection, retry, replay, and discard capabilities.

import { DeadLetterEventRecord, StandardEventEnvelope } from '../types/cacheEventTypes';

export class DeadLetterQueueService {
  private static dlqStore: DeadLetterEventRecord[] = [
    {
      dlqId: 'dlq-evt-001',
      originalEvent: {
        eventId: 'evt-disc-failed-901',
        eventType: 'asset.discovered',
        tenantId: 'tenant-kspl-global',
        source: 'Discovery-Agent-v3.2',
        entityType: 'asset',
        entityId: 'ASSET-99999',
        timestamp: new Date().toISOString(),
        correlationId: 'corr-failed-11',
        version: '1.0',
        payload: { assetId: 'ASSET-99999', assetName: 'Unregistered Switch' },
      },
      failedConsumerName: 'DiscoveryEventConsumer',
      failureReason: 'Database Lock Timeout during CMDB graph sync',
      attemptCount: 3,
      firstFailedAt: new Date(Date.now() - 3600000).toISOString(),
      lastFailedAt: new Date().toISOString(),
      status: 'QUEUED',
      tenantId: 'tenant-kspl-global',
    },
  ];

  public static async pushToDeadLetterQueue(
    event: StandardEventEnvelope,
    failedConsumerName: string,
    failureReason: string
  ): Promise<DeadLetterEventRecord> {
    const existing = this.dlqStore.find((d) => d.originalEvent.eventId === event.eventId);

    if (existing) {
      existing.attemptCount++;
      existing.lastFailedAt = new Date().toISOString();
      existing.failureReason = failureReason;
      return existing;
    }

    const newRecord: DeadLetterEventRecord = {
      dlqId: `dlq-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      originalEvent: event,
      failedConsumerName,
      failureReason,
      attemptCount: 1,
      firstFailedAt: new Date().toISOString(),
      lastFailedAt: new Date().toISOString(),
      status: 'QUEUED',
      tenantId: event.tenantId,
    };

    this.dlqStore.unshift(newRecord);
    return newRecord;
  }

  public static getDeadLetterEvents(tenantId: string): DeadLetterEventRecord[] {
    return this.dlqStore.filter((d) => d.tenantId === tenantId);
  }

  public static async replayDeadLetterEvent(dlqId: string, tenantId: string): Promise<boolean> {
    const record = this.dlqStore.find((d) => d.dlqId === dlqId && d.tenantId === tenantId);
    if (!record) return false;

    record.status = 'REPLAYED';
    return true;
  }

  public static async discardDeadLetterEvent(dlqId: string, tenantId: string): Promise<boolean> {
    const record = this.dlqStore.find((d) => d.dlqId === dlqId && d.tenantId === tenantId);
    if (!record) return false;

    record.status = 'DISCARDED';
    return true;
  }
}
