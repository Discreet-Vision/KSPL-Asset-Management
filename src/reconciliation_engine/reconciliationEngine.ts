import { 
  ReconciliationSource, 
  FieldPrecedenceRule, 
  IdentificationConfig, 
  CanonicalCiRecord, 
  FieldProvenanceRecord, 
  ReconciliationResult, 
  ReconciliationJob, 
  DryRunSimulationReport 
} from './types';
import { UnifiedDiscoveryResult } from '../discovery_engine/types';

export class ConfigurableReconciliationEngine {
  private precedenceRules: Map<string, FieldPrecedenceRule> = new Map();
  private identificationConfig: IdentificationConfig;
  private canonicalCis: Map<string, CanonicalCiRecord> = new Map();
  private jobsHistory: Map<string, ReconciliationJob> = new Map();
  private pendingApprovals: Map<string, { candidate: UnifiedDiscoveryResult; targetCi: CanonicalCiRecord; matchScore: number }> = new Map();

  constructor() {
    this.identificationConfig = {
      id: 'cfg-default-v1',
      autoMergeThreshold: 85,
      reviewThreshold: 65,
      ruleVersion: 1,
      updatedAt: '2026-08-11 10:00:00',
      attributeWeights: [
        { attributeName: 'serialNumber', exactMatchScore: 50, fuzzyMatchScore: 30 },
        { attributeName: 'macAddress', exactMatchScore: 30, fuzzyMatchScore: 20 },
        { attributeName: 'hostname', exactMatchScore: 20, fuzzyMatchScore: 10 },
        { attributeName: 'cloudResourceId', exactMatchScore: 50, fuzzyMatchScore: 25 },
        { attributeName: 'uuid', exactMatchScore: 40, fuzzyMatchScore: 20 }
      ]
    };

    this.seedDefaultPrecedenceRules();
    this.seedCanonicalCis();
  }

  private seedDefaultPrecedenceRules() {
    const defaultRules: FieldPrecedenceRule[] = [
      {
        id: 'rule-os-ver',
        ciClass: 'Hardware',
        fieldName: 'osVersion',
        sourcePriority: ['Agent', 'WMI', 'SSH', 'Agentless', 'Manual', 'Import'],
        freshnessWeightPct: 20,
        ignoreEmptyValues: true,
        enabled: true,
        updatedAt: '2026-08-11 08:00:00',
        updatedBy: 'Admin'
      },
      {
        id: 'rule-serial',
        ciClass: 'Hardware',
        fieldName: 'serialNumber',
        sourcePriority: ['WMI', 'Agent', 'SNMP', 'Agentless', 'Manual'],
        freshnessWeightPct: 10,
        ignoreEmptyValues: true,
        enabled: true,
        updatedAt: '2026-08-11 08:00:00',
        updatedBy: 'Admin'
      },
      {
        id: 'rule-cloud-id',
        ciClass: 'Cloud',
        fieldName: 'cloudResourceId',
        sourcePriority: ['Cloud API', 'Agent', 'Manual'],
        freshnessWeightPct: 30,
        ignoreEmptyValues: true,
        enabled: true,
        updatedAt: '2026-08-11 08:00:00',
        updatedBy: 'Admin'
      }
    ];

    defaultRules.forEach(r => this.precedenceRules.set(r.id, r));
  }

  private seedCanonicalCis() {
    // Clean slate - no demo CIs
  }

  /**
   * Calculate fuzzy score between two strings
   */
  private fuzzyMatchString(s1: string, s2: string): boolean {
    if (!s1 || !s2) return false;
    const clean1 = s1.toLowerCase().replace(/[^a-z0-9]/g, '');
    const clean2 = s2.toLowerCase().replace(/[^a-z0-9]/g, '');
    return clean1 === clean2 || clean1.includes(clean2) || clean2.includes(clean1);
  }

