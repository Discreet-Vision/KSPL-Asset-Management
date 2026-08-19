// Types for Enterprise ITAM + CMDB Platform (KSPL ITAM)

export type UserRole =
  | 'SOFTWARE_SUPER_ADMIN'
  | 'CLIENT_ADMIN'
  | 'Software Super Admin'
  | 'Client Admin'
  | 'CLIENT_SUPER_ADMIN'
  | 'Super Admin'
  | 'ITAM Admin'
  | 'CMDB Admin'
  | 'Software Asset Manager'
  | 'Finance'
  | 'Procurement'
  | 'Security'
  | 'Auditor'
  | 'Department Manager'
  | 'Employee'
  | 'Field Technician';

export type DataClassification = 'Public' | 'Internal' | 'Confidential' | 'Restricted';

export type CapabilityAccessLevel = 'AUTHORIZED' | 'READ_ONLY' | 'DENIED';

export interface RbacCapabilityItem {
  id: string;
  name: string;
  category: string;
  description: string;
}

export type RbacMatrixPermissions = Record<string, Record<string, CapabilityAccessLevel>>;

export interface RbacMatrixState {
  tenantId: string;
  capabilities: RbacCapabilityItem[];
  matrix: RbacMatrixPermissions;
  lastUpdated: string;
  updatedBy?: string;
}

export type MfaMethod = 'google_authenticator' | 'microsoft_authenticator';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  departmentId: string;
  locationId: string;
  avatarUrl?: string;
  tenantId: string;
  mfaEnabled?: boolean;
  mfaMethod?: MfaMethod;
  mfaSetupRequired?: boolean;
  status?: 'Active' | 'Locked' | 'Disabled';
  lastLoginAt?: string;
}

export interface MfaSecretData {
  userId: string;
  userEmail: string;
  mfaEnabled: boolean;
  mfaMethod: MfaMethod;
  encryptedSecret: string;
  recoveryCodesHash: string[];
  verifiedAt?: string;
  lastUsedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MfaResetRequest {
  requestId: string;
  userId: string;
  userName: string;
  userEmail: string;
  tenantId: string;
  tenantName: string;
  mfaMethod?: MfaMethod;
  requestReason: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Completed';
  requestedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  adminNotes?: string;
}

export interface SuperAdminPlatformOverview {
  totalTenants: number;
  totalUsers: number;
  activeMfaUsers: number;
  mfaAdoptionPercent: number;
  pendingMfaResetRequests: number;
  activeSessionsCount: number;
  systemStatus: 'Optimal' | 'Degraded' | 'Maintenance';
}

export interface OrganizationTenant {
  id: string;
  name: string;
  code: string;
  region: 'US' | 'EU' | 'APAC';
  legalName?: string;
  contactEmail?: string;
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
  createdAt?: string;
  updatedAt?: string;
}

export interface PlatformSecurityEvent {
  id: string;
  timestamp: string;
  eventType: 'FAILED_LOGIN' | 'ACCOUNT_LOCKED' | 'MFA_RESET' | 'PERMISSION_CHANGE' | 'CRITICAL_CVE' | 'POLICY_VIOLATION' | 'CLIENT_SUSPENDED' | 'DATA_EXPORT';
  severity: 'Critical' | 'High' | 'Medium' | 'Low' | 'Info';
  actorName: string;
  actorEmail: string;
  tenantId: string;
  tenantName: string;
  ipAddress: string;
  userAgent?: string;
  description: string;
  status: 'Resolved' | 'Investigating' | 'Flagged' | 'Ignored';
}

export interface PlatformIntegrationConnector {
  id: string;
  name: string;
  category: 'HRIS' | 'ERP' | 'ITSM' | 'Cloud' | 'MDM' | 'SSO' | 'SIEM' | 'BI' | 'Procurement';
  provider: string;
  status: 'Connected' | 'Configured' | 'Disconnected' | 'Error';
  isEnabled: boolean;
  endpointUrl: string;
  maskedApiKey: string;
  lastSyncedAt?: string;
  syncLatencyMs?: number;
  syncErrorsCount: number;
  syncRecordsCount: number;
  description: string;
}

export interface PlatformApiKey {
  id: string;
  keyPrefix: string;
  label: string;
  tenantId: string;
  tenantName: string;
  scopes: string[];
  createdAt: string;
  expiresAt?: string;
  lastUsedAt?: string;
  isActive: boolean;
  createdBy: string;
}

export interface PlatformWebhook {
  id: string;
  targetUrl: string;
  eventTriggers: string[];
  tenantId: string;
  secretMasked: string;
  status: 'Active' | 'Inactive' | 'Failing';
  createdAt: string;
  lastDeliveredAt?: string;
  successRatePct: number;
}

export interface PlatformSystemSettings {
  platformName: string;
  supportEmail: string;
  sessionTimeoutMinutes: number;
  maxFailedLoginAttempts: number;
  lockoutDurationMinutes: number;
  passwordMinLength: number;
  requireMfaForSuperAdmin: boolean;
  requireMfaForClientAdmin: boolean;
  defaultMfaMethod: 'google_authenticator' | 'microsoft_authenticator';
  autoBackupIntervalHours: number;
  backupRetentionDays: number;
  smtpServer: string;
  smtpPort: number;
  smtpSenderEmail: string;
  smtpEncryption: 'TLS' | 'SSL' | 'None';
  auditLogRetentionDays: number;
  telemetryEnabled: boolean;
  maintenanceMode: boolean;
  bannerMessage?: string;
}

export interface PlatformBackupSnapshot {
  id: string;
  snapshotName: string;
  createdAt: string;
  type: 'Automatic' | 'Manual' | 'Pre-Upgrade';
  status: 'Completed' | 'In-Progress' | 'Failed';
  sizeBytes: number;
  sizeFormatted: string;
  recordsCount: number;
  checksum: string;
  createdBy: string;
}

export interface PlatformRoleDefinition {
  id: string;
  name: string;
  description: string;
  type: 'System' | 'Custom';
  assignedUsersCount: number;
  permissionsCount: number;
  isEditable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  managerId: string;
  costCenterId: string;
}

export interface Location {
  id: string;
  name: string;
  city: string;
  country: string;
  address: string;
  type: 'Data Center' | 'Headquarters' | 'Branch Office' | 'Warehouse' | 'Remote';
}

// ==================== CMDB & CI TYPES ====================

export type CIClassCategory = 'Hardware' | 'Software' | 'Cloud' | 'Service' | 'Infrastructure';

export interface CIClass {
  id: string;
  name: string;
  category: CIClassCategory;
  description: string;
  iconName: string;
  customAttributesSchema: Record<string, 'string' | 'number' | 'boolean' | 'date'>;
}

export type CILifecycleState =
  | 'Requested'
  | 'Approved'
  | 'Ordered'
  | 'In Stock'
  | 'Assigned'
  | 'Deployed'
  | 'In Repair'
  | 'Maintenance'
  | 'Retired'
  | 'Disposed';

export interface DiscoveredSoftwareItem {
  id?: string;
  name: string;
  publisher?: string;
  version?: string;
  edition?: string;
  architecture?: string;
  installDate?: string;
  installLocation?: string;
  packageName?: string;
  packageVersion?: string;
  productCode?: string;
  licenseKey?: string;
  licenseType?: string;
  installationStatus?: string;
  runningStatus?: string;
  processName?: string;
  serviceName?: string;
  serviceStatus?: string;
  category?: string;
  normalizedName?: string;
  normalizedPublisher?: string;
  eolDate?: string;
  latestVersion?: string;
  vulnerabilityStatus?: string;
  licenseComplianceStatus?: string;
}

export interface DiscoveredNetworkInterface {
  interfaceName: string;
  interfaceType: string;
  macAddress: string;
  ipAddress: string;
  subnetMask?: string;
  gateway?: string;
  dnsServer?: string;
  dhcpEnabled?: boolean | string;
  dhcpServer?: string;
  vlanId?: string;
  vlanName?: string;
  speed?: string;
  duplex?: string;
  status?: string;
}

export interface ConfigurationItem {
  // 1. Universal Asset Identity — 20 attributes
  id: string;
  assetTag: string;
  hostname?: string;
  fqdn?: string;
  serialNumber: string;
  uuid?: string;
  deviceId?: string;
  macAddress?: string;
  ipAddress?: string;
  allIpAddresses?: string[];
  ipv4Address?: string;
  ipv6Address?: string;
  dnsName?: string;
  domainWorkgroup?: string;
  deviceType?: string;
  assetStatus?: string;
  discoverySource: 'Agent' | 'Agentless' | 'Cloud API' | 'MDM' | 'Manual' | 'Import';
  discoveryMethod?: string;
  firstDiscovered?: string;
  lastDiscovered: string;

