// ==================== ITAM READ-ONLY ADAPTER ====================
// Isolated read-only adapter bridging API Layer resolvers/controllers to ITAM data.
// Enforces strict multi-tenancy and field-level security data masking.

import { ApiTenantContext } from '../types/apiTypes';

export class ItamReadAdapter {
  private static assetsData = [
    {
      id: 'ENT-AST-1001',
      name: 'prod-app-node-01.dc1.internal',
      serialNumber: 'SRV-DL380-998811',
      category: 'Hardware',
      subCategory: 'Dell PowerEdge R750 Server',
      status: 'Active',
      lifecycleState: 'Assigned',
      criticality: 'CRITICAL',
      location: 'New Delhi Data Center DC-01',
      department: 'Infrastructure Operations',
      tenantId: 'tenant-kspl-global',
      ownerUser: 'Alexander Wright',
      ownerEmail: 'alexander.wright@enterprise.com',
      purchaseCost: 12500,
      contractValue: 45000,
      operatingSystem: {
        name: 'Red Hat Enterprise Linux',
        version: '9.3 x86_64',
        kernel: '5.14.0-362.8.1.el9_3',
      },
      installedSoftware: [
        { name: 'Docker Engine Enterprise', version: '24.0.7', publisher: 'Mirantis' },
        { name: 'OpenSSL Crypto Library', version: '3.0.7', publisher: 'OpenSSL' },
        { name: 'CrowdStrike Falcon Sensor', version: '7.08.16304', publisher: 'CrowdStrike' },
      ],
      relationships: [
        { type: 'hosted-by', targetId: 'CI-10002', targetName: 'DC1-Rack-B12-PDU' },
        { type: 'depends-on', targetId: 'CI-10003', targetName: 'Core-DB-Cluster-01' },
      ],
    },
    {
      id: 'ENT-AST-1002',
      name: 'macbook-pro-m3-usr909',
      serialNumber: 'C02G9988K3M',
      category: 'Hardware',
      subCategory: 'Apple MacBook Pro 16" M3 Max',
      status: 'Active',
      lifecycleState: 'Assigned',
      criticality: 'HIGH',
      location: 'Bengaluru R&D Hub',
      department: 'Software Engineering',
      tenantId: 'tenant-kspl-global',
      ownerUser: 'Priya Sharma',
      ownerEmail: 'priya.sharma@enterprise.com',
      purchaseCost: 3800,
      contractValue: 12000,
      operatingSystem: {
        name: 'macOS Sonoma',
        version: '14.4.1',
        kernel: 'Darwin 23.4.0',
      },
      installedSoftware: [
        { name: 'JetBrains IntelliJ IDEA Ultimate', version: '2024.1', publisher: 'JetBrains' },
        { name: 'Microsoft 365 Enterprise', version: '16.84', publisher: 'Microsoft' },
        { name: 'Jamf Pro Agent', version: '10.50.0', publisher: 'Jamf' },
      ],
      relationships: [
        { type: 'connects-to', targetId: 'CI-10004', targetName: 'BLR-Corporate-WIFI-6E' },
      ],
    },
    {
      id: 'ENT-AST-1003',
      name: 'core-db-pg16-cluster',
      serialNumber: 'VMD-CL-909123',
      category: 'Software / Database',
      subCategory: 'PostgreSQL HA Database Cluster',
      status: 'Active',
      lifecycleState: 'Assigned',
      criticality: 'CRITICAL',
      location: 'Mumbai Cloud Region ap-south-1',
      department: 'Database Services',
      tenantId: 'tenant-kspl-global',
      ownerUser: 'Vikram Mehta',
      ownerEmail: 'vikram.mehta@enterprise.com',
      purchaseCost: 28000,
      contractValue: 95000,
      operatingSystem: {
        name: 'Ubuntu Enterprise Server',
        version: '22.04.4 LTS',
        kernel: '5.15.0-101-generic',
      },
      installedSoftware: [
        { name: 'PostgreSQL Relational Database', version: '16.2', publisher: 'PostgreSQL Global Development Group' },
        { name: 'Patroni HA Daemon', version: '3.2.0', publisher: 'Zalando' },
      ],
      relationships: [
        { type: 'runs-on', targetId: 'ENT-AST-1001', targetName: 'prod-app-node-01.dc1.internal' },
      ],
    },
  ];

