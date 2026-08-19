import { 
  CiClass, 
  ConfigurationItem, 
  CiRelationship, 
  DiscoveryScanRecord, 
  NormalizationCatalogEntry, 
  CanonicalProduct, 
  SoftwareLicense, 
  LicenseConsumption, 
  EffectiveLicensePosition, 
  ContractRecord, 
  PurchaseOrderRecord, 
  CostCenterRecord, 
  DepreciationSchedule, 
  VendorRecord, 
  CiAssignment, 
  WorkflowDefinitionRecord, 
  WorkflowInstanceRecord, 
  ItsmTicketRecord, 
  VulnerabilityRecord, 
  CiVulnerabilityMatch, 
  PolicyRecord, 
  PolicyViolationRecord, 
  AuditLogRecord, 
  CmdbDataModelStats 
} from './types';

export class EnterpriseCmdbAdapter {
  private ciClasses: CiClass[] = [];
  private CIs: ConfigurationItem[] = [];
  private relationships: CiRelationship[] = [];
  private discoveryScans: DiscoveryScanRecord[] = [];
  private normalizations: NormalizationCatalogEntry[] = [];
  private canonicalProducts: CanonicalProduct[] = [];
  private licenses: SoftwareLicense[] = [];
  private consumptions: LicenseConsumption[] = [];
  private contracts: ContractRecord[] = [];
  private purchaseOrders: PurchaseOrderRecord[] = [];
  private costCenters: CostCenterRecord[] = [];
  private depreciationSchedules: DepreciationSchedule[] = [];
  private vendors: VendorRecord[] = [];
  private assignments: CiAssignment[] = [];
  private workflowDefs: WorkflowDefinitionRecord[] = [];
  private workflowInstances: WorkflowInstanceRecord[] = [];
  private tickets: ItsmTicketRecord[] = [];
  private vulnerabilities: VulnerabilityRecord[] = [];
  private vulnerabilityMatches: CiVulnerabilityMatch[] = [];
  private policies: PolicyRecord[] = [];
  private policyViolations: PolicyViolationRecord[] = [];
  private auditLogs: AuditLogRecord[] = [];

  constructor() {
    this.seedDefaultDataModel();
  }

