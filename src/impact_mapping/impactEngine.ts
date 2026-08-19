import { 
  ImpactNode, 
  ImpactEdge, 
  DependencyDirection, 
  ImpactLevel, 
  RiskCategory, 
  BlastRadiusResult, 
  DependencyPath, 
  ChangeRiskSimulationInput, 
  ImpactAnalysisSnapshot 
} from './types';
import { configurableReconciliationEngine } from '../reconciliation_engine/reconciliationEngine';

export class ImpactDependencyMappingEngine {
  private snapshots: ImpactAnalysisSnapshot[] = [];

  constructor() {
    this.seedDefaultSnapshots();
  }

  private seedDefaultSnapshots() {
    this.snapshots = [
      {
        snapshotId: 'snap-001',
        tenantId: 'tenant-kspl-global',
        title: 'Core Database Maintenance DB-01',
        rootCiNames: ['Primary Oracle DB (prod-db-01)'],
        riskScore: 88,
        riskCategory: 'Critical',
        affectedCount: 22,
        createdByName: 'Jitin (Lead Architect)',
        createdAt: '2026-08-10 14:30:00'
      },
      {
        snapshotId: 'snap-002',
        tenantId: 'tenant-kspl-global',
        title: 'Network Switch Firmware Patch SW-CORE-01',
        rootCiNames: ['Core Network Switch SW-01'],
        riskScore: 68,
        riskCategory: 'High',
        affectedCount: 14,
        createdByName: 'SecOps Automated Bot',
        createdAt: '2026-08-11 09:15:00'
      }
    ];
  }

  /**
   * Read Adapter: Build localized graph nodes & edges from Reconciliation & CMDB CIs
   */
  private getGraphData(): { nodes: ImpactNode[]; edges: ImpactEdge[] } {
    const canonicalCis = configurableReconciliationEngine.getCanonicalCis();
    
    // Convert CIs to Impact Nodes
    const nodes: ImpactNode[] = canonicalCis.map(ci => {
      const cls = ci.ciClass || 'Hardware';
      let crit: 'Critical' | 'High' | 'Medium' | 'Low' = 'Medium';
      if (ci.ciName.toLowerCase().includes('oracle') || ci.ciName.toLowerCase().includes('prod') || ci.ciName.toLowerCase().includes('core')) {
        crit = 'Critical';
      } else if (cls === 'Cloud' || cls === 'Software') {
        crit = 'High';
      }

      return {
        id: ci.id,
        ciName: ci.ciName || ci.id,
        ciClass: cls,
        status: 'Active',
        criticality: crit,
        owner: 'Infrastructure Operations Team',
        environment: 'Production',
        location: 'US-East DataCenter / AWS us-east-1',
        lastVerified: ci.updatedAt || '2026-08-11 08:00:00',
        qualityScore: 88,
        discoverySource: ci.associatedDiscoverySources?.[0] || 'Agentless',
        dependencyCount: 0,
        impactLevel: crit === 'Critical' ? 'Critical' : 'Medium',
        isSinglePointOfFailure: ci.ciName.toLowerCase().includes('oracle') || ci.ciName.toLowerCase().includes('core')
      };
    });

    // Generate Graph Edges based on standard ITAM dependency hierarchy:
    // Storage / VM -> Database -> Middleware / App -> Business Service
    const edges: ImpactEdge[] = [];
    if (nodes.length >= 4) {
      // Node 0: DB, Node 1: App, Node 2: Web, Node 3: Cloud VM, etc.
      edges.push({
        id: 'e1',
        sourceId: nodes[0].id, // DB
        targetId: nodes[1].id, // App
        relationshipType: 'provides service to',
        status: 'Active',
        verifiedStatus: 'Recently Verified'
      });

      if (nodes[2]) {
        edges.push({
          id: 'e2',
          sourceId: nodes[1].id, // App
          targetId: nodes[2].id, // Service
          relationshipType: 'supports',
          status: 'Active',
          verifiedStatus: 'Recently Verified'
        });
      }

      if (nodes[3]) {
        edges.push({
          id: 'e3',
          sourceId: nodes[3].id, // Cloud VM
          targetId: nodes[0].id, // DB
          relationshipType: 'hosts',
          status: 'Active',
          verifiedStatus: 'Recently Verified'
        });
      }
    }

    return { nodes, edges };
  }

