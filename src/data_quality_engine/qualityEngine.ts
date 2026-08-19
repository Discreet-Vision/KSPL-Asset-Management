import { 
  QualityStatus, 
  QualityTrend, 
  VerificationStatus, 
  ClassQualityRuleConfig, 
  QualityScoreBreakdown, 
  CiQualityRecord, 
  QualityScanSummary, 
  DataQualityAlert 
} from './types';
import { configurableReconciliationEngine } from '../reconciliation_engine/reconciliationEngine';
import { multiMethodDiscoveryEngine } from '../discovery_engine/discoveryEngine';

export class DataQualityScoringEngine {
  private classRules: Map<string, ClassQualityRuleConfig> = new Map();
  private qualityRecords: Map<string, CiQualityRecord> = new Map();
  private alerts: DataQualityAlert[] = [];

  constructor() {
    this.seedDefaultClassRules();
    this.seedInitialQualityRecords();
  }

  private seedDefaultClassRules() {
    const defaultRules: ClassQualityRuleConfig[] = [
      {
        id: 'rule-cfg-server',
        ciClass: 'Hardware',
        requiredFields: ['hostname', 'serialNumber', 'osVersion', 'ipAddress', 'macAddress'],
        fieldWeights: [
          { fieldName: 'serialNumber', weightPct: 25, isRequired: true, validityFormat: 'NonEmptyString' },
          { fieldName: 'hostname', weightPct: 20, isRequired: true, validityFormat: 'NonEmptyString' },
          { fieldName: 'ipAddress', weightPct: 20, isRequired: true, validityFormat: 'IPv4/IPv6' },
          { fieldName: 'osVersion', weightPct: 20, isRequired: true, validityFormat: 'NonEmptyString' },
          { fieldName: 'macAddress', weightPct: 15, isRequired: false, validityFormat: 'MAC' }
        ],
        freshnessDaysThresholds: {
          optimalDays: 1,
          goodDays: 7,
          agingDays: 30,
          staleDays: 90
        },
        conflictPenaltyPct: 10,
        stalePenaltyPct: 15,
        tenantId: 'tenant-kspl-global',
        updatedAt: '2026-08-11 10:00:00'
      },
      {
        id: 'rule-cfg-cloud',
        ciClass: 'Cloud',
        requiredFields: ['hostname', 'cloudResourceId', 'ipAddress'],
        fieldWeights: [
          { fieldName: 'cloudResourceId', weightPct: 40, isRequired: true, validityFormat: 'NonEmptyString' },
          { fieldName: 'hostname', weightPct: 30, isRequired: true, validityFormat: 'NonEmptyString' },
          { fieldName: 'ipAddress', weightPct: 30, isRequired: true, validityFormat: 'IPv4/IPv6' }
        ],
        freshnessDaysThresholds: {
          optimalDays: 1,
          goodDays: 3,
          agingDays: 14,
          staleDays: 30
        },
        conflictPenaltyPct: 10,
        stalePenaltyPct: 20,
        tenantId: 'tenant-kspl-global',
        updatedAt: '2026-08-11 10:00:00'
      }
    ];

    defaultRules.forEach(r => this.classRules.set(r.id, r));
  }

  private seedInitialQualityRecords() {
    const canonicalCis = configurableReconciliationEngine.getCanonicalCis();
    canonicalCis.forEach(ci => {
      this.evaluateAndStoreCiQuality(ci);
    });
  }

  /**
   * Helper: Is value a meaningless placeholder?
   */
  private isMeaninglessValue(val: any): boolean {
    if (val === null || val === undefined) return true;
    const str = String(val).trim().toLowerCase();
    const placeholders = ['', 'null', 'undefined', 'n/a', 'na', 'unknown', 'not available', '-', 'none', 'dummy', '123456', '00000000'];
    return placeholders.includes(str);
  }

  /**
   * Format Validation helpers
   */
  private isValidIp(ip: string): boolean {
    if (this.isMeaninglessValue(ip)) return false;
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
  }

