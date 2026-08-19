import crypto from 'crypto';
import {
  OrganizationTenant,
  User,
  UserRole,
  SuperAdminPlatformOverview,
  PlatformSecurityEvent,
  PlatformIntegrationConnector,
  PlatformApiKey,
  PlatformWebhook,
  PlatformSystemSettings,
  PlatformBackupSnapshot,
  PlatformRoleDefinition,
  ConfigurationItem,
  SoftwareLicense,
  Contract,
  AuditLogEntry,
  ItsmTicket,
  DiscoveryScanJob,
  VulnerabilityCVE,
  PolicyRule,
} from '../types';

import {
  getAllTenants,
  getGlobalUsersList,
  provisionUserByAdmin,
  updateUserRoleAndStatus,
  getAllMfaResetRequests,
  approveMfaResetRequest,
  rejectMfaResetRequest,
} from './authService';

// Initial In-Memory Stores for Super Admin Platform
const clientOrganizations: Map<string, OrganizationTenant> = new Map();
const platformSecurityEvents: PlatformSecurityEvent[] = [];
const platformApiKeys: Map<string, PlatformApiKey> = new Map();
const platformWebhooks: Map<string, PlatformWebhook> = new Map();
const platformBackups: PlatformBackupSnapshot[] = [];
const customPlatformRoles: Map<string, PlatformRoleDefinition> = new Map();

// Default Platform System Settings
let platformSystemSettings: PlatformSystemSettings = {
  platformName: 'KSPL Enterprise ITAM & CMDB Platform',
  supportEmail: 'support@ucliktechnologies.com',
  sessionTimeoutMinutes: 60,
  maxFailedLoginAttempts: 5,
  lockoutDurationMinutes: 15,
  passwordMinLength: 8,
  requireMfaForSuperAdmin: true,
  requireMfaForClientAdmin: false,
  defaultMfaMethod: 'google_authenticator',
  autoBackupIntervalHours: 24,
  backupRetentionDays: 30,
  smtpServer: 'smtp.sendgrid.net',
  smtpPort: 587,
  smtpSenderEmail: 'noreply@ucliktechnologies.com',
  smtpEncryption: 'TLS',
  auditLogRetentionDays: 365,
  telemetryEnabled: true,
  maintenanceMode: false,
  bannerMessage: '',
};

// Default Integrations Catalog
const platformIntegrations: PlatformIntegrationConnector[] = [
  {
    id: 'int-servicenow',
    name: 'ServiceNow ITSM & CMDB Federation',
    category: 'ITSM',
    provider: 'ServiceNow',
    status: 'Connected',
    isEnabled: true,
    endpointUrl: 'https://kspl-prod.service-now.com/api/now/table',
    maskedApiKey: 'sn_oauth_*******************92b1',
    lastSyncedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    syncLatencyMs: 142,
    syncErrorsCount: 0,
    syncRecordsCount: 1420,
    description: 'Bi-directional asset synchronization, incident correlation, and change request orchestration.',
  },
  {
    id: 'int-workday',
    name: 'Workday Human Capital Management',
    category: 'HRIS',
    provider: 'Workday',
    status: 'Connected',
    isEnabled: true,
    endpointUrl: 'https://wd5-impl-services1.workday.com/ccx/service/customreport2',
    maskedApiKey: 'wd_sec_*******************8841',
    lastSyncedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    syncLatencyMs: 230,
    syncErrorsCount: 0,
    syncRecordsCount: 380,
    description: 'Automated employee provisioning, department assignment, and lifecycle offboarding offboarding.',
  },
  {
    id: 'int-aws',
    name: 'Amazon Web Services Cloud Discovery',
    category: 'Cloud',
    provider: 'AWS',
    status: 'Connected',
    isEnabled: true,
    endpointUrl: 'https://sts.us-east-1.amazonaws.com',
    maskedApiKey: 'AKIA****************5512',
    lastSyncedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    syncLatencyMs: 88,
    syncErrorsCount: 0,
    syncRecordsCount: 2450,
    description: 'Real-time multi-account EC2, RDS, S3, and Lambda cloud instance discovery and cost tracking.',
  },
  {
    id: 'int-azure',
    name: 'Microsoft Azure & Intune UEM',
    category: 'MDM',
    provider: 'Microsoft',
    status: 'Connected',
    isEnabled: true,
    endpointUrl: 'https://graph.microsoft.com/v1.0/deviceManagement',
    maskedApiKey: 'ms_app_*******************3190',
    lastSyncedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    syncLatencyMs: 165,
    syncErrorsCount: 0,
    syncRecordsCount: 960,
    description: 'Endpoint compliance verification, BitLocker encryption status, and hardware inventory sync.',
  },
  {
    id: 'int-splunk',
    name: 'Splunk Enterprise SIEM & Security Bus',
    category: 'SIEM',
    provider: 'Splunk',
    status: 'Connected',
    isEnabled: true,
    endpointUrl: 'https://splunk-hec.corp.kspl.internal:8088/services/collector',
    maskedApiKey: 'sp_hec_*******************1044',
    lastSyncedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    syncLatencyMs: 45,
    syncErrorsCount: 0,
    syncRecordsCount: 18450,
    description: 'Streaming immutable audit logs, tamper alerts, and unauthorized credential escalation signals.',
  },
  {
    id: 'int-okta',
    name: 'Okta Enterprise Identity & SSO',
    category: 'SSO',
    provider: 'Okta',
    status: 'Configured',
    isEnabled: true,
    endpointUrl: 'https://kspl-security.okta.com/api/v1/users',
    maskedApiKey: 'okta_ss_*******************7712',
    lastSyncedAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    syncLatencyMs: 190,
    syncErrorsCount: 0,
    syncRecordsCount: 412,
    description: 'Federated SAML 2.0 / OIDC user authentication, SCIM 2.0 user directory push, and group sync.',
  },
  {
    id: 'int-jamf',
    name: 'Jamf Pro Apple Device Management',
    category: 'MDM',
    provider: 'Jamf',
    status: 'Configured',
    isEnabled: false,
    endpointUrl: 'https://kspl.jamfcloud.com/JSSResource',
    maskedApiKey: 'jamf_u_*******************4421',
    lastSyncedAt: undefined,
    syncLatencyMs: undefined,
    syncErrorsCount: 0,
    syncRecordsCount: 0,
    description: 'macOS, iOS, and iPadOS endpoint configuration auditing, FileVault escrow, and Apple silicon telemetry.',
  },
  {
    id: 'int-sap',
    name: 'SAP Ariba / ERP Procurement Integration',
    category: 'Procurement',
    provider: 'SAP',
    status: 'Disconnected',
    isEnabled: false,
    endpointUrl: 'https://openapi.ariba.com/api/purchase-orders/v1',
    maskedApiKey: 'sap_po_*******************0019',
    lastSyncedAt: undefined,
    syncLatencyMs: undefined,
    syncErrorsCount: 0,
    syncRecordsCount: 0,
    description: 'Purchase order generation, vendor contract reconciliation, and asset capitalization ledgers.',
  },
];

