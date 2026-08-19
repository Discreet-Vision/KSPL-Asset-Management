import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import {
  Database,
  KeyRound,
  DollarSign,
  ShieldAlert,
  Activity,
  Package,
  Building,
  Calendar,
  AlertTriangle,
  Users,
  ShieldCheck,
  Cpu,
  Layers,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';

export const ExecutiveAdminDashboard: React.FC = () => {
  const {
    configurationItems,
    softwareLicenses,
    contracts,
    policyViolations,
    vulnerabilities,
    departments,
    locations,
    costCenters,
    allUsers,
    currentTenant,
    setActiveModule,
    setShowUserManagementModal,
  } = useApp();

  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');

  const safeCis = configurationItems || [];
  const safeLicenses = softwareLicenses || [];
  const safeContracts = contracts || [];
  const safeViolations = policyViolations || [];
  const safeVulns = vulnerabilities || [];
  const safeCostCenters = costCenters || [];
  const safeUsers = allUsers || [];
  const safeDepartments = departments || [];
  const safeLocations = locations || [];

  const filteredCis = safeCis.filter((ci) => {
    if (selectedDepartment !== 'all' && ci.departmentId !== selectedDepartment) return false;
    if (selectedLocation !== 'all' && ci.locationId !== selectedLocation) return false;
    return true;
  });

  const totalCis = filteredCis.length;
  const hardwareCis = filteredCis.filter((c) => c.category === 'Hardware').length;
  const cloudCis = filteredCis.filter((c) => c.category === 'Cloud').length;
  const softwareCis = filteredCis.filter((c) => c.category === 'Software').length;
  const unassignedAssets = filteredCis.filter((c) => c.lifecycleState === 'In Stock').length;
  const inRepairAssets = filteredCis.filter((c) => c.lifecycleState === 'In Repair').length;

  const underLicensedCount = safeLicenses.filter(
    (l) => l.complianceStatus === 'Under-Licensed' || l.complianceStatus === 'Risk Alert'
  ).length;
  const totalFinancialLiability = safeLicenses.reduce((acc, l) => acc + (l.financialLiability || 0), 0);

  const totalContractValue = safeContracts.reduce((acc, c) => acc + (c.totalValue || 0), 0);
  const openViolations = safeViolations.filter((v) => v.status === 'Open').length;
  const criticalVulns = safeVulns.filter((v) => v.severity === 'Critical').length;

  const avgHealthScore = Math.round(
    filteredCis.reduce((acc, c) => acc + (c.healthScore || 0), 0) / (totalCis || 1)
  );

  const totalBudget = safeCostCenters.reduce((acc, c) => acc + (c.budgetAllocated || 0), 0);
  const totalSpend = safeCostCenters.reduce((acc, c) => acc + (c.currentSpend || 0), 0);
  const budgetUtilization = totalBudget > 0 ? ((totalSpend / totalBudget) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      {/* Executive Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-950 p-4 border border-zinc-800 rounded-xl shadow-lg">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 bg-red-950 text-red-400 border border-red-800 rounded-md text-[10px] font-mono font-bold tracking-wider uppercase">
              Executive Admin Command Center
            </span>
            <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-mono px-2 py-0.5 rounded font-bold">
              {currentTenant?.name || 'Enterprise'}
            </span>
          </div>
          <h1 className="text-xl font-black text-white tracking-tight mt-1">
            EXECUTIVE ITAM & CMDB STRATEGIC OVERVIEW
          </h1>
          <p className="text-xs text-zinc-400 font-mono">
            Unified Configuration Items, Enterprise License Position, Budget Burn & Risk Governance
          </p>
        </div>

        {/* Global Filter Controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <div className="flex items-center space-x-1.5 bg-black border border-zinc-800 rounded-lg px-2.5 py-1.5">
            <Building className="w-3.5 h-3.5 text-red-500" />
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="bg-transparent text-white focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-zinc-900">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id} className="bg-zinc-900">
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-1.5 bg-black border border-zinc-800 rounded-lg px-2.5 py-1.5">
            <Calendar className="w-3.5 h-3.5 text-red-500" />
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="bg-transparent text-white focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-zinc-900">All Locations</option>
              {locations.map((l) => (
                <option key={l.id} value={l.id} className="bg-zinc-900">
                  {l.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowUserManagementModal(true)}
            className="flex items-center space-x-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-amber-300 hover:text-white px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-colors"
          >
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span>Staff & RBAC</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total CIs */}
        <div
          onClick={() => setActiveModule('cmdb')}
          className="bg-zinc-950 border border-zinc-800 hover:border-red-500/50 p-4 rounded-xl transition-all cursor-pointer group shadow-sm hover:shadow-red-950/20"
        >
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">CMDB Inventory</span>
            <Database className="w-5 h-5 text-red-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-white mt-2">{totalCis} CIs</div>
          <div className="text-[11px] text-zinc-400 font-mono mt-1 flex items-center space-x-2">
            <span>HW: {hardwareCis}</span>
            <span>•</span>
            <span>Cloud: {cloudCis}</span>
            <span>•</span>
            <span>SW: {softwareCis}</span>
          </div>
        </div>

        {/* License Position Deficit */}
        <div
          onClick={() => setActiveModule('licenses')}
          className="bg-zinc-950 border border-zinc-800 hover:border-red-500/50 p-4 rounded-xl transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">Under-Licensed Titles</span>
            <KeyRound className="w-5 h-5 text-red-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-white mt-2 flex items-center space-x-2">
            <span>{underLicensedCount}</span>
            {underLicensedCount > 0 && (
              <span className="bg-red-600 text-white text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                AUDIT RISK
              </span>
            )}
          </div>
          <div className="text-[11px] text-red-400 font-mono mt-1 font-bold">
            Liability: ${totalFinancialLiability.toLocaleString()}
          </div>
        </div>

        {/* Contract Portfolio Value */}
        <div
          onClick={() => setActiveModule('contracts')}
          className="bg-zinc-950 border border-zinc-800 hover:border-red-500/50 p-4 rounded-xl transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">Active Agreements</span>
            <DollarSign className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-white mt-2">${(totalContractValue / 1000000).toFixed(2)}M</div>
          <div className="text-[11px] text-zinc-400 font-mono mt-1">
            {safeContracts.length} Enterprise Contracts Active
          </div>
        </div>

        {/* Policy Violations & Risks */}
        <div
          onClick={() => setActiveModule('policies')}
          className="bg-zinc-950 border border-zinc-800 hover:border-red-500/50 p-4 rounded-xl transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">Governance Violations</span>
            <ShieldAlert className="w-5 h-5 text-red-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-white mt-2">{openViolations}</div>
          <div className="text-[11px] text-zinc-400 font-mono mt-1 flex items-center space-x-2">
            <span>Critical CVEs: <strong className="text-red-400">{criticalVulns}</strong></span>
          </div>
        </div>
      </div>

      {/* Secondary Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* CMDB Quality & Health */}
        <div className="bg-zinc-950 p-4 border border-zinc-800 rounded-xl">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-3">
            <div className="font-bold text-sm text-white flex items-center space-x-2">
              <Activity className="w-4 h-4 text-red-500" />
              <span>CMDB Data Integrity</span>
            </div>
            <span className="text-lg font-black font-mono text-white">{avgHealthScore}%</span>
          </div>
          <div className="w-full bg-black h-2.5 rounded-full overflow-hidden border border-zinc-800">
            <div
              className="bg-red-600 h-full transition-all duration-500"
              style={{ width: `${avgHealthScore}%` }}
            ></div>
          </div>
          <p className="text-[11px] text-zinc-400 font-mono mt-2">
            Completeness, discovery freshness, and owner verification health.
          </p>
        </div>

        {/* Stockroom & Spares Buffer */}
        <div className="bg-zinc-950 p-4 border border-zinc-800 rounded-xl">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-3">
            <div className="font-bold text-sm text-white flex items-center space-x-2">
              <Package className="w-4 h-4 text-white" />
              <span>Stockroom Reserves</span>
            </div>
            <span className="text-lg font-black font-mono text-white">{unassignedAssets} Spares</span>
          </div>
          <div className="text-xs text-zinc-300 font-mono space-y-1">
            <div className="flex justify-between">
              <span className="text-zinc-400">Assets In Repair (RMA):</span>
              <span className="font-bold text-white">{inRepairAssets}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Staff Count Provisioned:</span>
              <span className="font-bold text-emerald-400">{safeUsers.length} Users</span>
            </div>
          </div>
        </div>

        {/* Budget Allocation & Spend */}
        <div className="bg-zinc-950 p-4 border border-zinc-800 rounded-xl">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-3">
            <div className="font-bold text-sm text-white flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>Fiscal Budget Allocated</span>
            </div>
            <span className="text-lg font-black font-mono text-white">
              ${(totalBudget / 1000000).toFixed(1)}M
            </span>
          </div>
          <div className="text-xs text-zinc-300 font-mono space-y-1">
            <div className="flex justify-between">
              <span className="text-zinc-400">Current IT Spend:</span>
              <span className="font-bold text-white">${(totalSpend / 1000000).toFixed(1)}M</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Budget Utilization:</span>
              <span className="font-bold text-amber-400">{budgetUtilization}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Critical Compliance & Risk Table */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-4 border-b border-zinc-800 pb-3">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <h3 className="font-bold text-sm text-white uppercase tracking-wider">
              Immediate Compliance & Risk Governance Actions
            </h3>
          </div>
          <button
            onClick={() => setActiveModule('policies')}
            className="text-xs text-red-400 hover:text-white font-mono underline cursor-pointer"
          >
            Manage Policy Engine →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="bg-black text-zinc-400 border-b border-zinc-800 uppercase text-[10px] tracking-wider">
                <th className="p-3">Policy Rule</th>
                <th className="p-3">Affected Entity</th>
                <th className="p-3">Severity</th>
                <th className="p-3">Details</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 text-zinc-300">
              {policyViolations.slice(0, 5).map((v) => (
                <tr key={v.id} className="hover:bg-zinc-900 transition-colors">
                  <td className="p-3 font-bold text-white">{v.policyName}</td>
                  <td className="p-3 text-red-400">{v.ciName}</td>
                  <td className="p-3">
                    <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                      {v.severity}
                    </span>
                  </td>
                  <td className="p-3 text-zinc-400">{v.details}</td>
                  <td className="p-3">
                    <span className="bg-black border border-red-500 text-red-400 text-[10px] px-2 py-0.5 rounded">
                      {v.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => setActiveModule('policies')}
                      className="bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold px-2.5 py-1 rounded border border-red-500 cursor-pointer"
                    >
                      Remediate
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
