// ==================== ENTERPRISE MFE SHELL APPLICATION ====================
// Container application providing top navigation, sidebar, tenant selector, RBAC context, breadcrumbs,
// module switcher, and lazy loading for isolated remote micro-frontends.

import React, { useState, Suspense } from 'react';
import {
  Boxes,
  Database,
  ShieldAlert,
  DollarSign,
  Cpu,
  Workflow,
  BarChart3,
  Settings,
  Building2,
  UserCheck,
  ChevronRight,
  Menu,
  X,
  Search,
  Bell,
  RefreshCw,
  Sliders,
  Table,
} from 'lucide-react';

import { MfeUserContext, MfeModuleId } from '../types/mfeTypes';
import { Loader, EmptyState, Card, Table as ItamTable, Badge } from '../design_system/ItamUiDesignSystem';
import { DataGridDashboardsModule } from '../../grid_dashboards/DataGridDashboardsModule';

// Remote MFE Loaders
import { ItamRemoteMfe } from '../remotes/ItamRemoteMfe';
import { SamRemoteMfe } from '../remotes/SamRemoteMfe';
import { FinancialRemoteMfe } from '../remotes/FinancialRemoteMfe';
import { DiscoveryRemoteMfe } from '../remotes/DiscoveryRemoteMfe';
import { CmdbRemoteMfe } from '../remotes/CmdbRemoteMfe';
import { ComplianceRemoteMfe } from '../remotes/ComplianceRemoteMfe';
import { WorkflowRemoteMfe } from '../remotes/WorkflowRemoteMfe';
import { AnalyticsRemoteMfe } from '../remotes/AnalyticsRemoteMfe';
import { AdministrationRemoteMfe } from '../remotes/AdministrationRemoteMfe';