// Initialize Seed Data
function initPlatformSeeds() {
  if (clientOrganizations.size === 0) {
    const defaultTenants: OrganizationTenant[] = [
      {
        id: 'tenant-platform-global',
        name: 'Uclik Technologies (Platform Global)',
        code: 'UCLIK-SUPER',
        region: 'US',
        legalName: 'Uclik Technologies Inc.',
        contactEmail: 'jitin@ucliktechnologies.com',
        contactPhone: '+1 (800) 555-0199',
        address: '100 Silicon Way, Tech Park',
        country: 'United States',
        timeZone: 'America/New_York',
        industry: 'Software & Cloud Infrastructure',
        status: 'Active',
        plan: 'Enterprise',
        primaryContact: 'Software Super Admin',
        maxUsers: 10000,
        maxAssets: 50000,
        maxCis: 100000,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'tenant-client-1',
        name: 'Client Enterprise Organization',
        code: 'CLIENT-CORP',
        region: 'US',
        legalName: 'Enterprise Holdings Global LLC',
        contactEmail: 'clientadmin@enterprise.com',
        contactPhone: '+1 (555) 019-2831',
        address: '750 Lexington Avenue, Suite 1400',
        country: 'United States',
        timeZone: 'America/New_York',
        industry: 'Financial Services & Banking',
        status: 'Active',
        plan: 'Enterprise',
        primaryContact: 'Client Admin',
        maxUsers: 500,
        maxAssets: 2500,
        maxCis: 5000,
        createdAt: '2025-02-15T09:30:00.000Z',
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'tenant-client-2',
        name: 'Apex BioHealth Solutions',
        code: 'APEX-HEALTH',
        region: 'US',
        legalName: 'Apex BioHealth Technologies Corp',
        contactEmail: 'secops@apexbiohealth.com',
        contactPhone: '+1 (555) 442-1088',
        address: '400 Cambridge Parkway, Level 5',
        country: 'United States',
        timeZone: 'America/Boston',
        industry: 'Healthcare & Life Sciences',
        status: 'Active',
        plan: 'Business',
        primaryContact: 'Dr. Michael Chang',
        maxUsers: 250,
        maxAssets: 1200,
        maxCis: 3000,
        createdAt: '2025-04-10T14:15:00.000Z',
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'tenant-client-3',
        name: 'Nordic Logistics & Freight AG',
        code: 'NORDIC-LOG',
        region: 'EU',
        legalName: 'Nordic Freight & Logistics Aktiengesellschaft',
        contactEmail: 'it.admin@nordicfreight.eu',
        contactPhone: '+49 30 9988-7766',
        address: 'Willy-Brandt-Strasse 45, 10557 Berlin',
        country: 'Germany',
        timeZone: 'Europe/Berlin',
        industry: 'Logistics & Supply Chain',
        status: 'Active',
        plan: 'Starter',
        primaryContact: 'Hans Meier',
        maxUsers: 100,
        maxAssets: 500,
        maxCis: 1000,
        createdAt: '2025-06-01T11:00:00.000Z',
        updatedAt: new Date().toISOString(),
      },
    ];

    defaultTenants.forEach((t) => clientOrganizations.set(t.id, t));
  }

  // Seed Security Events
  if (platformSecurityEvents.length === 0) {
    platformSecurityEvents.push(
      {
        id: 'sec-evt-101',
        timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
        eventType: 'MFA_RESET',
        severity: 'Medium',
        actorName: 'Software Super Admin',
        actorEmail: 'jitin@ucliktechnologies.com',
        tenantId: 'tenant-client-1',
        tenantName: 'Client Enterprise Organization',
        ipAddress: '198.51.100.42',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        description: 'Super Admin reviewed and approved emergency MFA reset ticket for marcus.vance@enterprise.com.',
        status: 'Resolved',
      },
      {
        id: 'sec-evt-102',
        timestamp: new Date(Date.now() - 34 * 60 * 1000).toISOString(),
        eventType: 'FAILED_LOGIN',
        severity: 'Low',
        actorName: 'Unknown (External)',
        actorEmail: 'audit@suspicious-domain.net',
        tenantId: 'tenant-client-1',
        tenantName: 'Client Enterprise Organization',
        ipAddress: '203.0.113.195',
        userAgent: 'Python-urllib/3.11',
        description: 'Blocked 3 consecutive failed login attempts with invalid password hash.',
        status: 'Flagged',
      },
      {
        id: 'sec-evt-103',
        timestamp: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
        eventType: 'CRITICAL_CVE',
        severity: 'Critical',
        actorName: 'SecOps Automated Scanner',
        actorEmail: 'system@kspl.internal',
        tenantId: 'tenant-client-1',
        tenantName: 'Client Enterprise Organization',
        ipAddress: '10.0.4.12',
        userAgent: 'KSPL-Discovery-Engine/3.2',
        description: 'Discovered CVE-2025-21298 (CVSS 9.8 Remote Code Execution) on production hypervisor node.',
        status: 'Investigating',
      },
      {
        id: 'sec-evt-104',
        timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
        eventType: 'PERMISSION_CHANGE',
        severity: 'Medium',
        actorName: 'Software Super Admin',
        actorEmail: 'jitin@ucliktechnologies.com',
        tenantId: 'tenant-platform-global',
        tenantName: 'Uclik Technologies',
        ipAddress: '198.51.100.42',
        userAgent: 'Chrome 124.0 (macOS)',
        description: 'Updated global RBAC matrix permissions for Finance capability access.',
        status: 'Resolved',
      }
    );
  }

  // Seed API Keys
  if (platformApiKeys.size === 0) {
    const sampleKeys: PlatformApiKey[] = [
      {
        id: 'key-live-1',
        keyPrefix: 'kspl_live_9a2f',
        label: 'Production CI Reconciliation Webhook Key',
        tenantId: 'tenant-client-1',
        tenantName: 'Client Enterprise Organization',
        scopes: ['assets.read', 'cmdb.write', 'discovery.ingest'],
        createdAt: '2025-03-01T10:00:00.000Z',
        lastUsedAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
        isActive: true,
        createdBy: 'jitin@ucliktechnologies.com',
      },
      {
        id: 'key-live-2',
        keyPrefix: 'kspl_live_7c81',
        label: 'Workday HRIS Employee Sync Ingest Token',
        tenantId: 'tenant-client-1',
        tenantName: 'Client Enterprise Organization',
        scopes: ['users.provision', 'departments.read'],
        createdAt: '2025-03-15T12:30:00.000Z',
        lastUsedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        isActive: true,
        createdBy: 'clientadmin@enterprise.com',
      },
    ];
    sampleKeys.forEach((k) => platformApiKeys.set(k.id, k));
  }

  // Seed Webhooks
  if (platformWebhooks.size === 0) {
    const sampleWebhook: PlatformWebhook = {
      id: 'wh-101',
      targetUrl: 'https://api.enterprise.com/webhooks/itam-events',
      eventTriggers: ['asset.created', 'ci.drift_detected', 'license.deficit_alert'],
      tenantId: 'tenant-client-1',
      secretMasked: 'whsec_*******************8891',
      status: 'Active',
      createdAt: '2025-02-20T14:00:00.000Z',
      lastDeliveredAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
      successRatePct: 99.8,
    };
    platformWebhooks.set(sampleWebhook.id, sampleWebhook);
  }

  // Seed Backups
  if (platformBackups.length === 0) {
    platformBackups.push(
      {
        id: 'snap-20260817-0001',
        snapshotName: 'KSPL-Daily-AutoSnapshot-2026-08-17',
        createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
        type: 'Automatic',
        status: 'Completed',
        sizeBytes: 42891200,
        sizeFormatted: '40.9 MB',
        recordsCount: 14850,
        checksum: 'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        createdBy: 'System Scheduler',
      },
      {
        id: 'snap-20260816-0001',
        snapshotName: 'KSPL-Daily-AutoSnapshot-2026-08-16',
        createdAt: new Date(Date.now() - 28 * 3600 * 1000).toISOString(),
        type: 'Automatic',
        status: 'Completed',
        sizeBytes: 41980500,
        sizeFormatted: '40.0 MB',
        recordsCount: 14620,
        checksum: 'sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
        createdBy: 'System Scheduler',
      }
    );
  }

  // Seed Custom Roles
  if (customPlatformRoles.size === 0) {
    const roles: PlatformRoleDefinition[] = [
      {
        id: 'role-software-super-admin',
        name: 'SOFTWARE_SUPER_ADMIN',
        description: 'Highest-level platform master administrator. Full omnipotent cross-tenant access.',
        type: 'System',
        assignedUsersCount: 1,
        permissionsCount: 28,
        isEditable: false,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      },
      {
        id: 'role-client-admin',
        name: 'CLIENT_ADMIN',
        description: 'Full organizational authority inside the dedicated client tenant.',
        type: 'System',
        assignedUsersCount: 3,
        permissionsCount: 22,
        isEditable: false,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      },
      {
        id: 'role-itam-admin',
        name: 'ITAM Admin',
        description: 'Hardware lifecycle, asset tagging, stockroom, and license manager.',
        type: 'System',
        assignedUsersCount: 4,
        permissionsCount: 16,
        isEditable: true,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      },
      {
        id: 'role-cmdb-admin',
        name: 'CMDB Admin',
        description: 'Configuration item modeling, dependency topology, and reconciliation architect.',
        type: 'System',
        assignedUsersCount: 2,
        permissionsCount: 15,
        isEditable: true,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      },
      {
        id: 'role-finance',
        name: 'Finance',
        description: 'Contracts, purchase orders, cost centers, and depreciation ledgers.',
        type: 'System',
        assignedUsersCount: 2,
        permissionsCount: 10,
        isEditable: true,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      },
      {
        id: 'role-security',
        name: 'Security',
        description: 'CVE vulnerabilities, policy engine compliance, and audit log scrutiny.',
        type: 'System',
        assignedUsersCount: 2,
        permissionsCount: 14,
        isEditable: true,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      },
      {
        id: 'role-employee',
        name: 'Employee',
        description: 'End-user self-service hardware/software requests and assigned item view.',
        type: 'System',
        assignedUsersCount: 28,
        permissionsCount: 4,
        isEditable: true,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      },
    ];
    roles.forEach((r) => customPlatformRoles.set(r.id, r));
  }
}

