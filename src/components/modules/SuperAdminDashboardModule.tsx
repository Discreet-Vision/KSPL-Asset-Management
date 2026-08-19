import React, { useState, useEffect } from 'react';
import {
  Crown,
  ShieldCheck,
  Building2,
  Users,
  KeyRound,
  Activity,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  Sliders,
  Check,
  X,
  Lock,
  Globe,
  Database,
  Terminal,
  ShieldAlert,
  Plug,
  Code,
  Settings,
  HardDrive,
  BarChart3,
  FileText,
} from 'lucide-react';
import {
  SuperAdminPlatformOverview,
  MfaResetRequest,
  User,
  OrganizationTenant,
} from '../../types';

import { SuperAdminOverviewTab } from '../superadmin/SuperAdminOverviewTab';
import { SuperAdminTenantsTab } from '../superadmin/SuperAdminTenantsTab';
import { SuperAdminUsersTab } from '../superadmin/SuperAdminUsersTab';
import { SuperAdminRbacTab } from '../superadmin/SuperAdminRbacTab';
import { SuperAdminSecurityTab } from '../superadmin/SuperAdminSecurityTab';
import { SuperAdminMfaTab } from '../superadmin/SuperAdminMfaTab';
import { SuperAdminSystemHealthTab } from '../superadmin/SuperAdminSystemHealthTab';
import { SuperAdminIntegrationsTab } from '../superadmin/SuperAdminIntegrationsTab';
import { SuperAdminApiWebhooksTab } from '../superadmin/SuperAdminApiWebhooksTab';
import { SuperAdminSettingsTab } from '../superadmin/SuperAdminSettingsTab';
import { SuperAdminBackupsTab } from '../superadmin/SuperAdminBackupsTab';
import { SuperAdminAssetsTab } from '../superadmin/SuperAdminAssetsTab';
import { SuperAdminNotificationsTab } from '../superadmin/SuperAdminNotificationsTab';
import { useApp } from '../../context/AppContext';

interface SuperAdminDashboardModuleProps {
  currentUser: User;
}

export type SuperAdminTabType =
  | 'overview'
  | 'tenants'
  | 'users'
  | 'rbac'
  | 'assets'
  | 'security'
  | 'mfa_requests'
  | 'notifications'
  | 'system_health'
  | 'integrations'
  | 'api_webhooks'
  | 'settings'
  | 'backups';

