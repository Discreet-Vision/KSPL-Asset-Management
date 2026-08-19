import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  ShieldCheck,
  DollarSign,
  Cpu,
  Boxes,
  Workflow,
  Search,
  ArrowRight,
  Filter,
} from 'lucide-react';

import { DashboardDomain, ChartDataPoint, DashboardFilter, GridFilterModel } from '../types/gridDashboardTypes';

export const RechartsDashboardView: React.FC<{
  tenantId?: string;
  onDrillDown?: (filter: GridFilterModel) => void;
}> = ({ tenantId = 'tenant-kspl-global', onDrillDown }) => {
  const [activeDomain, setActiveDomain] = useState<DashboardDomain>('itam');
  const [filters, setFilters] = useState<DashboardFilter>({
    tenantId,
    dateRange: '30d',
  });

  // Strict Red/Black/White Palette for Recharts
  const RED_PRIMARY = '#dc2626'; // Red-600
  const RED_DARK = '#991b1b'; // Red-800
  const WHITE = '#ffffff';
  const ZINC_LIGHT = '#e4e4e7';
  const ZINC_DARK = '#27272a';
  const PIE_COLORS = ['#dc2626', '#991b1b', '#ef4444', '#7f1d1d', '#52525b'];

  // Domain Chart Data Sets (Strict Red/Black/White Theme)
  const domainData: Record<DashboardDomain, { metrics: any[]; barData: any[]; lineData: any[]; pieData: any[] }> = {
    itam: {
      metrics: [
        { title: 'Total Infrastructure Assets', value: '100,000+', change: '+12%', isIncrease: true, filter: { field: 'status', operator: 'equals', value: 'Active' } },
        { title: 'Active Hardware Node Count', value: '74,210', change: '+8%', isIncrease: true, filter: { field: 'category', operator: 'equals', value: 'Hardware / Server' } },
        { title: 'Depreciated Value Total', value: '$84.5M', change: '-4%', isIncrease: false, filter: { field: 'criticality', operator: 'equals', value: 'CRITICAL' } },
        { title: 'Pending Maintenance', value: '1,420', change: '-15%', isIncrease: true, filter: { field: 'status', operator: 'equals', value: 'Maintenance' } },
      ],
      barData: [
        { label: 'Engineering', value: 34000 },
        { label: 'Finance', value: 18000 },
        { label: 'Infrastructure', value: 28000 },
        { label: 'Cybersecurity', value: 12000 },
        { label: 'Sales Ops', value: 8000 },
      ],
      lineData: [
        { label: 'Jan', value: 91000 },
        { label: 'Feb', value: 93500 },
        { label: 'Mar', value: 96000 },
        { label: 'Apr', value: 98200 },
        { label: 'May', value: 100000 },
      ],
      pieData: [
        { name: 'Active', value: 74210 },
        { name: 'Assigned', value: 18400 },
        { name: 'In Stock', value: 5000 },
        { name: 'Maintenance', value: 1420 },
        { name: 'Retired', value: 970 },
      ],
    },
    cmdb: {
      metrics: [
        { title: 'Total CIs Discovered', value: '248,900', change: '+18%', isIncrease: true },
        { title: 'Orphan CIs Flagged', value: '312', change: '-32%', isIncrease: true },
        { title: 'Dependency Map Links', value: '890,120', change: '+25%', isIncrease: true },
        { title: 'CI Reconciliation Rate', value: '99.4%', change: '+0.5%', isIncrease: true },
      ],
      barData: [
        { label: 'Servers', value: 45000 },
        { label: 'Databases', value: 22000 },
        { label: 'K8s Clusters', value: 18000 },
        { label: 'Switches', value: 12000 },
        { label: 'VMs', value: 65000 },
      ],
      lineData: [
        { label: 'Week 1', value: 230000 },
        { label: 'Week 2', value: 238000 },
        { label: 'Week 3', value: 242000 },
        { label: 'Week 4', value: 248900 },
      ],
      pieData: [
        { name: 'Compliant CIs', value: 240000 },
        { name: 'Unreconciled', value: 8500 },
        { name: 'Missing Relationships', value: 400 },
      ],
    },
    discovery: {
      metrics: [
        { title: 'Subnets Scanned', value: '1,240', change: '+100%', isIncrease: true },
        { title: 'Agentless Discovery Devices', value: '84,100', change: '+14%', isIncrease: true },
        { title: 'Agent-Based Endpoints', value: '62,400', change: '+9%', isIncrease: true },
        { title: 'Scan Failure Rate', value: '0.12%', change: '-0.05%', isIncrease: true },
      ],
      barData: [
        { label: 'Delhi DC', value: 38000 },
        { label: 'Mumbai Cloud', value: 42000 },
        { label: 'Bengaluru R&D', value: 29000 },
        { label: 'Singapore', value: 21000 },
      ],
      lineData: [
        { label: '00:00', value: 1200 },
        { label: '06:00', value: 4800 },
        { label: '12:00', value: 9200 },
        { label: '18:00', value: 6100 },
      ],
      pieData: [
        { name: 'Success', value: 98.8 },
        { name: 'Timeout', value: 0.9 },
        { name: 'Auth Fail', value: 0.3 },
      ],
    },
    sam: {
      metrics: [
        { title: 'Software Titles Tracked', value: '1,840', change: '+4%', isIncrease: true },
        { title: 'Under-Licensed Violations', value: '12', change: '-60%', isIncrease: true },
        { title: 'License Compliance Rate', value: '98.9%', change: '+3%', isIncrease: true },
        { title: 'Unused License True-Down', value: '$420,000', change: 'Savings', isIncrease: true },
      ],
      barData: [
        { label: 'Microsoft 365', value: 12500 },
        { label: 'Oracle DB Enterprise', value: 1400 },
        { label: 'Docker Enterprise', value: 3200 },
        { label: 'VMware vSphere', value: 890 },
      ],
      lineData: [
        { label: 'Q1', value: 88 },
        { label: 'Q2', value: 92 },
        { label: 'Q3', value: 96 },
        { label: 'Q4', value: 98.9 },
      ],
      pieData: [
        { name: 'Compliant', value: 1650 },
        { name: 'Over-Allocated', value: 178 },
        { name: 'Under-Licensed', value: 12 },
      ],
    },
    financial: {
      metrics: [
        { title: 'Total Capital Expenditure', value: '$124.8M', change: '+6%', isIncrease: true },
        { title: 'Annual Depreciation', value: '$18.4M', change: 'Linear', isIncrease: true },
        { title: 'Contract Renewal Forecast', value: '$4.2M', change: 'Next 90 Days', isIncrease: false },
        { title: 'TCO Per Workstation', value: '$1,240', change: '-8%', isIncrease: true },
      ],
      barData: [
        { label: 'Hardware', value: 68000000 },
        { label: 'Software', value: 42000000 },
        { label: 'Cloud Infra', value: 14800000 },
      ],
      lineData: [
        { label: '2022', value: 98000000 },
        { label: '2023', value: 110000000 },
        { label: '2024', value: 124800000 },
      ],
      pieData: [
        { name: 'Servers', value: 55 },
        { name: 'Cloud Instances', value: 30 },
        { name: 'Network', value: 15 },
      ],
    },
    compliance: {
      metrics: [
        { title: 'ISO 27001 Security Score', value: '98/100', change: 'Audit Passed', isIncrease: true },
        { title: 'SOC 2 Type II Controls', value: '100%', change: 'Compliant', isIncrease: true },
        { title: 'Unpatched OS Vulnerabilities', value: '0 Critical', change: 'Zero Risk', isIncrease: true },
        { title: 'Warranty Expired Hardware', value: '42 Units', change: '-80%', isIncrease: true },
      ],
      barData: [
        { label: 'Patched', value: 98 },
        { label: 'Pending Reboot', value: 1.8 },
        { label: 'Non-Compliant', value: 0.2 },
      ],
      lineData: [
        { label: 'M1', value: 92 },
        { label: 'M2', value: 95 },
        { label: 'M3', value: 98 },
      ],
      pieData: [
        { name: 'Pass', value: 98 },
        { name: 'Warning', value: 1.8 },
        { name: 'Fail', value: 0.2 },
      ],
    },
    workflow: {
      metrics: [
        { title: 'Active ITAM Workflows', value: '412', change: '+15%', isIncrease: true },
        { title: 'Pending Approval Tasks', value: '18', change: '2hr SLA', isIncrease: true },
        { title: 'SLA Breach Incidents', value: '0', change: 'Perfect Record', isIncrease: true },
        { title: 'Auto-Provisioned Requests', value: '88%', change: '+12%', isIncrease: true },
      ],
      barData: [
        { label: 'Asset Request', value: 180 },
        { label: 'Decommissioning', value: 94 },
        { label: 'Software Approval', value: 138 },
      ],
      lineData: [
        { label: 'Mon', value: 40 },
        { label: 'Tue', value: 85 },
        { label: 'Wed', value: 110 },
        { label: 'Thu', value: 95 },
        { label: 'Fri', value: 82 },
      ],
      pieData: [
        { name: 'Auto-Approved', value: 88 },
        { name: 'Manual Review', value: 12 },
      ],
    },
    analytics: {
      metrics: [
        { title: 'AI Predictive Savings', value: '$1.4M', change: 'Est. Annual', isIncrease: true },
        { title: 'Anomalous Asset Flagging', value: '3 Nodes', change: 'Audited', isIncrease: true },
        { title: 'Cluster Capacity Efficiency', value: '94.2%', change: 'Optimized', isIncrease: true },
        { title: 'Carbon Footprint Reduction', value: '340 Tons', change: '-18%', isIncrease: true },
      ],
      barData: [
        { label: 'CPU Utilization', value: 78 },
        { label: 'RAM Optimization', value: 84 },
        { label: 'Storage Savings', value: 92 },
      ],
      lineData: [
        { label: 'Jan', value: 70 },
        { label: 'Feb', value: 82 },
        { label: 'Mar', value: 94.2 },
      ],
      pieData: [
        { name: 'High Efficiency', value: 80 },
        { name: 'Normal', value: 18 },
        { name: 'Underutilized', value: 2 },
      ],
    },
  };

  const currentDomain = domainData[activeDomain];

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 font-mono text-xs text-white space-y-5">
      {/* Top Header & Domain Selector Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
        <div>
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-red-500" />
            <h2 className="font-bold text-white text-sm tracking-tight uppercase">
              ENTERPRISE ITAM DASHBOARDS & RECHARTS ANALYTICS
            </h2>
          </div>
          <p className="text-zinc-400 text-[11px] mt-0.5">
            Strict Red + Black + White Enterprise Visual Language • Drill-Down AG Grid Ready
          </p>
        </div>

        {/* Domain Selector Buttons */}
        <div className="flex flex-wrap gap-1 bg-black p-1 border border-zinc-800 rounded">
          {(['itam', 'cmdb', 'discovery', 'sam', 'financial', 'compliance', 'workflow', 'analytics'] as DashboardDomain[]).map(
            (domain) => (
              <button
                key={domain}
                onClick={() => setActiveDomain(domain)}
                className={`px-3 py-1 text-[10px] font-bold uppercase rounded cursor-pointer transition-colors ${
                  activeDomain === domain
                    ? 'bg-red-600 text-white border border-red-500'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                {domain}
              </button>
            )
          )}
        </div>
      </div>

      {/* Metric Cards Row (Drill-Down Capable) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {currentDomain.metrics.map((m, idx) => (
          <div
            key={idx}
            onClick={() => m.filter && onDrillDown && onDrillDown(m.filter)}
            className="bg-black border border-zinc-800 rounded-lg p-3 hover:border-red-500 transition-all cursor-pointer group"
          >
            <div className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">{m.title}</div>
            <div className="text-xl font-bold text-white mt-1 group-hover:text-red-400 transition-colors">
              {m.value}
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-900 text-[10px]">
              <span className="text-red-400 font-bold">{m.change}</span>
              {m.filter && (
                <span className="flex items-center text-zinc-500 group-hover:text-white">
                  <span>Drill Down</span>
                  <ArrowRight className="w-3 h-3 ml-1" />
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Recharts Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Bar Chart (Red / Black / White) */}
        <div className="bg-black border border-zinc-800 rounded-lg p-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center justify-between">
            <span>{activeDomain.toUpperCase()} Category Distribution</span>
            <span className="text-[10px] text-zinc-500">Recharts Bar Renderer</span>
          </h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={currentDomain.barData}>
                <CartesianGrid strokeDasharray="3 3" stroke={ZINC_DARK} />
                <XAxis dataKey="label" stroke={ZINC_LIGHT} fontSize={10} tickLine={false} />
                <YAxis stroke={ZINC_LIGHT} fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#000000', borderColor: '#dc2626', color: '#ffffff' }}
                />
                <Bar dataKey="value" fill={RED_PRIMARY} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Line Chart (Red / Black / White) */}
        <div className="bg-black border border-zinc-800 rounded-lg p-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center justify-between">
            <span>{activeDomain.toUpperCase()} Trend Analysis</span>
            <span className="text-[10px] text-zinc-500">Recharts Area/Line Renderer</span>
          </h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={currentDomain.lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke={ZINC_DARK} />
                <XAxis dataKey="label" stroke={ZINC_LIGHT} fontSize={10} tickLine={false} />
                <YAxis stroke={ZINC_LIGHT} fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#000000', borderColor: '#dc2626', color: '#ffffff' }}
                />
                <Area type="monotone" dataKey="value" stroke={RED_PRIMARY} fill={RED_DARK} fillOpacity={0.4} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
