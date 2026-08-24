import {
  User,
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
} from '../types';

export const tenants: OrganizationTenant[] = [
  {
    id: 'tenant-platform-global',
    name: 'Global Platform Administration',
    code: 'KSPL-GLOBAL',
    region: 'US',
  },
  {
    id: 'tenant-client-1',
    name: 'Client Enterprise Organization',
    code: 'CLIENT-CORP',
    region: 'US',
  },
];

export const currentTenant = tenants[0];

export const users: User[] = [
  {
    id: 'usr-software-super-admin',
    name: 'Software Super Admin',
    email: 'jitin@ucliktechnologies.com',
    role: 'Software Super Admin',
    departmentId: 'd-1',
    locationId: 'loc-1',
    tenantId: 'tenant-platform-global',
    status: 'Active',
  },
  {
    id: 'usr-client-admin',
    name: 'Client Admin',
    email: 'clientadmin@enterprise.com',
    role: 'Client Admin',
    departmentId: 'd-1',
    locationId: 'loc-1',
    tenantId: 'tenant-client-1',
    status: 'Active',
  },
  {
    id: 'usr-finance-manager',
    name: 'Sarah Jenkins (Finance Lead)',
    email: 'finance@enterprise.com',
    role: 'Finance',
    departmentId: 'd-3',
    locationId: 'loc-1',
    tenantId: 'tenant-client-1',
    status: 'Active',
  },
  {
    id: 'usr-itam-admin',
    name: 'Marcus Vance (ITAM Specialist)',
    email: 'itamadmin@enterprise.com',
    role: 'ITAM Admin',
    departmentId: 'd-1',
    locationId: 'loc-1',
    tenantId: 'tenant-client-1',
    status: 'Active',
  },
  {
    id: 'usr-cmdb-admin',
    name: 'Elena Rostova (CMDB Architect)',
    email: 'cmdbadmin@enterprise.com',
    role: 'CMDB Admin',
    departmentId: 'd-2',
    locationId: 'loc-1',
    tenantId: 'tenant-client-1',
    status: 'Active',
  },
  {
    id: 'usr-security-analyst',
    name: 'David Chen (SecOps Lead)',
    email: 'security@enterprise.com',
    role: 'Security',
    departmentId: 'd-4',
    locationId: 'loc-1',
    tenantId: 'tenant-client-1',
    status: 'Active',
  },
  {
    id: 'usr-employee-dev',
    name: 'Alex Rivera (Staff Engineer)',
    email: 'employee@enterprise.com',
    role: 'Employee',
    departmentId: 'd-2',
    locationId: 'loc-1',
    tenantId: 'tenant-client-1',
    status: 'Active',
  },
];

export const currentUser = users[0];

export const departments: Department[] = [
  { id: 'd-1', name: 'Information Technology & Cloud', code: 'DEPT-IT', managerId: 'usr-client-admin', costCenterId: 'cc-101' },
  { id: 'd-2', name: 'Engineering & Operations', code: 'DEPT-ENG', managerId: 'usr-client-admin', costCenterId: 'cc-102' },
  { id: 'd-3', name: 'Finance & Procurement', code: 'DEPT-FIN', managerId: 'usr-client-admin', costCenterId: 'cc-103' },
  { id: 'd-4', name: 'Security & Compliance', code: 'DEPT-SEC', managerId: 'usr-client-admin', costCenterId: 'cc-104' },
];

export const locations: Location[] = [
  { id: 'loc-1', name: 'Primary Enterprise HQ', city: 'New York', country: 'United States', address: 'HQ Campus', type: 'Headquarters' },
  { id: 'loc-2', name: 'Primary Cloud & Datacenter', city: 'Ashburn', country: 'United States', address: 'Datacenter Facility', type: 'Data Center' },
  { id: 'loc-3', name: 'Regional Logistics Center', city: 'Chicago', country: 'United States', address: 'Operations Hub', type: 'Warehouse' },
  { id: 'loc-4', name: 'EMEA Regional Hub', city: 'London', country: 'United Kingdom', address: 'Canary Wharf', type: 'Branch Office' },
];

