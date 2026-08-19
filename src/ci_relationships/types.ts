export type RelationshipType = 'runs_on' | 'depends_on' | 'hosted_by' | 'connects_to' | 'used_by';

export type RelationshipStatus = 'Active' | 'Inactive' | 'Unknown' | 'Discovered' | 'Verified';

export type RelationshipSource = 
  | 'Agent' 
  | 'Agentless Discovery' 
  | 'SNMP' 
  | 'WMI' 
  | 'SSH' 
  | 'Cloud API' 
  | 'SaaS Connector'
  | 'Application Discovery' 
  | 'Manual' 
  | 'Import';

export interface CiRelationship {
  id: string;
  sourceCiId: string;
  sourceCiName: string;
  sourceCiClass: string;
  relationshipType: RelationshipType;
  targetCiId: string;
  targetCiName: string;
  targetCiClass: string;
  direction: 'OUTGOING' | 'INCOMING';
  status: RelationshipStatus;
  source: RelationshipSource;
  confidenceScore: number; // 0 - 100
  tenantId: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
}

export interface ImpactNode {
  ciId: string;
  ciName: string;
  ciClass: string;
  ciType: string;
  depth: number;
  impactSeverity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  relationshipVia: RelationshipType;
  tenantId: string;
}

export interface BlastRadiusReport {
  rootCiId: string;
  rootCiName: string;
  totalAffectedCIs: number;
  criticalImpactCount: number;
  highImpactCount: number;
  mediumImpactCount: number;
  affectedNodes: ImpactNode[];
  traversalMaxDepthReached: number;
  calculatedAt: string;
}

export interface RelationshipCompatibilityRule {
  relationshipType: RelationshipType;
  allowedSourceClasses: string[];
  allowedTargetClasses: string[];
  description: string;
}