  private seedDefaultDataModel() {
    // 1. CI Classes
    this.ciClasses = [
      { id: 'cls-hw', name: 'Hardware', parentClassId: null, attributeSchema: { serialNumber: 'string', manufacturer: 'string', model: 'string' } },
      { id: 'cls-server', name: 'Server', parentClassId: 'cls-hw', attributeSchema: { cpuCores: 'number', ramGb: 'number', hypervisor: 'string' } },
      { id: 'cls-laptop', name: 'Laptop', parentClassId: 'cls-hw', attributeSchema: { osVersion: 'string', macAddress: 'string' } },
      { id: 'cls-sw', name: 'Software', parentClassId: null, attributeSchema: { publisher: 'string', version: 'string' } },
      { id: 'cls-lic', name: 'License', parentClassId: 'cls-sw', attributeSchema: { metric: 'string', entitlement: 'number' } },
      { id: 'cls-cloud', name: 'Cloud Infrastructure', parentClassId: null, attributeSchema: { cloudProvider: 'string', region: 'string' } },
      { id: 'cls-fac', name: 'Facilities Asset', parentClassId: null, attributeSchema: { powerKw: 'number', hvacTone: 'string' } },
      { id: 'cls-fleet', name: 'Fleet Asset', parentClassId: null, attributeSchema: { vin: 'string', fuelType: 'string' } }
    ];

    // 2. CIs
    this.CIs = [
      {
        id: 'ci-srv-101',
        ciClassId: 'cls-server',
        className: 'Server',
        name: 'mumbai-db-core-01.internal',
        status: 'Active',
        discoverySource: 'Agentless SSH Discovery Engine',
        confidenceScore: 98,
        attributes: { manufacturer: 'Dell', model: 'PowerEdge R740', cpuCores: 64, ramGb: 512, hypervisor: 'VMware ESXi 7.0' },
        tenantId: 'tenant-global-01'
      },
      {
        id: 'ci-lpt-202',
        ciClassId: 'cls-laptop',
        className: 'Laptop',
        name: 'BLR-ENG-LPT-99',
        status: 'Active',
        discoverySource: 'Agent Endpoint Scanner',
        confidenceScore: 95,
        attributes: { manufacturer: 'Apple', model: 'MacBook Pro M1', osVersion: 'macOS 14.2', macAddress: '00:1A:2B:3C:4D:5E' },
        tenantId: 'tenant-global-01'
      },
      {
        id: 'ci-vm-303',
        ciClassId: 'cls-cloud',
        className: 'Cloud Virtual Machine',
        name: 'aws-ec2-prod-api-cluster',
        status: 'Active',
        discoverySource: 'Cloud API Sync Adapter',
        confidenceScore: 100,
        attributes: { cloudProvider: 'AWS', region: 'ap-south-1', instanceType: 'c5.4xlarge' },
        tenantId: 'tenant-global-01'
      }
    ];

    // 3. Relationships
    this.relationships = [
      {
        id: 'rel-01',
        sourceCiId: 'ci-srv-101',
        sourceCiName: 'mumbai-db-core-01.internal',
        targetCiId: 'ci-vm-303',
        targetCiName: 'aws-ec2-prod-api-cluster',
        relationshipType: 'hosted_by',
        discoveredAt: '2026-08-11 12:00:00'
      },
      {
        id: 'rel-02',
        sourceCiId: 'ci-lpt-202',
        sourceCiName: 'BLR-ENG-LPT-99',
        targetCiId: 'ci-srv-101',
        targetCiName: 'mumbai-db-core-01.internal',
        relationshipType: 'connects_to',
        discoveredAt: '2026-08-11 14:30:00'
      }
    ];

    // 4. Discovery Scans
    this.discoveryScans = [
      { id: 'disc-801', method: 'Agentless', targetRange: '10.200.0.0/16', startedAt: '2026-08-11 02:00:00', completedAt: '2026-08-11 02:15:00', status: 'Completed' },
      { id: 'disc-802', method: 'Cloud API', targetRange: 'AWS ap-south-1', startedAt: '2026-08-11 04:00:00', completedAt: '2026-08-11 04:05:00', status: 'Completed' }
    ];

    // 5. Canonical Products & Normalization
    this.canonicalProducts = [
      { id: 'can-prod-01', publisher: 'Microsoft', productName: 'Office 365 Enterprise E3', versionFamily: '2026', edition: 'Enterprise' },
      { id: 'can-prod-02', publisher: 'Oracle', productName: 'Database Enterprise Edition', versionFamily: '19c', edition: 'Enterprise' }
    ];

    this.normalizations = [
      { id: 'norm-101', rawStringPattern: 'MSFT OFC 365 E3', canonicalProductId: 'can-prod-01', matchType: 'Fuzzy' },
      { id: 'norm-102', rawStringPattern: 'Oracle DB 19c Ent', canonicalProductId: 'can-prod-02', matchType: 'Pattern' }
    ];

    // 6. Licenses & Consumption (ELP)
    this.licenses = [
      { id: 'lic-001', canonicalProductId: 'can-prod-01', productName: 'Office 365 Enterprise E3', licenseMetric: 'Per User', entitledQty: 1000, unitCostUsd: 240, expiryDate: '2027-03-31' },
      { id: 'lic-002', canonicalProductId: 'can-prod-02', productName: 'Oracle Database Enterprise Edition', licenseMetric: 'Per Core', entitledQty: 32, unitCostUsd: 12500, expiryDate: '2026-12-31' }
    ];

    this.consumptions = [
      { id: 'cons-01', licenseId: 'lic-001', ciId: 'ci-lpt-202', consumedUnits: 850, measuredAt: '2026-08-11' },
      { id: 'cons-02', licenseId: 'lic-002', ciId: 'ci-srv-101', consumedUnits: 40, measuredAt: '2026-08-11' } // Over-deployed: 40 consumed vs 32 entitled (-8 ELP)
    ];

    // 7. Contracts, Purchase Orders & Financials
    this.contracts = [
      { id: 'cntr-501', vendorId: 'vnd-oracle', vendorName: 'Oracle Financial Services', contractType: 'License Agreement', startDate: '2024-01-01', endDate: '2026-12-31', autoRenew: true, valueUsd: 400000 },
      { id: 'cntr-502', vendorId: 'vnd-dell', vendorName: 'Dell Technologies India', contractType: 'Maintenance', startDate: '2025-06-01', endDate: '2028-05-31', autoRenew: false, valueUsd: 180000 }
    ];

    this.purchaseOrders = [
      { id: 'po-9901', vendorId: 'vnd-dell', poNumber: 'PO-2026-MUM-881', orderDate: '2026-02-15', totalCostUsd: 120000, costCenterId: 'cc-infra-01' }
    ];

    this.costCenters = [
      { id: 'cc-infra-01', name: 'Global IT Infrastructure', departmentId: 'dept-it-infra', budgetOwner: 'VP IT Infra', annualBudgetUsd: 2500000 }
    ];

    this.depreciationSchedules = [
      {
        id: 'dep-01',
        ciId: 'ci-srv-101',
        ciName: 'mumbai-db-core-01.internal',
        method: 'Straight-Line',
        usefulLifeMonths: 36,
        salvageValueUsd: 2000,
        originalCostUsd: 18000,
        startDate: '2025-01-01',
        accumulatedDepreciationUsd: 9333,
        currentBookValueUsd: 8667
      }
    ];

    this.vendors = [
      { id: 'vnd-oracle', name: 'Oracle Corporation', contactEmail: 'licensing@oracle.com', riskRating: 'MEDIUM' },
      { id: 'vnd-dell', name: 'Dell Technologies', contactEmail: 'enterprise-support@dell.com', riskRating: 'LOW' }
    ];

    // 8. Assignments, Workflows & ITSM Tickets
    this.assignments = [
      { id: 'asgn-101', ciId: 'ci-lpt-202', userId: 'usr-901', userName: 'Rajesh Kumar (Lead Dev)', assignedAt: '2025-09-01', returnedAt: null }
    ];

    this.workflowDefs = [
      { id: 'wf-def-01', name: 'Asset Decommission & E-Waste Lifecycle Approval', triggerEvent: 'CI.Status.ChangedToRetired', stepsCount: 4 }
    ];

    this.workflowInstances = [
      { id: 'wf-inst-701', workflowDefId: 'wf-def-01', ciId: 'ci-srv-101', currentStep: 'Step 2: SecOps Sanitization Approval', status: 'Running', startedAt: '2026-08-10 10:00:00' }
    ];

    this.tickets = [
      { id: 'tkt-inc-9021', ciId: 'ci-srv-101', userId: 'usr-901', type: 'Incident', status: 'In Progress', createdAt: '2026-08-11 11:30:00' }
    ];

    // 9. Vulnerabilities & Policy Violations
    this.vulnerabilities = [
      { id: 'vuln-cve-2026-1001', cveId: 'CVE-2026-1001', severity: 'CRITICAL', affectedProductId: 'can-prod-02', publishedAt: '2026-07-20' }
    ];

    this.vulnerabilityMatches = [
      { id: 'vmatch-01', ciId: 'ci-srv-101', ciName: 'mumbai-db-core-01.internal', vulnerabilityId: 'vuln-cve-2026-1001', cveId: 'CVE-2026-1001', matchedAt: '2026-08-01', remediatedAt: null }
    ];

    this.policies = [
      { id: 'pol-01', name: 'Server Core License Over-Allocation Guard', ruleDefinition: 'ELP >= 0', severity: 'CRITICAL' },
      { id: 'pol-02', name: 'High Critical CVE Unremediated > 14 Days', ruleDefinition: 'CriticalVulnerabilityDays <= 14', severity: 'HIGH' }
    ];

    this.policyViolations = [
      { id: 'pviol-01', policyId: 'pol-01', policyName: 'Server Core License Over-Allocation Guard', ciId: 'ci-srv-101', detectedAt: '2026-08-11 08:00:00', resolvedAt: null, status: 'Detected' }
    ];

    this.auditLogs = [
      { id: 'aud-001', entityType: 'ConfigurationItem', entityId: 'ci-srv-101', action: 'Discovery', changedBy: 'Agentless Engine', changedAt: '2026-08-11 02:15:00', diffSummary: 'Updated attributes: cpuCores 64, ramGb 512' }
    ];
  }

