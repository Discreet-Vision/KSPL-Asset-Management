// ==================== ASSETS NESTJS MODULE ====================
// NestJS Domain Module defining DI bindings for Asset Management Bounded Context.

import { InMemoryAssetRepository } from './infrastructure/InMemoryAssetRepository';
import { CreateAssetUseCase } from './application/CreateAssetUseCase';
import { AssetController } from './controllers/AssetController';
import { EventBusPort } from '../../shared/ports/EventBusPort';

export class AssetsModule {
  public static repository = new InMemoryAssetRepository();

  public static getController(eventBus: EventBusPort): AssetController {
    const createAssetUseCase = new CreateAssetUseCase(this.repository, eventBus);
    return new AssetController(createAssetUseCase, this.repository);
  }
}
