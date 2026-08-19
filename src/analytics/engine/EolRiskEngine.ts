// ==================== EOL RISK & OBSOLESCENCE ENGINE ====================
// Detects vendor End-of-Life (EOL), End-of-Support (EOS), and OS obsolescence risks.

import { EolRiskRecord, RiskLevel } from '../types/analyticsTypes';
import { ItamReadOnlyAdapter } from '../adapters/ItamReadOnlyAdapter';

export class EolRiskEngine {
  public static async calculateEolRisks(tenantId: string = 'tenant-kspl-global'): Promise<EolRiskRecord[]> {
    const assets = await ItamReadOnlyAdapter.getAssets();
    const records: EolRiskRecord[] = [];

    for (const asset of assets) {
      const isWindows10 = asset.osVersion?.includes('Windows 10');
      const isRhel7 = asset.osVersion?.includes('Red Hat Enterprise Linux 7');
      const isWin2012 = asset.osVersion?.includes('Windows Server 2012');

      let riskLevel: RiskLevel = 'Low';
      let reason = 'Supported hardware and operating system.';
      let isUnsupportedOs = false;

      if (isWin2012) {
        riskLevel = 'Critical';
        reason = 'Windows Server 2012 R2 reached End of Life (Oct 2023). Zero security patches available from Microsoft.';
        isUnsupportedOs = true;
      } else if (isRhel7) {
        riskLevel = 'High';
        reason = 'RHEL 7 reached End of Maintenance (June 2024). ELS subscription required for security updates.';
        isUnsupportedOs = true;
      } else if (isWindows10) {
        riskLevel = 'Medium';
        reason = 'Windows 10 End of Support approaching (Oct 2025). Upgrade to Windows 11 required.';
        isUnsupportedOs = false;
      }

      records.push({
        id: `eol-risk-${asset.id}`,
        assetId: asset.id,
        assetName: asset.name,
        assetType: asset.assetType,
        eolRiskLevel: riskLevel,
        expectedEolDate: isWin2012 ? '2023-10-10' : isRhel7 ? '2024-06-30' : '2025-10-14',
        monthsRemaining: isWin2012 ? 0 : isRhel7 ? 0 : 2,
        reason,
        replacementCostEst: asset.purchaseCost * 1.15, // 15% inflation adjustment
        vendorName: asset.vendor,
        osVersion: asset.osVersion,
        isUnsupportedOs,
        tenantId,
      });
    }

    return records;
  }
}
