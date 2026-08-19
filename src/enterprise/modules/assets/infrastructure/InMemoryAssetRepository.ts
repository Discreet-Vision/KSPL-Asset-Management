// ==================== ASSET REPOSITORY ADAPTER ====================
// Isolated repository implementation for Asset Management domain.

import { AssetEntity } from '../domain/AssetEntity';

export interface AssetRepositoryPort {
  save(asset: AssetEntity): Promise<void>;
  findById(id: string, tenantId: string): Promise<AssetEntity | null>;
  findAll(tenantId: string): Promise<AssetEntity[]>;
}

export class InMemoryAssetRepository implements AssetRepositoryPort {
  private static store: Map<string, AssetEntity> = new Map();

  constructor() {
    this.seedDefaults();
  }

  private seedDefaults() {
    if (InMemoryAssetRepository.store.size > 0) return;
    const defaultAsset = new AssetEntity({
      id: 'ENT-AST-1001',
      name: 'MacBook Pro 16 M3 Max',
      category: 'HARDWARE',
      status: 'ACTIVE',
      purchaseCost: 3499.00,
      residualValue: 500.00,
      usefulLifeMonths: 36,
      tenantId: 'tenant-kspl-global',
      serialNumber: 'C02GX019MD6T',
    });
    InMemoryAssetRepository.store.set(`tenant-kspl-global:ENT-AST-1001`, defaultAsset);
  }

  public async save(asset: AssetEntity): Promise<void> {
    const key = `${asset.tenantId}:${asset.id}`;
    InMemoryAssetRepository.store.set(key, asset);
  }

  public async findById(id: string, tenantId: string): Promise<AssetEntity | null> {
    const key = `${tenantId}:${id}`;
    return InMemoryAssetRepository.store.get(key) || null;
  }

  public async findAll(tenantId: string): Promise<AssetEntity[]> {
    const results: AssetEntity[] = [];
    for (const [key, asset] of InMemoryAssetRepository.store.entries()) {
      if (key.startsWith(`${tenantId}:`)) {
        results.push(asset);
      }
    }
    return results;
  }
}
