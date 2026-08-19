// ==================== CREATE ASSET USE CASE ====================
// Application service implementing CreateAsset bounded context use case.

import { AssetEntity, AssetProps } from '../domain/AssetEntity';
import { AssetRepositoryPort } from '../infrastructure/InMemoryAssetRepository';
import { EventBusPort } from '../../../shared/ports/EventBusPort';

export class CreateAssetUseCase {
  constructor(
    private readonly assetRepo: AssetRepositoryPort,
    private readonly eventBus: EventBusPort
  ) {}

  public async execute(props: AssetProps, correlationId: string = `corr-${Date.now()}`): Promise<AssetEntity> {
    const asset = new AssetEntity(props, correlationId);
    await this.assetRepo.save(asset);

    // Dispatch domain events
    const events = asset.getDomainEvents();
    await this.eventBus.publishAll(events);
    asset.clearDomainEvents();

    return asset;
  }
}
