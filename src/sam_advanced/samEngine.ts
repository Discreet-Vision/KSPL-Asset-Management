import { 
  SoftwareEntitlement, 
  EffectiveLicensePosition, 
  PublisherCompliancePack, 
  CanonicalMapping, 
  ShadowItApplication, 
  AuditSimulationResult, 
  SamSummaryStats, 
  PublisherPackType 
} from './types';

export class SAMAdvancedEngine {
  private entitlements: SoftwareEntitlement[] = [];
  private elpRecords: EffectiveLicensePosition[] = [];
  private publisherPacks: PublisherCompliancePack[] = [];
  private normalizationQueue: CanonicalMapping[] = [];
  private shadowItApps: ShadowItApplication[] = [];
  private auditSimulations: AuditSimulationResult[] = [];

  constructor() {
    this.seedDefaultData();
  }

  private seedDefaultData() {
    this.entitlements = [
      {
        entitlementId: 'ent-msft-01',
        publisher: 'Microsoft',
        product: 'Microsoft 365 Enterprise',
        edition: 'E5',
        sku: 'AAD-34201-E5',
        metric: 'Per User',
        ownedQuantity: 1000,
        purchaseOrderRef: 'PO-88201',
        costCenter: 'CC-1005 (IT Ops)',
        startDate: '2025-01-01',
        endDate: '2027-12-31'
      },
      {
        entitlementId: 'ent-orcl-01',
        publisher: 'Oracle',
        product: 'Database Enterprise Edition',
        edition: '19c / 21c',
        sku: 'ORCL-DB-EE-PROC',
        metric: 'Per Core',
        ownedQuantity: 64,
        purchaseOrderRef: 'PO-99104',
        costCenter: 'CC-9001 (Core Platform)',
        startDate: '2024-06-01',
        endDate: '2027-05-31'
      },
      {
        entitlementId: 'ent-sap-01',
        publisher: 'SAP',
        product: 'S/4HANA Enterprise Management',
        edition: 'Professional User',
        sku: 'SAP-S4H-PRO-01',
        metric: 'Per User',
        ownedQuantity: 250,
        purchaseOrderRef: 'PO-77002',
        costCenter: 'CC-2001 (Finance & ERP)',
        startDate: '2025-03-15',
        endDate: '2028-03-14'
      },
      {
        entitlementId: 'ent-adbe-01',
        publisher: 'Adobe',
        product: 'Creative Cloud All Apps',
        edition: 'Enterprise',
        sku: 'ADBE-CC-ENT',
        metric: 'Per User',
        ownedQuantity: 150,
        purchaseOrderRef: 'PO-66103',
        costCenter: 'CC-4001 (Marketing)',
        startDate: '2025-09-01',
        endDate: '2026-08-31'
      }
    ];

    this.elpRecords = [
      {
        elpId: 'elp-01',
        publisher: 'Microsoft',
        product: 'Microsoft 365 Enterprise E5',
        edition: 'E5',
        metric: 'Per User',
        ownedQuantity: 1000,
        consumedQuantity: 920,
        elpDelta: 80,
        utilizationPercent: 92.0,
        complianceStatus: 'Compliant',
        ruleVersionUsed: 'Microsoft Licensing Pack v2.1',
        calculatedAt: '2026-08-11 22:00:00'
      },
      {
        elpId: 'elp-02',
        publisher: 'Oracle',
        product: 'Database Enterprise Edition',
        edition: '19c / 21c',
        metric: 'Per Core',
        ownedQuantity: 64,
        consumedQuantity: 80,
        elpDelta: -16,
        utilizationPercent: 125.0,
        complianceStatus: 'Under-Licensed',
        ruleVersionUsed: 'Oracle Processor Core Factor Pack v1.4',
        calculatedAt: '2026-08-11 22:00:00'
      },
      {
        elpId: 'elp-03',
        publisher: 'SAP',
        product: 'S/4HANA Enterprise Management',
        edition: 'Professional User',
        metric: 'Per User',
        ownedQuantity: 250,
        consumedQuantity: 210,
        elpDelta: 40,
        utilizationPercent: 84.0,
        complianceStatus: 'Compliant',
        ruleVersionUsed: 'SAP Engine & User Metric Pack v3.0',
        calculatedAt: '2026-08-11 22:00:00'
      },
      {
        elpId: 'elp-04',
        publisher: 'Adobe',
        product: 'Creative Cloud All Apps',
        edition: 'Enterprise',
        metric: 'Per User',
        ownedQuantity: 150,
        consumedQuantity: 162,
        elpDelta: -12,
        utilizationPercent: 108.0,
        complianceStatus: 'Under-Licensed',
        ruleVersionUsed: 'Adobe VIP Enterprise Pack v1.1',
        calculatedAt: '2026-08-11 22:00:00'
      }
    ];

    this.publisherPacks = [
      {
        packId: 'pack-msft',
        publisher: 'Microsoft',
        packVersion: 'v2.1 (2026)',
        effectiveDate: '2026-01-01',
        rulesDescription: 'M365 User Dual-Use Rights, SQL Server Core Licensing (Min 4 cores/processor), Windows Server Core + CAL',
        supportedMetrics: ['Per User', 'Per Core', 'Per Device'],
        status: 'Active'
      },
      {
        packId: 'pack-oracle',
        publisher: 'Oracle',
        packVersion: 'v1.4 (2026)',
        effectiveDate: '2026-01-01',
        rulesDescription: 'Processor Core Factor Table (0.50 for x86_64, 0.75 for SPARC), NUP minimums per processor (25 NUP/proc)',
        supportedMetrics: ['Per Core', 'Per Socket'],
        status: 'Active'
      },
      {
        packId: 'pack-sap',
        publisher: 'SAP',
        packVersion: 'v3.0 (2026)',
        effectiveDate: '2026-01-01',
        rulesDescription: 'Professional vs Functional User Classification, S/4HANA Engine Metrics, Indirect Static Access Rules',
        supportedMetrics: ['Per User'],
        status: 'Active'
      },
      {
        packId: 'pack-adobe',
        publisher: 'Adobe',
        packVersion: 'v1.1 (2026)',
        effectiveDate: '2026-01-01',
        rulesDescription: 'VIP Named User Subscription Assignment, Document Cloud & Creative Cloud Dual Deployment Checks',
        supportedMetrics: ['Per User', 'Per Device'],
        status: 'Active'
      },
      {
        packId: 'pack-ibm',
        publisher: 'IBM',
        packVersion: 'v2.0 (2026)',
        effectiveDate: '2026-01-01',
        rulesDescription: 'Processor Value Unit (PVU) & Resource Value Unit (RVU) Sub-Capacity Virtualization Rules',
        supportedMetrics: ['Per Core', 'Per CPU'],
        status: 'Active'
      }
    ];

    this.normalizationQueue = [
      {
        rawString: 'MSFT OFC 365 E5 (v16.0)',
        canonicalName: 'Microsoft 365 Enterprise E5',
        publisher: 'Microsoft',
        product: 'Microsoft 365',
        edition: 'E5',
        version: '16.0',
        confidenceScore: 98,
        matchingMethod: 'Exact',
        reviewStatus: 'Auto-Approved'
      },
      {
        rawString: 'Oracle DB EE 19.3.0.0.0 Linux x86',
        canonicalName: 'Oracle Database Enterprise Edition',
        publisher: 'Oracle',
        product: 'Database Enterprise Edition',
        edition: 'Enterprise Edition',
        version: '19.3',
        confidenceScore: 95,
        matchingMethod: 'Alias',
        reviewStatus: 'Auto-Approved'
      },
      {
        rawString: 'Adbe Creative Cld All Apps 2025',
        canonicalName: 'Adobe Creative Cloud All Apps',
        publisher: 'Adobe',
        product: 'Creative Cloud',
        edition: 'All Apps',
        version: '2025',
        confidenceScore: 78,
        matchingMethod: 'Fuzzy ML',
        reviewStatus: 'Pending Review'
      }
    ];

    this.shadowItApps = [
      {
        appId: 'shad-01',
        appName: 'Notion Workspace',
        publisher: 'Notion Labs Inc.',
        appUrl: 'https://notion.so',
        userCount: 142,
        firstSeen: '2026-02-10',
        lastSeen: '2026-08-11',
        discoverySource: 'SSO Logs',
        riskLevel: 'Medium',
        approvalStatus: 'Under Review',
        estimatedMonthlySpend: '$1,420 USD'
      },
      {
        appId: 'shad-02',
        appName: 'Airtable Pro',
        publisher: 'Formagrid Inc.',
        appUrl: 'https://airtable.com',
        userCount: 88,
        firstSeen: '2026-03-01',
        lastSeen: '2026-08-11',
        discoverySource: 'Expense Data',
        riskLevel: 'High',
        approvalStatus: 'Unapproved',
        estimatedMonthlySpend: '$1,760 USD'
      },
      {
        appId: 'shad-03',
        appName: 'Figma Organization',
        publisher: 'Figma Inc.',
        appUrl: 'https://figma.com',
        userCount: 65,
        firstSeen: '2025-11-15',
        lastSeen: '2026-08-11',
        discoverySource: 'OAuth Integration',
        riskLevel: 'Low',
        approvalStatus: 'Approved',
        estimatedMonthlySpend: '$2,925 USD'
      }
    ];

    this.auditSimulations = [
      {
        simulationId: 'sim-oracle-2026',
        publisher: 'Oracle',
        readinessScore: 74,
        estimatedFinancialExposure: '$145,000 USD',
        ruleVersion: 'Oracle Processor Core Factor Pack v1.4',
        simulatedAt: '2026-08-11 21:00:00',
        findingsCount: {
          underLicensed: 16,
          unlicensedDeployments: 4,
          staleEvidence: 2
        },
        defensePacketReady: true
      },
      {
        simulationId: 'sim-msft-2026',
        publisher: 'Microsoft',
        readinessScore: 92,
        estimatedFinancialExposure: '$0 USD',
        ruleVersion: 'Microsoft Licensing Pack v2.1',
        simulatedAt: '2026-08-11 20:30:00',
        findingsCount: {
          underLicensed: 0,
          unlicensedDeployments: 0,
          staleEvidence: 5
        },
        defensePacketReady: true
      }
    ];
  }

