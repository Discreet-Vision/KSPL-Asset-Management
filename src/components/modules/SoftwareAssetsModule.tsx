import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  AssetFilterSidebar,
  AssetFilterState,
  DEFAULT_FILTER_STATE,
  filterByDateRange,
  SortOption,
} from '../common/AssetFilterSidebar';
import {
  Code,
  KeyRound,
  ShieldAlert,
  Calculator,
  Download,
  CheckCircle2,
  AlertTriangle,
  Building,
  DollarSign,
  FileCheck,
  Plus,
  X,
  Filter,
  Search,
} from 'lucide-react';

export const SoftwareAssetsModule: React.FC = () => {
  const { softwareLicenses, updateLicenseCount } = useApp();

  const [activeTab, setActiveTab] = useState<'elp' | 'packs' | 'simulator'>('elp');
  const [selectedPublisherPack, setSelectedPublisherPack] = useState<'Microsoft' | 'Oracle' | 'SAP' | 'Adobe' | 'IBM'>('Microsoft');

  // Filter & Sort Sidebar State
  const [filterState, setFilterState] = useState<AssetFilterState>(DEFAULT_FILTER_STATE);
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(true);

  // License Editing Modal
  const [editingLicenseId, setEditingLicenseId] = useState<string | null>(null);
  const [newEntitlementCount, setNewEntitlementCount] = useState<number>(0);

  // Dynamic Filter Options for Software
  const statusOptions = ['ALL', 'Compliant', 'Under-Licensed', 'Over-Licensed', 'Risk Alert'];

  const safeLicenses = softwareLicenses || [];

  const publisherOptions = useMemo(() => {
    const set = new Set<string>();
    safeLicenses.forEach((l) => {
      if (l?.publisher) set.add(l.publisher);
    });
    return Array.from(set);
  }, [safeLicenses]);

  const publisherPackOptions = useMemo(() => {
    const set = new Set<string>();
    safeLicenses.forEach((l) => {
      if (l?.publisherPack) set.add(l.publisherPack);
    });
    return Array.from(set);
  }, [safeLicenses]);

  const metricOptions = useMemo(() => {
    const set = new Set<string>();
    safeLicenses.forEach((l) => {
      if (l?.metric) set.add(l.metric);
    });
    return Array.from(set);
  }, [safeLicenses]);

  const sortOptions: SortOption[] = [
    { label: 'Product Name', value: 'name' },
    { label: 'Publisher', value: 'owner' },
    { label: 'Purchase Date', value: 'date' },
    { label: 'Total Cost', value: 'cost' },
    { label: 'Compliance Status', value: 'status' },
    { label: 'Compliance Gap', value: 'gap' },
    { label: 'True-Up Financial Liability', value: 'liability' },
  ];

  // Filtered & Sorted Software Licenses
  const filteredSoftwareLicenses = useMemo(() => {
    return safeLicenses
      .filter((lic) => {
        if (!lic) return false;
        // 1. Search Query
        if (filterState.searchQuery) {
          const q = filterState.searchQuery.toLowerCase();
          const matches =
            (lic.productName || '').toLowerCase().includes(q) ||
            (lic.publisher || '').toLowerCase().includes(q) ||
            (lic.contractId && lic.contractId.toLowerCase().includes(q)) ||
            (lic.metric || '').toLowerCase().includes(q);
          if (!matches) return false;
        }

        // 2. Status Filter
        if (filterState.status !== 'ALL' && lic.complianceStatus !== filterState.status) {
          return false;
        }

        // 3. Owner / Publisher Filter
        if (filterState.owner !== 'ALL') {
          if (lic.publisher !== filterState.owner && lic.publisherPack !== filterState.owner) {
            return false;
          }
        }

        // 4. Installation / Purchase Date Filter
        if (!filterByDateRange(lic.purchaseDate, filterState.dateRangePreset, filterState.startDate, filterState.endDate)) {
          return false;
        }

        // 5. Category / Publisher Pack Filter
        if (
          filterState.categoryOrPublisher !== 'ALL' &&
          lic.publisher !== filterState.categoryOrPublisher &&
          lic.publisherPack !== filterState.categoryOrPublisher
        ) {
          return false;
        }

        // 6. Metric Filter
        if (filterState.locationOrMetric !== 'ALL' && lic.metric !== filterState.locationOrMetric) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        let comp = 0;
        if (filterState.sortBy === 'name') {
          comp = a.productName.localeCompare(b.productName);
        } else if (filterState.sortBy === 'owner') {
          comp = a.publisher.localeCompare(b.publisher);
        } else if (filterState.sortBy === 'date') {
          const dA = new Date(a.purchaseDate || 0).getTime();
          const dB = new Date(b.purchaseDate || 0).getTime();
          comp = dA - dB;
        } else if (filterState.sortBy === 'cost') {
          comp = a.totalCost - b.totalCost;
        } else if (filterState.sortBy === 'status') {
          comp = a.complianceStatus.localeCompare(b.complianceStatus);
        } else if (filterState.sortBy === 'gap') {
          comp = a.complianceGap - b.complianceGap;
        } else if (filterState.sortBy === 'liability') {
          comp = a.financialLiability - b.financialLiability;
        }

        return filterState.sortOrder === 'asc' ? comp : -comp;
      });
  }, [softwareLicenses, filterState]);

  const totalFinancialLiability = softwareLicenses.reduce((acc, l) => acc + l.financialLiability, 0);

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLicenseId) return;
    updateLicenseCount(editingLicenseId, newEntitlementCount);
    setEditingLicenseId(null);
  };

  const packLicenses = softwareLicenses.filter((l) => l.publisherPack === selectedPublisherPack || (selectedPublisherPack === 'Microsoft' && l.publisher.includes('Microsoft')));

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 text-white font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-950 p-3 sm:p-4 border border-zinc-800 rounded-lg">
        <div>
          <h1 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center space-x-2">
            <KeyRound className="w-5 h-5 text-red-500 shrink-0" />
            <span>SOFTWARE ASSET MANAGEMENT (SAM) & EFFECTIVE LICENSE POSITION</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1 font-mono">
            Entitlements vs Consumed Metrics, Publisher Compliance Packs, Audit Defense Simulator
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1.5 bg-black p-1 border border-zinc-800 rounded font-mono text-xs overflow-x-auto custom-scrollbar">
          <button
            onClick={() => setActiveTab('elp')}
            className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
              activeTab === 'elp' ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            ELP Compliance Matrix
          </button>
          <button
            onClick={() => setActiveTab('packs')}
            className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
              activeTab === 'packs' ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Publisher Packs
          </button>
          <button
            onClick={() => setActiveTab('simulator')}
            className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
              activeTab === 'simulator' ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Audit Defense Simulator
          </button>
        </div>
      </div>

      {/* Summary Stat Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
        <div className="bg-zinc-950 p-4 border border-zinc-800 rounded-lg">
          <div className="text-zinc-400 text-[10px] uppercase font-bold">Total Software Entitlements Cost</div>
          <div className="text-2xl font-black text-white mt-1">
            ${softwareLicenses.reduce((acc, l) => acc + l.totalCost, 0).toLocaleString()}
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">{softwareLicenses.length} Managed Software Products</div>
        </div>

        <div className="bg-zinc-950 p-4 border border-zinc-800 rounded-lg">
          <div className="text-zinc-400 text-[10px] uppercase font-bold">Audit Exposure / True-Up Liability</div>
          <div className="text-2xl font-black text-red-500 mt-1">
            ${totalFinancialLiability.toLocaleString()}
          </div>
          <div className="text-[11px] text-red-400 font-bold mt-1">
            {softwareLicenses.filter((l) => l.complianceStatus === 'Under-Licensed' || l.complianceStatus === 'Risk Alert').length} Non-Compliant Gaps
          </div>
        </div>

        <div className="bg-zinc-950 p-4 border border-zinc-800 rounded-lg">
          <div className="text-zinc-400 text-[10px] uppercase font-bold font-mono">Over-Licensed (Unused Seats)</div>
          <div className="text-2xl font-black text-white mt-1">
            {softwareLicenses.filter((l) => l.complianceStatus === 'Over-Licensed').reduce((acc, l) => acc + l.complianceGap, 0)} Seats
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">Optimization Opportunity Available</div>
        </div>
      </div>

      {/* TAB 1: ELP MATRIX */}
      {activeTab === 'elp' && (
        <div className="space-y-4">
          {/* Control Bar */}
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
                Showing <span className="text-white font-bold">{filteredSoftwareLicenses.length}</span> of {softwareLicenses.length} Managed Software Products
              </div>
            </div>

            <div className="text-zinc-400 font-bold text-[11px] hidden md:block">
              EFFECTIVE LICENSE POSITION (ELP = PURCHASED - CONSUMED)
            </div>
          </div>

          {/* Sidebar + Table Layout */}
          <div className="flex flex-col md:flex-row gap-4 items-start">
            <AssetFilterSidebar
              type="software"
              filterState={filterState}
              onFilterChange={setFilterState}
              statusOptions={statusOptions}
              ownerOptions={publisherOptions}
              categoryOrPublisherOptions={publisherPackOptions}
              locationOrMetricOptions={metricOptions}
              sortOptions={sortOptions}
              totalItemCount={softwareLicenses.length}
              filteredItemCount={filteredSoftwareLicenses.length}
              isOpen={isFilterSidebarOpen}
              onClose={() => setIsFilterSidebarOpen(false)}
            />

            <div className="flex-1 w-full bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden font-mono text-xs">
              {filteredSoftwareLicenses.length === 0 ? (
                <div className="p-8 text-center text-zinc-500 space-y-2">
                  <KeyRound className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                  <div className="text-white font-bold text-sm">No software licenses found</div>
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
                    <thead className="bg-zinc-900 text-zinc-400 border-b border-zinc-800 text-[10px] uppercase">
                      <tr>
                        <th className="p-3">Publisher / Product</th>
                        <th className="p-3">Licensing Metric</th>
                        <th className="p-3">Purchase Date</th>
                        <th className="p-3">Purchased</th>
                        <th className="p-3">Consumed</th>
                        <th className="p-3">Compliance Gap</th>
                        <th className="p-3">Est. True-Up Liability</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800 text-zinc-300">
                      {filteredSoftwareLicenses.map((lic) => (
                        <tr key={lic.id} className="hover:bg-zinc-900">
                          <td className="p-3">
                            <div className="font-bold text-white">{lic.productName}</div>
                            <div className="text-[10px] text-zinc-500 font-mono">{lic.publisher}</div>
                          </td>
                          <td className="p-3 font-bold text-white">{lic.metric}</td>
                          <td className="p-3 text-zinc-300 font-mono text-[11px]">{lic.purchaseDate || 'N/A'}</td>
                          <td className="p-3 text-white font-bold">{lic.purchasedEntitlements}</td>
                          <td className="p-3 text-white font-bold">{lic.consumedEntitlements}</td>
                          <td className="p-3 font-bold">
                            <span className={lic.complianceGap < 0 ? 'text-red-500' : 'text-white'}>
                              {lic.complianceGap > 0 ? `+${lic.complianceGap}` : lic.complianceGap}
                            </span>
                          </td>
                          <td className="p-3 font-bold text-red-400">
                            ${lic.financialLiability.toLocaleString()}
                          </td>
                          <td className="p-3">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                lic.complianceStatus === 'Under-Licensed' || lic.complianceStatus === 'Risk Alert'
                                  ? 'bg-red-600 text-white border-red-500'
                                  : 'bg-black text-white border-zinc-700'
                              }`}
                            >
                              {lic.complianceStatus}
                            </span>
                          </td>
                          <td className="p-3 text-right whitespace-nowrap">
                            <button
                              onClick={() => {
                                setEditingLicenseId(lic.id);
                                setNewEntitlementCount(lic.purchasedEntitlements);
                              }}
                              className="bg-black hover:bg-zinc-900 border border-zinc-800 text-white text-[10px] font-bold px-2.5 py-1 rounded cursor-pointer"
                            >
                              True-Up / Edit
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

      {/* TAB 2: PUBLISHER PACKS */}
      {activeTab === 'packs' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="flex items-center space-x-2 bg-black p-2 border border-zinc-800 rounded">
            <span className="text-zinc-400 font-bold">Select Publisher Pack:</span>
            {(['Microsoft', 'Oracle', 'SAP', 'Adobe', 'IBM'] as const).map((pack) => (
              <button
                key={pack}
                onClick={() => setSelectedPublisherPack(pack)}
                className={`px-3 py-1 rounded cursor-pointer font-bold transition-colors ${
                  selectedPublisherPack === pack
                    ? 'bg-red-600 text-white border border-red-500'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white'
                }`}
              >
                {pack} Pack
              </button>
            ))}
          </div>

          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-4">
            <div className="border-b border-zinc-800 pb-2 flex justify-between items-center">
              <h3 className="font-bold text-white text-sm">
                {selectedPublisherPack} Specific Licensing Compliance Rules & Rulesets
              </h3>
              <span className="text-red-400 text-[11px]">Vendor Rules Active</span>
            </div>

            <div className="space-y-3">
              {packLicenses.length === 0 ? (
                <div className="text-zinc-500 italic p-4 text-center">
                  No {selectedPublisherPack} licenses found in active database.
                </div>
              ) : (
                packLicenses.map((lic) => (
                  <div key={lic.id} className="p-3 bg-black border border-zinc-800 rounded space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-white text-sm">{lic.productName}</span>
                      <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                        {lic.complianceStatus}
                      </span>
                    </div>
                    <div className="text-zinc-400">
                      Metric: <span className="text-white font-bold">{lic.metric}</span> | Purchased:{' '}
                      <span className="text-white font-bold">{lic.purchasedEntitlements}</span> | Consumed:{' '}
                      <span className="text-white font-bold">{lic.consumedEntitlements}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: AUDIT DEFENSE SIMULATOR */}
      {activeTab === 'simulator' && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-6 space-y-6 font-mono text-xs">
          <div className="border-b border-zinc-800 pb-3 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-white text-sm flex items-center space-x-2">
                <Calculator className="w-4 h-4 text-red-500" />
                <span>VENDOR AUDIT SIMULATOR & AUDIT DEFENSE PACKAGE GENERATOR</span>
              </h3>
              <p className="text-zinc-400 text-[11px] mt-0.5">
                Simulate publisher audit scenarios, calculate potential liability, and compile evidence packages.
              </p>
            </div>

            <button className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded flex items-center space-x-2 border border-red-500 cursor-pointer">
              <Download className="w-4 h-4" />
              <span>Export Audit Defense Package (PDF / Excel)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-black border border-zinc-800 rounded space-y-3">
              <div className="font-bold text-white border-b border-zinc-800 pb-2">Simulated Audit Risk Exposure</div>
              <div className="text-2xl font-black text-red-500">${totalFinancialLiability.toLocaleString()}</div>
              <p className="text-zinc-400 text-[11px]">
                Calculated across all under-licensed software metrics including hypervisor core factor penalties.
              </p>
            </div>

            <div className="p-4 bg-black border border-zinc-800 rounded space-y-3">
              <div className="font-bold text-white border-b border-zinc-800 pb-2">Supporting Evidence Ledger</div>
              <div className="text-zinc-300 text-[11px] space-y-1">
                <div>• Enterprise Purchase Orders: <span className="text-white font-bold">PO-2026-0801, PO-2026-0802</span></div>
                <div>• Active MSA Contract: <span className="text-white font-bold">MSFT-EA-2024-99812</span></div>
                <div>• Endpoint Discovery Verification: <span className="text-white font-bold">100% Verified</span></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Edit License Entitlement */}
      {editingLicenseId && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-mono text-xs">
          <div className="bg-zinc-950 border border-zinc-800 w-full max-w-md rounded-lg shadow-2xl overflow-hidden">
            <div className="p-4 bg-black border-b border-zinc-800 flex justify-between items-center text-white font-bold">
              <span>TRUE-UP / UPDATE PURCHASED ENTITLEMENTS</span>
              <button onClick={() => setEditingLicenseId(null)} className="cursor-pointer hover:text-red-500">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-4 space-y-3">
              <div>
                <label className="text-zinc-400 block mb-1">New Purchased Entitlements Count *</label>
                <input
                  type="number"
                  required
                  value={newEntitlementCount}
                  onChange={(e) => setNewEntitlementCount(parseInt(e.target.value) || 0)}
                  className="w-full bg-black border border-zinc-800 rounded p-2 text-white font-bold text-sm focus:border-red-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingLicenseId(null)}
                  className="bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded text-zinc-300 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-1.5 rounded border border-red-500 cursor-pointer"
                >
                  Save True-Up
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
