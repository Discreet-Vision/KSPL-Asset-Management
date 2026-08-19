import { 
  CiRelationship, 
  RelationshipType, 
  RelationshipCompatibilityRule, 
  BlastRadiusReport, 
  ImpactNode 
} from './types';

export const RELATIONSHIP_RULES: RelationshipCompatibilityRule[] = [
  {
    relationshipType: 'runs_on',
    allowedSourceClasses: ['Software', 'Cloud', 'Service'],
    allowedTargetClasses: ['Hardware', 'Cloud'],
    description: 'Software Application or Container runs on a physical Server or Virtual Machine'
  },
  {
    relationshipType: 'depends_on',
    allowedSourceClasses: ['Software', 'Service', 'Cloud'],
    allowedTargetClasses: ['Software', 'Service', 'Cloud', 'Hardware'],
    description: 'Application or Service depends on another Database, API, or Infrastructure Service'
  },
  {
    relationshipType: 'hosted_by',
    allowedSourceClasses: ['Cloud', 'Software'],
    allowedTargetClasses: ['Cloud', 'Hardware'],
    description: 'Container or VM hosted by hypervisor or cloud cluster node'
  },
  {
    relationshipType: 'connects_to',
    allowedSourceClasses: ['Hardware', 'Cloud', 'Software'],
    allowedTargetClasses: ['Hardware', 'Cloud'],
    description: 'Host connects to Firewall, Switch, Router, or Gateway'
  },
  {
    relationshipType: 'used_by',
    allowedSourceClasses: ['Software', 'Service', 'Hardware'],
    allowedTargetClasses: ['Service', 'Hardware', 'Software'],
    description: 'CI utilized by Business Unit, User Group, or Higher-tier Business Service'
  }
];

export class RelationshipGraphEngine {
  private relationships: Map<string, CiRelationship> = new Map();

  constructor() {
    this.seedInitialRelationships();
  }

  private seedInitialRelationships() {
    // Clean slate - no demo relationships
  }

  /**
   * Validate Class Compatibility
   */
  public validateRelationship(
    sourceClass: string,
    targetClass: string,
    relType: RelationshipType
  ): { valid: boolean; reason?: string } {
    const rule = RELATIONSHIP_RULES.find(r => r.relationshipType === relType);
    if (!rule) {
      return { valid: false, reason: `Unknown relationship type '${relType}'.` };
    }

    const sourceOk = rule.allowedSourceClasses.includes(sourceClass);
    const targetOk = rule.allowedTargetClasses.includes(targetClass);

    if (!sourceOk || !targetOk) {
      return {
        valid: false,
        reason: `Relationship '${relType}' is not compatible between Source (${sourceClass}) and Target (${targetClass}). Allowed Source: [${rule.allowedSourceClasses.join(', ')}], Allowed Target: [${rule.allowedTargetClasses.join(', ')}].`
      };
    }

    return { valid: true };
  }

  /**
   * Add new relationship with duplicate prevention and tenant protection
   */
  public addRelationship(rel: Omit<CiRelationship, 'id' | 'createdAt' | 'updatedAt'>): { success: boolean; message: string; relationship?: CiRelationship } {
    // Check validation
    const val = this.validateRelationship(rel.sourceCiClass, rel.targetCiClass, rel.relationshipType);
    if (!val.valid) {
      return { success: false, message: val.reason || 'Validation error' };
    }

    // Check duplicate
    const existing = Array.from(this.relationships.values()).find(
      r => r.sourceCiId === rel.sourceCiId && 
           r.targetCiId === rel.targetCiId && 
           r.relationshipType === rel.relationshipType &&
           r.tenantId === rel.tenantId
    );

    if (existing) {
      return { success: false, message: `Relationship '${rel.relationshipType}' between '${rel.sourceCiName}' and '${rel.targetCiName}' already exists.` };
    }

    const newRel: CiRelationship = {
      ...rel,
      id: `rel-${Date.now()}`,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };

    this.relationships.set(newRel.id, newRel);
    return { success: true, message: 'Relationship established successfully.', relationship: newRel };
  }

  /**
   * Single-Hop Query: Get Outgoing Relationships from a Source CI
   */
  public getOutgoingRelationships(ciId: string, tenantId: string = 'tenant-kspl-global'): CiRelationship[] {
    return Array.from(this.relationships.values()).filter(
      r => r.sourceCiId === ciId && r.tenantId === tenantId && r.status !== 'Inactive'
    );
  }

  /**
   * Single-Hop Query: Get Incoming Relationships targeting a CI
   */
  public getIncomingRelationships(ciId: string, tenantId: string = 'tenant-kspl-global'): CiRelationship[] {
    return Array.from(this.relationships.values()).filter(
      r => r.targetCiId === ciId && r.tenantId === tenantId && r.status !== 'Inactive'
    );
  }

  /**
   * Get all relationships for a given tenant
   */
  public getAllRelationships(tenantId: string = 'tenant-kspl-global'): CiRelationship[] {
    return Array.from(this.relationships.values()).filter(r => r.tenantId === tenantId);
  }

  /**
   * Multi-Hop Blast-Radius & Impact Analysis Engine
   */
  public calculateBlastRadius(
    rootCiId: string, 
    rootCiName: string, 
    maxDepth: number = 3,
    tenantId: string = 'tenant-kspl-global'
  ): BlastRadiusReport {
    const affectedNodes: ImpactNode[] = [];
    const visited = new Set<string>();

    const traverse = (currentId: string, currentDepth: number) => {
      if (currentDepth > maxDepth) return;

      // Find all incoming dependent CIs (CIs that depend on currentId)
      const dependents = Array.from(this.relationships.values()).filter(
        r => r.targetCiId === currentId && r.tenantId === tenantId && r.status !== 'Inactive'
      );

      dependents.forEach(rel => {
        if (!visited.has(rel.sourceCiId)) {
          visited.add(rel.sourceCiId);

          let severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM';
          if (currentDepth === 1) severity = 'CRITICAL';
          else if (currentDepth === 2) severity = 'HIGH';
          else severity = 'LOW';

          affectedNodes.push({
            ciId: rel.sourceCiId,
            ciName: rel.sourceCiName,
            ciClass: rel.sourceCiClass,
            ciType: 'Dependent Item',
            depth: currentDepth,
            impactSeverity: severity,
            relationshipVia: rel.relationshipType,
            tenantId
          });

          // Recurse deeper into multi-hop traversal
          traverse(rel.sourceCiId, currentDepth + 1);
        }
      });
    };

    visited.add(rootCiId);
    traverse(rootCiId, 1);

    const criticalCount = affectedNodes.filter(n => n.impactSeverity === 'CRITICAL').length;
    const highCount = affectedNodes.filter(n => n.impactSeverity === 'HIGH').length;
    const mediumCount = affectedNodes.filter(n => n.impactSeverity === 'MEDIUM').length;

    return {
      rootCiId,
      rootCiName,
      totalAffectedCIs: affectedNodes.length,
      criticalImpactCount: criticalCount,
      highImpactCount: highCount,
      mediumImpactCount: mediumCount,
      affectedNodes,
      traversalMaxDepthReached: maxDepth,
      calculatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
  }
}

export const relationshipGraphEngine = new RelationshipGraphEngine();
