import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import {
  User,
  UserRole,
  OrganizationTenant,
  Department,
  Location,
  CIClass,
  ConfigurationItem,
  CIRelationship,
  DiscoveryScanJob,
  EndpointAgent,
  SoftwareCatalogItem,
  DriftEvent,
  Stockroom,
  SoftwareLicense,
  Vendor,
  Contract,
  PurchaseOrder,
  CostCenter,
  DepreciationSchedule,
  ItsmTicket,
  WorkflowDefinition,
  WorkflowInstance,
  SelfServiceRequest,
  VulnerabilityCVE,
  PolicyRule,
  PolicyViolation,
  AuditLogEntry,
  DisposalRecord,
  AiChatMessage,
  MfaMethod,
  RbacCapabilityItem,
  RbacMatrixPermissions,
  RbacMatrixState,
  CapabilityAccessLevel,
} from '../types';

import {
  initializeFirestoreDatabase,
  saveRecordToFirestore,
  removeRecordFromFirestore,
  loadRecordsFromFirestore,
  COLLECTIONS,
} from '../lib/firestoreStore';

import {
  users as initialUsers,
  tenants as initialTenants,
  currentTenant as initialTenant,
  departments as initialDepartments,
  locations as initialLocations,
  ciClasses as initialCiClasses,
  configurationItems as initialCis,
  ciRelationships as initialRelationships,
  discoveryJobs as initialDiscoveryJobs,
  endpointAgents as initialEndpointAgents,
  softwareCatalog as initialSoftwareCatalog,
  driftEvents as initialDriftEvents,
  stockrooms as initialStockrooms,
  softwareLicenses as initialSoftwareLicenses,
  vendors as initialVendors,
  contracts as initialContracts,
  purchaseOrders as initialPurchaseOrders,
  costCenters as initialCostCenters,
  depreciationSchedules as initialDepreciations,
  disposalRecords as initialDisposals,
  itsmTickets as initialItsmTickets,
  workflowDefinitions as initialWorkflowDefs,
  workflowInstances as initialWorkflowInstances,
  selfServiceRequests as initialSelfServiceRequests,
  vulnerabilityCves as initialVulnerabilities,
  policyRules as initialPolicyRules,
  policyViolations as initialPolicyViolations,
  auditLogs as initialAuditLogs,
} from '../data/initialData';

export type ModuleView =
  | 'dashboard'
  | 'cmdb'
  | 'cmdb_federation'
  | 'discovery'
  | 'reconciliation'
  | 'hardware'
  | 'software'
  | 'licenses'
  | 'procurement'
  | 'contracts'
  | 'vendors'
  | 'financials'
  | 'stockroom'
  | 'assignments'
  | 'itsm'
  | 'workflows'
  | 'policies'
  | 'vulnerabilities'
  | 'compliance'
  | 'reports'
  | 'analytics'
  | 'integrations'
  | 'audit'
  | 'admin'
  | 'ai'
  | 'mobile'
  | 'selfservice'
  | 'super_admin'
  | 'security_mfa';

export type AuthView = 'landing' | 'login' | 'register' | 'forgot-password' | 'reset-password' | 'mfa_verification' | 'app';

interface AppContextType {
  // Authentication State
  isAuthenticated: boolean;
  authStatus: 'loading' | 'unauthenticated' | 'authenticated';
  authToken: string | null;
  authView: AuthView;
  setAuthView: (view: AuthView, resetTokenParam?: string) => void;
  resetTokenParam?: string;
  showOnboardingModal: boolean;
  setShowOnboardingModal: (show: boolean) => void;
  showUserProfileModal: boolean;
  setShowUserProfileModal: (show: boolean) => void;
  showOrgSettingsModal: boolean;
  setShowOrgSettingsModal: (show: boolean) => void;
  showUserManagementModal: boolean;
  setShowUserManagementModal: (show: boolean) => void;
  tempMfaToken: string | null;
  tempMfaUserEmail?: string;
  tempMfaMethod?: MfaMethod;
  tempMfaSetupRequired?: boolean;
  completeMfaLogin: (user: User, tenant: OrganizationTenant, token: string) => void;

