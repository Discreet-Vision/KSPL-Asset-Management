// ==================== EXPRESS ANALYTICS & AI ROUTER ====================
// Isolated REST API routes for analytics, forecasts, anomalies, risks, and AI copilot interactions.

import { AnomalyDetectionEngine } from '../engine/AnomalyDetectionEngine';
import { HardwareFailureEngine } from '../engine/HardwareFailureEngine';
import { EolRiskEngine } from '../engine/EolRiskEngine';
import { WarrantyExpirationForecastEngine } from '../engine/WarrantyExpirationForecastEngine';
import { RenewalCostForecastEngine } from '../engine/RenewalCostForecastEngine';
import { NaturalLanguageQueryEngine } from '../copilot/NaturalLanguageQueryEngine';
import { AIProviderFactory } from '../providers/AIProviderInterface';
import { MLModelRegistry } from '../models/MLModelInterface';
import { AiAuditLogger } from '../security/AiAuditLogger';
import { BackgroundAnalyticsWorker } from '../workers/BackgroundAnalyticsWorker';

export class AnalyticsApiRouter {
  public static async getAnomalies(tenantId?: string) {
    return AnomalyDetectionEngine.detectAnomalies(tenantId);
  }

  public static async getHardwareFailureRisks(tenantId?: string) {
    return HardwareFailureEngine.calculateFailureRisks(tenantId);
  }

  public static async getEolRisks(tenantId?: string) {
    return EolRiskEngine.calculateEolRisks(tenantId);
  }

  public static async getWarrantyForecasts(tenantId?: string) {
    return WarrantyExpirationForecastEngine.calculateWarrantyForecasts(tenantId);
  }

  public static async getRenewalForecasts(tenantId?: string) {
    return RenewalCostForecastEngine.calculateRenewalForecasts(tenantId);
  }

  public static async handleCopilotQuery(prompt: string, userRole: string = 'Admin', tenantId?: string) {
    return NaturalLanguageQueryEngine.executeQuery(prompt, 'session-live', userRole, tenantId);
  }

  public static getProviders() {
    return AIProviderFactory.getConfigs();
  }

  public static getModels() {
    return MLModelRegistry.getActiveModels();
  }

  public static async getAuditLogs() {
    return AiAuditLogger.getLogs();
  }

  public static getWorkerStatus() {
    return BackgroundAnalyticsWorker.getWorkerStatus();
  }
}
