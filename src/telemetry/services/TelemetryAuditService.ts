// ==================== TELEMETRY AUDIT SERVICE ====================
// Audit logging service and CSV/JSON exporter for telemetry time-series metrics.

import { TelemetryAuditRecord, TelemetryMetricPoint } from '../types/telemetryTypes';

export class TelemetryAuditService {
  private static auditLogs: TelemetryAuditRecord[] = [
    {
      id: 'ts-aud-001',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      userId: 'USR-8801',
      tenantId: 'tenant-kspl-global',
      operation: 'TELEMETRY_INGEST',
      recordsProcessed: 1240,
      correlationId: 'ts-ing-9901-a',
    },
  ];

  public static logActivity(record: Omit<TelemetryAuditRecord, 'id' | 'timestamp'>): TelemetryAuditRecord {
    const newRecord: TelemetryAuditRecord = {
      ...record,
      id: `ts-aud-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    this.auditLogs.unshift(newRecord);
    return newRecord;
  }

  public static getAuditLogs(tenantId: string): TelemetryAuditRecord[] {
    return this.auditLogs.filter((l) => l.tenantId === tenantId);
  }

  /**
   * Generates CSV export for time-series metrics
   */
  public static exportToCsv(points: TelemetryMetricPoint[], tenantId: string, userId: string): string {
    const headers = ['Asset ID', 'Metric Name', 'Category', 'Value', 'Unit', 'Source', 'Timestamp'];
    let csv = headers.join(',') + '\n';

    points.forEach((p) => {
      const row = [
        `"${p.assetId}"`,
        `"${p.metricName}"`,
        `"${p.category}"`,
        `"${p.metricValue}"`,
        `"${p.metricUnit}"`,
        `"${p.source}"`,
        `"${p.eventTimestamp}"`,
      ];
      csv += row.join(',') + '\n';
    });

    this.logActivity({
      userId,
      tenantId,
      operation: 'EXPORT_METRICS',
      recordsProcessed: points.length,
      correlationId: `exp-ts-${Date.now()}`,
    });

    return csv;
  }

  /**
   * Generates JSON export for time-series metrics
   */
  public static exportToJson(points: TelemetryMetricPoint[], tenantId: string, userId: string): string {
    const payload = {
      tenantId,
      exportedBy: userId,
      exportedAt: new Date().toISOString(),
      recordCount: points.length,
      telemetryPoints: points,
    };

    this.logActivity({
      userId,
      tenantId,
      operation: 'EXPORT_METRICS',
      recordsProcessed: points.length,
      correlationId: `exp-ts-json-${Date.now()}`,
    });

    return JSON.stringify(payload, null, 2);
  }
}
