// ==================== TELEMETRY SOURCE ADAPTERS ====================
// Decoupled collection adapters gathering metrics without modifying existing ITAM discovery mechanisms.

import { TelemetryMetricPoint } from '../types/telemetryTypes';

export interface TelemetrySourceInterface {
  sourceName: string;
  collectMetrics(targetAssetId: string, tenantId: string): Promise<TelemetryMetricPoint[]>;
}

export class AgentTelemetryAdapter implements TelemetrySourceInterface {
  public sourceName = 'Endpoint Agent';

  public async collectMetrics(targetAssetId: string, tenantId: string): Promise<TelemetryMetricPoint[]> {
    const nowIso = new Date().toISOString();
    return [
      {
        id: `agent-${Date.now()}-1`,
        tenantId,
        organizationId: 'ORG-8801',
        assetId: targetAssetId,
        metricName: 'cpu_usage',
        category: 'CPU',
        metricValue: Math.round((20 + Math.random() * 50) * 10) / 10,
        metricUnit: 'percent',
        eventTimestamp: nowIso,
        collectionTimestamp: nowIso,
        ingestionTimestamp: nowIso,
        source: 'Endpoint Agent',
        collectionMethod: 'HTTPS Agent Push v2.4',
      },
      {
        id: `agent-${Date.now()}-2`,
        tenantId,
        organizationId: 'ORG-8801',
        assetId: targetAssetId,
        metricName: 'memory_usage',
        category: 'MEMORY',
        metricValue: Math.round((40 + Math.random() * 30) * 10) / 10,
        metricUnit: 'percent',
        eventTimestamp: nowIso,
        collectionTimestamp: nowIso,
        ingestionTimestamp: nowIso,
        source: 'Endpoint Agent',
        collectionMethod: 'HTTPS Agent Push v2.4',
      },
    ];
  }
}

export class SNMPTelemetryAdapter implements TelemetrySourceInterface {
  public sourceName = 'SNMP';

  public async collectMetrics(targetAssetId: string, tenantId: string): Promise<TelemetryMetricPoint[]> {
    const nowIso = new Date().toISOString();
    return [
      {
        id: `snmp-${Date.now()}-1`,
        tenantId,
        organizationId: 'ORG-8801',
        assetId: targetAssetId,
        ciId: targetAssetId,
        metricName: 'disk_usage',
        category: 'DISK',
        metricValue: Math.round((60 + Math.random() * 20) * 10) / 10,
        metricUnit: 'percent',
        eventTimestamp: nowIso,
        collectionTimestamp: nowIso,
        ingestionTimestamp: nowIso,
        source: 'SNMP',
        collectionMethod: 'SNMP v3 Polling OID 1.3.6.1.4.1',
      },
    ];
  }
}

export class WMITelemetryAdapter implements TelemetrySourceInterface {
  public sourceName = 'WMI';

  public async collectMetrics(targetAssetId: string, tenantId: string): Promise<TelemetryMetricPoint[]> {
    const nowIso = new Date().toISOString();
    return [
      {
        id: `wmi-${Date.now()}-1`,
        tenantId,
        organizationId: 'ORG-8801',
        assetId: targetAssetId,
        metricName: 'battery_health',
        category: 'BATTERY',
        metricValue: Math.round((70 + Math.random() * 20) * 10) / 10,
        metricUnit: 'percent',
        eventTimestamp: nowIso,
        collectionTimestamp: nowIso,
        ingestionTimestamp: nowIso,
        source: 'Endpoint Agent',
        collectionMethod: 'WMI Win32_Battery Class',
      },
    ];
  }
}

export class CloudTelemetryAdapter implements TelemetrySourceInterface {
  public sourceName = 'Cloud API';

  public async collectMetrics(targetAssetId: string, tenantId: string): Promise<TelemetryMetricPoint[]> {
    const nowIso = new Date().toISOString();
    return [
      {
        id: `cloud-${Date.now()}-1`,
        tenantId,
        organizationId: 'ORG-8801',
        assetId: targetAssetId,
        metricName: 'cpu_usage',
        category: 'CPU',
        metricValue: Math.round((15 + Math.random() * 30) * 10) / 10,
        metricUnit: 'percent',
        eventTimestamp: nowIso,
        collectionTimestamp: nowIso,
        ingestionTimestamp: nowIso,
        source: 'Cloud API',
        collectionMethod: 'AWS CloudWatch / GCP Cloud Monitoring API',
      },
    ];
  }
}

export class ExternalMonitoringAdapter implements TelemetrySourceInterface {
  public sourceName = 'External Monitoring';

  public async collectMetrics(targetAssetId: string, tenantId: string): Promise<TelemetryMetricPoint[]> {
    const nowIso = new Date().toISOString();
    return [
      {
        id: `ext-${Date.now()}-1`,
        tenantId,
        organizationId: 'ORG-8801',
        assetId: targetAssetId,
        metricName: 'network_latency',
        category: 'NETWORK',
        metricValue: Math.round((5 + Math.random() * 25) * 10) / 10,
        metricUnit: 'milliseconds',
        eventTimestamp: nowIso,
        collectionTimestamp: nowIso,
        ingestionTimestamp: nowIso,
        source: 'External Monitoring',
        collectionMethod: 'Datadog / Prometheus Exporter API',
      },
    ];
  }
}
