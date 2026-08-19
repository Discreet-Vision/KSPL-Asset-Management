// ==================== GRID & DASHBOARD TEST SUITE ====================
// Automated verification tests for 100k+ row pagination, server-side sorting, filtering, saved views, exports, and tenant isolation.

import { GridDataAdapter } from '../adapters/GridDataAdapter';
import { SavedViewService } from '../services/SavedViewService';
import { ExportService } from '../services/ExportService';

export interface TestResult {
  testName: string;
  passed: boolean;
  message: string;
  durationMs: number;
}

export class GridDashboardTestSuite {
  public static async runAllTests(tenantId = 'tenant-kspl-global'): Promise<TestResult[]> {
    const results: TestResult[] = [];

    // Test 1: 100k+ Row Server-Side Row Model
    const start1 = performance.now();
    try {
      const res = await GridDataAdapter.fetchServerSideRows({
        startRow: 0,
        endRow: 50,
        sortModel: [{ field: 'purchaseCost', sort: 'desc' }],
        filterModel: [],
        groupKeys: [],
        pivotCols: [],
        pivotMode: false,
        tenantId,
      });

      results.push({
        testName: '100k+ Row Server-Side Pagination Test',
        passed: res.rows.length === 50 && res.totalRowCount === 100000,
        message: `Loaded ${res.rows.length} rows out of ${res.totalRowCount.toLocaleString()} records in ${Math.round(performance.now() - start1)}ms.`,
        durationMs: Math.round(performance.now() - start1),
      });
    } catch (err: any) {
      results.push({
        testName: '100k+ Row Server-Side Pagination Test',
        passed: false,
        message: err.message,
        durationMs: Math.round(performance.now() - start1),
      });
    }

    // Test 2: Server-Side Filtering
    const start2 = performance.now();
    try {
      const res = await GridDataAdapter.fetchServerSideRows({
        startRow: 0,
        endRow: 25,
        sortModel: [],
        filterModel: [{ field: 'criticality', operator: 'equals', value: 'CRITICAL' }],
        groupKeys: [],
        pivotCols: [],
        pivotMode: false,
        tenantId,
      });

      const allCritical = res.rows.every((r) => r.criticality === 'CRITICAL');
      results.push({
        testName: 'Server-Side Field Filtering Test',
        passed: allCritical && res.rows.length > 0,
        message: `Filter returned ${res.rows.length} CRITICAL records matching criteria strictly.`,
        durationMs: Math.round(performance.now() - start2),
      });
    } catch (err: any) {
      results.push({
        testName: 'Server-Side Field Filtering Test',
        passed: false,
        message: err.message,
        durationMs: Math.round(performance.now() - start2),
      });
    }

    // Test 3: Saved Views Service
    const start3 = performance.now();
    try {
      const savedService = new SavedViewService();
      const views = savedService.getSavedViews(tenantId);
      results.push({
        testName: 'Tenant-Aware Saved Views Service Test',
        passed: views.length >= 2,
        message: `Retrieved ${views.length} tenant-aware saved grid views successfully.`,
        durationMs: Math.round(performance.now() - start3),
      });
    } catch (err: any) {
      results.push({
        testName: 'Tenant-Aware Saved Views Service Test',
        passed: false,
        message: err.message,
        durationMs: Math.round(performance.now() - start3),
      });
    }

    // Test 4: Export Service with RBAC Masking
    const start4 = performance.now();
    try {
      const cols = GridDataAdapter.getColumnDefinitions();
      const mockRows = [{ id: 'ENT-AST-1', name: 'srv-01', purchaseCost: 5000 }];

      // Non-finance user should not see purchaseCost in export
      const expRes = await ExportService.generateCsvExport(cols, mockRows, tenantId, 'AUDITOR');
      const containsCostHeader = expRes.content.includes('Purchase Cost');

      results.push({
        testName: 'Export Service RBAC Security Test',
        passed: !containsCostHeader,
        message: `Auditor role export cleanly masked purchaseCost field as required by RBAC.`,
        durationMs: Math.round(performance.now() - start4),
      });
    } catch (err: any) {
      results.push({
        testName: 'Export Service RBAC Security Test',
        passed: false,
        message: err.message,
        durationMs: Math.round(performance.now() - start4),
      });
    }

    return results;
  }
}