  // CMDB Core Classification
  name: string;
  ciClassId: string;
  ciClassName: string;
  category: CIClassCategory;
  lifecycleState: CILifecycleState;
  healthScore: number; // 0 - 100
  riskScore: number; // 0 - 100
  dataClassification: DataClassification;
  tenantId: string;

  // 2. Hardware — 35 attributes
  manufacturer: string;
  model: string;
  modelNumber?: string;
  productNumber?: string;
  productFamily?: string;
  chassisType?: string;
  cpuManufacturer?: string;
  cpuModel?: string;
  cpuFamily?: string;
  cpuGeneration?: string;
  cpuSocketCount?: number;
  cpuCoreCount?: number;
  cpuThreadCount?: number;
  cpuSpeed?: string;
  totalRamGb?: number;
  totalRam?: string;
  ramType?: string;
  ramSpeed?: string;
  ramSlotCount?: number;
  ramModuleDetails?: string;
  diskCount?: number;
  totalStorageGb?: number;
  totalStorage?: string;
  diskManufacturer?: string;
  diskModel?: string;
  diskSerialNumber?: string;
  diskType?: string;
  diskInterface?: string;
  gpuManufacturer?: string;
  gpuModel?: string;
  gpuMemory?: string;
  biosVendor?: string;
  biosVersion?: string;
  biosSerialNumber?: string;
  biosDate?: string;
  tpmVersion?: string;
  secureBootStatus?: string;

  // 3. Operating System — 25 attributes
  operatingSystem?: string;
  osName?: string;
  osFamily?: string;
  osEdition?: string;
  osVersion?: string;
  osBuild?: string;
  osArchitecture?: string;
  kernelVersion?: string;
  installationDate?: string;
  lastBootTime?: string;
  osInstallId?: string;
  windowsProductId?: string;
  windowsActivationStatus?: string;
  windowsDomain?: string;
  computerAccountStatus?: string;
  linuxDistribution?: string;
  linuxRelease?: string;
  unixVersion?: string;
  macOsVersion?: string;
  osEndOfSupportDate?: string;
  osLifecycleStatus?: string;
  patchLevel?: string;
  pendingReboot?: boolean | string;
  updateAgentVersion?: string;
  lastOsUpdate?: string;
  rebootRequired?: boolean | string;

  // 4. Network — 30 attributes
  networkInterfaceCount?: number;
  interfaceName?: string;
  interfaceType?: string;
  subnetMask?: string;
  gateway?: string;
  dnsServer?: string;
  dhcpEnabled?: boolean | string;
  dhcpServer?: string;
  vlanId?: string;
  vlanName?: string;
  networkSegment?: string;
  networkZone?: string;
  switchName?: string;
  switchPort?: string;
  switchPortDescription?: string;
  wirelessSsid?: string;
  connectionType?: string;
  linkSpeed?: string;
  duplex?: string;
  networkAdapterManufacturer?: string;
  networkAdapterModel?: string;
  networkAdapterDriver?: string;
  driverVersion?: string;
  dnsHostname?: string;
  reverseDns?: string;
  openPorts?: number[] | string;
  listeningServices?: string[] | string;
  networkReachability?: string;
  networkInterfacesList?: DiscoveredNetworkInterface[];

  // 5. Software Inventory — 25 attributes
  softwareId?: string;
  softwareName?: string;
  softwarePublisher?: string;
  softwareVersion?: string;
  softwareEdition?: string;
  softwareArchitecture?: string;
  softwareInstallDate?: string;
  softwareInstallLocation?: string;
  softwarePackageName?: string;
  softwarePackageVersion?: string;
  softwareProductCode?: string;
  softwareLicenseKey?: string;
  softwareLicenseType?: string;
  softwareInstallationStatus?: string;
  softwareRunningStatus?: string;
  softwareProcessName?: string;
  softwareServiceName?: string;
  softwareServiceStatus?: string;
  softwareCategory?: string;
  softwareNormalizedName?: string;
  softwareNormalizedPublisher?: string;
  softwareEolDate?: string;
  softwareLatestVersion?: string;
  softwareVulnerabilityStatus?: string;
  softwareLicenseComplianceStatus?: string;
  installedSoftware?: DiscoveredSoftwareItem[];
  installedSoftwareCount?: number;

