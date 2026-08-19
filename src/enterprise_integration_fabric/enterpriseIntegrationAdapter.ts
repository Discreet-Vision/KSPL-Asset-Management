import { 
  IntegrationConnector, 
  SyncJobRecord, 
  OutboundWebhookConfig, 
  FieldSourcePrecedenceRule, 
  CloudCostRecord, 
  SaasUsageSignal, 
  FabricEventMessage, 
  IntegrationFabricStats 
} from './types';

export class EnterpriseIntegrationAdapter {
  private connectors: IntegrationConnector[] = [];
  private syncJobs: SyncJobRecord[] = [];
  private webhooks: OutboundWebhookConfig[] = [];
  private precedenceRules: FieldSourcePrecedenceRule[] = [];
  private cloudCosts: CloudCostRecord[] = [];
  private saasSignals: SaasUsageSignal[] = [];
  private eventStream: FabricEventMessage[] = [];

  constructor() {
    this.seedDefaultFabric();
  }

  private seedDefaultFabric() {
    // 1. Enterprise Connectors across categories
    this.connectors = [
      {
        id: 'conn-hris-workday',
        name: 'Workday HRIS Master Sync',
        category: 'HRIS',
        provider: 'Workday',
        authMethod: 'OAuth2',
        status: 'Connected',
        endpointUrl: 'https://wd5-impl-services1.workday.com/ccx/service/customreport2/org/ITAM_EmployeeSync',
        lastSyncAt: '2026-08-11 23:00:00',
        nextSyncAt: '2026-08-12 00:00:00',
        recordsProcessedCount: 4850,
        errorRatePercent: 0.1,
        tenantId: 'tenant-global-01',
        rateLimitPerMinute: 600,
        enabled: true
      },
      {
        id: 'conn-erp-sap',
        name: 'SAP S/4HANA Procurement & PO Adapter',
        category: 'ERP_FINANCE',
        provider: 'SAP_S4HANA',
        authMethod: 'Service_Account',
        status: 'Connected',
        endpointUrl: 'https://sap-gateway.enterprise.internal/sap/opu/odata/sap/API_PURCHASEORDER_PROCESS_SRV',
        lastSyncAt: '2026-08-11 22:30:00',
        nextSyncAt: '2026-08-12 02:30:00',
        recordsProcessedCount: 1240,
        errorRatePercent: 0.0,
        tenantId: 'tenant-global-01',
        rateLimitPerMinute: 300,
        enabled: true
      },
      {
        id: 'conn-itsm-servicenow',
        name: 'ServiceNow ITSM Incident/Change Bridge',
        category: 'ITSM',
        provider: 'ServiceNow',
        authMethod: 'OAuth2',
        status: 'Connected',
        endpointUrl: 'https://enterprise.service-now.com/api/now/table/change_request',
        lastSyncAt: '2026-08-11 23:45:00',
        nextSyncAt: '2026-08-12 00:15:00',
        recordsProcessedCount: 920,
        errorRatePercent: 0.2,
        tenantId: 'tenant-global-01',
        rateLimitPerMinute: 1200,
        enabled: true
      },
      {
        id: 'conn-cloud-aws',
        name: 'AWS Multi-Account Cost Explorer & Inventory',
        category: 'CLOUD_PROVIDER',
        provider: 'AWS',
        authMethod: 'Service_Account',
        status: 'Connected',
        endpointUrl: 'https://ce.us-east-1.amazonaws.com',
        lastSyncAt: '2026-08-11 20:00:00',
        nextSyncAt: '2026-08-12 08:00:00',
        recordsProcessedCount: 38200,
        errorRatePercent: 0.0,
        tenantId: 'tenant-global-01',
        rateLimitPerMinute: 1000,
        enabled: true
      },
      {
        id: 'conn-mdm-intune',
        name: 'Microsoft Intune Device Graph Adapter',
        category: 'MDM_UEM',
        provider: 'Microsoft_Intune',
        authMethod: 'OIDC',
        status: 'Connected',
        endpointUrl: 'https://graph.microsoft.com/v1.0/deviceManagement/managedDevices',
        lastSyncAt: '2026-08-11 23:15:00',
        nextSyncAt: '2026-08-12 00:15:00',
        recordsProcessedCount: 6100,
        errorRatePercent: 0.3,
        tenantId: 'tenant-global-01',
        rateLimitPerMinute: 1500,
        enabled: true
      },
      {
        id: 'conn-idp-okta',
        name: 'Okta Identity & SaaS App Access Signals',
        category: 'SSO_IDP',
        provider: 'Okta',
        authMethod: 'API_Key',
        status: 'Connected',
        endpointUrl: 'https://enterprise.okta.com/api/v1/logs',
        lastSyncAt: '2026-08-11 23:50:00',
        nextSyncAt: '2026-08-12 00:00:00',
        recordsProcessedCount: 142000,
        errorRatePercent: 0.05,
        tenantId: 'tenant-global-01',
        rateLimitPerMinute: 2000,
        enabled: true
      },
      {
        id: 'conn-bi-snowflake',
        name: 'Snowflake Enterprise Data Warehouse ETL',
        category: 'BI_DATA_WAREHOUSE',
        provider: 'Snowflake',
        authMethod: 'OAuth2',
        status: 'Connected',
        endpointUrl: 'https://xy12345.snowflakecomputing.com/api/v2/statements',
        lastSyncAt: '2026-08-11 21:00:00',
        nextSyncAt: '2026-08-12 01:00:00',
        recordsProcessedCount: 890000,
        errorRatePercent: 0.0,
        tenantId: 'tenant-global-01',
        rateLimitPerMinute: 500,
        enabled: true
      },
      {
        id: 'conn-siem-splunk',
        name: 'Splunk HTTP Event Collector (HEC) Audit Stream',
        category: 'SIEM',
        provider: 'Splunk',
        authMethod: 'Vendor_Token',
        status: 'Connected',
        endpointUrl: 'https://splunk-hec.enterprise.internal:8088/services/collector/event',
        lastSyncAt: '2026-08-11 23:58:00',
        nextSyncAt: 'Continuous Real-Time Streaming',
        recordsProcessedCount: 2450000,
        errorRatePercent: 0.01,
        tenantId: 'tenant-global-01',
        rateLimitPerMinute: 5000,
        enabled: true
      }
    ];

    // 2. Sync Jobs History
    this.syncJobs = [
      {
        id: 'job-901',
        connectorId: 'conn-hris-workday',
        connectorName: 'Workday HRIS Master Sync',
        startedAt: '2026-08-11 23:00:00',
        completedAt: '2026-08-11 23:01:14',
        status: 'Completed',
        recordsRead: 4850,
        recordsCreated: 12,
        recordsUpdated: 148,
        recordsSkipped: 4690,
        recordsFailed: 0,
        tenantId: 'tenant-global-01'
      },
      {
        id: 'job-902',
        connectorId: 'conn-mdm-intune',
        connectorName: 'Microsoft Intune Device Graph Adapter',
        startedAt: '2026-08-11 23:15:00',
        completedAt: '2026-08-11 23:17:42',
        status: 'Completed',
        recordsRead: 6100,
        recordsCreated: 4,
        recordsUpdated: 230,
        recordsSkipped: 5866,
        recordsFailed: 0,
        tenantId: 'tenant-global-01'
      }
    ];

    // 3. Outbound Webhooks
    this.webhooks = [
      {
        id: 'wh-01',
        name: 'SecOps Critical Vulnerability & Policy Violation Stream',
        endpointUrl: 'https://security-gateway.enterprise.internal/webhooks/itam-alerts',
        subscribedEvents: ['policy.violation.detected', 'vulnerability.detected'],
        authHeaderKey: 'X-ITAM-HMAC-SHA256',
        secretHmacHash: 'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        retryPolicy: 'Exponential_Backoff',
        status: 'Active',
        lastAttemptAt: '2026-08-11 23:55:12',
        totalDelivered: 1420,
        tenantId: 'tenant-global-01'
      }
    ];

    // 4. Source Precedence Matrix
    this.precedenceRules = [
      { id: 'prec-01', fieldCategory: 'OS_Version', targetAttribute: 'osVersion', precedenceChain: ['MDM_UEM', 'CLOUD_PROVIDER', 'HRIS'], tenantId: 'tenant-global-01' },
      { id: 'prec-02', fieldCategory: 'Employee_Department', targetAttribute: 'department', precedenceChain: ['HRIS', 'SSO_IDP', 'ERP_FINANCE'], tenantId: 'tenant-global-01' },
      { id: 'prec-03', fieldCategory: 'Cloud_Cost', targetAttribute: 'monthlyCostUsd', precedenceChain: ['CLOUD_PROVIDER', 'ERP_FINANCE'], tenantId: 'tenant-global-01' },
      { id: 'prec-04', fieldCategory: 'Purchase_Order', targetAttribute: 'poStatus', precedenceChain: ['ERP_FINANCE', 'PROCUREMENT'], tenantId: 'tenant-global-01' }
    ];

    // 5. Cloud Cost Records
    this.cloudCosts = [
      {
        id: 'cost-aws-01',
        cloudProvider: 'AWS',
        resourceArn: 'arn:aws:ec2:ap-south-1:123456789012:instance/i-0a1b2c3d4e5f',
        billingAccount: 'AWS-CORP-PRODUCTION-7890',
        serviceName: 'Amazon Elastic Compute Cloud',
        region: 'ap-south-1',
        costCenter: 'cc-infra-01',
        dailyCostUsd: 142.50,
        monthlyProjectedCostUsd: 4275.00,
        billingDate: '2026-08-11'
      },
      {
        id: 'cost-azure-02',
        cloudProvider: 'Azure',
        resourceArn: '/subscriptions/sub-9876/resourceGroups/rg-core/providers/Microsoft.Compute/virtualMachines/vm-prod-db',
        billingAccount: 'EA-ENTERPRISE-AZURE-001',
        serviceName: 'Azure Virtual Machines',
        region: 'Central India',
        costCenter: 'cc-infra-01',
        dailyCostUsd: 210.00,
        monthlyProjectedCostUsd: 6300.00,
        billingDate: '2026-08-11'
      }
    ];

    // 6. SaaS Discovery Signals
    this.saasSignals = [
      { id: 'saas-01', appName: 'Figma Enterprise', userEmail: 'rajesh.k@enterprise.com', department: 'Engineering', firstSeen: '2026-01-15', lastSeen: '2026-08-11 18:30', loginCount: 340, classification: 'Sanctioned' },
      { id: 'saas-02', appName: 'Miro Visual Workspace', userEmail: 'priya.s@enterprise.com', department: 'Product', firstSeen: '2026-07-20', lastSeen: '2026-08-11 14:10', loginCount: 22, classification: 'Under_Review' },
      { id: 'saas-03', appName: 'Unsanctioned AI PDF Editor', userEmail: 'dev.team@enterprise.com', department: 'Marketing', firstSeen: '2026-08-10', lastSeen: '2026-08-11 11:00', loginCount: 14, classification: 'Shadow_IT' }
    ];

    // 7. Event Stream Log
    this.eventStream = [
      {
        eventId: 'evt-1001',
        eventType: 'employee.onboarded',
        sourceConnectorId: 'conn-hris-workday',
        tenantId: 'tenant-global-01',
        timestamp: '2026-08-11 23:00:15',
        payload: { employeeId: 'EMP-9081', name: 'Aarav Sharma', department: 'Cloud SecOps' },
        idempotencyKey: 'idem-emp-9081-onboard'
      },
      {
        eventId: 'evt-1002',
        eventType: 'ci.updated',
        sourceConnectorId: 'conn-mdm-intune',
        tenantId: 'tenant-global-01',
        timestamp: '2026-08-11 23:16:02',
        payload: { serialNumber: 'C02GX991MD6M', complianceStatus: 'Compliant', osVersion: 'macOS 14.2.1' },
        idempotencyKey: 'idem-intune-c02gx991md6m-sync'
      }
    ];
  }

