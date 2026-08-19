// ==================== IN-MEMORY EVENT BUS ADAPTER ====================
// Enterprise Event Bus adapter dispatching domain events to registered handlers.

import { EventBusPort, DomainEventHandler } from '../ports/EventBusPort';
import { DomainEvent } from '../domain/DomainEvent';

export class InMemoryEventBusAdapter implements EventBusPort {
  private handlers: Map<string, DomainEventHandler[]> = new Map();
  private eventHistory: DomainEvent[] = [];

  public async publish(event: DomainEvent): Promise<void> {
    this.eventHistory.unshift(event);
    const subscribers = this.handlers.get(event.eventName) || [];
    for (const handler of subscribers) {
      try {
        await handler(event);
      } catch (err) {
        console.error(`[EventBus] Error handling domain event ${event.eventName}:`, err);
      }
    }
  }

  public async publishAll(events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      await this.publish(event);
    }
  }

  public subscribe(eventName: string, handler: DomainEventHandler): void {
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, []);
    }
    this.handlers.get(eventName)!.push(handler);
  }

  public getEventHistory(): DomainEvent[] {
    return [...this.eventHistory];
  }
}
