import { 
  ContractRecord, 
  AssetTcoRecord, 
  DepreciationScheduleItem, 
  ChargebackAllocation, 
  CloudFinOpsRecord, 
  FinancialSummaryStats,
  ContractStatus 
} from './types';

export class FinancialAdvancedEngine {
  private contracts: ContractRecord[] = [];
  private tcoRecords: AssetTcoRecord[] = [];
  private depreciationSchedules: DepreciationScheduleItem[] = [];
  private allocations: ChargebackAllocation[] = [];
  private cloudFinOpsRecords: CloudFinOpsRecord[] = [];

  constructor() {
    this.seedDefaultData();
  }

  private seedDefaultData() {
    this.contracts = [
      {
        contractId: 'cnt-01',
        contractNumber: 'CTR-MSFT-2025-09',
        contractType: 'License Agreement',
        vendor: 'Microsoft Corporation',
        startDate: '2025-01-01',
        endDate: '2026-12-31',
        renewalDate: '2026-10-01',
        contractValue: 450000,
        currency: 'USD',
        status: 'Active',
        owner: 'IT Procurement - S. Patel',
        costCenter: 'CC-1005 (IT Infrastructure)',
        daysRemaining: 141,
        noticePeriodDays: 90
      },
      {
        contractId: 'cnt-02',
        contractNumber: 'CTR-ORCL-2024-12',
        contractType: 'Support Agreement',
        vendor: 'Oracle Corporation',
        startDate: '2024-06-01',
        endDate: '2026-09-30',
        renewalDate: '2026-08-15',
        contractValue: 185000,
        currency: 'USD',
        status: 'Expiring',
        owner: 'Database Ops - V. Kumar',
        costCenter: 'CC-9001 (Core Database)',
        daysRemaining: 49,
        noticePeriodDays: 45
      },
      {
        contractId: 'cnt-03',
        contractNumber: 'CTR-AWS-2026-01',
        contractType: 'Cloud Agreement',
        vendor: 'Amazon Web Services',
        startDate: '2026-01-01',
        endDate: '2027-12-31',
        renewalDate: '2027-11-01',
        contractValue: 720000,
        currency: 'USD',
        status: 'Active',
        owner: 'Cloud Architecture - D. Shah',
        costCenter: 'CC-4002 (Cloud Platform)',
        daysRemaining: 506,
        noticePeriodDays: 60
      }
    ];

    this.tcoRecords = [
      {
        assetId: 'hw-1001',
        assetName: 'Lenovo ThinkPad X1 Carbon (AST-LPT-881)',
        category: 'Laptop',
        purchaseCost: 1850,
        maintenanceCost: 150,
        repairCost: 0,
        supportCost: 200,
        licenseCost: 450,
        cloudCost: 0,
        residualValue: 200,
        totalTco: 2450
      },
      {
        assetId: 'hw-1003',
        assetName: 'HPE ProLiant DL380 Gen11 (AST-SVR-402)',
        category: 'Server',
        purchaseCost: 12500,
        maintenanceCost: 1200,
        repairCost: 450,
        supportCost: 1800,
        licenseCost: 3200,
        cloudCost: 1500,
        residualValue: 1500,
        totalTco: 19150
      }
    ];

    this.depreciationSchedules = [
      {
        assetId: 'hw-1001',
        assetName: 'Lenovo ThinkPad X1 Carbon (AST-LPT-881)',
        initialCost: 1850,
        method: 'Straight-Line',
        usefulLifeYears: 3,
        residualValue: 200,
        annualDepreciation: 550,
        accumulatedDepreciation: 1100,
        currentBookValue: 750
      },
      {
        assetId: 'hw-1003',
        assetName: 'HPE ProLiant DL380 Gen11 (AST-SVR-402)',
        initialCost: 12500,
        method: 'Straight-Line',
        usefulLifeYears: 5,
        residualValue: 1500,
        annualDepreciation: 2200,
        accumulatedDepreciation: 4400,
        currentBookValue: 8100
      }
    ];

    this.allocations = [
      {
        department: 'Engineering & Product',
        costCenter: 'CC-2001',
        hardwareCost: 45000,
        softwareCost: 65000,
        cloudCost: 120000,
        totalAllocation: 230000,
        allocationPercentage: 45.0,
        type: 'Chargeback'
      },
      {
        department: 'Finance & Operations',
        costCenter: 'CC-1002',
        hardwareCost: 20000,
        softwareCost: 35000,
        cloudCost: 25000,
        totalAllocation: 80000,
        allocationPercentage: 15.6,
        type: 'Chargeback'
      },
      {
        department: 'Marketing & Sales',
        costCenter: 'CC-3005',
        hardwareCost: 18000,
        softwareCost: 42000,
        cloudCost: 30000,
        totalAllocation: 90000,
        allocationPercentage: 17.6,
        type: 'Showback'
      }
    ];

    this.cloudFinOpsRecords = [
      {
        recordId: 'finops-aws-01',
        provider: 'AWS',
        accountOrProject: 'prod-account-9021',
        serviceName: 'Amazon EC2 & Elastic Kubernetes Service',
        billingPeriod: '2026-07',
        cost: 42500,
        currency: 'USD',
        unallocatedFlag: false,
        anomalyDetected: false
      },
      {
        recordId: 'finops-azr-01',
        provider: 'Azure',
        accountOrProject: 'sub-enterprise-core',
        serviceName: 'Azure SQL Database Managed Instance',
        billingPeriod: '2026-07',
        cost: 28400,
        currency: 'USD',
        unallocatedFlag: false,
        anomalyDetected: true,
        anomalyReason: '+38% spike in storage IOPs consumption compared to baseline.'
      },
      {
        recordId: 'finops-gcp-01',
        provider: 'GCP',
        accountOrProject: 'prj-analytics-bi',
        serviceName: 'Google BigQuery & Vertex AI',
        billingPeriod: '2026-07',
        cost: 19200,
        currency: 'USD',
        unallocatedFlag: true,
        anomalyDetected: false
      }
    ];
  }

