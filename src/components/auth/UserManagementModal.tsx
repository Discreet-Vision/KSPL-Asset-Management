import React, { useState, useEffect } from 'react';
import {
  X,
  Users,
  UserPlus,
  ShieldCheck,
  Building2,
  Search,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Lock,
  Unlock,
  Edit2,
  Table,
  Check,
  HelpCircle,
  Briefcase,
  Mail,
  Sliders,
  Crown,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  Download,
  Upload,
  Eye,
  Info,
  Layers,
  FileJson,
  CheckSquare,
  XSquare,
} from 'lucide-react';
import {
  User,
  UserRole,
  OrganizationTenant,
  Department,
  CapabilityAccessLevel,
  RbacCapabilityItem,
  RbacMatrixPermissions,
  RbacMatrixState,
} from '../../types';
import { useApp } from '../../context/AppContext';

interface UserManagementModalProps {
  currentUser: User;
  currentTenant: OrganizationTenant;
  allUsers: User[];
  departments: Department[];
  onClose: () => void;
  onProvisionUser: (userData: any) => Promise<{ success: boolean; error?: string; user?: User }>;
  onUpdateUserRole: (
    userId: string,
    role: UserRole,
    status?: 'Active' | 'Locked' | 'Disabled',
    departmentId?: string,
    jobTitle?: string
  ) => Promise<{ success: boolean; error?: string }>;
}

export const RBAC_ROLE_DEFINITIONS: {
  role: UserRole;
  label: string;
  badgeColor: string;
  description: string;
}[] = [
  {
    role: 'SOFTWARE_SUPER_ADMIN',
    label: 'Software Super Admin',
    badgeColor: 'bg-red-600 text-white',
    description: 'Full global platform control across all organization tenants and infrastructure.',
  },
  {
    role: 'CLIENT_ADMIN',
    label: 'Client Admin / Super Admin',
    badgeColor: 'bg-amber-600 text-white',
    description: 'Full administrative authority strictly within the organization tenant.',
  },
  {
    role: 'ITAM Admin',
    label: 'ITAM Specialist',
    badgeColor: 'bg-blue-600 text-white',
    description: 'Manages physical hardware assets, stockrooms, and software licenses (ELP).',
  },
  {
    role: 'CMDB Admin',
    label: 'CMDB / Cloud Architect',
    badgeColor: 'bg-emerald-600 text-white',
    description: 'Manages Configuration Items (CIs), relationships, discovery scans, and drift rules.',
  },
  {
    role: 'Security',
    label: 'SecOps & Compliance',
    badgeColor: 'bg-purple-600 text-white',
    description: 'Manages CVE vulnerabilities, compliance policy rules, and NIST wipe verification.',
  },
  {
    role: 'Finance',
    label: 'Finance & Procurement',
    badgeColor: 'bg-teal-600 text-white',
    description: 'Manages purchase orders, vendor contracts, depreciation schedules, and valuation.',
  },
  {
    role: 'Employee',
    label: 'Standard Employee',
    badgeColor: 'bg-zinc-700 text-zinc-200',
    description: 'Self-service catalog access for requesting equipment and reporting issues.',
  },
];

const ROLES_LIST = [
  'SOFTWARE_SUPER_ADMIN',
  'CLIENT_ADMIN',
  'ITAM Admin',
  'CMDB Admin',
  'Security',
  'Finance',
  'Employee',
];

