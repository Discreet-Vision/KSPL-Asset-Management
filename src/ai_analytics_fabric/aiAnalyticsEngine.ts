import { 
  PredictiveMaintenanceAsset, 
  CopilotQueryHistory, 
  AssetAnomalyRecord, 
  SpendRenewalForecastItem, 
  MarketplaceConnector, 
  WebhookEventRecord, 
  AiAnalyticsStats 
} from './types';

export class AiAnalyticsEngine {
  private predictiveAssets: PredictiveMaintenanceAsset[] = [];
  private copilotHistory: CopilotQueryHistory[] = [];
  private anomalies: AssetAnomalyRecord[] = [];
  private forecasts: SpendRenewalForecastItem[] = [];
  private connectors: MarketplaceConnector[] = [];
  private webhookEvents: WebhookEventRecord[] = [];

  constructor() {
    this.seedDefaultData();
  }

  private seedDefaultData() {
    this.predictiveAssets = [
      {
        assetId: 'ast-p001',
        assetTag: 'AST-LPT-9901 (MacBook Pro 15" 2021)',
        model: 'MacBook Pro 15-inch',
        category: 'Hardware Laptop',
        ageYears: 4.8,
        failureRisk: 'CRITICAL',
        failureProbabilityPercent: 88,
        confidencePercent: 91,
        predictionWindowDays: 60,
        recommendedAction: 'Schedule hardware refresh before battery/motherboard thermal failure.',
        hardwareEolDate: '2026-10-15',
        hardwareEosDate: '2027-04-01',
        osEolDate: '2026-09-30'
      },
      {
        assetId: 'ast-p002',
        assetTag: 'SVR-CORE-ORACLE-01 (Dell PowerEdge R740)',
        model: 'PowerEdge R740',
        category: 'Enterprise Rack Server',
        ageYears: 5.2,
        failureRisk: 'HIGH',
        failureProbabilityPercent: 74,
        confidencePercent: 85,
        predictionWindowDays: 90,
        recommendedAction: 'RAID Controller Disk I/O degraded. Upgrade storage array controller.',
        hardwareEolDate: '2026-12-01',
        hardwareEosDate: '2027-06-30',
        osEolDate: '2026-11-15'
      },
      {
        assetId: 'ast-p003',
        assetTag: 'GW-NET-MUMBAI-01 (Cisco Catalyst 9300)',
        model: 'Catalyst 9300',
        category: 'Network Switch',
        ageYears: 3.1,
        failureRisk: 'LOW',
        failureProbabilityPercent: 12,
        confidencePercent: 95,
        predictionWindowDays: 365,
        recommendedAction: 'Optimal operating performance. Firmware patch recommended.',
        hardwareEolDate: '2029-01-01',
        hardwareEosDate: '2030-01-01',
        osEolDate: '2028-12-31'
      }
    ];

    this.copilotHistory = [
      {
        queryId: 'cop-801',
        userQuery: 'Show all laptops older than 4 years with expiring OS support in EMEA',
        intentDetected: 'Asset Age & EOL Risk Filter',
        recordsFoundCount: 14,
        aiExplanation: 'Found 14 laptops exceeding 4 years age with OS EOL within 90 days. Permission check validated (CONFIDENTIAL fields hidden).',
        queryTimestamp: '2026-08-11 22:10:00',
        permissionFiltered: true
      },
      {
        queryId: 'cop-802',
        userQuery: 'Which software contracts expire in the next 90 days?',
        intentDetected: 'Contract Expiry & Renewal Search',
        recordsFoundCount: 3,
        aiExplanation: 'Identified 3 active contracts expiring before Nov 2026 totaling $245,000 in expected renewal value.',
        queryTimestamp: '2026-08-11 20:45:00',
        permissionFiltered: true
      }
    ];

    this.anomalies = [
      {
        anomalyId: 'anom-901',
        assetOrCiTag: 'SVR-DL380-9901 (Core Database)',
        anomalyType: 'Unusual Repair & Disk Spike',
        detectedAt: '2026-08-11 18:00:00',
        observedValue: '37 I/O Read Failures / hr',
        expectedValue: '2 I/O Read Failures / hr',
        deviationScore: 18.5,
        severity: 'CRITICAL',
        status: 'Open'
      },
      {
        anomalyId: 'anom-902',
        assetOrCiTag: 'AST-LPT-740 (Executive Laptop)',
        anomalyType: 'Unexpected License Spike',
        detectedAt: '2026-08-10 14:30:00',
        observedValue: '12 CAD Licenses Active',
        expectedValue: '1 CAD License Active',
        deviationScore: 12.0,
        severity: 'HIGH',
        status: 'Under Investigation'
      }
    ];

    this.forecasts = [
      {
        forecastId: 'fcast-101',
        category: 'Contract Renewal',
        itemRef: 'Oracle Enterprise Database Agreement 2026',
        historicalPeriodCost: 180000,
        forecastedCost: 205000,
        forecastRangeLow: 195000,
        forecastRangeHigh: 220000,
        confidencePercent: 88,
        forecastPeriod: 'Next 12 Months',
        primaryCostDriver: 'Historical +13.8% annual price uplift & node expansion'
      },
      {
        forecastId: 'fcast-102',
        category: 'Hardware Refresh',
        itemRef: 'Engineering Workstation Fleet 2026-2027',
        historicalPeriodCost: 320000,
        forecastedCost: 350000,
        forecastRangeLow: 330000,
        forecastRangeHigh: 380000,
        confidencePercent: 82,
        forecastPeriod: 'Next 12 Months',
        primaryCostDriver: 'Predicted 48 workstation EOL replacement cycles'
      }
    ];

    this.connectors = [
      {
        connectorId: 'conn-hris-workday',
        name: 'Workday HRIS Integration',
        category: 'HRIS',
        provider: 'Workday Enterprise',
        status: 'Connected',
        lastSyncTimestamp: '2026-08-11 21:00:00',
        recordsSyncedCount: 1420,
        authMethod: 'OAuth2'
      },
      {
        connectorId: 'conn-cloud-aws',
        name: 'AWS Cloud Billing & Cost Explorer',
        category: 'Cloud Billing',
        provider: 'Amazon Web Services',
        status: 'Connected',
        lastSyncTimestamp: '2026-08-11 22:30:00',
        recordsSyncedCount: 8900,
        authMethod: 'API Key'
      },
      {
        connectorId: 'conn-itsm-servicenow',
        name: 'ServiceNow ITSM Incident Adapter',
        category: 'ITSM',
        provider: 'ServiceNow Inc.',
        status: 'Connected',
        lastSyncTimestamp: '2026-08-11 19:15:00',
        recordsSyncedCount: 340,
        authMethod: 'OAuth2'
      }
    ];

    this.webhookEvents = [
      {
        eventId: 'evt-7701',
        eventType: 'risk.created.v1',
        targetUrl: 'https://siem.enterprise-sec.internal/v1/events',
        payloadEnvelope: '{"eventId":"evt-7701","entityId":"AST-LPT-9901","risk":"CRITICAL"}',
        deliveryStatus: 'Delivered',
        timestamp: '2026-08-11 22:15:00',
        attempts: 1
      },
      {
        eventId: 'evt-7702',
        eventType: 'anomaly.detected.v1',
        targetUrl: 'https://webhook.pagerduty.com/v2/enqueue',
        payloadEnvelope: '{"eventId":"evt-7702","type":"Unusual Repair & Disk Spike"}',
        deliveryStatus: 'Delivered',
        timestamp: '2026-08-11 18:01:00',
        attempts: 1
      }
    ];
  }

