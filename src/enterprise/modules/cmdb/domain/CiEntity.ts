// ==================== CMDB CI DOMAIN ENTITY ====================
// Domain Aggregate for CMDB Configuration Items.

import { AggregateRoot } from '../../../shared/domain/AggregateRoot';
import { DomainEvent } from '../../../shared/domain/DomainEvent';

export interface CiProps {
  id: string;
  name: string;
  ciClass: 'SERVER' | 'DATABASE' | 'APPLICATION' | 'SWITCH' | 'KUBERNETES_CLUSTER';
  environment: 'PRODUCTION' | 'STAGING' | 'DEVELOPMENT';
  status: 'OPERATIONAL' | 'DEGRADED' | 'MAINTENANCE' | 'OFFLINE';
  ipAddress: string;
  macAddress: string;
  tenantId: string;
  dependencies?: string[]; // IDs of connected CIs
}

export class CiDiscoveredEvent extends DomainEvent<{ ciId: string; name: string }> {
  constructor(aggregateId: string, tenantId: string, correlationId: string, name: string) {
    super('CIDiscovered', aggregateId, 'cmdb', tenantId, correlationId, { ciId: aggregateId, name });
  }
}

export class CiEntity extends AggregateRoot {
  private props: CiProps;

  constructor(props: CiProps, correlationId: string = `corr-${Date.now()}`) {
    super(props.id, props.tenantId);
    this.props = { dependencies: [], ...props };
    this.addDomainEvent(new CiDiscoveredEvent(this.id, this.tenantId, correlationId, this.props.name));
  }

  public runImpactAnalysis(allCis: CiEntity[]): { impactedCiIds: string[]; riskLevel: 'HIGH' | 'MEDIUM' | 'LOW' } {
    const impacted = new Set<string>();
    
    // Find CIs that directly or indirectly depend on this CI
    allCis.forEach((ci) => {
      const deps = ci.toJSON().dependencies || [];
      if (deps.includes(this.id)) {
        impacted.add(ci.id);
      }
    });

    const riskLevel = impacted.size > 5 ? 'HIGH' : impacted.size > 1 ? 'MEDIUM' : 'LOW';
    return { impactedCiIds: Array.from(impacted), riskLevel };
  }

  public toJSON() {
    return { ...this.props };
  }
}
