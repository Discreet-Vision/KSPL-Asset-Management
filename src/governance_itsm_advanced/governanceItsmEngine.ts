import { 
  WorkflowDefinition, 
  WorkflowExecution, 
  ServiceCatalogItem, 
  SelfServiceRequest, 
  ItsmRecordLink, 
  FieldRbacRule, 
  ImmutableAuditRecord, 
  PolicyRule, 
  PolicyViolationRecord, 
  CveCorrelationItem, 
  GovernanceItsmStats 
} from './types';

export class GovernanceItsmEngine {
  private workflows: WorkflowDefinition[] = [];
  private executions: WorkflowExecution[] = [];
  private catalogItems: ServiceCatalogItem[] = [];
  private requests: SelfServiceRequest[] = [];
  private itsmRecords: ItsmRecordLink[] = [];
  private fieldRbacRules: FieldRbacRule[] = [];
  private auditTrail: ImmutableAuditRecord[] = [];
  private policies: PolicyRule[] = [];
  private violations: PolicyViolationRecord[] = [];
  private cveCorrelations: CveCorrelationItem[] = [];

  constructor() {
    this.seedDefaultData();
  }

  private seedDefaultData() {
    this.workflows = [
      {
        workflowId: 'wf-laptop-approval-v2',
        name: 'High-Value Hardware Approval Workflow',
        version: 'v2.1',
        triggerEvent: 'Asset Requested (Cost >= $1,000)',
        status: 'Active',
        createdDate: '2026-01-15',
        nodes: [
          { id: 'n1', type: 'START', label: 'Asset Request Submitted' },
          { id: 'n2', type: 'CONDITION', label: 'Cost >= $1,000 Check', conditionExpr: 'item.cost >= 1000' },
          { id: 'n3', type: 'APPROVAL', label: 'Line Manager Approval', assigneeRole: 'Manager' },
          { id: 'n4', type: 'APPROVAL', label: 'IT Security & Finance Approval', assigneeRole: 'Finance & SecOps' },
          { id: 'n5', type: 'ACTION', label: 'Reserve Stockroom Inventory', actionDetails: 'Call HAM Reserve API' },
          { id: 'n6', type: 'NOTIFICATION', label: 'Notify Employee & IT Fulfillment', actionDetails: 'Send Email + Portal Notice' },
          { id: 'n7', type: 'END', label: 'Fulfillment Completed' }
        ]
      },
      {
        workflowId: 'wf-cloud-access-v1',
        name: 'Cloud Infrastructure Privilege Workflow',
        version: 'v1.0',
        triggerEvent: 'Cloud Access Request',
        status: 'Active',
        createdDate: '2026-03-01',
        nodes: [
          { id: 'cn1', type: 'START', label: 'Cloud Access Submitted' },
          { id: 'cn2', type: 'APPROVAL', label: 'Cloud Architect Approval', assigneeRole: 'Cloud Lead' },
          { id: 'cn3', type: 'ACTION', label: 'Grant Temporary IAM Privilege', actionDetails: 'Invoke Cloud IAM API' },
          { id: 'cn4', type: 'END', label: 'Access Provisioned' }
        ]
      }
    ];

    this.executions = [
      {
        executionId: 'exec-8801',
        workflowName: 'High-Value Hardware Approval Workflow',
        version: 'v2.1',
        triggerSource: 'Request REQ-9011 (MacBook Pro 16")',
        currentStep: 'Line Manager Approval',
        status: 'Pending Approval',
        startedAt: '2026-08-11 14:20:10',
        approverRole: 'Manager (Rajesh Mehta)'
      },
      {
        executionId: 'exec-8802',
        workflowName: 'Cloud Infrastructure Privilege Workflow',
        version: 'v1.0',
        triggerSource: 'Request REQ-9010 (AWS Admin Role)',
        currentStep: 'Fulfillment Completed',
        status: 'Completed',
        startedAt: '2026-08-10 09:15:00',
        approverRole: 'Cloud Lead (Ananya Roy)'
      }
    ];

    this.catalogItems = [
      {
        itemId: 'cat-01',
        name: 'Developer Laptop Kit (MacBook Pro 16" M3 Max)',
        category: 'Hardware',
        description: '32GB RAM, 1TB SSD High-Performance Engineering Workstation',
        slaDays: 3,
        cost: 3400,
        approvalRequired: true,
        status: 'Available'
      },
      {
        itemId: 'cat-02',
        name: 'Standard Business Laptop (ThinkPad X1 Carbon)',
        category: 'Hardware',
        description: '16GB RAM, 512GB SSD Lightweight Executive Workstation',
        slaDays: 2,
        cost: 1850,
        approvalRequired: true,
        status: 'Available'
      },
      {
        itemId: 'cat-03',
        name: 'JetBrains All Products Pack License',
        category: 'Software',
        description: 'Annual Developer Productivity IDE License',
        slaDays: 1,
        cost: 650,
        approvalRequired: false,
        status: 'Available'
      }
    ];

    this.requests = [
      {
        requestId: 'REQ-9011',
        catalogItemName: 'Developer Laptop Kit (MacBook Pro 16" M3 Max)',
        requestedBy: 'Priya Sharma (Engineering)',
        department: 'Product Development',
        status: 'Approval Pending',
        submittedDate: '2026-08-11 14:20:00',
        expectedSla: '2026-08-14'
      },
      {
        requestId: 'REQ-9008',
        catalogItemName: 'JetBrains All Products Pack License',
        requestedBy: 'Amit Patel (DevOps)',
        department: 'Engineering',
        status: 'Completed',
        submittedDate: '2026-08-09 11:00:00',
        expectedSla: '2026-08-10'
      }
    ];

    this.itsmRecords = [
      {
        itsmId: 'INC-70091',
        type: 'Incident',
        title: 'High CPU & Disk I/O Degradation on Core Oracle Database',
        impactedCi: 'SVR-DL380-9901 (AST-SVR-402)',
        priority: 'P1 - Critical',
        status: 'In Progress',
        createdDate: '2026-08-11 18:45:00'
      },
      {
        itsmId: 'CHG-40012',
        type: 'Change',
        title: 'Production Gateway Security Patch Kernel Upgrade v6.2',
        impactedCi: 'GW-NET-MUMBAI-01',
        priority: 'P2 - High',
        status: 'Pending Review',
        createdDate: '2026-08-11 10:30:00'
      }
    ];

    this.fieldRbacRules = [
      {
        ruleId: 'rb-01',
        roleName: 'Standard Employee',
        fieldName: 'Asset.purchase_cost',
        classification: 'CONFIDENTIAL',
        permission: 'DENY'
      },
      {
        ruleId: 'rb-02',
        roleName: 'IT Operations Manager',
        fieldName: 'Asset.purchase_cost',
        classification: 'CONFIDENTIAL',
        permission: 'VIEW'
      },
      {
        ruleId: 'rb-03',
        roleName: 'All Roles',
        fieldName: 'Contract.vendor_security_credentials',
        classification: 'RESTRICTED',
        permission: 'DENY'
      }
    ];

    this.auditTrail = [
      {
        auditId: 'aud-9901',
        timestamp: '2026-08-11 22:30:15',
        tenantId: 'tenant-prod-main',
        user: 'SecOps Administrator (V. Singh)',
        action: 'POLICY_VIOLATION',
        entity: 'Policy Engine',
        entityId: 'POL-EOL-01',
        fieldChanged: 'RiskSeverity',
        beforeValue: 'MEDIUM',
        afterValue: 'HIGH',
        ipAddress: '10.200.4.15'
      },
      {
        auditId: 'aud-9902',
        timestamp: '2026-08-11 21:10:00',
        tenantId: 'tenant-prod-main',
        user: 'Compliance Officer (A. Roy)',
        action: 'EXPORT',
        entity: 'Immutable Audit Trail',
        entityId: 'EXPORT-AUD-8821',
        ipAddress: '10.200.4.88'
      }
    ];

    this.policies = [
      {
        policyId: 'POL-EOL-01',
        policyName: 'End-of-Life Operating System Policy',
        type: 'EOL',
        conditionSummary: 'IF OS == Windows Server 2012 / RHEL 7 THEN High Risk',
        riskSeverity: 'HIGH',
        activeViolationsCount: 2
      },
      {
        policyId: 'POL-ENC-02',
        policyName: 'Disk Encryption Compliance Policy',
        type: 'Encryption',
        conditionSummary: 'IF BitLocker / FileVault == Disabled THEN Critical Risk',
        riskSeverity: 'CRITICAL',
        activeViolationsCount: 1
      }
    ];

    this.violations = [
      {
        violationId: 'viol-101',
        policyName: 'End-of-Life Operating System Policy',
        assetOrCiName: 'SVR-LEGACY-MUMBAI-02',
        severity: 'HIGH',
        detectedAt: '2026-08-10 12:00:00',
        evidence: 'Detected active RHEL 7.2 release. EOL exceeded by 730 days.',
        state: 'Detected',
        owner: 'Infrastructure Team'
      },
      {
        violationId: 'viol-102',
        policyName: 'Disk Encryption Compliance Policy',
        assetOrCiName: 'AST-LPT-740 (MacBook Pro 16")',
        severity: 'CRITICAL',
        detectedAt: '2026-08-11 08:30:00',
        evidence: 'FileVault status reports Unencrypted / Keys Disabled.',
        state: 'In Remediation',
        owner: 'IT Helpdesk'
      }
    ];

    this.cveCorrelations = [
      {
        cveId: 'CVE-2026-22901',
        publisherProduct: 'OpenSSL Crypto Library (v1.1.1k)',
        installedVersion: '1.1.1k',
        affectedVersionRange: '>= 1.1.1a, < 1.1.1t',
        cvssScore: 9.8,
        severity: 'CRITICAL',
        affectedAssetCount: 4,
        remediationGuidance: 'Upgrade to OpenSSL 3.0.12 or apply vendor hotfix patch SSL-2026-9.',
        remediationStatus: 'Open'
      },
      {
        cveId: 'CVE-2026-18402',
        publisherProduct: 'Apache Log4j Core',
        installedVersion: '2.14.1',
        affectedVersionRange: '>= 2.0-beta9, <= 2.15.0',
        cvssScore: 8.5,
        severity: 'HIGH',
        affectedAssetCount: 2,
        remediationGuidance: 'Update Log4j dependency to 2.17.1 or remove JndiLookup class.',
        remediationStatus: 'In Progress'
      }
    ];
  }

