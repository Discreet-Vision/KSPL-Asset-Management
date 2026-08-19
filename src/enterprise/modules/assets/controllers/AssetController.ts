// ==================== ASSET CONTROLLER ====================
// REST API Controller exposing /api/v1/enterprise/assets endpoints.

import { CreateAssetUseCase } from '../application/CreateAssetUseCase';
import { InMemoryAssetRepository } from '../infrastructure/InMemoryAssetRepository';
import { ApiResponseEnvelope } from '../../../common/types/enterpriseTypes';

export class AssetController {
  constructor(
    private readonly createAssetUseCase: CreateAssetUseCase,
    private readonly assetRepo: InMemoryAssetRepository
  ) {}

  public async getAssets(tenantId: string, correlationId: string): Promise<ApiResponseEnvelope> {
    const assets = await this.assetRepo.findAll(tenantId);
    return {
      success: true,
      statusCode: 200,
      data: assets.map((a) => a.toJSON()),
      meta: {
        requestId: `req-ast-${Date.now()}`,
        correlationId,
        timestamp: new Date().toISOString(),
        domain: 'assets',
        tenantId,
        executionTimeMs: 4,
      },
    };
  }

  public async createAsset(payload: any, tenantId: string, correlationId: string): Promise<ApiResponseEnvelope> {
    const asset = await this.createAssetUseCase.execute(
      {
        id: payload.id || `ENT-AST-${Math.floor(1000 + Math.random() * 9000)}`,
        name: payload.name || 'Enterprise Server Node',
        category: payload.category || 'HARDWARE',
        status: payload.status || 'ACTIVE',
        purchaseCost: payload.purchaseCost || 5200.0,
        residualValue: payload.residualValue || 600.0,
        usefulLifeMonths: payload.usefulLifeMonths || 48,
        tenantId,
      },
      correlationId
    );

    return {
      success: true,
      statusCode: 201,
      data: asset.toJSON(),
      meta: {
        requestId: `req-ast-create-${Date.now()}`,
        correlationId,
        timestamp: new Date().toISOString(),
        domain: 'assets',
        tenantId,
        executionTimeMs: 8,
      },
    };
  }
}