  private isValidMac(mac: string): boolean {
    if (this.isMeaninglessValue(mac)) return false;
    const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
    return macRegex.test(mac);
  }

  /**
   * Evaluate Freshness Score & Verification Status based on last verified timestamp
   */
  private calculateFreshness(lastUpdatedStr: string, config: ClassQualityRuleConfig['freshnessDaysThresholds']): {
    freshnessScore: number;
    status: VerificationStatus;
    daysOld: number;
  } {
    if (!lastUpdatedStr || this.isMeaninglessValue(lastUpdatedStr)) {
      return { freshnessScore: 25, status: 'Never Verified', daysOld: 999 };
    }

    const lastDate = new Date(lastUpdatedStr).getTime();
    const now = Date.now();
    const diffMs = Math.max(0, now - lastDate);
    const daysOld = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (daysOld <= config.optimalDays) {
      return { freshnessScore: 100, status: 'Recently Verified', daysOld };
    } else if (daysOld <= config.goodDays) {
      return { freshnessScore: 90, status: 'Verified', daysOld };
    } else if (daysOld <= config.agingDays) {
      return { freshnessScore: 75, status: 'Aging', daysOld };
    } else if (daysOld <= config.staleDays) {
      return { freshnessScore: 50, status: 'Stale', daysOld };
    } else {
      return { freshnessScore: 25, status: 'Stale', daysOld };
    }
  }

