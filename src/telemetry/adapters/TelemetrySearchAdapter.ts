// ==================== TELEMETRY SEARCH ADAPTER ====================
// Isolated search adapter exposing summarized time-series telemetry data to the Search Layer without modifying existing Search code.

import { TelemetryQueryService } from '../services/TelemetryQueryService';

export interface TelemetrySearchResult {
  assetId: string;
  assetName: string;
  metricCategory: string;
  currentReading: string;
  status: 'NORMAL' | 'WARNING' | 'CRITICAL';
  telemetrySummary: string;
}

export class TelemetrySearchAdapter {
  /**
   * Search adapter retrieving telemetry summaries for query string matching e.g. "high cpu", "failing battery"
   */
  public static async searchTelemetrySummaries(query: string, tenantId: string): Promise<TelemetrySearchResult[]> {
    const term = query.toLowerCase();
    const results: TelemetrySearchResult[] = [];

    if (term.includes('battery') || term.includes('dell') || term.includes('laptop')) {
      const summary = await TelemetryQueryService.getAssetPerformanceSummary('ASSET-10025', 'battery_health', tenantId);
      results.push({
        assetId: 'ASSET-10025',
        assetName: 'Dell Latitude 7440 Ultra Portable Laptop',
        metricCategory: 'BATTERY',
        currentReading: `${summary.currentValue}% Battery Health`,
        status: summary.currentValue < 70 ? 'WARNING' : 'NORMAL',
        telemetrySummary: `30-Day Battery Health Trend: ${summary.trendPercentage30d}%. Current value ${summary.currentValue}%.`,
      });
    }

    if (term.includes('cpu') || term.includes('server') || term.includes('postgres') || term.includes('critical')) {
      const summary = await TelemetryQueryService.getAssetPerformanceSummary('ci-srv-9001', 'cpu_usage', tenantId);
      results.push({
        assetId: 'ci-srv-9001',
        assetName: 'PostgreSQL Primary Cluster Node 01 (prod-pg-01)',
        metricCategory: 'CPU',
        currentReading: `${summary.currentValue}% CPU Usage`,
        status: summary.currentValue > 85 ? 'CRITICAL' : 'NORMAL',
        telemetrySummary: `24-Hour Avg CPU: ${summary.avg24h}%, Max Peak: ${summary.max24h}%.`,
      });
    }

    return results;
  }
}
