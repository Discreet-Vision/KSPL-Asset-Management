// ==================== SAM (SOFTWARE ASSET MANAGEMENT) MODULE ====================
// SAM Bounded Context evaluating software entitlements, installations, license positions, and compliance gaps.

import { AggregateRoot } from '../../shared/domain/AggregateRoot';
import { DomainEvent } from '../../shared/domain/DomainEvent';
import { ApiResponseEnvelope } from '../../common/types/enterpriseTypes';
import { EventBusPort } from '../../shared/ports/EventBusPort';

export interface LicenseEntitlementProps {
  id: string;
  publisher: string;
  productName: string;
  metric: 'PER_CORE' | 'PER_USER' | 'PER_DEVICE' | 'CONCURRENT';
  purchasedCount: number;
  installedCount: number;
  costPerLicense: number;
  tenantId: string;
}

export class LicenseViolationEvent extends DomainEvent<{ publisher: string; gap: number }> {
  constructor(aggregateId: string, tenantId: string, correlationId: string, publisher: string, gap: number) {
    super('LicenseViolationDetected', aggregateId, 'sam', tenantId, correlationId, { publisher, gap });
  }
}

export class LicenseEntitlementEntity extends AggregateRoot {
  private props: LicenseEntitlementProps;

  constructor(props: LicenseEntitlementProps, correlationId: string = `corr-${Date.now()}`) {
    super(props.id, props.tenantId);
    this.props = { ...props };

    const gap = this.props.installedCount - this.props.purchasedCount;
    if (gap > 0) {
      this.addDomainEvent(new LicenseViolationEvent(this.id, this.tenantId, correlationId, this.props.publisher, gap));
    }
  }

  public calculatePosition(): { status: 'COMPLIANT' | 'NON_COMPLIANT'; gap: number; financialRiskUsd: number } {
    const gap = this.props.installedCount - this.props.purchasedCount;
    const isCompliant = gap <= 0;
    const financialRiskUsd = isCompliant ? 0 : gap * this.props.costPerLicense;

    return {
      status: isCompliant ? 'COMPLIANT' : 'NON_COMPLIANT',
      gap: Math.abs(gap),
      financialRiskUsd,
    };
  }

  public toJSON() {
    return { ...this.props, ...this.calculatePosition() };
  }
}

export class InMemorySamRepository {
  private static store: Map<string, LicenseEntitlementEntity> = new Map();

  constructor() {
    this.seedDefaults();
  }

  private seedDefaults() {
    if (InMemorySamRepository.store.size > 0) return;
    const lic1 = new LicenseEntitlementEntity({
      id: 'SAM-LIC-201',
      publisher: 'Oracle',
      productName: 'Oracle Database 19c Enterprise Edition',
      metric: 'PER_CORE',
      purchasedCount: 16,
      installedCount: 24, // Non-compliant!
      costPerLicense: 17500.00,
      tenantId: 'tenant-kspl-global',
    });

    const lic2 = new LicenseEntitlementEntity({
      id: 'SAM-LIC-202',
      publisher: 'Microsoft',
      productName: 'Microsoft Windows Server 2022 Datacenter',
      metric: 'PER_CORE',
      purchasedCount: 128,
      installedCount: 112,
      costPerLicense: 125.00,
      tenantId: 'tenant-kspl-global',
    });

    InMemorySamRepository.store.set('tenant-kspl-global:SAM-LIC-201', lic1);
    InMemorySamRepository.store.set('tenant-kspl-global:SAM-LIC-202', lic2);
  }

  public async findAll(tenantId: string): Promise<LicenseEntitlementEntity[]> {
    const list: LicenseEntitlementEntity[] = [];
    for (const [k, lic] of InMemorySamRepository.store.entries()) {
      if (k.startsWith(`${tenantId}:`)) list.push(lic);
    }
    return list;
  }
}

export class SamController {
  constructor(
    private readonly samRepo: InMemorySamRepository,
    private readonly eventBus: EventBusPort
  ) {}

  public async getLicenses(tenantId: string, correlationId: string): Promise<ApiResponseEnvelope> {
    const licenses = await this.samRepo.findAll(tenantId);
    
    // Publish any active domain events
    for (const lic of licenses) {
      await this.eventBus.publishAll(lic.getDomainEvents());
      lic.clearDomainEvents();
    }

    return {
      success: true,
      statusCode: 200,
      data: licenses.map((l) => l.toJSON()),
      meta: {
        requestId: `req-sam-${Date.now()}`,
        correlationId,
        timestamp: new Date().toISOString(),
        domain: 'sam',
        tenantId,
        executionTimeMs: 4,
      },
    };
  }
}

export class SamModule {
  public static repository = new InMemorySamRepository();

  public static getController(eventBus: EventBusPort): SamController {
    return new SamController(this.repository, eventBus);
  }
}
