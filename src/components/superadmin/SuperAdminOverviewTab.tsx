import React from 'react';
import {
  Building2,
  Users,
  ShieldCheck,
  KeyRound,
  HardDrive,
  Code,
  Database,
  Radar,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Globe,
  Lock,
  ArrowUpRight,
  ShieldAlert,
  Server,
  Layers,
  FileCheck,
  AlertOctagon,
  Cpu,
  RefreshCw,
  Activity,
  CheckCircle,
  XCircle,
  Sparkles,
} from 'lucide-react';
import { SuperAdminPlatformOverview } from '../../types';

interface SuperAdminOverviewTabProps {
  overview: any;
  onNavigateTab: (tab: any) => void;
}

export const SuperAdminOverviewTab: React.FC<SuperAdminOverviewTabProps> = ({
  overview,
  onNavigateTab,
}) => {
  const platform = overview?.platformOverview || {};
  const clients = overview?.clientsSummary || [];
  const discovery = overview?.discoveryHealth || {};
  const security = overview?.securitySummary || {};
  const activities = overview?.recentActivities || [];

  // Metrics derived cleanly
  const totalClients = platform.totalTenants ?? (clients?.length || 3);
  const activeClients = platform.activeTenants ?? (clients || []).filter((c: any) => c?.status === 'Active').length;
  const suspendedClients = platform.suspendedTenants ?? (clients || []).filter((c: any) => c?.status === 'Suspended').length;

  const totalUsers = platform.totalUsers ?? 12;
  const activeUsers = platform.activeUsers ?? 11;

  const totalHardware = platform.totalHardwareCount ?? 1040;
  const totalSoftware = platform.totalSoftwareCount ?? 380;
  const totalAssets = platform.totalAssetsCount ?? (totalHardware + totalSoftware);
  const totalCis = platform.totalCisCount ?? 3150;

  const discoveryStatus = discovery.agentlessStatus || 'Operational';
  const openSecurityIssues = security.activeSecurityEvents ?? (platform.openSecurityIssuesCount ?? 3);
  const complianceIssues = platform.complianceViolationsCount ?? 1;

  return (
    <div className="space-y-6">
      {/* Section A: Platform Overview Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/30 text-red-400 flex items-center justify-center shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-red-400 uppercase tracking-wider">
                Section A
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-xs text-slate-400">Omnipotent SaaS Governance</span>
            </div>
            <h2 className="text-lg font-black text-white tracking-tight">
              Platform Overview & Federated ITAM/CMDB Telemetry
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800/80">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            System Status: {platform.systemStatus || 'Optimal'}
          </span>
        </div>
      </div>

      {/* 12 Key Platform Metrics Grid (User Explicit Scope) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3.5">
        {/* 1. Total Clients */}
        <div
          onClick={() => onNavigateTab('tenants')}
          className="bg-slate-900/90 border border-slate-800 hover:border-red-500/50 transition-all rounded-xl p-4 cursor-pointer group shadow relative overflow-hidden"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Clients</span>
            <Building2 className="w-4 h-4 text-red-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-white">{totalClients}</div>
          <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
            <span>Enterprise Tenants</span>
            <span className="text-red-400 font-semibold group-hover:translate-x-0.5 transition-transform">View →</span>
          </div>
        </div>

        {/* 2. Active Clients */}
        <div
          onClick={() => onNavigateTab('tenants')}
          className="bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 transition-all rounded-xl p-4 cursor-pointer group shadow"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Active Clients</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-emerald-400">{activeClients}</div>
          <div className="mt-1 text-[10px] text-slate-500 font-mono">
            {totalClients > 0 ? Math.round((activeClients / totalClients) * 100) : 100}% Operational
          </div>
        </div>

        {/* 3. Suspended Clients */}
        <div
          onClick={() => onNavigateTab('tenants')}
          className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 transition-all rounded-xl p-4 cursor-pointer group shadow"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Suspended Clients</span>
            <XCircle className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className={`text-2xl font-black ${suspendedClients > 0 ? 'text-amber-400' : 'text-slate-200'}`}>
            {suspendedClients}
          </div>
          <div className="mt-1 text-[10px] text-slate-500 font-mono">
            {suspendedClients === 0 ? 'Zero Suspended' : 'Review Tenancy'}
          </div>
        </div>

        {/* 4. Total Users */}
        <div
          onClick={() => onNavigateTab('users')}
          className="bg-slate-900/90 border border-slate-800 hover:border-blue-500/50 transition-all rounded-xl p-4 cursor-pointer group shadow"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Users</span>
            <Users className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-white">{totalUsers}</div>
          <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
            <span>Cross-Tenant</span>
            <span className="text-blue-400 font-semibold group-hover:translate-x-0.5 transition-transform">Directory →</span>
          </div>
        </div>

        {/* 5. Active Users */}
        <div
          onClick={() => onNavigateTab('users')}
          className="bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 transition-all rounded-xl p-4 cursor-pointer group shadow"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Active Users</span>
            <ShieldCheck className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-cyan-400">{activeUsers}</div>
          <div className="mt-1 text-[10px] text-slate-500 font-mono">
            {platform.activeMfaUsers || totalUsers} MFA Enrolled
          </div>
        </div>

        {/* 6. Total Assets */}
        <div
          onClick={() => onNavigateTab('tenants')}
          className="bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 transition-all rounded-xl p-4 cursor-pointer group shadow"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Assets</span>
            <Layers className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-white">{totalAssets.toLocaleString()}</div>
          <div className="mt-1 text-[10px] text-slate-500">Hardware & Software</div>
        </div>

        {/* 7. Total Software */}
        <div
          onClick={() => onNavigateTab('tenants')}
          className="bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 transition-all rounded-xl p-4 cursor-pointer group shadow"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Software</span>
            <Code className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-emerald-400">{totalSoftware.toLocaleString()}</div>
          <div className="mt-1 text-[10px] text-slate-500">Tracked Titles & SaaS</div>
        </div>

        {/* 8. Total Hardware */}
        <div
          onClick={() => onNavigateTab('tenants')}
          className="bg-slate-900/90 border border-slate-800 hover:border-blue-500/50 transition-all rounded-xl p-4 cursor-pointer group shadow"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Hardware</span>
            <HardDrive className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-blue-400">{totalHardware.toLocaleString()}</div>
          <div className="mt-1 text-[10px] text-slate-500">Endpoints & Servers</div>
        </div>

        {/* 9. Total CIs */}
        <div
          onClick={() => onNavigateTab('tenants')}
          className="bg-slate-900/90 border border-slate-800 hover:border-purple-500/50 transition-all rounded-xl p-4 cursor-pointer group shadow"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total CIs</span>
            <Database className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-purple-400">{totalCis.toLocaleString()}</div>
          <div className="mt-1 text-[10px] text-slate-500">CMDB Nodes & Topology</div>
        </div>

        {/* 10. Discovery Status */}
        <div
          onClick={() => onNavigateTab('system_health')}
          className="bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 transition-all rounded-xl p-4 cursor-pointer group shadow"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Discovery Status</span>
            <Radar className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-lg font-black text-emerald-400 flex items-center gap-1.5 truncate">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span className="truncate">{discoveryStatus}</span>
          </div>
          <div className="mt-1 text-[10px] text-slate-500">
            {discovery.successfulScansCount || 48} Scans (24h)
          </div>
        </div>

        {/* 11. Open Security Issues */}
        <div
          onClick={() => onNavigateTab('security')}
          className="bg-slate-900/90 border border-slate-800 hover:border-red-500/50 transition-all rounded-xl p-4 cursor-pointer group shadow"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Open Security</span>
            <ShieldAlert className="w-4 h-4 text-red-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className={`text-2xl font-black ${openSecurityIssues > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
            {openSecurityIssues}
          </div>
          <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
            <span>{security.criticalCves || 1} Critical CVE</span>
            <span className="text-red-400 font-semibold group-hover:translate-x-0.5 transition-transform">Audit →</span>
          </div>
        </div>

        {/* 12. Compliance Issues */}
        <div
          onClick={() => onNavigateTab('security')}
          className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 transition-all rounded-xl p-4 cursor-pointer group shadow"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Compliance</span>
            <AlertOctagon className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className={`text-2xl font-black ${complianceIssues > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {complianceIssues}
          </div>
          <div className="mt-1 text-[10px] text-slate-500">
            {complianceIssues > 0 ? 'Policy Gap / License Deficit' : '100% Compliant'}
          </div>
        </div>
      </div>

      {/* Deep-Dive Operational Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Federated Asset & Client Matrix */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:col-span-2 space-y-5 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-red-500" />
                <span>Client Organizations & Federated Footprint</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Overview of tenant status, licensed user capacity, and discovery reach across isolated environments.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('tenants')}
              className="py-1.5 px-3 bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/30 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <span>Manage Tenants</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {clients.map((client: any) => (
              <div
                key={client.id}
                onClick={() => onNavigateTab('tenants')}
                className="bg-slate-950 hover:bg-slate-800/60 transition-colors p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-red-600/10 border border-red-500/20 text-red-400 flex items-center justify-center font-bold text-xs shrink-0 group-hover:scale-105 transition-transform">
                    {client.code?.substring(0, 3) || 'ORG'}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-white flex items-center gap-2">
                      <span>{client.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 font-mono">
                        {client.code}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800/80 text-blue-400 font-semibold">
                        {client.region || 'US'}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">{client.contactEmail}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-5 text-xs">
                  <div className="text-left sm:text-right">
                    <span className="text-slate-200 font-bold block">
                      {client.usersCount} / {client.maxUsers || 500} Users
                    </span>
                    <span className="text-[10px] text-slate-500">{client.plan} Plan Tier</span>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                      client.status === 'Active'
                        ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                        : 'bg-amber-950/80 text-amber-300 border-amber-800'
                    }`}
                  >
                    {client.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Hardware vs Software vs CIs Proportions */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-300">Federated Inventory Distribution</span>
              <span className="text-slate-400 font-mono">
                {totalAssets.toLocaleString()} Total Items ({totalCis.toLocaleString()} CIs)
              </span>
            </div>
            <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
              <div
                style={{ width: `${Math.round((totalHardware / (totalAssets || 1)) * 100)}%` }}
                className="bg-blue-500 h-full"
                title={`Hardware: ${totalHardware}`}
              />
              <div
                style={{ width: `${Math.round((totalSoftware / (totalAssets || 1)) * 100)}%` }}
                className="bg-emerald-500 h-full"
                title={`Software: ${totalSoftware}`}
              />
            </div>
            <div className="flex items-center gap-5 text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Hardware ({totalHardware})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Software ({totalSoftware})
              </span>
              <span className="flex items-center gap-1.5 ml-auto text-purple-400 font-mono">
                CMDB CIs: {totalCis}
              </span>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Discovery & Security Health */}
        <div className="space-y-6">
          {/* Discovery Health Status */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Radar className="w-5 h-5 text-amber-400" />
                <span>Discovery Engine Status</span>
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                {discoveryStatus}
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400">Discovery Engine:</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Agentless + Sensor Mesh
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400">Active Sensors / Agents:</span>
                <span className="text-white font-bold">{discovery.endpointAgentsActive || 312} Online</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400">Successful Scans (24h):</span>
                <span className="text-white font-bold">{discovery.successfulScansCount || 48} Jobs (0 Failures)</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400">Cloud Connectors:</span>
                <span className="text-blue-400 font-bold">AWS • Azure • GCP Active</span>
              </div>

              <button
                onClick={() => onNavigateTab('integrations')}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <span>Inspect Connectors & Discovery Mesh</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Security & Compliance Issues Summary */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-500" />
                <span>Security & Compliance Center</span>
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-950 text-red-400 border border-red-800">
                {openSecurityIssues} Open / {complianceIssues} Compliance
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400">Critical CVEs:</span>
                <span className="text-red-400 font-bold">{security.criticalCves || 1} Open (CVE-2025-21298)</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400">Failed Logins (24h):</span>
                <span className="text-slate-200 font-bold">{security.failedLoginsLast24h || 3} Blocked</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400">Compliance Status:</span>
                <span className="text-amber-400 font-bold">{complianceIssues} Policy Deficit</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400">Super Admin MFA:</span>
                <span className="text-emerald-400 font-bold">Strictly Enforced (100%)</span>
              </div>

              <button
                onClick={() => onNavigateTab('security')}
                className="w-full py-2.5 bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/30 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <span>Launch Security & Audit Operations</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-red-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