  // Queries
  public getCiClasses(): CiClass[] { return this.ciClasses; }
  public getCIs(): ConfigurationItem[] { return this.CIs; }
  public getRelationships(): CiRelationship[] { return this.relationships; }
  public getDiscoveryScans(): DiscoveryScanRecord[] { return this.discoveryScans; }
  public getNormalizations(): NormalizationCatalogEntry[] { return this.normalizations; }
  public getCanonicalProducts(): CanonicalProduct[] { return this.canonicalProducts; }
  public getLicenses(): SoftwareLicense[] { return this.licenses; }
  public getContracts(): ContractRecord[] { return this.contracts; }
  public getPurchaseOrders(): PurchaseOrderRecord[] { return this.purchaseOrders; }
  public getCostCenters(): CostCenterRecord[] { return this.costCenters; }
  public getDepreciationSchedules(): DepreciationSchedule[] { return this.depreciationSchedules; }
  public getVendors(): VendorRecord[] { return this.vendors; }
  public getAssignments(): CiAssignment[] { return this.assignments; }
  public getWorkflowInstances(): WorkflowInstanceRecord[] { return this.workflowInstances; }
  public getTickets(): ItsmTicketRecord[] { return this.tickets; }
  public getVulnerabilityMatches(): CiVulnerabilityMatch[] { return this.vulnerabilityMatches; }
  public getPolicyViolations(): PolicyViolationRecord[] { return this.policyViolations; }
  public getAuditLogs(): AuditLogRecord[] { return this.auditLogs; }