  private static cmdbCis = [
    {
      id: 'CI-10001',
      name: 'Global Online Banking API Gateway',
      type: 'Business Service',
      criticality: 'CRITICAL',
      status: 'Operational',
      tenantId: 'tenant-kspl-global',
      relationships: [
        { relationshipType: 'depends-on', target: { id: 'CI-10002', name: 'prod-app-node-01.dc1.internal', type: 'Server' } },
        { relationshipType: 'depends-on', target: { id: 'CI-10003', name: 'Core-DB-Cluster-01', type: 'Database' } },
        { relationshipType: 'connected-to', target: { id: 'CI-10004', name: 'AWS Route53 Global DNS', type: 'Cloud DNS' } },
      ],
    },
    {
      id: 'CI-10002',
      name: 'prod-app-node-01.dc1.internal',
      type: 'Server',
      criticality: 'CRITICAL',
      status: 'Operational',
      tenantId: 'tenant-kspl-global',
      relationships: [
        { relationshipType: 'runs-on', target: { id: 'CI-10005', name: 'ESXi Enterprise Hypervisor Host 04', type: 'Hypervisor' } },
        { relationshipType: 'hosted-by', target: { id: 'CI-10006', name: 'DC1 Data Center Rack B12', type: 'Physical Rack' } },
      ],
    },
    {
      id: 'CI-10003',
      name: 'Core-DB-Cluster-01',
      type: 'Database',
      criticality: 'CRITICAL',
      status: 'Operational',
      tenantId: 'tenant-kspl-global',
      relationships: [
        { relationshipType: 'contains', target: { id: 'CI-10007', name: 'Financial Ledger Primary Schema', type: 'Database Schema' } },
      ],
    },
  ];

  public static getAssets(ctx: ApiTenantContext, filters?: { status?: string; location?: string }) {
    let list = ItamReadAdapter.assetsData.filter((a) => a.tenantId === ctx.tenantId);

    if (filters?.status) {
      list = list.filter((a) => a.status.toLowerCase() === filters.status!.toLowerCase());
    }
    if (filters?.location) {
      list = list.filter((a) => a.location.toLowerCase().includes(filters.location!.toLowerCase()));
    }

    // Apply Field-Level Security Data Masking
    return list.map((ast) => this.applyFieldLevelMasking(ast, ctx));
  }

  public static getAssetById(id: string, ctx: ApiTenantContext) {
    const ast = ItamReadAdapter.assetsData.find((a) => a.id === id && a.tenantId === ctx.tenantId);
    if (!ast) return null;
    return this.applyFieldLevelMasking(ast, ctx);
  }

  public static getCiById(id: string, ctx: ApiTenantContext) {
    const ci = ItamReadAdapter.cmdbCis.find((c) => c.id === id && c.tenantId === ctx.tenantId);
    return ci || null;
  }

  public static getCis(ctx: ApiTenantContext) {
    return ItamReadAdapter.cmdbCis.filter((c) => c.tenantId === ctx.tenantId);
  }

  public static getBlastRadius(ciId: string, depth: number, ctx: ApiTenantContext) {
    const rootCi = this.getCiById(ciId, ctx);
    if (!rootCi) return [];

    const result: Array<{
      ciId: string;
      name: string;
      type: string;
      relationshipType: string;
      depth: number;
      criticality: string;
    }> = [];

    const traverse = (currentCiId: string, currentDepth: number) => {
      if (currentDepth > depth) return;
      const ci = this.getCiById(currentCiId, ctx);
      if (!ci) return;

      ci.relationships.forEach((rel) => {
        result.push({
          ciId: rel.target.id,
          name: rel.target.name,
          type: rel.target.type,
          relationshipType: rel.relationshipType,
          depth: currentDepth,
          criticality: 'CRITICAL',
        });
        traverse(rel.target.id, currentDepth + 1);
      });
    };

    traverse(ciId, 1);
    return result;
  }

  // Field-Level Security Authorization Masking
  private static applyFieldLevelMasking(ast: any, ctx: ApiTenantContext) {
    const cloned = JSON.parse(JSON.stringify(ast));

    // If user lacks financial scope or role, mask monetary fields
    const hasFinancialScope = ctx.scopes.includes('financial.view') || ctx.userRole === 'ADMIN' || ctx.userRole === 'FINANCE';
    if (!hasFinancialScope) {
      cloned.purchaseCost = '[MASKED_RESTRICTED_FIELD]';
      cloned.contractValue = '[MASKED_RESTRICTED_FIELD]';
    }

    return cloned;
  }
}
