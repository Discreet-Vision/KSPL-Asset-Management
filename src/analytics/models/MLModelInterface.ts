// ==================== ML MODEL INTERFACE & ALGORITHMS ====================
// Abstract interface for replaceable ML algorithms (Anomaly Detection, Forecasting, Failure Risk, EOL Risk).

import { MLModelConfig } from '../types/analyticsTypes';

export interface MLModelInterface {
  modelType: string;
  algorithmName: string;
  predict(inputData: Record<string, any>): Promise<{ score: number; label: string; confidence: number }>;
}

export class MLModelRegistry {
  public static getActiveModels(): MLModelConfig[] {
    return [
      {
        id: 'ml-mod-101',
        modelType: 'Anomaly Detection',
        algorithm: 'Isolation Forest + Statistical Z-Score',
        lastTrainedAt: '2026-08-10 02:00:00',
        accuracyScore: 95.8,
        status: 'Deployed',
        tenantId: 'tenant-kspl-global',
      },
      {
        id: 'ml-mod-102',
        modelType: 'Failure Risk',
        algorithm: 'Gradient Boosted Trees (XGBoost Regressor)',
        lastTrainedAt: '2026-08-09 04:30:00',
        accuracyScore: 92.4,
        status: 'Deployed',
        tenantId: 'tenant-kspl-global',
      },
      {
        id: 'ml-mod-103',
        modelType: 'Forecasting',
        algorithm: 'Prophet + Holt-Winters Time-Series',
        lastTrainedAt: '2026-08-08 01:15:00',
        accuracyScore: 89.6,
        status: 'Deployed',
        tenantId: 'tenant-kspl-global',
      },
      {
        id: 'ml-mod-104',
        modelType: 'EOL Risk',
        algorithm: 'Multi-Factor Vendor Obsolescence Matrix',
        lastTrainedAt: '2026-08-01 00:00:00',
        accuracyScore: 98.1,
        status: 'Deployed',
        tenantId: 'tenant-kspl-global',
      },
    ];
  }
}
