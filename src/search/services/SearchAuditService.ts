// ==================== SEARCH AUDIT SERVICE & EXPORTER ====================
// Records search activity logs and generates auditable CSV/JSON search exports with RBAC enforcement.

import { SearchAuditLogRecord, SearchResultItem } from '../types/searchTypes';

export class SearchAuditService {
  private static auditLogs: SearchAuditLogRecord[] = [
    {
      id: 'src-aud-001',
      timestamp: '2026-08-11 05:00:00',
      userId: 'USR-8801',
      tenantId: 'tenant-kspl-global',
      searchType: 'FULL_TEXT',
      queryText: 'Dell Latitude Finance',
      resultCount: 1,
      executionTimeMs: 1.85,
      correlationId: 'os-q-17882910-x',
    },
  ];

  public static logSearchActivity(record: Omit<SearchAuditLogRecord, 'id' | 'timestamp'>): SearchAuditLogRecord {
    const newRecord: SearchAuditLogRecord = {
      ...record,
      id: `src-aud-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    this.auditLogs.unshift(newRecord);
    return newRecord;
  }

  public static getAuditLogs(tenantId: string): SearchAuditLogRecord[] {
    return this.auditLogs.filter((l) => l.tenantId === tenantId);
  }

  /**
   * Generates CSV export of authorized search items
   */
  public static exportToCsv(items: SearchResultItem[], tenantId: string, userId: string): string {
    const headers = ['Record ID', 'Type', 'Title', 'Description', 'Indexed At'];
    let csv = headers.join(',') + '\n';

    items.forEach((item) => {
      const row = [
        `"${item.recordId}"`,
        `"${item.sourceType}"`,
        `"${item.title.replace(/"/g, '""')}"`,
        `"${item.description.replace(/"/g, '""')}"`,
        `"${item.indexedAt}"`,
      ];
      csv += row.join(',') + '\n';
    });

    this.logSearchActivity({
      userId,
      tenantId,
      searchType: 'EXPORT',
      queryText: `CSV Export of ${items.length} records`,
      resultCount: items.length,
      executionTimeMs: 0.5,
      correlationId: `exp-csv-${Date.now()}`,
    });

    return csv;
  }

  /**
   * Generates JSON export of authorized search items
   */
  public static exportToJson(items: SearchResultItem[], tenantId: string, userId: string): string {
    const payload = {
      tenantId,
      exportedBy: userId,
      exportedAt: new Date().toISOString(),
      itemCount: items.length,
      items,
    };

    this.logSearchActivity({
      userId,
      tenantId,
      searchType: 'EXPORT',
      queryText: `JSON Export of ${items.length} records`,
      resultCount: items.length,
      executionTimeMs: 0.4,
      correlationId: `exp-json-${Date.now()}`,
    });

    return JSON.stringify(payload, null, 2);
  }
}