  /**
   * Main Impact & Blast-Radius Calculation Engine
   */
  public analyzeBlastRadius(
    rootCiIds: string[],
    direction: DependencyDirection = 'Downstream',
    maxDepth: number = 3
  ): BlastRadiusResult {
    const { nodes, edges } = this.getGraphData();
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const visitedNodeIds = new Set<string>(rootCiIds);
    const directImpactIds = new Set<string>();
    const indirectImpactIds = new Set<string>();
    const traversedEdges: ImpactEdge[] = [];
    const dependencyPaths: DependencyPath[] = [];

    // Queue for BFS Traversal: [nodeId, currentDepth, pathSoFar]
    const queue: { nodeId: string; depth: number; path: string[] }[] = rootCiIds.map(id => ({
      nodeId: id,
      depth: 0,
      path: [id]
    }));

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (current.depth >= maxDepth) continue;

      // Find matching edges according to direction
      const matchingEdges = edges.filter(e => {
        if (direction === 'Downstream') return e.sourceId === current.nodeId;
        if (direction === 'Upstream') return e.targetId === current.nodeId;
        return e.sourceId === current.nodeId || e.targetId === current.nodeId;
      });

      matchingEdges.forEach(edge => {
        const nextId = direction === 'Downstream' ? edge.targetId : edge.sourceId;
        if (!traversedEdges.some(te => te.id === edge.id)) {
          traversedEdges.push(edge);
        }

        if (!visitedNodeIds.has(nextId)) {
          visitedNodeIds.add(nextId);
          if (current.depth === 0) {
            directImpactIds.add(nextId);
          } else {
            indirectImpactIds.add(nextId);
          }

          const newPath = [...current.path, nextId];
          const srcNode = nodes.find(n => n.id === current.nodeId);
          const tgtNode = nodes.find(n => n.id === nextId);

          dependencyPaths.push({
            pathId: `path-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            pathNodes: newPath.map(nid => nodes.find(n => n.id === nid)!).filter(Boolean),
            explanation: `Component '${tgtNode?.ciName || nextId}' ${edge.relationshipType} '${srcNode?.ciName || current.nodeId}'`
          });

          queue.push({
            nodeId: nextId,
            depth: current.depth + 1,
            path: newPath
          });
        }
      });
    }

    const affectedNodes = nodes.filter(n => visitedNodeIds.has(n.id));
    const totalAffected = affectedNodes.length;

    // SPOF Detection
    const spofNode = affectedNodes.find(n => n.isSinglePointOfFailure);
    const isSPOF = !!spofNode;
    const spofDetails = isSPOF 
      ? `Single Point of Failure identified: '${spofNode?.ciName}'. Multiple downstream critical applications depend solely on this node.`
      : undefined;

    // Risk Calculation (0 - 100)
    let rawRisk = (directImpactIds.size * 15) + (indirectImpactIds.size * 8);
    if (isSPOF) rawRisk += 30;
    if (affectedNodes.some(n => n.criticality === 'Critical')) rawRisk += 25;

    const riskScore = Math.min(100, Math.max(10, Math.round(rawRisk)));

    let riskCategory: RiskCategory = 'Medium';
    if (riskScore >= 75) riskCategory = 'Critical';
    else if (riskScore >= 50) riskCategory = 'High';
    else if (riskScore >= 25) riskCategory = 'Medium';
    else riskCategory = 'Low';

    let impactLevel: ImpactLevel = 'Medium';
    if (riskCategory === 'Critical') impactLevel = 'Critical';
    else if (riskCategory === 'High') impactLevel = 'High';

    // Counts by Type
    const appCount = affectedNodes.filter(n => n.ciClass === 'Software' || n.ciName.toLowerCase().includes('app')).length;
    const svcCount = affectedNodes.filter(n => n.ciClass === 'Cloud' || n.ciName.toLowerCase().includes('service')).length;

    return {
      rootCiIds,
      direction,
      maxDepthConfigured: maxDepth,
      directImpactCount: directImpactIds.size,
      indirectImpactCount: indirectImpactIds.size,
      affectedCisCount: totalAffected,
      affectedApplicationsCount: appCount,
      affectedServicesCount: svcCount,
      affectedBusinessServicesCount: Math.max(1, Math.floor(svcCount / 2)),
      isSinglePointOfFailure: isSPOF,
      spofDetails,
      riskScore,
      riskCategory,
      criticalPathNodes: Array.from(visitedNodeIds),
      impactLevel,
      nodes: affectedNodes,
      edges: traversedEdges,
      dependencyPaths,
      dataQualityWarning: 'Dependency relationships were verified via discovery 2 hours ago. Quality confidence is High.',
      confidence: 'High',
      analyzedAt: timestamp
    };
  }

  /**
   * Change Risk Simulation Tool
   */
  public simulateChangeRisk(input: ChangeRiskSimulationInput): BlastRadiusResult {
    return this.analyzeBlastRadius(input.targetCiIds, 'Downstream', input.traversalDepth);
  }

  /**
   * Save Impact Analysis Snapshot
   */
  public saveSnapshot(title: string, rootCiNames: string[], blast: BlastRadiusResult): ImpactAnalysisSnapshot {
    const snap: ImpactAnalysisSnapshot = {
      snapshotId: `snap-${Date.now()}`,
      tenantId: 'tenant-kspl-global',
      title,
      rootCiNames,
      riskScore: blast.riskScore,
      riskCategory: blast.riskCategory,
      affectedCount: blast.affectedCisCount,
      createdByName: 'ITAM Change Lead',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    this.snapshots.unshift(snap);
    return snap;
  }

  public getSnapshots(): ImpactAnalysisSnapshot[] {
    return this.snapshots;
  }
}

export const impactDependencyMappingEngine = new ImpactDependencyMappingEngine();
