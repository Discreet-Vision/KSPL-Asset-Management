// ==================== ASSET DOMAIN ENTITY ====================
// Domain Aggregate for Asset Management Bounded Context.

import { AggregateRoot } from '../../../shared/domain/AggregateRoot';
import { DomainEvent } from '../../../shared/domain/DomainEvent';

export interface AssetProps {
  id: string;
  name: string;
  category: 'HARDWARE' | 'SOFTWARE' | 'CLOUD' | 'NETWORK';
  status: 'ACTIVE' | 'MAINTENANCE' | 'DISPOSED' | 'RESERVED';
  purchaseCost: number;
  residualValue: number;
  usefulLifeMonths: number;
  tenantId: string;
  assignedToUser?: string;
  serialNumber?: string;
}

export class AssetCreatedEvent extends DomainEvent<{ id: string; name: string; cost: number }> {
  constructor(aggregateId: string, tenantId: string, correlationId: string, name: string, cost: number) {
    super('AssetCreated', aggregateId, 'assets', tenantId, correlationId, { id: aggregateId, name, cost });
  }
}

export class AssetEntity extends AggregateRoot {
  private props: AssetProps;

  constructor(props: AssetProps, correlationId: string = `corr-${Date.now()}`) {
    super(props.id, props.tenantId);
    this.props = { ...props };

    // Emit Domain Event
    this.addDomainEvent(new AssetCreatedEvent(this.id, this.tenantId, correlationId, this.props.name, this.props.purchaseCost));
  }

  public calculateTco(monthlyMaintenanceCost: number = 150): { tco: number; monthlyDepreciation: number } {
    const totalDepreciation = this.props.purchaseCost - this.props.residualValue;
    const monthlyDepreciation = this.props.usefulLifeMonths > 0 ? totalDepreciation / this.props.usefulLifeMonths : 0;
    const totalMaintenance = monthlyMaintenanceCost * (this.props.usefulLifeMonths || 36);
    const tco = this.props.purchaseCost + totalMaintenance - this.props.residualValue;

    return {
      tco: Math.round(tco * 100) / 100,
      monthlyDepreciation: Math.round(monthlyDepreciation * 100) / 100,
    };
  }

  public toJSON() {
    return { ...this.props };
  }
}
