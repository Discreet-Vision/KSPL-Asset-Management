export type HardwareLifecycleState = 
  | 'Requested'
  | 'Approved'
  | 'Ordered'
  | 'Received'
  | 'Stockroom'
  | 'Assigned'
  | 'Deployed'
  | 'In Repair'
  | 'Returned'
  | 'Retired'
  | 'Pending Disposal'
  | 'Disposed';

export type StockroomCondition = 'New' | 'Good' | 'Used' | 'Fair' | 'Damaged' | 'Beyond Repair';

export type StockroomAssetStatus = 
  | 'Available' 
  | 'Reserved' 
  | 'Allocated' 
  | 'Damaged' 
  | 'Under Inspection' 
  | 'In Repair' 
  | 'Quarantined' 
  | 'Pending Disposal';

export type DataDestructionMethod = 
  | 'Secure Erase' 
  | 'Cryptographic Erase' 
  | 'Physical Destruction' 
  | 'Certified Data Wipe';

export type DataDestructionStatus = 
  | 'Required' 
  | 'Scheduled' 
  | 'In Progress' 
  | 'Completed' 
  | 'Failed' 
  | 'Verified';

export interface HardwareAsset {
  assetId: string;
  assetTag: string;
  serialNumber: string;
  manufacturer: string;
  model: string;
  category: 'Laptop' | 'Server' | 'Network Device' | 'Desktop' | 'Mobile';
  currentState: HardwareLifecycleState;
  previousState?: HardwareLifecycleState;
  stockroomLocation?: {
    stockroomName: string;
    zone: string;
    rack: string;
    shelf: string;
    bin: string;
  };
  condition: StockroomCondition;
  purchaseOrderRef?: string;
  assignedToUser?: string;
  warrantyEndDate: string;
  cost: number;
}

export interface StockroomInventory {
  stockroomId: string;
  stockroomName: string;
  location: string;
  zone: string;
  rack: string;
  shelf: string;
  bin: string;
  model: string;
  availableQuantity: number;
  reservedQuantity: number;
  reorderPoint: number;
  status: 'Normal' | 'Low Stock' | 'Critical Stock';
}

export interface DataDestructionRecord {
  recordId: string;
  assetTag: string;
  serialNumber: string;
  method: DataDestructionMethod;
  performedBy: string;
  witnessName?: string;
  destructionDate: string;
  status: DataDestructionStatus;
  verificationResult: 'Pass' | 'Fail' | 'Pending';
  certificateId: string;
  evidenceNotes: string;
}

export interface ChainOfCustodyEvent {
  eventId: string;
  assetTag: string;
  fromCustodian: string;
  toCustodian: string;
  transferDate: string;
  location: string;
  reason: string;
  evidenceRef: string;
}

export interface HamSummaryStats {
  totalHardwareAssets: number;
  inStockCount: number;
  deployedCount: number;
  inRepairCount: number;
  pendingDisposalCount: number;
  reorderAlertsCount: number;
  verifiedDataDestructionsCount: number;
}
