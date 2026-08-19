import React, { useState, useEffect } from 'react';
import {
  Activity,
  Cpu,
  HardDrive,
  Battery,
  Thermometer,
  Zap,
  Clock,
  TrendingUp,
  AlertTriangle,
  Shield,
  CheckCircle2,
  Database,
  Download,
  Play,
  RefreshCw,
  Server,
  Layers,
  BarChart3,
  ListFilter,
  FileText,
  Sliders,
  Sparkles,
  Wifi,
  Radio,
  Box,
} from 'lucide-react';

import { TelemetryIngestionService } from '../../telemetry/services/TelemetryIngestionService';
import { TelemetryQueryService } from '../../telemetry/services/TelemetryQueryService';
import { PredictiveMaintenanceEngine } from '../../telemetry/services/PredictiveMaintenanceEngine';
import { TelemetryAuditService } from '../../telemetry/services/TelemetryAuditService';
import { TelemetryTestSuite, TestResult } from '../../telemetry/tests/TelemetryTestSuite';
import { TimescaleDbAdapter } from '../../telemetry/adapters/TimescaleDbAdapter';
import { TelemetryAIAdapter } from '../../telemetry/adapters/TelemetryAIAdapter';

import {
  HistoricalPerformanceSummary,
  CapacityForecastResult,
  PredictiveMaintenanceAlert,
  TimeSeriesClusterHealth,
  TelemetryMetricPoint,
} from '../../telemetry/types/telemetryTypes';

