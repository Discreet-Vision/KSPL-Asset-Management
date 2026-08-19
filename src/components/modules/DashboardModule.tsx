import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  Database,
  HardDrive,
  Flame,
  DollarSign,
  User,
  Eye,
  Sparkles,
} from 'lucide-react';

import { ExecutiveAdminDashboard } from './dashboard/ExecutiveAdminDashboard';
import { ItamAdminDashboard } from './dashboard/ItamAdminDashboard';
import { CmdbAdminDashboard } from './dashboard/CmdbAdminDashboard';
import { SecurityDashboard } from './dashboard/SecurityDashboard';
import { FinanceDashboard } from './dashboard/FinanceDashboard';
import { EmployeeDashboard } from './dashboard/EmployeeDashboard';

type DashboardRoleView = 'admin' | 'itam' | 'cmdb' | 'security' | 'finance' | 'employee';

export const DashboardModule: React.FC = () => {
  const { currentUser } = useApp();

  // Helper to map UserRole to DashboardRoleView
  const getDefaultRoleView = (role?: string): DashboardRoleView => {
    if (!role) return 'admin';
    const r = role.toLowerCase();
    if (r.includes('super_admin') || r.includes('super admin') || r.includes('client_admin') || r.includes('client admin')) {
      return 'admin';
    }
    if (r.includes('itam') || r.includes('asset manager') || r.includes('hardware')) {
      return 'itam';
    }
    if (r.includes('cmdb') || r.includes('cloud') || r.includes('technician')) {
      return 'cmdb';
    }
    if (r.includes('security') || r.includes('secops') || r.includes('auditor')) {
      return 'security';
    }
    if (r.includes('finance') || r.includes('procurement') || r.includes('budget')) {
      return 'finance';
    }
    if (r.includes('employee') || r.includes('developer') || r.includes('manager')) {
      return 'employee';
    }
    return 'admin';
  };

  const [activeRoleView, setActiveRoleView] = useState<DashboardRoleView>(() =>
    getDefaultRoleView(currentUser?.role)
  );

  // Sync when currentUser changes
  useEffect(() => {
    setActiveRoleView(getDefaultRoleView(currentUser?.role));
  }, [currentUser?.role]);

  const isSuperAdmin =
    currentUser?.role === 'SOFTWARE_SUPER_ADMIN' ||
    currentUser?.role === 'Software Super Admin' ||
    (currentUser as any)?.isSuperAdmin === true;

  const isAdmin =
    isSuperAdmin ||
    currentUser?.role === 'CLIENT_ADMIN' ||
    currentUser?.role === 'Client Admin' ||
    currentUser?.role === 'CLIENT_SUPER_ADMIN' ||
    currentUser?.role === 'Super Admin' ||
    (currentUser as any)?.isAdmin === true;

  return (
    <div className="p-3 sm:p-6 space-y-5 text-white font-sans selection:bg-red-600 selection:text-white">
      {/* Role-Based View Switcher Banner (Exclusive to Administrators) */}
      {isAdmin && (
        <div className="bg-zinc-950 border border-zinc-800/90 rounded-xl p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-inner">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-950 border border-red-800 flex items-center justify-center text-red-500 font-bold shrink-0">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-white tracking-wide">ROLE-ADAPTIVE DASHBOARD VIEW</span>
                <span className="text-[10px] bg-red-600 text-white font-mono font-bold px-1.5 py-0.5 rounded">
                  Admin Preview
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-mono">
                Current User: <strong className="text-white">{currentUser?.name}</strong> ({currentUser?.role || 'Administrator'})
              </p>
            </div>
          </div>

          {/* Role Pill Selector */}
          <div className="flex flex-wrap items-center gap-1.5 bg-black p-1.5 rounded-lg border border-zinc-800 text-xs font-mono">
            <button
              onClick={() => setActiveRoleView('admin')}
              className={`px-2.5 py-1 rounded cursor-pointer transition-all flex items-center space-x-1.5 ${
                activeRoleView === 'admin'
                  ? 'bg-red-600 text-white font-bold shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Executive</span>
            </button>

            <button
              onClick={() => setActiveRoleView('itam')}
              className={`px-2.5 py-1 rounded cursor-pointer transition-all flex items-center space-x-1.5 ${
                activeRoleView === 'itam'
                  ? 'bg-blue-600 text-white font-bold shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <HardDrive className="w-3.5 h-3.5" />
              <span>ITAM</span>
            </button>

            <button
              onClick={() => setActiveRoleView('cmdb')}
              className={`px-2.5 py-1 rounded cursor-pointer transition-all flex items-center space-x-1.5 ${
                activeRoleView === 'cmdb'
                  ? 'bg-purple-600 text-white font-bold shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>CMDB</span>
            </button>

            <button
              onClick={() => setActiveRoleView('security')}
              className={`px-2.5 py-1 rounded cursor-pointer transition-all flex items-center space-x-1.5 ${
                activeRoleView === 'security'
                  ? 'bg-red-600 text-white font-bold shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Security</span>
            </button>

            <button
              onClick={() => setActiveRoleView('finance')}
              className={`px-2.5 py-1 rounded cursor-pointer transition-all flex items-center space-x-1.5 ${
                activeRoleView === 'finance'
                  ? 'bg-emerald-600 text-white font-bold shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Finance</span>
            </button>

            <button
              onClick={() => setActiveRoleView('employee')}
              className={`px-2.5 py-1 rounded cursor-pointer transition-all flex items-center space-x-1.5 ${
                activeRoleView === 'employee'
                  ? 'bg-zinc-700 text-white font-bold shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Employee</span>
            </button>
          </div>
        </div>
      )}

      {/* Render Active Role-Tailored Dashboard View */}
      {activeRoleView === 'admin' && <ExecutiveAdminDashboard />}
      {activeRoleView === 'itam' && <ItamAdminDashboard />}
      {activeRoleView === 'cmdb' && <CmdbAdminDashboard />}
      {activeRoleView === 'security' && <SecurityDashboard />}
      {activeRoleView === 'finance' && <FinanceDashboard />}
      {activeRoleView === 'employee' && <EmployeeDashboard />}
    </div>
  );
};
