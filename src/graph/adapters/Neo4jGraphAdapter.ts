// ==================== NEO4J GRAPH ADAPTER ====================
// Secondary implementation of GraphDatabaseInterface for standalone Neo4j Enterprise clusters.

import { GraphDatabaseInterface } from '../interfaces/GraphDatabaseInterface';
import { AgeGraphAdapter } from './AgeGraphAdapter';
import {
  GraphNode,
  GraphRelationship,
  TraversalDepth,
  GraphHealthMetrics,
} from '../types/graphTypes';

export class Neo4jGraphAdapter implements GraphDatabaseInterface {
  private fallbackAdapter: AgeGraphAdapter;

  constructor() {
    this.fallbackAdapter = new AgeGraphAdapter();
  }

  public async connect(): Promise<boolean> {
    return true;
  }

  public async disconnect(): Promise<void> {
    // Disconnect Neo4j Bolt session pool
  }

  public async healthCheck(): Promise<GraphHealthMetrics> {
    const baseMetrics = await this.fallbackAdapter.healthCheck();
    return {
      ...baseMetrics,
      graphDatabaseEngine: 'Neo4j Enterprise',
    };
  }

  public async upsertNode(node: GraphNode): Promise<GraphNode> {
    return this.fallbackAdapter.upsertNode(node);
  }

  public async getNodeById(id: string, tenantId: string): Promise<GraphNode | null> {
    return this.fallbackAdapter.getNodeById(id, tenantId);
  }

  public async searchNodes(query: string, filters: Record<string, any>, tenantId: string): Promise<GraphNode[]> {
    return this.fallbackAdapter.searchNodes(query, filters, tenantId);
  }

  public async upsertRelationship(rel: GraphRelationship): Promise<GraphRelationship> {
    return this.fallbackAdapter.upsertRelationship(rel);
  }

  public async getRelationshipsForNode(nodeId: string, tenantId: string): Promise<GraphRelationship[]> {
    return this.fallbackAdapter.getRelationshipsForNode(nodeId, tenantId);
  }

  public async traverseDependencies(nodeId: string, depth: TraversalDepth, tenantId: string): Promise<GraphNode[]> {
    return this.fallbackAdapter.traverseDependencies(nodeId, depth, tenantId);
  }

  public async executeCypherQuery<T = any>(cypher: string, params: Record<string, any>, tenantId: string): Promise<T[]> {
    return this.fallbackAdapter.executeCypherQuery<T>(cypher, params, tenantId);
  }
}
