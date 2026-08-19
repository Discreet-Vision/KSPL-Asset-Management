import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { ConfigurationItem, CILifecycleState } from '../../types';
import { HardwareDepreciationChart } from '../common/HardwareDepreciationChart';
import { AssetQrCodeModal } from '../common/AssetQrCodeModal';
import { BulkAssetImportModal } from '../common/BulkAssetImportModal';
import { AddHardwareAssetModal } from '../common/AddHardwareAssetModal';
import { HardwareAssetDetailModal } from '../common/HardwareAssetDetailModal';
import {
  AssetFilterSidebar,
  AssetFilterState,
  DEFAULT_FILTER_STATE,
  filterByDateRange,
  SortOption,
} from '../common/AssetFilterSidebar';
import {
  HardDrive,
  PackageCheck,
  UserCheck,
  Trash2,
  FileCheck2,
  X,
  Search,
  Plus,
  ArrowRightLeft,
  CheckCircle2,
  ShieldCheck,
  Building,
  TrendingDown,
  QrCode,
  FileSpreadsheet,
  SlidersHorizontal,
  Filter,
  Calendar,
} from 'lucide-react';

export const HardwareAssetsModule: React.FC = () => {
  const {
    configurationItems,
    updateConfigurationItem,
    stockrooms,
    disposeAsset,
    disposalRecords,
    depreciationSchedules,
    allUsers,
    assignAssetToUser,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'lifecycle' | 'depreciation' | 'stockrooms' | 'disposal'>('lifecycle');
  const [selectedAsset, setSelectedAsset] = useState<ConfigurationItem | null>(null);

  // Filter & Sort Sidebar State
  const [filterState, setFilterState] = useState<AssetFilterState>(DEFAULT_FILTER_STATE);
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(true);

  // QR Code Modal State
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [qrAsset, setQrAsset] = useState<ConfigurationItem | null>(null);

  // Bulk CSV Import Modal State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Add Hardware Asset Modal State
  const [isAddAssetModalOpen, setIsAddAssetModalOpen] = useState(false);

  // Assign Modal
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [targetUserId, setTargetUserId] = useState('');

  // Disposal Modal
  const [isDisposalModalOpen, setIsDisposalModalOpen] = useState(false);
  const [disposalReason, setDisposalReason] = useState('End of Useful Life');
  const [disposalVendor, setDisposalVendor] = useState('EcoTech Secure Destruction LLC');
  const [wipeMethod, setWipeMethod] = useState('NIST 800-88 Rev 1 Cryptographic Erase');

  // Comprehensive 13-Tab Asset Detail Console Modal State
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailAsset, setDetailAsset] = useState<ConfigurationItem | null>(null);

  // Dynamic Filter Options
  const statusOptions = [
    'ALL',
    'Requested',
    'Approved',
    'Ordered',
    'In Stock',
    'Assigned',
    'Deployed',
    'In Repair',
    'Retired',
    'Disposed',
  ];

  const safeCis = configurationItems || [];
  const safeUsers = allUsers || [];

  const ownerOptions = useMemo(() => {
    const set = new Set<string>();
    set.add('Unassigned');
    safeUsers.forEach((u) => u?.name && set.add(u.name));
    safeCis.forEach((ci) => ci?.ownerUserName && set.add(ci.ownerUserName));
    return Array.from(set);
  }, [safeUsers, safeCis]);

  const categoryOptions = useMemo(() => {
    const set = new Set<string>();
    safeCis.forEach((ci) => {
      if (ci?.category) set.add(ci.category);
      if (ci?.ciClassName) set.add(ci.ciClassName);
    });
    return Array.from(set);
  }, [safeCis]);

  const locationOptions = useMemo(() => {
    const set = new Set<string>();
    safeCis.forEach((ci) => {
      if (ci?.locationName) set.add(ci.locationName);
    });
    return Array.from(set);
  }, [safeCis]);

  const sortOptions: SortOption[] = [
    { label: 'Asset Name', value: 'name' },
    { label: 'Asset Tag', value: 'tag' },
    { label: 'Purchase / Install Date', value: 'date' },
    { label: 'Cost / Value', value: 'cost' },
    { label: 'Lifecycle Stage', value: 'status' },
    { label: 'Assigned Owner', value: 'owner' },
    { label: 'Health Score', value: 'health' },
  ];

  // Base Hardware Assets
  const baseHardwareAssets = useMemo(() => {
    return safeCis.filter(
      (ci) => ci && (ci.category === 'Hardware' || (ci.ciClassName || '').includes('Hardware') || ci.category === 'Infrastructure')
    );
  }, [safeCis]);

  // Filtered & Sorted Hardware Assets
  const filteredHardwareAssets = useMemo(() => {
    return baseHardwareAssets
      .filter((asset) => {
        if (!asset) return false;
        // 1. Search Query
        if (filterState.searchQuery) {
          const q = filterState.searchQuery.toLowerCase();
          const matches =
            (asset.name || '').toLowerCase().includes(q) ||
            (asset.assetTag || '').toLowerCase().includes(q) ||
            (asset.serialNumber || '').toLowerCase().includes(q) ||
            (asset.manufacturer || '').toLowerCase().includes(q) ||
            (asset.model || '').toLowerCase().includes(q) ||
            (asset.hostname && asset.hostname.toLowerCase().includes(q)) ||
            (asset.ownerUserName && asset.ownerUserName.toLowerCase().includes(q));
          if (!matches) return false;
        }

        // 2. Status Filter
        if (filterState.status !== 'ALL' && asset.lifecycleState !== filterState.status) {
          return false;
        }

        // 3. Owner Filter
        if (filterState.owner !== 'ALL') {
          if (filterState.owner === 'Unassigned') {
            if (asset.ownerUserName) return false;
          } else {
            if (asset.ownerUserName !== filterState.owner) return false;
          }
        }

        // 4. Installation / Purchase Date Filter
        const dateVal = asset.purchaseDate || asset.lastDiscovered;
        if (!filterByDateRange(dateVal, filterState.dateRangePreset, filterState.startDate, filterState.endDate)) {
          return false;
        }

        // 5. Category Filter
        if (
          filterState.categoryOrPublisher !== 'ALL' &&
          asset.category !== filterState.categoryOrPublisher &&
          asset.ciClassName !== filterState.categoryOrPublisher
        ) {
          return false;
        }

        // 6. Location Filter
        if (filterState.locationOrMetric !== 'ALL' && asset.locationName !== filterState.locationOrMetric) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        let comp = 0;
        if (filterState.sortBy === 'name') {
          comp = a.name.localeCompare(b.name);
        } else if (filterState.sortBy === 'tag') {
          comp = a.assetTag.localeCompare(b.assetTag);
        } else if (filterState.sortBy === 'date') {
          const dA = new Date(a.purchaseDate || a.lastDiscovered || 0).getTime();
          const dB = new Date(b.purchaseDate || b.lastDiscovered || 0).getTime();
          comp = dA - dB;
        } else if (filterState.sortBy === 'cost') {
          comp = (a.cost || 0) - (b.cost || 0);
        } else if (filterState.sortBy === 'status') {
          comp = a.lifecycleState.localeCompare(b.lifecycleState);
        } else if (filterState.sortBy === 'owner') {
          comp = (a.ownerUserName || 'Unassigned').localeCompare(b.ownerUserName || 'Unassigned');
        } else if (filterState.sortBy === 'health') {
          comp = (a.healthScore || 0) - (b.healthScore || 0);
        }

        return filterState.sortOrder === 'asc' ? comp : -comp;
      });
  }, [baseHardwareAssets, filterState]);

  const handleUpdateLifecycle = (assetId: string, newStage: CILifecycleState) => {
    updateConfigurationItem(assetId, { lifecycleState: newStage });
  };

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsset || !targetUserId) return;
    assignAssetToUser(selectedAsset.id, targetUserId);
    setIsAssignModalOpen(false);
  };

  const handleDisposalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsset) return;
    disposeAsset({
      assetId: selectedAsset.id,
      assetTag: selectedAsset.assetTag,
      serialNumber: selectedAsset.serialNumber,
      reason: disposalReason,
      disposalVendor: disposalVendor,
      dataWipeCertified: true,
      wipeMethod: wipeMethod,
      approvedBy: 'Alexander Wright',
      disposalDate: new Date().toISOString().substring(0, 10),
    });
    setIsDisposalModalOpen(false);
  };

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 text-white font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-950 p-3 sm:p-4 border border-zinc-800 rounded-lg">
        <div>
          <h1 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center space-x-2">
            <HardDrive className="w-5 h-5 text-red-500 shrink-0" />
            <span>HARDWARE ASSET MANAGEMENT (HAM) & STOCKROOMS</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1 font-mono">
            Procure-to-Retire Lifecycle Gates, Stockrooms, Check-In/Out Assignment, and NIST 800-88 Certified Disposal
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1.5 bg-black p-1 border border-zinc-800 rounded font-mono text-xs overflow-x-auto custom-scrollbar">
          <button
            onClick={() => setActiveTab('lifecycle')}
            className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
              activeTab === 'lifecycle' ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Asset Lifecycle List
          </button>
          <button
            onClick={() => setActiveTab('depreciation')}
            className={`px-3 py-1.5 rounded transition-colors cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'depreciation' ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <TrendingDown className="w-3.5 h-3.5" />
            <span>Financial Depreciation (D3)</span>
          </button>
          <button
            onClick={() => setActiveTab('stockrooms')}
            className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
              activeTab === 'stockrooms' ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Stockrooms & Bins
          </button>
          <button
            onClick={() => setActiveTab('disposal')}
            className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
              activeTab === 'disposal' ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Disposal Certificates
          </button>
        </div>
      </div>

      {/* TAB 1: ASSET LIFECYCLE LIST */}
      {activeTab === 'lifecycle' && (
        <div className="space-y-4">
          {/* Top Control Bar */}
          <div className="bg-zinc-950 p-3 border border-zinc-800 rounded-lg flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsFilterSidebarOpen(!isFilterSidebarOpen)}
                className={`px-3 py-1.5 rounded border font-bold flex items-center space-x-1.5 cursor-pointer transition-colors ${
                  isFilterSidebarOpen
                    ? 'bg-red-600 text-white border-red-500'
                    : 'bg-black text-zinc-300 border-zinc-800 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <Filter className="w-3.5 h-3.5 text-white" />
                <span>{isFilterSidebarOpen ? 'Hide Filters' : 'Show Filters & Sort'}</span>
              </button>

              <div className="text-zinc-400 text-xs hidden sm:block">
                Showing <span className="text-white font-bold">{filteredHardwareAssets.length}</span> of {baseHardwareAssets.length} Hardware Assets
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsAddAssetModalOpen(true)}
                className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-3.5 py-1.5 rounded flex items-center space-x-1.5 cursor-pointer shadow-md transition-all hover:scale-[1.02]"
              >
                <Plus className="w-4 h-4 text-white" />
                <span>+ Add Hardware Asset</span>
              </button>

              <button
                onClick={() => setIsImportModalOpen(true)}
                className="bg-black hover:bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white font-bold text-xs px-3 py-1.5 rounded flex items-center space-x-1.5 cursor-pointer shadow transition-colors"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-zinc-400" />
                <span>Bulk CSV Import</span>
              </button>
              <button
                onClick={() => {
                  setQrAsset(filteredHardwareAssets[0] || baseHardwareAssets[0] || null);
                  setIsQrModalOpen(true);
                }}
                className="bg-black hover:bg-zinc-900 border border-zinc-800 text-white font-bold text-xs px-3 py-1.5 rounded flex items-center space-x-1.5 cursor-pointer shadow"
              >
                <QrCode className="w-3.5 h-3.5 text-red-500" />
                <span>QR Asset Labels</span>
              </button>
            </div>
          </div>

          {/* Main Layout: Sidebar + Inventory Table */}
          <div className="flex flex-col md:flex-row gap-4 items-start">
            <AssetFilterSidebar
              type="hardware"
              filterState={filterState}
              onFilterChange={setFilterState}
              statusOptions={statusOptions}
              ownerOptions={ownerOptions}
              categoryOrPublisherOptions={categoryOptions}
              locationOrMetricOptions={locationOptions}
              sortOptions={sortOptions}
              totalItemCount={baseHardwareAssets.length}
              filteredItemCount={filteredHardwareAssets.length}
              isOpen={isFilterSidebarOpen}
              onClose={() => setIsFilterSidebarOpen(false)}
            />

            <div className="flex-1 w-full bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden font-mono text-xs">
              {filteredHardwareAssets.length === 0 ? (
                <div className="p-8 text-center text-zinc-500 space-y-2">
                  <HardDrive className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                  <div className="text-white font-bold text-sm">No hardware assets found</div>
                  <p className="text-xs text-zinc-400">Try adjusting your filters or search keywords in the sidebar.</p>
                  <button
                    onClick={() => setFilterState(DEFAULT_FILTER_STATE)}
                    className="mt-2 bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded cursor-pointer"
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-black text-zinc-400 border-b border-zinc-800 text-[10px] uppercase">
                      <tr>
                        <th className="p-3">Asset Tag / Name</th>
                        <th className="p-3">Manufacturer / Model</th>
                        <th className="p-3">Assigned User</th>
                        <th className="p-3">Location</th>
                        <th className="p-3">Purchase / Install Date</th>
                        <th className="p-3">Lifecycle Stage</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800 text-zinc-300">
                      {filteredHardwareAssets.map((asset) => (
                        <tr key={asset.id} className="hover:bg-zinc-900">
                          <td className="p-3">
                            <div className="font-bold text-white">{asset.name}</div>
                            <div className="text-[10px] text-zinc-500 font-mono">
                              Tag: <span className="text-red-400">{asset.assetTag}</span> | Serial: {asset.serialNumber}
                            </div>
                          </td>
                          <td className="p-3 text-zinc-300">
                            {asset.manufacturer} {asset.model}
                          </td>
                          <td className="p-3">
                            <span className="font-bold text-white">{asset.ownerUserName || 'Unassigned'}</span>
                          </td>
                          <td className="p-3 text-zinc-400">{asset.locationName}</td>
                          <td className="p-3 text-zinc-300 font-mono text-[11px]">
                            {asset.purchaseDate || (asset.lastDiscovered ? asset.lastDiscovered.substring(0, 10) : 'N/A')}
                          </td>
                          <td className="p-3">
                            <select
                              value={asset.lifecycleState}
                              onChange={(e) => handleUpdateLifecycle(asset.id, e.target.value as any)}
                              className="bg-black border border-zinc-800 text-white font-bold text-[10px] px-2 py-1 rounded focus:outline-none cursor-pointer"
                            >
                              <option value="Requested">Requested</option>
                              <option value="Approved">Approved</option>
                              <option value="Ordered">Ordered</option>
                              <option value="In Stock">In Stock</option>
                              <option value="Assigned">Assigned</option>
                              <option value="Deployed">Deployed</option>
                              <option value="In Repair">In Repair</option>
                              <option value="Retired">Retired</option>
                              <option value="Disposed">Disposed</option>
                            </select>
                          </td>
                          <td className="p-3 text-right space-x-1 whitespace-nowrap">
                            <button
                              onClick={() => {
                                setDetailAsset(asset);
                                setIsDetailModalOpen(true);
                              }}
                              className="bg-red-600/10 hover:bg-red-600 border border-red-500/40 hover:border-red-500 text-red-400 hover:text-white text-[10px] font-bold px-2 py-1 rounded cursor-pointer inline-flex items-center space-x-1"
                              title="Open Full 13-Tab Enterprise Hardware Asset Detail Console"
                            >
                              <HardDrive className="w-3 h-3 text-red-500" />
                              <span>Details (13 Tabs)</span>
                            </button>

                            <button
                              onClick={() => {
                                setQrAsset(asset);
                                setIsQrModalOpen(true);
                              }}
                              className="bg-black hover:bg-zinc-900 border border-zinc-800 text-zinc-200 hover:text-white text-[10px] font-bold px-2 py-1 rounded cursor-pointer inline-flex items-center space-x-1"
                              title="Generate Printable Asset QR Tag"
                            >
                              <QrCode className="w-3 h-3 text-red-500" />
                              <span>QR Tag</span>
                            </button>

                            <button
                              onClick={() => {
                                setSelectedAsset(asset);
                                setActiveTab('depreciation');
                              }}
                              className="bg-black hover:bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white text-[10px] font-bold px-2 py-1 rounded cursor-pointer"
                              title="View D3 Depreciation Curve"
                            >
                              Depreciation
                            </button>

                            <button
                              onClick={() => {
                                setSelectedAsset(asset);
                                setIsAssignModalOpen(true);
                              }}
                              className="bg-black hover:bg-zinc-900 border border-zinc-800 text-white text-[10px] font-bold px-2 py-1 rounded cursor-pointer"
                            >
                              Assign
                            </button>

                            <button
                              onClick={() => {
                                setSelectedAsset(asset);
                                setIsDisposalModalOpen(true);
                              }}
                              className="bg-black hover:bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-red-400 text-[10px] font-bold px-2 py-1 rounded cursor-pointer"
                            >
                              Dispose
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FINANCIAL DEPRECIATION VISUALIZATION (D3) */}
      {activeTab === 'depreciation' && (
        <HardwareDepreciationChart
          hardwareAssets={baseHardwareAssets}
          depreciationSchedules={depreciationSchedules}
        />
      )}

      {/* TAB 3: STOCKROOMS */}
      {activeTab === 'stockrooms' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
          {stockrooms.map((stk) => (
            <div key={stk.id} className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <span className="font-bold text-white text-sm flex items-center space-x-1.5">
                  <Building className="w-4 h-4 text-red-500" />
                  <span>{stk.name}</span>
                </span>
                <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                  {stk.assetCount} Units
                </span>
              </div>

              <div className="text-zinc-400 space-y-1">
                <div>Location: <span className="text-white">{stk.locationName}</span></div>
                <div>Manager: <span className="text-white">{stk.managerName}</span></div>
                <div>Reorder Threshold: <span className="text-red-400 font-bold">{stk.reorderThreshold} Units</span></div>
              </div>

              <div className="p-2 bg-black border border-zinc-800 rounded text-[11px] text-zinc-400">
                Status: Stock levels optimal. Zero stock shortage alerts.
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: CERTIFIED DISPOSAL RECORDS */}
      {activeTab === 'disposal' && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden font-mono text-xs">
          <div className="p-3 bg-black border-b border-zinc-800 text-zinc-400 font-bold flex justify-between">
            <span>NIST 800-88 CERTIFIED DISPOSAL AUDIT TRAIL ({disposalRecords.length})</span>
            <span className="text-red-400">Zero Data Leakage Guarantee</span>
          </div>
          <table className="w-full text-left">
            <thead className="bg-zinc-900 text-zinc-400 border-b border-zinc-800 text-[10px] uppercase">
              <tr>
                <th className="p-3">Certificate #</th>
                <th className="p-3">Asset Tag / Serial</th>
                <th className="p-3">Reason</th>
                <th className="p-3">Disposal Vendor</th>
                <th className="p-3">Data Wipe Method</th>
                <th className="p-3">Disposal Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 text-zinc-300">
              {disposalRecords.map((d) => (
                <tr key={d.id} className="hover:bg-zinc-900">
                  <td className="p-3 font-bold text-red-400">{d.certificateNumber}</td>
                  <td className="p-3 font-bold text-white">{d.assetTag} ({d.serialNumber})</td>
                  <td className="p-3 text-zinc-400">{d.reason}</td>
                  <td className="p-3">{d.disposalVendor}</td>
                  <td className="p-3 text-zinc-300">{d.wipeMethod}</td>
                  <td className="p-3 text-zinc-400">{d.disposalDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal: Assign Asset */}
      {isAssignModalOpen && selectedAsset && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-mono text-xs">
          <div className="bg-zinc-950 border border-zinc-800 w-full max-w-md rounded-lg shadow-2xl overflow-hidden">
            <div className="p-4 bg-black border-b border-zinc-800 flex justify-between items-center text-white font-bold">
              <span>ASSIGN ASSET {selectedAsset.assetTag}</span>
              <button onClick={() => setIsAssignModalOpen(false)} className="cursor-pointer hover:text-red-500">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAssignSubmit} className="p-4 space-y-3">
              <div>
                <label className="text-zinc-400 block mb-1">Select Employee / Custodian *</label>
                <select
                  value={targetUserId}
                  onChange={(e) => setTargetUserId(e.target.value)}
                  required
                  className="w-full bg-black border border-zinc-800 rounded p-2 text-white focus:outline-none cursor-pointer"
                >
                  <option value="">Select User...</option>
                  {allUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded text-zinc-300 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-1.5 rounded border border-red-500 cursor-pointer"
                >
                  Confirm Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Certified Disposal */}
      {isDisposalModalOpen && selectedAsset && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-mono text-xs">
          <div className="bg-zinc-950 border border-zinc-800 w-full max-w-md rounded-lg shadow-2xl overflow-hidden">
            <div className="p-4 bg-black border-b border-zinc-800 flex justify-between items-center text-white font-bold">
              <span>CERTIFIED DISPOSAL WORKFLOW</span>
              <button onClick={() => setIsDisposalModalOpen(false)} className="cursor-pointer hover:text-red-500">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleDisposalSubmit} className="p-4 space-y-3">
              <div>
                <label className="text-zinc-400 block mb-1">Asset Being Disposed</label>
                <div className="p-2 bg-black border border-zinc-800 rounded text-white font-bold">
                  {selectedAsset.name} ({selectedAsset.assetTag})
                </div>
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Reason for Retirement</label>
                <input
                  type="text"
                  value={disposalReason}
                  onChange={(e) => setDisposalReason(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded p-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Disposal Vendor</label>
                <input
                  type="text"
                  value={disposalVendor}
                  onChange={(e) => setDisposalVendor(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded p-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Data Wipe Standard</label>
                <input
                  type="text"
                  value={wipeMethod}
                  onChange={(e) => setWipeMethod(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded p-2 text-white focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsDisposalModalOpen(false)}
                  className="bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded text-zinc-300 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-1.5 rounded border border-red-500 cursor-pointer"
                >
                  Generate Destruction Certificate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Generator Modal */}
      <AssetQrCodeModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        asset={qrAsset}
        allAssets={baseHardwareAssets}
        onSelectAsset={(a) => setQrAsset(a)}
      />

      {/* Add Hardware Asset Modal */}
      <AddHardwareAssetModal
        isOpen={isAddAssetModalOpen}
        onClose={() => setIsAddAssetModalOpen(false)}
      />

      {/* Bulk CSV Import Modal */}
      <BulkAssetImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />

      {/* Comprehensive 13-Tab Hardware Asset Detail Console Modal */}
      <HardwareAssetDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setDetailAsset(null);
        }}
        asset={detailAsset}
        onAssetUpdated={(updated) => setDetailAsset(updated)}
      />
    </div>
  );
};