  public getWorkflows(): WorkflowDefinition[] { return this.workflows; }
  public getExecutions(): WorkflowExecution[] { return this.executions; }
  public getCatalogItems(): ServiceCatalogItem[] { return this.catalogItems; }
  public getRequests(): SelfServiceRequest[] { return this.requests; }
  public getItsmRecords(): ItsmRecordLink[] { return this.itsmRecords; }
  public getFieldRbacRules(): FieldRbacRule[] { return this.fieldRbacRules; }
  public getAuditTrail(): ImmutableAuditRecord[] { return this.auditTrail; }
  public getPolicies(): PolicyRule[] { return this.policies; }
  public getViolations(): PolicyViolationRecord[] { return this.violations; }
  public getCveCorrelations(): CveCorrelationItem[] { return this.cveCorrelations; }

  public getStats(): GovernanceItsmStats {
    return {
      activeWorkflowsCount: this.workflows.filter(w => w.status === 'Active').length,
      pendingServiceRequestsCount: this.requests.filter(r => r.status === 'Approval Pending').length,
      openItsmIncidentsCount: this.itsmRecords.filter(i => i.status !== 'Closed').length,
      policyViolationsCount: this.violations.filter(v => v.state !== 'Resolved').length,
      criticalCveCount: this.cveCorrelations.filter(c => c.severity === 'CRITICAL').length,
      immutableAuditCount: this.auditTrail.length,
      restrictedFieldsConfigured: this.fieldRbacRules.length
    };
  }

