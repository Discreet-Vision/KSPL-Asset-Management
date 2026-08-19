// ==================== GRAPH LAYER TYPES & DATA MODELS ====================
// Isolated Graph Layer types for ITAM / CMDB relationship modeling and analytical depth traversal.

export type GraphNodeType =
  | 'Asset'
  | 'Laptop'
  | 'Desktop'
  | 'Server'
  | 'Network Device'
  | 'Virtual Machine'
  | 'Container'
  | 'Application'
  | 'Database'
  | 'Service'
  | 'Cloud Resource'
  | 'Configuration Item'
  | 'User'
  | 'Department'
  | 'Location'
  | 'Contract'
  | 'Vendor';

export type GraphRelationshipType =
  | 'RUNS_ON'
  | 'DEPENDS_ON'
  | 'HOSTED_BY'
  | 'CONNECTS_TO'
  | 'CONTAINS'
  | 'MEMBER_OF'
  | 'USES'
  | 'OWNED_BY'
  | 'ASSIGNED_TO'
  | 'LOCATED_AT'
  | 'SUPPORTED_BY'
  | 'MANAGED_BY'
  | 'PART_OF'
  | 'BACKED_BY'
  | 'COMMUNICATES_WITH';

export type CriticalityLevel = 'Tier 1 Critical' | 'Tier 2 Major' | 'Tier 3 Minor';
export type EnvironmentType = 'Production' | 'Staging' | 'Development' | 'Disaster Recovery';
export type RiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface GraphNode {
  id: string; // Stable UUID or CI ID
  label: string; // Display name e.g. "prod-app-node-01"
  nodeType: GraphNodeType;
  ciTag?: string;
  serialNumber?: string;
  externalId?: string;
  environment?: EnvironmentType;
  criticality?: CriticalityLevel;
  ownerDepartment?: string;
  locationName?: string;
  affectedUsersCount?: number;
  properties: Record<string, any>;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface GraphRelationship {
  id: string; // UUID
  sourceNodeId: string;
  targetNodeId: string;
  relationshipType: GraphRelationshipType;
  discoverySource: 'Agent' | 'Agentless Discovery' | 'Cloud API' | 'CMDB Sync' | 'Manual Entry';
  confidenceScore: number; // 0.0 to 1.0
  firstSeenAt: string;
  lastObservedAt: string;
  isStale?: boolean;
  metadata?: Record<string, any>;
  tenantId: string;
}

export type TraversalDepth = 1 | 2 | 3 | 5 | 999; // 999 = Unlimited

export interface BlastRadiusQueryResult {
  targetCiId: string;
  targetCiName: string;
  traversalDepthRequested: TraversalDepth;
  totalAffectedNodes: number;
  directDependencies: GraphNode[];
  indirectDependencies: GraphNode[];
  affectedApplications: GraphNode[];
  affectedBusinessServices: GraphNode[];
  affectedServers: GraphNode[];
  affectedDatabases: GraphNode[];
  affectedDepartments: string[];
  totalAffectedUsers: number;
  criticalServicesCount: number;
  overallRiskLevel: RiskLevel;
  calculatedImpactScore: number; // 0 - 100
  traversalTree: DependencyGraphTreeNode[];
  executionTimeMs: number;
  cached: boolean;
}

export interface DependencyGraphTreeNode {
  node: GraphNode;
  relationshipToParent?: GraphRelationshipType;
  depthLevel: number;
  children: DependencyGraphTreeNode[];
}

export interface ChangeImpactAnalysisRequest {
  ciId: string;
  changeType: 'Operating System Upgrade' | 'Firmware Patch' | 'Firewall Policy Rule' | 'Database Migration' | 'Hardware Maintenance' | 'Decommissioning';
  proposedWindowTime?: string;
  tenantId: string;
}

export interface ChangeImpactAnalysisResponse {
  targetCiId: string;
  targetCiName: string;
  changeType: string;
  potentiallyAffectedAppsCount: number;
  potentiallyAffectedServicesCount: number;
  potentiallyAffectedDatabasesCount: number;
  potentiallyAffectedUsersCount: number;
  criticalServicesCount: number;
  impactLevel: RiskLevel;
  riskScore: number; // 0 - 100
  impactedNodesSummary: {
    nodeId: string;
    name: string;
    nodeType: GraphNodeType;
    criticality?: CriticalityLevel;
  }[];
  mitigationRecommendations: string[];
  analyzedAt: string;
}

export interface SinglePointOfFailureCandidate {
  node: GraphNode;
  incomingDependencyCount: number;
  outgoingDependencyCount: number;
  dependentBusinessServicesCount: number;
  dependentApplicationsCount: number;
  totalDependentUsers: number;
  centralityScore: number; // 0 - 100
  spofRiskLevel: RiskLevel;
  riskReasoning: string;
}

export interface GraphSyncStats {
  lastSyncTimestamp: string;
  syncMode: 'FULL' | 'INCREMENTAL';
  recordsDiscovered: number;
  nodesCreated: number;
  nodesUpdated: number;
  relationshipsCreated: number;
  relationshipsUpdated: number;
  recordsSkipped: number;
  staleRelationshipsDetected: number;
  errorsCount: number;
  durationMs: number;
  syncStatus: 'SUCCESS' | 'PARTIAL_SUCCESS' | 'FAILED';
  errorMessages: string[];
}

export interface GraphDataQualityReport {
  totalNodes: number;
  totalRelationships: number;
  orphanNodesCount: number; // Nodes without relationships
  duplicateNodeCandidatesCount: number;
  duplicateRelationshipCandidatesCount: number;
  staleRelationshipsCount: number; // Unobserved for > 90 days
  missingMetadataCount: number;
  overallQualityScore: number; // 0 - 100
  qualityTimestamp: string;
}

export interface GraphAuditRecord {
  id: string;
  timestamp: string;
  userId: string;
  tenantId: string;
  operation: 'GRAPH_SEARCH' | 'BLAST_RADIUS_ANALYSIS' | 'IMPACT_ANALYSIS' | 'GRAPH_EXPORT' | 'GRAPH_SYNC' | 'GRAPH_ADMIN';
  targetCiId?: string;
  querySummary: string;
  resultCount: number;
  correlationId: string;
}

export interface GraphHealthMetrics {
  status: 'ONLINE' | 'DEGRADED' | 'SYNCING' | 'OFFLINE';
  graphDatabaseEngine: 'PostgreSQL + Apache AGE' | 'Neo4j Enterprise';
  nodeCount: number;
  relationshipCount: number;
  activeGraphConnections: number;
  averageQueryLatencyMs: number;
  lastSuccessfulSyncAt: string;
  cacheHitRatioPercent: number;
  staleRelationshipsCount: number;
}

export interface GraphPermission {
  canViewGraph: boolean;
  canSearchGraph: boolean;
  canManageRelationships: boolean;
  canRunImpactAnalysis: boolean;
  canRunBlastRadius: boolean;
  canAdminSync: boolean;
  canExportGraph: boolean;
}
