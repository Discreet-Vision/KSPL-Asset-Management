// ==================== CONTRACTS MODULE ====================
// Contract Management Bounded Context managing vendor agreements, SLAs, and expiration alerts.

import { AggregateRoot } from '../../shared/domain/AggregateRoot';
import { ApiResponseEnvelope } from '../../common/types/enterpriseTypes';

export interface VendorContractProps {
  id: string;
  vendorName: string;
  contractTitle: string;
  annualValueUsd: number;
  startDate: string;
  expirationDate: string;
  slaCommitmentPercentage: number;
  tenantId: string;
}

export class VendorContractEntity extends AggregateRoot {
  private props: VendorContractProps;

  constructor(props: VendorContractProps) {
    super(props.id, props.tenantId);
    this.props = { ...props };
  }

  public daysUntilExpiration(): number {
    const exp = new Date(this.props.expirationDate).getTime();
    const now = new Date().getTime();
    return Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
  }

  public toJSON() {
    return { ...this.props, daysUntilExpiration: this.daysUntilExpiration() };
  }
}

export class InMemoryContractRepository {
  private static store: Map<string, VendorContractEntity> = new Map();

  constructor() {
    this.seedDefaults();
  }

  private seedDefaults() {
    if (InMemoryContractRepository.store.size > 0) return;
    const c1 = new VendorContractEntity({
      id: 'CTR-AWS-2024',
      vendorName: 'Amazon Web Services Inc.',
      contractTitle: 'Enterprise Discount Program (EDP) Agreement',
      annualValueUsd: 480000.00,
      startDate: '2024-01-01',
      expirationDate: '2027-12-31',
      slaCommitmentPercentage: 99.99,
      tenantId: 'tenant-kspl-global',
    });

    const c2 = new VendorContractEntity({
      id: 'CTR-DELL-2025',
      vendorName: 'Dell Financial Services',
      contractTitle: 'Global Laptop & Server Master Lease Agreement',
      annualValueUsd: 185000.00,
      startDate: '2025-06-01',
      expirationDate: '2026-09-30', // Expiring soon!
      slaCommitmentPercentage: 99.5,
      tenantId: 'tenant-kspl-global',
    });

    InMemoryContractRepository.store.set('tenant-kspl-global:CTR-AWS-2024', c1);
    InMemoryContractRepository.store.set('tenant-kspl-global:CTR-DELL-2025', c2);
  }

  public async findAll(tenantId: string): Promise<VendorContractEntity[]> {
    const list: VendorContractEntity[] = [];
    for (const [k, ctr] of InMemoryContractRepository.store.entries()) {
      if (k.startsWith(`${tenantId}:`)) list.push(ctr);
    }
    return list;
  }
}

export class ContractController {
  constructor(private readonly contractRepo: InMemoryContractRepository) {}

  public async getContracts(tenantId: string, correlationId: string): Promise<ApiResponseEnvelope> {
    const contracts = await this.contractRepo.findAll(tenantId);
    return {
      success: true,
      statusCode: 200,
      data: contracts.map((c) => c.toJSON()),
      meta: {
        requestId: `req-ctr-${Date.now()}`,
        correlationId,
        timestamp: new Date().toISOString(),
        domain: 'contracts',
        tenantId,
        executionTimeMs: 3,
      },
    };
  }
}

export class ContractsModule {
  public static repository = new InMemoryContractRepository();

  public static getController(): ContractController {
    return new ContractController(this.repository);
  }
}