  // Getters
  public getConnectors(): IntegrationConnector[] { return this.connectors; }
  public getSyncJobs(): SyncJobRecord[] { return this.syncJobs; }
  public getWebhooks(): OutboundWebhookConfig[] { return this.webhooks; }
  public getPrecedenceRules(): FieldSourcePrecedenceRule[] { return this.precedenceRules; }
  public getCloudCosts(): CloudCostRecord[] { return this.cloudCosts; }
  public getSaasSignals(): SaasUsageSignal[] { return this.saasSignals; }
  public getEventStream(): FabricEventMessage[] { return this.eventStream; }

  // Stats
  public getStats(): IntegrationFabricStats {
    const active = this.connectors.filter(c => c.enabled && c.status === 'Connected').length;
    const totalCloudCost = this.cloudCosts.reduce((sum, c) => sum + c.monthlyProjectedCostUsd, 0);

    return {
      totalConnectorsCount: this.connectors.length,
      activeConnectorsCount: active,
      syncSuccessRatePercent: 99.8,
      activeWebhooksCount: this.webhooks.filter(w => w.status === 'Active').length,
      totalSyncedRecords24h: 3500000,
      cloudCostTrackedUsd: totalCloudCost
    };
  }

  // Action: Trigger Manual Connector Sync
  public triggerSync(connectorId: string): SyncJobRecord {
    const conn = this.connectors.find(c => c.id === connectorId);
    const newJob: SyncJobRecord = {
      id: `job-${Math.floor(1000 + Math.random() * 9000)}`,
      connectorId,
      connectorName: conn ? conn.name : 'Unknown Connector',
      startedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      completedAt: new Date(Date.now() + 15000).toISOString().replace('T', ' ').substring(0, 19),
      status: 'Completed',
      recordsRead: 1250,
      recordsCreated: 2,
      recordsUpdated: 48,
      recordsSkipped: 1200,
      recordsFailed: 0,
      tenantId: 'tenant-global-01'
    };

    this.syncJobs.unshift(newJob);
    if (conn) {
      conn.lastSyncAt = newJob.startedAt;
      conn.recordsProcessedCount += 50;
    }

    this.eventStream.unshift({
      eventId: `evt-${Math.floor(2000 + Math.random() * 8000)}`,
      eventType: 'discovery.completed',
      sourceConnectorId: connectorId,
      tenantId: 'tenant-global-01',
      timestamp: newJob.startedAt,
      payload: { syncJobId: newJob.id, status: 'Completed', recordsProcessed: 1250 },
      idempotencyKey: `idem-sync-${newJob.id}`
    });

    return newJob;
  }
}

export const enterpriseIntegrationAdapter = new EnterpriseIntegrationAdapter();
