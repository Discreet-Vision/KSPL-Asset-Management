import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Shield,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  Lock,
  Unlock,
  Building2,
  Mail,
  Edit2,
  CheckCircle2,
  XCircle,
  X,
  AlertTriangle,
  RefreshCw,
  Sliders,
} from 'lucide-react';
import { User, OrganizationTenant, UserRole } from '../../types';

interface SuperAdminUsersTabProps {
  users: any[];
  tenants: OrganizationTenant[];
  onRefresh: () => void;
}

export const SuperAdminUsersTab: React.FC<SuperAdminUsersTabProps> = ({
  users,
  tenants,
  onRefresh,
}) => {
  const [search, setSearch] = useState('');
  const [tenantFilter, setTenantFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [mfaFilter, setMfaFilter] = useState('ALL');
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // New User Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: 'Password123!',
    role: 'ITAM Admin' as UserRole,
    tenantId: 'tenant-client-1',
    jobTitle: 'IT Specialist',
    phone: '',
    country: 'United States',
    requireMfaSetup: false,
  });

  // Edit User State
  const [editFormData, setEditFormData] = useState({
    role: 'ITAM Admin' as UserRole,
    status: 'Active' as 'Active' | 'Locked' | 'Suspended',
  });

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch('/api/super-admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          tenantId: formData.tenantId,
          jobTitle: formData.jobTitle,
          phone: formData.phone,
          country: formData.country,
          requireMfaSetup: formData.requireMfaSetup,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setNotification({ type: 'error', message: data.error || 'Failed to provision user.' });
      } else {
        setNotification({ type: 'success', message: `User account '${formData.email}' created successfully!` });
        setIsCreateModalOpen(false);
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          password: 'Password123!',
          role: 'ITAM Admin',
          tenantId: 'tenant-client-1',
          jobTitle: 'IT Specialist',
          phone: '',
          country: 'United States',
          requireMfaSetup: false,
        });
        onRefresh();
      }
    } catch (err) {
      setNotification({ type: 'error', message: 'Network error while provisioning user.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/super-admin/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setNotification({ type: 'error', message: data.error || 'Failed to update user account.' });
      } else {
        setNotification({ type: 'success', message: `User account '${selectedUser.email}' updated successfully!` });
        setIsEditModalOpen(false);
        setSelectedUser(null);
        onRefresh();
      }
    } catch (err) {
      setNotification({ type: 'error', message: 'Network error while updating user.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleLockStatus = async (user: any) => {
    const newStatus = user.status === 'Locked' ? 'Active' : 'Locked';
    setActionLoading(true);
    try {
      const res = await fetch(`/api/super-admin/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setNotification({ type: 'error', message: data.error || 'Failed to change lock status.' });
      } else {
        setNotification({
          type: 'success',
          message: `User account '${user.email}' is now ${newStatus.toUpperCase()}.`,
        });
        onRefresh();
      }
    } catch (err) {
      setNotification({ type: 'error', message: 'Network error while updating lock status.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetMfa = async (user: any) => {
    if (!confirm(`Are you sure you want to force reset MFA for ${user.name} (${user.email})?`)) return;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/super-admin/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mfaEnabled: false, mfaSetupRequired: true }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setNotification({ type: 'error', message: data.error || 'Failed to reset MFA.' });
      } else {
        setNotification({
          type: 'success',
          message: `MFA credentials revoked for ${user.email}. User will be required to re-enroll upon next login.`,
        });
        onRefresh();
      }
    } catch (err) {
      setNotification({ type: 'error', message: 'Network error while resetting MFA.' });
    } finally {
      setActionLoading(false);
    }
  };

  const filteredUsers = (users || []).filter((u) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      (u.name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.tenantName && (u.tenantName || '').toLowerCase().includes(q)) ||
      (u.role || '').toLowerCase().includes(q);

    const matchesTenant = tenantFilter === 'ALL' || u.tenantId === tenantFilter;
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesMfa =
      mfaFilter === 'ALL' ||
      (mfaFilter === 'ENABLED' && u.mfaEnabled) ||
      (mfaFilter === 'DISABLED' && !u.mfaEnabled);

    return matchesSearch && matchesTenant && matchesRole && matchesMfa;
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
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative min-w-[240px] flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by user name, email, role, or tenant..."
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
            />
          </div>

          <select
            value={tenantFilter}
            onChange={(e) => setTenantFilter(e.target.value)}
            className="py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-red-500"
          >
            <option value="ALL">All Organizations</option>
            {tenants.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.code})
              </option>
            ))}
          </select>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-red-500"
          >
            <option value="ALL">All Roles</option>
            <option value="SOFTWARE_SUPER_ADMIN">Software Super Admin</option>
            <option value="CLIENT_ADMIN">Client Admin</option>
            <option value="ITAM Admin">ITAM Admin</option>
            <option value="CMDB Admin">CMDB Admin</option>
            <option value="Finance">Finance</option>
            <option value="Security">Security</option>
            <option value="Employee">Employee</option>
          </select>

          <select
            value={mfaFilter}
            onChange={(e) => setMfaFilter(e.target.value)}
            className="py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-red-500"
          >
            <option value="ALL">All MFA Statuses</option>
            <option value="ENABLED">MFA Enrolled</option>
            <option value="DISABLED">No MFA</option>
          </select>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="py-2 px-4 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors shadow-lg shadow-red-900/30 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Provision Global User</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-500" />
            <span>Cross-Tenant User Accounts ({filteredUsers.length})</span>
          </h3>
          <span className="text-xs text-slate-500">Cross-Tenant Directory</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4">User Name & Email</th>
                <th className="p-4">Tenant Organization</th>
                <th className="p-4">Role</th>
                <th className="p-4">MFA Status</th>
                <th className="p-4">Account Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="p-4">
                    <div className="font-semibold text-white text-sm">{u.name}</div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Mail className="w-3 h-3" /> {u.email}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-slate-200 font-medium">{u.tenantName || 'Platform Global'}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{u.tenantId}</div>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        u.role === 'SOFTWARE_SUPER_ADMIN'
                          ? 'bg-red-950 text-red-400 border border-red-800'
                          : u.role === 'CLIENT_ADMIN'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800'
                          : 'bg-slate-950 text-slate-300 border border-slate-800'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 w-fit ${
                        u.mfaEnabled
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-slate-950 text-slate-500 border border-slate-800'
                      }`}
                    >
                      {u.mfaEnabled ? <ShieldCheck className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                      {u.mfaEnabled ? 'Enrolled' : 'Not Set Up'}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        (u.status || 'Active') === 'Active'
                          ? 'bg-emerald-950 text-emerald-400'
                          : 'bg-red-950 text-red-400'
                      }`}
                    >
                      {u.status || 'Active'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setSelectedUser(u);
                          setEditFormData({
                            role: u.role,
                            status: u.status || 'Active',
                          });
                          setIsEditModalOpen(true);
                        }}
                        className="py-1.5 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors"
                      >
                        Edit
                      </button>

                      {u.mfaEnabled && (
                        <button
                          onClick={() => handleResetMfa(u)}
                          title="Force Reset MFA"
                          className="py-1.5 px-2.5 bg-amber-950/60 hover:bg-amber-900 text-amber-300 border border-amber-800 rounded-lg text-xs font-semibold transition-colors"
                        >
                          Reset MFA
                        </button>
                      )}

                      <button
                        onClick={() => handleToggleLockStatus(u)}
                        disabled={u.role === 'SOFTWARE_SUPER_ADMIN'}
                        className={`py-1.5 px-2.5 rounded-lg text-xs font-semibold transition-colors ${
                          u.status === 'Locked'
                            ? 'bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800'
                            : 'bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 disabled:opacity-30'
                        }`}
                      >
                        {u.status === 'Locked' ? 'Unlock' : 'Lock'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PROVISION USER MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-red-500" />
                  <span>Provision Global User Account</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Create a new authenticated account and assign to a tenant workspace.
                </p>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400 hover:text-white" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="Marcus"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="Vance"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-slate-300 font-semibold mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="marcus.vance@enterprise.com"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-slate-300 font-semibold mb-1">Initial Password *</label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Client Organization *</label>
                  <select
                    value={formData.tenantId}
                    onChange={(e) => setFormData({ ...formData, tenantId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500"
                  >
                    {tenants.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Platform Role *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="SOFTWARE_SUPER_ADMIN">SOFTWARE_SUPER_ADMIN (Platform Master)</option>
                    <option value="CLIENT_ADMIN">CLIENT_ADMIN (Org Administrator)</option>
                    <option value="ITAM Admin">ITAM Admin</option>
                    <option value="CMDB Admin">CMDB Admin</option>
                    <option value="Finance">Finance</option>
                    <option value="Security">Security</option>
                    <option value="Employee">Employee (Self-Service)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Job Title</label>
                  <input
                    type="text"
                    value={formData.jobTitle}
                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                    placeholder="e.g. Lead CMDB Engineer"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 019-2831"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-slate-950 rounded-xl border border-slate-800">
                <input
                  type="checkbox"
                  id="requireMfaSetup"
                  checked={formData.requireMfaSetup}
                  onChange={(e) => setFormData({ ...formData, requireMfaSetup: e.target.checked })}
                  className="rounded border-slate-700 text-red-600 focus:ring-red-500"
                />
                <label htmlFor="requireMfaSetup" className="text-slate-300 font-medium cursor-pointer">
                  Require user to configure MFA (Authenticator App) on first login
                </label>
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
                  {actionLoading ? 'Provisioning...' : 'Provision User Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {isEditModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Edit User Account</h3>
                <p className="text-xs text-slate-400 mt-1">{selectedUser.name} ({selectedUser.email})</p>
              </div>
              <button onClick={() => setIsEditModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400 hover:text-white" />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Assigned Role</label>
                <select
                  value={editFormData.role}
                  onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500"
                >
                  <option value="SOFTWARE_SUPER_ADMIN">SOFTWARE_SUPER_ADMIN</option>
                  <option value="CLIENT_ADMIN">CLIENT_ADMIN</option>
                  <option value="ITAM Admin">ITAM Admin</option>
                  <option value="CMDB Admin">CMDB Admin</option>
                  <option value="Finance">Finance</option>
                  <option value="Security">Security</option>
                  <option value="Employee">Employee</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Account Status</label>
                <select
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500"
                >
                  <option value="Active">Active</option>
                  <option value="Locked">Locked (Failed Logins / Admin Lock)</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-800 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="py-2 px-5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-semibold shadow-lg shadow-red-900/30"
                >
                  {actionLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
