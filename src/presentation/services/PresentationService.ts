// ==================== PRESENTATION & MOBILE ADAPTER SERVICE ====================
// Provides isolated, read-only adapters and transaction engines for Web SPA, Mobile Ops, and Self-Service.

import {
  RoleDashboardWidget,
  SelfServiceAssetAction,
  MobileScanResult,
  MobileCheckInOutTransaction,
  MobileAuditVerificationRecord,
  OfflineSyncQueueItem,
  MobileSecurityProfile,
  UserRoleType,
  ScanType,
} from '../types/presentationTypes';

export class PresentationService {
  private static offlineQueue: OfflineSyncQueueItem[] = [
    {
      id: 'off-q-101',
      actionType: 'Audit Verification',
      payload: { assetTag: 'LAPTOP-10025', serialNumber: 'DL-7450-998', location: 'Mumbai HQ', verifiedStatus: 'Verified Match' },
      createdOfflineAt: '2026-08-11 11:05:00',
      deviceRegistrationId: 'DEV-ANDROID-9012',
      syncStatus: 'Pending',
    },
    {
      id: 'off-q-102',
      actionType: 'Check-Out',
      payload: { assetTag: 'SRV-APAC-001', targetUser: 'Rahul Sharma', department: 'Infrastructure' },
      createdOfflineAt: '2026-08-11 11:12:00',
      deviceRegistrationId: 'DEV-IOS-4412',
      syncStatus: 'Pending',
    },
  ];

  private static selfServiceRequests: SelfServiceAssetAction[] = [
    {
      id: 'ssr-9001',
      actionType: 'Request Asset',
      assetName: 'MacBook Pro 16 M3 Max',
      requestedBy: 'Priya Nair',
      userEmail: 'p.nair@company.com',
      department: 'Engineering',
      urgency: 'Standard',
      reason: 'Replacement for aging laptop',
      status: 'In Fulfillment',
      timestamp: '2026-08-11 09:30:00',
      tenantId: 'tenant-kspl-global',
    },
    {
      id: 'ssr-9002',
      actionType: 'Report Damaged Asset',
      assetId: 'AST-10025',
      assetName: 'Dell Latitude 7450',
      requestedBy: 'Rahul Sharma',
      userEmail: 'r.sharma@company.com',
      department: 'Finance',
      urgency: 'Urgent',
      reason: 'Keyboard backlight failed & battery swelling',
      status: 'Pending Approval',
      timestamp: '2026-08-11 10:15:00',
      tenantId: 'tenant-kspl-global',
    },
  ];

  public static getDashboardWidgetsForRole(role: UserRoleType): RoleDashboardWidget[] {
    const allWidgets: RoleDashboardWidget[] = [
      {
        id: 'w-asset-overview',
        title: 'Enterprise Asset Overview',
        widgetType: 'metric',
        allowedRoles: ['System Administrator', 'IT Administrator', 'IT Manager', 'Asset Manager', 'Auditor'],
        dataSummary: 'Total Hardware & Virtual Assets',
        metricValue: '1,248 Units',
        metricChange: '+4.2% YoY',
      },
      {
        id: 'w-compliance-score',
        title: 'Compliance & Audit Readiness',
        widgetType: 'metric',
        allowedRoles: ['System Administrator', 'Compliance Manager', 'Security Manager', 'Auditor'],
        dataSummary: 'Software License ELP Score',
        metricValue: '94.8 %',
        metricChange: '2 Deficits Flagged',
      },
      {
        id: 'w-financial-tco',
        title: 'Total Cost of Ownership (TCO)',
        widgetType: 'metric',
        allowedRoles: ['System Administrator', 'Finance Manager', 'Procurement Manager'],
        dataSummary: 'Annual IT Capital & Operational Spend',
        metricValue: '₹8.84 Crores',
        metricChange: '+3.1% Budget Shift',
      },
      {
        id: 'w-my-assets',
        title: 'My Assigned Workstation & Licenses',
        widgetType: 'table',
        allowedRoles: ['Employee / End User', 'IT Administrator', 'Asset Manager'],
        dataSummary: 'Current Equipment Assigned to Your Profile',
        tableData: [
          { 'Asset Tag': 'LAPTOP-10026', Name: 'MacBook Pro 16 M3', Serial: 'C02GX99812', Status: 'Assigned' },
          { 'License Name': 'Microsoft 365 E5', Type: 'SaaS Seat', Status: 'Active' },
        ],
      },
    ];

    return allWidgets.filter((w) => w.allowedRoles.includes(role) || role === 'System Administrator');
  }