export const SuperAdminDashboardModule: React.FC<SuperAdminDashboardModuleProps> = ({
  currentUser,
}) => {
  const { superAdminTab, setSuperAdminTab, setActiveModule } = useApp();
  const [localTab, setLocalTab] = useState<SuperAdminTabType>('overview');

  const activeTab = (superAdminTab as SuperAdminTabType) || localTab;
  const setActiveTab = (tab: SuperAdminTabType) => {
    setLocalTab(tab);
    if (setSuperAdminTab) {
      setSuperAdminTab(tab);
    }
  };
  const [overview, setOverview] = useState<SuperAdminPlatformOverview | null>(null);
  const [mfaRequests, setMfaRequests] = useState<MfaResetRequest[]>([]);
  const [globalUsers, setGlobalUsers] = useState<any[]>([]);
  const [tenants, setTenants] = useState<OrganizationTenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalSearch, setGlobalSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [overviewRes, requestsRes, usersRes, tenantsRes] = await Promise.all([
        fetch('/api/super-admin/overview'),
        fetch('/api/super-admin/mfa-requests'),
        fetch('/api/super-admin/users'),
        fetch('/api/super-admin/tenants'),
      ]);

      if (overviewRes.ok) setOverview(await overviewRes.json());
      if (requestsRes.ok) {
        const data = await requestsRes.json();
        setMfaRequests(data.requests || []);
      }
      if (usersRes.ok) {
        const data = await usersRes.json();
        setGlobalUsers(data.users || []);
      }
      if (tenantsRes.ok) {
        const data = await tenantsRes.json();
        setTenants(data.tenants || []);
      }
    } catch (err) {
      console.error('Failed to load Super Admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const pendingRequestsCount = (mfaRequests || []).filter((r) => r?.status === 'Pending').length;

  // Search results for global header search
  const searchResults = {
    tenants: (tenants || []).filter(
      (t) =>
        globalSearch &&
        ((t.name || '').toLowerCase().includes(globalSearch.toLowerCase()) ||
          (t.code || '').toLowerCase().includes(globalSearch.toLowerCase()))
    ),
    users: (globalUsers || []).filter(
      (u) =>
        globalSearch &&
        ((u.name || '').toLowerCase().includes(globalSearch.toLowerCase()) ||
          (u.email || '').toLowerCase().includes(globalSearch.toLowerCase()))
    ),
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-100">
      {/* Top Super Admin Header & Scope Banner */}
      <div className="bg-gradient-to-r from-red-950 via-slate-900 to-slate-950 border border-red-600/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-red-600/20 border border-red-500/30 text-red-400 flex items-center justify-center shrink-0 shadow-lg shadow-red-950/50">
              <Crown className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-600/20 text-red-400 border border-red-500/30">
                  Global Software Super Admin
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Master Principal: {currentUser?.email || 'Master Super Admin'}
                </span>
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight mt-1">
                Platform Control & SaaS Administration
              </h1>
              <p className="text-xs text-slate-400">
                Multi-tenant isolation, cross-organization governance, and security operations center.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Global Search Bar */}
            <div className="relative">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={globalSearch}
                  onFocus={() => setSearchOpen(true)}
                  onChange={(e) => {
                    setGlobalSearch(e.target.value);
                    setSearchOpen(true);
                  }}
                  placeholder="Global Search (Clients, Users)..."
                  className="w-48 sm:w-64 pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:w-72 transition-all"
                />
              </div>

              {searchOpen && globalSearch.trim() && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-3 z-50 text-xs space-y-2">
                  <div className="flex justify-between items-center text-[11px] text-slate-400 font-bold border-b border-slate-800 pb-1.5">
                    <span>Quick Jump Results</span>
                    <button
                      onClick={() => setSearchOpen(false)}
                      className="text-slate-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {searchResults.tenants.length > 0 && (
                    <div>
                      <span className="text-[10px] text-red-400 font-semibold uppercase block mb-1">
                        Tenants
                      </span>
                      {searchResults.tenants.slice(0, 3).map((t) => (
                        <div
                          key={t.id}
                          onClick={() => {
                            setActiveTab('tenants');
                            setSearchOpen(false);
                          }}
                          className="p-1.5 hover:bg-slate-800 rounded-lg cursor-pointer flex justify-between items-center"
                        >
                          <span className="font-semibold text-white">{t.name}</span>
                          <span className="text-[10px] font-mono text-slate-500">{t.code}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {searchResults.users.length > 0 && (
                    <div>
                      <span className="text-[10px] text-blue-400 font-semibold uppercase block mb-1">
                        Users
                      </span>
                      {searchResults.users.slice(0, 3).map((u) => (
                        <div
                          key={u.id}
                          onClick={() => {
                            setActiveTab('users');
                            setSearchOpen(false);
                          }}
                          className="p-1.5 hover:bg-slate-800 rounded-lg cursor-pointer"
                        >
                          <span className="font-semibold text-white block">{u.name}</span>
                          <span className="text-[10px] text-slate-400">{u.email}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {searchResults.tenants.length === 0 && searchResults.users.length === 0 && (
                    <div className="text-center py-2 text-slate-500">No matching records found.</div>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={fetchData}
              disabled={loading}
              className="py-2 px-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex items-center gap-1 border-b border-slate-800 overflow-x-auto pb-1 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-2.5 px-3.5 rounded-t-xl flex items-center gap-2 transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'overview'
              ? 'border-red-500 text-white bg-slate-900/80 shadow'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-4 h-4 text-red-500" />
          <span>Platform Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('tenants')}
          className={`py-2.5 px-3.5 rounded-t-xl flex items-center gap-2 transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'tenants'
              ? 'border-red-500 text-white bg-slate-900/80 shadow'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4 text-red-400" />
          <span>Organizations ({tenants.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`py-2.5 px-3.5 rounded-t-xl flex items-center gap-2 transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'users'
              ? 'border-red-500 text-white bg-slate-900/80 shadow'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4 text-blue-400" />
          <span>Global Users ({globalUsers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('rbac')}
          className={`py-2.5 px-3.5 rounded-t-xl flex items-center gap-2 transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'rbac'
              ? 'border-red-500 text-white bg-slate-900/80 shadow'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders className="w-4 h-4 text-purple-400" />
          <span>RBAC Matrix</span>
        </button>

        <button
          onClick={() => setActiveTab('assets')}
          className={`py-2.5 px-3.5 rounded-t-xl flex items-center gap-2 transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'assets'
              ? 'border-red-500 text-white bg-slate-900/80 shadow'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <HardDrive className="w-4 h-4 text-indigo-400" />
          <span>Federated Assets</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`py-2.5 px-3.5 rounded-t-xl flex items-center gap-2 transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'security'
              ? 'border-red-500 text-white bg-slate-900/80 shadow'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-emerald-400" />
          <span>Security Center</span>
        </button>

        <button
          onClick={() => setActiveTab('mfa_requests')}
          className={`py-2.5 px-3.5 rounded-t-xl flex items-center gap-2 transition-all border-b-2 whitespace-nowrap relative ${
            activeTab === 'mfa_requests'
              ? 'border-red-500 text-white bg-slate-900/80 shadow'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <KeyRound className="w-4 h-4 text-amber-400" />
          <span>MFA Reset Queue</span>
          {pendingRequestsCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-red-600 text-white animate-pulse">
              {pendingRequestsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`py-2.5 px-3.5 rounded-t-xl flex items-center gap-2 transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'notifications'
              ? 'border-red-500 text-white bg-slate-900/80 shadow'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-4 h-4 text-amber-400" />
          <span>Notifications & Alerts</span>
        </button>

        <button
          onClick={() => setActiveTab('integrations')}
          className={`py-2.5 px-3.5 rounded-t-xl flex items-center gap-2 transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'integrations'
              ? 'border-red-500 text-white bg-slate-900/80 shadow'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Plug className="w-4 h-4 text-indigo-400" />
          <span>Integrations</span>
        </button>

        <button
          onClick={() => setActiveTab('api_webhooks')}
          className={`py-2.5 px-3.5 rounded-t-xl flex items-center gap-2 transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'api_webhooks'
              ? 'border-red-500 text-white bg-slate-900/80 shadow'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Code className="w-4 h-4 text-cyan-400" />
          <span>API & Webhooks</span>
        </button>

        <button
          onClick={() => setActiveTab('system_health')}
          className={`py-2.5 px-3.5 rounded-t-xl flex items-center gap-2 transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'system_health'
              ? 'border-red-500 text-white bg-slate-900/80 shadow'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-4 h-4 text-emerald-400" />
          <span>System Health</span>
        </button>

        <button
          onClick={() => setActiveTab('backups')}
          className={`py-2.5 px-3.5 rounded-t-xl flex items-center gap-2 transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'backups'
              ? 'border-red-500 text-white bg-slate-900/80 shadow'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <HardDrive className="w-4 h-4 text-amber-500" />
          <span>Backups & Dumps</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`py-2.5 px-3.5 rounded-t-xl flex items-center gap-2 transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'settings'
              ? 'border-red-500 text-white bg-slate-900/80 shadow'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Settings className="w-4 h-4 text-slate-300" />
          <span>Platform Settings</span>
        </button>
      </div>

      {/* Render Active Tab Component */}
      {activeTab === 'overview' && (
        <SuperAdminOverviewTab overview={overview} onNavigateTab={(tab) => setActiveTab(tab)} />
      )}

      {activeTab === 'tenants' && (
        <SuperAdminTenantsTab tenants={tenants} onRefresh={fetchData} />
      )}

      {activeTab === 'users' && (
        <SuperAdminUsersTab users={globalUsers} tenants={tenants} onRefresh={fetchData} />
      )}

      {activeTab === 'rbac' && <SuperAdminRbacTab tenants={tenants} />}

      {activeTab === 'assets' && (
        <SuperAdminAssetsTab
          tenants={tenants}
          onNavigateModule={(mod) => setActiveModule(mod as any)}
        />
      )}

      {activeTab === 'security' && <SuperAdminSecurityTab tenants={tenants} />}

      {activeTab === 'mfa_requests' && (
        <SuperAdminMfaTab
          currentUser={currentUser}
          mfaRequests={mfaRequests}
          onRefresh={fetchData}
        />
      )}

      {activeTab === 'notifications' && <SuperAdminNotificationsTab tenants={tenants} />}

      {activeTab === 'integrations' && <SuperAdminIntegrationsTab />}

      {activeTab === 'api_webhooks' && <SuperAdminApiWebhooksTab tenants={tenants} />}

      {activeTab === 'system_health' && <SuperAdminSystemHealthTab />}

      {activeTab === 'backups' && <SuperAdminBackupsTab />}

      {activeTab === 'settings' && <SuperAdminSettingsTab />}
    </div>
  );
};
