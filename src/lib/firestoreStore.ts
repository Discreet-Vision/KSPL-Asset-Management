import {
  setFirestoreDoc,
  getFirestoreDoc,
  getAllFirestoreDocs,
  deleteFirestoreDoc,
  seedInitialFirestoreCollection,
} from './firebase';

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

import {
  tenants as initialTenants,
  users as initialUsers,
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

// Firestore Collection Names
export const COLLECTIONS = {
  USERS: 'users',
  TENANTS: 'tenants',
  MFA_SECRETS: 'mfa_secrets',
  MFA_RESET_REQUESTS: 'mfa_reset_requests',
  DEPARTMENTS: 'departments',
  LOCATIONS: 'locations',
  CI_CLASSES: 'ci_classes',
  CONFIGURATION_ITEMS: 'configuration_items',
  CI_RELATIONSHIPS: 'ci_relationships',
  DISCOVERY_JOBS: 'discovery_jobs',
  ENDPOINT_AGENTS: 'endpoint_agents',
  SOFTWARE_CATALOG: 'software_catalog',
  DRIFT_EVENTS: 'drift_events',
  STOCKROOMS: 'stockrooms',
  SOFTWARE_LICENSES: 'software_licenses',
  VENDORS: 'vendors',
  CONTRACTS: 'contracts',
  PURCHASE_ORDERS: 'purchase_orders',
  COST_CENTERS: 'cost_centers',
  DEPRECIATION_SCHEDULES: 'depreciation_schedules',
  DISPOSAL_RECORDS: 'disposal_records',
  ITSM_TICKETS: 'itsm_tickets',
  WORKFLOW_DEFINITIONS: 'workflow_definitions',
  WORKFLOW_INSTANCES: 'workflow_instances',
  SELF_SERVICE_REQUESTS: 'self_service_requests',
  VULNERABILITY_CVES: 'vulnerability_cves',
  POLICY_RULES: 'policy_rules',
  POLICY_VIOLATIONS: 'policy_violations',
  AUDIT_LOGS: 'audit_logs',
};

let isInitialized = false;

// Seeding all initial ITAM data into Firestore if empty
export async function initializeFirestoreDatabase(): Promise<void> {
  if (isInitialized) return;
  isInitialized = true;

  try {
    const seedTasks = [
      seedInitialFirestoreCollection(COLLECTIONS.TENANTS, initialTenants),
      seedInitialFirestoreCollection(COLLECTIONS.DEPARTMENTS, initialDepartments),
      seedInitialFirestoreCollection(COLLECTIONS.LOCATIONS, initialLocations),
      seedInitialFirestoreCollection(COLLECTIONS.CI_CLASSES, initialCiClasses),
      seedInitialFirestoreCollection(COLLECTIONS.CONFIGURATION_ITEMS, initialCis),
      seedInitialFirestoreCollection(COLLECTIONS.CI_RELATIONSHIPS, initialRelationships),
      seedInitialFirestoreCollection(COLLECTIONS.DISCOVERY_JOBS, initialDiscoveryJobs),
      seedInitialFirestoreCollection(COLLECTIONS.ENDPOINT_AGENTS, initialEndpointAgents),
      seedInitialFirestoreCollection(COLLECTIONS.SOFTWARE_CATALOG, initialSoftwareCatalog),
      seedInitialFirestoreCollection(COLLECTIONS.DRIFT_EVENTS, initialDriftEvents),
      seedInitialFirestoreCollection(COLLECTIONS.STOCKROOMS, initialStockrooms),
      seedInitialFirestoreCollection(COLLECTIONS.SOFTWARE_LICENSES, initialSoftwareLicenses),
      seedInitialFirestoreCollection(COLLECTIONS.VENDORS, initialVendors),
      seedInitialFirestoreCollection(COLLECTIONS.CONTRACTS, initialContracts),
      seedInitialFirestoreCollection(COLLECTIONS.PURCHASE_ORDERS, initialPurchaseOrders),
      seedInitialFirestoreCollection(COLLECTIONS.COST_CENTERS, initialCostCenters),
      seedInitialFirestoreCollection(COLLECTIONS.DEPRECIATION_SCHEDULES, initialDepreciations),
      seedInitialFirestoreCollection(COLLECTIONS.DISPOSAL_RECORDS, initialDisposals),
      seedInitialFirestoreCollection(COLLECTIONS.ITSM_TICKETS, initialItsmTickets),
      seedInitialFirestoreCollection(COLLECTIONS.WORKFLOW_DEFINITIONS, initialWorkflowDefs),
      seedInitialFirestoreCollection(COLLECTIONS.WORKFLOW_INSTANCES, initialWorkflowInstances),
      seedInitialFirestoreCollection(COLLECTIONS.SELF_SERVICE_REQUESTS, initialSelfServiceRequests),
      seedInitialFirestoreCollection(
        COLLECTIONS.VULNERABILITY_CVES,
        initialVulnerabilities.map((v) => ({ id: v.cveId, ...v }))
      ),
      seedInitialFirestoreCollection(COLLECTIONS.POLICY_RULES, initialPolicyRules),
      seedInitialFirestoreCollection(COLLECTIONS.POLICY_VIOLATIONS, initialPolicyViolations),
      seedInitialFirestoreCollection(COLLECTIONS.AUDIT_LOGS, initialAuditLogs),
    ];

    await Promise.allSettled(seedTasks);
    console.log('Firestore Database synchronized successfully.');
  } catch (err) {
    console.warn('Background Firestore synchronization note:', err);
  }
}

// Persistent Storage Helpers
export async function saveRecordToFirestore<T extends { id: string }>(
  collectionName: string,
  record: T
): Promise<boolean> {
  return await setFirestoreDoc(collectionName, record.id, record);
}

export async function removeRecordFromFirestore(
  collectionName: string,
  id: string
): Promise<boolean> {
  return await deleteFirestoreDoc(collectionName, id);
}

export async function loadRecordsFromFirestore<T>(collectionName: string): Promise<T[]> {
  return await getAllFirestoreDocs<T>(collectionName);
}
