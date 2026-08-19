export type DependencyDirection = 'Upstream' | 'Downstream' | 'Both';

export type ImpactLevel = 'Critical' | 'High' | 'Medium' | 'Low' | 'Informational';

export type RiskCategory = 'Low' | 'Medium' | 'High' | 'Critical';

export interface ImpactNode {
  id: string;
  ciName: string;
  ciClass: string;
  status: string;
  criticality: 'Critical' | 'High' | 'Medium' | 'Low';
  owner?: string;
  environment?: string;
  location?: string;
  lastVerified?: string;
  qualityScore?: number;
  discoverySource?: string;
  dependencyCount: number;
  impactLevel: ImpactLevel;
  isSinglePointOfFailure?: boolean;
}

export interface ImpactEdge {
  id: string;
  sourceId: string;
  targetId: string;
  relationshipType: string; // e.g. 'depends upon', 'runs on', 'hosted on', 'connects to'
  status: string;
  verifiedStatus: 'Recently Verified' | 'Aging' | 'Stale' | 'Unknown';
}

export interface DependencyPath {
  pathId: string;
  pathNodes: ImpactNode[];
  explanation: string;
}

export interface BlastRadiusResult {
  rootCiIds: string[];
  direction: DependencyDirection;
  maxDepthConfigured: number;
  directImpactCount: number;
  indirectImpactCount: number;
  affectedCisCount: number;
  affectedApplicationsCount: number;
  affectedServicesCount: number;
  affectedBusinessServicesCount: number;
  isSinglePointOfFailure: boolean;
  spofDetails?: string;
  riskScore: number; // 0 - 100
  riskCategory: RiskCategory;
  criticalPathNodes: string[];
  impactLevel: ImpactLevel;
  nodes: ImpactNode[];
  edges: ImpactEdge[];
  dependencyPaths: DependencyPath[];
  dataQualityWarning?: string;
  confidence: 'High' | 'Medium' | 'Low';
  analyzedAt: string;
}

export interface ChangeRiskSimulationInput {
  targetCiIds: string[];
  proposedChangeTitle: string;
  changeType: 'Patching' | 'Hardware Swap' | 'OS Upgrade' | 'Decommissioning' | 'Network Reconfiguration';
  traversalDepth: number;
}

export interface ImpactAnalysisSnapshot {
  snapshotId: string;
  tenantId: string;
  title: string;
  rootCiNames: string[];
  riskScore: number;
  riskCategory: RiskCategory;
  affectedCount: number;
  createdByName: string;
  createdAt: string;
}
