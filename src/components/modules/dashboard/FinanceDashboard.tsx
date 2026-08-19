import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import {
  DollarSign,
  FileText,
  Building,
  TrendingUp,
  CreditCard,
  ShoppingBag,
  Clock,
  PieChart,
  Calendar,
  AlertCircle,
  ArrowUpRight,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

export const FinanceDashboard: React.FC = () => {
  const {
    contracts,
    purchaseOrders,
    costCenters,
    depreciationSchedules,
    softwareLicenses,
    setActiveModule,
  } = useApp();

  const safeCostCenters = costCenters || [];
  const safeContracts = contracts || [];
  const safePOs = purchaseOrders || [];
  const safeDepreciation = depreciationSchedules || [];
  const safeLicenses = softwareLicenses || [];

  const totalBudget = safeCostCenters.reduce((acc, c) => acc + (c?.budgetAllocated || 0), 0);
  const totalSpend = safeCostCenters.reduce((acc, c) => acc + (c?.currentSpend || 0), 0);
  const budgetUtilization = totalBudget > 0 ? Math.round((totalSpend / totalBudget) * 100) : 0;

  const totalContractVal = safeContracts.reduce((acc, c) => acc + (c?.totalValue || 0), 0);
  const expiringContracts = safeContracts.filter((c) => c && (c.status === 'Expiring' || c.status === 'Active'));

  const pendingPOs = safePOs.filter((po) => po && (po.status === 'Ordered' || po.status === 'Draft'));
  const poTotalPending = pendingPOs.reduce((acc, po) => acc + (po?.totalCost || 0), 0);

  const totalDepreciatedValue = safeDepreciation.reduce((acc, d) => acc + (d?.currentBookValue || 0), 0);

  return (
    <div className="space-y-6">
      {/* Finance Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-950 p-4 border border-zinc-800 rounded-xl shadow-lg">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded-md text-[10px] font-mono font-bold tracking-wider uppercase">
              Financial Management & Procurement Desk
            </span>
            <span className="bg-zinc-800 text-zinc-300 border border-zinc-700 text-[10px] font-mono px-2 py-0.5 rounded">
              Fiscal Year 2026-27
            </span>
          </div>
          <h1 className="text-xl font-black text-white tracking-tight mt-1">
            IT FINANCIALS, CONTRACTS & ASSET DEPRECIATION
          </h1>
          <p className="text-xs text-zinc-400 font-mono">
            Departmental Cost Centers, Contract Renewals, CapEx/OpEx & Purchase Order Approvals
          </p>
        </div>

        {/* Quick Finance Toolkit */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <button
            onClick={() => setActiveModule('financials')}
            className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-colors shadow-md shadow-emerald-950"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Depreciation Ledger</span>
          </button>

          <button
            onClick={() => setActiveModule('contracts')}
            className="flex items-center space-x-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 hover:text-white px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            <span>Review Renewals</span>
          </button>

          <button
            onClick={() => setActiveModule('procurement')}
            className="flex items-center space-x-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 hover:text-white px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-colors"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
            <span>Purchase Orders</span>
          </button>
        </div>
      </div>

      {/* Primary Financial Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total IT Budget */}
        <div
          onClick={() => setActiveModule('financials')}
          className="bg-zinc-950 border border-zinc-800 hover:border-emerald-500/50 p-4 rounded-xl transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">Total IT Budget</span>
            <DollarSign className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-white mt-2">${(totalBudget / 1000000).toFixed(2)}M</div>
          <div className="text-[11px] text-zinc-400 font-mono mt-1 flex items-center space-x-2">
            <span>Spent: ${(totalSpend / 1000000).toFixed(2)}M</span>
            <span>•</span>
            <span className="text-amber-400 font-bold">{budgetUtilization}% Burn</span>
          </div>
        </div>

        {/* Contract Portfolio Value */}
        <div
          onClick={() => setActiveModule('contracts')}
          className="bg-zinc-950 border border-zinc-800 hover:border-emerald-500/50 p-4 rounded-xl transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">Contract Value</span>
            <FileText className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-white mt-2">${(totalContractVal / 1000000).toFixed(2)}M</div>
          <div className="text-[11px] text-zinc-400 font-mono mt-1">
            {contracts.length} Enterprise Supplier Agreements
          </div>
        </div>

        {/* Net Asset Book Value (Depreciation) */}
        <div
          onClick={() => setActiveModule('financials')}
          className="bg-zinc-950 border border-zinc-800 hover:border-emerald-500/50 p-4 rounded-xl transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">Fixed Asset Book Value</span>
            <CreditCard className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-white mt-2">${(totalDepreciatedValue / 1000000).toFixed(2)}M</div>
          <div className="text-[11px] text-zinc-400 font-mono mt-1">
            {depreciationSchedules.length} Active Asset Depreciation Schedules
          </div>
        </div>

        {/* Pending POs */}
        <div
          onClick={() => setActiveModule('procurement')}
          className="bg-zinc-950 border border-zinc-800 hover:border-amber-500/50 p-4 rounded-xl transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">Pending POs</span>
            <ShoppingBag className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-white mt-2">${(poTotalPending / 1000).toFixed(1)}k</div>
          <div className="text-[11px] text-amber-400 font-mono mt-1 font-bold">
            {pendingPOs.length} Orders Awaiting Approval / Delivery
          </div>
        </div>
      </div>

      {/* Cost Centers & Budget Utilization Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Cost Centers */}
        <div className="bg-zinc-950 p-4 border border-zinc-800 rounded-xl">
          <div className="font-bold text-sm text-white flex items-center space-x-2 border-b border-zinc-800 pb-3 mb-3">
            <Building className="w-4 h-4 text-emerald-400" />
            <span>Cost Centers & Spend</span>
          </div>
          <div className="space-y-2 text-xs font-mono">
            {costCenters.slice(0, 4).map((cc) => {
              const util = Math.round((cc.currentSpend / (cc.budgetAllocated || 1)) * 100);
              return (
                <div key={cc.id} className="bg-black/60 p-2 rounded border border-zinc-800/80">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white">{cc.name}</span>
                    <span className="text-emerald-400 font-bold">${(cc.currentSpend / 1000).toFixed(0)}k</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-zinc-400 mt-1">
                    <span>Budget: ${(cc.budgetAllocated / 1000).toFixed(0)}k</span>
                    <span className={util > 85 ? 'text-red-400 font-bold' : 'text-zinc-400'}>{util}% Utilized</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Expiring Contracts */}
        <div className="bg-zinc-950 p-4 border border-zinc-800 rounded-xl">
          <div className="font-bold text-sm text-white flex items-center space-x-2 border-b border-zinc-800 pb-3 mb-3">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Upcoming Contract Renewals</span>
          </div>
          <div className="space-y-2 text-xs font-mono">
            {contracts.slice(0, 3).map((c) => (
              <div key={c.id} className="bg-black/60 p-2 rounded border border-zinc-800/80 flex justify-between items-center">
                <div>
                  <div className="font-bold text-white">{c.name}</div>
                  <div className="text-[10px] text-zinc-500">{c.vendorName} • Ends: {c.endDate}</div>
                </div>
                <div className="text-right">
                  <div className="text-emerald-400 font-bold">${(c.totalValue / 1000).toFixed(0)}k</div>
                  <span className="text-[9px] bg-amber-950 text-amber-400 border border-amber-800 px-1.5 py-0.5 rounded font-bold">
                    {c.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shelfware & Savings Opportunities */}
        <div className="bg-zinc-950 p-4 border border-zinc-800 rounded-xl">
          <div className="font-bold text-sm text-white flex items-center space-x-2 border-b border-zinc-800 pb-3 mb-3">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Cost Optimization Insights</span>
          </div>
          <div className="space-y-2 text-xs font-mono">
            <div className="bg-black/60 p-2.5 rounded border border-zinc-800/80">
              <div className="text-cyan-400 font-bold flex items-center space-x-1">
                <span>Unused SaaS License Reclamation</span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">
                48 unassigned cloud seats identified. Potential savings: <strong className="text-white">$34,200 / yr</strong>.
              </p>
            </div>
            <div className="bg-black/60 p-2.5 rounded border border-zinc-800/80">
              <div className="text-emerald-400 font-bold flex items-center space-x-1">
                <span>Hardware Maintenance Consolidation</span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">
                Consolidating 3 OEM server warranties into 1 enterprise agreement saves <strong className="text-white">14% OpEx</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contract & PO Approvals Table */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-4 border-b border-zinc-800 pb-3">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-sm text-white uppercase tracking-wider">
              Active Vendor Contracts & Procurement Ledger
            </h3>
          </div>
          <button
            onClick={() => setActiveModule('contracts')}
            className="text-xs text-emerald-400 hover:text-white font-mono underline cursor-pointer"
          >
            All Enterprise Contracts →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="bg-black text-zinc-400 border-b border-zinc-800 uppercase text-[10px] tracking-wider">
                <th className="p-3">Contract Name</th>
                <th className="p-3">Vendor</th>
                <th className="p-3">Total Value</th>
                <th className="p-3">Term Dates</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 text-zinc-300">
              {contracts.slice(0, 5).map((c) => (
                <tr key={c.id} className="hover:bg-zinc-900 transition-colors">
                  <td className="p-3 font-bold text-white">{c.name}</td>
                  <td className="p-3 text-emerald-400">{c.vendorName}</td>
                  <td className="p-3 text-white font-bold">${c.totalValue?.toLocaleString()}</td>
                  <td className="p-3 text-zinc-400">{c.startDate} to {c.endDate}</td>
                  <td className="p-3">
                    <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] px-2 py-0.5 rounded font-bold">
                      {c.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => setActiveModule('contracts')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold px-2.5 py-1 rounded cursor-pointer transition-colors"
                    >
                      View Terms
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
