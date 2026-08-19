import { 
  CiChangeRecord, 
  FieldChange, 
  CiBaseline, 
  ChangeSummaryStats, 
  AuthorizationStatus, 
  DriftStatus 
} from './types';
import { configurableReconciliationEngine } from '../reconciliation_engine/reconciliationEngine';

export class ChangeDetectionEngine {
  private changeRecords: CiChangeRecord[] = [];
  private baselines: CiBaseline[] = [];

  constructor() {
    this.seedDefaultData();
  }

  private seedDefaultData() {
    this.baselines = [
      {
        id: 'base-srv-v1',
        ciClass: 'Hardware',
        version: 'v1.2 (Prod Server Approved)',
        tenantId: 'tenant-kspl-global',
        approvedConfig: {
          'Operating System': 'Windows Server 2025',
          'RAM Memory': '64 GB',
          'Primary IP': '10.0.1.100',
          'Endpoint Security': 'CrowdStrike Falcon v7.1',
          'Required Services': 'Port 443, WinRM'
        },
        createdBy: 'SecOps Baseline Committee',
        createdAt: '2026-08-01 00:00:00'
      },
      {
        id: 'base-db-v1',
        ciClass: 'Database',
        version: 'v2.0 (Oracle Production)',
        tenantId: 'tenant-kspl-global',
        approvedConfig: {
          'Database Engine': 'Oracle 19c Enterprise',
          'Allocated Cores': '16 vCPU',
          'Storage Volume': '2 TB NVMe',
          'SGA Memory': '32 GB'
        },
        createdBy: 'DBA Architecture Team',
        createdAt: '2026-08-05 10:00:00'
      }
    ];

    this.changeRecords = [];
  }

  public getChangeRecords(): CiChangeRecord[] {
    return this.changeRecords;
  }

  public getBaselines(): CiBaseline[] {
    return this.baselines;
  }

  public getSummaryStats(): ChangeSummaryStats {
    const total = this.changeRecords.length;
    const unauth = this.changeRecords.filter(r => r.authorizationStatus === 'Unauthorized').length;
    const expected = this.changeRecords.filter(r => r.authorizationStatus === 'Authorized' || r.authorizationStatus === 'Expected').length;
    const highRisk = this.changeRecords.filter(r => r.riskScore >= 70).length;
    const openDrift = this.changeRecords.filter(r => r.driftStatus === 'Open Drift').length;

    return {
      totalChangesDetected: total,
      unauthorizedCount: unauth,
      expectedCount: expected,
      highCriticalRiskCount: highRisk,
      openDriftCount: openDrift,
      activeBaselinesCount: this.baselines.length
    };
  }

  /**
   * Run Field Comparison & Drift Engine for a specific CI
   */
  public runDriftAnalysisForCi(ciId: string): CiChangeRecord {
    const canonicalCis = configurableReconciliationEngine.getCanonicalCis();
    const ci = canonicalCis.find(c => c.id === ciId) || canonicalCis[0];

    const newRecord: CiChangeRecord = {
      id: `chg-rec-${Date.now()}`,
      ciId: ci?.id || 'ci-101',
      ciName: ci?.ciName || 'Unknown CI',
      ciClass: ci?.ciClass || 'Hardware',
      tenantId: 'tenant-kspl-global',
      detectedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      discoverySource: ci?.associatedDiscoverySources?.[0] || 'Agentless',
      fieldChanges: [
        {
          fieldName: 'OS Build Version',
          previousValue: 'v10.0.19045',
          currentValue: 'v10.0.22631 (23H2)',
          category: 'OS Change',
          severity: 'Medium',
          isDriftFromBaseline: true
        },
        {
          fieldName: 'Network Configuration (DNS)',
          previousValue: '10.0.0.1 (Primary)',
          currentValue: '8.8.8.8 (External Untrusted)',
          category: 'Network Change',
          severity: 'High',
          isDriftFromBaseline: true
        }
      ],
      authorizationStatus: 'Under Review',
      driftStatus: 'Open Drift',
      riskScore: 76,
      impactedServicesCount: 3,
      remediationRecommendation: 'Review DNS Server configuration. External DNS 8.8.8.8 violates enterprise security baseline.'
    };

    this.changeRecords.unshift(newRecord);
    return newRecord;
  }

  public updateAuthorizationStatus(recordId: string, status: AuthorizationStatus, driftStatus: DriftStatus): void {
    const rec = this.changeRecords.find(r => r.id === recordId);
    if (rec) {
      rec.authorizationStatus = status;
      rec.driftStatus = driftStatus;
    }
  }

  public createBaseline(ciClass: string, version: string, config: Record<string, string>): CiBaseline {
    const base: CiBaseline = {
      id: `base-${Date.now()}`,
      ciClass,
      version,
      tenantId: 'tenant-kspl-global',
      approvedConfig: config,
      createdBy: 'SecOps Compliance Lead',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    this.baselines.unshift(base);
    return base;
  }
}

export const changeDetectionEngine = new ChangeDetectionEngine();
