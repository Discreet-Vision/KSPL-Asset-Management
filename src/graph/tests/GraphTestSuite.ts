// ==================== AUTOMATED GRAPH LAYER TEST SUITE ====================
// Isolated unit & integration tests verifying graph layer capabilities and regression protections.

import { AgeGraphAdapter } from '../adapters/AgeGraphAdapter';
import { BlastRadiusAnalysisEngine } from '../services/BlastRadiusAnalysisEngine';
import { GraphSynchronizationService } from '../services/GraphSynchronizationService';
import { GraphQueryAdapter } from '../adapters/GraphQueryAdapter';

export interface TestResult {
  testName: string;
  passed: boolean;
  message: string;
  durationMs: number;
}

export class GraphTestSuite {
  public static async runAllTests(tenantId: string = 'tenant-kspl-global'): Promise<TestResult[]> {
    const results: TestResult[] = [];

    // Test 1: Node & Relationship Creation
    try {
      const startTime = performance.now();
      const adapter = new AgeGraphAdapter();
      const node = await adapter.getNodeById('ci-srv-9001', tenantId);
      const passed = node !== null && node.label.includes('PostgreSQL');
      results.push({
        testName: 'Graph Node Lookup & Schema Mapping',
        passed,
        message: passed ? 'Successfully verified node instantiation in graph layer.' : 'Node lookup failed.',
        durationMs: Math.round(performance.now() - startTime),
      });
    } catch (e: any) {
      results.push({ testName: 'Graph Node Lookup & Schema Mapping', passed: false, message: e.message, durationMs: 0 });
    }

    // Test 2: Dependency Traversal & Blast Radius Calculation
    try {
      const startTime = performance.now();
      const blast = await BlastRadiusAnalysisEngine.calculateBlastRadius('ci-srv-10025', 3, tenantId);
      const passed = blast.totalAffectedNodes > 0 && blast.overallRiskLevel !== undefined;
      results.push({
        testName: 'Multi-Level Dependency Traversal & Blast Radius',
        passed,
        message: passed ? `Calculated blast radius: ${blast.totalAffectedNodes} nodes affected with Risk Level ${blast.overallRiskLevel}.` : 'Blast radius calculation failed.',
        durationMs: Math.round(performance.now() - startTime),
      });
    } catch (e: any) {
      results.push({ testName: 'Multi-Level Dependency Traversal & Blast Radius', passed: false, message: e.message, durationMs: 0 });
    }

    // Test 3: Change Impact Analysis
    try {
      const startTime = performance.now();
      const impact = await BlastRadiusAnalysisEngine.analyzeChangeImpact({
        ciId: 'ci-srv-9001',
        changeType: 'Operating System Upgrade',
        tenantId,
      });
      const passed = impact.riskScore > 0 && impact.mitigationRecommendations.length > 0;
      results.push({
        testName: 'Analytical Change Impact Simulation',
        passed,
        message: passed ? `Simulated change impact: Risk Score ${impact.riskScore}/100.` : 'Change impact failed.',
        durationMs: Math.round(performance.now() - startTime),
      });
    } catch (e: any) {
      results.push({ testName: 'Analytical Change Impact Simulation', passed: false, message: e.message, durationMs: 0 });
    }

    // Test 4: Single Point of Failure (SPOF) Detection
    try {
      const startTime = performance.now();
      const spofs = await BlastRadiusAnalysisEngine.detectSinglePointsOfFailure(tenantId);
      const passed = spofs.length > 0;
      results.push({
        testName: 'Single Point of Failure (SPOF) Detection',
        passed,
        message: passed ? `Identified ${spofs.length} SPOF candidate nodes with centrality scoring.` : 'SPOF detection failed.',
        durationMs: Math.round(performance.now() - startTime),
      });
    } catch (e: any) {
      results.push({ testName: 'Single Point of Failure (SPOF) Detection', passed: false, message: e.message, durationMs: 0 });
    }

    // Test 5: Tenant Isolation Enforcement
    try {
      const startTime = performance.now();
      const adapter = new AgeGraphAdapter();
      const crossTenantNode = await adapter.getNodeById('ci-srv-9001', 'unauthorized-tenant-xyz');
      const passed = crossTenantNode === null; // Must be null due to tenant isolation
      results.push({
        testName: 'Strict Tenant Isolation Enforcement',
        passed,
        message: passed ? 'Tenant isolation verified. Cross-tenant traversal prevented.' : 'Tenant isolation breach!',
        durationMs: Math.round(performance.now() - startTime),
      });
    } catch (e: any) {
      results.push({ testName: 'Strict Tenant Isolation Enforcement', passed: false, message: e.message, durationMs: 0 });
    }

    // Test 6: Graph Synchronization Engine
    try {
      const startTime = performance.now();
      const syncStats = await GraphSynchronizationService.performFullSync(tenantId);
      const passed = syncStats.syncStatus === 'SUCCESS';
      results.push({
        testName: 'Read-Only Full Graph Synchronization',
        passed,
        message: passed ? `Sync complete in ${syncStats.durationMs}ms (${syncStats.recordsDiscovered} records discovered).` : 'Graph sync failed.',
        durationMs: Math.round(performance.now() - startTime),
      });
    } catch (e: any) {
      results.push({ testName: 'Read-Only Full Graph Synchronization', passed: false, message: e.message, durationMs: 0 });
    }

    // Test 7: Natural Language Secure Query Adapter
    try {
      const startTime = performance.now();
      const queryRes = await GraphQueryAdapter.executeNaturalLanguageQuery({
        naturalLanguageQuery: 'What is the blast radius for SRV-10025?',
        userContext: {
          userId: 'USR-8801',
          tenantId,
          permissions: {
            canViewGraph: true,
            canSearchGraph: true,
            canManageRelationships: false,
            canRunImpactAnalysis: true,
            canRunBlastRadius: true,
            canAdminSync: false,
            canExportGraph: true,
          },
        },
      });
      const passed = queryRes.securityEnforced && queryRes.structuredNodes.length > 0;
      results.push({
        testName: 'Natural Language Secure Graph Query Parser',
        passed,
        message: passed ? 'Processed NL query securely without exposing raw Cypher.' : 'NL query adapter failed.',
        durationMs: Math.round(performance.now() - startTime),
      });
    } catch (e: any) {
      results.push({ testName: 'Natural Language Secure Graph Query Parser', passed: false, message: e.message, durationMs: 0 });
    }

    return results;
  }
}
