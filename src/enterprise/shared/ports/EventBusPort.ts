// ==================== EVENT BUS PORT ====================
// Abstract interface for enterprise DDD domain event publishing and subscription.

import { DomainEvent } from '../domain/DomainEvent';

export type DomainEventHandler<T = any> = (event: DomainEvent<T>) => Promise<void>;

export interface EventBusPort {
  publish(event: DomainEvent): Promise<void>;
  publishAll(events: DomainEvent[]): Promise<void>;
  subscribe(eventName: string, handler: DomainEventHandler): void;
}
