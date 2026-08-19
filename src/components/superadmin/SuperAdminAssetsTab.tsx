import React, { useState } from 'react';
import {
  Layers,
  HardDrive,
  Code,
  Building2,
  Search,
  Filter,
  ArrowUpRight,
  ShieldCheck,
  AlertTriangle,
  Server,
  Laptop,
  Database,
  Smartphone,
  Cpu,
  RefreshCw,
  Download,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import { ConfigurationItem, OrganizationTenant } from '../../types';

interface SuperAdminAssetsTabProps {
  tenants?: OrganizationTenant[];
  onNavigateModule?: (module: string) => void;
}

export const SuperAdminAssetsTab: React.FC<SuperAdminAssetsTabProps> = ({
  tenants = [],
  onNavigateModule,
}) => {
  const [search, setSearch] = useState('');
  const [selectedTenant, setSelectedTenant] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'Hardware' | 'Software' | 'Virtual'>('ALL');

  // Aggregated cross-tenant enterprise asset telemetry
  const sampleFederatedAssets = [
    {
      id: 'AST-1001',
      name: 'prod-k8s-cluster-master-01',
      tenantCode: 'ACME',
      tenantName: 'Acme Global Corp',
      category: 'Virtual',
      type: 'Kubernetes Master Node',
      ipAddress: '10.240.0.12',
      os: 'Ubuntu Linux 24.04 LTS',
      status: 'Operational',
      lifecycle: 'In Production',
      assignedTo: 'Cloud Infrastructure Team',
      lastScan: '12 mins ago',
    },
    {
      id: 'AST-1002',
      name: 'MacBook Pro 16 M3 Max - C. Miller',
      tenantCode: 'ACME',
      tenantName: 'Acme Global Corp',
      category: 'Hardware',
      type: 'Endpoint Laptop',
      ipAddress: '192.168.4.110',
      os: 'macOS Sonoma 14.4',
      status: 'Assigned',
      lifecycle: 'Active',
      assignedTo: 'Charles Miller (Lead Arch)',
      lastScan: '45 mins ago',
    },
    {
      id: 'AST-1003',
      name: 'Microsoft 365 E5 Enterprise Suite',
      tenantCode: 'GLOBEX',
      tenantName: 'Globex Health',
      category: 'Software',
      type: 'SaaS License Subscription',
      ipAddress: 'SaaS Cloud',
      os: 'Cross-Platform',
      status: 'Active (450/500 Seats)',
      lifecycle: 'Active Subscription',
      assignedTo: 'Globex Corporate IT',
      lastScan: '2 hours ago',
    },
    {
      id: 'AST-1004',
      name: 'db-postgres-primary-iad-01',
      tenantCode: 'INNO',
      tenantName: 'InnoTech Solutions',
      category: 'Hardware',
      type: 'Bare-Metal Database Server',
      ipAddress: '10.100.1.5',
      os: 'Red Hat Enterprise Linux 9',
      status: 'Operational',
      lifecycle: 'In Production',
      assignedTo: 'DBA Platform Pod',
      lastScan: '5 mins ago',
    },
    {
      id: 'AST-1005',
      name: 'Oracle Database 19c Enterprise Edition',
      tenantCode: 'ACME',
      tenantName: 'Acme Global Corp',
      category: 'Software',
      type: 'Database Engine License',
      ipAddress: 'On-Premise Cluster',
      os: 'Oracle Enterprise Linux',
      status: 'Compliant (8 Cores)',
      lifecycle: 'Maintenance Active',
      assignedTo: 'ERP Team',
      lastScan: '1 hour ago',
    },
    {
      id: 'AST-1006',
      name: 'Cisco Catalyst 9300 Core Switch',
      tenantCode: 'GLOBEX',
      tenantName: 'Globex Health',
      category: 'Hardware',
      type: 'Network Switch',
      ipAddress: '10.0.0.1',
      os: 'Cisco IOS-XE 17.9',
      status: 'Operational',
      lifecycle: 'In Production',
      assignedTo: 'NetOps Operations',
      lastScan: '18 mins ago',
    },
  ];

  const filteredAssets = sampleFederatedAssets.filter((ast) => {
    const matchTenant = selectedTenant === 'ALL' || ast.tenantCode === selectedTenant;
    const matchCategory = selectedCategory === 'ALL' || ast.category === selectedCategory;
    const matchSearch =
      !search ||
      ast.name.toLowerCase().includes(search.toLowerCase()) ||
      ast.id.toLowerCase().includes(search.toLowerCase()) ||
      ast.type.toLowerCase().includes(search.toLowerCase()) ||
      ast.tenantName.toLowerCase().includes(search.toLowerCase());
    return matchTenant && matchCategory && matchSearch;
  });

  return (
    <div className="space-y-6 text-xs">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                Item 5 • Platform
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">Federated Cross-Tenant Asset Inventory</span>
            </div>
            <h2 className="text-lg font-black text-white tracking-tight mt-0.5">
              Global Asset Portfolio & Infrastructure Telemetry
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onNavigateModule && (
            <>
              <button
                onClick={() => onNavigateModule('hardware')}
                className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <HardDrive className="w-3.5 h-3.5 text-blue-400" />
                <span>Hardware Assets</span>
              </button>
              <button
                onClick={() => onNavigateModule('software')}
                className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Code className="w-3.5 h-3.5 text-emerald-400" />
                <span>Software Assets</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
            Total Federated Assets
          </span>
          <div className="text-2xl font-black text-white mt-1">1,420</div>
          <span className="text-[10px] text-slate-500">Across 3 Tenants</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[10px] text-blue-400 font-semibold uppercase tracking-wider">
            Hardware Endpoints & Nodes
          </span>
          <div className="text-2xl font-black text-blue-400 mt-1">1,040</div>
          <span className="text-[10px] text-slate-500">Servers, Laptops & Switches</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">
            Software & SaaS Subscriptions
          </span>
          <div className="text-2xl font-black text-emerald-400 mt-1">380</div>
          <span className="text-[10px] text-slate-500">Enterprise Titles & Cloud Services</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[10px] text-purple-400 font-semibold uppercase tracking-wider">
            CMDB CIs & Virtual Topologies
          </span>
          <div className="text-2xl font-black text-purple-400 mt-1">3,150</div>
          <span className="text-[10px] text-slate-500">Discovered Configuration Items</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search across all tenants & assets..."
              className="w-64 pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
            {(['ALL', 'Hardware', 'Software', 'Virtual'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400">Tenant Filter:</span>
          <select
            value={selectedTenant}
            onChange={(e) => setSelectedTenant(e.target.value)}
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:outline-none focus:border-indigo-500 font-mono"
          >
            <option value="ALL">All Tenants (Global)</option>
            <option value="ACME">Acme Global (ACME)</option>
            <option value="GLOBEX">Globex Health (GLOBEX)</option>
            <option value="INNO">InnoTech Solutions (INNO)</option>
          </select>
        </div>
      </div>

      {/* Asset Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Asset ID & Name</th>
                <th className="py-3 px-4">Organization / Tenant</th>
                <th className="py-3 px-4">Classification</th>
                <th className="py-3 px-4">Network / IP Address</th>
                <th className="py-3 px-4">Assigned Custodian</th>
                <th className="py-3 px-4">Health / Status</th>
                <th className="py-3 px-4 text-right">Telemetry Scan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-xs">
              {filteredAssets.map((asset) => (
                <tr key={asset.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0 font-mono text-[10px]">
                        {asset.category === 'Hardware' ? (
                          <HardDrive className="w-4 h-4 text-blue-400" />
                        ) : asset.category === 'Software' ? (
                          <Code className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Server className="w-4 h-4 text-purple-400" />
                        )}
                      </div>
                      <div>
                        <span className="font-bold text-white block">{asset.name}</span>
                        <span className="text-[10px] font-mono text-slate-500">{asset.id}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="text-slate-300 font-medium">{asset.tenantName}</span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 font-mono">
                        {asset.tenantCode}
                      </span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="text-slate-300 block">{asset.type}</span>
                    <span className="text-[10px] text-slate-500">{asset.os}</span>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-slate-300 text-[11px]">
                    {asset.ipAddress}
                  </td>

                  <td className="py-3.5 px-4 text-slate-300">
                    {asset.assignedTo}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                      <CheckCircle2 className="w-3 h-3" />
                      {asset.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right font-mono text-[10px] text-slate-500">
                    {asset.lastScan}
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