  /**
   * Compute Match Confidence Score (0-100) between Candidate Discovery record and Canonical CI
   */
  public calculateMatchConfidence(candidate: UnifiedDiscoveryResult, canonicalCi: CanonicalCiRecord): { score: number; matchedAttrs: string[] } {
    let score = 0;
    const matchedAttrs: string[] = [];

    const weights = this.identificationConfig.attributeWeights;

    // Check Serial Number
    const serialWeight = weights.find(w => w.attributeName === 'serialNumber');
    if (serialWeight && candidate.serialNumber && canonicalCi.attributes.serialNumber) {
      if (candidate.serialNumber === canonicalCi.attributes.serialNumber) {
        score += serialWeight.exactMatchScore;
        matchedAttrs.push(`Serial Exact (${candidate.serialNumber})`);
      } else if (this.fuzzyMatchString(candidate.serialNumber, canonicalCi.attributes.serialNumber)) {
        score += serialWeight.fuzzyMatchScore;
        matchedAttrs.push(`Serial Fuzzy (${candidate.serialNumber})`);
      }
    }

    // Check MAC Address
    const macWeight = weights.find(w => w.attributeName === 'macAddress');
    if (macWeight && candidate.macAddress && canonicalCi.attributes.macAddress) {
      if (candidate.macAddress.toLowerCase() === canonicalCi.attributes.macAddress.toLowerCase()) {
        score += macWeight.exactMatchScore;
        matchedAttrs.push(`MAC Exact (${candidate.macAddress})`);
      }
    }

    // Check Hostname
    const hostWeight = weights.find(w => w.attributeName === 'hostname');
    if (hostWeight && candidate.hostname && canonicalCi.attributes.hostname) {
      if (candidate.hostname.toLowerCase() === canonicalCi.attributes.hostname.toLowerCase()) {
        score += hostWeight.exactMatchScore;
        matchedAttrs.push(`Hostname Exact (${candidate.hostname})`);
      } else if (this.fuzzyMatchString(candidate.hostname, canonicalCi.attributes.hostname)) {
        score += hostWeight.fuzzyMatchScore;
        matchedAttrs.push(`Hostname Fuzzy (${candidate.hostname})`);
      }
    }

    // Check Cloud Resource ID
    const cloudWeight = weights.find(w => w.attributeName === 'cloudResourceId');
    if (cloudWeight && candidate.cloudResourceId && canonicalCi.attributes.cloudResourceId) {
      if (candidate.cloudResourceId === canonicalCi.attributes.cloudResourceId) {
        score += cloudWeight.exactMatchScore;
        matchedAttrs.push(`Cloud ID Exact (${candidate.cloudResourceId})`);
      }
    }

    return { score: Math.min(100, score), matchedAttrs };
  }

  /**
   * Field-Level Precedence Evaluation: Determine if new incoming discovery attribute beats current CI value
   */
  private evaluateFieldPrecedence(
    fieldName: string,
    ciClass: string,
    newSource: ReconciliationSource,
    newValue: any,
    currentProvenance?: FieldProvenanceRecord
  ): { wins: boolean; reason: string } {
    // Quality check: empty / null / N/A values never overwrite
    if (newValue === null || newValue === undefined || newValue === '' || newValue === 'N/A' || newValue === 'Unknown') {
      return { wins: false, reason: 'Value quality rejected: incoming value is empty/invalid.' };
    }

    if (!currentProvenance) {
      return { wins: true, reason: 'Initial field assignment.' };
    }

    // Find rule for field
    const rule = Array.from(this.precedenceRules.values()).find(
      r => r.enabled && (r.ciClass === ciClass || r.ciClass === 'ALL') && r.fieldName === fieldName
    );

    if (!rule) {
      // Default fallback: new source wins if non-empty
      return { wins: true, reason: 'Default field precedence: non-empty discovery value accepted.' };
    }

    const newPriorityIndex = rule.sourcePriority.indexOf(newSource);
    const curPriorityIndex = rule.sourcePriority.indexOf(currentProvenance.winningSource);

    if (newPriorityIndex !== -1 && curPriorityIndex !== -1) {
      if (newPriorityIndex < curPriorityIndex) {
        return { wins: true, reason: `Rule [${rule.id}]: Source priority ${newSource} (#${newPriorityIndex + 1}) beats ${currentProvenance.winningSource} (#${curPriorityIndex + 1}).` };
      } else if (newPriorityIndex > curPriorityIndex) {
        return { wins: false, reason: `Rule [${rule.id}]: Source priority ${currentProvenance.winningSource} (#${curPriorityIndex + 1}) retains precedence over ${newSource} (#${newPriorityIndex + 1}).` };
      }
    }

    return { wins: true, reason: 'Equal priority source: updated with recent timestamp.' };
  }

