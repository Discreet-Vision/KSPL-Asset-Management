// ==================== CMDB REPOSITORY ADAPTER ====================
// Repository adapter for CMDB Configuration Items.

import { CiEntity } from '../domain/CiEntity';

export class InMemoryCmdbRepository {
  private static store: Map<string, CiEntity> = new Map();

  constructor() {
    this.seedDefaults();
  }

  private seedDefaults() {
    if (InMemoryCmdbRepository.store.size > 0) return;
    const ci1 = new CiEntity({
      id: 'CI-DB-9011',
      name: 'prod-postgres-primary-cluster',
      ciClass: 'DATABASE',
      environment: 'PRODUCTION',
      status: 'OPERATIONAL',
      ipAddress: '10.0.12.45',
      macAddress: '00:50:56:A1:B2:C3',
      tenantId: 'tenant-kspl-global',
      dependencies: [],
    });

    const ci2 = new CiEntity({
      id: 'CI-APP-3001',
      name: 'core-itam-api-gateway',
      ciClass: 'APPLICATION',
      environment: 'PRODUCTION',
      status: 'OPERATIONAL',
      ipAddress: '10.0.12.10',
      macAddress: '00:50:56:D4:E5:F6',
      tenantId: 'tenant-kspl-global',
      dependencies: ['CI-DB-9011'],
    });

    InMemoryCmdbRepository.store.set('tenant-kspl-global:CI-DB-9011', ci1);
    InMemoryCmdbRepository.store.set('tenant-kspl-global:CI-APP-3001', ci2);
  }

  public async save(ci: CiEntity): Promise<void> {
    InMemoryCmdbRepository.store.set(`${ci.tenantId}:${ci.id}`, ci);
  }

  public async findAll(tenantId: string): Promise<CiEntity[]> {
    const list: CiEntity[] = [];
    for (const [k, ci] of InMemoryCmdbRepository.store.entries()) {
      if (k.startsWith(`${tenantId}:`)) list.push(ci);
    }
    return list;
  }
}
