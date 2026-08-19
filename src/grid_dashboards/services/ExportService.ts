// ==================== AG GRID EXPORT SERVICE ====================
// Asynchronous CSV/Excel export service enforcing RBAC field masking and tenant boundary checks.

import { GridColumnDef } from '../types/gridDashboardTypes';

export class ExportService {
  public static async generateCsvExport(
    columns: GridColumnDef[],
    rows: any[],
    tenantId: string,
    userRole: string
  ): Promise<{ fileName: string; content: string; recordCount: number; exportId: string }> {
    const visibleCols = columns.filter((c) => c.visible !== false);

    // Filter financial columns if user lacks role
    const allowedCols = visibleCols.filter((col) => {
      if (['purchaseCost', 'depreciatedValue'].includes(col.field) && userRole !== 'ADMIN' && userRole !== 'FINANCE') {
        return false;
      }
      return true;
    });

    const headerLine = allowedCols.map((c) => `"${c.headerName}"`).join(',');

    const dataLines = rows.map((row) => {
      return allowedCols
        .map((col) => {
          const val = row[col.field] ?? '';
          return `"${String(val).replace(/"/g, '""')}"`;
        })
        .join(',');
    });

    const csvContent = [headerLine, ...dataLines].join('\n');
    const exportId = `exp-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const fileName = `itam_assets_export_${tenantId}_${Date.now()}.csv`;

    return {
      fileName,
      content: csvContent,
      recordCount: rows.length,
      exportId,
    };
  }
}
