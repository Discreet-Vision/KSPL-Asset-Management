// ==================== GRAPH AUDIT SERVICE & EXPORTER ====================
// Audit logger and GraphML/JSON/CSV export engine for Graph Layer operations.

import { GraphAuditRecord, GraphNode, GraphRelationship } from '../types/graphTypes';

export class GraphAuditService {
  private static auditLogs: GraphAuditRecord[] = [
    {
      id: 'g-aud-001',
      timestamp: '2026-08-11 04:45:00',
      userId: 'USR-8801',
      tenantId: 'tenant-kspl-global',
      operation: 'BLAST_RADIUS_ANALYSIS',
      targetCiId: 'ci-srv-10025',
      querySummary: 'Blast radius analysis requested for CI-SRV-10025 at Depth 3',
      resultCount: 5,
      correlationId: 'gq-nl-17882910-a1',
    },
  ];

  public static logGraphOperation(record: Omit<GraphAuditRecord, 'id' | 'timestamp'>): GraphAuditRecord {
    const newRecord: GraphAuditRecord = {
      ...record,
      id: `g-aud-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    this.auditLogs.unshift(newRecord);
    return newRecord;
  }

  public static getAuditLogs(tenantId: string): GraphAuditRecord[] {
    return this.auditLogs.filter((log) => log.tenantId === tenantId);
  }

  /**
   * Generates GraphML XML string for graph visualization software (e.g. Gephi, Cytoscape)
   */
  public static exportToGraphML(nodes: GraphNode[], relationships: GraphRelationship[], tenantId: string): string {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<graphml xmlns="http://graphml.graphdrawing.org/xmlns">\n`;
    xml += `  <graph id="${tenantId}-itam-graph" edgedefault="directed">\n`;

    nodes.forEach((n) => {
      xml += `    <node id="${n.id}">\n`;
      xml += `      <data key="label">${n.label}</data>\n`;
      xml += `      <data key="type">${n.nodeType}</data>\n`;
      xml += `      <data key="criticality">${n.criticality || ''}</data>\n`;
      xml += `    </node>\n`;
    });

    relationships.forEach((r) => {
      xml += `    <edge id="${r.id}" source="${r.sourceNodeId}" target="${r.targetNodeId}">\n`;
      xml += `      <data key="relationship">${r.relationshipType}</data>\n`;
      xml += `    </edge>\n`;
    });

    xml += `  </graph>\n`;
    xml += `</graphml>`;

    this.logGraphOperation({
      userId: 'USR-8801',
      tenantId,
      operation: 'GRAPH_EXPORT',
      querySummary: `Exported ${nodes.length} nodes & ${relationships.length} edges to GraphML`,
      resultCount: nodes.length,
      correlationId: `exp-gml-${Date.now()}`,
    });

    return xml;
  }

  /**
   * Generates JSON export
   */
  public static exportToJson(nodes: GraphNode[], relationships: GraphRelationship[], tenantId: string): string {
    const data = {
      tenantId,
      exportedAt: new Date().toISOString(),
      nodes,
      relationships,
    };

    this.logGraphOperation({
      userId: 'USR-8801',
      tenantId,
      operation: 'GRAPH_EXPORT',
      querySummary: `Exported JSON graph payload`,
      resultCount: nodes.length,
      correlationId: `exp-json-${Date.now()}`,
    });

    return JSON.stringify(data, null, 2);
  }
}
