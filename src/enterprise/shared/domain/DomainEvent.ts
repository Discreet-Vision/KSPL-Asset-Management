// ==================== SHARED DOMAIN EVENT ====================
// Base Domain Event class for all DDD bounded contexts.

import { DomainEventPayload } from '../../common/types/enterpriseTypes';

export abstract class DomainEvent<T = any> {
  public readonly eventId: string;
  public readonly timestamp: string;

  constructor(
    public readonly eventName: string,
    public readonly aggregateId: string,
    public readonly domain: string,
    public readonly tenantId: string,
    public readonly correlationId: string,
    public readonly data: T
  ) {
    this.eventId = `evt-${domain}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    this.timestamp = new Date().toISOString();
  }

  public toPayload(): DomainEventPayload<T> {
    return {
      eventId: this.eventId,
      eventName: this.eventName,
      aggregateId: this.aggregateId,
      domain: this.domain,
      tenantId: this.tenantId,
      timestamp: this.timestamp,
      correlationId: this.correlationId,
      data: this.data,
    };
  }
}