  /**
   * Main Evaluation Function for a single CI
   */
  public evaluateCiQuality(ci: any): QualityScoreBreakdown {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const reasons: string[] = [];
    const recommendedActions: string[] = [];

    // Find class rule
    const rule = Array.from(this.classRules.values()).find(r => r.ciClass === ci.ciClass) ||
      Array.from(this.classRules.values())[0];

    // 1. Required Field & Weight Completeness Calculation
    let totalWeight = 0;
    let earnedCompletenessWeight = 0;
    let requiredPopulatedCount = 0;

    rule.fieldWeights.forEach(fw => {
      totalWeight += fw.weightPct;
      const val = ci.attributes ? ci.attributes[fw.fieldName] : ci[fw.fieldName];
      const isPopulated = !this.isMeaninglessValue(val);

      if (isPopulated) {
        earnedCompletenessWeight += fw.weightPct;
        if (fw.isRequired) requiredPopulatedCount++;
      } else {
        if (fw.isRequired) {
          reasons.push(`Required field '${fw.fieldName}' is missing or contains placeholder.`);
          recommendedActions.push(`Populate missing required field '${fw.fieldName}'.`);
        }
      }
    });

    const completenessScore = totalWeight > 0 ? Math.round((earnedCompletenessWeight / totalWeight) * 100) : 50;

    // 2. Data Validity Check
    let validityIssues = 0;
    rule.fieldWeights.forEach(fw => {
      const val = ci.attributes ? ci.attributes[fw.fieldName] : ci[fw.fieldName];
      if (!this.isMeaninglessValue(val)) {
        if (fw.validityFormat === 'IPv4/IPv6' && !this.isValidIp(val)) {
          validityIssues++;
          reasons.push(`Field '${fw.fieldName}' contains invalid IP format: '${val}'.`);
        } else if (fw.validityFormat === 'MAC' && !this.isValidMac(val)) {
          validityIssues++;
          reasons.push(`Field '${fw.fieldName}' contains invalid MAC address format: '${val}'.`);
        }
      }
    });

    const validityScore = Math.max(0, 100 - validityIssues * 25);

    // 3. Consistency Check (e.g. Dell + MacBook, Windows + ARM)
    let consistencyScore = 100;
    const mfg = ci.attributes?.manufacturer || ci.manufacturer;
    const mdl = ci.attributes?.model || ci.model;
    if (mfg && mdl) {
      if (mfg.toLowerCase().includes('dell') && mdl.toLowerCase().includes('macbook')) {
        consistencyScore = 50;
        reasons.push(`Inconsistency detected: Manufacturer '${mfg}' conflicts with Model '${mdl}'.`);
        recommendedActions.push(`Verify hardware brand specification.`);
      }
    }

    // 4. Freshness Score
    const lastVer = ci.updatedAt || ci.createdAt || '';
    const freshnessRes = this.calculateFreshness(lastVer, rule.freshnessDaysThresholds);
    if (freshnessRes.status === 'Stale') {
      reasons.push(`CI verification is stale (${freshnessRes.daysOld} days since last discovery update).`);
      recommendedActions.push(`Trigger endpoint or network discovery scan.`);
    }

    // 5. Source Confidence Score
    let sourceConfidenceScore = 90;
    const sources = ci.associatedDiscoverySources || [];
    if (sources.includes('Agent') || sources.includes('Cloud API')) {
      sourceConfidenceScore = 98;
    } else if (sources.includes('WMI') || sources.includes('SSH')) {
      sourceConfidenceScore = 92;
    } else if (sources.includes('Manual') || sources.includes('Import')) {
      sourceConfidenceScore = 70;
    }

    // 6. Reconciliation Confidence
    let reconciliationConfidenceScore = 95;

    // 7. Conflict & Stale Penalties
    let conflictPenaltyApplied = 0;
    let stalePenaltyApplied = 0;

    // Check conflict count
    let conflictCount = 0;
    if (ci.fieldProvenance) {
      Object.values(ci.fieldProvenance).forEach((prov: any) => {
        if (prov.conflictingValues && prov.conflictingValues.length > 0) {
          conflictCount += prov.conflictingValues.length;
        }
      });
    }

    if (conflictCount > 0) {
      conflictPenaltyApplied = rule.conflictPenaltyPct;
      reasons.push(`Detected ${conflictCount} unresolved discovery attribute field conflicts.`);
      recommendedActions.push(`Resolve field conflicts in Reconciliation Manager.`);
    }

    if (freshnessRes.status === 'Stale') {
      stalePenaltyApplied = rule.stalePenaltyPct;
    }

    // Weighted Overall Score
    const rawWeighted = 
      completenessScore * 0.35 +
      validityScore * 0.20 +
      consistencyScore * 0.15 +
      freshnessRes.freshnessScore * 0.15 +
      sourceConfidenceScore * 0.15;

    const overallScore = Math.max(0, Math.min(100, Math.round(rawWeighted - conflictPenaltyApplied - stalePenaltyApplied)));

    // Quality Status Thresholds
    let status: QualityStatus = 'Needs Improvement';
    if (overallScore >= 90) status = 'Excellent';
    else if (overallScore >= 75) status = 'Good';
    else if (overallScore >= 50) status = 'Needs Improvement';
    else if (overallScore >= 25) status = 'Poor';
    else status = 'Critical';

    if (reasons.length === 0) {
      reasons.push(`All required attributes populated and verified recently.`);
    }

    return {
      overallScore,
      status,
      completenessScore,
      validityScore,
      consistencyScore,
      freshnessScore: freshnessRes.freshnessScore,
      sourceConfidenceScore,
      reconciliationConfidenceScore,
      conflictPenaltyApplied,
      stalePenaltyApplied,
      verificationStatus: freshnessRes.status,
      reasons,
      recommendedActions,
      evaluatedAt: timestamp
    };
  }

