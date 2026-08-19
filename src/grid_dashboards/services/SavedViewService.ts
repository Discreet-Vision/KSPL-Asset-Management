// ==================== SAVED VIEW SERVICE ====================
// Tenant-aware and RBAC-governed Saved Grid View Service for AG Grid configurations.

import { SavedGridView, GridColumnDef } from '../types/gridDashboardTypes';
import { GridDataAdapter } from '../adapters/GridDataAdapter';

export class SavedViewService {
  private static viewsStore: Map<string, SavedGridView> = new Map();

  constructor() {
    this.seedDefaultViews();
  }

  private seedDefaultViews() {
    if (SavedViewService.viewsStore.size > 0) return;

    const columns = GridDataAdapter.getColumnDefinitions();

    const view1: SavedGridView = {
      viewId: 'view-critical-assets',
      viewName: 'Critical Infrastructure Assets',
      tenantId: 'tenant-kspl-global',
      createdByRole: 'ADMIN',
      isDefault: true,
      columns,
      sortModel: [{ field: 'purchaseCost', sort: 'desc' }],
      filterModel: [{ field: 'criticality', operator: 'equals', value: 'CRITICAL' }],
      groupKeys: ['department', 'location'],
      pivotMode: false,
      createdAt: new Date().toISOString(),
    };

    const view2: SavedGridView = {
      viewId: 'view-finance-depreciation',
      viewName: 'Financial Asset Depreciation View',
      tenantId: 'tenant-kspl-global',
      createdByRole: 'FINANCE',
      isDefault: false,
      columns: columns.filter((c) => ['id', 'name', 'department', 'purchaseCost', 'depreciatedValue'].includes(c.field)),
      sortModel: [{ field: 'depreciatedValue', sort: 'desc' }],
      filterModel: [],
      groupKeys: ['department'],
      pivotMode: true,
      createdAt: new Date().toISOString(),
    };

    SavedViewService.viewsStore.set(view1.viewId, view1);
    SavedViewService.viewsStore.set(view2.viewId, view2);
  }

  public getSavedViews(tenantId: string): SavedGridView[] {
    return Array.from(SavedViewService.viewsStore.values()).filter((v) => v.tenantId === tenantId);
  }

  public saveView(view: SavedGridView): void {
    SavedViewService.viewsStore.set(view.viewId, view);
  }

  public deleteView(viewId: string, tenantId: string): boolean {
    const view = SavedViewService.viewsStore.get(viewId);
    if (!view || view.tenantId !== tenantId) return false;
    SavedViewService.viewsStore.delete(viewId);
    return true;
  }
}