  public submitSelfServiceRequest(itemName: string, requestedBy: string, dept: string): SelfServiceRequest {
    const item = this.catalogItems.find(i => i.name === itemName);
    const slaDays = item ? item.slaDays : 3;
    const slaDate = new Date(Date.now() + slaDays * 86400000).toISOString().split('T')[0];

    const req: SelfServiceRequest = {
      requestId: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
      catalogItemName: itemName,
      requestedBy,
      department: dept,
      status: item?.approvalRequired ? 'Approval Pending' : 'Fulfillment In Progress',
      submittedDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
      expectedSla: slaDate
    };

    this.requests.unshift(req);

    // Append to immutable audit trail
    this.appendAuditRecord('CREATE', 'SelfServiceRequest', req.requestId, 'Submitted self-service catalog request');

    return req;
  }

  public approveRequest(requestId: string) {
    const r = this.requests.find(item => item.requestId === requestId);
    if (r) {
      r.status = 'Completed';
      this.appendAuditRecord('UPDATE', 'SelfServiceRequest', requestId, 'Request approved and fulfilled');
    }
  }

  public appendAuditRecord(action: ImmutableAuditRecord['action'], entity: string, entityId: string, details: string) {
    this.auditTrail.unshift({
      auditId: `aud-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      tenantId: 'tenant-prod-main',
      user: 'SecOps Officer / Authorized User',
      action,
      entity,
      entityId,
      beforeValue: 'Pending',
      afterValue: details,
      ipAddress: '10.200.4.15'
    });
  }
}

export const governanceItsmEngine = new GovernanceItsmEngine();