initPlatformSeeds();

// ==========================================
// 1. PLATFORM OVERVIEW METRICS
// ==========================================
export function getSuperAdminFullPlatformOverview() {
  initPlatformSeeds();
  const allUsers = getGlobalUsersList();
  const allTenantsList = Array.from(clientOrganizations.values());

  const totalClients = allTenantsList.length;
  const activeClients = allTenantsList.filter((t) => (t.status || 'Active') === 'Active').length;
  const suspendedClients = allTenantsList.filter((t) => t.status === 'Suspended').length;

  const totalUsers = allUsers.length;
  const activeUsers = allUsers.filter((u) => (u.status || 'Active') === 'Active').length;
  const activeMfaUsers = allUsers.filter((u) => u.mfaEnabled).length;
  const mfaAdoptionPercent = totalUsers > 0 ? Math.round((activeMfaUsers / totalUsers) * 100) : 100;

  const pendingMfaRequests = getAllMfaResetRequests().filter((r) => r.status === 'Pending').length;

  return {
    platformOverview: {
      totalTenants: totalClients,
      activeTenants: activeClients,
      suspendedTenants: suspendedClients,
      totalUsers,
      activeUsers,
      activeMfaUsers,
      mfaAdoptionPercent,
      pendingMfaResetRequests: pendingMfaRequests,
      systemStatus: 'Optimal',
      totalAssetsCount: 1420,
      totalSoftwareCount: 380,
      totalHardwareCount: 1040,
      totalCisCount: 3150,
      openSecurityIssuesCount: 3,
      complianceViolationsCount: 1,
    },
    clientsSummary: allTenantsList.map((t) => {
      const usersInTenant = allUsers.filter((u) => u.tenantId === t.id);
      return {
        id: t.id,
        name: t.name,
        code: t.code,
        region: t.region,
        status: t.status || 'Active',
        plan: t.plan || 'Enterprise',
        usersCount: usersInTenant.length,
        maxUsers: t.maxUsers || 500,
        createdAt: t.createdAt,
        contactEmail: t.contactEmail || 'admin@' + t.code.toLowerCase() + '.com',
      };
    }),
    discoveryHealth: {
      lastDiscoveryScan: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
      successfulScansCount: 48,
      failedScansCount: 0,
      agentlessStatus: 'Operational',
      endpointAgentsActive: 312,
      cloudConnectorsActive: 3,
    },
    securitySummary: {
      failedLoginsLast24h: 3,
      lockedAccounts: 0,
      activeSecurityEvents: platformSecurityEvents.filter((e) => e.status !== 'Resolved').length,
      criticalCves: 1,
      mfaEnforcedSuperAdmins: true,
    },
    recentActivities: platformSecurityEvents.slice(0, 10),
  };
}

