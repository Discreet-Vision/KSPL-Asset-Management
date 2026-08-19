export type NonItAssetCategory = 'Facilities' | 'Fleet' | 'OT / Industrial' | 'IoT / Edge';

export type FieldAuditStatus = 'Verified' | 'Mismatch' | 'Missing' | 'Damaged' | 'Moved' | 'Unknown';

export interface ExecutiveKpiSummary {
  totalAssets: number;
  activeAssets: number;
  deployedAssets: number;
  inStockAssets: number;
  inRepairAssets: number;
  retiredAssets: number;
  disposedAssets: number;
  softwareCompliancePercent: number;
  licenseCompliancePercent: number;
  hardwareEolCount: number;
  warrantyExpiringCount: number;
  criticalRiskAssetsCount: number;
  totalItSpendUsd: number;
  hardwareSpendUsd: number;
  softwareSpendUsd: number;
  eWasteQuantityKg: number;
  sustainableDisposalPercent: number;
}

export interface ExecutiveAssetHealthRecord {
  healthId: string;
  assetTag: string;
  assetName: string;
  category: string;
  healthScorePercent: number;
  healthStatus: 'Healthy' | 'Warning' | 'High-Risk' | 'Critical';
  topRiskFactor: string;
  department: string;
  location: string;
}

export interface CustomBiReportConfig {
  reportId: string;
  title: string;
  dataSource: 'Assets' | 'CMDB' | 'Contracts' | 'Financials' | 'Facilities' | 'Fleet' | 'Non-IT';
  selectedFields: string[];
  filterCriteria: string;
  scheduleFrequency: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'None';
  exportFormat: 'PDF' | 'Excel' | 'CSV';
  recipientsCount: number;
  lastExecuted: string;
  createdUser: string;
}

export interface MobileFieldAuditRecord {
  auditScanId: string;
  scannedTagOrBarcode: string;
  assetName: string;
  expectedSerial: string;
  scannedSerial: string;
  expectedLocation: string;
  scannedLocation: string;
  auditStatus: FieldAuditStatus;
  technicianUser: string;
  timestamp: string;
  isOfflineSync: boolean;
  photoRef?: string;
}

export interface NonItEnterpriseAsset {
  nonItAssetId: string;
  assetTag: string;
  name: string;
  category: NonItAssetCategory;
  typeDetail: string; // e.g. "Commercial HVAC Unit", "Delivery Van", "PLC Controller"
  serialNumber: string;
  location: string;
  assignedManager: string;
  operationalStatus: 'Active' | 'Under Maintenance' | 'Decommissioned' | 'Standby';
  lastInspectionDate: string;
  nextMaintenanceDue: string;
  complianceRating: string;
}

export interface ReportingMobileNonItStats {
  executiveHealthScoreAvg: number;
  scheduledReportsActive: number;
  fieldAuditsCompleted: number;
  offlineSyncQueueCount: number;
  nonItFacilitiesAssetsCount: number;
  nonItFleetAssetsCount: number;
  nonItOtIotAssetsCount: number;
}
