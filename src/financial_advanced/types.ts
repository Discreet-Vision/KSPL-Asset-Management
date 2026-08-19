export type ContractType = 
  | 'MSA' 
  | 'SOW' 
  | 'License Agreement' 
  | 'Support Agreement' 
  | 'Cloud Agreement' 
  | 'Maintenance Contract';

export type ContractStatus = 'Draft' | 'Review' | 'Active' | 'Expiring' | 'Renewed' | 'Expired';

export type DepreciationMethod = 'Straight-Line' | 'Declining-Balance';

export type CloudProvider = 'AWS' | 'Azure' | 'GCP';

export interface ContractRecord {
  contractId: string;
  contractNumber: string;
  contractType: ContractType;
  vendor: string;
  startDate: string;
  endDate: string;
  renewalDate: string;
  contractValue: number;
  currency: 'USD' | 'INR' | 'EUR' | 'GBP';
  status: ContractStatus;
  owner: string;
  costCenter: string;
  daysRemaining: number;
  noticePeriodDays: number;
}

export interface AssetTcoRecord {
  assetId: string;
  assetName: string;
  category: string;
  purchaseCost: number;
  maintenanceCost: number;
  repairCost: number;
  supportCost: number;
  licenseCost: number;
  cloudCost: number;
  residualValue: number;
  totalTco: number;
}

export interface DepreciationScheduleItem {
  assetId: string;
  assetName: string;
  initialCost: number;
  method: DepreciationMethod;
  usefulLifeYears: number;
  residualValue: number;
  annualDepreciation: number;
  accumulatedDepreciation: number;
  currentBookValue: number;
}

export interface ChargebackAllocation {
  department: string;
  costCenter: string;
  hardwareCost: number;
  softwareCost: number;
  cloudCost: number;
  totalAllocation: number;
  allocationPercentage: number;
  type: 'Chargeback' | 'Showback';
}

export interface CloudFinOpsRecord {
  recordId: string;
  provider: CloudProvider;
  accountOrProject: string;
  serviceName: string;
  billingPeriod: string;
  cost: number;
  currency: 'USD' | 'INR' | 'EUR';
  unallocatedFlag: boolean;
  anomalyDetected: boolean;
  anomalyReason?: string;
}

export interface FinancialSummaryStats {
  totalContractValue: number;
  activeContractsCount: number;
  expiringContractsCount: number;
  totalItTco: number;
  accumulatedDepreciationTotal: number;
  totalCloudSpend: number;
  unallocatedCloudSpend: number;
}
