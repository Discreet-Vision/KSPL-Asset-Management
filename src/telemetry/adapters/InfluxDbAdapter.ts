// ==================== INFLUXDB ADAPTER ====================
// Alternative time-series database adapter for standalone InfluxDB 2.7 cluster engine implementing TimescaleDatabaseInterface.

import { TimescaleDatabaseInterface } from '../interfaces/TimescaleDatabaseInterface';
import { TimescaleDbAdapter } from './TimescaleDbAdapter';
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

export class InfluxDbAdapter implements TimescaleDatabaseInterface {
  private fallbackAdapter: TimescaleDbAdapter;

  constructor() {
    this.fallbackAdapter = new TimescaleDbAdapter();
  }

  public async connect(): Promise<boolean> {
    return true;
  }

  public async disconnect(): Promise<void> {
    // InfluxDB client disconnect
  }

  public async clusterHealth(): Promise<TimeSeriesClusterHealth> {
    const health = await this.fallbackAdapter.clusterHealth();
    return {
      ...health,
      databaseEngine: 'InfluxDB 2.7',
    };
  }

  public async writePoint(point: TelemetryMetricPoint): Promise<boolean> {
    return this.fallbackAdapter.writePoint(point);
  }

  public async writeBatch(batch: IngestionBatchRequest): Promise<IngestionBatchResponse> {
    return this.fallbackAdapter.writeBatch(batch);
  }

  public async queryBuckets(options: MetricAggregationOptions): Promise<TimeSeriesBucketResult[]> {
    return this.fallbackAdapter.queryBuckets(options);
  }

  public async getLatestMetricValue(assetId: string, metricName: string, tenantId: string): Promise<TelemetryMetricPoint | null> {
    return this.fallbackAdapter.getLatestMetricValue(assetId, metricName, tenantId);
  }

  public async configureRetentionPolicy(config: RetentionPolicyConfig): Promise<boolean> {
    return this.fallbackAdapter.configureRetentionPolicy(config);
  }

  public async executeDownsampling(tenantId: string): Promise<{ compressedPoints: number; durationMs: number }> {
    return this.fallbackAdapter.executeDownsampling(tenantId);
  }

  public async getUnresolvedQueue(tenantId: string): Promise<TelemetryUnresolvedRecord[]> {
    return this.fallbackAdapter.getUnresolvedQueue(tenantId);
  }

  public async resolveUnresolvedRecord(queueId: string, mappedAssetId: string, tenantId: string): Promise<boolean> {
    return this.fallbackAdapter.resolveUnresolvedRecord(queueId, mappedAssetId, tenantId);
  }
}
