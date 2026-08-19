// ==================== FINANCIAL MODULE ====================
// Financial Management Bounded Context calculating Total Cost of Ownership (TCO), chargebacks, and IT budget depreciation.

import { AggregateRoot } from '../../shared/domain/AggregateRoot';
import { ApiResponseEnvelope } from '../../common/types/enterpriseTypes';

export interface FinancialBudgetProps {
  id: string;
  departmentName: string;
  allocatedBudgetUsd: number;
  spentBudgetUsd: number;
  chargebackAccruedUsd: number;
  tenantId: string;
  fiscalYear: number;
}

export class FinancialBudgetEntity extends AggregateRoot {
  private props: FinancialBudgetProps;

  constructor(props: FinancialBudgetProps) {
    super(props.id, props.tenantId);
    this.props = { ...props };
  }

  public toJSON() {
    const remainingBudgetUsd = this.props.allocatedBudgetUsd - this.props.spentBudgetUsd;
    const utilizationPercentage = Math.round((this.props.spentBudgetUsd / this.props.allocatedBudgetUsd) * 100);
    return { ...this.props, remainingBudgetUsd, utilizationPercentage };
  }
}

export class InMemoryFinancialRepository {
  private static store: Map<string, FinancialBudgetEntity> = new Map();

  constructor() {
    this.seedDefaults();
  }

  private seedDefaults() {
    if (InMemoryFinancialRepository.store.size > 0) return;
    const b1 = new FinancialBudgetEntity({
      id: 'FIN-BGT-2026-ENG',
      departmentName: 'Cloud Engineering & DevOps',
      allocatedBudgetUsd: 1250000.00,
      spentBudgetUsd: 845000.00,
      chargebackAccruedUsd: 210000.00,
      tenantId: 'tenant-kspl-global',
      fiscalYear: 2026,
    });

    const b2 = new FinancialBudgetEntity({
      id: 'FIN-BGT-2026-IT',
      departmentName: 'Global Workplace Technology',
      allocatedBudgetUsd: 850000.00,
      spentBudgetUsd: 512000.00,
      chargebackAccruedUsd: 95000.00,
      tenantId: 'tenant-kspl-global',
      fiscalYear: 2026,
    });

    InMemoryFinancialRepository.store.set('tenant-kspl-global:FIN-BGT-2026-ENG', b1);
    InMemoryFinancialRepository.store.set('tenant-kspl-global:FIN-BGT-2026-IT', b2);
  }

  public async findAll(tenantId: string): Promise<FinancialBudgetEntity[]> {
    const list: FinancialBudgetEntity[] = [];
    for (const [k, bgt] of InMemoryFinancialRepository.store.entries()) {
      if (k.startsWith(`${tenantId}:`)) list.push(bgt);
    }
    return list;
  }
}

export class FinancialController {
  constructor(private readonly finRepo: InMemoryFinancialRepository) {}

  public async getBudgets(tenantId: string, correlationId: string): Promise<ApiResponseEnvelope> {
    const budgets = await this.finRepo.findAll(tenantId);
    return {
      success: true,
      statusCode: 200,
      data: budgets.map((b) => b.toJSON()),
      meta: {
        requestId: `req-fin-${Date.now()}`,
        correlationId,
        timestamp: new Date().toISOString(),
        domain: 'financial',
        tenantId,
        executionTimeMs: 2,
      },
    };
  }
}

export class FinancialModule {
  public static repository = new InMemoryFinancialRepository();

  public static getController(): FinancialController {
    return new FinancialController(this.repository);
  }
}
