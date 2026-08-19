import { 
  HardwareAsset, 
  StockroomInventory, 
  DataDestructionRecord, 
  ChainOfCustodyEvent, 
  HamSummaryStats,
  HardwareLifecycleState 
} from './types';

export class HAMAdvancedEngine {
  private assets: HardwareAsset[] = [];
  private stockrooms: StockroomInventory[] = [];
  private destructionRecords: DataDestructionRecord[] = [];
  private chainOfCustodyEvents: ChainOfCustodyEvent[] = [];

  constructor() {
    this.seedDefaultData();
  }

  private seedDefaultData() {
    this.assets = [
      {
        assetId: 'hw-1001',
        assetTag: 'AST-LPT-881',
        serialNumber: 'PF-39A2019',
        manufacturer: 'Lenovo',
        model: 'ThinkPad X1 Carbon Gen 11',
        category: 'Laptop',
        currentState: 'Stockroom',
        previousState: 'Received',
        stockroomLocation: {
          stockroomName: 'Delhi Central Stockroom',
          zone: 'Zone A',
          rack: 'Rack 03',
          shelf: 'Shelf 02',
          bin: 'Bin B-15'
        },
        condition: 'New',
        purchaseOrderRef: 'PO-99102',
        warrantyEndDate: '2028-06-30',
        cost: 1850
      },
      {
        assetId: 'hw-1002',
        assetTag: 'AST-LPT-882',
        serialNumber: 'PF-39A2020',
        manufacturer: 'Lenovo',
        model: 'ThinkPad X1 Carbon Gen 11',
        category: 'Laptop',
        currentState: 'Assigned',
        previousState: 'Stockroom',
        assignedToUser: 'Rahul Sharma (Engineering)',
        condition: 'Good',
        purchaseOrderRef: 'PO-99102',
        warrantyEndDate: '2028-06-30',
        cost: 1850
      },
      {
        assetId: 'hw-1003',
        assetTag: 'AST-SVR-402',
        serialNumber: 'SVR-DL380-9901',
        manufacturer: 'HPE',
        model: 'ProLiant DL380 Gen11',
        category: 'Server',
        currentState: 'Deployed',
        previousState: 'Stockroom',
        stockroomLocation: {
          stockroomName: 'Mumbai Data Center Stockroom',
          zone: 'Zone C',
          rack: 'Rack 12',
          shelf: 'Shelf 01',
          bin: 'Bin S-01'
        },
        condition: 'Good',
        purchaseOrderRef: 'PO-88204',
        warrantyEndDate: '2027-12-31',
        cost: 12500
      },
      {
        assetId: 'hw-1004',
        assetTag: 'AST-LPT-740',
        serialNumber: 'MBP-16-M3-9021',
        manufacturer: 'Apple',
        model: 'MacBook Pro 16" M3 Max',
        category: 'Laptop',
        currentState: 'Pending Disposal',
        previousState: 'Retired',
        stockroomLocation: {
          stockroomName: 'Delhi Central Stockroom',
          zone: 'Zone Safe (Quarantine)',
          rack: 'Rack Q-1',
          shelf: 'Shelf 01',
          bin: 'Bin Q-05'
        },
        condition: 'Damaged',
        purchaseOrderRef: 'PO-66100',
        warrantyEndDate: '2025-01-15',
        cost: 3400
      }
    ];

    this.stockrooms = [
      {
        stockroomId: 'stk-delhi-01',
        stockroomName: 'Delhi Central Stockroom',
        location: 'Building A, Floor 2',
        zone: 'Zone A (Laptops)',
        rack: 'Rack 03',
        shelf: 'Shelf 02',
        bin: 'Bin B-15',
        model: 'ThinkPad X1 Carbon Gen 11',
        availableQuantity: 7,
        reservedQuantity: 3,
        reorderPoint: 10,
        status: 'Low Stock'
      },
      {
        stockroomId: 'stk-mumbai-01',
        stockroomName: 'Mumbai Data Center Stockroom',
        location: 'DC Facility 1, Vault B',
        zone: 'Zone C (Compute)',
        rack: 'Rack 12',
        shelf: 'Shelf 01',
        bin: 'Bin S-01',
        model: 'ProLiant DL380 Gen11',
        availableQuantity: 4,
        reservedQuantity: 1,
        reorderPoint: 3,
        status: 'Normal'
      }
    ];

    this.destructionRecords = [
      {
        recordId: 'dest-9001',
        assetTag: 'AST-LPT-740',
        serialNumber: 'MBP-16-M3-9021',
        method: 'Certified Data Wipe',
        performedBy: 'SecOps - Vikram Singh',
        witnessName: 'Compliance Auditor - Ananya Roy',
        destructionDate: '2026-08-11 18:30:00',
        status: 'Completed',
        verificationResult: 'Pass',
        certificateId: 'CERT-DW-2026-0811',
        evidenceNotes: '7-pass DoD 5220.22-M cryptographic sanitization drive log attached. Verified 0 recoverable sectors.'
      }
    ];

    this.chainOfCustodyEvents = [
      {
        eventId: 'coc-01',
        assetTag: 'AST-LPT-740',
        fromCustodian: 'Employee User (Design Team)',
        toCustodian: 'IT Service Desk (Delhi Stockroom)',
        transferDate: '2026-08-01 10:00:00',
        location: 'Delhi HQ IT Desk',
        reason: 'Asset Lifecycle Retirement',
        evidenceRef: 'RETIRE-REQ-882'
      },
      {
        eventId: 'coc-02',
        assetTag: 'AST-LPT-740',
        fromCustodian: 'IT Service Desk',
        toCustodian: 'Certified E-Waste Destruction Partner (Blancco)',
        transferDate: '2026-08-11 18:00:00',
        location: 'Delhi Secure Vault',
        reason: 'Certified Data Wipe & Physical Shredding',
        evidenceRef: 'DISPOSAL-PO-7701'
      }
    ];
  }