  /**
   * Process a single Discovery Result through the Reconciliation Pipeline
   */
  public processDiscoveryResult(candidate: UnifiedDiscoveryResult): ReconciliationResult {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

    // Multi-tenant check: match only within candidate's tenant
    const tenantCis = Array.from(this.canonicalCis.values()).filter(c => c.tenantId === candidate.tenantId);

    let bestMatch: { targetCi: CanonicalCiRecord; score: number; matchedAttrs: string[] } | null = null;

    for (const ci of tenantCis) {
      const match = this.calculateMatchConfidence(candidate, ci);
      if (match.score > (bestMatch?.score || 0)) {
        bestMatch = { targetCi: ci, score: match.score, matchedAttrs: match.matchedAttrs };
      }
    }

    const autoMergeThreshold = this.identificationConfig.autoMergeThreshold;
    const reviewThreshold = this.identificationConfig.reviewThreshold;

    if (bestMatch && bestMatch.score >= autoMergeThreshold) {
      // AUTOMATIC MERGE into Existing CI
      const ci = bestMatch.targetCi;
      let conflictsCount = 0;

      // Merge attributes per field-level precedence
      const candidateSource: ReconciliationSource = candidate.sourceMethod === 'Agentless Network' 
        ? 'Agentless' 
        : candidate.sourceMethod === 'Endpoint Agent' 
        ? 'Agent' 
        : candidate.sourceMethod === 'Cloud API' 
        ? 'Cloud API' 
        : candidate.sourceMethod === 'SaaS OAuth' 
        ? 'SaaS API' 
        : 'Manual';

      const fieldsToEvaluate = [
        ['hostname', candidate.hostname],
        ['ipAddress', candidate.ipAddress],
        ['macAddress', candidate.macAddress],
        ['serialNumber', candidate.serialNumber],
        ['osVersion', candidate.osVersion],
        ['manufacturer', candidate.manufacturer],
        ['model', candidate.model]
      ];

      fieldsToEvaluate.forEach(([field, val]) => {
        if (val) {
          const evalRes = this.evaluateFieldPrecedence(
            field, 
            ci.ciClass, 
            candidateSource, 
            val, 
            ci.fieldProvenance[field]
          );

          if (evalRes.wins) {
            // Track conflict if old value was different
            if (ci.attributes[field] && ci.attributes[field] !== val) {
              conflictsCount++;
              if (!ci.fieldProvenance[field]) {
                ci.fieldProvenance[field] = {
                  fieldName: field,
                  winningValue: val,
                  winningSource: candidateSource,
                  confidenceScore: candidate.confidenceScore,
                  lastUpdated: timestamp,
                  conflictingValues: []
                };
              }
              ci.fieldProvenance[field].conflictingValues.push({
                source: ci.fieldProvenance[field].winningSource,
                value: ci.attributes[field],
                timestamp: ci.fieldProvenance[field].lastUpdated
              });
            }

            ci.attributes[field] = val;
            ci.fieldProvenance[field] = {
              fieldName: field,
              winningValue: val,
              winningSource: candidateSource,
              confidenceScore: candidate.confidenceScore,
              lastUpdated: timestamp,
              conflictingValues: ci.fieldProvenance[field]?.conflictingValues || []
            };
          }
        }
      });

      if (!ci.associatedDiscoverySources.includes(candidateSource)) {
        ci.associatedDiscoverySources.push(candidateSource);
      }
      ci.updatedAt = timestamp;

      return {
        candidateId: candidate.id,
        outcome: 'AUTOMATIC_MERGE',
        targetCiId: ci.id,
        confidenceScore: bestMatch.score,
        matchedAttributes: bestMatch.matchedAttrs,
        conflictsDetectedCount: conflictsCount,
        log: `Reconciled into CI [${ci.id}] with confidence score ${bestMatch.score}%. Matched: ${bestMatch.matchedAttrs.join(', ')}.`,
        timestamp
      };
    } else if (bestMatch && bestMatch.score >= reviewThreshold) {
      // NEEDS APPROVAL (Possible Duplicate)
      const ci = bestMatch.targetCi;
      this.pendingApprovals.set(candidate.id, { candidate, targetCi: ci, matchScore: bestMatch.score });

      return {
        candidateId: candidate.id,
        outcome: 'NEEDS_APPROVAL',
        targetCiId: ci.id,
        confidenceScore: bestMatch.score,
        matchedAttributes: bestMatch.matchedAttrs,
        conflictsDetectedCount: 0,
        log: `Match score ${bestMatch.score}% is above review threshold (${reviewThreshold}%) but below auto-merge threshold (${autoMergeThreshold}%). Flagged for Admin Review.`,
        timestamp
      };
    } else {
      // CREATE NEW CANONICAL CI
      const newCiId = `ci-gen-${Date.now()}`;
      const candidateSource: ReconciliationSource = candidate.sourceMethod === 'Endpoint Agent' ? 'Agent' : 'Agentless';

      const newCi: CanonicalCiRecord = {
        id: newCiId,
        ciName: candidate.hostname || `discovered-ci-${Date.now()}`,
        ciClass: candidate.candidateClass,
        ciType: candidate.candidateType,
        tenantId: candidate.tenantId,
        attributes: {
          hostname: candidate.hostname,
          ipAddress: candidate.ipAddress,
          macAddress: candidate.macAddress,
          serialNumber: candidate.serialNumber,
          manufacturer: candidate.manufacturer,
          model: candidate.model,
          osVersion: candidate.osVersion
        },
        fieldProvenance: {
          hostname: {
            fieldName: 'hostname',
            winningValue: candidate.hostname,
            winningSource: candidateSource,
            confidenceScore: candidate.confidenceScore,
            lastUpdated: timestamp,
            conflictingValues: []
          }
        },
        associatedDiscoverySources: [candidateSource],
        createdAt: timestamp,
        updatedAt: timestamp
      };

      this.canonicalCis.set(newCi.id, newCi);

      return {
        candidateId: candidate.id,
        outcome: 'NEW_CI_CREATED',
        targetCiId: newCiId,
        confidenceScore: bestMatch ? bestMatch.score : 0,
        matchedAttributes: [],
        conflictsDetectedCount: 0,
        log: `Match score below threshold. Created new Canonical CI [${newCiId}].`,
        timestamp
      };
    }
  }

