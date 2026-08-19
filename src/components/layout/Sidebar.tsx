import React, { useEffect } from 'react';
import { useApp, ModuleView } from '../../context/AppContext';
import {
  LayoutDashboard,
  Database,
  Radar,
  Share2,
  HardDrive,
  Code,
  KeyRound,
  ShoppingBag,
  FileText,
  Building,
  DollarSign,
  PackageCheck,
  UserCheck,
  Ticket,
  GitMerge,
  ShieldAlert,
  Bug,
  Award,
  BarChart3,
  LineChart,
  Plug,
  ClipboardList,
  Settings,
  Bot,
  UserPlus,
  Smartphone,
  Crown,
  ShieldCheck,
  Briefcase,
  Layers,
  Building2,
  Users,
  Sliders,
  Bell,
  Activity,
  Terminal,
  Server,
} from 'lucide-react';

interface NavItem {
  id: ModuleView;
  label: string;
  icon: React.ElementType;
  badge?: string;
  targetTab?: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC = () => {
  const {
    activeModule,
    setActiveModule,
    superAdminTab,
    setSuperAdminTab,
    currentUser,
    currentTenant,
    policyViolations,
    softwareLicenses,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
  } = useApp();

  const underLicensedCount = (softwareLicenses || []).filter((l) => l?.complianceStatus === 'Under-Licensed').length;
  const violationCount = (policyViolations || []).filter((v) => v?.status === 'Open').length;

  const handleSelectModule = (item: NavItem) => {
    setActiveModule(item.id);
    if (item.id === 'super_admin' && item.targetTab && setSuperAdminTab) {
      setSuperAdminTab(item.targetTab);
    }
    setIsMobileMenuOpen(false);
  };

  // Helper to construct strictly role-tailored navigation groups
  const getNavGroupsForRole = (
    role?: string
  ): { roleTitle: string; roleBadgeColor: string; groups: NavGroup[] } => {
    const r = (role || '').trim().toLowerCase();

    // 1. SOFTWARE SUPER ADMIN (Global Platform) - Exactly 25 Items in 3 Groups
    if (r === 'software_super_admin' || r === 'software super admin' || r.includes('super_admin')) {
      return {
        roleTitle: 'Software Super Admin',
        roleBadgeColor: 'bg-red-600 text-white',
        groups: [
          {
            title: 'PLATFORM',
            items: [
              { id: 'super_admin', targetTab: 'overview', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'super_admin', targetTab: 'tenants', label: 'Clients / Organizations', icon: Building2 },
              { id: 'super_admin', targetTab: 'users', label: 'Users', icon: Users },
              { id: 'super_admin', targetTab: 'rbac', label: 'Roles & Permissions', icon: Sliders },
              { id: 'super_admin', targetTab: 'assets', label: 'Assets', icon: Layers },
              { id: 'cmdb', label: 'CMDB', icon: Database },
              { id: 'discovery', label: 'Discovery', icon: Radar },
              { id: 'software', label: 'Software Asset Management', icon: Code, badge: underLicensedCount > 0 ? `${underLicensedCount} Deficit` : undefined },
              { id: 'hardware', label: 'Hardware Asset Management', icon: HardDrive },
              { id: 'procurement', label: 'Contracts & Procurement', icon: FileText },
              { id: 'financials', label: 'Financial Management', icon: DollarSign },
              { id: 'compliance', label: 'Compliance', icon: Award },
              { id: 'workflows', label: 'Workflows', icon: GitMerge },
              { id: 'super_admin', targetTab: 'integrations', label: 'Integrations', icon: Plug },
              { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
            ],
          },
          {
            title: 'SECURITY',
            items: [
              { id: 'super_admin', targetTab: 'security', label: 'Security Center', icon: ShieldAlert },
              { id: 'super_admin', targetTab: 'mfa_requests', label: 'MFA Management', icon: KeyRound },
              { id: 'audit', label: 'Audit Logs', icon: ClipboardList },
              { id: 'policies', label: 'Policies', icon: ShieldCheck, badge: violationCount > 0 ? `${violationCount}` : undefined },
              { id: 'vulnerabilities', label: 'Vulnerabilities / CVE', icon: Bug },
            ],
          },
          {
            title: 'PLATFORM MANAGEMENT',
            items: [
              { id: 'super_admin', targetTab: 'notifications', label: 'Notifications', icon: Bell },
              { id: 'super_admin', targetTab: 'system_health', label: 'System Health', icon: Activity },
              { id: 'super_admin', targetTab: 'api_webhooks', label: 'API Management', icon: Terminal },
              { id: 'super_admin', targetTab: 'settings', label: 'System Settings', icon: Settings },
              { id: 'super_admin', targetTab: 'backups', label: 'Data / Backup', icon: Server },
            ],
          },
        ],
      };
    }

    // 2. CLIENT ADMIN / SUPER ADMIN
    if (
      r === 'client_admin' ||
      r === 'client admin' ||
      r === 'client_super_admin' ||
      r === 'super admin' ||
      (currentUser as any)?.isAdmin === true ||
      (currentUser as any)?.isSuperAdmin === true
    ) {
      return {
        roleTitle: 'Client Administrator',
        roleBadgeColor: 'bg-amber-600 text-white',
        groups: [
          {
            title: 'EXECUTIVE MANAGEMENT',
            items: [
              { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
              { id: 'admin', label: 'Platform Administration', icon: Settings },
              { id: 'ai', label: 'AI Copilot & Analytics', icon: Bot },
            ],
          },
          {
            title: 'CMDB & DISCOVERY',
            items: [
              { id: 'cmdb', label: 'CMDB System of Record', icon: Database },
              { id: 'cmdb_federation', label: 'CMDB Federation Layer', icon: Share2 },
              { id: 'discovery', label: 'Discovery Engine', icon: Radar },
              { id: 'reconciliation', label: 'Reconciliation Engine', icon: GitMerge },
            ],
          },
          {
            title: 'ASSET LIFECYCLE',
            items: [
              { id: 'hardware', label: 'Hardware Assets', icon: HardDrive },
              { id: 'software', label: 'Software Assets', icon: Code },
              { id: 'licenses', label: 'Software Licenses & ELP', icon: KeyRound, badge: underLicensedCount > 0 ? `${underLicensedCount} Deficit` : undefined },
              { id: 'stockroom', label: 'Stockroom & Spares', icon: PackageCheck },
              { id: 'assignments', label: 'Assignments & History', icon: UserCheck },
              { id: 'selfservice', label: 'Employee Self-Service', icon: UserPlus },
            ],
          },
          {
            title: 'FINANCE & PROCUREMENT',
            items: [
              { id: 'procurement', label: 'Procurement & Orders', icon: ShoppingBag },
              { id: 'contracts', label: 'Contracts & Renewals', icon: FileText },
              { id: 'vendors', label: 'Vendors & Suppliers', icon: Building },
              { id: 'financials', label: 'Financials & Depreciation', icon: DollarSign },
            ],
          },
          {
            title: 'OPERATIONS & SECURITY',
            items: [
              { id: 'itsm', label: 'ITSM Integrations', icon: Ticket },
              { id: 'workflows', label: 'Workflow Engine', icon: GitMerge },
              { id: 'policies', label: 'Policy Rules Engine', icon: ShieldAlert, badge: violationCount > 0 ? `${violationCount}` : undefined },
              { id: 'vulnerabilities', label: 'Vulnerabilities & CVE', icon: Bug },
              { id: 'compliance', label: 'Compliance & Audits', icon: Award },
              { id: 'security_mfa', label: 'Security & MFA Settings', icon: ShieldCheck },
            ],
          },
          {
            title: 'GOVERNANCE & REPORTS',
            items: [
              { id: 'reports', label: 'Reports & Exports', icon: BarChart3 },
              { id: 'analytics', label: 'Predictive Analytics', icon: LineChart },
              { id: 'integrations', label: 'Integrations & Webhooks', icon: Plug },
              { id: 'audit', label: 'Immutable Audit Logs', icon: ClipboardList },
              { id: 'mobile', label: 'Mobile Field Tech Mode', icon: Smartphone },
            ],
          },
        ],
      };
    }

    // 3. FINANCE & PROCUREMENT PERSONA
    if (r.includes('finance') || r.includes('procurement') || r.includes('budget') || r.includes('accounting')) {
      return {
        roleTitle: 'Finance & Procurement',
        roleBadgeColor: 'bg-teal-600 text-white',
        groups: [
          {
            title: 'FINANCIAL DASHBOARD',
            items: [
              { id: 'dashboard', label: 'Finance Dashboard', icon: LayoutDashboard },
              { id: 'financials', label: 'Financials & Depreciation', icon: DollarSign },
            ],
          },
          {
            title: 'FINANCE & PROCUREMENT',
            items: [
              { id: 'procurement', label: 'Procurement & Orders', icon: ShoppingBag },
              { id: 'contracts', label: 'Contracts & Renewals', icon: FileText },
              { id: 'vendors', label: 'Vendors & Suppliers', icon: Building },
            ],
          },
          {
            title: 'ASSET VALUATION & LICENSES',
            items: [
              { id: 'hardware', label: 'Hardware Asset Register', icon: HardDrive },
              { id: 'licenses', label: 'Software Licenses & ELP', icon: KeyRound, badge: underLicensedCount > 0 ? `${underLicensedCount} Deficit` : undefined },
            ],
          },
          {
            title: 'GOVERNANCE & AUDIT',
            items: [
              { id: 'reports', label: 'Financial Reports & Exports', icon: BarChart3 },
              { id: 'analytics', label: 'Predictive Budget Analytics', icon: LineChart },
              { id: 'audit', label: 'Financial Audit Logs', icon: ClipboardList },
              { id: 'security_mfa', label: 'Security & MFA Settings', icon: ShieldCheck },
            ],
          },
        ],
      };
    }

    // 4. ITAM ADMIN & ASSET SPECIALIST
    if (r.includes('itam') || r.includes('asset manager') || r.includes('asset') || r.includes('hardware')) {
      return {
        roleTitle: 'ITAM Specialist',
        roleBadgeColor: 'bg-blue-600 text-white',
        groups: [
          {
            title: 'ITAM OPERATIONS',
            items: [
              { id: 'dashboard', label: 'ITAM Dashboard', icon: LayoutDashboard },
              { id: 'hardware', label: 'Hardware Assets', icon: HardDrive },
              { id: 'software', label: 'Software Assets', icon: Code },
              { id: 'licenses', label: 'Software Licenses & ELP', icon: KeyRound, badge: underLicensedCount > 0 ? `${underLicensedCount} Deficit` : undefined },
              { id: 'stockroom', label: 'Stockroom & Spares', icon: PackageCheck },
              { id: 'assignments', label: 'Assignments & History', icon: UserCheck },
              { id: 'selfservice', label: 'Self-Service Requests', icon: UserPlus },
            ],
          },
          {
            title: 'PROCUREMENT & VENDORS',
            items: [
              { id: 'procurement', label: 'Procurement & Orders', icon: ShoppingBag },
              { id: 'contracts', label: 'Contracts & Renewals', icon: FileText },
              { id: 'vendors', label: 'Vendors & Suppliers', icon: Building },
            ],
          },
          {
            title: 'FIELD & GOVERNANCE',
            items: [
              { id: 'mobile', label: 'Mobile Field Tech Mode', icon: Smartphone },
              { id: 'reports', label: 'Asset Reports & Exports', icon: BarChart3 },
              { id: 'audit', label: 'Asset Audit Trail', icon: ClipboardList },
              { id: 'security_mfa', label: 'Security & MFA Settings', icon: ShieldCheck },
            ],
          },
        ],
      };
    }

    // 5. CMDB ADMIN & CLOUD ARCHITECT
    if (r.includes('cmdb') || r.includes('cloud') || r.includes('infrastructure') || r.includes('topology')) {
      return {
        roleTitle: 'CMDB / Cloud Architect',
        roleBadgeColor: 'bg-emerald-600 text-white',
        groups: [
          {
            title: 'CMDB & INFRASTRUCTURE',
            items: [
              { id: 'dashboard', label: 'CMDB Dashboard', icon: LayoutDashboard },
              { id: 'cmdb', label: 'CMDB System of Record', icon: Database },
              { id: 'cmdb_federation', label: 'CMDB Federation Layer', icon: Share2 },
              { id: 'discovery', label: 'Discovery Engine', icon: Radar },
              { id: 'reconciliation', label: 'Reconciliation Engine', icon: GitMerge },
              { id: 'ai', label: 'AI Copilot & Topology', icon: Bot },
            ],
          },
          {
            title: 'OPERATIONS & INTEGRATIONS',
            items: [
              { id: 'itsm', label: 'ITSM Integrations', icon: Ticket },
              { id: 'workflows', label: 'Workflow Engine', icon: GitMerge },
              { id: 'policies', label: 'Policy Rules & Drift', icon: ShieldAlert, badge: violationCount > 0 ? `${violationCount}` : undefined },
              { id: 'integrations', label: 'Integrations & Webhooks', icon: Plug },
            ],
          },
          {
            title: 'GOVERNANCE & AUDIT',
            items: [
              { id: 'audit', label: 'Configuration Audit Logs', icon: ClipboardList },
              { id: 'security_mfa', label: 'Security & MFA Settings', icon: ShieldCheck },
            ],
          },
        ],
      };
    }

    // 6. SECURITY & COMPLIANCE PERSONA
    if (r.includes('security') || r.includes('secops') || r.includes('auditor') || r.includes('audit')) {
      return {
        roleTitle: 'SecOps & Compliance',
        roleBadgeColor: 'bg-purple-600 text-white',
        groups: [
          {
            title: 'SECURITY & COMPLIANCE',
            items: [
              { id: 'dashboard', label: 'Security Dashboard', icon: LayoutDashboard },
              { id: 'policies', label: 'Policy Rules Engine', icon: ShieldAlert, badge: violationCount > 0 ? `${violationCount}` : undefined },
              { id: 'vulnerabilities', label: 'Vulnerabilities & CVE', icon: Bug },
              { id: 'compliance', label: 'Compliance & Audits', icon: Award },
              { id: 'security_mfa', label: 'Security & MFA Settings', icon: ShieldCheck },
            ],
          },
          {
            title: 'INVENTORY & POSTURE',
            items: [
              { id: 'cmdb', label: 'CMDB System of Record', icon: Database },
              { id: 'hardware', label: 'Hardware Asset Security', icon: HardDrive },
              { id: 'licenses', label: 'Software License Compliance', icon: KeyRound },
            ],
          },
          {
            title: 'AUDIT & REPORTS',
            items: [
              { id: 'audit', label: 'Immutable Audit Logs', icon: ClipboardList },
              { id: 'reports', label: 'Compliance Reports', icon: BarChart3 },
            ],
          },
        ],
      };
    }

    // 7. FIELD TECHNICIAN PERSONA
    if (r.includes('technician') || r.includes('field') || r.includes('tech')) {
      return {
        roleTitle: 'Field Technician',
        roleBadgeColor: 'bg-orange-600 text-white',
        groups: [
          {
            title: 'FIELD OPERATIONS',
            items: [
              { id: 'dashboard', label: 'Field Tech Dashboard', icon: LayoutDashboard },
              { id: 'mobile', label: 'Mobile Field Tech Mode', icon: Smartphone },
              { id: 'hardware', label: 'Hardware Inventory', icon: HardDrive },
              { id: 'stockroom', label: 'Stockroom & Spares', icon: PackageCheck },
              { id: 'assignments', label: 'Asset Deployments & Returns', icon: UserCheck },
            ],
          },
          {
            title: 'SERVICE & ACCOUNT',
            items: [
              { id: 'itsm', label: 'Assigned Work Orders', icon: Ticket },
              { id: 'security_mfa', label: 'Security & MFA Settings', icon: ShieldCheck },
            ],
          },
        ],
      };
    }

    // 8. STANDARD EMPLOYEE / DEFAULT WORKSPACE
    return {
      roleTitle: 'Employee Workspace',
      roleBadgeColor: 'bg-zinc-700 text-zinc-200',
      groups: [
        {
          title: 'MY WORKSPACE',
          items: [
            { id: 'dashboard', label: 'Employee Dashboard', icon: LayoutDashboard },
            { id: 'selfservice', label: 'Request Hardware & Software', icon: UserPlus },
            { id: 'hardware', label: 'My Assigned Devices', icon: HardDrive },
            { id: 'software', label: 'My Software & Licenses', icon: Code },
          ],
        },
        {
          title: 'SUPPORT & SECURITY',
          items: [
            { id: 'itsm', label: 'My IT Support Requests', icon: Ticket },
            { id: 'security_mfa', label: 'Security & MFA Settings', icon: ShieldCheck },
          ],
        },
      ],
    };
  };

  const { roleTitle, roleBadgeColor, groups: navGroups } = getNavGroupsForRole(currentUser?.role);

  // Extract all valid module IDs for current role
  const allowedModuleIds = React.useMemo(() => {
    const set = new Set<string>();
    (navGroups || []).forEach((g) => {
      (g.items || []).forEach((item) => set.add(item.id));
    });
    return set;
  }, [navGroups]);

  // If active module is outside the user's role capability, safely reset to dashboard or first module
  useEffect(() => {
    if (activeModule && !allowedModuleIds.has(activeModule)) {
      setActiveModule('dashboard');
    }
  }, [activeModule, allowedModuleIds, setActiveModule]);

  const sidebarContent = (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Role Context Header */}
      <div className="p-3 border-b border-zinc-800 bg-zinc-950/80 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-2 min-w-0">
          <div className="w-6 h-6 rounded bg-zinc-900 border border-zinc-700 flex items-center justify-center text-zinc-300 shrink-0">
            <Briefcase className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-mono uppercase text-zinc-400 font-bold tracking-wider truncate">
              User Persona
            </div>
            <div className="text-xs font-bold text-white truncate">
              {currentUser?.name || 'Authorized User'}
            </div>
          </div>
        </div>
        <span className={`text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded-full shrink-0 tracking-wider shadow-sm ${roleBadgeColor}`}>
          {roleTitle}
        </span>
      </div>

      {/* Navigation Group Items */}
      <div className="p-2 pt-2.5 space-y-4 flex-1 overflow-y-auto custom-scrollbar">
        {navGroups.map((group) => (
          <div key={group.title}>
            <div className="text-[10px] font-bold text-zinc-300 font-mono tracking-wider mb-1 px-2 uppercase flex items-center justify-between">
              <span>{group.title}</span>
              <span className="text-[9px] font-mono text-zinc-400 font-normal">
                {group.items.length}
              </span>
            </div>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isSuperAdminRole =
                  currentUser?.role === 'SOFTWARE_SUPER_ADMIN' ||
                  (currentUser?.role as string) === 'software_super_admin';

                let isActive = activeModule === item.id;
                if (isSuperAdminRole && item.id === 'super_admin') {
                  if (item.targetTab) {
                    isActive = activeModule === 'super_admin' && superAdminTab === item.targetTab;
                  } else {
                    isActive = activeModule === 'super_admin' && (!superAdminTab || superAdminTab === 'overview');
                  }
                }

                return (
                  <button
                    key={`${item.id}-${item.targetTab || item.label}`}
                    onClick={() => handleSelectModule(item)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs font-medium transition-all cursor-pointer ${
                      isActive
                        ? 'bg-red-600 text-white font-bold shadow-sm border-l-4 border-white'
                        : 'text-zinc-300 hover:bg-zinc-800/40 border-l-4 border-transparent'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase font-mono shrink-0 ml-1 ${
                          isActive
                            ? 'bg-white text-red-600'
                            : 'bg-red-600/20 text-red-400 border border-red-500/30'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* System Health & Tenant Footer */}
      <div className="p-2.5 border-t border-zinc-800 bg-zinc-950 text-zinc-400 text-[11px] font-mono space-y-0.5 shrink-0">
        <div className="flex items-center justify-between text-zinc-300">
          <span className="flex items-center space-x-1 min-w-0">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse shrink-0"></span>
            <span className="truncate">Kubernesis Security Pvt. Ltd.</span>
          </span>
          <span className="text-zinc-400 shrink-0 ml-1">V1.1.0</span>
        </div>
        <div className="text-[10px] text-zinc-400 truncate">Tenant: {currentTenant?.name || 'Organization'}</div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside className="hidden lg:flex w-64 h-full border-r border-zinc-800 flex-col shrink-0 z-20 overflow-hidden bg-black">
        {sidebarContent}
      </aside>

      {/* Mobile Off-Canvas Drawer Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Off-Canvas Drawer Menu */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-black text-white border-r border-zinc-800 lg:hidden transform transition-transform duration-300 ease-in-out shadow-2xl ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </div>
    </>
  );
};

