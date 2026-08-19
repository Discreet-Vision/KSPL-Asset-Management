import React, { useState } from 'react';
import { 
  CheckCircle2, Download, AlertTriangle, FileText, DollarSign, Cloud, BarChart2, ShieldCheck, RefreshCw
} from 'lucide-react';
import { 
  ContractRecord, 
  AssetTcoRecord, 
  DepreciationScheduleItem, 
  ChargebackAllocation, 
  CloudFinOpsRecord, 
  FinancialSummaryStats,
  ContractStatus 
} from './types';
import { financialAdvancedEngine } from './financialEngine';

export const FinancialAdvancedDashboardModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'contracts' | 'tco_depreciation' | 'allocation_chargeback' | 'cloud_finops'
  >('contracts');

  const [contracts, setContracts] = useState<ContractRecord[]>(financialAdvancedEngine.getContracts() || []);
  const [tcoRecords, setTcoRecords] = useState<AssetTcoRecord[]>(financialAdvancedEngine.getTcoRecords() || []);
  const [depreciationSchedules, setDepreciationSchedules] = useState<DepreciationScheduleItem[]>(financialAdvancedEngine.getDepreciationSchedules() || []);
  const [allocations, setAllocations] = useState<ChargebackAllocation[]>(financialAdvancedEngine.getAllocations() || []);
  const [cloudFinOpsRecords, setCloudFinOpsRecords] = useState<CloudFinOpsRecord[]>(financialAdvancedEngine.getCloudFinOpsRecords() || []);
  const [stats, setStats] = useState<FinancialSummaryStats>(financialAdvancedEngine.getSummaryStats() || {} as any);

  const safeContracts = contracts || [];
  const safeTcoRecords = tcoRecords || [];
  const safeAllocations = allocations || [];
  const safeCloudFinOpsRecords = cloudFinOpsRecords || [];

  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleUpdateStatus = (contractId: string, status: ContractStatus) => {
    financialAdvancedEngine.updateContractStatus(contractId, status);
    setContracts([...(financialAdvancedEngine.getContracts() || [])]);
    setStats(financialAdvancedEngine.getSummaryStats() || {} as any);
    setSuccessMsg(`Contract '${contractId}' status updated to '${status}'.`);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  return (
    <div className="bg-black text-white p-6 font-sans border border-red-900 shadow-2xl space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-red-900 pb-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-red-600 animate-pulse" />
            <h1 className="text-xl font-bold uppercase tracking-wider text-white">
              Financial & Contract Management Engine
            </h1>
            <span className="text-xs bg-red-950 text-red-400 px-2 py-0.5 border border-red-800 font-mono">
              FinOps & TCO v2026.8
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1 font-mono">
            Contract Repository & Renewal Lifecycle • Asset & Service TCO • Straight-Line Depreciation • Chargeback/Showback • Cloud FinOps
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-1 mt-4 md:mt-0 border border-neutral-800 p-1 bg-neutral-950 font-mono text-xs">
          {(
            [
              ['contracts', `Contracts & Renewals (${safeContracts.length})`],
              ['tco_depreciation', `TCO & Depreciation (${safeTcoRecords.length})`],
              ['allocation_chargeback', `Chargeback / Showback (${safeAllocations.length})`],
              ['cloud_finops', `Cloud FinOps (${safeCloudFinOpsRecords.length})`]
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-3 py-1.5 uppercase tracking-wider transition-colors ${
                activeTab === key
                  ? 'bg-red-600 text-white font-bold'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {successMsg && (
        <div className="p-3 bg-red-950 border border-red-700 text-red-200 text-xs font-mono flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-red-500" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Summary Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-7 gap-3 font-mono text-xs">
        <div className="bg-neutral-950 border border-neutral-800 p-3 text-center">
          <span className="text-[10px] text-neutral-500 uppercase">Active Contracts</span>
          <div className="text-xl font-bold text-white mt-1">{stats.activeContractsCount}</div>
        </div>

        <div className="bg-neutral-950 border border-neutral-800 p-3 text-center">
          <span className="text-[10px] text-neutral-500 uppercase">Expiring Contracts</span>
          <div className="text-xl font-bold text-red-500 mt-1">{stats.expiringContractsCount}</div>
        </div>

        <div className="bg-neutral-950 border border-neutral-800 p-3 text-center">
          <span className="text-[10px] text-neutral-500 uppercase">Total Contract Value</span>
          <div className="text-xl font-bold text-white mt-1">${stats.totalContractValue.toLocaleString()}</div>
        </div>

        <div className="bg-neutral-950 border border-neutral-800 p-3 text-center">
          <span className="text-[10px] text-neutral-500 uppercase">Total IT TCO</span>
          <div className="text-xl font-bold text-white mt-1">${stats.totalItTco.toLocaleString()}</div>
        </div>

        <div className="bg-neutral-950 border border-neutral-800 p-3 text-center">
          <span className="text-[10px] text-neutral-500 uppercase">Accum. Depreciation</span>
          <div className="text-xl font-bold text-neutral-300 mt-1">${stats.accumulatedDepreciationTotal.toLocaleString()}</div>
        </div>

        <div className="bg-neutral-950 border border-neutral-800 p-3 text-center">
          <span className="text-[10px] text-neutral-500 uppercase">Monthly Cloud Spend</span>
          <div className="text-xl font-bold text-red-400 mt-1">${stats.totalCloudSpend.toLocaleString()}</div>
        </div>

        <div className="bg-neutral-950 border border-neutral-800 p-3 text-center">
          <span className="text-[10px] text-neutral-500 uppercase">Unallocated Cloud</span>
          <div className="text-xl font-bold text-red-500 mt-1">${stats.unallocatedCloudSpend.toLocaleString()}</div>
        </div>
      </div>

      {/* TAB 1: CONTRACT & RENEWAL LIFECYCLE */}
      {activeTab === 'contracts' && (
        <div className="space-y-6 font-mono text-xs">
          <div className="bg-neutral-950 border border-neutral-800 p-5 space-y-4">
            <div className="border-b border-neutral-900 pb-2 font-bold uppercase text-white flex justify-between items-center">
              <span>Contract Repository & Renewal Alert Deadlines</span>
              <span className="text-[10px] text-neutral-500 font-normal">Active Alert Windows (90 / 60 / 30 / 15 Days)</span>
            </div>

            <div className="space-y-3">
              {contracts.map(cnt => (
                <div key={cnt.contractId} className="bg-black border border-neutral-800 p-4 space-y-3">
                  <div className="flex justify-between items-start border-b border-neutral-900 pb-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-white">{cnt.contractNumber}</span>
                        <span className="text-[10px] text-red-500 font-bold uppercase">[{cnt.contractType}]</span>
                      </div>
                      <span className="text-[10px] text-neutral-400">Vendor: {cnt.vendor} • Owner: {cnt.owner}</span>
                    </div>
                    <span className={`px-2 py-0.5 text-[9px] font-bold border ${
                      cnt.status === 'Expiring'
                        ? 'bg-red-950 text-red-500 border-red-900'
                        : 'bg-black text-white border-neutral-800'
                    }`}>
                      Status: {cnt.status} ({cnt.daysRemaining} days remaining)
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[10px]">
                    <div className="bg-neutral-950 p-2 border border-neutral-900">
                      <span className="text-neutral-500 uppercase block">Contract Value</span>
                      <span className="text-white font-bold">${cnt.contractValue.toLocaleString()} {cnt.currency}</span>
                    </div>

                    <div className="bg-neutral-950 p-2 border border-neutral-900">
                      <span className="text-neutral-500 uppercase block">Term Period</span>
                      <span className="text-neutral-300 font-bold">{cnt.startDate} to {cnt.endDate}</span>
                    </div>

                    <div className="bg-neutral-950 p-2 border border-neutral-900">
                      <span className="text-neutral-500 uppercase block">Renewal Notice Window</span>
                      <span className="text-white font-bold">{cnt.renewalDate} ({cnt.noticePeriodDays} day notice)</span>
                    </div>

                    <div className="bg-neutral-950 p-2 border border-neutral-900">
                      <span className="text-neutral-500 uppercase block">Cost Center</span>
                      <span className="text-white font-bold">{cnt.costCenter}</span>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-2 border-t border-neutral-900">
                    <button
                      onClick={() => handleUpdateStatus(cnt.contractId, 'Active')}
                      className="px-2 py-1 bg-neutral-900 border border-neutral-800 hover:border-white text-white font-bold text-[9px] uppercase"
                    >
                      Mark Active
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(cnt.contractId, 'Renewed')}
                      className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white font-bold text-[9px] uppercase"
                    >
                      Execute Contract Renewal
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TCO & DEPRECIATION ENGINE */}
      {activeTab === 'tco_depreciation' && (
        <div className="space-y-6 font-mono text-xs">
          {/* TCO Rollups */}
          <div className="bg-neutral-950 border border-neutral-800 p-5 space-y-4">
            <div className="border-b border-neutral-900 pb-2 font-bold uppercase text-white">
              Total Cost of Ownership (TCO) Asset & Service Rollups
            </div>

            <div className="space-y-3">
              {tcoRecords.map(tco => (
                <div key={tco.assetId} className="bg-black border border-neutral-800 p-4 space-y-3">
                  <div className="flex justify-between items-center border-b border-neutral-900 pb-2">
                    <h3 className="font-bold text-white text-sm">{tco.assetName}</h3>
                    <span className="text-base font-bold text-red-500">Total TCO: ${tco.totalTco.toLocaleString()}</span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-[10px]">
                    <div className="bg-neutral-950 p-2 border border-neutral-900">
                      <span className="text-neutral-500 uppercase block">Purchase</span>
                      <span className="text-white font-bold">${tco.purchaseCost}</span>
                    </div>
                    <div className="bg-neutral-950 p-2 border border-neutral-900">
                      <span className="text-neutral-500 uppercase block">Maintenance</span>
                      <span className="text-white font-bold">${tco.maintenanceCost}</span>
                    </div>
                    <div className="bg-neutral-950 p-2 border border-neutral-900">
                      <span className="text-neutral-500 uppercase block">Repair</span>
                      <span className="text-white font-bold">${tco.repairCost}</span>
                    </div>
                    <div className="bg-neutral-950 p-2 border border-neutral-900">
                      <span className="text-neutral-500 uppercase block">Support</span>
                      <span className="text-white font-bold">${tco.supportCost}</span>
                    </div>
                    <div className="bg-neutral-950 p-2 border border-neutral-900">
                      <span className="text-neutral-500 uppercase block">Licensing</span>
                      <span className="text-white font-bold">${tco.licenseCost}</span>
                    </div>
                    <div className="bg-neutral-950 p-2 border border-neutral-900">
                      <span className="text-neutral-500 uppercase block">Residual Value</span>
                      <span className="text-neutral-300 font-bold">${tco.residualValue}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Depreciation Schedule */}
          <div className="bg-neutral-950 border border-neutral-800 p-5 space-y-4">
            <div className="border-b border-neutral-900 pb-2 font-bold uppercase text-white">
              Straight-Line & Declining-Balance Depreciation Schedule
            </div>

            <div className="space-y-3">
              {depreciationSchedules.map(dep => (
                <div key={dep.assetId} className="bg-black border border-neutral-800 p-4 space-y-3">
                  <div className="flex justify-between items-center border-b border-neutral-900 pb-2">
                    <div>
                      <h3 className="font-bold text-white text-sm">{dep.assetName}</h3>
                      <span className="text-[10px] text-red-500 font-bold">Method: {dep.method} ({dep.usefulLifeYears} Year Useful Life)</span>
                    </div>
                    <span className="text-sm font-bold text-white">Book Value: ${dep.currentBookValue.toLocaleString()}</span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[10px]">
                    <div className="bg-neutral-950 p-2 border border-neutral-900">
                      <span className="text-neutral-500 uppercase block">Initial Purchase Cost</span>
                      <span className="text-white font-bold">${dep.initialCost.toLocaleString()}</span>
                    </div>
                    <div className="bg-neutral-950 p-2 border border-neutral-900">
                      <span className="text-neutral-500 uppercase block">Annual Depreciation Rate</span>
                      <span className="text-white font-bold">${dep.annualDepreciation.toLocaleString()} / yr</span>
                    </div>
                    <div className="bg-neutral-950 p-2 border border-neutral-900">
                      <span className="text-neutral-500 uppercase block">Accumulated Depreciation</span>
                      <span className="text-white font-bold">${dep.accumulatedDepreciation.toLocaleString()}</span>
                    </div>
                    <div className="bg-neutral-950 p-2 border border-neutral-900">
                      <span className="text-neutral-500 uppercase block">Residual Floor</span>
                      <span className="text-neutral-300 font-bold">${dep.residualValue.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: COST ALLOCATION & CHARGEBACK / SHOWBACK */}
      {activeTab === 'allocation_chargeback' && (
        <div className="space-y-6 font-mono text-xs">
          <div className="bg-neutral-950 border border-neutral-800 p-5 space-y-4">
            <div className="border-b border-neutral-900 pb-2 font-bold uppercase text-white">
              Internal IT Chargeback Ledger & Showback Cost Visibility
            </div>

            <div className="space-y-3">
              {allocations.map((alloc, idx) => (
                <div key={idx} className="bg-black border border-neutral-800 p-4 space-y-3">
                  <div className="flex justify-between items-center border-b border-neutral-900 pb-2">
                    <div>
                      <h3 className="font-bold text-white text-sm">{alloc.department} ({alloc.costCenter})</h3>
                      <span className="text-[10px] text-red-500 font-bold uppercase">Mode: {alloc.type}</span>
                    </div>
                    <span className="text-base font-bold text-white">${alloc.totalAllocation.toLocaleString()} ({alloc.allocationPercentage}%)</span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-[10px]">
                    <div className="bg-neutral-950 p-2 border border-neutral-900">
                      <span className="text-neutral-500 uppercase block">Hardware Charge</span>
                      <span className="text-white font-bold">${alloc.hardwareCost.toLocaleString()}</span>
                    </div>
                    <div className="bg-neutral-950 p-2 border border-neutral-900">
                      <span className="text-neutral-500 uppercase block">Software Charge</span>
                      <span className="text-white font-bold">${alloc.softwareCost.toLocaleString()}</span>
                    </div>
                    <div className="bg-neutral-950 p-2 border border-neutral-900">
                      <span className="text-neutral-500 uppercase block">Cloud Usage Charge</span>
                      <span className="text-white font-bold">${alloc.cloudCost.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CLOUD FINOPS & COST ANOMALY DETECTION */}
      {activeTab === 'cloud_finops' && (
        <div className="space-y-6 font-mono text-xs">
          <div className="bg-neutral-950 border border-neutral-800 p-5 space-y-4">
            <div className="border-b border-neutral-900 pb-2 font-bold uppercase text-white">
              Multi-Cloud FinOps Spend Analytics & Anomaly Detection
            </div>

            <div className="space-y-3">
              {cloudFinOpsRecords.map(rec => (
                <div key={rec.recordId} className="bg-black border border-neutral-800 p-4 space-y-3">
                  <div className="flex justify-between items-start border-b border-neutral-900 pb-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-white">{rec.provider} • {rec.accountOrProject}</span>
                        <span className="text-[10px] text-neutral-500">[{rec.billingPeriod}]</span>
                      </div>
                      <span className="text-[10px] text-neutral-400">{rec.serviceName}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-bold text-red-500">${rec.cost.toLocaleString()} {rec.currency}</span>
                    </div>
                  </div>

                  {rec.anomalyDetected && (
                    <div className="p-2 bg-red-950 border border-red-800 text-red-200 text-[10px] flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                      <span><strong>FINOPS ANOMALY ALERT:</strong> {rec.anomalyReason}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-[9px] text-neutral-500 pt-2 border-t border-neutral-900">
                    <span>Mapping Status: {rec.unallocatedFlag ? 'UNALLOCATED RESOURCE' : 'Mapped to Cost Center'}</span>
                    <button className="px-3 py-1 bg-black border border-neutral-800 hover:border-white text-white font-bold text-[9px] uppercase flex items-center space-x-1">
                      <Download className="w-3 h-3 text-red-500" />
                      <span>Export FinOps Billing Report</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
