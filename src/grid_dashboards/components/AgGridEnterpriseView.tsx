import React, { useState, useEffect } from 'react';
import {
  Table as TableIcon,
  Search,
  Filter,
  ArrowUpDown,
  Download,
  Bookmark,
  Layers,
  Sliders,
  CheckSquare,
  Square,
  RefreshCw,
  Eye,
  EyeOff,
  Columns,
  Pin,
  ChevronLeft,
  ChevronRight,
  Shield,
  Zap,
} from 'lucide-react';

import { GridDataAdapter } from '../adapters/GridDataAdapter';
import { SavedViewService } from '../services/SavedViewService';
import { ExportService } from '../services/ExportService';
import { GridColumnDef, GridSortModel, GridFilterModel, SavedGridView } from '../types/gridDashboardTypes';

export const AgGridEnterpriseView: React.FC<{
  tenantId?: string;
  userRole?: string;
  externalFilter?: GridFilterModel;
}> = ({ tenantId = 'tenant-kspl-global', userRole = 'ADMIN', externalFilter }) => {
  const [columns, setColumns] = useState<GridColumnDef[]>(GridDataAdapter.getColumnDefinitions());
  const [rows, setRows] = useState<any[]>([]);
  const [totalRowCount, setTotalRowCount] = useState(100000);
  const [pageSize, setPageSize] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Sorting & Filtering
  const [sortModel, setSortModel] = useState<GridSortModel[]>([{ field: 'id', sort: 'asc' }]);
  const [filterModel, setFilterModel] = useState<GridFilterModel[]>(externalFilter ? [externalFilter] : []);
  const [globalSearch, setGlobalSearch] = useState('');

  // Grouping & Pivoting
  const [groupKeys, setGroupKeys] = useState<string[]>([]);
  const [isPivotMode, setIsPivotMode] = useState(false);
  const [pivotCols, setPivotCols] = useState<string[]>(['department']);

  // Selection & Saved Views
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());
  const [savedViews, setSavedViews] = useState<SavedGridView[]>([]);
  const [selectedViewId, setSelectedViewId] = useState<string>('');
  const [aggregations, setAggregations] = useState<any>({});
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const savedViewService = new SavedViewService();

  useEffect(() => {
    setSavedViews(savedViewService.getSavedViews(tenantId));
  }, [tenantId]);

  useEffect(() => {
    if (externalFilter) {
      setFilterModel([externalFilter]);
    }
  }, [externalFilter]);

  useEffect(() => {
    loadGridData();
  }, [currentPage, pageSize, sortModel, filterModel, globalSearch, isPivotMode, tenantId]);

  const loadGridData = async () => {
    setIsLoading(true);
    const startRow = (currentPage - 1) * pageSize;
    const endRow = currentPage * pageSize;

    const res = await GridDataAdapter.fetchServerSideRows({
      startRow,
      endRow,
      sortModel,
      filterModel,
      groupKeys,
      pivotCols,
      pivotMode: isPivotMode,
      globalSearch,
      tenantId,
    });

    setRows(res.rows);
    setTotalRowCount(res.totalRowCount);
    setAggregations(res.aggregations || {});
    setIsLoading(false);
  };

  const handleSortToggle = (field: string) => {
    const existing = sortModel.find((s) => s.field === field);
    if (!existing) {
      setSortModel([{ field, sort: 'asc' }]);
    } else if (existing.sort === 'asc') {
      setSortModel([{ field, sort: 'desc' }]);
    } else {
      setSortModel([]);
    }
  };

  const handleColumnVisibilityToggle = (field: string) => {
    setColumns(
      columns.map((c) => (c.field === field ? { ...c, visible: !c.visible } : c))
    );
  };

  const handleApplySavedView = (viewId: string) => {
    setSelectedViewId(viewId);
    const view = savedViews.find((v) => v.viewId === viewId);
    if (view) {
      setColumns(view.columns);
      setSortModel(view.sortModel);
      setFilterModel(view.filterModel);
      setGroupKeys(view.groupKeys);
      setIsPivotMode(view.pivotMode);
    }
  };

  const handleExportCsv = async () => {
    const res = await ExportService.generateCsvExport(columns, rows, tenantId, userRole);
    setExportNotice(`Export ready: '${res.fileName}' (${res.recordCount} rows exported).`);
    setTimeout(() => setExportNotice(null), 5000);
  };

  const toggleSelectRow = (id: string) => {
    const next = new Set(selectedRowIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedRowIds(next);
  };

  const toggleSelectAll = () => {
    if (selectedRowIds.size === rows.length) {
      setSelectedRowIds(new Set());
    } else {
      setSelectedRowIds(new Set(rows.map((r) => r.id)));
    }
  };

  const visibleColumns = columns.filter((c) => c.visible !== false);

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 font-mono text-xs text-white space-y-4">
      {/* Grid Title & Control Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-red-600 rounded border border-red-500">
            <TableIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-bold text-white text-sm tracking-tight">AG GRID ENTERPRISE VIEW</h2>
              <span className="px-2 py-0.5 bg-red-600/20 text-red-400 border border-red-500/40 rounded text-[10px] font-bold">
                100K+ ROW SERVER-SIDE MODEL
              </span>
            </div>
            <p className="text-zinc-400 text-[11px] mt-0.5">
              Virtual Scrolling • Multi-Column Sort • Pivot & Grouping • Saved Views • Export
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Saved View Selector */}
          <div className="flex items-center space-x-1.5 bg-black border border-zinc-800 rounded px-2 py-1">
            <Bookmark className="w-3.5 h-3.5 text-red-500" />
            <select
              value={selectedViewId}
              onChange={(e) => handleApplySavedView(e.target.value)}
              className="bg-black text-white text-[11px] focus:outline-none cursor-pointer"
            >
              <option value="">-- Saved Grid Views --</option>
              {savedViews.map((v) => (
                <option key={v.viewId} value={v.viewId}>
                  {v.viewName}
                </option>
              ))}
            </select>
          </div>

          {/* Pivot Mode Toggle */}
          <button
            onClick={() => setIsPivotMode(!isPivotMode)}
            className={`px-3 py-1.5 rounded border text-[11px] font-bold cursor-pointer transition-colors flex items-center space-x-1 ${
              isPivotMode
                ? 'bg-red-600 text-white border-red-500'
                : 'bg-black text-zinc-400 border-zinc-800 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Pivot Mode</span>
          </button>

          {/* Export Button */}
          <button
            onClick={handleExportCsv}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded border border-red-500 text-[11px] cursor-pointer flex items-center space-x-1 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Export Notice Banner */}
      {exportNotice && (
        <div className="p-2.5 bg-red-600/20 border border-red-500 text-red-400 text-[11px] font-bold rounded flex items-center justify-between">
          <span>{exportNotice}</span>
          <button onClick={() => setExportNotice(null)} className="cursor-pointer hover:text-white">✕</button>
        </div>
      )}

      {/* Filter & Column Toggle Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-black p-3 border border-zinc-800 rounded">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-500 absolute left-2.5 top-2.5" />
          <input
            type="text"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            placeholder="Search 100,000+ assets across fields..."
            className="w-full bg-zinc-950 text-white border border-zinc-800 rounded pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:border-red-500"
          />
        </div>

        {/* Aggregations Bar */}
        <div className="flex items-center justify-around text-[11px] text-zinc-400 border-x border-zinc-800 px-2">
          <div>Total: <strong className="text-white">{aggregations.totalCount || 100000}</strong></div>
          <div>Value: <strong className="text-red-400">{aggregations.totalValueUsd || '$0'}</strong></div>
          <div>Lat: <strong className="text-white">{aggregations.executionTimeMs || '1.2ms'}</strong></div>
        </div>

        {/* Column Visibility Menu */}
        <div className="flex items-center justify-end space-x-1.5">
          <Columns className="w-4 h-4 text-zinc-500" />
          <span className="text-zinc-400 text-[11px]">Toggle Fields:</span>
          <div className="flex flex-wrap gap-1 max-w-xs overflow-x-auto">
            {columns.map((c) => (
              <button
                key={c.field}
                onClick={() => handleColumnVisibilityToggle(c.field)}
                className={`px-1.5 py-0.5 rounded text-[9px] border cursor-pointer ${
                  c.visible !== false
                    ? 'bg-zinc-800 text-white border-zinc-700'
                    : 'bg-zinc-950 text-zinc-600 border-zinc-900 line-through'
                }`}
              >
                {c.headerName}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid Data Table */}
      <div className="overflow-x-auto border border-zinc-800 rounded-lg">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-black border-b border-zinc-800 text-zinc-400 text-[10px] uppercase font-bold">
              <th className="p-3 w-10 text-center">
                <button onClick={toggleSelectAll} className="cursor-pointer">
                  {selectedRowIds.size === rows.length && rows.length > 0 ? (
                    <CheckSquare className="w-4 h-4 text-red-500" />
                  ) : (
                    <Square className="w-4 h-4 text-zinc-600" />
                  )}
                </button>
              </th>
              {visibleColumns.map((col) => {
                const isSorted = sortModel.some((s) => s.field === col.field);
                return (
                  <th key={col.field} className="p-3">
                    <button
                      onClick={() => handleSortToggle(col.field)}
                      className="flex items-center space-x-1 hover:text-white cursor-pointer"
                    >
                      <span>{col.headerName}</span>
                      <ArrowUpDown className={`w-3 h-3 ${isSorted ? 'text-red-500' : 'text-zinc-600'}`} />
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800 bg-zinc-950">
            {isLoading ? (
              <tr>
                <td colSpan={visibleColumns.length + 1} className="p-12 text-center text-zinc-500">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto text-red-500 mb-2" />
                  <span>Loading Server-Side Row Model slice...</span>
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={visibleColumns.length + 1} className="p-12 text-center text-zinc-500">
                  No records match current filter criteria.
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const isSelected = selectedRowIds.has(row.id);
                return (
                  <tr
                    key={row.id}
                    className={`hover:bg-zinc-900 transition-colors ${isSelected ? 'bg-red-950/20' : ''}`}
                  >
                    <td className="p-3 text-center">
                      <button onClick={() => toggleSelectRow(row.id)} className="cursor-pointer">
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-red-500" />
                        ) : (
                          <Square className="w-4 h-4 text-zinc-600" />
                        )}
                      </button>
                    </td>

                    {visibleColumns.map((col) => {
                      const val = row[col.field];
                      if (col.type === 'currency') {
                        return (
                          <td key={col.field} className="p-3 text-white font-bold">
                            ${Number(val).toLocaleString()}
                          </td>
                        );
                      }
                      if (col.type === 'badge') {
                        return (
                          <td key={col.field} className="p-3">
                            <span className="px-2 py-0.5 bg-black border border-zinc-700 text-zinc-300 rounded text-[10px] uppercase font-bold">
                              {val}
                            </span>
                          </td>
                        );
                      }
                      return (
                        <td key={col.field} className="p-3 text-zinc-300">
                          {val}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination & Footer Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-zinc-800 pt-3">
        <div className="text-zinc-500 text-[11px]">
          Showing Page <strong className="text-white">{currentPage}</strong> of{' '}
          <strong className="text-white">{Math.ceil(totalRowCount / pageSize)}</strong> ({totalRowCount.toLocaleString()} Total Records)
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="bg-black text-white border border-zinc-800 rounded px-2 py-1 text-xs focus:outline-none"
          >
            <option value={10}>10 rows / page</option>
            <option value={25}>25 rows / page</option>
            <option value={50}>50 rows / page</option>
            <option value={100}>100 rows / page</option>
          </select>

          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="p-1.5 bg-black border border-zinc-800 text-white rounded disabled:opacity-30 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            disabled={currentPage >= Math.ceil(totalRowCount / pageSize)}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="p-1.5 bg-black border border-zinc-800 text-white rounded disabled:opacity-30 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
