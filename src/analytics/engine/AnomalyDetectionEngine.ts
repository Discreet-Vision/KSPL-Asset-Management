// ==================== ANOMALY DETECTION ENGINE ====================
// Identifies unusual patterns in ITAM telemetry without altering source records.

import { AnomalyRecord, AnomalyStatus } from '../types/analyticsTypes';
import { ItamReadOnlyAdapter } from '../adapters/ItamReadOnlyAdapter';

export class AnomalyDetectionEngine {
  public static async detectAnomalies(tenantId: string = 'tenant-kspl-global'): Promise<AnomalyRecord[]> {
    const assets = await ItamReadOnlyAdapter.getAssets();
    const licenses = await ItamReadOnlyAdapter.getLicenses();
    const anomalies: AnomalyRecord[] = [];

    // 1. Detect Unusual Incident Frequency
    for (const asset of assets) {
      if (asset.incidentsCount90d >= 10) {
        anomalies.push({
          id: `anom-inc-${asset.id}`,
          assetId: asset.id,
          assetName: asset.name,
          anomalyType: 'Unusual Incident Frequency',
          severity: asset.incidentsCount90d >= 12 ? 'Critical' : 'High',
          detectedDate: '2026-08-11',
          reason: `Asset logged ${asset.incidentsCount90d} incidents in past 90 days (Baseline: 2.1 incidents). High risk of hardware degradation.`,
          confidence: 96,
          recommendedAction: 'Schedule hardware diagnostic and evaluate for early retirement or warranty replacement.',
          status: 'New',
          baselineValue: '2.1 incidents / 90d',
          observedValue: `${asset.incidentsCount90d} incidents / 90d`,
          affectedDepartment: asset.assignedDepartment,
          affectedLocation: asset.location,
          tenantId,
        });
      }

      // 2. Detect Unexpected Hardware Changes / SMART Warnings
      if (asset.smartHealthStatus === 'Critical Failure Imminent') {
        anomalies.push({
          id: `anom-smart-${asset.id}`,
          assetId: asset.id,
          assetName: asset.name,
          anomalyType: 'Unexpected Hardware Changes',
          severity: 'Critical',
          detectedDate: '2026-08-11',
          reason: 'SMART telemetry reported uncorrectable sector errors & drive degradation. Imminent failure detected.',
          confidence: 99,
          recommendedAction: 'Initiate immediate data backup and dispatch field technician for disk/motherboard replacement.',
          status: 'Investigating',
          baselineValue: 'Healthy SMART status',
          observedValue: 'Critical Failure Imminent',
          affectedDepartment: asset.assignedDepartment,
          affectedLocation: asset.location,
          tenantId,
        });
      }
    }

    // 3. Detect Unusual License Consumption
    for (const lic of licenses) {
      if (lic.status === 'Under-Licensed') {
        const excess = lic.consumedSeats - lic.entitledSeats;
        anomalies.push({
          id: `anom-lic-${lic.id}`,
          anomalyType: 'Unusual License Consumption',
          severity: excess > 50 ? 'Critical' : 'High',
          detectedDate: '2026-08-10',
          reason: `Software license "${lic.softwareName}" exceeded entitled threshold by ${excess} seats (${lic.consumedSeats} consumed vs ${lic.entitledSeats} entitled).`,
          confidence: 98,
          recommendedAction: 'Reclaim inactive user seats or submit PO for true-up entitlement.',
          status: 'New',
          baselineValue: `${lic.entitledSeats} seats`,
          observedValue: `${lic.consumedSeats} seats`,
          tenantId,
        });
      }
    }

    return anomalies;
  }
}
