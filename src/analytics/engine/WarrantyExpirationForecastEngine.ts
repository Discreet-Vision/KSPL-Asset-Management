// ==================== WARRANTY EXPIRATION FORECAST ENGINE ====================
// Projects upcoming warranty expirations by region, department, and financial impact.

import { WarrantyExpirationForecast } from '../types/analyticsTypes';

export class WarrantyExpirationForecastEngine {
  public static async calculateWarrantyForecasts(tenantId: string = 'tenant-kspl-global'): Promise<WarrantyExpirationForecast[]> {
    return [
      {
        id: 'warr-fc-30d-apac',
        region: 'APAC',
        assetType: 'Servers & Workstations',
        timeframeDays: 30,
        expiringAssetCount: 14,
        totalReplacementValue: 4200000,
        estimatedRenewalCost: 850000,
        estimatedReplacementCost: 4200000,
        affectedDepartments: ['Infrastructure', 'Finance', 'Engineering'],
        affectedLocations: ['Mumbai HQ', 'Singapore Datacenter', 'Tokyo DC'],
        tenantId,
      },
      {
        id: 'warr-fc-90d-apac',
        region: 'APAC',
        assetType: 'Laptops & Workstations',
        timeframeDays: 90,
        expiringAssetCount: 42,
        totalReplacementValue: 5250000,
        estimatedRenewalCost: 1100000,
        estimatedReplacementCost: 5250000,
        affectedDepartments: ['Sales', 'Human Resources', 'Customer Support'],
        affectedLocations: ['Bengaluru R&D', 'Mumbai HQ'],
        tenantId,
      },
      {
        id: 'warr-fc-90d-amer',
        region: 'AMER',
        assetType: 'Network Switches & Firewalls',
        timeframeDays: 90,
        expiringAssetCount: 8,
        totalReplacementValue: 3600000,
        estimatedRenewalCost: 620000,
        estimatedReplacementCost: 3600000,
        affectedDepartments: ['IT Operations'],
        affectedLocations: ['New York HQ', 'Austin Hub'],
        tenantId,
      },
    ];
  }
}