  /**
   * Evaluate and Store CI Quality Record
   */
  public evaluateAndStoreCiQuality(ci: any): CiQualityRecord {
    const breakdown = this.evaluateCiQuality(ci);
    const existing = this.qualityRecords.get(ci.id);

    let trend: QualityTrend = 'Stable';
    const history = existing?.historicalScores || [
      { timestamp: '2026-08-01 10:00:00', score: Math.max(20, breakdown.overallScore - 10) },
      { timestamp: '2026-08-05 10:00:00', score: Math.max(20, breakdown.overallScore - 5) }
    ];

    if (existing) {
      if (breakdown.overallScore > existing.breakdown.overallScore) trend = 'Improving';
      else if (breakdown.overallScore < existing.breakdown.overallScore) trend = 'Declining';
    }

    history.push({ timestamp: breakdown.evaluatedAt, score: breakdown.overallScore });

    const record: CiQualityRecord = {
      ciId: ci.id,
      ciName: ci.ciName || ci.hostname || ci.id,
      ciClass: ci.ciClass || 'Hardware',
      tenantId: ci.tenantId || 'tenant-kspl-global',
      breakdown,
      lastVerified: ci.updatedAt || breakdown.evaluatedAt,
      trend,
      historicalScores: history.slice(-10) // keep last 10
    };

    this.qualityRecords.set(ci.id, record);

    // Create Alert if score drops below threshold
    if (breakdown.overallScore < 60) {
      this.alerts.push({
        id: `alt-${Date.now()}`,
        ciId: ci.id,
        ciName: record.ciName,
        tenantId: record.tenantId,
        severity: breakdown.overallScore < 35 ? 'High' : 'Medium',
        message: `CI '${record.ciName}' Quality Score dropped to ${breakdown.overallScore}% (${breakdown.status}).`,
        triggerReason: breakdown.reasons.join(' '),
        createdAt: breakdown.evaluatedAt
      });
    }

    return record;
  }

  /**
   * Run Scheduled Quality Scan across all Canonical CIs
   */
  public runFullQualityScan(tenantId: string = 'tenant-kspl-global'): QualityScanSummary {
    const canonicalCis = configurableReconciliationEngine.getCanonicalCis();
    let totalScoreSum = 0;
    let excellentCount = 0;
    let goodCount = 0;
    let needsImprovementCount = 0;
    let poorCount = 0;
    let criticalCount = 0;
    let staleCount = 0;
    let conflictedCount = 0;

    canonicalCis.forEach(ci => {
      if (!ci.tenantId || ci.tenantId === tenantId) {
        const rec = this.evaluateAndStoreCiQuality(ci);
        totalScoreSum += rec.breakdown.overallScore;

        if (rec.breakdown.status === 'Excellent') excellentCount++;
        else if (rec.breakdown.status === 'Good') goodCount++;
        else if (rec.breakdown.status === 'Needs Improvement') needsImprovementCount++;
        else if (rec.breakdown.status === 'Poor') poorCount++;
        else if (rec.breakdown.status === 'Critical') criticalCount++;

        if (rec.breakdown.verificationStatus === 'Stale') staleCount++;
        if (rec.breakdown.conflictPenaltyApplied > 0) conflictedCount++;
      }
    });

    const evaluatedRecords = Array.from(this.qualityRecords.values()).filter(r => r.tenantId === tenantId);
    const count = evaluatedRecords.length;

    return {
      scanId: `scan-${Date.now()}`,
      tenantId,
      totalCisEvaluated: count,
      avgQualityScore: count > 0 ? Math.round(totalScoreSum / count) : 0,
      excellentCount,
      goodCount,
      needsImprovementCount,
      poorCount,
      criticalCount,
      staleCount,
      conflictedCount,
      scannedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
  }

  // Getters
  public getQualityRecords(tenantId: string = 'tenant-kspl-global'): CiQualityRecord[] {
    return Array.from(this.qualityRecords.values()).filter(r => r.tenantId === tenantId);
  }

  public getClassRules(): ClassQualityRuleConfig[] {
    return Array.from(this.classRules.values());
  }

  public updateClassRule(rule: ClassQualityRuleConfig) {
    this.classRules.set(rule.id, rule);
  }

  public getAlerts(): DataQualityAlert[] {
    return this.alerts;
  }
}

export const dataQualityScoringEngine = new DataQualityScoringEngine();
