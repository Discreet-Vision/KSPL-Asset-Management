// ==================== AI AUDIT LOG ENGINE ====================
// Records immutable session query logs for AI compliance and data privacy verification.

import { AiAuditLogRecord } from '../types/analyticsTypes';

export class AiAuditLogger {
  private static auditLogs: AiAuditLogRecord[] = [
    {
      id: 'audit-ai-101',
      userId: 'USR-8801',
      userName: 'Jitin (Admin)',
      tenantId: 'tenant-kspl-global',
      questionText: 'Show servers with expiring warranties in APAC.',
      timestamp: '2026-08-11 11:20:00',
      dataSourcesUsed: ['Hardware Assets', 'Warranty Records', 'CMDB CIs'],
      queryType: 'Complex Search & Forecast',
      resultCount: 2,
      providerUsed: 'Google AI (Gemini 3.6 Flash)',
      confidenceScore: 92,
      executionTimeMs: 420,
      piiMaskApplied: true,
    },
    {
      id: 'audit-ai-102',
      userId: 'USR-8801',
      userName: 'Jitin (Admin)',
      tenantId: 'tenant-kspl-global',
      questionText: 'Which applications have the highest license deficit cost?',
      timestamp: '2026-08-11 10:45:00',
      dataSourcesUsed: ['Software Licenses', 'ELP Compliance Engine'],
      queryType: 'Financial Risk Search',
      resultCount: 3,
      providerUsed: 'Google AI (Gemini 3.6 Flash)',
      confidenceScore: 95,
      executionTimeMs: 310,
      piiMaskApplied: false,
    },
  ];

  public static async logQuery(entry: Omit<AiAuditLogRecord, 'id'>): Promise<AiAuditLogRecord> {
    const record: AiAuditLogRecord = {
      ...entry,
      id: `audit-ai-${Date.now()}`,
    };
    this.auditLogs.unshift(record);
    return record;
  }

  public static async getLogs(): Promise<AiAuditLogRecord[]> {
    return [...this.auditLogs];
  }
}
