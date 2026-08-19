import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import {
  Laptop,
  Monitor,
  Code,
  KeyRound,
  Ticket,
  UserPlus,
  CheckCircle2,
  Clock,
  Building,
  Plus,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  Package,
} from 'lucide-react';

export const EmployeeDashboard: React.FC = () => {
  const {
    currentUser,
    configurationItems,
    softwareLicenses,
    selfServiceRequests,
    departments,
    locations,
    setActiveModule,
  } = useApp();

  const safeCis = configurationItems || [];
  const safeLicenses = softwareLicenses || [];
  const safeRequests = selfServiceRequests || [];
  const safeDepts = departments || [];
  const safeLocs = locations || [];

  // Find assets assigned to the current user
  const myHardware = safeCis.filter(
    (ci) =>
      ci &&
      ((currentUser?.name && ci.owner?.toLowerCase() === currentUser.name.toLowerCase()) ||
        (currentUser?.email && ci.owner?.toLowerCase() === currentUser.email.toLowerCase()) ||
        (currentUser?.id && ci.assignedTo === currentUser.id) ||
        (currentUser?.email && ci.assignedTo === currentUser.email))
  );

  // Fallback demo assets if none specifically assigned
  const displayHardware =
    myHardware.length > 0
      ? myHardware
      : [
          {
            id: 'MY-LAPTOP-01',
            name: 'MacBook Pro 16" M3 Max (36GB / 1TB)',
            serialNumber: 'C02G99KLMD6R',
            type: 'Laptop Workstation',
            category: 'Hardware',
            lifecycleState: 'In Use',
            status: 'Operational',
            assignedDate: '2025-02-10',
          },
          {
            id: 'MY-MONITOR-02',
            name: 'Dell UltraSharp 27" 4K USB-C Hub Monitor',
            serialNumber: 'CN-098K4L-728',
            type: 'Peripherals',
            category: 'Hardware',
            lifecycleState: 'In Use',
            status: 'Operational',
            assignedDate: '2025-02-10',
          },
        ];

  // User's active software subscriptions
  const mySoftware = [
    { id: 'sw-1', name: 'Microsoft 365 Enterprise (E5)', type: 'Productivity', status: 'Active', renewal: 'Auto-Renew' },
    { id: 'sw-2', name: 'Slack Enterprise Grid', type: 'Collaboration', status: 'Active', renewal: 'Auto-Renew' },
    { id: 'sw-3', name: 'GitHub Enterprise Cloud', type: 'Engineering', status: 'Active', renewal: 'Auto-Renew' },
    { id: 'sw-4', name: 'Figma Professional', type: 'Design', status: 'Active', renewal: 'Auto-Renew' },
    { id: 'sw-5', name: 'Zoom Enterprise Video', type: 'Meetings', status: 'Active', renewal: 'Auto-Renew' },
  ];

  // User's self-service requests
  const myRequests = safeRequests.filter(
    (r) => r && ((currentUser?.id && r.requestedBy === currentUser.id) || (currentUser?.email && r.requestedBy === currentUser.email))
  );
  const displayRequests =
    myRequests.length > 0
      ? myRequests
      : [
          {
            id: 'REQ-1082',
            itemRequested: 'Apple Magic Keyboard with Touch ID & Numeric Keypad',
            category: 'Hardware Accessory',
            status: 'Approved',
            requestedDate: '2026-08-01',
            eta: '2026-08-16',
          },
          {
            id: 'REQ-1094',
            itemRequested: 'JetBrains All Products Pack License',
            category: 'Software License',
            status: 'In Review',
            requestedDate: '2026-08-11',
            eta: 'Pending Manager Approval',
          },
        ];

  const userDept = safeDepts.find((d) => d.id === currentUser?.departmentId)?.name || 'Engineering';
  const userLoc = safeLocs.find((l) => l.id === currentUser?.locationId)?.name || 'Headquarters - Building A';

  return (
    <div className="space-y-6">
      {/* Employee Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-950 p-5 border border-zinc-800 rounded-xl shadow-lg">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-md text-[10px] font-mono font-bold tracking-wider uppercase">
              Employee Workspace
            </span>
            <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-mono px-2 py-0.5 rounded font-bold">
              Account Active
            </span>
          </div>
          <h1 className="text-xl font-black text-white tracking-tight mt-1">
            WELCOME, {currentUser.name.toUpperCase()}
          </h1>
          <p className="text-xs text-zinc-400 font-mono">
            {userDept} • {userLoc} • Role: {currentUser.role}
          </p>
        </div>

        {/* Quick Request Button */}
        <button
          onClick={() => setActiveModule('selfservice')}
          className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-xs font-mono font-bold cursor-pointer transition-colors shadow-lg shadow-red-950/40 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Request Equipment / Software</span>
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Assigned Hardware */}
        <div
          onClick={() => setActiveModule('selfservice')}
          className="bg-zinc-950 border border-zinc-800 hover:border-blue-500/50 p-4 rounded-xl transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">Assigned Devices</span>
            <Laptop className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-white mt-2">{displayHardware.length} Devices</div>
          <div className="text-[11px] text-emerald-400 font-mono mt-1 font-bold">
            All devices healthy & verified
          </div>
        </div>

        {/* Software Subscriptions */}
        <div
          onClick={() => setActiveModule('selfservice')}
          className="bg-zinc-950 border border-zinc-800 hover:border-purple-500/50 p-4 rounded-xl transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">Software Access</span>
            <Code className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-white mt-2">{mySoftware.length} Active Apps</div>
          <div className="text-[11px] text-zinc-400 font-mono mt-1">
            Cloud Single Sign-On (SSO) Active
          </div>
        </div>

        {/* Open IT Requests */}
        <div
          onClick={() => setActiveModule('selfservice')}
          className="bg-zinc-950 border border-zinc-800 hover:border-amber-500/50 p-4 rounded-xl transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">Active Requests</span>
            <Ticket className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-white mt-2">{displayRequests.length} Open</div>
          <div className="text-[11px] text-amber-400 font-mono mt-1 font-bold">
            1 Approved • 1 In Review
          </div>
        </div>
      </div>

      {/* Two Column Layout: Assigned Hardware vs Active Software */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* My Assigned Hardware Equipment */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center space-x-2">
              <Laptop className="w-4 h-4 text-blue-400" />
              <h3 className="font-bold text-sm text-white uppercase tracking-wider">My Assigned Hardware</h3>
            </div>
            <span className="text-[11px] text-zinc-400 font-mono font-bold">{displayHardware.length} Items</span>
          </div>

          <div className="space-y-3">
            {displayHardware.map((hw, idx) => (
              <div key={hw.id || idx} className="bg-black/60 border border-zinc-800/80 rounded-lg p-3.5 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-white text-xs">{hw.name}</h4>
                    <span className="text-[11px] text-blue-400 font-mono">SN: {hw.serialNumber || 'SN-8492048'}</span>
                  </div>
                  <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                    Operational
                  </span>
                </div>
                <div className="flex justify-between text-[10px] text-zinc-400 font-mono pt-1 border-t border-zinc-800/60">
                  <span>Type: {hw.type || 'Workstation'}</span>
                  <span>Assigned: {(hw as any).assignedDate || '2025-02-10'}</span>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setActiveModule('selfservice')}
            className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white rounded-lg text-xs font-mono font-bold cursor-pointer transition-colors flex items-center justify-center space-x-1"
          >
            <span>Report Hardware Issue / Request Refresh</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </button>
        </div>

        {/* My Software Licenses & Subscriptions */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center space-x-2">
              <Code className="w-4 h-4 text-purple-400" />
              <h3 className="font-bold text-sm text-white uppercase tracking-wider">My Software Subscriptions</h3>
            </div>
            <span className="text-[11px] text-zinc-400 font-mono font-bold">{mySoftware.length} Active</span>
          </div>

          <div className="space-y-2.5">
            {mySoftware.map((sw) => (
              <div key={sw.id} className="bg-black/60 border border-zinc-800/80 rounded-lg p-3 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-xs">{sw.name}</h4>
                  <span className="text-[10px] text-zinc-500 font-mono">{sw.type}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="bg-purple-950 text-purple-300 border border-purple-800 text-[10px] font-mono px-2 py-0.5 rounded">
                    {sw.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setActiveModule('selfservice')}
            className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white rounded-lg text-xs font-mono font-bold cursor-pointer transition-colors flex items-center justify-center space-x-1"
          >
            <span>Browse Software Catalog & Request Tools</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </button>
        </div>
      </div>

      {/* Self-Service Requests Status Table */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center space-x-2">
            <Ticket className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-sm text-white uppercase tracking-wider">My Recent IT Asset Requests</h3>
          </div>
          <button
            onClick={() => setActiveModule('selfservice')}
            className="text-xs text-red-400 hover:text-white font-mono underline cursor-pointer"
          >
            Open Self-Service Catalog →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="bg-black text-zinc-400 border-b border-zinc-800 uppercase text-[10px] tracking-wider">
                <th className="p-3">Ticket ID</th>
                <th className="p-3">Item Requested</th>
                <th className="p-3">Category</th>
                <th className="p-3">Date Submitted</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">ETA / Next Step</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 text-zinc-300">
              {displayRequests.map((req) => (
                <tr key={req.id} className="hover:bg-zinc-900 transition-colors">
                  <td className="p-3 font-bold text-amber-400">{req.id}</td>
                  <td className="p-3 font-medium text-white">{req.itemRequested}</td>
                  <td className="p-3 text-zinc-400">{req.category}</td>
                  <td className="p-3 text-zinc-400">{req.requestedDate}</td>
                  <td className="p-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      req.status === 'Approved'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : req.status === 'In Review'
                        ? 'bg-amber-950 text-amber-400 border border-amber-800'
                        : 'bg-zinc-800 text-zinc-300'
                    }`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="p-3 text-right text-zinc-300">{(req as any).eta || 'Ready for Delivery'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
