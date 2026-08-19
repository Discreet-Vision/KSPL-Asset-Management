// ==================== PRESENTATION LAYER & MOBILE TYPES ====================

export type UserRoleType =
  | 'System Administrator'
  | 'IT Administrator'
  | 'IT Manager'
  | 'Asset Manager'
  | 'Security Manager'
  | 'Compliance Manager'
  | 'Finance Manager'
  | 'Procurement Manager'
  | 'Auditor'
  | 'Employee / End User';

export interface RoleDashboardWidget {
  id: string;
  title: string;
  widgetType: 'metric' | 'chart' | 'table' | 'action_list' | 'alert_feed';
  allowedRoles: UserRoleType[];
  dataSummary: string;
  metricValue?: string;
  metricChange?: string;
  chartData?: { label: string; value: number }[];
  tableData?: Record<string, any>[];
}

export interface SelfServiceAssetAction {
  id: string;
  actionType:
    | 'View Asset'
    | 'Request Asset'
    | 'Return Asset'
    | 'Report Lost Asset'
    | 'Report Damaged Asset'
    | 'Request Repair'
    | 'Request License';
  assetId?: string;
  assetName?: string;
  requestedBy: string;
  userEmail: string;
  department: string;
  urgency: 'Standard' | 'Urgent' | 'Emergency';
  reason: string;
  status: 'Pending Approval' | 'Approved' | 'In Fulfillment' | 'Completed' | 'Rejected';
  timestamp: string;
  tenantId: string;
}

export type ScanType = 'Barcode' | 'QR Code' | 'Asset Tag' | 'Serial Number';

export interface MobileScanResult {
  scanCode: string;
  scanType: ScanType;
  scannedAt: string;
  found: boolean;
  assetData?: {
    id: string;
    assetTag: string;
    serialNumber: string;
    name: string;
    type: string;
    model: string;
    vendor: string;
    status: string;
    assignedTo: string;
    location: string;
    department: string;
    warrantyExpiration: string;
  };
}

export interface MobileCheckInOutTransaction {
  id: string;
  transactionType: 'Check-Out' | 'Check-In' | 'Assignment' | 'Return' | 'Transfer';
  assetId: string;
  assetTag: string;
  assetName: string;
  performedByUserId: string;
  performedByUserName: string;
  targetUserId?: string;
  targetUserName?: string;
  fromLocation?: string;
  toLocation?: string;
  conditionNotes?: string;
  timestamp: string;
  status: 'Committed' | 'Queued Offline' | 'Sync Conflict';
  tenantId: string;
}

export interface MobileAuditVerificationRecord {
  id: string;
  assetId: string;
  assetTag: string;
  scannedSerial: string;
  scannedLocation: string;
  scannedUser: string;
  verifiedStatus: 'Verified Match' | 'Location Mismatch' | 'User Mismatch' | 'Not Found';
  auditorId: string;
  auditorName: string;
  verifiedAt: string;
  notes?: string;
  tenantId: string;
}

export interface OfflineSyncQueueItem {
  id: string;
  actionType: 'Check-Out' | 'Check-In' | 'Audit Verification' | 'Asset Transfer';
  payload: Record<string, any>;
  createdOfflineAt: string;
  deviceRegistrationId: string;
  syncStatus: 'Pending' | 'Syncing' | 'Synced' | 'Conflict Detected';
  conflictResolutionReason?: string;
}

export interface MobileSecurityProfile {
  deviceId: string;
  deviceName: string;
  osPlatform: 'Android' | 'iOS' | 'Mobile Web';
  biometricsEnabled: boolean;
  encryptedLocalStorageActive: boolean;
  sessionTimeoutMinutes: number;
  lastAuthenticatedAt: string;
  registeredToUser: string;
  isDeviceTrusted: boolean;
  remoteLogoutAvailable: boolean;
}
