// ==================== REST INTEGRATION CONTROLLER ====================
// Versioned REST API endpoints (/api/v1/integration/*) for enterprise integrations.
// Implements Idempotency-Key engine, multi-tenancy, and standardized JSON envelopes.

import { ItamReadAdapter } from '../adapters/ItamReadAdapter';
import { ApiTenantContext, RestApiResponseEnvelope, IdempotencyRecord } from '../types/apiTypes';

export class RestIntegrationController {
  private static idempotencyStore: Map<string, IdempotencyRecord> = new Map();

  public async getAssets(
    ctx: ApiTenantContext,
    filters?: { status?: string; location?: string },
    correlationId: string = `corr-rest-${Date.now()}`
  ): Promise<RestApiResponseEnvelope> {
    const startTime = performance.now();
    const data = ItamReadAdapter.getAssets(ctx, filters);

    return {
      success: true,
      statusCode: 200,
      data,
      meta: {
        requestId: `req-rest-ast-${Date.now()}`,
        correlationId,
        timestamp: new Date().toISOString(),
        domain: 'integration_api',
        tenantId: ctx.tenantId,
        executionTimeMs: Math.round(performance.now() - startTime),
        version: 'v1',
      },
    };
  }

  public async getCis(
    ctx: ApiTenantContext,
    correlationId: string = `corr-rest-${Date.now()}`
  ): Promise<RestApiResponseEnvelope> {
    const startTime = performance.now();
    const data = ItamReadAdapter.getCis(ctx);

    return {
      success: true,
      statusCode: 200,
      data,
      meta: {
        requestId: `req-rest-ci-${Date.now()}`,
        correlationId,
        timestamp: new Date().toISOString(),
        domain: 'integration_api',
        tenantId: ctx.tenantId,
        executionTimeMs: Math.round(performance.now() - startTime),
        version: 'v1',
      },
    };
  }

  public async getSoftwareCatalog(
    ctx: ApiTenantContext,
    correlationId: string = `corr-rest-${Date.now()}`
  ): Promise<RestApiResponseEnvelope> {
    const startTime = performance.now();
    const data = [
      { id: 'SW-101', name: 'Docker Engine Enterprise', publisher: 'Mirantis', category: 'DevOps / Containers', totalInstalledCount: 142 },
      { id: 'SW-102', name: 'OpenSSL Crypto Library', publisher: 'OpenSSL', category: 'Security / Cryptography', totalInstalledCount: 890 },
      { id: 'SW-103', name: 'JetBrains IntelliJ IDEA', publisher: 'JetBrains', category: 'Developer Tools', totalInstalledCount: 64 },
    ];

    return {
      success: true,
      statusCode: 200,
      data,
      meta: {
        requestId: `req-rest-sw-${Date.now()}`,
        correlationId,
        timestamp: new Date().toISOString(),
        domain: 'integration_api',
        tenantId: ctx.tenantId,
        executionTimeMs: Math.round(performance.now() - startTime),
        version: 'v1',
      },
    };
  }

  public async getSoftwareLicenses(
    ctx: ApiTenantContext,
    correlationId: string = `corr-rest-${Date.now()}`
  ): Promise<RestApiResponseEnvelope> {
    const startTime = performance.now();
    const data = [
      { id: 'LIC-201', productName: 'Microsoft 365 E5', purchased: 500, consumed: 512, status: 'UNDER_LICENSED', liabilityUsd: 4800 },
      { id: 'LIC-202', productName: 'Oracle Database Enterprise', purchased: 32, consumed: 28, status: 'COMPLIANT', liabilityUsd: 0 },
    ];

    return {
      success: true,
      statusCode: 200,
      data,
      meta: {
        requestId: `req-rest-lic-${Date.now()}`,
        correlationId,
        timestamp: new Date().toISOString(),
        domain: 'integration_api',
        tenantId: ctx.tenantId,
        executionTimeMs: Math.round(performance.now() - startTime),
        version: 'v1',
      },
    };
  }

  public async getContracts(
    ctx: ApiTenantContext,
    correlationId: string = `corr-rest-${Date.now()}`
  ): Promise<RestApiResponseEnvelope> {
    const startTime = performance.now();
    const data = [
      { id: 'CTR-901', vendor: 'Dell Technologies', contractType: 'Hardware Maintenance', annualCostUsd: 120000, expiresAt: '2027-12-31' },
      { id: 'CTR-902', vendor: 'Microsoft Azure Enterprise Agreement', contractType: 'Cloud Infrastructure EA', annualCostUsd: 450000, expiresAt: '2026-11-15' },
    ];

    return {
      success: true,
      statusCode: 200,
      data,
      meta: {
        requestId: `req-rest-ctr-${Date.now()}`,
        correlationId,
        timestamp: new Date().toISOString(),
        domain: 'integration_api',
        tenantId: ctx.tenantId,
        executionTimeMs: Math.round(performance.now() - startTime),
        version: 'v1',
      },
    };
  }

  public async postWorkflowExecution(
    ctx: ApiTenantContext,
    payload: { workflowId: string; targetEntityId: string },
    idempotencyKey?: string,
    correlationId: string = `corr-rest-${Date.now()}`
  ): Promise<RestApiResponseEnvelope> {
    const startTime = performance.now();

    // Idempotency Protection
    if (idempotencyKey) {
      const storeKey = `${ctx.tenantId}:${idempotencyKey}`;
      const existing = RestIntegrationController.idempotencyStore.get(storeKey);
      if (existing) {
        return {
          ...existing.response,
          meta: {
            ...existing.response.meta,
            idempotencyKey,
            correlationId,
          },
        };
      }
    }

    const response: RestApiResponseEnvelope = {
      success: true,
      statusCode: 201,
      data: {
        executionId: `exec-rest-${Date.now()}`,
        workflowId: payload.workflowId,
        targetEntityId: payload.targetEntityId,
        status: 'WAITING_APPROVAL',
        initiatedBy: ctx.userId,
        tenantId: ctx.tenantId,
        createdAt: new Date().toISOString(),
      },
      meta: {
        requestId: `req-rest-wf-${Date.now()}`,
        correlationId,
        timestamp: new Date().toISOString(),
        domain: 'integration_api',
        tenantId: ctx.tenantId,
        executionTimeMs: Math.round(performance.now() - startTime),
        version: 'v1',
        idempotencyKey,
      },
    };

    if (idempotencyKey) {
      const storeKey = `${ctx.tenantId}:${idempotencyKey}`;
      RestIntegrationController.idempotencyStore.set(storeKey, {
        key: idempotencyKey,
        tenantId: ctx.tenantId,
        endpoint: '/api/v1/integration/workflows',
        response,
        createdAt: new Date().toISOString(),
      });
    }

    return response;
  }
}
