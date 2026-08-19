import { 
  FederationConnectorConfig, 
  FederatedEntityRecord, 
  ResolvedFederatedField, 
  SourceConflictRecord, 
  FederationHealthStats, 
  SystemOfRecordType 
} from './types';
import { configurableReconciliationEngine } from '../reconciliation_engine/reconciliationEngine';

export class CMDBFederationEngine {
  private connectors: FederationConnectorConfig[] = [];
  private sourceConflicts: SourceConflictRecord[] = [];

  constructor() {
    this.seedDefaultConnectors();
    this.seedSourceConflicts();
  }

  private seedDefaultConnectors() {
    this.connectors = [
      {
        connectorId: 'conn-hr-01',
        connectorName: 'Workday HRIS Master Connector',
        systemType: 'HR / HRIS',
        status: 'Connected (Live)',
        endpointUrl: 'https://hris-api.workday.internal/v2/employees',
        authMethod: 'OAuth 2.0',
        cacheDurationMinutes: 15,
        circuitBreakerThreshold: 5,
        lastSyncTimestamp: '2026-08-11 22:30:00',
        recordsResolvedCount: 1420,
        tenantId: 'tenant-kspl-global'
      },
      {
        connectorId: 'conn-erp-01',
        connectorName: 'SAP S/4HANA Finance & Cost Center Adapter',
        systemType: 'ERP / SAP',
        status: 'Connected (Live)',
        endpointUrl: 'https://sap-gateway.enterprise.internal/odata/v4/CostCenters',
        authMethod: 'mTLS',
        cacheDurationMinutes: 30,
        circuitBreakerThreshold: 3,
        lastSyncTimestamp: '2026-08-11 22:25:00',
        recordsResolvedCount: 890,
        tenantId: 'tenant-kspl-global'
      },
      {
        connectorId: 'conn-proc-01',
        connectorName: 'Coupa Procurement & Contract Connector',
        systemType: 'Procurement',
        status: 'Cached',
        endpointUrl: 'https://procurement.coupa.com/api/v1/purchase_orders',
        authMethod: 'API Key',
        cacheDurationMinutes: 60,
        circuitBreakerThreshold: 5,
        lastSyncTimestamp: '2026-08-11 21:00:00',
        recordsResolvedCount: 410,
        tenantId: 'tenant-kspl-global'
      },
      {
        connectorId: 'conn-idp-01',
        connectorName: 'Entra ID (Azure AD) Identity Service',
        systemType: 'Identity Provider / Azure AD',
        status: 'Connected (Live)',
        endpointUrl: 'https://graph.microsoft.com/v1.0/users',
        authMethod: 'OAuth 2.0',
        cacheDurationMinutes: 5,
        circuitBreakerThreshold: 10,
        lastSyncTimestamp: '2026-08-11 22:35:00',
        recordsResolvedCount: 3100,
        tenantId: 'tenant-kspl-global'
      }
    ];
  }

  private seedSourceConflicts() {
    this.sourceConflicts = [
      {
        conflictId: 'cnf-101',
        ciId: 'ci-101',
        ciName: 'Primary Oracle DB (prod-db-01)',
        fieldName: 'Cost Center Code',
        localValue: 'CC-9001 (Legacy Default)',
        externalAuthoritativeValue: 'CC-1005 (Global IT Infrastructure)',
        sourceSystem: 'ERP / SAP',
        detectedAt: '2026-08-11 20:00:00',
        resolutionStatus: 'Unresolved Conflict'
      },
      {
        conflictId: 'cnf-102',
        ciId: 'ci-102',
        ciName: 'Core App Server Node (app-srv-02)',
        fieldName: 'Department Owner',
        localValue: 'DevOps Engineering',
        externalAuthoritativeValue: 'Cloud Infrastructure Operations',
        sourceSystem: 'HR / HRIS',
        detectedAt: '2026-08-11 19:45:00',
        resolutionStatus: 'Unresolved Conflict'
      }
    ];
  }

  public getConnectors(): FederationConnectorConfig[] {
    return this.connectors;
  }

  public getSourceConflicts(): SourceConflictRecord[] {
    return this.sourceConflicts;
  }

  public getHealthStats(): FederationHealthStats {
    const total = this.connectors.length;
    const active = this.connectors.filter(c => c.status === 'Connected (Live)' || c.status === 'Cached').length;
    const totalResolved = this.connectors.reduce((acc, c) => acc + c.recordsResolvedCount, 0);

    return {
      totalConnectors: total,
      activeConnectors: active,
      recordsResolved24h: totalResolved,
      cacheHitRatioPercent: 88.5,
      sourceConflictsCount: this.sourceConflicts.filter(sc => sc.resolutionStatus === 'Unresolved Conflict').length
    };
  }

