// ==================== TIME-SERIES & TELEMETRY LAYER TYPES ====================
// Isolated Time-Series Data Model for ITAM / CMDB telemetry, historical metrics, and predictive forecasting.

export type MetricUnit =
  | 'percent'
  | 'megabytes'
  | 'gigabytes'
  | 'terabytes'
  | 'celsius'
  | 'fahrenheit'
  | 'milliseconds'
  | 'bits_per_sec'
  | 'bytes_per_sec'
  | 'count'
  | 'cycles'
  | 'volts'
  | 'seconds';

export type MetricCategory =
  | 'CPU'
  | 'MEMORY'
  | 'DISK'
  | 'NETWORK'
  | 'BATTERY'
  | 'TEMPERATURE'
  | 'PROCESS'
  | 'SYSTEM_UPTIME'
  | 'STORAGE_GROWTH';

export interface TelemetryMetricPoint {
  id: string; // Unique point UUID
  tenantId: string;
  organizationId: string;
  assetId: string; // Authoritative asset ID e.g. "ASSET-10025"
  ciId?: string; // Authoritative CI ID e.g. "ci-srv-9001"
  deviceId?: string;
  metricName: string; // e.g. "cpu_usage", "memory_used_mb", "battery_health_pct"
  category: MetricCategory;
  metricValue: number;
  metricUnit: MetricUnit;
  eventTimestamp: string; // ISO 8601 UTC
  collectionTimestamp: string;
  ingestionTimestamp: string;
  source: 'Endpoint Agent' | 'SNMP' | 'WMI' | 'Cloud API' | 'External Monitoring';
  collectionMethod: string;
  tags?: Record<string, string>;
}

export interface IngestionBatchRequest {
  tenantId: string;
  source: string;
  metrics: Omit<TelemetryMetricPoint, 'id' | 'ingestionTimestamp'>[];
}

export interface IngestionBatchResponse {
  totalReceived: number;
  successfullyIngested: number;
  rejectedCount: number;
  unresolvedAssetCount: number;
  executionTimeMs: number;
  rejectedReasons: string[];
}

export interface MetricAggregationOptions {
  assetId: string;
  metricName: string;
  timeRange: '5m' | '1h' | '24h' | '7d' | '30d' | '90d' | '1y' | 'custom';
  startTime?: string;
  endTime?: string;
  bucketInterval: '1m' | '5m' | '1h' | '1d' | '1w';
  aggregationFunction: 'AVG' | 'MIN' | 'MAX' | 'SUM' | 'COUNT' | 'P95';
  tenantId: string;
}

export interface TimeSeriesBucketResult {
  bucketTimestamp: string;
  avgValue: number;
  minValue: number;
  maxValue: number;
  sampleCount: number;
}

export interface HistoricalPerformanceSummary {
  assetId: string;
  metricName: string;
  currentValue: number;
  metricUnit: MetricUnit;
  avg24h: number;
  max24h: number;
  min24h: number;
  trendPercentage30d: number; // e.g. +14.2%
  timeSeriesData: TimeSeriesBucketResult[];
}

export interface CapacityForecastResult {
  assetId: string;
  assetName: string;
  metricCategory: MetricCategory;
  currentCapacityPct: number;
  dailyGrowthRatePct: number;
  forecastedThresholdPct: number; // e.g. 90% or 100%
  daysUntilExhaustion: number; // e.g. 14 days
  estimatedThresholdDate: string;
  confidenceScore: number; // 0 - 100
  recommendation: string;
  calculatedAt: string;
}

export interface PredictiveMaintenanceAlert {
  id: string;
  assetId: string;
  assetName: string;
  serialNumber?: string;
  riskCategory: 'HARDWARE_FAILURE' | 'BATTERY_DEGRADATION' | 'DISK_EXHAUSTION' | 'OVERHEATING' | 'EOL_EXPIRY';
  failureRiskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  failureRiskScore: number; // 0 - 100
  confidencePct: number;
  estimatedFailureWindow: string; // e.g. "30 - 45 days"
  contributingTelemetrySignals: string[];
  recommendedAction: string;
  tenantId: string;
  detectedAt: string;
}

export interface RetentionPolicyConfig {
  tenantId: string;
  rawRetentionDays: number; // e.g. 30
  hourlyRetentionDays: number; // e.g. 365
  dailyRetentionDays: number; // e.g. 1825
  downsamplingEnabled: boolean;
  autoCompressionEnabled: boolean;
}

export interface TimeSeriesClusterHealth {
  status: 'ONLINE' | 'DEGRADED' | 'MAINTENANCE';
  databaseEngine: 'TimescaleDB 2.14 (PostgreSQL Hypertable)' | 'InfluxDB 2.7';
  activeHypertablesCount: number;
  totalMetricPointsCount: number;
  storageSizeBytes: number;
  ingestionThroughputPerSec: number;
  queryLatencyMs: number;
  compressionRatioPct: number;
  lastRetentionPurgeAt: string;
}

export interface TelemetryUnresolvedRecord {
  id: string;
  tenantId: string;
  sourceIdentifier: string; // e.g. MAC address, unknown serial
  rawMetricPayload: any;
  receivedAt: string;
  reason: 'ASSET_NOT_MATCHED' | 'INVALID_TENANT' | 'MALFORMED_TIMESTAMP';
}

export interface TelemetryAuditRecord {
  id: string;
  timestamp: string;
  userId: string;
  tenantId: string;
  operation: 'TELEMETRY_INGEST' | 'HISTORICAL_QUERY' | 'FORECAST_RUN' | 'EXPORT_METRICS' | 'ADMIN_PURGE';
  recordsProcessed: number;
  correlationId: string;
}

export interface TelemetryPermission {
  canViewTelemetry: boolean;
  canIngestTelemetry: boolean;
  canRunAnalytics: boolean;
  canRunForecast: boolean;
  canAdminPolicies: boolean;
  canExportTelemetry: boolean;
}