  public getEntitlements(): SoftwareEntitlement[] {
    return this.entitlements;
  }

  public getElpRecords(): EffectiveLicensePosition[] {
    return this.elpRecords;
  }

  public getPublisherPacks(): PublisherCompliancePack[] {
    return this.publisherPacks;
  }

  public getNormalizationQueue(): CanonicalMapping[] {
    return this.normalizationQueue;
  }

  public getShadowItApps(): ShadowItApplication[] {
    return this.shadowItApps;
  }

  public getAuditSimulations(): AuditSimulationResult[] {
    return this.auditSimulations;
  }

  public getSummaryStats(): SamSummaryStats {
    const totalEnt = this.entitlements.length;
    const totalProd = this.elpRecords.length;
    const compliant = this.elpRecords.filter(r => r.complianceStatus === 'Compliant').length;
    const underLic = this.elpRecords.filter(r => r.complianceStatus === 'Under-Licensed').length;
    const shadowApps = this.shadowItApps.length;
    const avgScore = Math.round(
      this.auditSimulations.reduce((acc, s) => acc + s.readinessScore, 0) / (this.auditSimulations.length || 1)
    );

    return {
      totalEntitlements: totalEnt,
      totalProductsMonitored: totalProd,
      compliantCount: compliant,
      underLicensedCount: underLic,
      shadowItAppsCount: shadowApps,
      avgAuditReadinessScore: avgScore
    };
  }