export const UserManagementModal: React.FC<UserManagementModalProps> = ({
  currentUser,
  currentTenant,
  allUsers,
  departments,
  onClose,
  onProvisionUser,
  onUpdateUserRole,
}) => {
  const { rbacState, saveRbacMatrix, resetRbacMatrix } = useApp();

  const [activeTab, setActiveTab] = useState<'directory' | 'matrix' | 'provision'>('directory');
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // Provisioning Form State
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('Employee');
  const [newDepartment, setNewDepartment] = useState('d-1');
  const [newJobTitle, setNewJobTitle] = useState('');
  const [newPassword, setNewPassword] = useState('Password123!');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Edit User State
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState<UserRole>('Employee');
  const [editStatus, setEditStatus] = useState<'Active' | 'Locked' | 'Disabled'>('Active');
  const [editDept, setEditDept] = useState('d-1');
  const [editJobTitle, setEditJobTitle] = useState('');

  // RBAC Matrix Live Editing State
  const [matrixDraft, setMatrixDraft] = useState<RbacMatrixPermissions>({});
  const [capabilitiesDraft, setCapabilitiesDraft] = useState<RbacCapabilityItem[]>([]);
  const [matrixCategoryFilter, setMatrixCategoryFilter] = useState<string>('ALL');
  const [matrixSearchQuery, setMatrixSearchQuery] = useState<string>('');
  const [isSavingMatrix, setIsSavingMatrix] = useState(false);
  const [isResettingMatrix, setIsResettingMatrix] = useState(false);
  const [hasMatrixChanges, setHasMatrixChanges] = useState(false);
  const [showAddCapabilityModal, setShowAddCapabilityModal] = useState(false);
  const [showJsonModal, setShowJsonModal] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const [jsonCopyFeedback, setJsonCopyFeedback] = useState(false);

  // New Capability Form State
  const [newCapName, setNewCapName] = useState('');
  const [newCapCategory, setNewCapCategory] = useState('ITAM & CMDB');
  const [newCapDescription, setNewCapDescription] = useState('');
  const [newCapInitialLevel, setNewCapInitialLevel] = useState<CapabilityAccessLevel>('DENIED');

  // Sync draft state with rbacState on mount/update
  useEffect(() => {
    if (rbacState?.matrix && rbacState?.capabilities) {
      setMatrixDraft(JSON.parse(JSON.stringify(rbacState.matrix)));
      setCapabilitiesDraft(JSON.parse(JSON.stringify(rbacState.capabilities)));
      setHasMatrixChanges(false);
    }
  }, [rbacState]);

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

  // Filter roles dynamically: hide SOFTWARE_SUPER_ADMIN completely from client admins
  const visibleRolesList = isSuperAdmin
    ? ROLES_LIST
    : ROLES_LIST.filter((r) => r !== 'SOFTWARE_SUPER_ADMIN' && r !== 'Software Super Admin');

  const visibleRoleDefinitions = RBAC_ROLE_DEFINITIONS.filter(
    (r) => isSuperAdmin || (r.role !== 'SOFTWARE_SUPER_ADMIN' && r.role !== 'Software Super Admin')
  );

  // Filter users strictly by tenant (unless Super Admin)
  const scopedUsers = isSuperAdmin
    ? allUsers
    : allUsers.filter((u) => u.tenantId === currentTenant.id || !u.tenantId);

  const filteredUsers = scopedUsers.filter((u) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.role && u.role.toLowerCase().includes(q));

    const matchesDept = departmentFilter === 'ALL' || u.departmentId === departmentFilter;
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;

    return matchesSearch && matchesDept && matchesRole;
  });

  const handleStartEdit = (user: User) => {
    setEditingUserId(user.id);
    setEditRole(user.role || 'Employee');
    setEditStatus(user.status || 'Active');
    setEditDept(user.departmentId || 'd-1');
    setEditJobTitle((user as any).jobTitle || '');
  };

  const handleSaveEdit = async (userId: string) => {
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);
    try {
      const res = await onUpdateUserRole(userId, editRole, editStatus, editDept, editJobTitle);
      if (!res.success) {
        setErrorMsg(res.error || 'Failed to update user.');
      } else {
        setSuccessMsg('User role and permissions updated successfully.');
        setEditingUserId(null);
      }
    } catch (err: any) {
      setErrorMsg('Error saving user role changes.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    try {
      const res = await onProvisionUser({
        name: newName,
        email: newEmail,
        role: newRole,
        departmentId: newDepartment,
        locationId: 'loc-1',
        tenantId: currentTenant.id,
        jobTitle: newJobTitle || 'Team Member',
        password: newPassword,
      });

      if (!res.success) {
        setErrorMsg(res.error || 'Failed to provision user.');
      } else {
        setSuccessMsg(`User ${newName} (${newEmail}) provisioned successfully with role ${newRole}.`);
        setNewName('');
        setNewEmail('');
        setNewJobTitle('');
        setNewPassword('Password123!');
        setActiveTab('directory');
      }
    } catch (err: any) {
      setErrorMsg('Error creating user account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // RBAC Matrix Cell Mutation Handlers
  const handleToggleCell = (capabilityId: string, roleKey: string) => {
    const currentLevel = matrixDraft[capabilityId]?.[roleKey] || 'DENIED';
    let nextLevel: CapabilityAccessLevel = 'AUTHORIZED';
    if (currentLevel === 'AUTHORIZED') {
      nextLevel = 'READ_ONLY';
    } else if (currentLevel === 'READ_ONLY') {
      nextLevel = 'DENIED';
    } else {
      nextLevel = 'AUTHORIZED';
    }

    setMatrixDraft((prev) => ({
      ...prev,
      [capabilityId]: {
        ...(prev[capabilityId] || {}),
        [roleKey]: nextLevel,
      },
    }));
    setHasMatrixChanges(true);
  };

  const handleSetCellDirect = (
    capabilityId: string,
    roleKey: string,
    level: CapabilityAccessLevel
  ) => {
    setMatrixDraft((prev) => ({
      ...prev,
      [capabilityId]: {
        ...(prev[capabilityId] || {}),
        [roleKey]: level,
      },
    }));
    setHasMatrixChanges(true);
  };

  const handleSetRowAll = (capabilityId: string, level: CapabilityAccessLevel) => {
    setMatrixDraft((prev) => {
      const updatedRow: Record<string, CapabilityAccessLevel> = {
        ...(prev[capabilityId] || {}),
      };
      visibleRolesList.forEach((r) => {
        updatedRow[r] = level;
      });
      // If not super admin, preserve SOFTWARE_SUPER_ADMIN authorization
      if (!isSuperAdmin) {
        updatedRow['SOFTWARE_SUPER_ADMIN'] = prev[capabilityId]?.['SOFTWARE_SUPER_ADMIN'] || 'AUTHORIZED';
      }
      return {
        ...prev,
        [capabilityId]: updatedRow,
      };
    });
    setHasMatrixChanges(true);
  };

  const handleSetColumnAll = (roleKey: string, level: CapabilityAccessLevel) => {
    setMatrixDraft((prev) => {
      const updated = { ...prev };
      capabilitiesDraft.forEach((cap) => {
        if (!updated[cap.id]) updated[cap.id] = {};
        updated[cap.id][roleKey] = level;
      });
      return updated;
    });
    setHasMatrixChanges(true);
  };

  const handleSaveMatrixChanges = async () => {
    setIsSavingMatrix(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await saveRbacMatrix(matrixDraft, capabilitiesDraft);
      if (res.success) {
        setSuccessMsg('RBAC Permission Matrix saved and enforced globally across tenant.');
        setHasMatrixChanges(false);
      } else {
        setErrorMsg(res.error || 'Failed to save matrix.');
      }
    } catch (err: any) {
      setErrorMsg('Error saving permission matrix.');
    } finally {
      setIsSavingMatrix(false);
    }
  };

  const handleResetMatrix = async () => {
    if (!window.confirm('Reset RBAC Permission Matrix to system default boundaries? Any custom overrides will be replaced.')) {
      return;
    }
    setIsResettingMatrix(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await resetRbacMatrix();
      if (res.success) {
        setSuccessMsg('RBAC Permission Matrix reset to standard baseline defaults.');
        setHasMatrixChanges(false);
      } else {
        setErrorMsg(res.error || 'Failed to reset matrix.');
      }
    } catch (err: any) {
      setErrorMsg('Error resetting matrix.');
    } finally {
      setIsResettingMatrix(false);
    }
  };

  const handleCreateCustomCapability = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCapName.trim()) return;

    const newId = `cap_${newCapName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now().toString().slice(-4)}`;
    const newCapItem: RbacCapabilityItem = {
      id: newId,
      name: newCapName.trim(),
      category: newCapCategory,
      description: newCapDescription.trim() || `Access control boundary for ${newCapName.trim()}`,
    };

    setCapabilitiesDraft((prev) => [...prev, newCapItem]);

    // Initialize row permissions in draft
    setMatrixDraft((prev) => {
      const newRow: Record<string, CapabilityAccessLevel> = {};
      ROLES_LIST.forEach((r) => {
        if (r === 'SOFTWARE_SUPER_ADMIN' || r === 'CLIENT_ADMIN') {
          newRow[r] = 'AUTHORIZED';
        } else {
          newRow[r] = newCapInitialLevel;
        }
      });
      return {
        ...prev,
        [newId]: newRow,
      };
    });

    setHasMatrixChanges(true);
    setShowAddCapabilityModal(false);
    setNewCapName('');
    setNewCapDescription('');
    setSuccessMsg(`Capability "${newCapItem.name}" added to matrix.`);
  };

  const handleDeleteCapability = (capabilityId: string) => {
    if (!window.confirm('Are you sure you want to remove this capability from the permission matrix?')) {
      return;
    }
    setCapabilitiesDraft((prev) => prev.filter((c) => c.id !== capabilityId));
    setMatrixDraft((prev) => {
      const updated = { ...prev };
      delete updated[capabilityId];
      return updated;
    });
    setHasMatrixChanges(true);
  };

  // Matrix Filtered Capabilities
  const filteredCapabilities = capabilitiesDraft.filter((c) => {
    const matchesCat = matrixCategoryFilter === 'ALL' || c.category === matrixCategoryFilter;
    const q = matrixSearchQuery.toLowerCase();
    const matchesQuery =
      !matrixSearchQuery ||
      c.name.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q);
    return matchesCat && matchesQuery;
  });

  const allCategories = Array.from(new Set(capabilitiesDraft.map((c) => c.category)));

  const handleOpenJsonModal = () => {
    const exportData = {
      tenantId: currentTenant.id,
      exportedAt: new Date().toISOString(),
      capabilities: capabilitiesDraft,
      matrix: matrixDraft,
    };
    setJsonInput(JSON.stringify(exportData, null, 2));
    setShowJsonModal(true);
  };

  const handleApplyJsonImport = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      if (!parsed.matrix || !parsed.capabilities) {
        alert('Invalid RBAC JSON schema: matrix and capabilities objects required.');
        return;
      }
      setMatrixDraft(parsed.matrix);
      setCapabilitiesDraft(parsed.capabilities);
      setHasMatrixChanges(true);
      setShowJsonModal(false);
      setSuccessMsg('Custom RBAC JSON Policy imported successfully into editor. Click "Save Matrix" to persist.');
    } catch (e: any) {
      alert(`Invalid JSON format: ${e.message}`);
    }
  };

  if (!isAdmin) {
    return (
      <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 font-sans">
        <div className="w-full max-w-md bg-zinc-950 border border-red-900/60 rounded-2xl shadow-2xl overflow-hidden p-6 text-center">
          <div className="w-14 h-14 bg-red-950/80 border border-red-800 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-base font-bold text-white mb-2">ACCESS RESTRICTED</h2>
          <p className="text-xs text-zinc-400 font-mono leading-relaxed mb-6">
            Role-Based Access Control (RBAC) permission matrices and User Directory management are restricted exclusively to Super Administrators and Organization Client Administrators.
          </p>
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white rounded-lg text-xs font-mono font-bold cursor-pointer transition-colors"
          >
            RETURN TO PLATFORM
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 font-sans selection:bg-red-600 selection:text-white">
      <div className="w-full max-w-6xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-black p-5 border-b border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-red-950 border border-red-800 flex items-center justify-center text-red-500 font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-bold text-white tracking-wide">ORGANIZATION USER DIRECTORY & RBAC MATRIX</h2>
                <span className="text-[10px] bg-red-600 text-white font-mono font-bold px-2 py-0.5 rounded">
                  {currentTenant?.name || 'Organization'}
                </span>
                <span className="text-[10px] bg-zinc-800 text-zinc-300 font-mono px-2 py-0.5 rounded border border-zinc-700">
                  Admin Configurable
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-mono">
                Manage Organization Staff, Access Roles & Enforce Custom Permission Matrices
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between bg-zinc-900/60 px-6 py-2 border-b border-zinc-800 shrink-0 font-mono text-xs">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('directory')}
              className={`px-3 py-1.5 rounded-md flex items-center space-x-1.5 cursor-pointer transition-colors ${
                activeTab === 'directory'
                  ? 'bg-red-600 text-white font-bold'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>User Directory ({scopedUsers.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('matrix')}
              className={`px-3 py-1.5 rounded-md flex items-center space-x-1.5 cursor-pointer transition-colors relative ${
                activeTab === 'matrix'
                  ? 'bg-red-600 text-white font-bold'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>RBAC Permission Matrix</span>
              {hasMatrixChanges && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('provision')}
              className={`px-3 py-1.5 rounded-md flex items-center space-x-1.5 cursor-pointer transition-colors ${
                activeTab === 'provision'
                  ? 'bg-red-600 text-white font-bold'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Provision New User</span>
            </button>
          </div>

          <div className="text-[11px] text-zinc-500 font-mono flex items-center space-x-2">
            <span>Tenant ID:</span>
            <span className="text-zinc-300 font-bold">{currentTenant.id}</span>
          </div>
        </div>

        {/* Status Toast Messages */}
        {successMsg && (
          <div className="bg-emerald-950/70 border-b border-emerald-800/80 px-6 py-2 flex items-center justify-between text-emerald-300 text-xs font-mono shrink-0">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg('')} className="text-emerald-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {errorMsg && (
          <div className="bg-red-950/70 border-b border-red-800/80 px-6 py-2 flex items-center justify-between text-red-300 text-xs font-mono shrink-0">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span>{errorMsg}</span>
            </div>
            <button onClick={() => setErrorMsg('')} className="text-red-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: USER DIRECTORY */}
          {activeTab === 'directory' && (
            <div className="space-y-4 font-mono text-xs">
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-black p-3.5 border border-zinc-800 rounded-xl">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search name, email, role..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-3 py-1.5 text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <select
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                    className="bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-300 focus:outline-none focus:border-red-500"
                  >
                    <option value="ALL">All Departments</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-300 focus:outline-none focus:border-red-500"
                  >
                    <option value="ALL">All Roles</option>
                    {visibleRoleDefinitions.map((r) => (
                      <option key={r.role} value={r.role}>
                        {r.label}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => setActiveTab('provision')}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold flex items-center space-x-1 cursor-pointer transition-colors whitespace-nowrap"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Add User</span>
                  </button>
                </div>
              </div>

              {/* Users Table */}
              <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-950">
                <table className="w-full text-left font-mono text-xs">
                  <thead className="bg-black text-zinc-400 border-b border-zinc-800 text-[10px] uppercase">
                    <tr>
                      <th className="p-3">User & Contact</th>
                      <th className="p-3">Role & Permissions</th>
                      <th className="p-3">Department</th>
                      <th className="p-3">Security & Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/80 text-zinc-300">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-zinc-500">
                          No users found matching your filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => {
                        const isEditing = editingUserId === u.id;
                        const roleMeta = RBAC_ROLE_DEFINITIONS.find((r) => r.role === u.role);
                        const dept = departments.find((d) => d.id === u.departmentId);

                        return (
                          <tr key={u.id} className="hover:bg-zinc-900/50 transition-colors">
                            <td className="p-3">
                              <div className="font-bold text-white flex items-center space-x-2">
                                <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] text-zinc-300 font-bold">
                                  {u.name.charAt(0).toUpperCase()}
                                </div>
                                <span>{u.name}</span>
                              </div>
                              <div className="text-zinc-500 text-[11px] mt-0.5">{u.email}</div>
                              <div className="text-zinc-600 text-[10px]">ID: {u.id}</div>
                            </td>

                            <td className="p-3">
                              {isEditing ? (
                                <select
                                  value={editRole}
                                  onChange={(e) => setEditRole(e.target.value as UserRole)}
                                  className="bg-black border border-zinc-700 rounded p-1 text-xs text-white focus:outline-none focus:border-red-500"
                                >
                                  {visibleRoleDefinitions.map((r) => (
                                    <option key={r.role} value={r.role}>
                                      {r.label}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <div>
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${roleMeta?.badgeColor || 'bg-zinc-800 text-white'}`}>
                                    {u.role}
                                  </span>
                                  <p className="text-[10px] text-zinc-500 mt-1 max-w-xs truncate">
                                    {roleMeta?.description}
                                  </p>
                                </div>
                              )}
                            </td>

                            <td className="p-3">
                              {isEditing ? (
                                <select
                                  value={editDept}
                                  onChange={(e) => setEditDept(e.target.value)}
                                  className="bg-black border border-zinc-700 rounded p-1 text-xs text-white focus:outline-none focus:border-red-500"
                                >
                                  {departments.map((d) => (
                                    <option key={d.id} value={d.id}>
                                      {d.name}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <span className="text-zinc-300">{dept?.name || u.departmentId || 'Infrastructure'}</span>
                              )}
                            </td>

                            <td className="p-3">
                              {isEditing ? (
                                <select
                                  value={editStatus}
                                  onChange={(e) => setEditStatus(e.target.value as any)}
                                  className="bg-black border border-zinc-700 rounded p-1 text-xs text-white focus:outline-none focus:border-red-500"
                                >
                                  <option value="Active">Active</option>
                                  <option value="Locked">Locked</option>
                                  <option value="Disabled">Disabled</option>
                                </select>
                              ) : (
                                <div className="space-y-1">
                                  <span
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                      u.status === 'Locked' || u.status === 'Disabled'
                                        ? 'bg-red-950 text-red-400 border-red-800'
                                        : 'bg-emerald-950 text-emerald-400 border-emerald-800'
                                    }`}
                                  >
                                    {u.status || 'Active'}
                                  </span>
                                  <div className="text-[10px] text-zinc-500 flex items-center space-x-1">
                                    <ShieldCheck className="w-3 h-3 text-red-500" />
                                    <span>{u.mfaEnabled ? 'MFA Active' : 'MFA Required'}</span>
                                  </div>
                                </div>
                              )}
                            </td>

                            <td className="p-3 text-right">
                              {isEditing ? (
                                <div className="flex items-center justify-end space-x-2">
                                  <button
                                    onClick={() => handleSaveEdit(u.id)}
                                    disabled={isSubmitting}
                                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold cursor-pointer transition-colors"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => setEditingUserId(null)}
                                    className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-[10px] cursor-pointer transition-colors"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleStartEdit(u)}
                                  className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white rounded text-[10px] font-bold flex items-center space-x-1 ml-auto cursor-pointer transition-colors"
                                >
                                  <Edit2 className="w-3 h-3" />
                                  <span>Edit Role</span>
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: RBAC PERMISSION MATRIX TABLE (DYNAMIC & EDITABLE BY ADMIN) */}
          {activeTab === 'matrix' && (
            <div className="space-y-4 font-mono text-xs">
              
              {/* Matrix Control Header */}
              <div className="bg-black p-4 border border-zinc-800 rounded-xl space-y-3">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                        <Sliders className="w-4 h-4 text-red-500" />
                        <span>DYNAMIC RBAC ACCESS CONTROL POLICY MATRIX</span>
                      </h3>
                      {hasMatrixChanges && (
                        <span className="px-2 py-0.5 bg-amber-950 text-amber-300 border border-amber-800 rounded text-[10px] font-bold animate-pulse">
                          Unsaved Matrix Edits
                        </span>
                      )}
                    </div>
                    <p className="text-zinc-400 text-[11px] mt-1">
                      Admin has full control to change any role's access permissions anytime. Click any cell to cycle (<span className="text-emerald-400">Authorized</span> / <span className="text-amber-400">Read Only</span> / <span className="text-zinc-500">Denied</span>).
                    </p>
                  </div>

                  {/* Primary Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setShowAddCapabilityModal(true)}
                      className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-lg text-xs font-bold flex items-center space-x-1.5 cursor-pointer transition-colors"
                      title="Add a custom platform capability or permission rule"
                    >
                      <Plus className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Add Capability</span>
                    </button>

                    <button
                      onClick={handleOpenJsonModal}
                      className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-lg text-xs font-bold flex items-center space-x-1.5 cursor-pointer transition-colors"
                      title="Export or Import JSON Policy Configuration"
                    >
                      <FileJson className="w-3.5 h-3.5 text-blue-400" />
                      <span>Policy JSON</span>
                    </button>

                    <button
                      onClick={handleResetMatrix}
                      disabled={isResettingMatrix}
                      className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-lg text-xs font-bold flex items-center space-x-1.5 cursor-pointer transition-colors"
                      title="Restore system baseline defaults"
                    >
                      <RotateCcw className={`w-3.5 h-3.5 ${isResettingMatrix ? 'animate-spin' : ''}`} />
                      <span>Reset Defaults</span>
                    </button>

                    <button
                      onClick={handleSaveMatrixChanges}
                      disabled={isSavingMatrix}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 cursor-pointer transition-all shadow-md ${
                        hasMatrixChanges
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white animate-pulse'
                          : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
                      }`}
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{isSavingMatrix ? 'Saving...' : 'Save Permissions'}</span>
                    </button>
                  </div>
                </div>

                {/* Matrix Filter & Search Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-zinc-800/80">
                  <div className="flex items-center space-x-2 w-full sm:w-auto">
                    <div className="relative w-full sm:w-64">
                      <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-zinc-500" />
                      <input
                        type="text"
                        value={matrixSearchQuery}
                        onChange={(e) => setMatrixSearchQuery(e.target.value)}
                        placeholder="Search capabilities..."
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-8 pr-2.5 py-1 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                      />
                    </div>

                    <select
                      value={matrixCategoryFilter}
                      onChange={(e) => setMatrixCategoryFilter(e.target.value)}
                      className="bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-zinc-300 focus:outline-none focus:border-red-500"
                    >
                      <option value="ALL">All Categories ({capabilitiesDraft.length})</option>
                      {allCategories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Legend */}
                  <div className="flex items-center space-x-3 text-[11px] text-zinc-400">
                    <span className="flex items-center space-x-1 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60 text-emerald-300">
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>Authorized (Full)</span>
                    </span>
                    <span className="flex items-center space-x-1 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60 text-amber-300">
                      <Eye className="w-3 h-3 text-amber-400" />
                      <span>Read Only</span>
                    </span>
                    <span className="flex items-center space-x-1 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800 text-zinc-400">
                      <X className="w-3 h-3 text-zinc-500" />
                      <span>Denied</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Dynamic Interactive Matrix Table */}
              <div className="border border-zinc-800 rounded-xl overflow-x-auto bg-zinc-950 shadow-inner">
                <table className="w-full text-left text-xs min-w-[860px]">
                  <thead className="bg-black text-zinc-400 border-b border-zinc-800 text-[10px] uppercase">
                    <tr>
                      <th className="p-3 w-64">
                        <div className="flex items-center justify-between">
                          <span>Functional Capability & Scope</span>
                          <span className="text-zinc-500 text-[9px] lowercase font-normal">
                            ({filteredCapabilities.length} items)
                          </span>
                        </div>
                      </th>
                      {visibleRolesList.map((roleKey) => {
                        const roleDef = RBAC_ROLE_DEFINITIONS.find((r) => r.role === roleKey);
                        return (
                          <th key={roleKey} className="p-2.5 text-center border-l border-zinc-800/80">
                            <div className="font-bold text-white truncate max-w-[110px] mx-auto text-[10px]">
                              {roleDef?.label.replace('Client Admin / Super Admin', 'Client Admin') || roleKey}
                            </div>
                            
                            {/* Column Bulk Action Dropdown */}
                            <div className="mt-1 flex items-center justify-center space-x-1">
                              <button
                                onClick={() => handleSetColumnAll(roleKey, 'AUTHORIZED')}
                                className="p-1 hover:bg-emerald-950 text-zinc-500 hover:text-emerald-400 rounded cursor-pointer transition-colors"
                                title={`Authorize all capabilities for ${roleKey}`}
                              >
                                <CheckSquare className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleSetColumnAll(roleKey, 'READ_ONLY')}
                                className="p-1 hover:bg-amber-950 text-zinc-500 hover:text-amber-400 rounded cursor-pointer transition-colors"
                                title={`Set all capabilities to Read Only for ${roleKey}`}
                              >
                                <Eye className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleSetColumnAll(roleKey, 'DENIED')}
                                className="p-1 hover:bg-red-950 text-zinc-500 hover:text-red-400 rounded cursor-pointer transition-colors"
                                title={`Deny all capabilities for ${roleKey}`}
                              >
                                <XSquare className="w-3 h-3" />
                              </button>
                            </div>
                          </th>
                        );
                      })}
                      <th className="p-2.5 text-right border-l border-zinc-800/80 w-16">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-zinc-800 text-zinc-300">
                    {filteredCapabilities.length === 0 ? (
                      <tr>
                        <td colSpan={visibleRolesList.length + 2} className="p-8 text-center text-zinc-500">
                          No capabilities found matching the filter.
                        </td>
                      </tr>
                    ) : (
                      filteredCapabilities.map((cap) => {
                        const rowPerms = matrixDraft[cap.id] || {};
                        const isCustom = cap.id.startsWith('cap_');

                        return (
                          <tr key={cap.id} className="hover:bg-zinc-900/40 transition-colors group">
                            {/* Capability Column */}
                            <td className="p-3">
                              <div className="flex items-center space-x-2">
                                <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono">
                                  {cap.category}
                                </span>
                              </div>
                              <div className="font-bold text-white text-xs mt-1">{cap.name}</div>
                              <p className="text-[10px] text-zinc-500 mt-0.5 line-clamp-2 leading-relaxed">
                                {cap.description}
                              </p>
                            </td>

                            {/* Role Cells */}
                            {visibleRolesList.map((roleKey) => {
                              const level: CapabilityAccessLevel = rowPerms[roleKey] || 'DENIED';

                              return (
                                <td
                                  key={roleKey}
                                  className="p-2 text-center border-l border-zinc-800/80 align-middle"
                                >
                                  <div className="flex flex-col items-center justify-center">
                                    {/* Primary Interactive Click Target */}
                                    <button
                                      onClick={() => handleToggleCell(cap.id, roleKey)}
                                      className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex items-center justify-center space-x-1 w-full max-w-[105px] cursor-pointer transition-all border ${
                                        level === 'AUTHORIZED'
                                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/80 hover:bg-emerald-900 hover:border-emerald-500 shadow-sm'
                                          : level === 'READ_ONLY'
                                          ? 'bg-amber-950/80 text-amber-300 border-amber-700/80 hover:bg-amber-900 hover:border-amber-500 shadow-sm'
                                          : 'bg-zinc-900/90 text-zinc-500 border-zinc-800 hover:bg-zinc-800 hover:text-zinc-300 hover:border-zinc-700'
                                      }`}
                                      title={`Click to cycle permission for ${roleKey}`}
                                    >
                                      {level === 'AUTHORIZED' && (
                                        <>
                                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                                          <span>Authorized</span>
                                        </>
                                      )}
                                      {level === 'READ_ONLY' && (
                                        <>
                                          <Eye className="w-3.5 h-3.5 text-amber-400" />
                                          <span>Read Only</span>
                                        </>
                                      )}
                                      {level === 'DENIED' && (
                                        <>
                                          <X className="w-3.5 h-3.5 text-zinc-500" />
                                          <span>Denied</span>
                                        </>
                                      )}
                                    </button>

                                    {/* Quick 3-way direct switcher for fast precision */}
                                    <div className="flex items-center space-x-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleSetCellDirect(cap.id, roleKey, 'AUTHORIZED');
                                        }}
                                        className={`w-3.5 h-3.5 rounded text-[8px] flex items-center justify-center cursor-pointer ${
                                          level === 'AUTHORIZED' ? 'bg-emerald-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-emerald-900'
                                        }`}
                                        title="Direct Authorize"
                                      >
                                        ✓
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleSetCellDirect(cap.id, roleKey, 'READ_ONLY');
                                        }}
                                        className={`w-3.5 h-3.5 rounded text-[8px] flex items-center justify-center cursor-pointer ${
                                          level === 'READ_ONLY' ? 'bg-amber-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-amber-900'
                                        }`}
                                        title="Direct Read-Only"
                                      >
                                        👁
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleSetCellDirect(cap.id, roleKey, 'DENIED');
                                        }}
                                        className={`w-3.5 h-3.5 rounded text-[8px] flex items-center justify-center cursor-pointer ${
                                          level === 'DENIED' ? 'bg-zinc-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-red-900'
                                        }`}
                                        title="Direct Deny"
                                      >
                                        ✕
                                      </button>
                                    </div>
                                  </div>
                                </td>
                              );
                            })}

                            {/* Row Quick Action */}
                            <td className="p-2 border-l border-zinc-800/80 text-right align-middle">
                              <div className="flex items-center justify-end space-x-1">
                                <button
                                  onClick={() => handleSetRowAll(cap.id, 'AUTHORIZED')}
                                  className="p-1 hover:bg-emerald-950 text-zinc-500 hover:text-emerald-400 rounded cursor-pointer transition-colors"
                                  title="Authorize all roles for this capability"
                                >
                                  <CheckSquare className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleSetRowAll(cap.id, 'DENIED')}
                                  className="p-1 hover:bg-red-950 text-zinc-500 hover:text-red-400 rounded cursor-pointer transition-colors"
                                  title="Deny all roles for this capability"
                                >
                                  <XSquare className="w-3.5 h-3.5" />
                                </button>
                                {isCustom && (
                                  <button
                                    onClick={() => handleDeleteCapability(cap.id)}
                                    className="p-1 hover:bg-red-950 text-red-400 rounded cursor-pointer transition-colors"
                                    title="Delete custom capability"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Dynamic Matrix Audit Summary */}
              <div className="bg-black p-3.5 border border-zinc-800 rounded-xl flex flex-col sm:flex-row items-center justify-between text-zinc-400 text-xs gap-3">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>
                    Last Policy Synchronization: <span className="text-zinc-200 font-bold">{new Date(rbacState.lastUpdated || Date.now()).toLocaleString()}</span>
                  </span>
                  <span className="text-zinc-600">|</span>
                  <span>Updated By: <span className="text-zinc-300">{rbacState.updatedBy || 'Administrator'}</span></span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-zinc-500">Active Tenant Scope:</span>
                  <span className="text-red-400 font-bold">{currentTenant.name}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PROVISION NEW USER FORM */}
          {activeTab === 'provision' && (
            <form onSubmit={handleCreateUser} className="max-w-2xl mx-auto space-y-4 font-mono text-xs">
              <div className="bg-black p-4 border border-zinc-800 rounded-xl space-y-1">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <UserPlus className="w-4 h-4 text-red-500" />
                  <span>PROVISION NEW ORGANIZATION EMPLOYEE OR ADMIN</span>
                </h3>
                <p className="text-zinc-400 text-[11px]">
                  Creates user credentials bound to tenant <span className="text-white font-bold">{currentTenant.name}</span>.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-300 mb-1 uppercase">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Morgan"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded-lg p-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-300 mb-1 uppercase">Work Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. alex.m@enterprise.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded-lg p-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-300 mb-1 uppercase">Assigned RBAC Role *</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as UserRole)}
                    className="w-full bg-black border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-500"
                  >
                    {visibleRoleDefinitions.map((r) => (
                      <option key={r.role} value={r.role}>
                        {r.label} ({r.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-300 mb-1 uppercase">Department *</label>
                  <select
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-500"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-300 mb-1 uppercase">Job Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Senior Systems Engineer"
                    value={newJobTitle}
                    onChange={(e) => setNewJobTitle(e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded-lg p-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-300 mb-1 uppercase">Initial Temporary Password *</label>
                  <input
                    type="text"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded-lg p-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* Role Capability Preview Card */}
              {(() => {
                const selectedRoleInfo = RBAC_ROLE_DEFINITIONS.find((r) => r.role === newRole);
                return (
                  <div className="bg-zinc-900/60 border border-zinc-800 p-4 rounded-xl space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${selectedRoleInfo?.badgeColor}`}>
                        {selectedRoleInfo?.label}
                      </span>
                      <span className="text-zinc-300 text-xs">{selectedRoleInfo?.description}</span>
                    </div>
                    <div className="text-[11px] text-zinc-400">
                      User will be required to enroll in MFA (Google or Microsoft Authenticator) upon their first sign-in.
                    </div>
                  </div>
                );
              })()}

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setActiveTab('directory')}
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-lg cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg cursor-pointer transition-colors flex items-center space-x-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{isSubmitting ? 'Provisioning...' : 'Provision User'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* MODAL: ADD CUSTOM CAPABILITY */}
      {showAddCapabilityModal && (
        <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl max-w-lg w-full p-5 space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>ADD CUSTOM CAPABILITY RULE</span>
              </h3>
              <button
                onClick={() => setShowAddCapabilityModal(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomCapability} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-zinc-300 mb-1">Capability Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cloud Cost Optimization Engine"
                  value={newCapName}
                  onChange={(e) => setNewCapName(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded-lg p-2 text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-300 mb-1">Category</label>
                  <select
                    value={newCapCategory}
                    onChange={(e) => setNewCapCategory(e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded-lg p-2 text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="Administration">Administration</option>
                    <option value="Identity & Access">Identity & Access</option>
                    <option value="ITAM & CMDB">ITAM & CMDB</option>
                    <option value="Software Asset Management">Software Asset Management</option>
                    <option value="Finance & Procurement">Finance & Procurement</option>
                    <option value="SecOps & Compliance">SecOps & Compliance</option>
                    <option value="Asset Lifecycle">Asset Lifecycle</option>
                    <option value="Employee Portal">Employee Portal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-300 mb-1">Default Non-Admin Level</label>
                  <select
                    value={newCapInitialLevel}
                    onChange={(e) => setNewCapInitialLevel(e.target.value as CapabilityAccessLevel)}
                    className="w-full bg-black border border-zinc-800 rounded-lg p-2 text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="DENIED">Denied</option>
                    <option value="READ_ONLY">Read Only</option>
                    <option value="AUTHORIZED">Authorized</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Defines read/write boundary enforcement for this module..."
                  value={newCapDescription}
                  onChange={(e) => setNewCapDescription(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded-lg p-2 text-white focus:outline-none focus:border-red-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowAddCapabilityModal(false)}
                  className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg"
                >
                  Add to Matrix
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: JSON POLICY IMPORT / EXPORT */}
      {showJsonModal && (
        <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl max-w-2xl w-full p-5 space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <FileJson className="w-4 h-4 text-blue-400" />
                <span>RBAC POLICY MATRIX JSON CONFIGURATION</span>
              </h3>
              <button
                onClick={() => setShowJsonModal(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-zinc-400 text-[11px]">
              You can export this JSON policy file for disaster recovery, compliance audits, or paste an updated JSON schema to apply.
            </p>

            <textarea
              rows={12}
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-emerald-400 font-mono text-xs focus:outline-none focus:border-red-500"
            />

            <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(jsonInput);
                  setJsonCopyFeedback(true);
                  setTimeout(() => setJsonCopyFeedback(false), 2000);
                }}
                className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-lg flex items-center space-x-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-blue-400" />
                <span>{jsonCopyFeedback ? 'Copied to Clipboard!' : 'Copy JSON'}</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowJsonModal(false)}
                  className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-lg"
                >
                  Close
                </button>
                <button
                  onClick={handleApplyJsonImport}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg flex items-center space-x-1.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Apply JSON to Matrix</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
