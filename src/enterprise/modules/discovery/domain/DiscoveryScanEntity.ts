// ==================== DISCOVERY SCAN DOMAIN ENTITY ====================
// Domain Aggregate for Discovery Bounded Context.

import { AggregateRoot } from '../../../shared/domain/AggregateRoot';
import { DomainEvent } from '../../../shared/domain/DomainEvent';

export interface DiscoveryScanProps {
  id: string;
  subnetRange: string;
  status: 'PENDING' | 'SCANNING' | 'COMPLETED' | 'FAILED';
  discoveredDevicesCount: number;
  tenantId: string;
  triggeredAt: string;
}

export class ScanTriggeredEvent extends DomainEvent<{ scanId: string; subnet: string }> {
  constructor(aggregateId: string, tenantId: string, correlationId: string, subnet: string) {
    super('DiscoveryScanTriggered', aggregateId, 'discovery', tenantId, correlationId, { scanId: aggregateId, subnet });
  }
}

export class DiscoveryScanEntity extends AggregateRoot {
  private props: DiscoveryScanProps;

  constructor(props: DiscoveryScanProps, correlationId: string = `corr-${Date.now()}`) {
    super(props.id, props.tenantId);
    this.props = { ...props };
    this.addDomainEvent(new ScanTriggeredEvent(this.id, this.tenantId, correlationId, this.props.subnetRange));
  }

  public completeScan(devicesFound: number): void {
    this.props.status = 'COMPLETED';
    this.props.discoveredDevicesCount = devicesFound;
  }

  public toJSON() {
    return { ...this.props };
  }
}
