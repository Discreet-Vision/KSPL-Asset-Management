// ==================== AGGREGATE ROOT BASE ====================
// Domain-Driven Design Aggregate Root base class supporting entity identity and domain event queuing.

import { DomainEvent } from './DomainEvent';

export abstract class AggregateRoot {
  private _domainEvents: DomainEvent[] = [];

  constructor(
    public readonly id: string,
    public readonly tenantId: string
  ) {
    if (!id || !tenantId) {
      throw new Error('[DDD Security Exception] AggregateRoot requires non-empty id and tenantId.');
    }
  }

  protected addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }

  public getDomainEvents(): DomainEvent[] {
    return [...this._domainEvents];
  }

  public clearDomainEvents(): void {
    this._domainEvents = [];
  }
}