export const ciClasses: CIClass[] = [
  { id: 'class-server', name: 'Physical / Virtual Server', category: 'Hardware', description: 'Enterprise rack servers, blade systems, and hypervisor nodes', iconName: 'Server', customAttributesSchema: { cpuCores: 'number', ramGb: 'number', rackUnit: 'string' } },
  { id: 'class-laptop', name: 'Laptop / Workstation', category: 'Hardware', description: 'Employee computing endpoints and mobile devices', iconName: 'Laptop', customAttributesSchema: { batteryHealthPct: 'number', diskEncryption: 'boolean' } },
  { id: 'class-network', name: 'Network Switch / Router / Firewall', category: 'Hardware', description: 'Core routers, distribution switches, and security gateways', iconName: 'Network', customAttributesSchema: { portCount: 'number', firmwareVersion: 'string' } },
  { id: 'class-cloud-vm', name: 'Cloud Instance (AWS / Azure / GCP)', category: 'Cloud', description: 'Elastic compute instances, containers, and serverless', iconName: 'Cloud', customAttributesSchema: { cloudRegion: 'string', instanceType: 'string' } },
  { id: 'class-sw-app', name: 'Software Application / Product', category: 'Software', description: 'Installed enterprise applications and SaaS subscriptions', iconName: 'AppWindow', customAttributesSchema: { publisherName: 'string', licenseModel: 'string' } },
  { id: 'class-service', name: 'Business Service', category: 'Service', description: 'End-to-end operational services and customer products', iconName: 'Activity', customAttributesSchema: { slaTarget: 'string', criticality: 'string' } },
  { id: 'class-db', name: 'Database Instance', category: 'Infrastructure', description: 'Relational databases, NoSQL clusters, and data warehouses', iconName: 'Database', customAttributesSchema: { dbEngine: 'string', databaseSizeGb: 'number' } },
];

// Default discovery jobs keep the Active Discovery Jobs panel useful on a
// first load, even before a customer has enrolled a scanner.
export const configurationItems: ConfigurationItem[] = [];
export const ciRelationships: CIRelationship[] = [];
export const discoveryJobs: DiscoveryScanJob[] = [
  {
    id: 'job-printer-192-168-1-110', name: 'mmmmmeeee printer', type: 'SNMP', target: '192.168.1.110', schedule: 'Manual', status: 'Queued', itemsDiscovered: 0,
    lastRun: '2026-08-21 04:54:43', credentialsRef: 'cred-snmp-default',
    logs: ['[10:23:19] Discovery Job created by Client Admin', '[10:23:19] Scheduled sweep target: 192.168.1.110 (Manual)', '[10:23:28] Scan queued. An enrolled in-network scanner must upload actual SNMP/WMI/SSH results.'],
  },
  {
    id: 'job-ashburn-dc1', name: 'Ashburn DC-1 Subnet 10.100.12.0/24 SNMP/SSH', type: 'Subnet Range', target: '10.100.12.0/24', schedule: 'Daily', status: 'Completed', itemsDiscovered: 48,
    lastRun: '2026-08-11 00:00:00', credentialsRef: 'cred-dc1-network',
    logs: ['[00:00:00] Scheduled subnet scan started.', '[00:04:12] Completed: 48 CIs found via SNMP / SSH.'],
    resultSummary: { source: 'SNMP / SSH' },
  },
  {
    id: 'job-aws-useast1', name: 'AWS Cloud Account US-EAST-1 Resource Scan', type: 'Cloud AWS', target: 'arn:aws:iam::680063710747:role/KSPLITAM-Discovery', schedule: 'Hourly', status: 'Completed', itemsDiscovered: 142,
    lastRun: '2026-08-11 00:04:10', credentialsRef: 'cred-aws-useast1',
    logs: ['[00:04:10] AWS resource inventory synchronized.', '[00:04:10] Completed: 142 CIs found.'],
    resultSummary: { source: 'AWS EC2 API' },
  },
  {
    id: 'job-okta-entra', name: 'Okta / Microsoft Entra SaaS & Shadow IT Ingestion', type: 'SaaS SSO', target: 'https://gecorp.okta.com/api/v1/apps', schedule: 'Daily', status: 'Completed', itemsDiscovered: 64,
    lastRun: '2026-08-10 23:00:00', credentialsRef: 'cred-okta-entra',
    logs: ['[23:00:00] SaaS and shadow IT ingestion started.', '[23:00:00] Completed: 64 CIs found.'],
    resultSummary: { source: 'SaaS OAuth2' },
  },
];
export const endpointAgents: EndpointAgent[] = [];
export const softwareCatalog: SoftwareCatalogItem[] = [];
export const driftEvents: DriftEvent[] = [];
export const stockrooms: Stockroom[] = [];
export const softwareLicenses: SoftwareLicense[] = [];
export const vendors: Vendor[] = [];
export const contracts: Contract[] = [];
export const purchaseOrders: PurchaseOrder[] = [];
export const costCenters: CostCenter[] = [];
export const depreciationSchedules: DepreciationSchedule[] = [];
export const disposalRecords: DisposalRecord[] = [];
export const itsmTickets: ItsmTicket[] = [];

