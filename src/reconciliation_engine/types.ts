export type ReconciliationSource = 
  | 'Agent' 
  | 'Agentless' 
  | 'SNMP' 
  | 'WMI' 
  | 'SSH' 
  | 'Cloud API' 
  | 'SaaS API' 
  | 'CASB' 
  | 'Manual' 
  | 'Import';

export type IdentificationMatchConfidence = 'HIGH' | 'MEDIUM' | 'POSSIBLE' | 'LOW';

export interface FieldPrecedenceRule {
  id: string;
  ciClass: string; // e.g. 'Hardware' | 'Software' | 'Cloud' | 'ALL'
  ciType?: string;
  fieldName: string; // e.g. 'osVersion', 'ramGb', 'macAddress'
  sourcePriority: ReconciliationSource[]; // Ordered list of priority, index 0 = highest
  freshnessWeightPct: number; // 0 - 100
  ignoreEmptyValues: boolean;
  enabled: boolean;
  updatedAt: string;
  updatedBy: string;
}

export interface MatchingAttributeWeight {
  attributeName: 'serialNumber' | 'macAddress' | 'hostname' | 'cloudResourceId' | 'assetId' | 'uuid';
  exactMatchScore: number;
  fuzzyMatchScore: number;
  isMandatoryExact?: boolean;
}

export interface IdentificationConfig {
  id: string;
  autoMergeThreshold: number; // e.g. 90
  reviewThreshold: number;    // e.g. 70
  attributeWeights: MatchingAttributeWeight[];
  ruleVersion: number;
  updatedAt: string;
}

export interface FieldProvenanceRecord {
  fieldName: string;
  winningValue: any;
  winningSource: ReconciliationSource;
  confidenceScore: number;
  lastUpdated: string;
  conflictingValues: Array<{
    source: ReconciliationSource;
    value: any;
    timestamp: string;
  }>;
}

export interface CanonicalCiRecord {
  id: string;
  ciName: string;
  ciClass: string;
  ciType: string;
  tenantId: string;
  attributes: Record<string, any>;
  fieldProvenance: Record<string, FieldProvenanceRecord>;
  associatedDiscoverySources: ReconciliationSource[];
  createdAt: string;
  updatedAt: string;
}

export interface ReconciliationResult {
  candidateId: string;
  outcome: 'AUTOMATIC_MERGE' | 'NEEDS_APPROVAL' | 'NEW_CI_CREATED' | 'REJECTED';
  targetCiId?: string;
  confidenceScore: number;
  matchedAttributes: string[];
  conflictsDetectedCount: number;
  log: string;
  timestamp: string;
}

export interface ReconciliationJob {
  id: string;
  startTime: string;
  endTime?: string;
  status: 'SUCCESS' | 'RUNNING' | 'FAILED';
  recordsProcessed: number;
  newCisCreated: number;
  existingCisUpdated: number;
  possibleDuplicatesFlagged: number;
  conflictsDetected: number;
  logSummary: string;
}

export interface DryRunSimulationReport {
  recordsTested: number;
  potentialMatches: number;
  potentialAutoMerges: number;
  potentialReviewNeeded: number;
  potentialNewCis: number;
  fieldConflictsCount: number;
  details: Array<{
    candidateHostname: string;
    targetCiName?: string;
    matchScore: number;
    recommendedAction: string;
    fieldChanges: string[];
  }>;
}
