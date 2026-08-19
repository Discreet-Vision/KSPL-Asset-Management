import React, { useState, useEffect } from 'react';
import {
  Shield,
  Plus,
  CheckCircle2,
  XCircle,
  Eye,
  Sliders,
  RotateCcw,
  Save,
  Check,
  X,
  AlertTriangle,
  Lock,
} from 'lucide-react';
import {
  RbacCapabilityItem,
  RbacMatrixPermissions,
  CapabilityAccessLevel,
  UserRole,
  OrganizationTenant,
  PlatformRoleDefinition,
} from '../../types';

interface SuperAdminRbacTabProps {
  tenants: OrganizationTenant[];
}

const ROLES_COLUMNS: UserRole[] = [
  'SOFTWARE_SUPER_ADMIN',
  'CLIENT_ADMIN',
  'ITAM Admin',
  'CMDB Admin',
  'Security',
  'Finance',
  'Employee',
];

export const SuperAdminRbacTab: React.FC<SuperAdminRbacTabProps> = ({ tenants }) => {
  const [selectedTenantId, setSelectedTenantId] = useState<string>('tenant-client-1');
  const [capabilities, setCapabilities] = useState<RbacCapabilityItem[]>([]);
  const [matrix, setMatrix] = useState<RbacMatrixPermissions>({});
  const [rolesList, setRolesList] = useState<PlatformRoleDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');

  useEffect(() => {
    fetchMatrix();
    fetchRoles();
  }, [selectedTenantId]);

  const fetchMatrix = async () => {
    setLoading(true);
    try {
      const matrixRes = await fetch(`/api/rbac/matrix?tenantId=${selectedTenantId}`);
      if (matrixRes.ok) {
        const text = await matrixRes.text();
        try {
          const data = JSON.parse(text);
          if (data.data) {
            setCapabilities(data.data.capabilities || []);
            setMatrix(data.data.matrix || {});
          }
        } catch (e) {
          console.warn('Non-JSON response received from RBAC matrix:', text.slice(0, 100));
        }
      }
    } catch (err) {
      console.error('Failed to load RBAC matrix:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await fetch('/api/super-admin/roles');
      if (res.ok) {
        const data = await res.json();
        setRolesList(data.roles || []);
      }
    } catch (err) {
      console.error('Failed to load roles list:', err);
    }
  };

  const handlePermissionChange = (capId: string, role: UserRole, level: CapabilityAccessLevel) => {
    setMatrix((prev) => ({
      ...prev,
      [capId]: {
        ...(prev[capId] || {}),
        [role]: level,
      },
    }));
  };

  const handleSaveMatrix = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/rbac/matrix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: selectedTenantId,
          matrix,
          capabilities,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (!data.success) {
          setNotification({ type: 'error', message: data.error || 'Failed to save RBAC matrix.' });
        } else {
          setNotification({ type: 'success', message: 'RBAC Permission Matrix persisted successfully!' });
        }
      } else {
        setNotification({ type: 'error', message: `Server error (${res.status}) while saving RBAC matrix.` });
      }
    } catch (err) {
      setNotification({ type: 'error', message: 'Network error while saving matrix.' });
    } finally {
      setSaving(false);
    }
  };

  const handleResetMatrix = async () => {
    if (!confirm('Are you sure you want to reset this RBAC Matrix to factory enterprise defaults?')) return;
    setSaving(true);
    try {
      const res = await fetch('/api/rbac/matrix/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId: selectedTenantId }),
      });

      if (res.ok) {
        const data = await res.json();
        if (!data.success) {
          setNotification({ type: 'error', message: data.error || 'Failed to reset RBAC matrix.' });
        } else {
          setNotification({ type: 'success', message: 'RBAC Matrix restored to factory defaults.' });
          fetchMatrix();
        }
      } else {
        setNotification({ type: 'error', message: `Server error (${res.status}) while resetting matrix.` });
      }
    } catch (err) {
      setNotification({ type: 'error', message: 'Network error while resetting matrix.' });
    } finally {
      setSaving(false);
    }
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;

    try {
      const res = await fetch('/api/super-admin/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newRoleName, description: newRoleDesc }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setNotification({ type: 'error', message: data.error || 'Failed to create role.' });
      } else {
        setNotification({ type: 'success', message: `Custom role '${newRoleName}' created successfully!` });
        setIsRoleModalOpen(false);
        setNewRoleName('');
        setNewRoleDesc('');
        fetchRoles();
      }
    } catch (err) {
      setNotification({ type: 'error', message: 'Network error while creating role.' });
    }
  };

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

      {/* Role Catalog Cards */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-red-500" />
              <span>Platform Role Catalog</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Pre-seeded system roles and custom enterprise tenant roles.
            </p>
          </div>
          <button
            onClick={() => setIsRoleModalOpen(true)}
            className="py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Custom Role</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {rolesList.map((r) => (
            <div key={r.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs">{r.name}</span>
                <span
                  className={`text-[9px] px-2 py-0.5 rounded font-bold ${
                    r.type === 'System' ? 'bg-red-950 text-red-400' : 'bg-blue-950 text-blue-400'
                  }`}
                >
                  {r.type}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2">{r.description}</p>
              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-850">
                <span>{r.assignedUsersCount} Users Assigned</span>
                <span>{r.permissionsCount} Permissions</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dynamic RBAC Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-red-500" />
              <span>Dynamic Capability RBAC Matrix</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Enforce granular access levels (Authorized, Read-Only, Denied) for each platform module.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedTenantId}
              onChange={(e) => setSelectedTenantId(e.target.value)}
              className="py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-red-500"
            >
              {(tenants || []).map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.code})
                </option>
              ))}
            </select>

            <button
              onClick={handleResetMatrix}
              disabled={saving}
              className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            <button
              onClick={handleSaveMatrix}
              disabled={saving}
              className="py-2 px-4 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-red-900/30"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Matrix'}</span>
            </button>
          </div>
        </div>

        {/* Matrix Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3 min-w-[200px]">Capability / Module</th>
                {ROLES_COLUMNS.map((role) => (
                  <th key={role} className="p-3 text-center whitespace-nowrap">
                    {role}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {capabilities.map((cap) => (
                <tr key={cap.id} className="hover:bg-slate-800/40">
                  <td className="p-3">
                    <span className="font-semibold text-white block">{cap.name}</span>
                    <span className="text-[10px] text-slate-500 block">{cap.description}</span>
                  </td>
                  {ROLES_COLUMNS.map((role) => {
                    const currentLevel = matrix[cap.id]?.[role] || 'DENIED';
                    return (
                      <td key={role} className="p-3 text-center">
                        <select
                          value={currentLevel}
                          disabled={role === 'SOFTWARE_SUPER_ADMIN'}
                          onChange={(e) =>
                            handlePermissionChange(cap.id, role, e.target.value as CapabilityAccessLevel)
                          }
                          className={`py-1 px-2 rounded-lg text-[10px] font-bold border ${
                            currentLevel === 'AUTHORIZED'
                              ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                              : currentLevel === 'READ_ONLY'
                              ? 'bg-blue-950 text-blue-400 border-blue-800'
                              : 'bg-red-950 text-red-400 border-red-800'
                          } disabled:opacity-80`}
                        >
                          <option value="AUTHORIZED">AUTHORIZED</option>
                          <option value="READ_ONLY">READ_ONLY</option>
                          <option value="DENIED">DENIED</option>
                        </select>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE ROLE MODAL */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Create Custom Platform Role</h3>
              <button onClick={() => setIsRoleModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400 hover:text-white" />
              </button>
            </div>

            <form onSubmit={handleCreateRole} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Role Title *</label>
                <input
                  type="text"
                  required
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  placeholder="e.g. Compliance Auditor"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description</label>
                <textarea
                  rows={3}
                  value={newRoleDesc}
                  onChange={(e) => setNewRoleDesc(e.target.value)}
                  placeholder="e.g. Inspect ISO and SOC 2 asset controls across departments."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-800 pt-3">
                <button
                  type="button"
                  onClick={() => setIsRoleModalOpen(false)}
                  className="py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 bg-red-600 hover:bg-red-500 text-white rounded-xl font-semibold shadow-lg shadow-red-900/30"
                >
                  Create Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
