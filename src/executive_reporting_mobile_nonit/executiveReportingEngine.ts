import { 
  ExecutiveKpiSummary, 
  ExecutiveAssetHealthRecord, 
  CustomBiReportConfig, 
  MobileFieldAuditRecord, 
  NonItEnterpriseAsset, 
  ReportingMobileNonItStats 
} from './types';

export class ExecutiveReportingEngine {
  private kpiSummary: ExecutiveKpiSummary;
  private healthRecords: ExecutiveAssetHealthRecord[] = [];
  private reports: CustomBiReportConfig[] = [];
  private mobileAudits: MobileFieldAuditRecord[] = [];
  private offlineQueue: MobileFieldAuditRecord[] = [];
  private nonItAssets: NonItEnterpriseAsset[] = [];

  constructor() {
    this.kpiSummary = {
      totalAssets: 4820,
      activeAssets: 4120,
      deployedAssets: 3890,
      inStockAssets: 230,
      inRepairAssets: 110,
      retiredAssets: 450,
      disposedAssets: 250,
      softwareCompliancePercent: 96.4,
      licenseCompliancePercent: 94.8,
      hardwareEolCount: 38,
      warrantyExpiringCount: 84,
      criticalRiskAssetsCount: 12,
      totalItSpendUsd: 4850000,
      hardwareSpendUsd: 2100000,
      softwareSpendUsd: 1950000,
      eWasteQuantityKg: 1420,
      sustainableDisposalPercent: 92.5
    };

    this.seedDefaultData();
  }

