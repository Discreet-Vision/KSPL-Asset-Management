// ==================== HARDWARE FAILURE RISK ENGINE ====================
// Calculates failure risk score (0-100) using multi-factor telemetry with explicit risk categorization.

import { FailureRiskRecord, RiskLevel } from '../types/analyticsTypes';
import { ItamReadOnlyAdapter } from '../adapters/ItamReadOnlyAdapter';

export class HardwareFailureEngine {
  public static async calculateFailureRisks(tenantId: string = 'tenant-kspl-global'): Promise<FailureRiskRecord[]> {
    const assets = await ItamReadOnlyAdapter.getAssets();
    const records: FailureRiskRecord[] = [];

    for (const asset of assets) {
      let score = 10; // Baseline
      const factors = [];

      // Calculate Age
      const purchaseYear = new Date(asset.purchaseDate).getFullYear();
      const currentYear = 2026;
      const ageYears = currentYear - purchaseYear;

      if (ageYears >= 5) {
        score += 35;
        factors.push({ factorName: 'Hardware Age >= 5 Yrs', weightPercentage: 35, description: `Device is ${ageYears} years old. Exceeds standard 3-year lifecycle.`, scoreContribution: 35 });
      } else if (ageYears >= 3) {
        score += 20;
        factors.push({ factorName: 'Hardware Age >= 3 Yrs', weightPercentage: 20, description: `Device is ${ageYears} years old. Reaching end of primary lifespan.`, scoreContribution: 20 });
      }

      // Warranty Status
      const isExpired = new Date(asset.warrantyExpiration) < new Date('2026-08-11');
      if (isExpired) {
        score += 25;
        factors.push({ factorName: 'Warranty Expired', weightPercentage: 25, description: 'Vendor SLA expired. Repairs require out-of-pocket OEM parts.', scoreContribution: 25 });
      }

      // Incidents & Repairs
      if (asset.incidentsCount90d >= 8) {
        score += 25;
        factors.push({ factorName: 'High 90-Day Incident Frequency', weightPercentage: 25, description: `${asset.incidentsCount90d} incidents logged in past 90 days.`, scoreContribution: 25 });
      }

      // SMART Health
      if (asset.smartHealthStatus === 'Critical Failure Imminent') {
        score += 30;
        factors.push({ factorName: 'SMART Critical Telemetry Warning', weightPercentage: 30, description: 'Storage/Motherboard controller reporting sector corruption.', scoreContribution: 30 });
      }

      const finalScore = Math.min(Math.max(score, 0), 100);

      let riskLevel: RiskLevel = 'Low';
      if (finalScore >= 81) riskLevel = 'Critical';
      else if (finalScore >= 61) riskLevel = 'High';
      else if (finalScore >= 31) riskLevel = 'Medium';

      records.push({
        id: `fail-risk-${asset.id}`,
        assetId: asset.id,
        assetName: asset.name,
        assetType: asset.assetType,
        failureRiskScore: finalScore,
        riskLevel,
        factors,
        warrantyStatus: isExpired ? 'Expired' : 'Active',
        incidentCount90d: asset.incidentsCount90d,
        repairCount6m: asset.repairsCount6m,
        ageYears,
        recommendation:
          riskLevel === 'Critical'
            ? 'CRITICAL: Provision immediate hardware replacement before catastrophic outage.'
            : riskLevel === 'High'
            ? 'HIGH: Schedule hardware refresh or extend OEM maintenance warranty.'
            : 'MONITOR: Asset operating within acceptable operational parameters.',
        dataQualityStatus: 'Sufficient Data',
        lastUpdated: '2026-08-11',
        tenantId,
      });
    }

    return records;
  }
}
