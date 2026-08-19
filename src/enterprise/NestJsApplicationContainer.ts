// ==================== NESTJS APPLICATION CONTAINER ====================
// DI Container & API Request Dispatcher executing controllers across all 13 Bounded Contexts.

import { AppModule } from './app.module';
import { ApiResponseEnvelope } from './common/types/enterpriseTypes';

export class NestJsApplicationContainer {
  private static instance: NestJsApplicationContainer;

  private constructor() {
    console.log('[NestJS Framework] Initializing Modular Monolith Container with 13 Bounded Contexts...');
  }

  public static getInstance(): NestJsApplicationContainer {
    if (!NestJsApplicationContainer.instance) {
      NestJsApplicationContainer.instance = new NestJsApplicationContainer();
    }
    return NestJsApplicationContainer.instance;
  }

  /**
   * Dispatches incoming API requests (/api/v1/enterprise/*) to NestJS Controllers
   */
  public async dispatchRequest(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    body: any = {},
    tenantId: string = 'tenant-kspl-global',
    correlationId: string = `corr-${Date.now()}`
  ): Promise<ApiResponseEnvelope> {
    const cleanEndpoint = endpoint.toLowerCase().trim();

    try {
      // Health Checks
      if (cleanEndpoint.includes('/health/live')) {
        return {
          success: true,
          statusCode: 200,
          data: AppModule.healthService.getLiveness(),
          meta: { requestId: `req-h-${Date.now()}`, correlationId, timestamp: new Date().toISOString(), domain: 'health', tenantId, executionTimeMs: 1 },
        };
      }

      if (cleanEndpoint.includes('/health/ready') || cleanEndpoint.includes('/health')) {
        return {
          success: true,
          statusCode: 200,
          data: AppModule.healthService.getReadiness(),
          meta: { requestId: `req-h-${Date.now()}`, correlationId, timestamp: new Date().toISOString(), domain: 'health', tenantId, executionTimeMs: 2 },
        };
      }

      // Domain Routes
      if (cleanEndpoint.includes('/enterprise/assets')) {
        const controller = AppModule.assets.getController(AppModule.eventBus);
        if (method === 'POST') {
          return await controller.createAsset(body, tenantId, correlationId);
        }
        return await controller.getAssets(tenantId, correlationId);
      }

      if (cleanEndpoint.includes('/enterprise/cmdb')) {
        const controller = AppModule.cmdb.getController();
        if (body.ciId) {
          return await controller.runImpactAnalysis(body.ciId, tenantId, correlationId);
        }
        return await controller.getCis(tenantId, correlationId);
      }

      if (cleanEndpoint.includes('/enterprise/discovery')) {
        const controller = AppModule.discovery.getController(AppModule.eventBus);
        if (method === 'POST') {
          return await controller.triggerScan(body.subnet, tenantId, correlationId);
        }
        return await controller.getScans(tenantId, correlationId);
      }

      if (cleanEndpoint.includes('/enterprise/sam')) {
        const controller = AppModule.sam.getController(AppModule.eventBus);
        return await controller.getLicenses(tenantId, correlationId);
      }

      if (cleanEndpoint.includes('/enterprise/compliance')) {
        const controller = AppModule.compliance.getController();
        return await controller.getPolicies(tenantId, correlationId);
      }

      if (cleanEndpoint.includes('/enterprise/financial')) {
        const controller = AppModule.financial.getController();
        return await controller.getBudgets(tenantId, correlationId);
      }

      if (cleanEndpoint.includes('/enterprise/contracts')) {
        const controller = AppModule.contracts.getController();
        return await controller.getContracts(tenantId, correlationId);
      }

      if (cleanEndpoint.includes('/enterprise/workflow')) {
        const controller = AppModule.workflow.getController(AppModule.eventBus);
        if (method === 'POST') {
          return await controller.triggerWorkflow(body.workflowId, body.targetAssetId, tenantId, correlationId);
        }
        return await controller.getWorkflows(tenantId, correlationId);
      }

      if (cleanEndpoint.includes('/enterprise/itsm')) {
        const controller = AppModule.itsm.getController();
        return await controller.getTickets(tenantId, correlationId);
      }

      if (cleanEndpoint.includes('/enterprise/graph')) {
        const controller = AppModule.graph.getController();
        return await controller.getTopology(tenantId, correlationId);
      }

      if (cleanEndpoint.includes('/enterprise/search')) {
        const controller = AppModule.search.getController();
        return await controller.searchAll(body.query || '', tenantId, correlationId);
      }

      if (cleanEndpoint.includes('/enterprise/telemetry')) {
        const controller = AppModule.telemetry.getController();
        return await controller.getMetrics(body.assetId || '', tenantId, correlationId);
      }

      if (cleanEndpoint.includes('/enterprise/analytics')) {
        const controller = AppModule.analytics.getController();
        return await controller.getExecutiveSummary(tenantId, correlationId);
      }

      return {
        success: false,
        statusCode: 404,
        data: null,
        meta: { requestId: `req-404-${Date.now()}`, correlationId, timestamp: new Date().toISOString(), domain: 'core', tenantId, executionTimeMs: 1 },
        error: { code: 'ENDPOINT_NOT_FOUND', message: `Route '${endpoint}' does not exist on NestJS Enterprise Container.` },
      };
    } catch (err: any) {
      return {
        success: false,
        statusCode: 500,
        data: null,
        meta: { requestId: `req-500-${Date.now()}`, correlationId, timestamp: new Date().toISOString(), domain: 'core', tenantId, executionTimeMs: 1 },
        error: { code: 'INTERNAL_FRAMEWORK_ERROR', message: err.message || 'Server error' },
      };
    }
  }

  public getEventHistory() {
    return AppModule.eventBus.getEventHistory();
  }
}