  public runAuditSimulation(publisher: PublisherPackType): AuditSimulationResult {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const score = publisher === 'Oracle' ? 74 : publisher === 'Microsoft' ? 92 : 85;
    const exposure = publisher === 'Oracle' ? '$145,000 USD' : publisher === 'Adobe' ? '$18,500 USD' : '$0 USD';

    const sim: AuditSimulationResult = {
      simulationId: `sim-${publisher.toLowerCase()}-${Date.now().toString().slice(-4)}`,
      publisher,
      readinessScore: score,
      estimatedFinancialExposure: exposure,
      ruleVersion: `${publisher} Compliance Pack v2026.8`,
      simulatedAt: timestamp,
      findingsCount: {
        underLicensed: publisher === 'Oracle' ? 16 : publisher === 'Adobe' ? 12 : 0,
        unlicensedDeployments: publisher === 'Oracle' ? 4 : 0,
        staleEvidence: 3
      },
      defensePacketReady: true
    };

    this.auditSimulations.unshift(sim);
    return sim;
  }

  public updateShadowItStatus(appId: string, newStatus: ShadowItApplication['approvalStatus']) {
    const app = this.shadowItApps.find(a => a.appId === appId);
    if (app) {
      app.approvalStatus = newStatus;
    }
  }

  public approveNormalization(rawString: string) {
    const item = this.normalizationQueue.find(q => q.rawString === rawString);
    if (item) {
      item.reviewStatus = 'Approved';
      item.confidenceScore = 100;
    }
  }
}

export const samAdvancedEngine = new SAMAdvancedEngine();