  // 6. User / Ownership — 18 attributes
  primaryUser?: string;
  username?: string;
  userId?: string;
  email?: string;
  department?: string;
  departmentId: string;
  departmentName: string;
  businessUnit?: string;
  costCenter?: string;
  costCenterId: string;
  manager?: string;
  location?: string;
  locationId: string;
  locationName: string;
  site?: string;
  building?: string;
  floor?: string;
  room?: string;
  owner?: string;
  ownerUserId?: string;
  ownerUserName?: string;
  custodian?: string;
  assignmentDate?: string;
  purchaseDate?: string;
  retirementDate?: string;
  cost?: number;
  eolDate?: string;
  eosDate?: string;

  // 7. Security attributes — 25 attributes
  antivirusProduct?: string;
  antivirusStatus?: string;
  antivirusVersion?: string;
  edrProduct?: string;
  edrStatus?: string;
  firewallStatus?: string;
  encryptionStatus?: string;
  bitLockerStatus?: string;
  tpmStatus?: string;
  secureBoot?: string;
  lastSecurityUpdate?: string;
  patchCompliance?: string;
  vulnerabilityCount?: number;
  criticalVulnerabilityCount?: number;
  highVulnerabilityCount?: number;
  securityScore?: number;
  complianceStatus?: string;
  encryptionAlgorithm?: string;
  localAdminCount?: number;
  localAdminUsers?: string;
  failedLoginCount?: number;
  lastLogin?: string;
  secureConfigurationStatus?: string;
  securityPolicyVersion?: string;

  // 8. Virtualization / Cloud — 25 attributes
  virtualPhysical?: 'Physical' | 'Virtual' | 'Cloud' | string;
  hypervisor?: string;
  hypervisorVersion?: string;
  vmId?: string;
  vmUuid?: string;
  vmName?: string;
  hostServer?: string;
  cluster?: string;
  datacenter?: string;
  resourcePool?: string;
  cloudProvider?: string;
  cloudAccount?: string;
  subscriptionId?: string;
  projectId?: string;
  region?: string;
  availabilityZone?: string;
  instanceId?: string;
  instanceType?: string;
  cloudResourceId?: string;
  cloudTags?: string;
  cloudStatus?: string;
  vCpu?: string | number;
  allocatedRam?: string;
  allocatedStorage?: string;
  cloudCost?: string | number;