  public getContracts(): ContractRecord[] {
    return this.contracts;
  }

  public getTcoRecords(): AssetTcoRecord[] {
    return this.tcoRecords;
  }

  public getDepreciationSchedules(): DepreciationScheduleItem[] {
    return this.depreciationSchedules;
  }

  public getAllocations(): ChargebackAllocation[] {
    return this.allocations;
  }

  public getCloudFinOpsRecords(): CloudFinOpsRecord[] {
    return this.cloudFinOpsRecords;
  }

  public getSummaryStats(): FinancialSummaryStats {
    const totalContract = this.contracts.reduce((acc, c) => acc + c.contractValue, 0);
    const activeContracts = this.contracts.filter(c => c.status === 'Active').length;
    const expiringContracts = this.contracts.filter(c => c.status === 'Expiring').length;
    const totalTcoVal = this.tcoRecords.reduce((acc, t) => acc + t.totalTco, 0);
    const accumDep = this.depreciationSchedules.reduce((acc, d) => acc + d.accumulatedDepreciation, 0);
    const cloudSpend = this.cloudFinOpsRecords.reduce((acc, c) => acc + c.cost, 0);
    const unallocatedCloud = this.cloudFinOpsRecords
      .filter(c => c.unallocatedFlag)
      .reduce((acc, c) => acc + c.cost, 0);

    return {
      totalContractValue: totalContract,
      activeContractsCount: activeContracts,
      expiringContractsCount: expiringContracts,
      totalItTco: totalTcoVal,
      accumulatedDepreciationTotal: accumDep,
      totalCloudSpend: cloudSpend,
      unallocatedCloudSpend: unallocatedCloud
    };
  }

  public updateContractStatus(contractId: string, newStatus: ContractStatus) {
    const c = this.contracts.find(item => item.contractId === contractId);
    if (c) {
      c.status = newStatus;
    }
  }

  public calculateStraightLineDepreciation(cost: number, residual: number, usefulYears: number): number {
    if (usefulYears <= 0) return 0;
    return (cost - residual) / usefulYears;
  }
}

export const financialAdvancedEngine = new FinancialAdvancedEngine();