  private seedDefaultData() {
    this.healthRecords = [
      {
        healthId: 'hlth-101',
        assetTag: 'AST-SVR-402 (Oracle Database Core)',
        assetName: 'Dell PowerEdge R740 Server',
        category: 'Hardware Infrastructure',
        healthScorePercent: 42,
        healthStatus: 'Critical',
        topRiskFactor: 'RAID Disk Degradation & High CPU Temperature',
        department: 'Database Operations',
        location: 'Mumbai Data Center Tier 4'
      },
      {
        healthId: 'hlth-102',
        assetTag: 'AST-LPT-9901 (Executive Laptop)',
        assetName: 'MacBook Pro 15" M1',
        category: 'Workstation',
        healthScorePercent: 58,
        healthStatus: 'High-Risk',
        topRiskFactor: 'Battery Degraded (Cycle Count > 950)',
        department: 'Product Engineering',
        location: 'Bengaluru Campus'
      },
      {
        healthId: 'hlth-103',
        assetTag: 'GW-NET-MUMBAI-01 (Core Gateway)',
        assetName: 'Cisco Catalyst 9300 Switch',
        category: 'Networking',
        healthScorePercent: 98,
        healthStatus: 'Healthy',
        topRiskFactor: 'None - Operating within normal telemetry parameters',
        department: 'Infrastructure SecOps',
        location: 'Mumbai Data Center Tier 4'
      }
    ];

    this.reports = [
      {
        reportId: 'rep-custom-01',
        title: 'Q3 Executive Asset Risk & EOL Summary',
        dataSource: 'Assets',
        selectedFields: ['AssetTag', 'Category', 'RiskLevel', 'HardwareEolDate', 'Cost'],
        filterCriteria: 'RiskLevel IN ("HIGH", "CRITICAL") AND EolDays <= 90',
        scheduleFrequency: 'Weekly',
        exportFormat: 'PDF',
        recipientsCount: 6,
        lastExecuted: '2026-08-11 08:00:00',
        createdUser: 'VP IT Infrastructure'
      },
      {
        reportId: 'rep-custom-02',
        title: 'Global Non-IT Facilities & Fleet Audit',
        dataSource: 'Facilities',
        selectedFields: ['Name', 'Category', 'OperationalStatus', 'NextMaintenanceDue'],
        filterCriteria: 'OperationalStatus == "Under Maintenance"',
        scheduleFrequency: 'Monthly',
        exportFormat: 'Excel',
        recipientsCount: 4,
        lastExecuted: '2026-08-01 09:30:00',
        createdUser: 'Facilities Lead (S. Mehta)'
      }
    ];

    this.mobileAudits = [
      {
        auditScanId: 'mscan-701',
        scannedTagOrBarcode: 'AST-LPT-9901',
        assetName: 'MacBook Pro 15" M1',
        expectedSerial: 'C02FX9011MP',
        scannedSerial: 'C02FX9011MP',
        expectedLocation: 'Bengaluru Campus - Fl 3',
        scannedLocation: 'Bengaluru Campus - Fl 3',
        auditStatus: 'Verified',
        technicianUser: 'Tech-Auditor (R. Kumar)',
        timestamp: '2026-08-11 15:40:00',
        isOfflineSync: false
      },
      {
        auditScanId: 'mscan-702',
        scannedTagOrBarcode: 'FAC-HVAC-MUM-02',
        assetName: 'Chiller Plant HVAC Compressor',
        expectedSerial: 'TRANE-HVAC-8812',
        scannedSerial: 'TRANE-HVAC-8812',
        expectedLocation: 'Mumbai Data Center Basement',
        scannedLocation: 'Mumbai Data Center Basement',
        auditStatus: 'Verified',
        technicianUser: 'Field Tech (A. Verma)',
        timestamp: '2026-08-11 11:20:00',
        isOfflineSync: true
      }
    ];

    this.nonItAssets = [
      {
        nonItAssetId: 'nonit-fac-01',
        assetTag: 'FAC-HVAC-MUM-02',
        name: 'Trane Centrifugal Chiller HVAC Unit',
        category: 'Facilities',
        typeDetail: 'Data Center Primary Cooling Unit',
        serialNumber: 'TRANE-HVAC-8812',
        location: 'Mumbai Data Center Basement',
        assignedManager: 'Facilities Mgr (D. Joshi)',
        operationalStatus: 'Active',
        lastInspectionDate: '2026-07-15',
        nextMaintenanceDue: '2026-10-15',
        complianceRating: 'ISO 50001 Certified'
      },
      {
        nonItAssetId: 'nonit-fleet-02',
        assetTag: 'FLEET-VAN-BLR-09',
        name: 'Electric Field Service Van (Tata Ace EV)',
        category: 'Fleet',
        typeDetail: 'Field Logistics Service Vehicle',
        serialNumber: 'VIN-MH02-EV-9901',
        location: 'Bengaluru Logistics Hub',
        assignedManager: 'Fleet Dispatch (K. Nair)',
        operationalStatus: 'Active',
        lastInspectionDate: '2026-08-01',
        nextMaintenanceDue: '2026-11-01',
        complianceRating: 'EV Emission Zero-Carbon'
      },
      {
        nonItAssetId: 'nonit-ot-03',
        assetTag: 'OT-PLC-SIEMENS-01',
        name: 'Siemens S7-1500 Modular PLC Controller',
        category: 'OT / Industrial',
        typeDetail: 'Assembly Line Automation Controller',
        serialNumber: 'S71500-SN-44102',
        location: 'Manufacturing Plant 2',
        assignedManager: 'Plant OT Lead (V. Rao)',
        operationalStatus: 'Active',
        lastInspectionDate: '2026-06-20',
        nextMaintenanceDue: '2026-12-20',
        complianceRating: 'IEC 62443 Security Compliant'
      },
      {
        nonItAssetId: 'nonit-iot-04',
        assetTag: 'IOT-SENS-TEMP-99',
        name: 'LoRaWAN Environmental Temperature & Humidity Sensor',
        category: 'IoT / Edge',
        typeDetail: 'Wireless Server Rack Thermal Probe',
        serialNumber: 'LORA-SENS-7721',
        location: 'Mumbai Data Center Rack A-12',
        assignedManager: 'Data Center Tech',
        operationalStatus: 'Active',
        lastInspectionDate: '2026-08-10',
        nextMaintenanceDue: '2027-02-10',
        complianceRating: 'BLE/LoRa Approved'
      }
    ];
  }