  /**
   * Read-Through Resolver for an Asset / CI Reference ID
   */
  public resolveFederatedRecord(referenceId: string): FederatedEntityRecord {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

    if (referenceId.startsWith('EMP') || referenceId.includes('1024')) {
      return {
        referenceId: 'EMP-1024',
        entityType: 'Employee',
        sourceSystem: 'HR / HRIS',
        status: 'Connected (Live)',
        cacheTtlMinutes: 15,
        resolvedFields: {
          'Employee Name': {
            fieldName: 'Employee Name',
            fieldValue: 'Jitin Pawar',
            sourceSystem: 'HR / HRIS',
            isFederated: true,
            freshness: 'Live',
            retrievedAt: timestamp
          },
          'Designation': {
            fieldName: 'Designation',
            fieldValue: 'Lead Infrastructure Architect',
            sourceSystem: 'HR / HRIS',
            isFederated: true,
            freshness: 'Live',
            retrievedAt: timestamp
          },
          'Department': {
            fieldName: 'Department',
            fieldValue: 'Cloud & Systems Engineering',
            sourceSystem: 'HR / HRIS',
            isFederated: true,
            freshness: 'Live',
            retrievedAt: timestamp
          },
          'Manager ID': {
            fieldName: 'Manager ID',
            fieldValue: 'EMP-0010 (VP Technology)',
            sourceSystem: 'HR / HRIS',
            isFederated: true,
            freshness: 'Live',
            retrievedAt: timestamp
          },
          'Employment Status': {
            fieldName: 'Employment Status',
            fieldValue: 'Full-Time Active',
            sourceSystem: 'HR / HRIS',
            isFederated: true,
            freshness: 'Live',
            retrievedAt: timestamp
          }
        }
      };
    }

    if (referenceId.startsWith('CC') || referenceId.includes('1005')) {
      return {
        referenceId: 'CC-1005',
        entityType: 'Cost Center',
        sourceSystem: 'ERP / SAP',
        status: 'Connected (Live)',
        cacheTtlMinutes: 30,
        resolvedFields: {
          'Cost Center Code': {
            fieldName: 'Cost Center Code',
            fieldValue: 'CC-1005-GL',
            sourceSystem: 'ERP / SAP',
            isFederated: true,
            freshness: 'Live',
            retrievedAt: timestamp
          },
          'Cost Center Name': {
            fieldName: 'Cost Center Name',
            fieldValue: 'Global IT Infrastructure & DataCenters',
            sourceSystem: 'ERP / SAP',
            isFederated: true,
            freshness: 'Live',
            retrievedAt: timestamp
          },
          'Budget Owner': {
            fieldName: 'Budget Owner',
            fieldValue: 'Finance Director (FinOps Team)',
            sourceSystem: 'ERP / SAP',
            isFederated: true,
            freshness: 'Live',
            retrievedAt: timestamp
          },
          'Allocated Annual Budget': {
            fieldName: 'Allocated Annual Budget',
            fieldValue: '$2,400,000 USD',
            sourceSystem: 'ERP / SAP',
            isFederated: true,
            freshness: 'Live',
            retrievedAt: timestamp
          }
        }
      };
    }

    // Default Purchase Order / Contract Resolution
    return {
      referenceId: referenceId || 'PO-99021',
      entityType: 'Purchase Order',
      sourceSystem: 'Procurement',
      status: 'Cached',
      cacheTtlMinutes: 60,
      resolvedFields: {
        'PO Number': {
          fieldName: 'PO Number',
          fieldValue: referenceId || 'PO-99021',
          sourceSystem: 'Procurement',
          isFederated: true,
          freshness: 'Cached',
          retrievedAt: timestamp
        },
        'Vendor Name': {
          fieldName: 'Vendor Name',
          fieldValue: 'Dell Enterprise Systems Inc.',
          sourceSystem: 'Procurement',
          isFederated: true,
          freshness: 'Cached',
          retrievedAt: timestamp
        },
        'Contract Expire Date': {
          fieldName: 'Contract Expire Date',
          fieldValue: '2028-12-31 (3-Year Gold Support)',
          sourceSystem: 'Procurement',
          isFederated: true,
          freshness: 'Cached',
          retrievedAt: timestamp
        }
      }
    };
  }

  public resolveConflict(conflictId: string, action: 'Local Overridden' | 'Source Kept'): void {
    const c = this.sourceConflicts.find(sc => sc.conflictId === conflictId);
    if (c) {
      c.resolutionStatus = action;
    }
  }

  public testConnector(connectorId: string): boolean {
    const conn = this.connectors.find(c => c.connectorId === connectorId);
    if (conn) {
      conn.status = 'Connected (Live)';
      conn.lastSyncTimestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
      conn.recordsResolvedCount += 15;
      return true;
    }
    return false;
  }
}

export const cmdbFederationEngine = new CMDBFederationEngine();