  public getAssets(): HardwareAsset[] {
    return this.assets;
  }

  public getStockrooms(): StockroomInventory[] {
    return this.stockrooms;
  }

  public getDestructionRecords(): DataDestructionRecord[] {
    return this.destructionRecords;
  }

  public getChainOfCustodyEvents(): ChainOfCustodyEvent[] {
    return this.chainOfCustodyEvents;
  }

  public getSummaryStats(): HamSummaryStats {
    return {
      totalHardwareAssets: this.assets.length,
      inStockCount: this.assets.filter(a => a.currentState === 'Stockroom').length,
      deployedCount: this.assets.filter(a => a.currentState === 'Deployed' || a.currentState === 'Assigned').length,
      inRepairCount: this.assets.filter(a => a.currentState === 'In Repair').length,
      pendingDisposalCount: this.assets.filter(a => a.currentState === 'Pending Disposal').length,
      reorderAlertsCount: this.stockrooms.filter(s => s.status !== 'Normal').length,
      verifiedDataDestructionsCount: this.destructionRecords.filter(d => d.verificationResult === 'Pass').length
    };
  }

  public transitionAssetState(assetId: string, newState: HardwareLifecycleState) {
    const asset = this.assets.find(a => a.assetId === assetId);
    if (asset) {
      asset.previousState = asset.currentState;
      asset.currentState = newState;

      // Add to chain of custody
      this.chainOfCustodyEvents.unshift({
        eventId: `coc-${Date.now().toString().slice(-4)}`,
        assetTag: asset.assetTag,
        fromCustodian: asset.assignedToUser || 'Stockroom Custodian',
        toCustodian: newState === 'Disposed' ? 'Certified Vendor' : 'IT Operations',
        transferDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
        location: asset.stockroomLocation?.stockroomName || 'Primary Facility',
        reason: `Lifecycle Transition to ${newState}`,
        evidenceRef: `TR-SYS-${Date.now().toString().slice(-4)}`
      });
    }
  }

  public recordDataDestruction(
    assetTag: string, 
    serialNumber: string, 
    method: DataDestructionRecord['method'],
    performedBy: string
  ): DataDestructionRecord {
    const certId = `CERT-DW-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const record: DataDestructionRecord = {
      recordId: `dest-${Date.now().toString().slice(-4)}`,
      assetTag,
      serialNumber,
      method,
      performedBy,
      witnessName: 'Compliance Manager',
      destructionDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
      status: 'Verified',
      verificationResult: 'Pass',
      certificateId: certId,
      evidenceNotes: 'Cryptographic wiping pattern verified. Hardware key zeroed.'
    };

    this.destructionRecords.unshift(record);
    return record;
  }
}

export const hamAdvancedEngine = new HAMAdvancedEngine();