export const workflowDefinitions: WorkflowDefinition[] = [
  {
    id: 'wf-def-1',
    name: 'Hardware Asset Procurement & Delivery Workflow',
    triggerEvent: 'Purchase Request Submitted',
    description: 'Multi-stage approval from Department Manager to Finance to IT Fulfillment',
    isActive: true,
    steps: [
      { stepNumber: 1, title: 'Department Manager Approval', approverRole: 'Department Manager' },
      { stepNumber: 2, title: 'Finance Budget Verification', approverRole: 'Finance' },
      { stepNumber: 3, title: 'IT Asset Tagging & Delivery', approverRole: 'ITAM Admin', automatedAction: 'Create CI in Stockroom' },
    ],
  },
  {
    id: 'wf-def-2',
    name: 'Certified Hardware Retirement & Disposal Workflow',
    triggerEvent: 'Asset Marked for Retirement',
    description: 'Enforces security wipe certification and manager sign-off prior to destruction',
    isActive: true,
    steps: [
      { stepNumber: 1, title: 'Security Data Wipe Verification', approverRole: 'Security' },
      { stepNumber: 2, title: 'ITAM Admin Final Authorization', approverRole: 'ITAM Admin' },
      { stepNumber: 3, title: 'Vendor Physical Destruction', approverRole: 'Field Technician', automatedAction: 'Generate Certificate PDF' },
    ],
  },
];

export const workflowInstances: WorkflowInstance[] = [];
export const selfServiceRequests: SelfServiceRequest[] = [];
export const vulnerabilityCves: VulnerabilityCVE[] = [];

export const policyRules: PolicyRule[] = [
  { id: 'pol-1', name: 'Software License Deficit Alert (ELP Deficit > 0)', category: 'Compliance', description: 'Triggers when consumed software seats exceed total purchased entitlements', severity: 'Critical', isEnabled: true, violationsCount: 0 },
  { id: 'pol-2', name: 'Mandatory Disk Encryption on Endpoint Laptops', category: 'Security', description: 'Requires BitLocker / FileVault to be enabled on all assigned laptops', severity: 'High', isEnabled: true, violationsCount: 0 },
  { id: 'pol-3', name: 'Unassigned Asset Stockroom Duration Limit (> 90 Days)', category: 'Lifecycle', description: 'Alerts when hardware remains in stockroom without user assignment for over 90 days', severity: 'Medium', isEnabled: true, violationsCount: 0 },
  { id: 'pol-4', name: 'Critical CVE Unpatched on Production CI (> 14 Days)', category: 'Security', description: 'Mandates immediate patching for CVSS >= 9.0 vulnerabilities on production servers', severity: 'Critical', isEnabled: true, violationsCount: 0 },
];

export const policyViolations: PolicyViolation[] = [];
export const auditLogs: AuditLogEntry[] = [];