  public getKpiSummary(): ExecutiveKpiSummary { return this.kpiSummary; }
  public getHealthRecords(): ExecutiveAssetHealthRecord[] { return this.healthRecords; }
  public getReports(): CustomBiReportConfig[] { return this.reports; }
  public getMobileAudits(): MobileFieldAuditRecord[] { return this.mobileAudits; }
  public getOfflineQueue(): MobileFieldAuditRecord[] { return this.offlineQueue; }
  public getNonItAssets(): NonItEnterpriseAsset[] { return this.nonItAssets; }

  public getStats(): ReportingMobileNonItStats {
    const totalHealth = this.healthRecords.reduce((acc, h) => acc + h.healthScorePercent, 0);
    const avgHealth = this.healthRecords.length > 0 ? Math.round(totalHealth / this.healthRecords.length) : 100;

    return {
      executiveHealthScoreAvg: avgHealth,
      scheduledReportsActive: this.reports.filter(r => r.scheduleFrequency !== 'None').length,
      fieldAuditsCompleted: this.mobileAudits.length,
      offlineSyncQueueCount: this.offlineQueue.length,
      nonItFacilitiesAssetsCount: this.nonItAssets.filter(a => a.category === 'Facilities').length,
      nonItFleetAssetsCount: this.nonItAssets.filter(a => a.category === 'Fleet').length,
      nonItOtIotAssetsCount: this.nonItAssets.filter(a => a.category === 'OT / Industrial' || a.category === 'IoT / Edge').length
    };
  }

  public createCustomReport(
    title: string, 
    dataSource: CustomBiReportConfig['dataSource'], 
    selectedFields: string[], 
    scheduleFrequency: CustomBiReportConfig['scheduleFrequency'],
    exportFormat: CustomBiReportConfig['exportFormat']
  ): CustomBiReportConfig {
    const rep: CustomBiReportConfig = {
      reportId: `rep-${Math.floor(100 + Math.random() * 900)}`,
      title,
      dataSource,
      selectedFields,
      filterCriteria: 'User Defined Drag-and-Drop Filter',
      scheduleFrequency,
      exportFormat,
      recipientsCount: 1,
      lastExecuted: new Date().toISOString().replace('T', ' ').substring(0, 19),
      createdUser: 'Authorized Executive User'
    };

    this.reports.unshift(rep);
    return rep;
  }

  public scanAndAuditAsset(barcodeOrTag: string, status: MobileFieldAuditRecord['auditStatus'], technician: string, isOffline: boolean) {
    const audit: MobileFieldAuditRecord = {
      auditScanId: `mscan-${Math.floor(700 + Math.random() * 300)}`,
      scannedTagOrBarcode: barcodeOrTag,
      assetName: `Scanned Asset (${barcodeOrTag})`,
      expectedSerial: 'SN-VERIFIED-9011',
      scannedSerial: 'SN-VERIFIED-9011',
      expectedLocation: 'Field Service Site A',
      scannedLocation: 'Field Service Site A',
      auditStatus: status,
      technicianUser: technician,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      isOfflineSync: isOffline
    };

    if (isOffline) {
      this.offlineQueue.push(audit);
    } else {
      this.mobileAudits.unshift(audit);
    }

    return audit;
  }

  public syncOfflineQueue(): number {
    const count = this.offlineQueue.length;
    while (this.offlineQueue.length > 0) {
      const item = this.offlineQueue.shift();
      if (item) {
        item.isOfflineSync = true;
        this.mobileAudits.unshift(item);
      }
    }
    return count;
  }
}

export const executiveReportingEngine = new ExecutiveReportingEngine();
