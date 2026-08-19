// ==================== TIMESCALE DATABASE INTERFACE ====================
// Abstract interface decoupling ITAM business logic from the underlying time-series store engine (TimescaleDB hypertable vs InfluxDB).

import {
  TelemetryMetricPoint,
  IngestionBatchRequest,
  IngestionBatchResponse,
  MetricAggregationOptions,
  TimeSeriesBucketResult,
  TimeSeriesClusterHealth,
  RetentionPolicyConfig,
  TelemetryUnresolvedRecord,
} from '../types/telemetryTypes';

export interface TimescaleDatabaseInterface {
  connect(): Promise<boolean>;
  disconnect(): Promise<void>;
  clusterHealth(): Promise<TimeSeriesClusterHealth>;

  // Data Ingestion
  writePoint(point: TelemetryMetricPoint): Promise<boolean>;
  writeBatch(batch: IngestionBatchRequest): Promise<IngestionBatchResponse>;

  // Historical Query & Downsampling Aggregation
  queryBuckets(options: MetricAggregationOptions): Promise<TimeSeriesBucketResult[]>;
  getLatestMetricValue(assetId: string, metricName: string, tenantId: string): Promise<TelemetryMetricPoint | null>;

  // Retention & Policy Management
  configureRetentionPolicy(config: RetentionPolicyConfig): Promise<boolean>;
  executeDownsampling(tenantId: string): Promise<{ compressedPoints: number; durationMs: number }>;

  // Asset Linking & Unresolved Queue
  getUnresolvedQueue(tenantId: string): Promise<TelemetryUnresolvedRecord[]>;
  resolveUnresolvedRecord(queueId: string, mappedAssetId: string, tenantId: string): Promise<boolean>;
}
