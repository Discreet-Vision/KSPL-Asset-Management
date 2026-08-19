// ==================== CMDB NESTJS MODULE ====================
// DI Container module for CMDB bounded context.

import { InMemoryCmdbRepository } from './infrastructure/InMemoryCmdbRepository';
import { CmdbController } from './controllers/CmdbController';

export class CmdbModule {
  public static repository = new InMemoryCmdbRepository();

  public static getController(): CmdbController {
    return new CmdbController(this.repository);
  }
}
