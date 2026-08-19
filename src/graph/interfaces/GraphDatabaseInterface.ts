// ==================== GRAPH DATABASE INTERFACES ====================
// Abstract interfaces ensuring full decoupling from specific graph engines (PostgreSQL + Apache AGE or Neo4j).

import {
  GraphNode,
  GraphRelationship,
  BlastRadiusQueryResult,
  ChangeImpactAnalysisRequest,
  ChangeImpactAnalysisResponse,
  TraversalDepth,
  SinglePointOfFailureCandidate,
  GraphSyncStats,
  GraphDataQualityReport,
  GraphHealthMetrics,
} from '../types/graphTypes';

export interface GraphDatabaseInterface {
  connect(): Promise<boolean>;
  disconnect(): Promise<void>;
  healthCheck(): Promise<GraphHealthMetrics>;
  
  // Node Operations
  upsertNode(node: GraphNode): Promise<GraphNode>;
  getNodeById(id: string, tenantId: string): Promise<GraphNode | null>;
  searchNodes(query: string, filters: Record<string, any>, tenantId: string): Promise<GraphNode[]>;
  
  // Relationship Operations
  upsertRelationship(rel: GraphRelationship): Promise<GraphRelationship>;
  getRelationshipsForNode(nodeId: string, tenantId: string): Promise<GraphRelationship[]>;
  
  // Traversal & Analytics
  traverseDependencies(nodeId: string, depth: TraversalDepth, tenantId: string): Promise<GraphNode[]>;
  executeCypherQuery<T = any>(cypher: string, params: Record<string, any>, tenantId: string): Promise<T[]>;
}

export interface GraphQueryInterface {
  findConnectedCis(nodeId: string, depth: TraversalDepth, tenantId: string): Promise<GraphNode[]>;
  searchByProperty(propertyKey: string, propertyValue: any, tenantId: string): Promise<GraphNode[]>;
  getRelationshipPath(sourceId: string, targetId: string, tenantId: string): Promise<GraphRelationship[]>;
}

export interface GraphSyncInterface {
  performFullSync(tenantId: string): Promise<GraphSyncStats>;
  performIncrementalSync(tenantId: string): Promise<GraphSyncStats>;
  detectStaleRelationships(thresholdDays: number, tenantId: string): Promise<GraphRelationship[]>;
  auditDataQuality(tenantId: string): Promise<GraphDataQualityReport>;
}

export interface GraphTraversalInterface {
  getUpstreamDependencies(nodeId: string, depth: TraversalDepth, tenantId: string): Promise<GraphNode[]>;
  getDownstreamImpact(nodeId: string, depth: TraversalDepth, tenantId: string): Promise<GraphNode[]>;
}

export interface GraphImpactInterface {
  calculateBlastRadius(targetCiId: string, depth: TraversalDepth, tenantId: string): Promise<BlastRadiusQueryResult>;
  analyzeChangeImpact(request: ChangeImpactAnalysisRequest): Promise<ChangeImpactAnalysisResponse>;
  detectSinglePointsOfFailure(tenantId: string): Promise<SinglePointOfFailureCandidate[]>;
  simulateFailure(targetCiId: string, tenantId: string): Promise<BlastRadiusQueryResult>;
}