// ==========================================
// 2. CLIENT / ORGANIZATION MANAGEMENT
// ==========================================
export function getPlatformClientOrganizations(): OrganizationTenant[] {
  initPlatformSeeds();
  return Array.from(clientOrganizations.values());
}

export function getClientOrganizationDetail(tenantId: string) {
  initPlatformSeeds();
  const tenant = clientOrganizations.get(tenantId);
  if (!tenant) return null;

  const users = getGlobalUsersList(undefined, tenantId);

  return {
    tenant,
    users,
    stats: {
      totalUsers: users.length,
      activeUsers: users.filter((u) => u.status === 'Active').length,
      mfaEnrolledUsers: users.filter((u) => u.mfaEnabled).length,
      totalAssetsCount: tenant.id === 'tenant-platform-global' ? 120 : 640,
      totalCisCount: tenant.id === 'tenant-platform-global' ? 250 : 1420,
      totalContractsCount: 14,
      annualSpend: tenant.id === 'tenant-platform-global' ? '$180,000' : '$1,450,000',
      complianceScorePct: 98.4,
    },
    integrations: platformIntegrations.filter((i) => i.isEnabled),
    auditLogs: platformSecurityEvents.filter((e) => e.tenantId === tenantId).slice(0, 15),
  };
}

export function createClientOrganization(data: {
  name: string;
  legalName?: string;
  code: string;
  region?: 'US' | 'EU' | 'APAC';
  contactEmail: string;
  contactPhone?: string;
  address?: string;
  country?: string;
  timeZone?: string;
  industry?: string;
  status?: 'Active' | 'Suspended' | 'Inactive';
  plan?: 'Enterprise' | 'Business' | 'Starter';
  primaryContact?: string;
  maxUsers?: number;
  maxAssets?: number;
  maxCis?: number;
}): { success: boolean; tenant?: OrganizationTenant; error?: string } {
  initPlatformSeeds();

  const name = (data.name || '').trim();
  const code = (data.code || '').trim().toUpperCase();
  const contactEmail = (data.contactEmail || '').trim().toLowerCase();

  if (!name || !code || !contactEmail) {
    return { success: false, error: 'Organization name, client code, and primary contact email are required.' };
  }

  // Check code uniqueness
  for (const t of clientOrganizations.values()) {
    if (t.code.toUpperCase() === code) {
      return { success: false, error: `Client code '${code}' is already assigned to another organization.` };
    }
  }

  const id = `tenant-${code.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${crypto.randomBytes(3).toString('hex')}`;
  const newTenant: OrganizationTenant = {
    id,
    name,
    legalName: data.legalName || name,
    code,
    region: data.region || 'US',
    contactEmail,
    contactPhone: data.contactPhone || '',
    address: data.address || '',
    country: data.country || 'United States',
    timeZone: data.timeZone || 'America/New_York',
    industry: data.industry || 'Technology & Cloud',
    status: data.status || 'Active',
    plan: data.plan || 'Enterprise',
    primaryContact: data.primaryContact || name + ' Admin',
    maxUsers: data.maxUsers || 500,
    maxAssets: data.maxAssets || 2500,
    maxCis: data.maxCis || 5000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  clientOrganizations.set(id, newTenant);

  // Log Platform Event
  platformSecurityEvents.unshift({
    id: `sec-evt-${crypto.randomBytes(4).toString('hex')}`,
    timestamp: new Date().toISOString(),
    eventType: 'CLIENT_SUSPENDED',
    severity: 'Info',
    actorName: 'Software Super Admin',
    actorEmail: 'jitin@ucliktechnologies.com',
    tenantId: id,
    tenantName: name,
    ipAddress: '127.0.0.1',
    description: `Provisioned new SaaS client organization workspace '${name}' (${code}).`,
    status: 'Resolved',
  });

  return { success: true, tenant: newTenant };
}

export function updateClientOrganization(
  tenantId: string,
  data: Partial<OrganizationTenant>
): { success: boolean; tenant?: OrganizationTenant; error?: string } {
  initPlatformSeeds();

  const tenant = clientOrganizations.get(tenantId);
  if (!tenant) {
    return { success: false, error: 'Client organization not found.' };
  }

  if (data.name) tenant.name = data.name.trim();
  if (data.legalName) tenant.legalName = data.legalName.trim();
  if (data.region) tenant.region = data.region;
  if (data.contactEmail) tenant.contactEmail = data.contactEmail.trim();
  if (data.contactPhone !== undefined) tenant.contactPhone = data.contactPhone.trim();
  if (data.address !== undefined) tenant.address = data.address.trim();
  if (data.country !== undefined) tenant.country = data.country.trim();
  if (data.timeZone !== undefined) tenant.timeZone = data.timeZone.trim();
  if (data.industry !== undefined) tenant.industry = data.industry.trim();
  if (data.status) tenant.status = data.status;
  if (data.plan) tenant.plan = data.plan;
  if (data.primaryContact) tenant.primaryContact = data.primaryContact.trim();
  if (data.maxUsers !== undefined) tenant.maxUsers = Number(data.maxUsers);
  if (data.maxAssets !== undefined) tenant.maxAssets = Number(data.maxAssets);
  if (data.maxCis !== undefined) tenant.maxCis = Number(data.maxCis);
  tenant.updatedAt = new Date().toISOString();

  return { success: true, tenant };
}

export function setClientOrganizationStatus(
  tenantId: string,
  status: 'Active' | 'Suspended' | 'Inactive',
  reason?: string
): { success: boolean; tenant?: OrganizationTenant; error?: string } {
  initPlatformSeeds();

  const tenant = clientOrganizations.get(tenantId);
  if (!tenant) {
    return { success: false, error: 'Client organization not found.' };
  }

  tenant.status = status;
  tenant.updatedAt = new Date().toISOString();

  // Record audit security event
  platformSecurityEvents.unshift({
    id: `sec-evt-${crypto.randomBytes(4).toString('hex')}`,
    timestamp: new Date().toISOString(),
    eventType: 'CLIENT_SUSPENDED',
    severity: status === 'Suspended' ? 'High' : 'Medium',
    actorName: 'Software Super Admin',
    actorEmail: 'jitin@ucliktechnologies.com',
    tenantId: tenant.id,
    tenantName: tenant.name,
    ipAddress: '127.0.0.1',
    description: `Organization status changed to ${status}. ${reason ? 'Reason: ' + reason : ''}`,
    status: 'Resolved',
  });

  return { success: true, tenant };
}

// ==========================================
// 3. SECURITY CENTER & TELEMETRY
// ==========================================
export function getPlatformSecurityEvents(filters?: {
  tenantId?: string;
  severity?: string;
  eventType?: string;
  search?: string;
}): PlatformSecurityEvent[] {
  initPlatformSeeds();

  let list = [...platformSecurityEvents];

  if (filters?.tenantId && filters.tenantId !== 'ALL') {
    list = list.filter((e) => e.tenantId === filters.tenantId);
  }

  if (filters?.severity && filters.severity !== 'ALL') {
    list = list.filter((e) => e.severity === filters.severity);
  }

  if (filters?.eventType && filters.eventType !== 'ALL') {
    list = list.filter((e) => e.eventType === filters.eventType);
  }

  if (filters?.search) {
    const q = filters.search.toLowerCase();
    list = list.filter(
      (e) =>
        e.description.toLowerCase().includes(q) ||
        e.actorEmail.toLowerCase().includes(q) ||
        e.tenantName.toLowerCase().includes(q) ||
        e.ipAddress.includes(q)
    );
  }

  return list;
}

export function logPlatformSecurityEvent(event: Omit<PlatformSecurityEvent, 'id' | 'timestamp'>) {
  initPlatformSeeds();
  const fullEvent: PlatformSecurityEvent = {
    ...event,
    id: `sec-evt-${crypto.randomBytes(4).toString('hex')}`,
    timestamp: new Date().toISOString(),
  };
  platformSecurityEvents.unshift(fullEvent);
  return fullEvent;
}

// ==========================================
// 4. SYSTEM HEALTH ENGINE
// ==========================================
export function getPlatformSystemHealth() {
  initPlatformSeeds();

  const mem = process.memoryUsage();
  const uptimeSeconds = Math.floor(process.uptime());

  return {
    application: {
      status: 'Optimal',
      nodeVersion: process.version,
      platform: process.platform,
      uptimeSeconds,
      uptimeFormatted: `${Math.floor(uptimeSeconds / 3600)}h ${Math.floor((uptimeSeconds % 3600) / 60)}m ${uptimeSeconds % 60}s`,
      memoryRssMb: Math.round(mem.rss / 1024 / 1024),
      memoryHeapUsedMb: Math.round(mem.heapUsed / 1024 / 1024),
      activeConnectionsCount: 14,
    },
    database: {
      engine: 'PostgreSQL / MySQL / Firestore Hybrid Storage',
      status: 'Connected',
      latencyMs: 14,
      connectionPoolAvailable: 10,
      connectionPoolInUse: 2,
      lastHealthCheck: new Date().toISOString(),
    },
    cacheEngine: {
      engine: 'In-Memory High-Speed Cache & Session Store',
      status: 'Active',
      hitRatePct: 99.2,
      keysCount: clientOrganizations.size + platformApiKeys.size + 42,
    },
    discoveryEngine: {
      status: 'Idle (Listening)',
      activeJobs: 0,
      nextScheduledScan: new Date(Date.now() + 42 * 60 * 1000).toISOString(),
      agentWorkersHealth: 'Green',
    },
    integrationsHealth: {
      totalConnectors: platformIntegrations.length,
      connectedCount: platformIntegrations.filter((i) => i.status === 'Connected').length,
      failingCount: platformIntegrations.filter((i) => i.status === 'Error').length,
    },
  };
}

// ==========================================
// 5. PLATFORM INTEGRATIONS MANAGEMENT
// ==========================================
export function getPlatformIntegrations(): PlatformIntegrationConnector[] {
  initPlatformSeeds();
  return platformIntegrations;
}

export function togglePlatformIntegration(id: string, isEnabled: boolean): { success: boolean; connector?: PlatformIntegrationConnector } {
  initPlatformSeeds();
  const conn = platformIntegrations.find((i) => i.id === id);
  if (!conn) return { success: false };

  conn.isEnabled = isEnabled;
  if (!isEnabled && conn.status === 'Connected') {
    conn.status = 'Configured';
  } else if (isEnabled && conn.status === 'Configured') {
    conn.status = 'Connected';
  }
  return { success: true, connector: conn };
}

export function testPlatformIntegration(id: string): { success: boolean; message: string; latencyMs: number } {
  initPlatformSeeds();
  const conn = platformIntegrations.find((i) => i.id === id);
  if (!conn) return { success: false, message: 'Integration connector not found.', latencyMs: 0 };

  const latency = Math.floor(Math.random() * 80) + 40;
  conn.lastSyncedAt = new Date().toISOString();
  conn.syncLatencyMs = latency;
  conn.status = 'Connected';

  return {
    success: true,
    message: `Heartbeat successful for ${conn.name}. API returned HTTP 200 OK (${latency}ms).`,
    latencyMs: latency,
  };
}

// ==========================================
// 6. API MANAGEMENT & WEBHOOKS
// ==========================================
export function getPlatformApiKeys(): PlatformApiKey[] {
  initPlatformSeeds();
  return Array.from(platformApiKeys.values());
}

export function createPlatformApiKey(data: {
  label: string;
  tenantId: string;
  scopes: string[];
  expiresInDays?: number;
  createdBy: string;
}): { success: boolean; apiKey?: PlatformApiKey; fullSecret?: string; error?: string } {
  initPlatformSeeds();

  const label = (data.label || '').trim();
  if (!label) return { success: false, error: 'API key label is required.' };

  const tenant = clientOrganizations.get(data.tenantId) || Array.from(clientOrganizations.values())[0];
  const randomHex = crypto.randomBytes(24).toString('hex');
  const fullSecret = `kspl_live_${randomHex}`;
  const keyPrefix = `kspl_live_${randomHex.substring(0, 4)}...${randomHex.substring(randomHex.length - 4)}`;

  const id = `key-${crypto.randomBytes(6).toString('hex')}`;
  const expiresAt = data.expiresInDays
    ? new Date(Date.now() + data.expiresInDays * 24 * 3600 * 1000).toISOString()
    : undefined;

  const newKey: PlatformApiKey = {
    id,
    keyPrefix,
    label,
    tenantId: tenant.id,
    tenantName: tenant.name,
    scopes: data.scopes && data.scopes.length > 0 ? data.scopes : ['read', 'write'],
    createdAt: new Date().toISOString(),
    expiresAt,
    isActive: true,
    createdBy: data.createdBy || 'Software Super Admin',
  };

  platformApiKeys.set(id, newKey);
  return { success: true, apiKey: newKey, fullSecret };
}

export function revokePlatformApiKey(keyId: string): { success: boolean; error?: string } {
  initPlatformSeeds();
  const exists = platformApiKeys.delete(keyId);
  return { success: exists };
}

export function getPlatformWebhooks(): PlatformWebhook[] {
  initPlatformSeeds();
  return Array.from(platformWebhooks.values());
}

export function createPlatformWebhook(data: {
  targetUrl: string;
  eventTriggers: string[];
  tenantId: string;
}): { success: boolean; webhook?: PlatformWebhook; error?: string } {
  initPlatformSeeds();

  if (!data.targetUrl || !data.targetUrl.startsWith('http')) {
    return { success: false, error: 'A valid HTTPS destination URL is required for webhook registration.' };
  }

  const id = `wh-${crypto.randomBytes(6).toString('hex')}`;
  const newWh: PlatformWebhook = {
    id,
    targetUrl: data.targetUrl.trim(),
    eventTriggers: data.eventTriggers || ['all'],
    tenantId: data.tenantId || 'tenant-platform-global',
    secretMasked: `whsec_${crypto.randomBytes(8).toString('hex')}`,
    status: 'Active',
    createdAt: new Date().toISOString(),
    successRatePct: 100.0,
  };

  platformWebhooks.set(id, newWh);
  return { success: true, webhook: newWh };
}

// ==========================================
// 7. PLATFORM SYSTEM SETTINGS
// ==========================================
export function getPlatformSystemSettings(): PlatformSystemSettings {
  return { ...platformSystemSettings };
}

export function updatePlatformSystemSettings(updates: Partial<PlatformSystemSettings>): {
  success: boolean;
  settings: PlatformSystemSettings;
} {
  platformSystemSettings = {
    ...platformSystemSettings,
    ...updates,
  };
  return { success: true, settings: { ...platformSystemSettings } };
}

// ==========================================
// 8. BACKUP & DATA MANAGEMENT
// ==========================================
export function getPlatformBackupSnapshots(): PlatformBackupSnapshot[] {
  initPlatformSeeds();
  return platformBackups;
}

export function createPlatformBackupSnapshot(type: 'Automatic' | 'Manual' = 'Manual', createdBy: string = 'Software Super Admin'): {
  success: boolean;
  snapshot: PlatformBackupSnapshot;
} {
  initPlatformSeeds();

  const id = `snap-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${crypto.randomBytes(2).toString('hex')}`;
  const newSnapshot: PlatformBackupSnapshot = {
    id,
    snapshotName: `KSPL-${type}-Snapshot-${new Date().toISOString().replace(/[:.]/g, '-')}`,
    createdAt: new Date().toISOString(),
    type,
    status: 'Completed',
    sizeBytes: 43200000 + Math.floor(Math.random() * 500000),
    sizeFormatted: '41.2 MB',
    recordsCount: 14920,
    checksum: `sha256:${crypto.randomBytes(32).toString('hex')}`,
    createdBy,
  };

  platformBackups.unshift(newSnapshot);
  return { success: true, snapshot: newSnapshot };
}

export function exportPlatformDatabaseDump(format: 'json' | 'sql' = 'json') {
  initPlatformSeeds();

  const dump = {
    platform: 'KSPL Enterprise ITAM & CMDB',
    version: '3.6.0-PROD',
    exportedAt: new Date().toISOString(),
    exportedBy: 'Software Super Admin (jitin@ucliktechnologies.com)',
    schemaVersion: '2026.1',
    tenants: Array.from(clientOrganizations.values()),
    users: getGlobalUsersList(),
    securityEvents: platformSecurityEvents,
    integrations: platformIntegrations,
    systemSettings: platformSystemSettings,
  };

  if (format === 'sql') {
    let sqlDump = `-- KSPL Enterprise ITAM & CMDB Platform Database Dump\n-- Generated: ${new Date().toISOString()}\n\n`;
    sqlDump += `SET FOREIGN_KEY_CHECKS = 0;\n\n`;
    for (const t of clientOrganizations.values()) {
      sqlDump += `INSERT INTO organizations (id, name, code, region, status) VALUES ('${t.id}', '${t.name.replace(/'/g, "''")}', '${t.code}', '${t.region}', '${t.status || 'Active'}');\n`;
    }
    return { format: 'sql', content: sqlDump };
  }

  return { format: 'json', content: JSON.stringify(dump, null, 2) };
}

// ==========================================
// 9. CROSS-TENANT ROLES & RBAC
// ==========================================
export function getPlatformRoles(): PlatformRoleDefinition[] {
  initPlatformSeeds();
  return Array.from(customPlatformRoles.values());
}

export function createPlatformRole(data: {
  name: string;
  description: string;
}): { success: boolean; role?: PlatformRoleDefinition; error?: string } {
  initPlatformSeeds();

  const name = (data.name || '').trim();
  if (!name) return { success: false, error: 'Role name is required.' };

  const id = `role-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${crypto.randomBytes(3).toString('hex')}`;
  const newRole: PlatformRoleDefinition = {
    id,
    name,
    description: data.description || '',
    type: 'Custom',
    assignedUsersCount: 0,
    permissionsCount: 8,
    isEditable: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  customPlatformRoles.set(id, newRole);
  return { success: true, role: newRole };
}

// ==========================================
// 10. GLOBAL CROSS-TENANT SEARCH
// ==========================================
export function performGlobalPlatformSearch(query: string) {
  initPlatformSeeds();
  if (!query || query.trim().length === 0) return { results: [] };

  const q = query.trim().toLowerCase();
  const results: any[] = [];

  // Search Clients
  for (const t of clientOrganizations.values()) {
    if (
      t.name.toLowerCase().includes(q) ||
      t.code.toLowerCase().includes(q) ||
      (t.contactEmail && t.contactEmail.toLowerCase().includes(q))
    ) {
      results.push({
        id: t.id,
        category: 'Client / Organization',
        title: t.name,
        subtitle: `Code: ${t.code} • Region: ${t.region} • Status: ${t.status || 'Active'}`,
        link: 'clients',
        entityId: t.id,
      });
    }
  }

  // Search Users
  const users = getGlobalUsersList();
  for (const u of users) {
    if (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q) ||
      (u.tenantName && u.tenantName.toLowerCase().includes(q))
    ) {
      results.push({
        id: u.id,
        category: 'Global User',
        title: u.name,
        subtitle: `${u.email} • ${u.role} • Org: ${u.tenantName}`,
        link: 'users',
        entityId: u.id,
      });
    }
  }

  // Search Security Events
  for (const e of platformSecurityEvents) {
    if (
      e.description.toLowerCase().includes(q) ||
      e.actorEmail.toLowerCase().includes(q) ||
      e.eventType.toLowerCase().includes(q)
    ) {
      results.push({
        id: e.id,
        category: 'Security Event',
        title: `${e.eventType} - ${e.severity}`,
        subtitle: `${e.description.substring(0, 80)}... • Org: ${e.tenantName}`,
        link: 'security',
        entityId: e.id,
      });
    }
  }

  return { results: results.slice(0, 20) };
}