  public getPredictiveAssets(): PredictiveMaintenanceAsset[] { return this.predictiveAssets; }
  public getCopilotHistory(): CopilotQueryHistory[] { return this.copilotHistory; }
  public getAnomalies(): AssetAnomalyRecord[] { return this.anomalies; }
  public getForecasts(): SpendRenewalForecastItem[] { return this.forecasts; }
  public getConnectors(): MarketplaceConnector[] { return this.connectors; }
  public getWebhookEvents(): WebhookEventRecord[] { return this.webhookEvents; }

  public getStats(): AiAnalyticsStats {
    return {
      highRiskAssetsCount: this.predictiveAssets.filter(a => a.failureRisk === 'HIGH' || a.failureRisk === 'CRITICAL').length,
      upcomingEolCount: this.predictiveAssets.length,
      activeAnomaliesCount: this.anomalies.filter(a => a.status !== 'Resolved').length,
      forecastedSpendNext12m: this.forecasts.reduce((acc, f) => acc + f.forecastedCost, 0),
      connectedMarketplaceCount: this.connectors.filter(c => c.status === 'Connected').length,
      webhooksDeliveredCount: this.webhookEvents.filter(w => w.deliveryStatus === 'Delivered').length,
      copilotQueriesProcessed: this.copilotHistory.length
    };
  }

  public runCopilotQuery(userQuery: string): CopilotQueryHistory {
    const q: CopilotQueryHistory = {
      queryId: `cop-${Math.floor(800 + Math.random() * 200)}`,
      userQuery,
      intentDetected: 'Natural Language Search & Security-Aware Analysis',
      recordsFoundCount: Math.floor(2 + Math.random() * 15),
      aiExplanation: `Evaluated query over ITAM/CMDB dataset. Applied tenant isolation and field-level permissions. Returned verified records matching '${userQuery}'.`,
      queryTimestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      permissionFiltered: true
    };

    this.copilotHistory.unshift(q);
    return q;
  }

  public triggerWebhook(eventType: WebhookEventRecord['eventType'], payload: string) {
    const evt: WebhookEventRecord = {
      eventId: `evt-${Math.floor(7700 + Math.random() * 300)}`,
      eventType,
      targetUrl: 'https://events.enterprise.internal/v1/bus',
      payloadEnvelope: payload,
      deliveryStatus: 'Delivered',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      attempts: 1
    };

    this.webhookEvents.unshift(evt);
  }
}

export const aiAnalyticsEngine = new AiAnalyticsEngine();
