// ==================== READ-ONLY ITAM DATA ADAPTER ====================
// Consumes existing ITAM records strictly read-only for feature extraction & analytics.
// NEVER modifies underlying source ITAM data.

export interface ReadOnlyAsset {
  id: string;
  assetTag: string;
  name: string;
  assetType: 'Server' | 'Laptop' | 'Desktop' | 'Network Device' | 'VM' | 'Cloud Resource';
  model: string;
  vendor: string;
  status: 'Active' | 'In Repair' | 'Retired' | 'Stock' | 'Disposed';
  purchaseDate: string;
  purchaseCost: number;
  warrantyExpiration: string;
  assignedUser?: string;
  assignedDepartment: string;
  location: string;
  region: 'APAC' | 'AMER' | 'EMEA';
  incidentsCount90d: number;
  repairsCount6m: number;
  cpuUtilizationAvg?: number;
  memoryUtilizationAvg?: number;
  smartHealthStatus?: 'Healthy' | 'Warning' | 'Critical Failure Imminent';
  discoverySources: string[];
  osVersion?: string;
}

export interface ReadOnlyContract {
  id: string;
  contractNumber: string;
  vendorName: string;
  contractType: 'Software License' | 'Hardware Maintenance' | 'Cloud Subscription' | 'SLA';
  annualCost: number;
  startDate: string;
  endDate: string;
  renewalNoticeDays: number;
  status: 'Active' | 'Expiring Soon' | 'Expired';
}

export interface ReadOnlyLicense {
  id: string;
  softwareName: string;
  publisher: string;
  entitledSeats: number;
  consumedSeats: number;
  unitCost: number;
  status: 'Compliant' | 'Under-Licensed' | 'Over-Allocated';
}

export class ItamReadOnlyAdapter {
  private static mockAssets: ReadOnlyAsset[] = [
    {
      id: 'AST-10025',
      assetTag: 'LAPTOP-10025',
      name: 'Dell Latitude 7450',
      assetType: 'Laptop',
      model: 'Latitude 7450',
      vendor: 'Dell',
      status: 'Active',
      purchaseDate: '2021-03-15',
      purchaseCost: 125000,
      warrantyExpiration: '2024-03-15', // Expired
      assignedUser: 'Rahul Sharma',
      assignedDepartment: 'Finance',
      location: 'Mumbai HQ',
      region: 'APAC',
      incidentsCount90d: 12,
      repairsCount6m: 3,
      cpuUtilizationAvg: 78,
      memoryUtilizationAvg: 88,
      smartHealthStatus: 'Warning',
      discoverySources: ['Agent Discovery', 'SCCM', 'Intune'],
      osVersion: 'Windows 10 Enterprise (Build 1909)',
    },
    {
      id: 'SRV-8802',
      assetTag: 'SRV-APAC-001',
      name: 'Dell PowerEdge R750 Database Node',
      assetType: 'Server',
      model: 'PowerEdge R750',
      vendor: 'Dell',
      status: 'Active',
      purchaseDate: '2020-08-10',
      purchaseCost: 850000,
      warrantyExpiration: '2025-08-10', // Expiring in 90 days
      assignedDepartment: 'Infrastructure',
      location: 'Singapore Datacenter',
      region: 'APAC',
      incidentsCount90d: 8,
      repairsCount6m: 2,
      cpuUtilizationAvg: 92,
      memoryUtilizationAvg: 95,
      smartHealthStatus: 'Healthy',
      discoverySources: ['Agent Discovery', 'vCenter', 'Nmap Scanner'],
      osVersion: 'Red Hat Enterprise Linux 7.9',
    },
    {
      id: 'SRV-8803',
      assetTag: 'SRV-APAC-002',
      name: 'HPE ProLiant DL380 Gen10 App Server',
      assetType: 'Server',
      model: 'ProLiant DL380',
      vendor: 'HPE',
      status: 'Active',
      purchaseDate: '2019-11-20',
      purchaseCost: 920000,
      warrantyExpiration: '2024-11-20', // Expired
      assignedDepartment: 'Engineering',
      location: 'Tokyo Datacenter',
      region: 'APAC',
      incidentsCount90d: 14,
      repairsCount6m: 4,
      cpuUtilizationAvg: 98,
      memoryUtilizationAvg: 99,
      smartHealthStatus: 'Critical Failure Imminent',
      discoverySources: ['Agent Discovery', 'SNMP Trap'],
      osVersion: 'Windows Server 2012 R2',
    },
    {
      id: 'AST-10026',
      assetTag: 'LAPTOP-10026',
      name: 'MacBook Pro 16 M3 Max',
      assetType: 'Laptop',
      model: 'MacBook Pro 16',
      vendor: 'Apple',
      status: 'Active',
      purchaseDate: '2024-01-10',
      purchaseCost: 320000,
      warrantyExpiration: '2027-01-10',
      assignedUser: 'Priya Nair',
      assignedDepartment: 'Engineering',
      location: 'Bengaluru R&D',
      region: 'APAC',
      incidentsCount90d: 1,
      repairsCount6m: 0,
      cpuUtilizationAvg: 35,
      memoryUtilizationAvg: 50,
      smartHealthStatus: 'Healthy',
      discoverySources: ['Jamf Pro', 'Agent Discovery'],
      osVersion: 'macOS Sequoia 15.1',
    },
  ];

  private static mockContracts: ReadOnlyContract[] = [
    {
      id: 'CNT-9001',
      contractNumber: 'MS-M365-2026',
      vendorName: 'Microsoft',
      contractType: 'Software License',
      annualCost: 12500000,
      startDate: '2023-09-01',
      endDate: '2026-09-01', // Expiring in 20 days
      renewalNoticeDays: 60,
      status: 'Expiring Soon',
    },
    {
      id: 'CNT-9002',
      contractNumber: 'DELL-HW-SUPP-APAC',
      vendorName: 'Dell Technologies',
      contractType: 'Hardware Maintenance',
      annualCost: 4500000,
      startDate: '2023-11-15',
      endDate: '2026-11-15',
      renewalNoticeDays: 30,
      status: 'Active',
    },
    {
      id: 'CNT-9003',
      contractNumber: 'ORCL-DB-ENT-2026',
      vendorName: 'Oracle Corporation',
      contractType: 'Software License',
      annualCost: 18200000,
      startDate: '2023-10-01',
      endDate: '2026-10-01',
      renewalNoticeDays: 90,
      status: 'Expiring Soon',
    },
  ];

  private static mockLicenses: ReadOnlyLicense[] = [
    { id: 'LIC-01', softwareName: 'Microsoft 365 E5', publisher: 'Microsoft', entitledSeats: 1000, consumedSeats: 1120, unitCost: 32000, status: 'Under-Licensed' },
    { id: 'LIC-02', softwareName: 'Oracle Database 19c Enterprise', publisher: 'Oracle', entitledSeats: 50, consumedSeats: 65, unitCost: 450000, status: 'Under-Licensed' },
    { id: 'LIC-03', softwareName: 'Adobe Creative Cloud All Apps', publisher: 'Adobe', entitledSeats: 200, consumedSeats: 180, unitCost: 48000, status: 'Compliant' },
  ];

  public static async getAssets(): Promise<ReadOnlyAsset[]> {
    return [...this.mockAssets];
  }

  public static async getContracts(): Promise<ReadOnlyContract[]> {
    return [...this.mockContracts];
  }

  public static async getLicenses(): Promise<ReadOnlyLicense[]> {
    return [...this.mockLicenses];
  }
}