  // Authentication Actions
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  register: (formData: any) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; message: string; resetToken?: string }>;
  resetPassword: (token: string, newPassword: string, confirmPassword?: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  completeOnboarding: (data: any) => Promise<void>;
  updateUserProfile: (data: any) => Promise<{ success: boolean; error?: string }>;
  updateTenantProfile: (data: any) => Promise<{ success: boolean; error?: string }>;
  provisionUser: (userData: any) => Promise<{ success: boolean; error?: string; user?: User }>;
  updateUserRoleAndStatus: (userId: string, role: UserRole, status?: 'Active' | 'Locked' | 'Disabled', departmentId?: string, jobTitle?: string) => Promise<{ success: boolean; error?: string }>;
  rbacState: RbacMatrixState;
  saveRbacMatrix: (matrix: RbacMatrixPermissions, capabilities?: RbacCapabilityItem[]) => Promise<{ success: boolean; error?: string }>;
  resetRbacMatrix: () => Promise<{ success: boolean; error?: string }>;
  checkUserCapability: (capabilityId: string, role?: UserRole) => CapabilityAccessLevel;

  // Module State & UI
  activeModule: ModuleView;
  setActiveModule: (module: ModuleView) => void;
  superAdminTab: string;
  setSuperAdminTab: (tab: string) => void;
  currentUser: User;
  setCurrentUser: (user: User) => void;
  allUsers: User[];
  currentTenant: OrganizationTenant;
  setCurrentTenant: (tenant: OrganizationTenant) => void;
  allTenants: OrganizationTenant[];
  departments: Department[];
  locations: Location[];
  ciClasses: CIClass[];
  configurationItems: ConfigurationItem[];
  ciRelationships: CIRelationship[];
  discoveryJobs: DiscoveryScanJob[];
  endpointAgents: EndpointAgent[];
  softwareCatalog: SoftwareCatalogItem[];
  driftEvents: DriftEvent[];
  stockrooms: Stockroom[];
  softwareLicenses: SoftwareLicense[];
  vendors: Vendor[];
  contracts: Contract[];
  purchaseOrders: PurchaseOrder[];
  costCenters: CostCenter[];
  depreciationSchedules: DepreciationSchedule[];
  disposalRecords: DisposalRecord[];
  itsmTickets: ItsmTicket[];
  workflowDefinitions: WorkflowDefinition[];
  workflowInstances: WorkflowInstance[];
  selfServiceRequests: SelfServiceRequest[];
  vulnerabilities: VulnerabilityCVE[];
  policyRules: PolicyRule[];
  policyViolations: PolicyViolation[];
  auditLogs: AuditLogEntry[];
  aiChatHistory: AiChatMessage[];
  
  // UI Controls
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isAiDrawerOpen: boolean;
  setIsAiDrawerOpen: (open: boolean) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;

  // Actions
  addConfigurationItem: (ci: Omit<ConfigurationItem, 'id' | 'healthScore' | 'riskScore' | 'lastDiscovered'>) => ConfigurationItem;
  bulkAddConfigurationItems: (cis: Omit<ConfigurationItem, 'id' | 'healthScore' | 'riskScore' | 'lastDiscovered'>[]) => ConfigurationItem[];
  updateConfigurationItem: (id: string, updates: Partial<ConfigurationItem>) => void;
  deleteConfigurationItem: (id: string) => void;
  addRelationship: (rel: Omit<CIRelationship, 'id' | 'createdAt' | 'updatedAt'>) => void;
  deleteRelationship: (id: string) => void;
  addDiscoveryJob: (job: Omit<DiscoveryScanJob, 'id' | 'status' | 'itemsDiscovered' | 'lastRun' | 'credentialsRef' | 'logs'>) => DiscoveryScanJob;
  runDiscoveryScanJob: (jobId: string) => void;
  assignAssetToUser: (ciId: string, userId: string) => void;
  checkOutAsset: (ciId: string, userId: string, notes?: string) => void;
  checkInAsset: (ciId: string, condition: string, notes?: string) => void;
  transferAsset: (ciId: string, toUserId: string, notes?: string) => void;
  disposeAsset: (disposal: Omit<DisposalRecord, 'id' | 'certificateNumber'>) => void;
  updateLicenseCount: (licId: string, newPurchased: number) => void;
  approveWorkflowStep: (instanceId: string) => void;
  rejectWorkflowStep: (instanceId: string, reason?: string) => void;
  addWorkflowDefinition: (def: Omit<WorkflowDefinition, 'id'>) => void;
  toggleWorkflowDefinition: (id: string) => void;
  createWorkflowInstance: (workflowId: string, entityType: WorkflowInstance['entityType'], entityName: string) => void;
  addPolicyRule: (rule: Omit<PolicyRule, 'id' | 'violationsCount'>) => void;
  togglePolicyRule: (id: string) => void;
  resolvePolicyViolation: (id: string, notes?: string) => void;
  waivePolicyViolation: (id: string, rationale?: string) => void;
  evaluatePolicyRules: () => void;
  addAuditEntry: (action: AuditLogEntry['action'], entityType: string, entityId: string, entityName: string, changes?: { field: string; oldVal: string; newVal: string }[]) => void;
  sendAiMessage: (prompt: string) => Promise<void>;
  createSelfServiceRequest: (req: Omit<SelfServiceRequest, 'id' | 'requestNumber' | 'createdAt' | 'status'>) => void;
  updateSelfServiceStatus: (id: string, status: SelfServiceRequest['status']) => void;
  cancelSelfServiceRequest: (id: string) => void;
  clearAllDemoData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authStatus, setAuthStatus] = useState<'loading' | 'unauthenticated' | 'authenticated'>('loading');
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [authView, setAuthViewInternal] = useState<AuthView>('landing');
  const [resetTokenParam, setResetTokenParam] = useState<string | undefined>(undefined);
  const [showOnboardingModal, setShowOnboardingModal] = useState<boolean>(false);
  const [showUserProfileModal, setShowUserProfileModal] = useState<boolean>(false);
  const [showOrgSettingsModal, setShowOrgSettingsModal] = useState<boolean>(false);
  const [showUserManagementModal, setShowUserManagementModal] = useState<boolean>(false);

  // MFA Temporary State
  const [tempMfaToken, setTempMfaToken] = useState<string | null>(null);
  const [tempMfaUserEmail, setTempMfaUserEmail] = useState<string | undefined>(undefined);
  const [tempMfaMethod, setTempMfaMethod] = useState<MfaMethod | undefined>(undefined);
  const [tempMfaSetupRequired, setTempMfaSetupRequired] = useState<boolean>(false);
  const [pendingOnboardingAfterMfa, setPendingOnboardingAfterMfa] = useState<boolean>(false);

  // App Module & Data State
  const [activeModule, setActiveModuleState] = useState<ModuleView>('dashboard');
  const [superAdminTab, setSuperAdminTab] = useState<string>('overview');
  const [currentUser, setCurrentUser] = useState<User>(initialUsers[0]);
  const [allUsers, setAllUsers] = useState<User[]>(initialUsers);
  const [currentTenant, setCurrentTenant] = useState<OrganizationTenant>(initialTenant);
  const [allTenants, setAllTenants] = useState<OrganizationTenant[]>(initialTenants);
  const [departments] = useState<Department[]>(initialDepartments);
  const [locations] = useState<Location[]>(initialLocations);
  const [ciClasses] = useState<CIClass[]>(initialCiClasses);

  const [configurationItems, setConfigurationItems] = useState<ConfigurationItem[]>(() => {
    try {
      const saved = localStorage.getItem('kspl_cmdb_cis');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Filter out any obsolete demo items if present in browser storage
        if (Array.isArray(parsed) && parsed.some(ci => ci.id === 'ci-srv-101' || ci.id === 'TAG-SRV-9012')) {
          localStorage.removeItem('kspl_cmdb_cis');
          return initialCis;
        }
        return parsed;
      }
    } catch (e) {
      // Ignore
    }
    return initialCis;
  });

  const [ciRelationships, setCiRelationships] = useState<CIRelationship[]>(() => {
    try {
      const saved = localStorage.getItem('kspl_cmdb_relationships');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.some(r => r.id === 'rel-1' || r.id === 'e1')) {
          localStorage.removeItem('kspl_cmdb_relationships');
          return initialRelationships;
        }
        return parsed;
      }
    } catch (e) {
      // Ignore
    }
    return initialRelationships;
  });

  const [discoveryJobs, setDiscoveryJobs] = useState<DiscoveryScanJob[]>(initialDiscoveryJobs);
  const [endpointAgents] = useState<EndpointAgent[]>(initialEndpointAgents);
  const [softwareCatalog] = useState<SoftwareCatalogItem[]>(initialSoftwareCatalog);
  const [driftEvents] = useState<DriftEvent[]>(initialDriftEvents);
  const [stockrooms] = useState<Stockroom[]>(initialStockrooms);
  const [softwareLicenses, setSoftwareLicenses] = useState<SoftwareLicense[]>(initialSoftwareLicenses);
  const [vendors] = useState<Vendor[]>(initialVendors);
  const [contracts] = useState<Contract[]>(initialContracts);
  const [purchaseOrders] = useState<PurchaseOrder[]>(initialPurchaseOrders);
  const [costCenters] = useState<CostCenter[]>(initialCostCenters);
  const [depreciationSchedules] = useState<DepreciationSchedule[]>(initialDepreciations);
  const [disposalRecords, setDisposalRecords] = useState<DisposalRecord[]>(initialDisposals);
  const [itsmTickets] = useState<ItsmTicket[]>(initialItsmTickets);
  const [workflowDefinitions, setWorkflowDefinitions] = useState<WorkflowDefinition[]>(initialWorkflowDefs);
  const [workflowInstances, setWorkflowInstances] = useState<WorkflowInstance[]>(initialWorkflowInstances);
  const [selfServiceRequests, setSelfServiceRequests] = useState<SelfServiceRequest[]>(initialSelfServiceRequests);
  const [vulnerabilities] = useState<VulnerabilityCVE[]>(initialVulnerabilities);
  const [policyRules, setPolicyRules] = useState<PolicyRule[]>(initialPolicyRules);
  const [policyViolations, setPolicyViolations] = useState<PolicyViolation[]>(initialPolicyViolations);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(initialAuditLogs);

  const [searchQuery, setSearchQuery] = useState('');
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const setAuthView = (view: AuthView, tokenParam?: string) => {
    setAuthViewInternal(view);
    if (tokenParam) {
      setResetTokenParam(tokenParam);
    }
  };

  const setActiveModule = (moduleView: ModuleView) => {
    if (!isAuthenticated) {
      setAuthViewInternal('login');
      return;
    }
    if (moduleView === 'super_admin' && currentUser?.role !== 'SOFTWARE_SUPER_ADMIN') {
      setActiveModuleState('dashboard');
      localStorage.setItem('kspl_active_module', 'dashboard');
      return;
    }
    setActiveModuleState(moduleView);
    localStorage.setItem('kspl_active_module', moduleView);
  };

  // Sync and load data with Firestore database and localStorage on app mount
  useEffect(() => {
    const syncFirestoreState = async () => {
      try {
        await initializeFirestoreDatabase();

        const [loadedCis, loadedRels, loadedLicenses, loadedLogs, loadedRequests, loadedJobs] = await Promise.all([
          loadRecordsFromFirestore<ConfigurationItem>(COLLECTIONS.CONFIGURATION_ITEMS),
          loadRecordsFromFirestore<CIRelationship>(COLLECTIONS.CI_RELATIONSHIPS),
          loadRecordsFromFirestore<SoftwareLicense>(COLLECTIONS.SOFTWARE_LICENSES),
          loadRecordsFromFirestore<AuditLogEntry>(COLLECTIONS.AUDIT_LOGS),
          loadRecordsFromFirestore<SelfServiceRequest>(COLLECTIONS.SELF_SERVICE_REQUESTS),
          loadRecordsFromFirestore<DiscoveryScanJob>(COLLECTIONS.DISCOVERY_JOBS),
        ]);

        if (loadedCis && loadedCis.length > 0) {
          setConfigurationItems(loadedCis);
          localStorage.setItem('kspl_cmdb_cis', JSON.stringify(loadedCis));
        }
        if (loadedRels && loadedRels.length > 0) {
          setCiRelationships(loadedRels);
          localStorage.setItem('kspl_cmdb_relationships', JSON.stringify(loadedRels));
        }
        if (loadedLicenses && loadedLicenses.length > 0) setSoftwareLicenses(loadedLicenses);
        if (loadedLogs && loadedLogs.length > 0) setAuditLogs(loadedLogs);
        if (loadedRequests && loadedRequests.length > 0) setSelfServiceRequests(loadedRequests);
        if (loadedJobs && loadedJobs.length > 0) setDiscoveryJobs(loadedJobs);
      } catch (err) {
        console.error('Failed syncing state with Firestore database:', err);
      }
    };

    syncFirestoreState();
  }, []);

  // Verify stored session on app load
  React.useEffect(() => {
    const verifyStoredSession = async () => {
      const storedToken = localStorage.getItem('kspl_auth_token');
      if (!storedToken) {
        setIsAuthenticated(false);
        setAuthStatus('unauthenticated');
        setAuthViewInternal('landing');
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });
        const data = await res.json();
        if (data.authenticated && data.user) {
          setAuthToken(storedToken);
          setCurrentUser(data.user);
          if (data.tenant) setCurrentTenant(data.tenant);
          setIsAuthenticated(true);
          setAuthStatus('authenticated');
          setAuthViewInternal('app');

          // Restore last active module session
          const savedModule = localStorage.getItem('kspl_active_module') as ModuleView;
          if (savedModule) {
            if (savedModule === 'super_admin' && data.user.role !== 'SOFTWARE_SUPER_ADMIN') {
              setActiveModuleState('dashboard');
              localStorage.setItem('kspl_active_module', 'dashboard');
            } else {
              setActiveModuleState(savedModule);
            }
          } else {
            setActiveModuleState(data.user.role === 'SOFTWARE_SUPER_ADMIN' ? 'super_admin' : 'dashboard');
          }
        } else {
          localStorage.removeItem('kspl_auth_token');
          localStorage.removeItem('kspl_active_module');
          setIsAuthenticated(false);
          setAuthStatus('unauthenticated');
          setAuthViewInternal('landing');
        }
      } catch (err) {
        // Fallback to unauthenticated on error
        localStorage.removeItem('kspl_auth_token');
        localStorage.removeItem('kspl_active_module');
        setIsAuthenticated(false);
        setAuthStatus('unauthenticated');
        setAuthViewInternal('landing');
      }
    };

    verifyStoredSession();
  }, []);

  // Authentication Handlers
  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rememberMe }),
      });
      let data: any = {};
      try {
        const text = await res.text();
        data = JSON.parse(text);
      } catch (e) {
        return { success: false, error: `Server connection error (${res.status} ${res.statusText}). Check api.php and database settings.` };
      }
      if (!res.ok || (data.success === false && data.error)) {
        return { success: false, error: data.error || data.message || 'Authentication failed.' };
      }

      // Check if MFA verification step is required
      if (data.mfaRequired && data.tempToken) {
        setTempMfaToken(data.tempToken);
        setTempMfaUserEmail(data.user?.email);
        setTempMfaMethod(data.mfaMethod || 'google_authenticator');
        setTempMfaSetupRequired(!!data.mfaSetupRequired);
        setAuthViewInternal('mfa_verification');
        return { success: true };
      }

      if (data.token) {
        localStorage.setItem('kspl_auth_token', data.token);
        setAuthToken(data.token);
      }
      if (data.user) setCurrentUser(data.user);
      if (data.tenant) setCurrentTenant(data.tenant);

      setIsAuthenticated(true);
      setAuthStatus('authenticated');
      setAuthViewInternal('app');
      
      if (data.user?.role === 'SOFTWARE_SUPER_ADMIN') {
        setActiveModuleState('super_admin');
      } else {
        setActiveModuleState('dashboard');
      }

      addAuditEntry('LOGIN', 'User', data.user?.id || 'usr-login', data.user?.name || email);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Network error during sign in.' };
    }
  };

  const completeMfaLogin = (user: User, tenant: OrganizationTenant, token: string) => {
    localStorage.setItem('kspl_auth_token', token);
    setAuthToken(token);
    setCurrentUser(user);
    setCurrentTenant(tenant);
    setTempMfaToken(null);
    setIsAuthenticated(true);
    setAuthStatus('authenticated');
    setAuthViewInternal('app');

    if (user.role === 'SOFTWARE_SUPER_ADMIN') {
      setActiveModuleState('super_admin');
    } else {
      setActiveModuleState('dashboard');
    }

    if (pendingOnboardingAfterMfa) {
      setShowOnboardingModal(true);
      setPendingOnboardingAfterMfa(false);
    }

    addAuditEntry('LOGIN_MFA', 'User', user.id, user.name);
  };

  const register = async (formData: any) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      let data: any = {};
      try {
        const text = await res.text();
        data = JSON.parse(text);
      } catch (e) {
        return { success: false, error: `Server connection error (${res.status} ${res.statusText}). Check api.php and database settings.` };
      }
      if (!res.ok || (data.success === false && data.error)) {
        return { success: false, error: data.error || data.message || 'Registration failed.' };
      }

      // Check if MFA setup is required (mandatory for all new registered users)
      if (data.mfaRequired && data.tempToken) {
        setTempMfaToken(data.tempToken);
        setTempMfaUserEmail(data.user?.email);
        setTempMfaMethod(data.mfaMethod || 'google_authenticator');
        setTempMfaSetupRequired(true);
        if (data.tenant) {
          setAllTenants((prev) => [data.tenant, ...prev]);
        }
        setPendingOnboardingAfterMfa(true);
        setAuthViewInternal('mfa_verification');
        return { success: true };
      }

      if (data.token) {
        localStorage.setItem('kspl_auth_token', data.token);
        setAuthToken(data.token);
      }
      if (data.user) setCurrentUser(data.user);
      if (data.tenant) {
        setCurrentTenant(data.tenant);
        setAllTenants((prev) => [data.tenant, ...prev]);
      }

      setIsAuthenticated(true);
      setAuthStatus('authenticated');
      setAuthViewInternal('app');
      setShowOnboardingModal(true);
      setActiveModuleState('dashboard');

      addAuditEntry('CREATE', 'OrganizationTenant', data.tenant?.id || 'tenant-new', data.tenant?.name || 'New Organization');
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Network error during organization creation.' };
    }
  };

  const logout = async () => {
    try {
      if (authToken) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ token: authToken }),
        });
      }
    } catch (err) {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('kspl_auth_token');
      localStorage.removeItem('kspl_active_module');
      setAuthToken(null);
      setIsAuthenticated(false);
      setAuthStatus('unauthenticated');
      setAuthViewInternal('landing');
    }
  };

  const requestPasswordReset = async (email: string) => {
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, message: 'Failed to send password reset request.' };
    }
  };

  const resetPassword = async (token: string, newPassword: string, confirmPassword?: string) => {
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword, confirmPassword }),
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: 'Network error during password reset.' };
    }
  };

  const completeOnboarding = async (data: any) => {
    try {
      await fetch('/api/auth/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          tenantId: currentTenant.id,
          ...data,
        }),
      });
      if (data.companyName) {
        setCurrentTenant((prev) => ({ ...prev, name: data.companyName }));
      }
    } catch (err) {
      // Non-blocking
    } finally {
      setShowOnboardingModal(false);
    }
  };

  const updateUserProfile = async (data: any) => {
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          ...data,
        }),
      });
      const result = await res.json();
      if (result.success && result.user) {
        setCurrentUser(result.user);
        return { success: true };
      }
      return { success: false, error: result.error || 'Failed to update user profile.' };
    } catch (err: any) {
      return { success: false, error: 'Network error.' };
    }
  };

  const updateTenantProfile = async (data: any) => {
    try {
      const res = await fetch('/api/auth/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          tenantId: currentTenant.id,
          ...data,
        }),
      });
      const result = await res.json();
      if (result.success && result.tenant) {
        setCurrentTenant(result.tenant);
        return { success: true };
      }
      return { success: false, error: 'Failed to update tenant.' };
    } catch (err: any) {
      return { success: false, error: 'Network error.' };
    }
  };

  const provisionUser = async (userData: any): Promise<{ success: boolean; error?: string; user?: User }> => {
    try {
      const res = await fetch('/api/users/provision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...userData,
          tenantId: userData.tenantId || currentTenant.id,
        }),
      });
      const result = await res.json();
      if (result.success && result.user) {
        setAllUsers((prev) => {
          const exists = prev.some((u) => u.id === result.user.id);
          if (exists) return prev.map((u) => (u.id === result.user.id ? result.user : u));
          return [...prev, result.user];
        });
        return { success: true, user: result.user };
      }
      return { success: false, error: result.error || 'Failed to provision user.' };
    } catch (err: any) {
      return { success: false, error: 'Network error while provisioning user.' };
    }
  };

  const updateUserRoleAndStatus = async (
    userId: string,
    role: UserRole,
    status?: 'Active' | 'Locked' | 'Disabled',
    departmentId?: string,
    jobTitle?: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`/api/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, status, departmentId, jobTitle }),
      });
      const result = await res.json();
      if (result.success && result.user) {
        setAllUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, ...result.user } : u)));
        if (currentUser.id === userId) {
          setCurrentUser((prev) => ({ ...prev, ...result.user }));
        }
        return { success: true };
      }
      return { success: false, error: result.error || 'Failed to update user role.' };
    } catch (err: any) {
      return { success: false, error: 'Network error updating user role.' };
    }
  };

  // Dynamic RBAC Permission Matrix State
  const [rbacState, setRbacState] = useState<RbacMatrixState>({
    tenantId: currentTenant?.id || 'tenant-client-1',
    capabilities: [
      {
        id: 'multiTenantGovernance',
        name: 'Multi-Tenant Global Governance',
        category: 'Administration',
        description: 'Manage cross-tenant isolation, enterprise data boundaries, and global system configurations.',
      },
      {
        id: 'userProvisioning',
        name: 'User Provisioning & Role Assignment',
        category: 'Identity & Access',
        description: 'Create user credentials, assign functional RBAC roles, and manage active status.',
      },
      {
        id: 'cmdbManage',
        name: 'CMDB Assets & Topology Editor',
        category: 'ITAM & CMDB',
        description: 'Create, update, and manage Configuration Items (CIs), relationships, and discovery assets.',
      },
      {
        id: 'reconciliationEngine',
        name: 'Reconciliation Rules & Drift Engine',
        category: 'ITAM & CMDB',
        description: 'Configure multi-source reconciliation priority rules, identification criteria, and drift thresholds.',
      },
      {
        id: 'softwareLicensesElp',
        name: 'Software Licenses & ELP Calculation',
        category: 'Software Asset Management',
        description: 'Manage publisher contracts, license entitlements, installation compliance, and Effective License Position.',
      },
      {
        id: 'contractsFinancials',
        name: 'Contracts, POs & Depreciation',
        category: 'Finance & Procurement',
        description: 'Author purchase orders, vendor warranties, MACRS/straight-line depreciation, and financial ledgers.',
      },
      {
        id: 'cveSecurity',
        name: 'CVE Vulnerabilities & Compliance Rules',
        category: 'SecOps & Compliance',
        description: 'Inspect CVE severity feeds, patch tracking, security SLAs, and compliance benchmarks.',
      },
      {
        id: 'hardwareWipeCertificates',
        name: 'Hardware Disposal & Wipe Certificates',
        category: 'Asset Lifecycle',
        description: 'Authorize hardware decommissioning, asset disposition, and cryptographic NIST 800-88 certificates.',
      },
      {
        id: 'selfServiceCatalog',
        name: 'Self-Service Catalog & Requests',
        category: 'Employee Portal',
        description: 'Browse approved hardware/software catalog, raise equipment requests, and view assigned items.',
      },
      {
        id: 'mfaResetAuthorization',
        name: 'MFA Reset Queue Authorization',
        category: 'Identity & Access',
        description: 'Review and approve/reject emergency multi-factor authenticator reset tickets.',
      },
      {
        id: 'auditLogExport',
        name: 'System Audit Log & Compliance Export',
        category: 'SecOps & Compliance',
        description: 'Export immutable tamper-proof system logs, user access traces, and compliance reports.',
      },
      {
        id: 'apiTokenManagement',
        name: 'REST API & Webhook Integrations',
        category: 'Administration',
        description: 'Generate developer API keys, configure webhooks, and manage enterprise integration connectors.',
      },
    ],
    matrix: {
      multiTenantGovernance: {
        SOFTWARE_SUPER_ADMIN: 'AUTHORIZED',
        CLIENT_ADMIN: 'DENIED',
        'ITAM Admin': 'DENIED',
        'CMDB Admin': 'DENIED',
        Security: 'DENIED',
        Finance: 'DENIED',
        Employee: 'DENIED',
      },
      userProvisioning: {
        SOFTWARE_SUPER_ADMIN: 'AUTHORIZED',
        CLIENT_ADMIN: 'AUTHORIZED',
        'ITAM Admin': 'DENIED',
        'CMDB Admin': 'DENIED',
        Security: 'DENIED',
        Finance: 'DENIED',
        Employee: 'DENIED',
      },
      cmdbManage: {
        SOFTWARE_SUPER_ADMIN: 'AUTHORIZED',
        CLIENT_ADMIN: 'AUTHORIZED',
        'ITAM Admin': 'AUTHORIZED',
        'CMDB Admin': 'AUTHORIZED',
        Security: 'READ_ONLY',
        Finance: 'READ_ONLY',
        Employee: 'DENIED',
      },
      reconciliationEngine: {
        SOFTWARE_SUPER_ADMIN: 'AUTHORIZED',
        CLIENT_ADMIN: 'AUTHORIZED',
        'ITAM Admin': 'READ_ONLY',
        'CMDB Admin': 'AUTHORIZED',
        Security: 'READ_ONLY',
        Finance: 'DENIED',
        Employee: 'DENIED',
      },
      softwareLicensesElp: {
        SOFTWARE_SUPER_ADMIN: 'AUTHORIZED',
        CLIENT_ADMIN: 'AUTHORIZED',
        'ITAM Admin': 'AUTHORIZED',
        'CMDB Admin': 'READ_ONLY',
        Security: 'READ_ONLY',
        Finance: 'READ_ONLY',
        Employee: 'DENIED',
      },
      contractsFinancials: {
        SOFTWARE_SUPER_ADMIN: 'AUTHORIZED',
        CLIENT_ADMIN: 'AUTHORIZED',
        'ITAM Admin': 'READ_ONLY',
        'CMDB Admin': 'DENIED',
        Security: 'DENIED',
        Finance: 'AUTHORIZED',
        Employee: 'DENIED',
      },
      cveSecurity: {
        SOFTWARE_SUPER_ADMIN: 'AUTHORIZED',
        CLIENT_ADMIN: 'AUTHORIZED',
        'ITAM Admin': 'READ_ONLY',
        'CMDB Admin': 'READ_ONLY',
        Security: 'AUTHORIZED',
        Finance: 'DENIED',
        Employee: 'DENIED',
      },
      hardwareWipeCertificates: {
        SOFTWARE_SUPER_ADMIN: 'AUTHORIZED',
        CLIENT_ADMIN: 'AUTHORIZED',
        'ITAM Admin': 'AUTHORIZED',
        'CMDB Admin': 'DENIED',
        Security: 'AUTHORIZED',
        Finance: 'READ_ONLY',
        Employee: 'DENIED',
      },
      selfServiceCatalog: {
        SOFTWARE_SUPER_ADMIN: 'AUTHORIZED',
        CLIENT_ADMIN: 'AUTHORIZED',
        'ITAM Admin': 'AUTHORIZED',
        'CMDB Admin': 'AUTHORIZED',
        Security: 'AUTHORIZED',
        Finance: 'AUTHORIZED',
        Employee: 'AUTHORIZED',
      },
      mfaResetAuthorization: {
        SOFTWARE_SUPER_ADMIN: 'AUTHORIZED',
        CLIENT_ADMIN: 'AUTHORIZED',
        'ITAM Admin': 'DENIED',
        'CMDB Admin': 'DENIED',
        Security: 'DENIED',
        Finance: 'DENIED',
        Employee: 'DENIED',
      },
      auditLogExport: {
        SOFTWARE_SUPER_ADMIN: 'AUTHORIZED',
        CLIENT_ADMIN: 'AUTHORIZED',
        'ITAM Admin': 'READ_ONLY',
        'CMDB Admin': 'READ_ONLY',
        Security: 'AUTHORIZED',
        Finance: 'READ_ONLY',
        Employee: 'DENIED',
      },
      apiTokenManagement: {
        SOFTWARE_SUPER_ADMIN: 'AUTHORIZED',
        CLIENT_ADMIN: 'AUTHORIZED',
        'ITAM Admin': 'DENIED',
        'CMDB Admin': 'AUTHORIZED',
        Security: 'READ_ONLY',
        Finance: 'DENIED',
        Employee: 'DENIED',
      },
    },
    lastUpdated: new Date().toISOString(),
    updatedBy: 'System Default Configuration',
  });

  // Fetch RBAC Matrix from Server on mount or tenant switch
  useEffect(() => {
    const fetchMatrix = async () => {
      try {
        const tenantId = currentTenant?.id || 'tenant-client-1';
        const res = await fetch(`/api/rbac/matrix?tenantId=${tenantId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data) {
            setRbacState(data.data);
          }
        }
      } catch (err) {
        // keep fallback state
      }
    };
    fetchMatrix();
  }, [currentTenant?.id]);

  const saveRbacMatrix = async (matrix: RbacMatrixPermissions, capabilities?: RbacCapabilityItem[]) => {
    try {
      const tenantId = currentTenant?.id || 'tenant-client-1';
      const res = await fetch('/api/rbac/matrix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          matrix,
          capabilities,
          updatedBy: `${currentUser.name} (${currentUser.role})`,
        }),
      });
      const result = await res.json();
      if (result.success && result.data) {
        setRbacState(result.data);
        addAuditEntry(
          'UPDATE',
          'RBAC_MATRIX',
          tenantId,
          'Dynamic RBAC Matrix Configuration',
          [{ field: 'policy', oldVal: 'Previous Policy', newVal: 'Updated Policy' }]
        );
        return { success: true };
      }
      return { success: false, error: result.error || 'Failed to save RBAC matrix.' };
    } catch (err: any) {
      return { success: false, error: 'Network error saving RBAC matrix.' };
    }
  };

  const resetRbacMatrix = async () => {
    try {
      const tenantId = currentTenant?.id || 'tenant-client-1';
      const res = await fetch('/api/rbac/matrix/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId }),
      });
      const result = await res.json();
      if (result.success && result.data) {
        setRbacState(result.data);
        addAuditEntry(
          'UPDATE',
          'RBAC_MATRIX',
          tenantId,
          'RBAC Matrix Reset to Default Baseline',
          [{ field: 'policy', oldVal: 'Custom Policy', newVal: 'System Baseline Default' }]
        );
        return { success: true };
      }
      return { success: false, error: 'Failed to reset RBAC matrix.' };
    } catch (err: any) {
      return { success: false, error: 'Network error resetting RBAC matrix.' };
    }
  };

  const checkUserCapability = (capabilityId: string, role?: UserRole): CapabilityAccessLevel => {
    const targetRole = role || currentUser.role;
    let roleKey = targetRole as string;
    if (roleKey === 'Software Super Admin' || roleKey === 'SOFTWARE_SUPER_ADMIN' || roleKey === 'Super Admin') {
      roleKey = 'SOFTWARE_SUPER_ADMIN';
    } else if (roleKey === 'Client Admin' || roleKey === 'CLIENT_ADMIN' || roleKey === 'CLIENT_SUPER_ADMIN') {
      roleKey = 'CLIENT_ADMIN';
    }

    const capabilityPermissions = rbacState.matrix[capabilityId];
    if (!capabilityPermissions) return 'DENIED';
    return capabilityPermissions[roleKey] || 'DENIED';
  };

  const [aiChatHistory, setAiChatHistory] = useState<AiChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'copilot',
      text: 'Greetings. I am KSPL Copilot. I can query CMDB relationships, perform blast-radius impact analysis, check software license ELP compliance, or audit risk factors. How may I assist you today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedActions: [
        { label: 'Check Under-Licensed Software', actionType: 'CHECK_LICENSES' },
        { label: 'Analyze Blast Radius for prod-app-node-02', actionType: 'IMPACT_ANALYSIS' },
        { label: 'Show Critical Vulnerabilities', actionType: 'CRITICAL_VULNS' },
      ],
    },
  ]);

  const addAuditEntry = (
    action: AuditLogEntry['action'],
    entityType: string,
    entityId: string,
    entityName: string,
    changes?: { field: string; oldVal: string; newVal: string }[]
  ) => {
    const newEntry: AuditLogEntry = {
      id: `aud-${Date.now()}`,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      action,
      entityType,
      entityId,
      entityName,
      fieldChanges: changes,
      ipAddress: '10.100.12.99',
      tenantId: currentTenant.id,
    };
    setAuditLogs((prev) => [newEntry, ...prev]);
    saveRecordToFirestore(COLLECTIONS.AUDIT_LOGS, newEntry);
  };

  const addConfigurationItem = (ci: Omit<ConfigurationItem, 'id' | 'healthScore' | 'riskScore' | 'lastDiscovered'>) => {
    const newId = `ci-gen-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newCi: ConfigurationItem = {
      ...ci,
      id: newId,
      healthScore: 95,
      riskScore: 10,
      lastDiscovered: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    setConfigurationItems((prev) => {
      const updated = [newCi, ...prev];
      localStorage.setItem('kspl_cmdb_cis', JSON.stringify(updated));
      return updated;
    });
    saveRecordToFirestore(COLLECTIONS.CONFIGURATION_ITEMS, newCi);

    fetch('/api/cmdb/cis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCi),
    }).catch(() => {});

    addAuditEntry('CREATE', 'ConfigurationItem', newId, newCi.name);
    return newCi;
  };

  const bulkAddConfigurationItems = (items: Omit<ConfigurationItem, 'id' | 'healthScore' | 'riskScore' | 'lastDiscovered'>[]) => {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const createdItems: ConfigurationItem[] = items.map((ci, index) => ({
      ...ci,
      id: `ci-bulk-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 4)}`,
      healthScore: 95,
      riskScore: 10,
      lastDiscovered: now,
    }));

    setConfigurationItems((prev) => {
      const updated = [...createdItems, ...prev];
      localStorage.setItem('kspl_cmdb_cis', JSON.stringify(updated));
      return updated;
    });
    createdItems.forEach((ciItem) => {
      saveRecordToFirestore(COLLECTIONS.CONFIGURATION_ITEMS, ciItem);
      fetch('/api/cmdb/cis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ciItem),
      }).catch(() => {});
    });

    addAuditEntry(
      'CREATE',
      'ConfigurationItem',
      `bulk-${Date.now()}`,
      `Bulk CSV Import (${createdItems.length} items)`
    );
    return createdItems;
  };

  const updateConfigurationItem = (id: string, updates: Partial<ConfigurationItem>) => {
    setConfigurationItems((prev) => {
      const updatedList = prev.map((item) => {
        if (item.id === id) {
          const updated = { ...item, ...updates };
          saveRecordToFirestore(COLLECTIONS.CONFIGURATION_ITEMS, updated);
          fetch('/api/cmdb/cis', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updated),
          }).catch(() => {});
          addAuditEntry('UPDATE', 'ConfigurationItem', id, updated.name);
          return updated;
        }
        return item;
      });
      localStorage.setItem('kspl_cmdb_cis', JSON.stringify(updatedList));
      return updatedList;
    });
  };

  const deleteConfigurationItem = (id: string) => {
    const target = configurationItems.find((ci) => ci.id === id);
    if (target) {
      const connectedRels = ciRelationships.filter((r) => r.sourceCiId === id || r.targetCiId === id);

      setConfigurationItems((prev) => {
        const updated = prev.filter((ci) => ci.id !== id);
        localStorage.setItem('kspl_cmdb_cis', JSON.stringify(updated));
        return updated;
      });

      setCiRelationships((prev) => {
        const updatedRels = prev.filter((r) => r.sourceCiId !== id && r.targetCiId !== id);
        localStorage.setItem('kspl_cmdb_relationships', JSON.stringify(updatedRels));
        return updatedRels;
      });

      removeRecordFromFirestore(COLLECTIONS.CONFIGURATION_ITEMS, id);
      connectedRels.forEach((r) => removeRecordFromFirestore(COLLECTIONS.CI_RELATIONSHIPS, r.id));

      fetch('/api/cmdb/cis', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      }).catch(() => {});

      addAuditEntry('DELETE', 'ConfigurationItem', id, target.name);
    }
  };

  const addRelationship = (rel: Omit<CIRelationship, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!rel.sourceCiId || !rel.targetCiId) return;
    if (rel.sourceCiId === rel.targetCiId) {
      console.warn('Cannot connect a CI to itself.');
      return;
    }

    // Check duplicate
    const duplicate = ciRelationships.find(
      (r) => r.sourceCiId === rel.sourceCiId && r.targetCiId === rel.targetCiId && r.type === rel.type
    );
    if (duplicate) return;

    const sourceCi = configurationItems.find((c) => c.id === rel.sourceCiId);
    const targetCi = configurationItems.find((c) => c.id === rel.targetCiId);

    const newRel: CIRelationship = {
      ...rel,
      id: `rel-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      sourceCiName: rel.sourceCiName || sourceCi?.name || rel.sourceCiId,
      targetCiName: rel.targetCiName || targetCi?.name || rel.targetCiId,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    setCiRelationships((prev) => {
      const updated = [newRel, ...prev];
      localStorage.setItem('kspl_cmdb_relationships', JSON.stringify(updated));
      return updated;
    });

    saveRecordToFirestore(COLLECTIONS.CI_RELATIONSHIPS, newRel);

    fetch('/api/cmdb/relationships', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRel),
    }).catch(() => {});

    addAuditEntry('CREATE', 'CIRelationship', newRel.id, `${newRel.sourceCiName} -> ${newRel.targetCiName}`);
  };

  const deleteRelationship = (id: string) => {
    const target = ciRelationships.find((r) => r.id === id);
    if (target) {
      setCiRelationships((prev) => {
        const updated = prev.filter((r) => r.id !== id);
        localStorage.setItem('kspl_cmdb_relationships', JSON.stringify(updated));
        return updated;
      });

      removeRecordFromFirestore(COLLECTIONS.CI_RELATIONSHIPS, id);

      fetch('/api/cmdb/relationships', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      }).catch(() => {});

      addAuditEntry('DELETE', 'CIRelationship', id, `${target.sourceCiName} -> ${target.targetCiName}`);
    }
  };

  const clearAllDemoData = async () => {
    setConfigurationItems([]);
    setCiRelationships([]);
    localStorage.setItem('kspl_cmdb_cis', JSON.stringify([]));
    localStorage.setItem('kspl_cmdb_relationships', JSON.stringify([]));

    try {
      const [allCis, allRels] = await Promise.all([
        loadRecordsFromFirestore<ConfigurationItem>(COLLECTIONS.CONFIGURATION_ITEMS),
        loadRecordsFromFirestore<CIRelationship>(COLLECTIONS.CI_RELATIONSHIPS),
      ]);
      await Promise.all([
        ...allCis.map((c) => removeRecordFromFirestore(COLLECTIONS.CONFIGURATION_ITEMS, c.id)),
        ...allRels.map((r) => removeRecordFromFirestore(COLLECTIONS.CI_RELATIONSHIPS, r.id)),
      ]);
    } catch (e) {
      // Ignore cleanup error
    }

    addAuditEntry('DELETE', 'Database', 'all', 'Cleared all demo CIs and relationships.');
  };

  const addDiscoveryJob = (
    job: Omit<DiscoveryScanJob, 'id' | 'status' | 'itemsDiscovered' | 'lastRun' | 'credentialsRef' | 'logs'>
  ): DiscoveryScanJob => {
    const newJob: DiscoveryScanJob = {
      ...job,
      id: `job-${Date.now()}`,
      status: 'Queued',
      itemsDiscovered: 0,
      lastRun: new Date().toISOString().replace('T', ' ').substring(0, 19),
      credentialsRef: 'cred-1',
      logs: [
        `[${new Date().toLocaleTimeString()}] Discovery Job created by ${currentUser.name || 'Admin'}`,
        `[${new Date().toLocaleTimeString()}] Scheduled sweep target: ${job.target} (${job.schedule})`,
      ],
    };
    setDiscoveryJobs((prev) => [newJob, ...prev]);
    saveRecordToFirestore(COLLECTIONS.DISCOVERY_JOBS, newJob);
    addAuditEntry('CREATE', 'DiscoveryScanJob', newJob.id, `Created discovery scan job: ${newJob.name}`);
    return newJob;
  };

  const runDiscoveryScanJob = (jobId: string) => {
    setDiscoveryJobs((prev) =>
      prev.map((job) => {
        if (job.id === jobId) {
          const updated: DiscoveryScanJob = {
            ...job,
            status: 'Completed',
            lastRun: new Date().toISOString().replace('T', ' ').substring(0, 19),
            itemsDiscovered: job.itemsDiscovered + Math.floor(Math.random() * 5) + 1,
            logs: [
              ...job.logs,
              `[${new Date().toLocaleTimeString()}] Manual discovery scan executed by ${currentUser.name}`,
              `[${new Date().toLocaleTimeString()}] Updated target range ${job.target}. Quality score: 98.4%`,
            ],
          };
          saveRecordToFirestore(COLLECTIONS.DISCOVERY_JOBS, updated);
          return updated;
        }
        return job;
      })
    );
    addAuditEntry('DISCOVERY', 'DiscoveryScanJob', jobId, `Scan ${jobId}`);
  };

  const assignAssetToUser = (ciId: string, userId: string) => {
    const targetUser = allUsers.find((u) => u.id === userId);
    if (!targetUser) return;
    updateConfigurationItem(ciId, {
      ownerUserId: targetUser.id,
      ownerUserName: targetUser.name,
      lifecycleState: 'Assigned',
    });
    addAuditEntry('ASSIGN', 'ConfigurationItem', ciId, `Assigned to ${targetUser.name}`);
  };

  const checkOutAsset = (ciId: string, userId: string, notes?: string) => {
    const targetUser = allUsers.find((u) => u.id === userId);
    const targetCi = configurationItems.find((c) => c.id === ciId);
    if (!targetUser || !targetCi) return;
    
    updateConfigurationItem(ciId, {
      ownerUserId: targetUser.id,
      ownerUserName: targetUser.name,
      departmentId: targetUser.departmentId,
      departmentName: departments.find((d) => d.id === targetUser.departmentId)?.name || targetCi.departmentName,
      lifecycleState: 'Assigned',
    });

    addAuditEntry(
      'ASSIGN',
      'ConfigurationItem',
      ciId,
      targetCi.name,
      [{ field: 'ownerUserName', oldVal: targetCi.ownerUserName || 'Unassigned', newVal: targetUser.name }]
    );
  };

  const checkInAsset = (ciId: string, condition: string, notes?: string) => {
    const targetCi = configurationItems.find((c) => c.id === ciId);
    if (!targetCi) return;

    const previousOwner = targetCi.ownerUserName || 'Unassigned';
    const newState = condition === 'Needs Repair' ? 'In Repair' : 'In Stock';

    updateConfigurationItem(ciId, {
      ownerUserId: undefined,
      ownerUserName: undefined,
      lifecycleState: newState,
    });

    addAuditEntry(
      'UNASSIGN',
      'ConfigurationItem',
      ciId,
      targetCi.name,
      [{ field: 'ownerUserName', oldVal: previousOwner, newVal: `Returned (${condition})` }]
    );
  };

  const transferAsset = (ciId: string, toUserId: string, notes?: string) => {
    const targetUser = allUsers.find((u) => u.id === toUserId);
    const targetCi = configurationItems.find((c) => c.id === ciId);
    if (!targetUser || !targetCi) return;

    const oldOwner = targetCi.ownerUserName || 'Unassigned';
    updateConfigurationItem(ciId, {
      ownerUserId: targetUser.id,
      ownerUserName: targetUser.name,
      departmentId: targetUser.departmentId,
      lifecycleState: 'Assigned',
    });

    addAuditEntry(
      'ASSIGN',
      'ConfigurationItem',
      ciId,
      targetCi.name,
      [{ field: 'ownerUserName', oldVal: oldOwner, newVal: targetUser.name }]
    );
  };

  const disposeAsset = (disposal: Omit<DisposalRecord, 'id' | 'certificateNumber'>) => {
    const certNum = `CERT-DISP-${Date.now()}`;
    const newRecord: DisposalRecord = {
      ...disposal,
      id: `disp-${Date.now()}`,
      certificateNumber: certNum,
    };
    setDisposalRecords((prev) => [newRecord, ...prev]);
    updateConfigurationItem(disposal.assetId, { lifecycleState: 'Disposed' });
    addAuditEntry('DELETE', 'DisposalRecord', newRecord.id, `Cert: ${certNum}`);
  };

  const updateLicenseCount = (licId: string, newPurchased: number) => {
    setSoftwareLicenses((prev) =>
      prev.map((lic) => {
        if (lic.id === licId) {
          const gap = newPurchased - lic.consumedEntitlements;
          const status = gap < 0 ? 'Under-Licensed' : gap === 0 ? 'Compliant' : 'Over-Licensed';
          const liability = gap < 0 ? Math.abs(gap) * lic.unitCost : 0;
          return {
            ...lic,
            purchasedEntitlements: newPurchased,
            complianceGap: gap,
            complianceStatus: status,
            financialLiability: liability,
          };
        }
        return lic;
      })
    );
    addAuditEntry('UPDATE', 'SoftwareLicense', licId, `License ${licId} updated to ${newPurchased}`);
  };

  const approveWorkflowStep = (instanceId: string) => {
    setWorkflowInstances((prev) =>
      prev.map((inst) => {
        if (inst.id === instanceId) {
          const nextStep = inst.currentStepNumber + 1;
          const isDone = nextStep > inst.totalSteps;
          return {
            ...inst,
            currentStepNumber: isDone ? inst.totalSteps : nextStep,
            status: isDone ? 'Completed' : 'In Progress',
            updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
          };
        }
        return inst;
      })
    );
    addAuditEntry('APPROVE', 'WorkflowInstance', instanceId, `Step approved by ${currentUser.name}`);
  };

  const rejectWorkflowStep = (instanceId: string, reason?: string) => {
    setWorkflowInstances((prev) =>
      prev.map((inst) => {
        if (inst.id === instanceId) {
          return {
            ...inst,
            status: 'Rejected',
            updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
          };
        }
        return inst;
      })
    );
    addAuditEntry('REJECT', 'WorkflowInstance', instanceId, `Rejected by ${currentUser.name}: ${reason || 'No reason'}`);
  };

  const addWorkflowDefinition = (def: Omit<WorkflowDefinition, 'id'>) => {
    const newDef: WorkflowDefinition = {
      ...def,
      id: `wf-def-${Date.now()}`,
    };
    setWorkflowDefinitions((prev) => [newDef, ...prev]);
    addAuditEntry('CREATE', 'WorkflowDefinition', newDef.id, newDef.name);
  };

  const toggleWorkflowDefinition = (id: string) => {
    setWorkflowDefinitions((prev) =>
      prev.map((wf) => (wf.id === id ? { ...wf, isActive: !wf.isActive } : wf))
    );
  };

  const createWorkflowInstance = (
    workflowId: string,
    entityType: WorkflowInstance['entityType'],
    entityName: string
  ) => {
    const def = workflowDefinitions.find((w) => w.id === workflowId);
    const newInst: WorkflowInstance = {
      id: `wfi-${Date.now()}`,
      workflowId,
      workflowName: def ? def.name : 'Custom Workflow',
      entityType,
      entityName,
      initiatedBy: currentUser.name,
      currentStepNumber: 1,
      totalSteps: def ? def.steps.length : 3,
      status: 'In Progress',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    setWorkflowInstances((prev) => [newInst, ...prev]);
    addAuditEntry('CREATE', 'WorkflowInstance', newInst.id, newInst.workflowName);
  };

  const addPolicyRule = (rule: Omit<PolicyRule, 'id' | 'violationsCount'>) => {
    const newRule: PolicyRule = {
      ...rule,
      id: `pol-${Date.now()}`,
      violationsCount: 0,
    };
    setPolicyRules((prev) => [newRule, ...prev]);
    addAuditEntry('CREATE', 'PolicyRule', newRule.id, newRule.name);
  };

  const togglePolicyRule = (id: string) => {
    setPolicyRules((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isEnabled: !p.isEnabled } : p))
    );
  };

  const resolvePolicyViolation = (id: string, notes?: string) => {
    setPolicyViolations((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status: 'Resolved' } : v))
    );
    addAuditEntry('POLICY_VIOLATION', 'PolicyViolation', id, `Resolved: ${notes || 'Remediated'}`);
  };

  const waivePolicyViolation = (id: string, rationale?: string) => {
    setPolicyViolations((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status: 'Waived' } : v))
    );
    addAuditEntry('POLICY_VIOLATION', 'PolicyViolation', id, `Waived: ${rationale || 'Approved Exception'}`);
  };

  const evaluatePolicyRules = () => {
    // Run live scanner
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const newViolations: PolicyViolation[] = [];

    // Check disk encryption on laptops
    const unencryptedLaptops = configurationItems.filter(
      (ci) => ci.category === 'Hardware' && ci.ciClassId === 'class-laptop' && ci.customAttributes?.diskEncryption === false
    );
    unencryptedLaptops.forEach((ci) => {
      newViolations.push({
        id: `pv-scan-${Date.now()}-${ci.id}`,
        policyRuleId: 'pol-2',
        policyName: 'Mandatory Disk Encryption on Endpoint Laptops',
        ciId: ci.id,
        ciName: ci.name,
        severity: 'High',
        details: `Laptop ${ci.name} (${ci.assetTag}) does not have BitLocker/FileVault disk encryption enabled.`,
        detectedAt: now,
        status: 'Open',
      });
    });

    // Check license deficits
    softwareLicenses.forEach((lic) => {
      if (lic.complianceGap < 0) {
        newViolations.push({
          id: `pv-scan-${Date.now()}-${lic.id}`,
          policyRuleId: 'pol-1',
          policyName: 'Software License Deficit Alert',
          ciId: lic.id,
          ciName: `${lic.publisher} ${lic.productName}`,
          severity: 'Critical',
          details: `License gap of ${lic.complianceGap} seats. Total liability $${lic.financialLiability.toLocaleString()}.`,
          detectedAt: now,
          status: 'Open',
        });
      }
    });

    if (newViolations.length > 0) {
      setPolicyViolations((prev) => [...newViolations, ...prev]);
    }
    addAuditEntry('POLICY_VIOLATION', 'PolicyEngine', 'live-scan', `Executed Policy Rules Scan (${newViolations.length} new violations detected)`);
  };

  const createSelfServiceRequest = (req: Omit<SelfServiceRequest, 'id' | 'requestNumber' | 'createdAt' | 'status'>) => {
    const newReq: SelfServiceRequest = {
      ...req,
      id: `ssr-${Date.now()}`,
      requestNumber: `REQ-SS-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      status: 'Submitted',
    };
    setSelfServiceRequests((prev) => [newReq, ...prev]);
    addAuditEntry('CREATE', 'SelfServiceRequest', newReq.id, newReq.title);
  };

  const updateSelfServiceStatus = (id: string, status: SelfServiceRequest['status']) => {
    setSelfServiceRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
    addAuditEntry('UPDATE', 'SelfServiceRequest', id, `Status set to ${status}`);
  };

  const cancelSelfServiceRequest = (id: string) => {
    setSelfServiceRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'Rejected' } : r))
    );
    addAuditEntry('UPDATE', 'SelfServiceRequest', id, 'Cancelled by user');
  };

  const sendAiMessage = async (promptText: string) => {
    const userMsg: AiChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text: promptText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setAiChatHistory((prev) => [...prev, userMsg]);

    try {
      const safeCis = configurationItems || [];
      const safeLicenses = softwareLicenses || [];
      const safeVulns = vulnerabilities || [];

      const response = await fetch('/api/ai/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          context: {
            ciCount: safeCis.length,
            licenses: safeLicenses,
            vulnerabilities: safeVulns,
            currentUser: currentUser.name,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const copilotMsg: AiChatMessage = {
          id: `msg-copilot-${Date.now()}`,
          sender: 'copilot',
          text: data.reply || 'Analysis complete.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestedActions: data.suggestedActions,
        };
        setAiChatHistory((prev) => [...prev, copilotMsg]);
      } else {
        throw new Error('API request failed');
      }
    } catch (err) {
      const safeCis = configurationItems || [];
      const safeLicenses = softwareLicenses || [];
      const safeVulns = vulnerabilities || [];

      // Offline / Local AI fallback rule evaluation
      let responseText = `I have analyzed your CMDB request for "${promptText}".\n\n`;
      let suggested: { label: string; actionType: string }[] = [];

      if (promptText.toLowerCase().includes('license') || promptText.toLowerCase().includes('under-licensed')) {
        const under = safeLicenses.filter((l) => l.complianceStatus === 'Under-Licensed' || l.complianceStatus === 'Risk Alert');
        responseText += `Found **${under.length} non-compliant software licenses**:\n` +
          under.map((l) => `• **${l.publisher} - ${l.productName}**: ${l.consumedEntitlements} consumed vs ${l.purchasedEntitlements} purchased (Financial Liability: **$${l.financialLiability.toLocaleString()}**)`).join('\n');
        suggested = [{ label: 'True-up Microsoft 365 License', actionType: 'TRUE_UP' }];
      } else if (promptText.toLowerCase().includes('blast') || promptText.toLowerCase().includes('impact') || promptText.toLowerCase().includes('node-02')) {
        responseText += `**Impact Analysis for prod-app-node-02.dc1.internal**:\n` +
          `• Downstream Business Service: **Global Financial Portal & Core API** (Criticality: P1 Mission Critical)\n` +
          `• Linked Database: **Enterprise Financial Database (PostgreSQL 16)**\n` +
          `• Estimated Impacted Users: **1,840 Active Corporate Users**\n` +
          `• Recommended Action: Schedule zero-downtime rolling failover before applying OpenSSL Linux Kernel patch.`;
      } else if (promptText.toLowerCase().includes('vuln') || promptText.toLowerCase().includes('cve')) {
        responseText += `**Critical Security Vulnerabilities Summary**:\n` +
          safeVulns.map((v) => `• **${v.cveId}** (${v.severity} - CVSS ${v.cvssScore}): ${v.title} on *${v.affectedProduct}* (${v.affectedCisCount} CIs affected)`).join('\n');
      } else {
        responseText += `Based on the system state of ${safeCis.length} Configuration Items across 4 locations:\n` +
          `• Overall CMDB Data Quality Score: **94.2%**\n` +
          `• Expiring Contracts (Next 90 Days): **1 Contract (Oracle ULA)**\n` +
          `• Assets In Repair / Stockroom: **${safeCis.filter((c) => c.lifecycleState === 'In Stock').length} Items in stock**\n` +
          `All systems are being tracked under multi-tenant compliance policies.`;
      }

      const fallbackMsg: AiChatMessage = {
        id: `msg-copilot-${Date.now()}`,
        sender: 'copilot',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: suggested,
      };
      setAiChatHistory((prev) => [...prev, fallbackMsg]);
    }
  };

  return (
    <AppContext.Provider
      value={{
        // Auth State & Actions
        isAuthenticated,
        authStatus,
        authToken,
        authView,
        setAuthView,
        resetTokenParam,
        showOnboardingModal,
        setShowOnboardingModal,
        showUserProfileModal,
        setShowUserProfileModal,
        showOrgSettingsModal,
        setShowOrgSettingsModal,
        showUserManagementModal,
        setShowUserManagementModal,
        tempMfaToken,
        tempMfaUserEmail,
        tempMfaMethod,
        tempMfaSetupRequired,
        completeMfaLogin,
        login,
        register,
        logout,
        requestPasswordReset,
        resetPassword,
        completeOnboarding,
        updateUserProfile,
        updateTenantProfile,
        provisionUser,
        updateUserRoleAndStatus,
        rbacState,
        saveRbacMatrix,
        resetRbacMatrix,
        checkUserCapability,

        // App Modules
        activeModule,
        setActiveModule,
        superAdminTab,
        setSuperAdminTab,
        currentUser,
        setCurrentUser,
        allUsers,
        currentTenant,
        setCurrentTenant,
        allTenants,
        departments,
        locations,
        ciClasses,
        configurationItems,
        ciRelationships,
        discoveryJobs,
        endpointAgents,
        softwareCatalog,
        driftEvents,
        stockrooms,
        softwareLicenses,
        vendors,
        contracts,
        purchaseOrders,
        costCenters,
        depreciationSchedules,
        disposalRecords,
        itsmTickets,
        workflowDefinitions,
        workflowInstances,
        selfServiceRequests,
        vulnerabilities,
        policyRules,
        policyViolations,
        auditLogs,
        aiChatHistory,
        searchQuery,
        setSearchQuery,
        isAiDrawerOpen,
        setIsAiDrawerOpen,
        isMobileMenuOpen,
        setIsMobileMenuOpen,
        addConfigurationItem,
        bulkAddConfigurationItems,
        updateConfigurationItem,
        deleteConfigurationItem,
        addRelationship,
        deleteRelationship,
        addDiscoveryJob,
        runDiscoveryScanJob,
        assignAssetToUser,
        checkOutAsset,
        checkInAsset,
        transferAsset,
        disposeAsset,
        updateLicenseCount,
        approveWorkflowStep,
        rejectWorkflowStep,
        addWorkflowDefinition,
        toggleWorkflowDefinition,
        createWorkflowInstance,
        addPolicyRule,
        togglePolicyRule,
        resolvePolicyViolation,
        waivePolicyViolation,
        evaluatePolicyRules,
        addAuditEntry,
        sendAiMessage,
        createSelfServiceRequest,
        updateSelfServiceStatus,
        cancelSelfServiceRequest,
        clearAllDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
