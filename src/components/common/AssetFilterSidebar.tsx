import React, { useState } from 'react';
import {
  Filter,
  X,
  Search,
  Calendar,
  User,
  SlidersHorizontal,
  ArrowUpDown,
  RotateCcw,
  Tag,
  Building2,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export interface AssetFilterState {
  searchQuery: string;
  status: string;
  owner: string;
  dateRangePreset: 'ALL' | 'LAST_30' | 'LAST_90' | '2026' | '2025' | 'CUSTOM';
  startDate: string;
  endDate: string;
  categoryOrPublisher: string;
  locationOrMetric: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export const DEFAULT_FILTER_STATE: AssetFilterState = {
  searchQuery: '',
  status: 'ALL',
  owner: 'ALL',
  dateRangePreset: 'ALL',
  startDate: '',
  endDate: '',
  categoryOrPublisher: 'ALL',
  locationOrMetric: 'ALL',
  sortBy: 'name',
  sortOrder: 'asc',
};

export function filterByDateRange(
  itemDateStr: string | undefined,
  preset: AssetFilterState['dateRangePreset'],
  customStart?: string,
  customEnd?: string
): boolean {
  if (preset === 'ALL') return true;
  if (!itemDateStr) return false;

  const itemDate = new Date(itemDateStr);
  if (isNaN(itemDate.getTime())) return true;

  const now = new Date();

  if (preset === 'LAST_30') {
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    return itemDate >= thirtyDaysAgo;
  }

  if (preset === 'LAST_90') {
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    return itemDate >= ninetyDaysAgo;
  }

  if (preset === '2026') {
    return itemDate.getFullYear() === 2026;
  }

  if (preset === '2025') {
    return itemDate.getFullYear() === 2025;
  }

  if (preset === 'CUSTOM') {
    if (customStart) {
      const start = new Date(customStart);
      if (!isNaN(start.getTime()) && itemDate < start) return false;
    }
    if (customEnd) {
      const end = new Date(customEnd);
      // set end time to end of day
      end.setHours(23, 59, 59, 999);
      if (!isNaN(end.getTime()) && itemDate > end) return false;
    }
    return true;
  }

  return true;
}

export interface SortOption {
  label: string;
  value: string;
}

interface AssetFilterSidebarProps {
  type: 'hardware' | 'software';
  filterState: AssetFilterState;
  onFilterChange: (newState: AssetFilterState) => void;
  statusOptions: string[];
  ownerOptions: string[];
  categoryOrPublisherOptions: string[];
  locationOrMetricOptions?: string[];
  sortOptions: SortOption[];
  totalItemCount: number;
  filteredItemCount: number;
  isOpen?: boolean;
  onClose?: () => void;
}

export const AssetFilterSidebar: React.FC<AssetFilterSidebarProps> = ({
  type,
  filterState = DEFAULT_FILTER_STATE,
  onFilterChange,
  statusOptions = [],
  ownerOptions = [],
  categoryOrPublisherOptions = [],
  locationOrMetricOptions = [],
  sortOptions = [],
  totalItemCount = 0,
  filteredItemCount = 0,
  isOpen = true,
  onClose,
}) => {
  const safeStatusOptions = statusOptions || [];
  const safeOwnerOptions = ownerOptions || [];
  const safeCategoryOptions = categoryOrPublisherOptions || [];
  const safeLocationOptions = locationOrMetricOptions || [];
  const safeSortOptions = sortOptions || [];

  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (sectionKey: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  };

  const updateField = <K extends keyof AssetFilterState>(field: K, value: AssetFilterState[K]) => {
    onFilterChange({
      ...filterState,
      [field]: value,
    });
  };

  const handleResetFilters = () => {
    onFilterChange(DEFAULT_FILTER_STATE);
  };

  // Count how many non-default filters are active
  const activeFilterCount = [
    (filterState?.searchQuery || '') !== '',
    filterState?.status !== 'ALL',
    filterState?.owner !== 'ALL',
    filterState?.dateRangePreset !== 'ALL',
    filterState?.categoryOrPublisher !== 'ALL',
    filterState?.locationOrMetric !== 'ALL',
  ].filter(Boolean).length;

  return (
    <aside
      className={`w-full md:w-72 bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-5 font-mono text-xs text-zinc-300 flex flex-col shrink-0 ${
        !isOpen ? 'hidden md:flex' : 'flex'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-red-600/20 border border-red-500/30 rounded text-red-500">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm tracking-tight flex items-center space-x-2">
              <span>{type === 'hardware' ? 'HARDWARE' : 'SOFTWARE'} FILTERS</span>
            </h3>
            <span className="text-[10px] text-zinc-400">
              Showing <span className="text-white font-bold">{filteredItemCount}</span> of {totalItemCount} items
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          {activeFilterCount > 0 && (
            <button
              onClick={handleResetFilters}
              className="p-1 text-zinc-400 hover:text-red-400 hover:bg-zinc-900 rounded transition-colors cursor-pointer flex items-center space-x-1 text-[10px]"
              title="Reset All Filters"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear</span>
            </button>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="md:hidden p-1 text-zinc-400 hover:text-white rounded cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Active Filter Badges */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-1.5 bg-zinc-900/80 p-2 border border-zinc-800 rounded-lg">
          <span className="text-[10px] font-bold text-red-400 uppercase w-full">Active Filters ({activeFilterCount})</span>
          {filterState.searchQuery && (
            <span className="bg-zinc-800 text-white text-[10px] px-2 py-0.5 rounded flex items-center space-x-1 border border-zinc-700">
              <span>"{filterState.searchQuery}"</span>
              <X className="w-3 h-3 cursor-pointer hover:text-red-400" onClick={() => updateField('searchQuery', '')} />
            </span>
          )}
          {filterState.status !== 'ALL' && (
            <span className="bg-zinc-800 text-white text-[10px] px-2 py-0.5 rounded flex items-center space-x-1 border border-zinc-700">
              <span>Status: {filterState.status}</span>
              <X className="w-3 h-3 cursor-pointer hover:text-red-400" onClick={() => updateField('status', 'ALL')} />
            </span>
          )}
          {filterState.owner !== 'ALL' && (
            <span className="bg-zinc-800 text-white text-[10px] px-2 py-0.5 rounded flex items-center space-x-1 border border-zinc-700">
              <span>Owner: {filterState.owner}</span>
              <X className="w-3 h-3 cursor-pointer hover:text-red-400" onClick={() => updateField('owner', 'ALL')} />
            </span>
          )}
          {filterState.dateRangePreset !== 'ALL' && (
            <span className="bg-zinc-800 text-white text-[10px] px-2 py-0.5 rounded flex items-center space-x-1 border border-zinc-700">
              <span>Date: {filterState.dateRangePreset}</span>
              <X className="w-3 h-3 cursor-pointer hover:text-red-400" onClick={() => updateField('dateRangePreset', 'ALL')} />
            </span>
          )}
          {filterState.categoryOrPublisher !== 'ALL' && (
            <span className="bg-zinc-800 text-white text-[10px] px-2 py-0.5 rounded flex items-center space-x-1 border border-zinc-700">
              <span>{type === 'hardware' ? 'Category' : 'Publisher'}: {filterState.categoryOrPublisher}</span>
              <X className="w-3 h-3 cursor-pointer hover:text-red-400" onClick={() => updateField('categoryOrPublisher', 'ALL')} />
            </span>
          )}
          {filterState.locationOrMetric !== 'ALL' && (
            <span className="bg-zinc-800 text-white text-[10px] px-2 py-0.5 rounded flex items-center space-x-1 border border-zinc-700">
              <span>{type === 'hardware' ? 'Location' : 'Metric'}: {filterState.locationOrMetric}</span>
              <X className="w-3 h-3 cursor-pointer hover:text-red-400" onClick={() => updateField('locationOrMetric', 'ALL')} />
            </span>
          )}
        </div>
      )}

      {/* 1. SEARCH FILTER */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
          Search Keywords
        </label>
        <div className="flex items-center space-x-2 bg-black border border-zinc-800 rounded px-2.5 py-1.5 focus-within:border-red-500">
          <Search className="w-3 h-3 text-zinc-500" />
          <input
            type="text"
            placeholder={type === 'hardware' ? 'Tag, Serial, Host, Model...' : 'Product, Publisher, Contract...'}
            value={filterState.searchQuery}
            onChange={(e) => updateField('searchQuery', e.target.value)}
            className="bg-transparent text-white placeholder-zinc-600 focus:outline-none w-full text-xs"
          />
          {filterState.searchQuery && (
            <X className="w-3 h-3 text-zinc-500 hover:text-white cursor-pointer" onClick={() => updateField('searchQuery', '')} />
          )}
        </div>
      </div>

      {/* 2. SORTING CONTROLS */}
      <div className="space-y-1.5 border-t border-zinc-900 pt-3">
        <div
          onClick={() => toggleSection('sorting')}
          className="flex justify-between items-center cursor-pointer text-[10px] font-bold text-zinc-400 uppercase tracking-wider hover:text-white"
        >
          <span className="flex items-center space-x-1">
            <ArrowUpDown className="w-3 h-3 text-red-500" />
            <span>Sorting & Direction</span>
          </span>
          {collapsedSections['sorting'] ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
        </div>

        {!collapsedSections['sorting'] && (
          <div className="space-y-2 pt-1">
            <div className="grid grid-cols-2 gap-2">
              <select
                value={filterState.sortBy}
                onChange={(e) => updateField('sortBy', e.target.value)}
                className="bg-black border border-zinc-800 text-white font-bold text-xs p-2 rounded focus:outline-none focus:border-red-500 cursor-pointer"
              >
                {safeSortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              <button
                onClick={() => updateField('sortOrder', filterState.sortOrder === 'asc' ? 'desc' : 'asc')}
                className="bg-black hover:bg-zinc-900 border border-zinc-800 text-white font-bold p-2 rounded flex items-center justify-center space-x-1 cursor-pointer"
              >
                <span>{filterState.sortOrder === 'asc' ? 'Ascending (A-Z / Min)' : 'Descending (Z-A / Max)'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. STATUS FILTER */}
      <div className="space-y-1.5 border-t border-zinc-900 pt-3">
        <div
          onClick={() => toggleSection('status')}
          className="flex justify-between items-center cursor-pointer text-[10px] font-bold text-zinc-400 uppercase tracking-wider hover:text-white"
        >
          <span className="flex items-center space-x-1">
            <Tag className="w-3 h-3 text-red-500" />
            <span>{type === 'hardware' ? 'Lifecycle Stage' : 'Compliance Status'}</span>
          </span>
          {collapsedSections['status'] ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
        </div>

        {!collapsedSections['status'] && (
          <div className="flex flex-wrap gap-1 pt-1">
            {safeStatusOptions.map((st) => {
              const isSelected = filterState.status === st;
              return (
                <button
                  key={st}
                  onClick={() => updateField('status', st)}
                  className={`text-[10px] font-bold px-2 py-1 rounded transition-colors cursor-pointer border ${
                    isSelected
                      ? 'bg-red-600 text-white border-red-500'
                      : 'bg-black text-zinc-400 hover:text-white border-zinc-800'
                  }`}
                >
                  {st}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. OWNER / ASSIGNED USER FILTER */}
      <div className="space-y-1.5 border-t border-zinc-900 pt-3">
        <div
          onClick={() => toggleSection('owner')}
          className="flex justify-between items-center cursor-pointer text-[10px] font-bold text-zinc-400 uppercase tracking-wider hover:text-white"
        >
          <span className="flex items-center space-x-1">
            <User className="w-3 h-3 text-red-500" />
            <span>{type === 'hardware' ? 'Assigned Owner / User' : 'Publisher / Owner'}</span>
          </span>
          {collapsedSections['owner'] ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
        </div>

        {!collapsedSections['owner'] && (
          <div className="pt-1">
            <select
              value={filterState.owner}
              onChange={(e) => updateField('owner', e.target.value)}
              className="w-full bg-black border border-zinc-800 text-white font-bold text-xs p-2 rounded focus:outline-none focus:border-red-500 cursor-pointer"
            >
              <option value="ALL">All Owners / Users</option>
              {safeOwnerOptions.map((ow) => (
                <option key={ow} value={ow}>
                  {ow}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 5. INSTALLATION / PURCHASE DATE RANGE FILTER */}
      <div className="space-y-1.5 border-t border-zinc-900 pt-3">
        <div
          onClick={() => toggleSection('date')}
          className="flex justify-between items-center cursor-pointer text-[10px] font-bold text-zinc-400 uppercase tracking-wider hover:text-white"
        >
          <span className="flex items-center space-x-1">
            <Calendar className="w-3 h-3 text-red-500" />
            <span>Installation / Purchase Date</span>
          </span>
          {collapsedSections['date'] ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
        </div>

        {!collapsedSections['date'] && (
          <div className="space-y-2 pt-1">
            <div className="grid grid-cols-2 gap-1">
              {[
                { label: 'All Time', value: 'ALL' },
                { label: 'Last 30 Days', value: 'LAST_30' },
                { label: 'Last 90 Days', value: 'LAST_90' },
                { label: 'Year 2026', value: '2026' },
                { label: 'Year 2025', value: '2025' },
                { label: 'Custom Range', value: 'CUSTOM' },
              ].map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => updateField('dateRangePreset', preset.value as any)}
                  className={`text-[10px] font-bold px-2 py-1 rounded transition-colors cursor-pointer border ${
                    filterState.dateRangePreset === preset.value
                      ? 'bg-red-600 text-white border-red-500'
                      : 'bg-black text-zinc-400 hover:text-white border-zinc-800'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {filterState.dateRangePreset === 'CUSTOM' && (
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-900">
                <div>
                  <label className="text-[9px] text-zinc-500 block mb-1">From Date</label>
                  <input
                    type="date"
                    value={filterState.startDate}
                    onChange={(e) => updateField('startDate', e.target.value)}
                    className="w-full bg-black border border-zinc-800 text-white p-1.5 rounded text-[10px] focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-zinc-500 block mb-1">To Date</label>
                  <input
                    type="date"
                    value={filterState.endDate}
                    onChange={(e) => updateField('endDate', e.target.value)}
                    className="w-full bg-black border border-zinc-800 text-white p-1.5 rounded text-[10px] focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 6. CATEGORY / PUBLISHER FILTER */}
      <div className="space-y-1.5 border-t border-zinc-900 pt-3">
        <div
          onClick={() => toggleSection('category')}
          className="flex justify-between items-center cursor-pointer text-[10px] font-bold text-zinc-400 uppercase tracking-wider hover:text-white"
        >
          <span className="flex items-center space-x-1">
            <Building2 className="w-3 h-3 text-red-500" />
            <span>{type === 'hardware' ? 'Category / Type' : 'Publisher'}</span>
          </span>
          {collapsedSections['category'] ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
        </div>

        {!collapsedSections['category'] && (
          <div className="pt-1">
            <select
              value={filterState.categoryOrPublisher}
              onChange={(e) => updateField('categoryOrPublisher', e.target.value)}
              className="w-full bg-black border border-zinc-800 text-white font-bold text-xs p-2 rounded focus:outline-none focus:border-red-500 cursor-pointer"
            >
              <option value="ALL">All {type === 'hardware' ? 'Categories' : 'Publishers'}</option>
              {safeCategoryOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 7. LOCATION OR METRIC FILTER */}
      {safeLocationOptions.length > 0 && (
        <div className="space-y-1.5 border-t border-zinc-900 pt-3">
          <div
            onClick={() => toggleSection('location')}
            className="flex justify-between items-center cursor-pointer text-[10px] font-bold text-zinc-400 uppercase tracking-wider hover:text-white"
          >
            <span className="flex items-center space-x-1">
              <Tag className="w-3 h-3 text-red-500" />
              <span>{type === 'hardware' ? 'Location' : 'Metric'}</span>
            </span>
            {collapsedSections['location'] ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
          </div>

          {!collapsedSections['location'] && (
            <div className="pt-1">
              <select
                value={filterState.locationOrMetric}
                onChange={(e) => updateField('locationOrMetric', e.target.value)}
                className="w-full bg-black border border-zinc-800 text-white font-bold text-xs p-2 rounded focus:outline-none focus:border-red-500 cursor-pointer"
              >
                <option value="ALL">All {type === 'hardware' ? 'Locations' : 'Metrics'}</option>
                {safeLocationOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}
    </aside>
  );
};