export const ItamShellApplication: React.FC = () => {
  const [userCtx, setUserCtx] = useState<MfeUserContext>({
    userId: 'USR-8001',
    userName: 'Rajesh Sharma',
    userEmail: 'rajesh.sharma@kspl.com',
    role: 'ADMIN',
    tenantId: 'tenant-kspl-global',
    tenantName: 'KSPL Enterprise Global',
    permissions: ['VIEW_ASSETS', 'EDIT_ASSETS', 'MANAGE_TENANTS', 'VIEW_FINANCIALS', 'ADMINISTER_SYSTEM'],
  });

  const [activeModule, setActiveModule] = useState<MfeModuleId>('itam');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Available Tenants
  const availableTenants = [
    { id: 'tenant-kspl-global', name: 'KSPL Enterprise Global' },
    { id: 'tenant-delhi-dc', name: 'Delhi Data Center Division' },
    { id: 'tenant-mumbai-cloud', name: 'Mumbai Cloud Operations' },
  ];

  // Module Registry
  const modules = [
    { id: 'itam' as MfeModuleId, name: 'IT Asset Management', icon: Boxes, remoteUrl: 'http://mfe-itam.internal:3001' },
    { id: 'grid-dashboards' as MfeModuleId, name: 'Data Grid & Analytics', icon: Table, remoteUrl: 'http://mfe-grid.internal:3010' },
    { id: 'sam' as MfeModuleId, name: 'Software Asset (SAM)', icon: ShieldAlert, remoteUrl: 'http://mfe-sam.internal:3002' },
    { id: 'financial' as MfeModuleId, name: 'Financials & TCO', icon: DollarSign, remoteUrl: 'http://mfe-fin.internal:3003' },
    { id: 'discovery' as MfeModuleId, name: 'Discovery Engine', icon: Search, remoteUrl: 'http://mfe-disc.internal:3004' },
    { id: 'cmdb' as MfeModuleId, name: 'CMDB & Graph', icon: Database, remoteUrl: 'http://mfe-cmdb.internal:3005' },
    { id: 'compliance' as MfeModuleId, name: 'Compliance & Audit', icon: Cpu, remoteUrl: 'http://mfe-comp.internal:3006' },
    { id: 'workflow' as MfeModuleId, name: 'ITSM Workflows', icon: Workflow, remoteUrl: 'http://mfe-wf.internal:3007' },
    { id: 'analytics' as MfeModuleId, name: 'Predictive Analytics', icon: BarChart3, remoteUrl: 'http://mfe-analytics.internal:3008' },
    { id: 'admin' as MfeModuleId, name: 'Administration & RBAC', icon: Settings, remoteUrl: 'http://mfe-admin.internal:3009' },
  ];

  const handleTenantChange = (tenantId: string) => {
    const tenant = availableTenants.find((t) => t.id === tenantId);
    if (tenant) {
      setUserCtx((prev) => ({
        ...prev,
        tenantId: tenant.id,
        tenantName: tenant.name,
      }));
    }
  };

  const renderActiveRemoteMfe = () => {
    switch (activeModule) {
      case 'itam':
        return <ItamRemoteMfe userCtx={userCtx} />;
      case 'grid-dashboards':
        return <DataGridDashboardsModule tenantId={userCtx.tenantId} userRole={userCtx.role} />;
      case 'sam':
        return <SamRemoteMfe userCtx={userCtx} />;
      case 'financial':
        return <FinancialRemoteMfe userCtx={userCtx} />;
      case 'discovery':
        return <DiscoveryRemoteMfe userCtx={userCtx} />;
      case 'cmdb':
        return <CmdbRemoteMfe userCtx={userCtx} />;
      case 'compliance':
        return <ComplianceRemoteMfe userCtx={userCtx} />;
      case 'workflow':
        return <WorkflowRemoteMfe userCtx={userCtx} />;
      case 'analytics':
        return <AnalyticsRemoteMfe userCtx={userCtx} />;
      case 'admin':
        return <AdministrationRemoteMfe userCtx={userCtx} />;
      default:
        return <EmptyState message="Remote Micro-Frontend module not registered or temporarily offline." />;
    }
  };

  return (
    <div className="bg-black min-h-screen text-white font-mono text-xs flex flex-col selection:bg-red-600 selection:text-white">
      {/* Shell Top Header Bar */}
      <header className="bg-zinc-950 border-b border-zinc-800 px-4 py-2.5 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 bg-black hover:bg-zinc-900 border border-zinc-800 rounded text-zinc-400 hover:text-white cursor-pointer"
          >
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 bg-red-600 rounded-sm"></span>
            <span className="font-bold tracking-wider text-sm uppercase text-white">@itam/mfe-shell</span>
            <span className="px-2 py-0.5 bg-red-600/20 border border-red-500 text-red-400 text-[10px] font-bold rounded">
              v4.2 PROD
            </span>
          </div>
        </div>

        {/* Tenant Selector & User Profile */}
        <div className="flex items-center space-x-3">
          {/* Tenant Selector */}
          <div className="flex items-center space-x-1.5 bg-black border border-zinc-800 rounded px-2.5 py-1">
            <Building2 className="w-3.5 h-3.5 text-red-500" />
            <select
              value={userCtx.tenantId}
              onChange={(e) => handleTenantChange(e.target.value)}
              className="bg-black text-white text-[11px] font-bold focus:outline-none cursor-pointer"
            >
              {availableTenants.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* User Badge */}
          <div className="hidden sm:flex items-center space-x-2 bg-black border border-zinc-800 rounded px-2.5 py-1">
            <UserCheck className="w-3.5 h-3.5 text-zinc-400" />
            <span className="font-bold text-white text-[11px]">{userCtx.userName}</span>
            <span className="px-1.5 py-0.2 bg-red-600 text-white rounded text-[9px] font-bold uppercase">
              {userCtx.role}
            </span>
          </div>
        </div>
      </header>

      {/* Main Shell Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Micro-Frontend Module Navigation Sidebar */}
        {sidebarOpen && (
          <aside className="w-64 bg-zinc-950 border-r border-zinc-800 p-3 space-y-4 flex-shrink-0">
            <div className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider px-2">
              Registered MFE Modules
            </div>

            <nav className="space-y-1">
              {modules.map((m) => {
                const Icon = m.icon;
                const isActive = activeModule === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setActiveModule(m.id)}
                    className={`w-full flex items-center justify-between p-2.5 rounded font-mono text-[11px] text-left cursor-pointer transition-colors ${
                      isActive
                        ? 'bg-red-600 text-white font-bold shadow-sm'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Icon className="w-4 h-4" />
                      <span>{m.name}</span>
                    </div>
                    <ChevronRight className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-zinc-600'}`} />
                  </button>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-zinc-800 text-[10px] text-zinc-500 space-y-1 px-2">
              <div>Active Module URL:</div>
              <div className="text-zinc-300 truncate font-mono">
                {modules.find((m) => m.id === activeModule)?.remoteUrl}
              </div>
            </div>
          </aside>
        )}

        {/* Main Content Workspace */}
        <main className="flex-1 overflow-y-auto p-4 space-y-4 bg-black">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center space-x-2 text-[11px] text-zinc-400 font-mono">
            <span>Shell</span>
            <span>/</span>
            <span>{userCtx.tenantName}</span>
            <span>/</span>
            <span className="text-white font-bold uppercase">{activeModule} Remote</span>
          </div>

          {/* Lazy Loaded Remote Micro-Frontend */}
          <Suspense fallback={<Loader label={`Loading Micro-Frontend Module '${activeModule}'...`} />}>
            {renderActiveRemoteMfe()}
          </Suspense>
        </main>
      </div>
    </div>
  );
};