export const TelemetryModule: React.FC = () => {
  const tenantId = 'tenant-kspl-global';

  // Active Sub-Tab
  const [activeTab, setActiveTab] = useState<'metrics' | 'predictive' | 'capacity' | 'ingest' | 'cluster' | 'tests' | 'export'>('metrics');

  // Selected Asset for Performance View
  const [selectedAssetId, setSelectedAssetId] = useState<'ASSET-10025' | 'ci-srv-9001'>('ASSET-10025');
  const [selectedMetric, setSelectedMetric] = useState<'cpu_usage' | 'memory_usage' | 'disk_usage' | 'battery_health'>('cpu_usage');

  // State
  const [performanceSummary, setPerformanceSummary] = useState<HistoricalPerformanceSummary | null>(null);
  const [capacityForecast, setCapacityForecast] = useState<CapacityForecastResult | null>(null);
  const [predictiveAlerts, setPredictiveAlerts] = useState<PredictiveMaintenanceAlert[]>([]);
  const [clusterHealth, setClusterHealth] = useState<TimeSeriesClusterHealth | null>(null);

  // Ingestion Simulator State
  const [simulatedValue, setSimulatedValue] = useState<number>(85.5);
  const [ingestionResult, setIngestionResult] = useState<string | null>(null);

  // AI Prompt State
  const [aiPrompt, setAiPrompt] = useState('Which assets show battery degradation or disk exhaustion risks?');
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  // Test Results
  const [testResults, setTestResults] = useState<TestResult[]>([]);

  const dbAdapter = new TimescaleDbAdapter();

  useEffect(() => {
    loadAssetMetrics();
    loadPredictiveData();
    loadClusterHealth();
  }, [selectedAssetId, selectedMetric]);

  const loadAssetMetrics = async () => {
    try {
      const summary = await TelemetryQueryService.getAssetPerformanceSummary(selectedAssetId, selectedMetric, tenantId);
      setPerformanceSummary(summary);

      const forecast = await TelemetryQueryService.calculateCapacityForecast(
        selectedAssetId,
        selectedAssetId === 'ASSET-10025' ? 'Dell Latitude 7440' : 'PostgreSQL Node 01',
        'STORAGE_GROWTH',
        tenantId
      );
      setCapacityForecast(forecast);
    } catch (err) {
      console.error('Metrics load error:', err);
    }
  };

  const loadPredictiveData = async () => {
    try {
      const alerts = await PredictiveMaintenanceEngine.evaluatePredictiveAlerts(tenantId);
      setPredictiveAlerts(alerts);
    } catch (err) {
      console.error('Predictive alerts load error:', err);
    }
  };

  const loadClusterHealth = async () => {
    try {
      const health = await dbAdapter.clusterHealth();
      setClusterHealth(health);
    } catch (err) {
      console.error('Cluster health load error:', err);
    }
  };

  const handleSimulateIngestion = async () => {
    try {
      const nowIso = new Date().toISOString();
      const res = await TelemetryIngestionService.ingestBatch({
        tenantId,
        source: 'Endpoint Agent',
        metrics: [
          {
            tenantId,
            organizationId: 'ORG-8801',
            assetId: selectedAssetId,
            metricName: selectedMetric,
            category: selectedMetric === 'battery_health' ? 'BATTERY' : 'CPU',
            metricValue: Number(simulatedValue),
            metricUnit: 'percent',
            eventTimestamp: nowIso,
            collectionTimestamp: nowIso,
            source: 'Endpoint Agent',
            collectionMethod: 'Live Agent Push Simulator',
          },
        ],
      });

      setIngestionResult(`Successfully ingested 1 metric point in ${res.executionTimeMs} ms to TimescaleDB hypertable.`);
      loadAssetMetrics();
      loadClusterHealth();
    } catch (err: any) {
      setIngestionResult(`Ingestion failed: ${err.message}`);
    }
  };

  const handleRunAiQuery = async () => {
    try {
      const res = await TelemetryAIAdapter.executeAITelemetryQuery({
        naturalLanguagePrompt: aiPrompt,
        userRole: 'Admin',
        tenantId,
      });
      setAiResponse(res.answerSummary);
    } catch (err: any) {
      setAiResponse(`AI Query error: ${err.message}`);
    }
  };

  const handleRunTests = async () => {
    const results = await TelemetryTestSuite.runAllTests(tenantId);
    setTestResults(results);
  };

  const handleExportCsv = () => {
    const dummyPoints: TelemetryMetricPoint[] = [
      {
        id: 'p-1',
        tenantId,
        organizationId: 'ORG-8801',
        assetId: selectedAssetId,
        metricName: selectedMetric,
        category: 'CPU',
        metricValue: performanceSummary?.currentValue || 75,
        metricUnit: 'percent',
        eventTimestamp: new Date().toISOString(),
        collectionTimestamp: new Date().toISOString(),
        ingestionTimestamp: new Date().toISOString(),
        source: 'Endpoint Agent',
        collectionMethod: 'HTTPS Agent Push',
      },
    ];

    const csv = TelemetryAuditService.exportToCsv(dummyPoints, tenantId, 'USR-8801');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `telemetry-export-${tenantId}.csv`;
    a.click();
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 text-white font-sans bg-black min-h-screen">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-zinc-950 p-4 border border-zinc-800 rounded-lg shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-blue-600 rounded border border-blue-500 shadow-sm">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-black text-white tracking-tight font-mono">
                ITAM TIME-SERIES & TELEMETRY LAYER
              </h1>
              <span className="bg-blue-600 text-white text-[10px] font-bold uppercase font-mono px-2 py-0.5 rounded border border-blue-500">
                TIMESCALEDB HYPERTABLE
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5 font-mono">
              Asset Telemetry • Historical Performance • Predictive Maintenance • Storage Capacity • EOL Forecasting
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-1 bg-black p-1 border border-zinc-800 rounded font-mono text-xs overflow-x-auto">
          {[
            { id: 'metrics', label: 'Asset Performance', icon: TrendingUp },
            { id: 'predictive', label: 'Predictive Failure Alerts', icon: AlertTriangle },
            { id: 'capacity', label: 'Capacity & EOL Forecast', icon: HardDrive },
            { id: 'ingest', label: 'Telemetry Ingestion', icon: Radio },
            { id: 'cluster', label: 'TimescaleDB Cluster', icon: Database },
            { id: 'tests', label: 'Tests Suite', icon: Play },
            { id: 'export', label: 'Exports & AI', icon: Download },
          ].map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded cursor-pointer whitespace-nowrap transition-colors ${
                  isActive ? 'bg-blue-600 text-white font-bold border border-blue-500' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Cluster Status Bar */}
      <div className="bg-zinc-950 p-3 border border-zinc-800 rounded-lg flex flex-col sm:flex-row items-center justify-between text-xs font-mono gap-2">
        <div className="flex items-center space-x-3">
          <span className="flex items-center space-x-1 text-zinc-400">
            <Database className="w-3.5 h-3.5 text-blue-500" />
            <span>Time-Series Engine:</span>
            <strong className="text-white">{clusterHealth?.databaseEngine || 'TimescaleDB 2.14'}</strong>
          </span>
          <span className="text-zinc-600">|</span>
          <span className="text-zinc-400">Hypertables: <strong className="text-green-400">{clusterHealth?.activeHypertablesCount || 6} Active</strong></span>
          <span className="text-zinc-600">|</span>
          <span className="text-zinc-400">Metric Points: <strong className="text-white">{clusterHealth?.totalMetricPointsCount || 480}</strong></span>
        </div>

        <div className="flex items-center space-x-2 text-zinc-400">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
          <span>Chunk Compression: <strong className="text-blue-400">{clusterHealth?.compressionRatioPct}% Saved</strong></span>
        </div>
      </div>

      {/* TAB 1: ASSET HISTORICAL PERFORMANCE */}
      {activeTab === 'metrics' && (
        <div className="space-y-6 font-mono text-xs">
          {/* Controls Bar */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3 w-full md:w-auto">
              <span className="text-zinc-400">Select Asset:</span>
              <select
                value={selectedAssetId}
                onChange={(e) => setSelectedAssetId(e.target.value as any)}
                className="bg-black text-white border border-zinc-800 rounded px-3 py-2 text-xs focus:outline-none"
              >
                <option value="ASSET-10025">Dell Latitude 7440 (ASSET-10025)</option>
                <option value="ci-srv-9001">PostgreSQL Primary Node 01 (ci-srv-9001)</option>
              </select>

              <span className="text-zinc-400">Metric:</span>
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value as any)}
                className="bg-black text-white border border-zinc-800 rounded px-3 py-2 text-xs focus:outline-none"
              >
                <option value="cpu_usage">CPU Utilization (%)</option>
                <option value="memory_usage">Memory Usage (%)</option>
                <option value="disk_usage">Disk Volume Usage (%)</option>
                <option value="battery_health">Battery Health (%)</option>
              </select>
            </div>

            <div className="flex items-center space-x-2 text-zinc-400 text-[11px]">
              <Clock className="w-3.5 h-3.5 text-blue-500" />
              <span>Downsampling Window: <strong>30-Day Daily Buckets</strong></span>
            </div>
          </div>

          {/* Metric KPI Cards */}
          {performanceSummary && (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg space-y-1">
                <span className="text-zinc-500 text-[10px] uppercase font-bold">Current Reading</span>
                <div className="text-2xl font-black text-white">
                  {performanceSummary.currentValue} <span className="text-xs text-blue-400 font-normal">{performanceSummary.metricUnit}</span>
                </div>
                <div className="text-[10px] text-zinc-400">Real-time Telemetry Ingestion</div>
              </div>

              <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg space-y-1">
                <span className="text-zinc-500 text-[10px] uppercase font-bold">24-Hour Average</span>
                <div className="text-2xl font-black text-blue-400">{performanceSummary.avg24h}%</div>
                <div className="text-[10px] text-zinc-400">Bucketed Mean</div>
              </div>

              <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg space-y-1">
                <span className="text-zinc-500 text-[10px] uppercase font-bold">24-Hour Peak / Min</span>
                <div className="text-2xl font-black text-white">
                  {performanceSummary.max24h}% <span className="text-xs text-zinc-500 font-normal">/ {performanceSummary.min24h}%</span>
                </div>
                <div className="text-[10px] text-zinc-400">Range Extremes</div>
              </div>

              <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg space-y-1">
                <span className="text-zinc-500 text-[10px] uppercase font-bold">30-Day Growth Slope</span>
                <div className={`text-2xl font-black ${performanceSummary.trendPercentage30d > 0 ? 'text-red-400' : 'text-green-400'}`}>
                  {performanceSummary.trendPercentage30d > 0 ? `+${performanceSummary.trendPercentage30d}%` : `${performanceSummary.trendPercentage30d}%`}
                </div>
                <div className="text-[10px] text-zinc-400">Trajectory Direction</div>
              </div>
            </div>
          )}

          {/* Time Series Chart Representation */}
          {performanceSummary && (
            <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <h3 className="font-bold text-white text-xs flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4 text-blue-500" />
                  <span>30-DAY HISTORICAL TIMESCALEDB HYPERTABLE TREND CHART</span>
                </h3>
                <span className="text-zinc-500 text-[10px]">Asset: {performanceSummary.assetId}</span>
              </div>

              {/* Bar Visualization */}
              <div className="h-48 flex items-end space-x-1.5 pt-6 pb-2 px-2 border-b border-zinc-800 overflow-x-auto">
                {performanceSummary.timeSeriesData.map((bucket, idx) => {
                  const heightPct = Math.min(100, Math.max(10, bucket.avgValue));
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center group relative min-w-[12px]">
                      {/* Tooltip on hover */}
                      <div className="hidden group-hover:block absolute -top-10 bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow border border-blue-400 whitespace-nowrap z-10">
                        {bucket.bucketTimestamp}: {bucket.avgValue}%
                      </div>
                      <div
                        style={{ height: `${heightPct}%` }}
                        className={`w-full rounded-t transition-all ${
                          bucket.avgValue > 85 ? 'bg-red-500' : bucket.avgValue > 70 ? 'bg-amber-500' : 'bg-blue-600'
                        }`}
                      ></div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between text-[10px] text-zinc-500 pt-1">
                <span>30 Days Ago</span>
                <span>15 Days Ago</span>
                <span>Today (UTC)</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PREDICTIVE MAINTENANCE ALERTS */}
      {activeTab === 'predictive' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <h3 className="font-bold text-white text-sm flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>PREDICTIVE MAINTENANCE & HARDWARE FAILURE ALERTS</span>
              </h3>
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold">
                {predictiveAlerts.length} Active Predictions
              </span>
            </div>

            <div className="space-y-3">
              {predictiveAlerts.map((alert) => (
                <div key={alert.id} className="p-4 bg-black border border-zinc-800 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded bg-red-600 text-white font-bold text-[10px] uppercase">
                        {alert.riskCategory}
                      </span>
                      <span className="font-bold text-white text-sm">{alert.assetName}</span>
                    </div>

                    <div className="flex items-center space-x-3 text-[10px]">
                      <span className="text-zinc-400">Risk Score: <strong className="text-red-400">{alert.failureRiskScore}/100</strong></span>
                      <span className="text-zinc-400">Confidence: <strong className="text-blue-400">{alert.confidencePct}%</strong></span>
                    </div>
                  </div>

                  <div className="text-zinc-300 text-xs">
                    Estimated Failure Window: <strong className="text-amber-400">{alert.estimatedFailureWindow}</strong>
                  </div>

                  {/* Signals */}
                  <div className="space-y-1 bg-zinc-950 p-2.5 rounded border border-zinc-900 text-[11px]">
                    <span className="text-zinc-500 font-bold uppercase text-[9px]">Contributing Telemetry Signals:</span>
                    {alert.contributingTelemetrySignals.map((sig, idx) => (
                      <div key={idx} className="text-zinc-300 flex items-center space-x-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                        <span>{sig}</span>
                      </div>
                    ))}
                  </div>

                  <div className="p-2.5 bg-blue-950/40 border border-blue-900/60 rounded text-blue-300 text-[11px]">
                    <strong>Actionable Recommendation:</strong> {alert.recommendedAction}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CAPACITY & EOL FORECAST */}
      {activeTab === 'capacity' && (
        <div className="space-y-6 font-mono text-xs">
          {capacityForecast && (
            <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-4">
              <h3 className="font-bold text-white text-sm flex items-center space-x-2 border-b border-zinc-800 pb-2">
                <HardDrive className="w-4 h-4 text-blue-500" />
                <span>RESOURCE CAPACITY & EXHAUSTION FORECAST</span>
              </h3>

              <div className="p-4 bg-black border border-zinc-800 rounded-lg space-y-3">
                <div className="flex items-center justify-between font-bold text-sm text-white">
                  <span>{capacityForecast.assetName}</span>
                  <span className="text-blue-400">Metric: {capacityForecast.metricCategory}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px]">
                  <div className="p-2.5 bg-zinc-950 border border-zinc-900 rounded">
                    <span className="text-zinc-500">Current Storage:</span> <strong className="text-white">{capacityForecast.currentCapacityPct}%</strong>
                  </div>
                  <div className="p-2.5 bg-zinc-950 border border-zinc-900 rounded">
                    <span className="text-zinc-500">Daily Growth:</span> <strong className="text-red-400">+{capacityForecast.dailyGrowthRatePct}% / day</strong>
                  </div>
                  <div className="p-2.5 bg-zinc-950 border border-zinc-900 rounded">
                    <span className="text-zinc-500">Days to 90% Exhaustion:</span> <strong className="text-amber-400">{capacityForecast.daysUntilExhaustion} days</strong>
                  </div>
                </div>

                <div className="p-3 bg-zinc-900 border border-zinc-800 rounded text-zinc-300">
                  {capacityForecast.recommendation}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: TELEMETRY INGESTION SIMULATOR */}
      {activeTab === 'ingest' && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-4 font-mono text-xs">
          <h3 className="font-bold text-white text-sm flex items-center space-x-2 border-b border-zinc-800 pb-2">
            <Radio className="w-4 h-4 text-blue-500" />
            <span>TELEMETRY INGESTION API SIMULATOR</span>
          </h3>

          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <span className="text-zinc-400">Simulate Metric Value (%):</span>
              <input
                type="number"
                value={simulatedValue}
                onChange={(e) => setSimulatedValue(Number(e.target.value))}
                className="bg-black text-white border border-zinc-800 rounded px-3 py-1.5 text-xs w-24 focus:outline-none"
              />

              <button
                onClick={handleSimulateIngestion}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-1.5 rounded border border-blue-500 cursor-pointer"
              >
                Push Telemetry Batch Point
              </button>
            </div>

            {ingestionResult && (
              <div className="p-3 bg-black border border-zinc-800 rounded text-green-400 text-xs">
                {ingestionResult}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: TIMESCALEDB CLUSTER */}
      {activeTab === 'cluster' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-3">
            <h3 className="font-bold text-white text-xs border-b border-zinc-800 pb-2">TimescaleDB Hypertable Architecture</h3>
            <div className="space-y-2 text-[11px]">
              <div className="p-2 bg-black border border-zinc-800 rounded flex justify-between">
                <span>Engine:</span> <strong>{clusterHealth?.databaseEngine}</strong>
              </div>
              <div className="p-2 bg-black border border-zinc-800 rounded flex justify-between">
                <span>Total Metric Points:</span> <strong>{clusterHealth?.totalMetricPointsCount}</strong>
              </div>
              <div className="p-2 bg-black border border-zinc-800 rounded flex justify-between">
                <span>Throughput:</span> <strong className="text-blue-400">{clusterHealth?.ingestionThroughputPerSec} pts/sec</strong>
              </div>
            </div>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-3">
            <h3 className="font-bold text-white text-xs border-b border-zinc-800 pb-2">Retention & Downsampling Policies</h3>
            <div className="p-3 bg-black border border-zinc-800 rounded space-y-1 text-[11px]">
              <div className="text-zinc-300">Raw Metrics Retention: <strong>30 Days</strong></div>
              <div className="text-zinc-300">Hourly Aggregates Retention: <strong>365 Days</strong></div>
              <div className="text-zinc-300">Daily Aggregates Retention: <strong>1,825 Days (5 Years)</strong></div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: TESTS SUITE */}
      {activeTab === 'tests' && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <h3 className="font-bold text-white text-sm flex items-center space-x-2">
              <Play className="w-4 h-4 text-blue-500" />
              <span>AUTOMATED TIME-SERIES LAYER TEST RUNNER</span>
            </h3>

            <button
              onClick={handleRunTests}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-1.5 rounded border border-blue-500 cursor-pointer"
            >
              Run All 7 Tests
            </button>
          </div>

          <div className="space-y-2">
            {testResults.map((t, idx) => (
              <div key={idx} className="p-3 bg-black border border-zinc-800 rounded flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-white">{t.testName}</div>
                  <div className="text-zinc-400 text-[10px]">{t.message}</div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-zinc-500 text-[10px]">{t.durationMs}ms</span>
                  <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${t.passed ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-red-400'}`}>
                    {t.passed ? 'PASSED' : 'FAILED'}
                  </span>
                </div>
              </div>
            ))}

            {testResults.length === 0 && (
              <div className="text-zinc-500 text-center py-8">Click "Run All 7 Tests" to execute live time-series suite.</div>
            )}
          </div>
        </div>
      )}

      {/* TAB 7: EXPORTS & AI */}
      {activeTab === 'export' && (
        <div className="space-y-6 font-mono text-xs">
          {/* AI Copilot Query Tool */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-3">
            <h3 className="font-bold text-white text-sm flex items-center space-x-2 border-b border-zinc-800 pb-2">
              <Sparkles className="w-4 h-4 text-blue-500" />
              <span>AI COPILOT CONTROLLED TELEMETRY RETRIEVAL</span>
            </h3>

            <div className="flex space-x-2">
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                className="flex-1 bg-black text-white border border-zinc-800 p-2 rounded text-xs focus:outline-none"
              />
              <button
                onClick={handleRunAiQuery}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded cursor-pointer"
              >
                Execute Query
              </button>
            </div>

            {aiResponse && (
              <div className="p-3 bg-black border border-zinc-800 rounded text-zinc-200 text-xs whitespace-pre-wrap">
                {aiResponse}
              </div>
            )}
          </div>

          {/* Export */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-3">
            <h3 className="font-bold text-white text-sm flex items-center space-x-2 border-b border-zinc-800 pb-2">
              <Download className="w-4 h-4 text-blue-500" />
              <span>TELEMETRY METRICS EXPORT</span>
            </h3>

            <button
              onClick={handleExportCsv}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded cursor-pointer"
            >
              Export Metrics as CSV
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
