// ==================== DISCOVERY REPOSITORY & CONTROLLER & MODULE ====================
// Discovery Bounded Context infrastructure and API controller.

import { DiscoveryScanEntity } from './domain/DiscoveryScanEntity';
import { ApiResponseEnvelope } from '../../common/types/enterpriseTypes';
import { EventBusPort } from '../../shared/ports/EventBusPort';

export class InMemoryDiscoveryRepository {
  private static store: Map<string, DiscoveryScanEntity> = new Map();

  constructor() {
    this.seedDefaults();
  }

  private seedDefaults() {
    if (InMemoryDiscoveryRepository.store.size > 0) return;
    const scan = new DiscoveryScanEntity({
      id: 'SCAN-1002',
      subnetRange: '10.0.12.0/24',
      status: 'COMPLETED',
      discoveredDevicesCount: 38,
      tenantId: 'tenant-kspl-global',
      triggeredAt: new Date().toISOString(),
    });
    InMemoryDiscoveryRepository.store.set('tenant-kspl-global:SCAN-1002', scan);
  }

  public async save(scan: DiscoveryScanEntity): Promise<void> {
    InMemoryDiscoveryRepository.store.set(`${scan.tenantId}:${scan.id}`, scan);
  }

  public async findAll(tenantId: string): Promise<DiscoveryScanEntity[]> {
    const list: DiscoveryScanEntity[] = [];
    for (const [k, scan] of InMemoryDiscoveryRepository.store.entries()) {
      if (k.startsWith(`${tenantId}:`)) list.push(scan);
    }
    return list;
  }
}

export class DiscoveryController {
  constructor(
    private readonly discoveryRepo: InMemoryDiscoveryRepository,
    private readonly eventBus: EventBusPort
  ) {}

  public async getScans(tenantId: string, correlationId: string): Promise<ApiResponseEnvelope> {
    const scans = await this.discoveryRepo.findAll(tenantId);
    return {
      success: true,
      statusCode: 200,
      data: scans.map((s) => s.toJSON()),
      meta: {
        requestId: `req-disc-${Date.now()}`,
        correlationId,
        timestamp: new Date().toISOString(),
        domain: 'discovery',
        tenantId,
        executionTimeMs: 3,
      },
    };
  }

  public async triggerScan(subnet: string, tenantId: string, correlationId: string): Promise<ApiResponseEnvelope> {
    const scan = new DiscoveryScanEntity({
      id: `SCAN-${Math.floor(1000 + Math.random() * 9000)}`,
      subnetRange: subnet || '10.0.100.0/24',
      status: 'SCANNING',
      discoveredDevicesCount: 0,
      tenantId,
      triggeredAt: new Date().toISOString(),
    }, correlationId);

    await this.discoveryRepo.save(scan);
    await this.eventBus.publishAll(scan.getDomainEvents());
    scan.clearDomainEvents();

    return {
      success: true,
      statusCode: 202,
      data: scan.toJSON(),
      meta: {
        requestId: `req-disc-trig-${Date.now()}`,
        correlationId,
        timestamp: new Date().toISOString(),
        domain: 'discovery',
        tenantId,
        executionTimeMs: 7,
      },
    };
  }
}

export class DiscoveryModule {
  public static repository = new InMemoryDiscoveryRepository();

  public static getController(eventBus: EventBusPort): DiscoveryController {
    return new DiscoveryController(this.repository, eventBus);
  }
}
