// ==================== EVENT BUS INTERFACE ====================
// Abstract interface decoupling ITAM business logic from event brokers (Kafka / RabbitMQ).

import { StandardEventEnvelope, KafkaClusterHealth } from '../types/cacheEventTypes';

export type EventHandler<T = any> = (event: StandardEventEnvelope<T>) => Promise<void>;

export interface EventBusInterface {
  connect(): Promise<boolean>;
  disconnect(): Promise<void>;

  // Event Publishing
  publish<T>(topic: string, event: StandardEventEnvelope<T>): Promise<boolean>;
  publishBatch<T>(topic: string, events: StandardEventEnvelope<T>[]): Promise<number>;

  // Event Consumption
  subscribe<T>(topic: string, consumerGroup: string, handler: EventHandler<T>): Promise<void>;

  // Cluster Monitoring
  clusterHealth(): Promise<KafkaClusterHealth>;
}
