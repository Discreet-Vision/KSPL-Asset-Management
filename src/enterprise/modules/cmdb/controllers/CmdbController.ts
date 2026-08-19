// ==================== CMDB CONTROLLER ====================
// REST API Controller exposing /api/v1/enterprise/cmdb endpoints.

import { InMemoryCmdbRepository } from '../infrastructure/InMemoryCmdbRepository';
import { ApiResponseEnvelope } from '../../../common/types/enterpriseTypes';

export class CmdbController {
  constructor(private readonly cmdbRepo: InMemoryCmdbRepository) {}

  public async getCis(tenantId: string, correlationId: string): Promise<ApiResponseEnvelope> {
    const cis = await this.cmdbRepo.findAll(tenantId);
    return {
      success: true,
      statusCode: 200,
      data: cis.map((c) => c.toJSON()),
      meta: {
        requestId: `req-cmdb-${Date.now()}`,
        correlationId,
        timestamp: new Date().toISOString(),
        domain: 'cmdb',
        tenantId,
        executionTimeMs: 3,
      },
    };
  }

  public async runImpactAnalysis(ciId: string, tenantId: string, correlationId: string): Promise<ApiResponseEnvelope> {
    const cis = await this.cmdbRepo.findAll(tenantId);
    const target = cis.find((c) => c.id === ciId);

    if (!target) {
      return {
        success: false,
        statusCode: 404,
        data: null,
        meta: {
          requestId: `req-cmdb-err-${Date.now()}`,
          correlationId,
          timestamp: new Date().toISOString(),
          domain: 'cmdb',
          tenantId,
          executionTimeMs: 2,
        },
        error: { code: 'NOT_FOUND', message: `CI '${ciId}' not found.` },
      };
    }

    const impact = target.runImpactAnalysis(cis);
    return {
      success: true,
      statusCode: 200,
      data: { targetCiId: ciId, ...impact },
      meta: {
        requestId: `req-impact-${Date.now()}`,
        correlationId,
        timestamp: new Date().toISOString(),
        domain: 'cmdb',
        tenantId,
        executionTimeMs: 6,
      },
    };
  }
}
