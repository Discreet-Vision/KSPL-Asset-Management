import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ExternalLink,
  Edit2,
  Shield,
  Users,
  Database,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Globe,
  Sliders,
  DollarSign,
  X,
  FileText,
  Activity,
  Check,
} from 'lucide-react';
import { OrganizationTenant } from '../../types';

interface SuperAdminTenantsTabProps {
  tenants: OrganizationTenant[];
  onRefresh: () => void;
}

export const SuperAdminTenantsTab: React.FC<SuperAdminTenantsTabProps> = ({
  tenants,
  onRefresh,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [regionFilter, setRegionFilter] = useState('ALL');
  const [selectedTenant, setSelectedTenant] = useState<OrganizationTenant | null>(null);
  const [tenantDetail, setTenantDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // New Tenant Form State
  const [formData, setFormData] = useState({
    name: '',
    legalName: '',
    code: '',
    region: 'US' as 'US' | 'EU' | 'APAC',
    contactEmail: '',
    contactPhone: '',
    address: '',
    country: 'United States',
    timeZone: 'America/New_York',
    industry: 'Financial Services',
    plan: 'Enterprise' as 'Enterprise' | 'Business' | 'Starter',
    primaryContact: '',
    maxUsers: 500,
    maxAssets: 2500,
    maxCis: 5000,
  });

  const handleOpenDetail = async (tenant: OrganizationTenant) => {
    setSelectedTenant(tenant);
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/super-admin/tenants/${tenant.id}`);
      if (res.ok) {
        const data = await res.json();
        setTenantDetail(data);
      }
    } catch (err) {
      console.error('Failed to load tenant detail:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch('/api/super-admin/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setNotification({ type: 'error', message: data.error || 'Failed to create client organization.' });
      } else {
        setNotification({ type: 'success', message: `Client Organization '${formData.name}' created successfully!` });
        setIsCreateModalOpen(false);
        setFormData({
          name: '',
          legalName: '',
          code: '',
          region: 'US',
          contactEmail: '',
          contactPhone: '',
          address: '',
          country: 'United States',
          timeZone: 'America/New_York',
          industry: 'Financial Services',
          plan: 'Enterprise',
          primaryContact: '',
          maxUsers: 500,
          maxAssets: 2500,
          maxCis: 5000,
        });
        onRefresh();
      }
    } catch (err) {
      setNotification({ type: 'error', message: 'Network error while creating organization.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (tenantId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';
    setActionLoading(true);
    try {
      const res = await fetch(`/api/super-admin/tenants/${tenantId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          reason: `Super Admin manually changed status to ${newStatus}.`,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setNotification({ type: 'error', message: data.error || 'Failed to update organization status.' });
      } else {
        setNotification({ type: 'success', message: `Organization status updated to ${newStatus}.` });
        if (selectedTenant && selectedTenant.id === tenantId) {
          setSelectedTenant({ ...selectedTenant, status: newStatus as any });
        }
        onRefresh();
      }
    } catch (err) {
      setNotification({ type: 'error', message: 'Network error while updating status.' });
    } finally {
      setActionLoading(false);
    }
  };

  const filteredTenants = (tenants || []).filter((t) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      (t.name || '').toLowerCase().includes(q) ||
      (t.code || '').toLowerCase().includes(q) ||
      (t.contactEmail && t.contactEmail.toLowerCase().includes(q)) ||
      (t.industry && t.industry.toLowerCase().includes(q));

    const matchesStatus = statusFilter === 'ALL' || (t.status || 'Active') === statusFilter;
    const matchesRegion = regionFilter === 'ALL' || t.region === regionFilter;

    return matchesSearch && matchesStatus && matchesRegion;
  });

  return (
    <div className="space-y-6">
      {notification && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center justify-between ${
            notification.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
              : 'bg-red-950/60 border-red-800 text-red-300'
          }`}
        >
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)}>
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      )}

      {/* Header with Search and Action Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div className="flex items-center gap-3 flex-1 max-w-lg">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by client name, code, email, industry..."
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-red-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Suspended">Suspended</option>
            <option value="Inactive">Inactive</option>
          </select>

          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-red-500"
          >
            <option value="ALL">All Regions</option>
            <option value="US">US Cloud</option>
            <option value="EU">EU Cloud</option>
            <option value="APAC">APAC Cloud</option>
          </select>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="py-2 px-4 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors shadow-lg shadow-red-900/30 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Provision New Client Organization</span>
        </button>
      </div>

      {/* Tenants Table Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-red-500" />
            <span>SaaS Client Organizations ({filteredTenants.length})</span>
          </h3>
          <span className="text-xs text-slate-500">Multi-Tenant Isolated Boundaries</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4">Organization Name</th>
                <th className="p-4">Tenant Code</th>
                <th className="p-4">Primary Contact</th>
                <th className="p-4">Cloud Region</th>
                <th className="p-4">Plan</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredTenants.map((t) => (
                <tr key={t.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="p-4">
                    <div className="font-semibold text-white text-sm">{t.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{t.id}</div>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded font-mono font-bold bg-slate-950 text-red-400 border border-slate-800">
                      {t.code}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="text-slate-200">{t.primaryContact || t.name + ' Admin'}</div>
                    <div className="text-[11px] text-slate-500">{t.contactEmail || 'N/A'}</div>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded bg-slate-950 text-blue-400 font-semibold text-[10px] border border-slate-800">
                      {t.region || 'US'} Cloud
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 font-semibold text-[10px] border border-purple-800">
                      {t.plan || 'Enterprise'}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        (t.status || 'Active') === 'Active'
                          ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                          : 'bg-red-950 text-red-400 border-red-800'
                      }`}
                    >
                      {t.status || 'Active'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenDetail(t)}
                        className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors"
                      >
                        Inspect
                      </button>
                      <button
                        onClick={() => handleToggleStatus(t.id, t.status || 'Active')}
                        disabled={actionLoading || t.id === 'tenant-platform-global'}
                        className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-colors ${
                          (t.status || 'Active') === 'Active'
                            ? 'bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 disabled:opacity-30'
                            : 'bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800'
                        }`}
                      >
                        {(t.status || 'Active') === 'Active' ? 'Suspend' : 'Reactivate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE NEW TENANT MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-red-500" />
                  <span>Provision SaaS Client Organization</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Establish a dedicated, cryptographically isolated tenant boundary for an enterprise client.
                </p>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400 hover:text-white" />
              </button>
            </div>

            <form onSubmit={handleCreateTenant} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Organization Display Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Apex Health Systems"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Tenant Code (Unique Prefix) *</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. APEX-HEALTH"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono uppercase focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Legal Registered Entity Name</label>
                  <input
                    type="text"
                    value={formData.legalName}
                    onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
                    placeholder="e.g. Apex Health Technologies Corp."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Primary Administrator Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    placeholder="admin@apexhealth.com"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    placeholder="+1 (555) 019-2831"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Cloud Hosting Region</label>
                  <select
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="US">US East (Virginia / Ohio)</option>
                    <option value="EU">EU Central (Frankfurt / Dublin)</option>
                    <option value="APAC">APAC (Singapore / Tokyo)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Subscription Plan</label>
                  <select
                    value={formData.plan}
                    onChange={(e) => setFormData({ ...formData, plan: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="Enterprise">Enterprise (Unlimited Discovery + Fed CMDB)</option>
                    <option value="Business">Business (Standard Discovery)</option>
                    <option value="Starter">Starter (Essential ITAM)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Industry Vertical</label>
                  <input
                    type="text"
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    placeholder="e.g. Healthcare & Life Sciences"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Max User Quota</label>
                  <input
                    type="number"
                    value={formData.maxUsers}
                    onChange={(e) => setFormData({ ...formData, maxUsers: parseInt(e.target.value) || 500 })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Max Asset Quota</label>
                  <input
                    type="number"
                    value={formData.maxAssets}
                    onChange={(e) => setFormData({ ...formData, maxAssets: parseInt(e.target.value) || 2500 })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-800 pt-4">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="py-2 px-5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-semibold flex items-center gap-2 shadow-lg shadow-red-900/30"
                >
                  {actionLoading ? 'Provisioning...' : 'Provision Tenant Workspace'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INSPECT & MANAGE TENANT DRAWER / MODAL */}
      {selectedTenant && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black text-white">{selectedTenant.name}</span>
                  <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-slate-950 text-red-400 border border-slate-800">
                    {selectedTenant.code}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      (selectedTenant.status || 'Active') === 'Active'
                        ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                        : 'bg-red-950 text-red-400 border-red-800'
                    }`}
                  >
                    {selectedTenant.status || 'Active'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{selectedTenant.legalName || selectedTenant.name}</p>
              </div>
              <button onClick={() => setSelectedTenant(null)}>
                <X className="w-5 h-5 text-slate-400 hover:text-white" />
              </button>
            </div>

            {detailLoading ? (
              <div className="p-8 text-center text-slate-400 text-xs">Loading tenant telemetry...</div>
            ) : (
              <div className="space-y-6 text-xs">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block mb-1">Users Enrolled</span>
                    <span className="text-2xl font-black text-white">{tenantDetail?.stats?.totalUsers || 4}</span>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      Max: {selectedTenant.maxUsers || 500}
                    </span>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block mb-1">Discovered Assets</span>
                    <span className="text-2xl font-black text-white">{tenantDetail?.stats?.totalAssetsCount || 640}</span>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      Max: {selectedTenant.maxAssets || 2500}
                    </span>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block mb-1">Configuration Items</span>
                    <span className="text-2xl font-black text-white">{tenantDetail?.stats?.totalCisCount || 1420}</span>
                    <span className="text-[10px] text-slate-500 block mt-1">Federated CMDB</span>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block mb-1">IT Contract Spend</span>
                    <span className="text-2xl font-black text-emerald-400">{tenantDetail?.stats?.annualSpend || '$1,450,000'}</span>
                    <span className="text-[10px] text-slate-500 block mt-1">14 Active Vendors</span>
                  </div>
                </div>

                {/* Tenant Metadata */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-slate-300">Tenant Metadata & Cloud Boundary</h4>
                  <div className="grid grid-cols-2 gap-2 text-slate-400">
                    <div>
                      <span className="text-slate-500 block">Primary Contact:</span>
                      <span className="text-slate-200 font-semibold">{selectedTenant.primaryContact || 'Admin'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Contact Email:</span>
                      <span className="text-slate-200 font-semibold">{selectedTenant.contactEmail}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Phone:</span>
                      <span className="text-slate-200 font-semibold">{selectedTenant.contactPhone || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Hosting Region:</span>
                      <span className="text-blue-400 font-semibold">{selectedTenant.region || 'US'} Cloud Isolation</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Industry:</span>
                      <span className="text-slate-200 font-semibold">{selectedTenant.industry || 'Technology'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Time Zone:</span>
                      <span className="text-slate-200 font-semibold">{selectedTenant.timeZone || 'America/New_York'}</span>
                    </div>
                  </div>
                </div>

                {/* Tenant Users List */}
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-300">Enrolled Users in this Tenant ({tenantDetail?.users?.length || 0})</h4>
                  <div className="bg-slate-950 rounded-xl border border-slate-800 divide-y divide-slate-850 max-h-48 overflow-y-auto">
                    {(tenantDetail?.users || []).map((u: any) => (
                      <div key={u.id} className="p-2.5 flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-white block">{u.name}</span>
                          <span className="text-[11px] text-slate-500">{u.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 text-[10px]">
                            {u.role}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] ${
                              u.mfaEnabled ? 'bg-emerald-950 text-emerald-400' : 'bg-slate-900 text-slate-500'
                            }`}
                          >
                            {u.mfaEnabled ? 'MFA Enabled' : 'No MFA'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between border-t border-slate-800 pt-4">
                  <span className="text-[11px] text-slate-500">
                    Tenant ID: <code className="text-slate-400">{selectedTenant.id}</code>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleStatus(selectedTenant.id, selectedTenant.status || 'Active')}
                      disabled={actionLoading || selectedTenant.id === 'tenant-platform-global'}
                      className={`py-2 px-4 rounded-xl font-semibold ${
                        (selectedTenant.status || 'Active') === 'Active'
                          ? 'bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 disabled:opacity-30'
                          : 'bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800'
                      }`}
                    >
                      {(selectedTenant.status || 'Active') === 'Active' ? 'Suspend Organization' : 'Reactivate Organization'}
                    </button>
                    <button
                      onClick={() => setSelectedTenant(null)}
                      className="py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-semibold"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