  // ELP Calculator
  public getEffectiveLicensePositions(): EffectiveLicensePosition[] {
    return this.licenses.map(lic => {
      const totalConsumed = this.consumptions
        .filter(c => c.licenseId === lic.id)
        .reduce((sum, c) => sum + c.consumedUnits, 0);

      const elp = lic.entitledQty - totalConsumed;
      let status: EffectiveLicensePosition['complianceStatus'] = 'Compliant';
      if (elp < 0) status = 'Over-Allocated';
      else if (elp === 0) status = 'At-Risk';

      return {
        canonicalProductId: lic.canonicalProductId,
        productName: lic.productName,
        entitledQuantity: lic.entitledQty,
        consumedQuantity: totalConsumed,
        effectiveLicensePosition: elp,
        overDeploysCount: elp < 0 ? Math.abs(elp) : 0,
        complianceStatus: status
      };
    });
  }

  // Stats
  public getStats(): CmdbDataModelStats {
    const elpPositions = this.getEffectiveLicensePositions();
    const compliantCount = elpPositions.filter(p => p.complianceStatus === 'Compliant').length;
    const elpPercent = elpPositions.length > 0 ? Math.round((compliantCount / elpPositions.length) * 100) : 100;

    return {
      totalClassesCount: this.ciClasses.length,
      totalCisCount: this.CIs.length,
      totalRelationshipsCount: this.relationships.length,
      totalCanonicalProductsCount: this.canonicalProducts.length,
      totalActiveContractsCount: this.contracts.length,
      elpCompliantPercent: elpPercent,
      policyViolationsCount: this.policyViolations.filter(v => v.status !== 'Resolved').length
    };
  }

  // Add CI safely
  public addConfigurationItem(
    name: string,
    ciClassId: string,
    discoverySource: string,
    attributes: Record<string, any>
  ): ConfigurationItem {
    const cls = this.ciClasses.find(c => c.id === ciClassId);
    const newCi: ConfigurationItem = {
      id: `ci-${Math.floor(1000 + Math.random() * 9000)}`,
      ciClassId,
      className: cls ? cls.name : 'Generic CI',
      name,
      status: 'Active',
      discoverySource,
      confidenceScore: 99,
      attributes,
      tenantId: 'tenant-global-01'
    };

    this.CIs.unshift(newCi);
    this.auditLogs.unshift({
      id: `aud-${Math.floor(100 + Math.random() * 900)}`,
      entityType: 'ConfigurationItem',
      entityId: newCi.id,
      action: 'Create',
      changedBy: 'Admin User',
      changedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      diffSummary: `Created CI '${name}' in class '${newCi.className}'`
    });

    return newCi;
  }
}

export const enterpriseCmdbAdapter = new EnterpriseCmdbAdapter();
