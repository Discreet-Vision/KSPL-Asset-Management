// ==================== TELEMETRY QUERY SERVICE ====================
// Historical query and capacity forecasting engine querying TimescaleDB hypertables.

import { TimescaleDatabaseInterface } from '../interfaces/TimescaleDatabaseInterface';
import { TimescaleDbAdapter } from '../adapters/TimescaleDbAdapter';
import {
  MetricAggregationOptions,
  TimeSeriesBucketResult,
  HistoricalPerformanceSummary,
  CapacityForecastResult,
  TelemetryMetricPoint,
} from '../types/telemetryTypes';

export class TelemetryQueryService {
  private static timescaleDb: TimescaleDatabaseInterface = new TimescaleDbAdapter();

  /**
   * Queries downsampled historical buckets for an asset & metric
   */
  public static async getHistoricalBuckets(options: MetricAggregationOptions): Promise<TimeSeriesBucketResult[]> {
    if (!options.tenantId) {
      throw new Error(`[TelemetryQueryService] Security Error: Missing mandatory 'tenantId' context.`);
    }

    return this.timescaleDb.queryBuckets(options);
  }

  /**
   * Generates a complete 30-day historical performance summary for an asset
   */
  public static async getAssetPerformanceSummary(
    assetId: string,
    metricName: string,
    tenantId: string
  ): Promise<HistoricalPerformanceSummary> {
    const buckets = await this.timescaleDb.queryBuckets({
      assetId,
      metricName,
      timeRange: '30d',
      bucketInterval: '1d',
      aggregationFunction: 'AVG',
      tenantId,
    });

    const latestPoint = await this.timescaleDb.getLatestMetricValue(assetId, metricName, tenantId);
    const currentValue = latestPoint ? latestPoint.metricValue : (buckets.length ? buckets[buckets.length - 1].avgValue : 50);

    const values = buckets.map((b) => b.avgValue);
    const avg24h = values.length ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10 : currentValue;
    const max24h = values.length ? Math.max(...values) : currentValue;
    const min24h = values.length ? Math.min(...values) : currentValue;

    // Trend calculation
    const firstVal = values.length > 1 ? values[0] : currentValue;
    const lastVal = values.length ? values[values.length - 1] : currentValue;
    const trendPercentage30d = firstVal > 0 ? Math.round(((lastVal - firstVal) / firstVal) * 1000) / 10 : 0;

    return {
      assetId,
      metricName,
      currentValue,
      metricUnit: latestPoint ? latestPoint.metricUnit : 'percent',
      avg24h,
      max24h,
      min24h,
      trendPercentage30d,
      timeSeriesData: buckets,
    };
  }

  /**
   * Calculates storage or resource capacity exhaustion forecasts
   */
  public static async calculateCapacityForecast(
    assetId: string,
    assetName: string,
    metricCategory: 'DISK' | 'STORAGE_GROWTH' | 'MEMORY' | 'CPU',
    tenantId: string
  ): Promise<CapacityForecastResult> {
    const metricName = metricCategory === 'DISK' || metricCategory === 'STORAGE_GROWTH' ? 'disk_usage' : 'cpu_usage';
    const summary = await this.getAssetPerformanceSummary(assetId, metricName, tenantId);

    const currentCap = summary.currentValue;
    const dailyGrowth = summary.trendPercentage30d > 0 ? summary.trendPercentage30d / 30 : 0.8; // e.g. +0.8%/day

    const remainingTo90 = Math.max(0, 90 - currentCap);
    const daysUntilExhaustion = dailyGrowth > 0 ? Math.round(remainingTo90 / dailyGrowth) : 999;

    const estDate = new Date(Date.now() + daysUntilExhaustion * 24 * 60 * 60 * 1000)
      .toISOString()
      .substring(0, 10);

    let rec = `Resource utilization is healthy. No action required for the next ${daysUntilExhaustion} days.`;
    if (daysUntilExhaustion <= 30) {
      rec = `CRITICAL: Storage capacity expected to breach 90% threshold in approximately ${daysUntilExhaustion} days (${estDate}). Schedule storage expansion or volume cleanup immediately.`;
    } else if (daysUntilExhaustion <= 60) {
      rec = `WARNING: Projected threshold reach in ${daysUntilExhaustion} days. Monitor disk allocation trends during next maintenance cycle.`;
    }

    return {
      assetId,
      assetName,
      metricCategory,
      currentCapacityPct: currentCap,
      dailyGrowthRatePct: Math.round(dailyGrowth * 10) / 10,
      forecastedThresholdPct: 90,
      daysUntilExhaustion,
      estimatedThresholdDate: estDate,
      confidenceScore: 88,
      recommendation: rec,
      calculatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
  }
}