  customAttributes: Record<string, any>;
}

export type CIRelationshipType =
  | 'runs_on'
  | 'depends_on'
  | 'hosted_by'
  | 'connects_to'
  | 'installed_on'
  | 'assigned_to'
  | 'supports'
  | 'backed_by'
  | 'contains_ci'
  | 'communicates_with';

export interface CIRelationship {
  id: string;
  sourceCiId: string;
  sourceCiName: string;
  targetCiId: string;
  targetCiName: string;
  type: CIRelationshipType;
  discoverySource: string;
  confidence: number; // 0 - 100
  createdAt: string;
  updatedAt: string;
}

// ==================== DISCOVERY & RECONCILIATION ====================

export interface DiscoveryScanJob {
  id: string;
  name: string;
  type: 'SNMP' | 'WMI' | 'SSH' | 'Subnet Range' | 'Cloud AWS' | 'Cloud Azure' | 'Cloud GCP' | 'SaaS SSO';
  target: string;
  schedule: 'Manual' | 'Hourly' | 'Daily' | 'Weekly';
  status: 'Queued' | 'Running' | 'Completed' | 'Failed';
  itemsDiscovered: number;
  lastRun: string;
  credentialsRef: string;
  logs: string[];
}

export interface EndpointAgent {
  id: string;
  hostname: string;
  os: 'Windows' | 'macOS' | 'Linux';
  ipAddress: string;
  agentVersion: string;
  status: 'Online' | 'Offline' | 'Warning';
  lastSeen: string;
  pendingQueuedEvents: number;
}

export interface SoftwareCatalogItem {
  id: string;
  publisher: string;
  productName: string;
  rawStrings: string[];
  category: string;
  isLicensed: boolean;
  latestVersion: string;
  eolDate?: string;
}

export interface DriftEvent {
  id: string;
  ciId: string;
  ciName: string;
  attributeName: string;
  previousValue: string;
  newValue: string;
  detectedAt: string;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'Acknowledged' | 'Resolved';
}

// ==================== HARDWARE ASSET MANAGEMENT ====================

export interface Stockroom {
  id: string;
  name: string;
  locationId: string;
  locationName: string;
  managerName: string;
  assetCount: number;
  reorderThreshold: number;
}

export interface AssetAssignmentHistory {
  id: string;
  assetId: string;
  assignedToUserId: string;
  assignedToUserName: string;
  assignedByUserId: string;
  assignedByUserName: string;
  assignedDate: string;
  returnedDate?: string;
  conditionOnReturn?: string;
  notes?: string;
}

export interface DisposalRecord {
  id: string;
  assetId: string;
  assetTag: string;
  serialNumber: string;
  reason: string;
  disposalVendor: string;
  dataWipeCertified: boolean;
  wipeMethod: string;
  approvedBy: string;
  disposalDate: string;
  certificateNumber: string;
  documentUrl?: string;
}

// ==================== SOFTWARE ASSET MANAGEMENT & COMPLIANCE ====================

export type LicenseMetric =
  | 'Per Device'
  | 'Per User'
  | 'Per Core'
  | 'Per Processor'
  | 'Per Socket'
  | 'SaaS Seat';

export interface SoftwareLicense {
  id: string;
  publisher: string;
  productName: string;
  metric: LicenseMetric;
  purchasedEntitlements: number;
  consumedEntitlements: number;
  unitCost: number;
  totalCost: number;
  purchaseDate: string;
  expirationDate?: string;
  contractId: string;
  complianceStatus: 'Compliant' | 'Under-Licensed' | 'Over-Licensed' | 'Risk Alert';
  complianceGap: number; // negative means deficit
  financialLiability: number; // estimated true-up cost if non-compliant
  publisherPack: 'Microsoft' | 'Oracle' | 'SAP' | 'Adobe' | 'IBM' | 'Generic';
}

// ==================== FINANCIALS & CONTRACTS ====================

export interface Vendor {
  id: string;
  name: string;
  contactEmail: string;
  phone: string;
  rating: number; // 1-5
  activeContractsCount: number;
}

export interface Contract {
  id: string;
  contractNumber: string;
  title: string;
  vendorId: string;
  vendorName: string;
  type: 'MSA' | 'SOW' | 'Maintenance' | 'Software Agreement' | 'SaaS Subscription' | 'Warranty';
  startDate: string;
  endDate: string;
  renewalDate: string;
  autoRenew: boolean;
  totalValue: number;
  ownerName: string;
  status: 'Active' | 'Expiring Soon' | 'Expired' | 'Under Review';
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendorName: string;
  requestorName: string;
  orderDate: string;
  totalAmount: number;
  status: 'Draft' | 'Submitted' | 'Approved' | 'Received' | 'Closed';
  itemCount: number;
}

export interface CostCenter {
  id: string;
  code: string;
  name: string;
  departmentName: string;
  budgetAllocated: number;
  currentSpend: number;
}

export interface DepreciationSchedule {
  id: string;
  assetId: string;
  assetName: string;
  purchaseCost: number;
  salvageValue: number;
  usefulLifeYears: number;
  method: 'Straight-line' | 'Declining Balance';
  startDate: string;
  currentBookValue: number;
  accumulatedDepreciation: number;
}

// ==================== ITSM & WORKFLOWS ====================

export interface ItsmTicket {
  id: string;
  ticketNumber: string;
  title: string;
  type: 'Incident' | 'Problem' | 'Change Request' | 'Service Request';
  priority: 'P1 - Critical' | 'P2 - High' | 'P3 - Medium' | 'P4 - Low';
  status: 'Open' | 'In Progress' | 'Pending Approval' | 'Resolved' | 'Closed';
  relatedCiId: string;
  relatedCiName: string;
  assignedTo: string;
  createdAt: string;
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  triggerEvent: string;
  description: string;
  isActive: boolean;
  steps: {
    stepNumber: number;
    title: string;
    approverRole: UserRole;
    automatedAction?: string;
  }[];
}

export interface WorkflowInstance {
  id: string;
  workflowId: string;
  workflowName: string;
  entityType: 'Asset' | 'Software' | 'Contract' | 'Disposal' | 'Procurement';
  entityName: string;
  initiatedBy: string;
  currentStepNumber: number;
  totalSteps: number;
  status: 'In Progress' | 'Approved' | 'Rejected' | 'Completed';
  createdAt: string;
  updatedAt: string;
}

export interface SelfServiceRequest {
  id: string;
  requestNumber: string;
  itemType: 'Laptop' | 'Desktop' | 'Monitor' | 'Software License' | 'SaaS Account' | 'Mobile Device' | 'Repair';
  title: string;
  requestedBy: string;
  department: string;
  urgency: 'Standard' | 'Urgent';
  status: 'Submitted' | 'Manager Approved' | 'IT Approved' | 'Fulfilling' | 'Completed' | 'Rejected';
  createdAt: string;
}

// ==================== SECURITY & POLICIES ====================

export interface VulnerabilityCVE {
  cveId: string;
  title: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  cvssScore: number;
  publishedDate: string;
  affectedProduct: string;
  affectedCisCount: number;
  remediationStatus: 'Unpatched' | 'Patch Scheduled' | 'Patched' | 'Mitigated';
}

export interface PolicyRule {
  id: string;
  name: string;
  category: 'Security' | 'Compliance' | 'Financial' | 'Lifecycle';
  description: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  isEnabled: boolean;
  violationsCount: number;
}

export interface PolicyViolation {
  id: string;
  policyRuleId: string;
  policyName: string;
  ciId: string;
  ciName: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  details: string;
  detectedAt: string;
  status: 'Open' | 'In Remediation' | 'Resolved' | 'Waived';
}

export interface AuditLogEntry {
  id: string;
  actorName: string;
  actorRole: string;
  timestamp: string;
  action:
    | 'CREATE'
    | 'UPDATE'
    | 'DELETE'
    | 'ASSIGN'
    | 'UNASSIGN'
    | 'APPROVE'
    | 'REJECT'
    | 'DISCOVERY'
    | 'NORMALIZE'
    | 'MERGE'
    | 'EXPORT'
    | 'POLICY_VIOLATION'
    | 'LOGIN'
    | 'LOGIN_MFA'
    | 'LOGOUT'
    | 'MFA_RESET';
  entityType: string;
  entityId: string;
  entityName: string;
  fieldChanges?: { field: string; oldVal: string; newVal: string }[];
  ipAddress: string;
  tenantId: string;
}

// ==================== RECONCILIATION & NORMALIZATION ====================

export interface ReconRawSoftwareItem {
  id: string;
  rawName: string;
  normalizedName: string;
  canonicalName: string;
  publisher: string;
  version: string;
  edition: string;
  source: string;
  confidence: number;
  firstSeen: string;
  lastSeen: string;
  tenantId: string;
  status: 'Normalized' | 'Needs Review' | 'Approved' | 'Rejected' | 'Ignored';
}

export interface ReconSoftwareCatalogItem {
  id: string;
  canonicalName: string;
  publisher: string;
  productFamily: string;
  edition: string;
  approvedAliases: string[];
  rawCount: number;
  category: string;
  tenantId: string;
}

export interface ReconSoftwareAlias {
  id: string;
  rawName: string;
  approvedCanonicalName: string;
  approvedBy: string;
  approvedAt: string;
  tenantId: string;
}

export interface ReconNormalizationRule {
  id: string;
  ruleType: 'Prefix Removal' | 'Regex Substitution' | 'Vendor Normalization' | 'Edition Standardization';
  pattern: string;
  replacement: string;
  targetCanonicalName: string;
  createdBy: string;
  isEnabled: boolean;
  tenantId: string;
}

export interface ReconSoftwareReviewItem {
  id: string;
  rawName: string;
  suggestedCanonicalName: string;
  confidence: number;
  source: string;
  detectedAt: string;
  status: 'Needs Review' | 'Approved' | 'Rejected' | 'Ignored';
  tenantId: string;
}

export interface ReconCiSourceRecord {
  id: string;
  canonicalCiId?: string;
  sourceType: 'Endpoint Agent' | 'WMI' | 'WinRM' | 'SSH' | 'SNMP' | 'Intune' | 'AWS' | 'Azure' | 'GCP' | 'Manual';
  rawHostname: string;
  rawSerial: string;
  rawUuid: string;
  rawMac: string;
  rawIp: string;
  manufacturer: string;
  model: string;
  os: string;
  observedAt: string;
  tenantId: string;
}

export interface ReconFieldProvenance {
  id: string;
  ciId: string;
  fieldName: string;
  value: string;
  source: string;
  sourceRecordId: string;
  observedAt: string;
  confidence: number;
}

export interface ReconIdentityConflict {
  id: string;
  ciId: string;
  ciName: string;
  fieldName: string;
  sourceAName: string;
  sourceAValue: string;
  sourceAObserved: string;
  sourceBName: string;
  sourceBValue: string;
  sourceBObserved: string;
  status: 'Open' | 'Resolved' | 'Ignored';
  resolutionNotes?: string;
  tenantId: string;
}

export interface ReconMergeHistoryItem {
  id: string;
  mergedCiId: string;
  mergedCiName: string;
  targetCiId: string;
  targetCiName: string;
  mergedBy: string;
  mergedAt: string;
  snapshotData: any;
  status: 'Active' | 'Rolled Back';
  tenantId: string;
}

export interface ReconAuditLog {
  id: string;
  user: string;
  action: 'Normalization' | 'Alias Approval' | 'CI Match' | 'CI Merge' | 'CI Unmerge' | 'Conflict Resolution' | 'Manual Mapping' | 'Rule Modification';
  beforeState: string;
  afterState: string;
  reason: string;
  confidence: number;
  source: string;
  timestamp: string;
  tenantId: string;
}

// ==================== AI COPILOT ====================

export interface AiChatMessage {
  id: string;
  sender: 'user' | 'copilot';
  text: string;
  timestamp: string;
  suggestedActions?: { label: string; actionType: string; payload?: any }[];
  relatedCiIds?: string[];
}

// ==================== CMDB SYSTEM OF RECORD & FEDERATION LAYER ====================

export type CmdbFederationSystemType =
  | 'HR'
  | 'ERP'
  | 'Finance'
  | 'Procurement'
  | 'Cloud Billing'
  | 'Microsoft Entra ID'
  | 'AWS'
  | 'Azure'
  | 'GCP'
  | 'External CMDB'
  | 'ITSM'
  | 'Contract Management'
  | 'License Management';

export type CmdbFederationStatus =
  | 'Connected'
  | 'Disconnected'
  | 'Authentication Failed'
  | 'Rate Limited'
  | 'Unavailable'
  | 'Syncing'
  | 'Sync Failed'
  | 'Healthy';

export interface CmdbFederationSource {
  id: string;
  name: string;
  systemType: CmdbFederationSystemType;
  connectionType: 'REST API' | 'GraphQL' | 'SOAP' | 'SQL Query' | 'Webhook / Event';
  status: CmdbFederationStatus;
  lastSync: string;
  recordsCount: number;
  adapterName: string;
  endpointUrl: string;
  rateLimitMax: number;
  circuitBreakerState: 'Closed (Healthy)' | 'Open (Tripped)' | 'Half-Open (Testing)';
  tenantId: string;
  credentialsMasked: string;
}

export interface CmdbFederationRecord {
  id: string;
  federationSourceId: string;
  sourceName: string;
  externalSourceId: string;
  externalRecordId: string;
  externalRecordType: string;
  externalUrl: string;
  lastSeen: string;
  lastModified: string;
  mappedCiId?: string;
  mappedCiName?: string;
  isCached: boolean;
  cacheSourceTag: 'FEDERATED CACHE' | 'LIVE ON-DEMAND';
  attributes: Record<string, any>;
  tenantId: string;
}

export interface CmdbFederationMapping {
  id: string;
  federationSourceId: string;
  sourceName: string;
  externalRecordId: string;
  externalRecordType: string;
  ciId: string;
  ciName: string;
  mappingType: 'One-to-one' | 'One-to-many' | 'Many-to-one';
  mappedBy: string;
  createdAt: string;
  tenantId: string;
}

export interface CmdbFederationSyncJob {
  id: string;
  federationSourceId: string;
  sourceName: string;
  syncMode: 'Manual Sync' | 'Scheduled Sync' | 'Incremental Sync' | 'On-Demand Lookup' | 'Webhook Event';
  status: 'Queued' | 'Syncing' | 'Completed' | 'Failed' | 'Rate Limited';
  recordsProcessed: number;
  recordsUpdated: number;
  startTime: string;
  endTime?: string;
  errorMessage?: string;
  tenantId: string;
}

export interface CmdbCiHistoryItem {
  id: string;
  ciId: string;
  ciName: string;
  attributeName: string;
  previousValue: string;
  newValue: string;
  source: string;
  updatedBy: string;
  timestamp: string;
  tenantId: string;
}

export interface CmdbDataConflict {
  id: string;
  ciId: string;
  ciName: string;
  attributeName: string;
  sourceAName: string;
  sourceAValue: string;
  sourceAObserved: string;
  sourceBName: string;
  sourceBValue: string;
  sourceBObserved: string;
  sourcePriority: string;
  status: 'Data Conflict' | 'Resolved' | 'Ignored';
  tenantId: string;
}

// ==================== SOFTWARE LICENSE COMPLIANCE & AUDIT TRUE-UP ENGINE ====================

export type LicenseMetricType =
  | 'Per Device'
  | 'Per User'
  | 'Per Core'
  | 'Per VM'
  | 'Per Processor'
  | 'Per Named User'
  | 'Concurrent User'
  | 'Per Instance'
  | 'Per Host'
  | 'Per Socket'
  | 'Per Employee'
  | 'Subscription'
  | 'Consumption Based';

export type ComplianceStatus =
  | 'COMPLIANT'
  | 'AT RISK'
  | 'NON-COMPLIANT'
  | 'EXPIRED'
  | 'UNKNOWN'
  | 'PENDING REVIEW';

export interface LicenseEntitlement {
  id: string;
  softwareName: string;
  publisher: string;
  vendorProfile: 'Microsoft' | 'Oracle' | 'SAP' | 'Adobe' | 'Other';
  metric: LicenseMetricType;
  ownedQuantity: number;
  purchaseDate: string;
  expirationDate: string;
  status: 'Active' | 'Expiring Soon' | 'Expired' | 'Suspended' | 'Cancelled';
  contractNumber: string;
  contractType: string;
  source: 'Procurement' | 'ERP' | 'Contract Management' | 'Manual Entry' | 'Vendor Agreement' | 'Import';
  costCenter: string;
  allocatedDept: string;
  unitCost: number;
  tenantId: string;
}

export interface LicenseConsumptionRecord {
  id: string;
  softwareName: string;
  publisher: string;
  version: string;
  edition: string;
  deviceName?: string;
  userName?: string;
  cpuCoreCount?: number;
  vmName?: string;
  metric: LicenseMetricType;
  consumedQuantity: number;
  source: string;
  observedAt: string;
  isExcludedFromLicense?: boolean;
  exclusionReason?: string;
  tenantId: string;
}

export interface EffectiveLicensePositionItem {
  id: string;
  softwareName: string;
  publisher: string;
  metric: LicenseMetricType;
  entitlementsOwned: number;
  licensesConsumed: number;
  availableLicenses: number;
  shortfall: number;
  elpNumber: number; // positive = available, negative = shortfall
  status: ComplianceStatus;
  contractNumber: string;
  expirationDate: string;
  estimatedFinancialRisk: number; // in USD ESTIMATE
  calculationBreakdown: {
    inputData: string;
    ruleApplied: string;
    includedCount: number;
    excludedCount: number;
    exclusionReason: string;
    resultSummary: string;
  };
  tenantId: string;
}

export interface LicenseRule {
  id: string;
  vendorName: 'Microsoft' | 'Oracle' | 'SAP' | 'Adobe' | 'Generic';
  productName: string;
  metric: LicenseMetricType;
  ruleDescription: string;
  coreFactor?: number;
  deDuplicateUsers?: boolean;
  virtualizationMultiplier?: number;
  appliesToEdition?: string;
  tenantId: string;
}

export interface AuditScenario {
  id: string;
  name: string;
  vendor: 'Microsoft' | 'Oracle' | 'SAP' | 'Adobe' | 'All Vendors';
  auditDate: string;
  status: 'Draft' | 'Running' | 'Simulated' | 'Completed';
  includedProducts: string[];
  baselineEntitlements: number;
  baselineConsumed: number;
  simulatedEntitlements: number;
  simulatedConsumed: number;
  simulatedElp: number;
  estimatedRiskAmount: number;
  auditReadinessScore: number; // 0 - 100%
  tenantId: string;
}

export interface AuditFinding {
  id: string;
  scenarioId: string;
  findingTitle: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  softwareName: string;
  vendor: string;
  metric: string;
  expectedEntitlement: number;
  actualConsumption: number;
  shortfall: number;
  evidenceReference: string;
  recommendation: string;
  status: 'Open' | 'Under Review' | 'Mitigated' | 'Resolved';
  tenantId: string;
}

export interface ComplianceException {
  id: string;
  softwareName: string;
  exceptionTitle: string;
  approvedBy: string;
  validUntil: string;
  reason: string;
  status: 'Active' | 'Expired' | 'Revoked';
  tenantId: string;
}

// ==================== FINANCIAL LAYER: CONTRACT, PROCUREMENT, TCO & DEPRECIATION ====================

export type ContractType =
  | 'Master Service Agreement (MSA)'
  | 'Purchase Contract'
  | 'Software Agreement'
  | 'Hardware Contract'
  | 'Maintenance Contract'
  | 'Support Contract'
  | 'Cloud Contract'
  | 'Subscription Contract'
  | 'Lease Contract'
  | 'Vendor Agreement'
  | 'License Agreement';

export type ContractStatus =
  | 'Draft'
  | 'Active'
  | 'Expiring Soon'
  | 'Expired'
  | 'Renewed'
  | 'Cancelled'
  | 'Terminated';

export interface FinancialContract {
  id: string;
  contractNumber: string;
  contractName: string;
  contractType: ContractType;
  vendorId: string;
  vendorName: string;
  startDate: string;
  endDate: string;
  renewalDate: string;
  contractValue: number;
  currency: string;
  paymentTerms: string;
  costCenterId: string;
  departmentId: string;
  ownerName: string;
  status: ContractStatus;
  description: string;
  attachmentsCount?: number;
  externalReference?: string;
  noticePeriodDays: number;
  autoRenewal: boolean;
  renewalOwner: string;
  renewalStatus: 'Pending' | 'In Progress' | 'Renewed' | 'Non-Renewing';
  previousContractId?: string;
  renewedContractId?: string;
  linkedAssetIds?: string[];
  linkedCiIds?: string[];
  linkedServiceNames?: string[];
  linkedAppNames?: string[];
  daysRemaining: number;
  tenantId: string;
}

export interface FinancialVendorReference {
  id: string;
  vendorName: string;
  vendorType: string;
  contactPerson: string;
  contactEmail: string;
  address: string;
  taxInfo: string;
  paymentTerms: string;
  preferredCurrency: string;
  activeContractsCount: number;
  totalPosCount: number;
  totalSpendAmount: number;
  tenantId: string;
}

export type POStatus =
  | 'Draft'
  | 'Submitted'
  | 'Approved'
  | 'Partially Received'
  | 'Received'
  | 'Closed'
  | 'Cancelled';

export interface FinancialPOLineItem {
  id: string;
  poId: string;
  itemDescription: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  linkedAssetId?: string;
  linkedCiId?: string;
  linkedSoftwareId?: string;
  linkedServiceName?: string;
  costCenterId?: string;
  departmentId?: string;
}

export interface FinancialPurchaseOrder {
  id: string;
  poNumber: string;
  vendorId: string;
  vendorName: string;
  poDate: string;
  expectedDeliveryDate: string;
  currency: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paymentTerms: string;
  costCenterId: string;
  departmentId: string;
  contractNumber?: string;
  requesterName: string;
  approverName: string;
  status: POStatus;
  lineItems: FinancialPOLineItem[];
  tenantId: string;
}

export interface FinancialCostCenter {
  id: string;
  costCenterCode: string;
  costCenterName: string;
  department: string;
  businessUnit: string;
  managerName: string;
  annualBudget: number;
  allocatedAmount: number;
  currency: string;
  status: 'Active' | 'Inactive' | 'Over Budget';
  tenantId: string;
}

export type CostAllocationMethod =
  | 'Direct Allocation'
  | 'Percentage Allocation'
  | 'Equal Allocation'
  | 'Usage-Based Allocation'
  | 'Manual Allocation';

export interface FinancialCostAllocation {
  id: string;
  transactionId?: string;
  assetId?: string;
  serviceName?: string;
  costCenterId: string;
  costCenterCode: string;
  allocationPercentage: number;
  allocatedAmount: number;
  allocationMethod: CostAllocationMethod;
  effectiveDate: string;
  tenantId: string;
}

export type FinancialTransactionType =
  | 'Purchase'
  | 'Subscription'
  | 'Maintenance'
  | 'Support'
  | 'Cloud Spend'
  | 'Upgrade'
  | 'Repair'
  | 'Warranty'
  | 'Renewal'
  | 'Disposal'
  | 'Other Cost';

export interface FinancialTransaction {
  id: string;
  transactionDate: string;
  transactionType: FinancialTransactionType;
  amount: number;
  currency: string;
  convertedAmountBase: number;
  baseCurrency: string;
  vendorName: string;
  contractNumber?: string;
  poNumber?: string;
  linkedAssetId?: string;
  linkedAssetName?: string;
  linkedServiceName?: string;
  costCenterCode: string;
  description: string;
  sourceSystem: string;
  sourceRecordRef: string;
  tenantId: string;
}

export type TcoTargetType = 'Asset' | 'CI' | 'Service' | 'Application';
export type TcoPeriod = 'Monthly' | 'Quarterly' | 'Annual' | '3-Year' | '5-Year' | 'Custom Period' | 'Entire Lifecycle';

export interface FinancialTcoComponent {
  name: string;
  category:
    | 'Purchase'
    | 'Implementation'
    | 'Maintenance'
    | 'Support'
    | 'Subscription'
    | 'Upgrade'
    | 'Repair'
    | 'Cloud/Hosting'
    | 'Other Operational'
    | 'Discount'
    | 'Recoverable Value';
  amount: number;
  isCredit?: boolean;
}

export interface FinancialTcoRecord {
  id: string;
  targetId: string;
  targetName: string;
  targetType: TcoTargetType;
  period: TcoPeriod;
  currency: string;
  purchaseCost: number;
  maintenanceCost: number;
  supportCost: number;
  subscriptionCost: number;
  upgradeCost: number;
  repairCost: number;
  cloudCost: number;
  operationalCost: number;
  discountsAndCredits: number;
  totalTco: number;
  components: FinancialTcoComponent[];
  calculationDate: string;
  tenantId: string;
}

export type DepreciationMethod = 'Straight-Line' | 'Declining Balance';
export type DepreciationStartRule = 'Purchase Date' | 'Placed-in-Service Date' | 'Commissioning Date' | 'Custom Date';

export interface FinancialDepreciationEntry {
  periodNumber: number;
  periodLabel: string;
  openingBookValue: number;
  depreciationAmount: number;
  accumulatedDepreciation: number;
  closingBookValue: number;
}

export interface FinancialDepreciationProfile {
  id: string;
  assetClass: string;
  usefulLifeYears: number;
  depreciationMethod: DepreciationMethod;
  decliningBalanceRate?: number;
  salvageValuePercent: number;
  startRule: DepreciationStartRule;
  tenantId: string;
}

export interface FinancialAssetDepreciationRecord {
  id: string;
  assetId: string;
  assetName: string;
  assetClass: string;
  originalCost: number;
  salvageValue: number;
  usefulLifeYears: number;
  method: DepreciationMethod;
  decliningRate?: number;
  startRule: DepreciationStartRule;
  placedInServiceDate: string;
  accumulatedDepreciation: number;
  currentBookValue: number;
  remainingLifeYears: number;
  currency: string;
  schedule: FinancialDepreciationEntry[];
  disposalData?: {
    disposalDate: string;
    disposalMethod: string;
    saleValue: number;
    disposalCost: number;
    gainOrLoss: number;
  };
  tenantId: string;
}

export interface FinancialAuditLog {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  targetType: 'Contract' | 'PO' | 'TCO' | 'Depreciation' | 'Transaction' | 'Cost Center';
  targetId: string;
  beforeValue?: string;
  afterValue?: string;
  reason?: string;
  source: string;
  tenantId: string;
}

// ==================== WORKFLOW ENGINE & ITSM INTEGRATION BUS ====================

export type WorkflowTriggerEventType =
  | 'Asset Created'
  | 'Asset Updated'
  | 'Asset Assigned'
  | 'Asset Transferred'
  | 'Asset Returned'
  | 'Asset Lost'
  | 'Asset Stolen'
  | 'Asset Retired'
  | 'Asset Disposed'
  | 'CI Created'
  | 'CI Updated'
  | 'Software Installed'
  | 'Software Removed'
  | 'Contract Expiring'
  | 'License Non-Compliant'
  | 'Compliance Finding Created'
  | 'Financial Threshold Exceeded'
  | 'Warranty Expiring'
  | 'Lifecycle Date Reached'
  | 'Manual Trigger'
  | 'Scheduled Trigger'
  | 'Webhook Trigger';

export type ConditionOperator =
  | 'Equals'
  | 'Not Equals'
  | 'Contains'
  | 'Does Not Contain'
  | 'Starts With'
  | 'Ends With'
  | 'Greater Than'
  | 'Less Than'
  | 'Greater Than or Equal'
  | 'Less Than or Equal'
  | 'Is Empty'
  | 'Is Not Empty'
  | 'In List'
  | 'Not In List'
  | 'Between'
  | 'Before Date'
  | 'After Date'
  | 'Within Days';

export interface WorkflowCondition {
  id: string;
  field: string;
  operator: ConditionOperator;
  value: string;
  logicalOperator?: 'AND' | 'OR' | 'NOT';
  nestedConditions?: WorkflowCondition[];
}

export type WorkflowActionType =
  | 'Create Task'
  | 'Create Approval'
  | 'Send Notification'
  | 'Send Email'
  | 'Send Webhook'
  | 'Update Workflow Record'
  | 'Create Workflow Instance'
  | 'Assign User'
  | 'Assign Group'
  | 'Escalate'
  | 'Wait'
  | 'Delay'
  | 'Call Integration API'
  | 'Create ITSM Link'
  | 'Add Comment'
  | 'Request Approval'
  | 'Reject'
  | 'Complete'
  | 'Cancel';

export type ApprovalType =
  | 'Single Approver'
  | 'Multiple Approvers'
  | 'Sequential Approval'
  | 'Parallel Approval'
  | 'Any-One Approval'
  | 'All-Must-Approve'
  | 'Majority Approval'
  | 'Manager Approval'
  | 'Role-Based Approval'
  | 'Department Approval'
  | 'Cost-Center Approval'
  | 'Dynamic Approver';

export type DynamicApproverRole =
  | 'Asset Owner'
  | 'Asset Manager'
  | 'Department Manager'
  | 'Cost Center Manager'
  | 'CI Owner'
  | 'Service Owner'
  | 'Application Owner'
  | 'Finance Manager'
  | 'Security Manager'
  | 'IT Manager';

export interface WorkflowApprovalRule {
  id: string;
  approvalType: ApprovalType;
  approverRole?: DynamicApproverRole;
  approverUserId?: string;
  requiredVotes?: number;
  timeoutDays: number;
  escalationRole?: DynamicApproverRole;
  condition?: WorkflowCondition;
}

export interface WorkflowNode {
  id: string;
  nodeType: 'Trigger' | 'Condition' | 'Approval' | 'Action' | 'Notification' | 'Wait' | 'Integration' | 'Decision' | 'End';
  label: string;
  description: string;
  config: {
    triggerEvent?: WorkflowTriggerEventType;
    conditions?: WorkflowCondition[];
    actionType?: WorkflowActionType;
    approvalRule?: WorkflowApprovalRule;
    emailTemplate?: string;
    delayDuration?: string;
    targetSystem?: string;
    apiEndpoint?: string;
  };
  position: { x: number; y: number };
  nextStepIds: string[];
}

export type WorkflowActivationStatus = 'Draft' | 'Testing' | 'Active' | 'Paused' | 'Archived';

export interface WorkflowDefinitionVersion {
  id: string;
  workflowId: string;
  version: string; // e.g. "1.0", "1.1", "2.0"
  nodes: WorkflowNode[];
  createdAt: string;
  createdBy: string;
  status: WorkflowActivationStatus;
}

export interface AdvancedWorkflowDefinition {
  id: string;
  name: string;
  category: 'Asset Lifecycle' | 'Procurement' | 'Compliance' | 'Security' | 'ITSM Sync' | 'Custom';
  description: string;
  currentVersion: string;
  versions: WorkflowDefinitionVersion[];
  triggerEvent: WorkflowTriggerEventType;
  status: WorkflowActivationStatus;
  isTemplate?: boolean;
  createdAt: string;
  updatedAt: string;
  tenantId: string;
}

export type WorkflowInstanceState =
  | 'Draft'
  | 'Requested'
  | 'Pending Approval'
  | 'Approved'
  | 'Rejected'
  | 'In Progress'
  | 'Completed'
  | 'Cancelled'
  | 'Failed';

export interface WorkflowExecutionStepLog {
  id: string;
  nodeId: string;
  nodeLabel: string;
  nodeType: string;
  startedAt: string;
  completedAt?: string;
  status: 'Pending' | 'In Progress' | 'Success' | 'Failed' | 'Skipped';
  approverActor?: string;
  approvalComment?: string;
  inputData?: Record<string, any>;
  outputData?: Record<string, any>;
  errorMessage?: string;
}

export interface WorkflowExecutionInstance {
  id: string;
  workflowId: string;
  workflowName: string;
  version: string;
  correlationId: string;
  triggerEvent: WorkflowTriggerEventType;
  targetEntityType: 'Asset' | 'CI' | 'Contract' | 'License' | 'Finding' | 'User';
  targetEntityId: string;
  targetEntityName: string;
  currentStepId: string;
  currentStepLabel: string;
  state: WorkflowInstanceState;
  startedAt: string;
  completedAt?: string;
  stepLogs: WorkflowExecutionStepLog[];
  retryCount: number;
  tenantId: string;
}

// ITSM Integration Bus Types
export type ITSMRecordType = 'Incident' | 'Problem' | 'Change' | 'Request' | 'Task' | 'Work Order';
export type ITSMRelationshipType = 'AFFECTED_BY' | 'CAUSED_BY' | 'IMPLEMENTED_FOR' | 'REQUESTED_FOR' | 'DEPENDS_ON';
export type ITSMProvider = 'ServiceNow' | 'BMC Helix' | 'Jira Service Management' | 'Freshservice' | 'Generic REST API';

export interface ITSMIntegrationLink {
  id: string;
  itamEntityType: 'Asset' | 'CI' | 'Service' | 'Application';
  itamEntityId: string;
  itamEntityName: string;
  itsmRecordType: ITSMRecordType;
  itsmRecordNumber: string; // e.g., INC-2026-10052, CHG-8802
  itsmSystem: ITSMProvider;
  relationshipType: ITSMRelationshipType;
  status: 'Active' | 'Resolved' | 'Closed' | 'Archived';
  externalRecordUrl?: string;
  lastSyncedAt: string;
  syncStatus: 'Synchronized' | 'Pending' | 'Failed' | 'Retrying';
  tenantId: string;
}

export interface ITSMConnectorConfig {
  id: string;
  provider: ITSMProvider;
  name: string;
  baseUrl: string;
  authType: 'OAuth2' | 'API Key' | 'Basic Auth';
  status: 'Connected' | 'Disconnected' | 'Error';
  lastHeartbeat: string;
  webhooksEnabled: boolean;
  webhookSecret: string;
  retryPolicy: {
    maxRetries: number;
    backoffMultiplierSec: number;
  };
  tenantId: string;
}

export interface WebhookEventLog {
  id: string;
  direction: 'Inbound' | 'Outbound';
  eventPayloadType: string;
  sourceSystem: string;
  correlationId: string;
  timestamp: string;
  signatureValid: boolean;
  status: 'Processed' | 'Failed' | 'In Dead Letter Queue';
  responseCode: number;
  payloadSnippet: string;
  tenantId: string;
}