  /**
   * Execute Dry-Run Simulation on Discovery Candidates without altering live CMDB state
   */
  public runSimulation(candidates: UnifiedDiscoveryResult[]): DryRunSimulationReport {
    let matchesCount = 0;
    let autoMergesCount = 0;
    let reviewNeededCount = 0;
    let newCisCount = 0;
    let totalConflicts = 0;

    const details: DryRunSimulationReport['details'] = [];

    candidates.forEach(candidate => {
      const tenantCis = Array.from(this.canonicalCis.values()).filter(c => c.tenantId === candidate.tenantId);
      let bestMatch: { targetCi: CanonicalCiRecord; score: number } | null = null;

      for (const ci of tenantCis) {
        const match = this.calculateMatchConfidence(candidate, ci);
        if (match.score > (bestMatch?.score || 0)) {
          bestMatch = { targetCi: ci, score: match.score };
        }
      }

      if (bestMatch && bestMatch.score >= this.identificationConfig.autoMergeThreshold) {
        matchesCount++;
        autoMergesCount++;
        details.push({
          candidateHostname: candidate.hostname,
          targetCiName: bestMatch.targetCi.ciName,
          matchScore: bestMatch.score,
          recommendedAction: 'AUTOMATIC_MERGE',
          fieldChanges: ['osVersion -> update via precedence', 'ipAddress -> refreshed']
        });
      } else if (bestMatch && bestMatch.score >= this.identificationConfig.reviewThreshold) {
        matchesCount++;
        reviewNeededCount++;
        details.push({
          candidateHostname: candidate.hostname,
          targetCiName: bestMatch.targetCi.ciName,
          matchScore: bestMatch.score,
          recommendedAction: 'FLAG_FOR_REVIEW',
          fieldChanges: ['Pending Admin Approval']
        });
      } else {
        newCisCount++;
        details.push({
          candidateHostname: candidate.hostname,
          matchScore: bestMatch ? bestMatch.score : 0,
          recommendedAction: 'CREATE_NEW_CI',
          fieldChanges: ['Initial attributes populate']
        });
      }
    });

    return {
      recordsTested: candidates.length,
      potentialMatches: matchesCount,
      potentialAutoMerges: autoMergesCount,
      potentialReviewNeeded: reviewNeededCount,
      potentialNewCis: newCisCount,
      fieldConflictsCount: totalConflicts,
      details
    };
  }

  /**
   * Update Precedence Rules / Rule Builder
   */
  public updatePrecedenceRule(rule: FieldPrecedenceRule) {
    this.precedenceRules.set(rule.id, {
      ...rule,
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
    });
    this.identificationConfig.ruleVersion += 1;
  }

  public getCanonicalCis(): CanonicalCiRecord[] {
    return Array.from(this.canonicalCis.values());
  }

  public getPrecedenceRules(): FieldPrecedenceRule[] {
    return Array.from(this.precedenceRules.values());
  }

  public getIdentificationConfig(): IdentificationConfig {
    return this.identificationConfig;
  }

  public getPendingApprovals() {
    return Array.from(this.pendingApprovals.values());
  }
}

export const configurableReconciliationEngine = new ConfigurableReconciliationEngine();
