import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import {
  HardDrive,
  KeyRound,
  PackageCheck,
  UserCheck,
  AlertTriangle,
  ShoppingBag,
  ArrowUpRight,
  Plus,
  QrCode,
  Laptop,
  Monitor,
  Smartphone,
  Server,
  Building,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
} from 'lucide-react';

export const ItamAdminDashboard: React.FC = () => {
  const {
    configurationItems,
    softwareLicenses,
    stockrooms,
    purchaseOrders,
    setActiveModule,
  } = useApp();

  const safeCis = configurationItems || [];
  const safeLicenses = softwareLicenses || [];
  const safePOs = purchaseOrders || [];
  const safeStockrooms = stockrooms || [];

  const hardwareItems = safeCis.filter((ci) => ci && ci.category === 'Hardware');
  const inStockCount = hardwareItems.filter((ci) => ci && ci.lifecycleState === 'In Stock').length;
  const assignedCount = hardwareItems.filter((ci) => ci && (ci.lifecycleState === 'In Use' || ci.lifecycleState === 'Assigned')).length;
  const inRepairCount = hardwareItems.filter((ci) => ci && ci.lifecycleState === 'In Repair').length;
  const disposedCount = hardwareItems.filter((ci) => ci && (ci.lifecycleState === 'Retired' || ci.lifecycleState === 'Disposed')).length;

  const laptops = hardwareItems.filter((ci) => ci && (ci.type?.toLowerCase().includes('laptop') || (ci.name || '').toLowerCase().includes('macbook') || (ci.name || '').toLowerCase().includes('thinkpad'))).length;
  const desktops = hardwareItems.filter((ci) => ci && (ci.type?.toLowerCase().includes('desktop') || ci.type?.toLowerCase().includes('workstation'))).length;
  const servers = hardwareItems.filter((ci) => ci && ci.type?.toLowerCase().includes('server')).length;
  const otherHw = hardwareItems.length - (laptops + desktops + servers);

  const underLicensed = safeLicenses.filter(
    (l) => l && (l.complianceStatus === 'Under-Licensed' || l.complianceStatus === 'Risk Alert')
  );
  const totalLiability = underLicensed.reduce((acc, l) => acc + (l?.financialLiability || 0), 0);

  const pendingPOs = safePOs.filter((po) => po && (po.status === 'Ordered' || po.status === 'Draft'));

  return (
    <div className="space-y-6">
      {/* ITAM Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-950 p-4 border border-zinc-800 rounded-xl shadow-lg">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 bg-blue-950 text-blue-400 border border-blue-800 rounded-md text-[10px] font-mono font-bold tracking-wider uppercase">
              ITAM Specialist Hub
            </span>
            <span className="bg-zinc-800 text-zinc-300 border border-zinc-700 text-[10px] font-mono px-2 py-0.5 rounded">
              Fleet & Software Lifecycle
            </span>
          </div>
          <h1 className="text-xl font-black text-white tracking-tight mt-1">
            IT ASSET & SOFTWARE LICENSE OPERATIONS DESK
          </h1>
          <p className="text-xs text-zinc-400 font-mono">
            Hardware Provisioning, Stockroom Logistics, Spare Reserves & License True-Up Control
          </p>
        </div>

        {/* Quick ITAM Action Toolkit */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <button
            onClick={() => setActiveModule('stockroom')}
            className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-colors shadow-md shadow-blue-950"
          >
            <PackageCheck className="w-3.5 h-3.5" />
            <span>Stockroom Dispatch</span>
          </button>

          <button
            onClick={() => setActiveModule('hardware')}
            className="flex items-center space-x-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 hover:text-white px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-blue-400" />
            <span>Add Asset</span>
          </button>

          <button
            onClick={() => setActiveModule('mobile')}
            className="flex items-center space-x-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 hover:text-white px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-colors"
          >
            <QrCode className="w-3.5 h-3.5 text-emerald-400" />
            <span>Barcode Audit</span>
          </button>
        </div>
      </div>

      {/* ITAM Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Hardware Assets */}
        <div
          onClick={() => setActiveModule('hardware')}
          className="bg-zinc-950 border border-zinc-800 hover:border-blue-500/50 p-4 rounded-xl transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">Hardware Fleet</span>
            <HardDrive className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-white mt-2">{hardwareItems.length} Devices</div>
          <div className="text-[11px] text-zinc-400 font-mono mt-1 flex items-center space-x-2">
            <span className="text-emerald-400 font-bold">{assignedCount} Assigned</span>
            <span>•</span>
            <span className="text-blue-400">{inStockCount} In Stock</span>
          </div>
        </div>

        {/* Stockroom Spare Reserves */}
        <div
          onClick={() => setActiveModule('stockroom')}
          className="bg-zinc-950 border border-zinc-800 hover:border-blue-500/50 p-4 rounded-xl transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">Stockroom Spares</span>
            <PackageCheck className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-white mt-2">{inStockCount} Units</div>
          <div className="text-[11px] text-zinc-400 font-mono mt-1 flex items-center space-x-2">
            <span>In Repair: <strong className="text-amber-400">{inRepairCount}</strong></span>
            <span>•</span>
            <span>Retired: {disposedCount}</span>
          </div>
        </div>

        {/* Software License Deficit */}
        <div
          onClick={() => setActiveModule('licenses')}
          className="bg-zinc-950 border border-zinc-800 hover:border-red-500/50 p-4 rounded-xl transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">Under-Licensed Titles</span>
            <KeyRound className="w-5 h-5 text-red-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-white mt-2 flex items-center space-x-2">
            <span>{underLicensed.length} Products</span>
            {underLicensed.length > 0 && (
              <span className="bg-red-600 text-white text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                AUDIT RISK
              </span>
            )}
          </div>
          <div className="text-[11px] text-red-400 font-mono mt-1 font-bold">
            True-Up Deficit: ${totalLiability.toLocaleString()}
          </div>
        </div>

        {/* Active Purchase Orders */}
        <div
          onClick={() => setActiveModule('procurement')}
          className="bg-zinc-950 border border-zinc-800 hover:border-emerald-500/50 p-4 rounded-xl transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">Procurement Orders</span>
            <ShoppingBag className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-white mt-2">{pendingPOs.length} Pending</div>
          <div className="text-[11px] text-zinc-400 font-mono mt-1">
            Total {purchaseOrders.length} Purchase Orders Tracked
          </div>
        </div>
      </div>

      {/* Fleet Distribution & Stockrooms Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Device Categories */}
        <div className="bg-zinc-950 p-4 border border-zinc-800 rounded-xl">
          <div className="font-bold text-sm text-white flex items-center space-x-2 border-b border-zinc-800 pb-3 mb-3">
            <Laptop className="w-4 h-4 text-blue-400" />
            <span>Hardware Fleet Breakdown</span>
          </div>
          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between items-center bg-black/60 p-2 rounded border border-zinc-800/80">
              <span className="text-zinc-400">Laptops / MacBooks:</span>
              <span className="font-bold text-white">{laptops} Units</span>
            </div>
            <div className="flex justify-between items-center bg-black/60 p-2 rounded border border-zinc-800/80">
              <span className="text-zinc-400">Desktops & Workstations:</span>
              <span className="font-bold text-white">{desktops} Units</span>
            </div>
            <div className="flex justify-between items-center bg-black/60 p-2 rounded border border-zinc-800/80">
              <span className="text-zinc-400">Physical Servers:</span>
              <span className="font-bold text-white">{servers} Units</span>
            </div>
            <div className="flex justify-between items-center bg-black/60 p-2 rounded border border-zinc-800/80">
              <span className="text-zinc-400">Other Network & Peripherals:</span>
              <span className="font-bold text-white">{Math.max(0, otherHw)} Units</span>
            </div>
          </div>
        </div>

        {/* Stockrooms & Spares */}
        <div className="bg-zinc-950 p-4 border border-zinc-800 rounded-xl">
          <div className="font-bold text-sm text-white flex items-center space-x-2 border-b border-zinc-800 pb-3 mb-3">
            <PackageCheck className="w-4 h-4 text-emerald-400" />
            <span>Warehouse Locations</span>
          </div>
          <div className="space-y-2 text-xs font-mono">
            {stockrooms.slice(0, 3).map((st) => (
              <div key={st.id} className="bg-black/60 p-2 rounded border border-zinc-800/80 flex justify-between items-center">
                <div>
                  <div className="font-bold text-white">{st.name}</div>
                  <div className="text-[10px] text-zinc-500">{st.location}</div>
                </div>
                <div className="text-right">
                  <div className="text-emerald-400 font-bold">{st.itemCount || 12} Spares</div>
                  <div className="text-[10px] text-zinc-500">Cap: {st.capacity || 100}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* License Audit Focus */}
        <div className="bg-zinc-950 p-4 border border-zinc-800 rounded-xl">
          <div className="font-bold text-sm text-white flex items-center space-x-2 border-b border-zinc-800 pb-3 mb-3">
            <KeyRound className="w-4 h-4 text-red-500" />
            <span>Software Compliance Watch</span>
          </div>
          <div className="space-y-2 text-xs font-mono">
            {softwareLicenses.slice(0, 3).map((lic) => (
              <div key={lic.id} className="bg-black/60 p-2 rounded border border-zinc-800/80 flex justify-between items-center">
                <div>
                  <div className="font-bold text-white">{lic.softwareName}</div>
                  <div className="text-[10px] text-zinc-500">
                    Entitled: {lic.purchasedSeats} • Installed: {lic.installedSeats}
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  lic.complianceStatus === 'Compliant'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : 'bg-red-950 text-red-400 border border-red-800'
                }`}>
                  {lic.complianceStatus}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hardware Asset Inventory Preview Table */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-4 border-b border-zinc-800 pb-3">
          <div className="flex items-center space-x-2">
            <HardDrive className="w-4 h-4 text-blue-400" />
            <h3 className="font-bold text-sm text-white uppercase tracking-wider">
              Fleet Hardware Asset Ledger (Recent Discoveries & Assignments)
            </h3>
          </div>
          <button
            onClick={() => setActiveModule('hardware')}
            className="text-xs text-blue-400 hover:text-white font-mono underline cursor-pointer"
          >
            Full Hardware Ledger →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="bg-black text-zinc-400 border-b border-zinc-800 uppercase text-[10px] tracking-wider">
                <th className="p-3">Asset Tag / Serial</th>
                <th className="p-3">Device Name</th>
                <th className="p-3">Category</th>
                <th className="p-3">Lifecycle State</th>
                <th className="p-3">Assigned Owner</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 text-zinc-300">
              {hardwareItems.slice(0, 6).map((ci) => (
                <tr key={ci.id} className="hover:bg-zinc-900 transition-colors">
                  <td className="p-3 font-bold text-blue-400">{ci.serialNumber || ci.id}</td>
                  <td className="p-3 text-white font-medium">{ci.name}</td>
                  <td className="p-3 text-zinc-400">{ci.type || 'Workstation'}</td>
                  <td className="p-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      ci.lifecycleState === 'In Stock'
                        ? 'bg-blue-950 text-blue-400 border border-blue-800'
                        : ci.lifecycleState === 'In Use' || ci.lifecycleState === 'Assigned'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-amber-950 text-amber-400 border border-amber-800'
                    }`}>
                      {ci.lifecycleState}
                    </span>
                  </td>
                  <td className="p-3 text-zinc-300">{ci.owner || 'Unassigned'}</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => setActiveModule('assignments')}
                      className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 hover:text-white text-[10px] px-2.5 py-1 rounded cursor-pointer transition-colors"
                    >
                      Assign / Reallocate
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
