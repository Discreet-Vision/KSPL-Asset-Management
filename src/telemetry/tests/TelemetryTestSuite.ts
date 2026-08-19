// ==================== AUTOMATED TELEMETRY TEST SUITE ====================
// Unit & Integration tests for TimescaleDB hypertable ingestion, multi-tenancy isolation, capacity forecasting, and predictive alerts.

import { TelemetryIngestionService } from '../services/TelemetryIngestionService';
import { TelemetryQueryService } from '../services/TelemetryQueryService';
import { PredictiveMaintenanceEngine } from '../services/PredictiveMaintenanceEngine';
import { TelemetryAIAdapter } from '../adapters/TelemetryAIAdapter';
import { TimescaleDbAdapter } from '../adapters/TimescaleDbAdapter';

export interface TestResult {
  testName: string;
  passed: boolean;
  message: string;
  durationMs: number;
}

export class TelemetryTestSuite {
  public static async runAllTests(tenantId: string = 'tenant-kspl-global'): Promise<TestResult[]> {
    const results: TestResult[] = [];
    const dbAdapter = new TimescaleDbAdapter();

    // Test 1: Batch Telemetry Ingestion & Validation
    try {
      const startTime = performance.now();
      const nowIso = new Date().toISOString();
      const res = await TelemetryIngestionService.ingestBatch({
        tenantId,
        source: 'Endpoint Agent',
        metrics: [
          {
            tenantId,
            organizationId: 'ORG-8801',
            assetId: 'ASSET-10025',
            metricName: 'cpu_usage',
            category: 'CPU',
            metricValue: 78.4,
            metricUnit: 'percent',
            eventTimestamp: nowIso,
            collectionTimestamp: nowIso,
            source: 'Endpoint Agent',
            collectionMethod: 'HTTPS Ingest Test',
          },
        ],
      });
      const passed = res.successfullyIngested === 1;
      results.push({
        testName: 'High-Volume Batch Telemetry Ingestion & Validation',
        passed,
        message: passed ? `Ingested 1 point in ${res.executionTimeMs} ms with 0 rejections.` : 'Batch ingestion failed.',
        durationMs: Math.round(performance.now() - startTime),
      });
    } catch (e: any) {
      results.push({ testName: 'High-Volume Batch Telemetry Ingestion & Validation', passed: false, message: e.message, durationMs: 0 });
    }

    // Test 2: Historical Bucket Aggregation & Downsampling
    try {
      const startTime = performance.now();
      const buckets = await TelemetryQueryService.getHistoricalBuckets({
        assetId: 'ASSET-10025',
        metricName: 'cpu_usage',
        timeRange: '30d',
        bucketInterval: '1d',
        aggregationFunction: 'AVG',
        tenantId,
      });
      const passed = buckets.length > 0;
      results.push({
        testName: 'TimescaleDB Hypertable Downsampling & Bucketing',
        passed,
        message: passed ? `Aggregated ${buckets.length} daily hypertable time buckets.` : 'Downsampling bucketing failed.',
        durationMs: Math.round(performance.now() - startTime),
      });
    } catch (e: any) {
      results.push({ testName: 'TimescaleDB Hypertable Downsampling & Bucketing', passed: false, message: e.message, durationMs: 0 });
    }

    // Test 3: Multi-Tenancy Security Isolation
    try {
      const startTime = performance.now();
      const buckets = await TelemetryQueryService.getHistoricalBuckets({
        assetId: 'ASSET-10025',
        metricName: 'cpu_usage',
        timeRange: '30d',
        bucketInterval: '1d',
        aggregationFunction: 'AVG',
        tenantId: 'unauthorized-tenant-xyz',
      });
      const passed = buckets.length === 0;
      results.push({
        testName: 'Multi-Tenant Telemetry Data Isolation Enforcement',
        passed,
        message: passed ? 'Tenant isolation verified. Cross-tenant queries return 0 telemetry points.' : 'Tenant security breach!',
        durationMs: Math.round(performance.now() - startTime),
      });
    } catch (e: any) {
      results.push({ testName: 'Multi-Tenant Telemetry Data Isolation Enforcement', passed: false, message: e.message, durationMs: 0 });
    }

    // Test 4: Capacity Growth & Storage Exhaustion Forecasting
    try {
      const startTime = performance.now();
      const forecast = await TelemetryQueryService.calculateCapacityForecast(
        'ci-srv-9001',
        'PostgreSQL Server Node 01',
        'STORAGE_GROWTH',
        tenantId
      );
      const passed = forecast.daysUntilExhaustion > 0 && forecast.confidenceScore > 80;
      results.push({
        testName: 'Resource Capacity Exhaustion & Growth Forecasting',
        passed,
        message: passed ? `Forecasted 90% threshold in ${forecast.daysUntilExhaustion} days (Confidence ${forecast.confidenceScore}%).` : 'Forecast failed.',
        durationMs: Math.round(performance.now() - startTime),
      });
    } catch (e: any) {
      results.push({ testName: 'Resource Capacity Exhaustion & Growth Forecasting', passed: false, message: e.message, durationMs: 0 });
    }

    // Test 5: Predictive Maintenance Alert Evaluation
    try {
      const startTime = performance.now();
      const alerts = await PredictiveMaintenanceEngine.evaluatePredictiveAlerts(tenantId);
      const passed = alerts.length > 0;
      results.push({
        testName: 'Predictive Maintenance Hardware Failure Engine',
        passed,
        message: passed ? `Generated ${alerts.length} predictive failure alerts with actionable recommendations.` : 'Predictive engine failed.',
        durationMs: Math.round(performance.now() - startTime),
      });
    } catch (e: any) {
      results.push({ testName: 'Predictive Maintenance Hardware Failure Engine', passed: false, message: e.message, durationMs: 0 });
    }

    // Test 6: AI Copilot Controlled Telemetry Retrieval
    try {
      const startTime = performance.now();
      const aiRes = await TelemetryAIAdapter.executeAITelemetryQuery({
        naturalLanguagePrompt: 'Which assets have battery degradation or disk exhaustion risks?',
        userRole: 'Admin',
        tenantId,
      });
      const passed = aiRes.tenantVerified && aiRes.answerSummary.length > 0;
      results.push({
        testName: 'AI Copilot Controlled Telemetry Query Adapter',
        passed,
        message: passed ? 'AI Adapter retrieved permission-enforced hypertable telemetry.' : 'AI telemetry adapter failed.',
        durationMs: Math.round(performance.now() - startTime),
      });
    } catch (e: any) {
      results.push({ testName: 'AI Copilot Controlled Telemetry Query Adapter', passed: false, message: e.message, durationMs: 0 });
    }

    // Test 7: TimescaleDB Cluster Health & Compression Audit
    try {
      const startTime = performance.now();
      const health = await dbAdapter.clusterHealth();
      const passed = health.status === 'ONLINE' && health.compressionRatioPct > 50;
      results.push({
        testName: 'TimescaleDB Hypertable Health & Chunk Compression Audit',
        passed,
        message: passed ? `Cluster ONLINE. Hypertable chunk compression: ${health.compressionRatioPct}%.` : 'Health audit failed.',
        durationMs: Math.round(performance.now() - startTime),
      });
    } catch (e: any) {
      results.push({ testName: 'TimescaleDB Hypertable Health & Chunk Compression Audit', passed: false, message: e.message, durationMs: 0 });
    }

    return results;
  }
}
