// ==================== AG GRID & DASHBOARD TYPES ====================
// Isolated type definitions for Enterprise Data Grid, Server-Side Row Model, Grouping, Pivoting, Saved Views, and Dashboards.

export interface GridColumnDef {
  field: string;
  headerName: string;
  width?: number;
  sortable?: boolean;
  filterable?: boolean;
  groupable?: boolean;
  pivotable?: boolean;
  pinned?: 'left' | 'right' | null;
  visible?: boolean;
  type?: 'string' | 'number' | 'currency' | 'date' | 'badge';
}

export interface GridFilterModel {
  field: string;
  operator: 'contains' | 'equals' | 'startsWith' | 'greaterThan' | 'lessThan' | 'in';
  value: any;
}

export interface GridSortModel {
  field: string;
  sort: 'asc' | 'desc';
}

export interface GridServerSideRequest {
  startRow: number;
  endRow: number;
  sortModel: GridSortModel[];
  filterModel: GridFilterModel[];
  groupKeys: string[];
  pivotCols: string[];
  pivotMode: boolean;
  globalSearch?: string;
  tenantId: string;
}

export interface GridServerSideResponse<T = any> {
  rows: T[];
  totalRowCount: number;
  pivotFields?: string[];
  aggregations?: Record<string, number | string>;
}

export interface SavedGridView {
  viewId: string;
  viewName: string;
  tenantId: string;
  createdByRole: string;
  isDefault: boolean;
  columns: GridColumnDef[];
  sortModel: GridSortModel[];
  filterModel: GridFilterModel[];
  groupKeys: string[];
  pivotMode: boolean;
  createdAt: string;
}

export type DashboardDomain =
  | 'itam'
  | 'cmdb'
  | 'discovery'
  | 'sam'
  | 'financial'
  | 'compliance'
  | 'workflow'
  | 'analytics';

export interface DashboardFilter {
  tenantId: string;
  dateRange: '7d' | '30d' | '90d' | '1y';
  department?: string;
  location?: string;
  criticality?: string;
}

export interface DashboardMetricCard {
  id: string;
  title: string;
  value: string | number;
  change: string;
  isIncrease: boolean;
  targetDomain: DashboardDomain;
  drillDownFilter?: GridFilterModel;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  secondaryValue?: number;
  category?: string;
}