  public static async scanAssetIdentifier(identifier: string, scanType: ScanType): Promise<MobileScanResult> {
    const idClean = identifier.trim().toUpperCase();

    if (idClean.includes('10025') || idClean.includes('LAPTOP')) {
      return {
        scanCode: identifier,
        scanType,
        scannedAt: new Date().toLocaleTimeString(),
        found: true,
        assetData: {
          id: 'AST-10025',
          assetTag: 'LAPTOP-10025',
          serialNumber: 'DL-7450-998',
          name: 'Dell Latitude 7450',
          type: 'Laptop',
          model: 'Latitude 7450',
          vendor: 'Dell',
          status: 'Assigned',
          assignedTo: 'Rahul Sharma',
          location: 'Mumbai HQ',
          department: 'Finance',
          warrantyExpiration: '2024-03-15 (Expired)',
        },
      };
    } else if (idClean.includes('8802') || idClean.includes('SRV')) {
      return {
        scanCode: identifier,
        scanType,
        scannedAt: new Date().toLocaleTimeString(),
        found: true,
        assetData: {
          id: 'SRV-8802',
          assetTag: 'SRV-APAC-001',
          serialNumber: 'PE-R750-7711',
          name: 'Dell PowerEdge R750 Database Node',
          type: 'Server',
          model: 'PowerEdge R750',
          vendor: 'Dell',
          status: 'Active',
          assignedTo: 'Unassigned (Server)',
          location: 'Singapore Datacenter',
          department: 'Infrastructure',
          warrantyExpiration: '2025-08-10 (Expiring Soon)',
        },
      };
    }

    return {
      scanCode: identifier,
      scanType,
      scannedAt: new Date().toLocaleTimeString(),
      found: false,
    };
  }

  public static async processCheckOut(
    assetId: string,
    targetUser: string,
    performer: string
  ): Promise<MobileCheckInOutTransaction> {
    return {
      id: `tx-chk-${Date.now()}`,
      transactionType: 'Check-Out',
      assetId,
      assetTag: `TAG-${assetId}`,
      assetName: `Asset (${assetId})`,
      performedByUserId: performer,
      performedByUserName: performer,
      targetUserName: targetUser,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      status: 'Committed',
      tenantId: 'tenant-kspl-global',
    };
  }

  public static async recordPhysicalAudit(
    assetId: string,
    status: 'Verified Match' | 'Location Mismatch' | 'User Mismatch' | 'Not Found',
    notes?: string
  ): Promise<MobileAuditVerificationRecord> {
    return {
      id: `aud-rec-${Date.now()}`,
      assetId,
      assetTag: `TAG-${assetId}`,
      scannedSerial: 'SN-99812-VERIFIED',
      scannedLocation: 'Mumbai HQ Floor 4',
      scannedUser: 'Jitin (Admin)',
      verifiedStatus: status,
      auditorId: 'USR-8801',
      auditorName: 'Jitin (Auditor)',
      verifiedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      notes: notes || 'Physical audit completed via mobile barcode scanner.',
      tenantId: 'tenant-kspl-global',
    };
  }

  public static getOfflineQueue(): OfflineSyncQueueItem[] {
    return [...this.offlineQueue];
  }

  public static async syncOfflineQueue(): Promise<{ syncedCount: number; conflictsCount: number }> {
    const count = this.offlineQueue.length;
    this.offlineQueue = [];
    return { syncedCount: count, conflictsCount: 0 };
  }

  public static getMobileSecurityProfile(): MobileSecurityProfile {
    return {
      deviceId: 'DEV-ANDROID-9012',
      deviceName: 'Samsung Galaxy S24 Ultra (Field Tech)',
      osPlatform: 'Android',
      biometricsEnabled: true,
      encryptedLocalStorageActive: true,
      sessionTimeoutMinutes: 15,
      lastAuthenticatedAt: new Date().toLocaleTimeString(),
      registeredToUser: 'Jitin (Field Tech)',
      isDeviceTrusted: true,
      remoteLogoutAvailable: true,
    };
  }

  public static getSelfServiceRequests(): SelfServiceAssetAction[] {
    return [...this.selfServiceRequests];
  }

  public static async submitSelfServiceAction(action: Omit<SelfServiceAssetAction, 'id' | 'timestamp' | 'status'>): Promise<SelfServiceAssetAction> {
    const record: SelfServiceAssetAction = {
      ...action,
      id: `ssr-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      status: 'Pending Approval',
    };
    this.selfServiceRequests.unshift(record);
    return record;
  }
}
