// ==================== NESTJS ROOT APP MODULE ====================
// Root NestJS Application Module registering all 13 independent DDD Bounded Context Modules.

import { AssetsModule } from './modules/assets/assets.module';
import { CmdbModule } from './modules/cmdb/cmdb.module';
import { DiscoveryModule } from './modules/discovery/discovery.module';
import { SamModule } from './modules/sam/sam.module';
import { ComplianceModule } from './modules/compliance/compliance.module';
import { FinancialModule } from './modules/financial/financial.module';
import { ContractsModule } from './modules/contracts/contracts.module';
import { WorkflowModule } from './modules/workflow/workflow.module';
import { ItsmModule } from './modules/itsm/itsm.module';
import { GraphModule } from './modules/graph/graph.module';
import { SearchModule } from './modules/search/search.module';
import { TelemetryModule } from './modules/telemetry/telemetry.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';

import { InMemoryEventBusAdapter } from './shared/infrastructure/InMemoryEventBusAdapter';
import { HealthService } from './shared/infrastructure/HealthService';

export class AppModule {
  public static readonly eventBus = new InMemoryEventBusAdapter();
  public static readonly healthService = new HealthService();

  // Bounded Context Registry
  public static readonly assets = AssetsModule;
  public static readonly cmdb = CmdbModule;
  public static readonly discovery = DiscoveryModule;
  public static readonly sam = SamModule;
  public static readonly compliance = ComplianceModule;
  public static readonly financial = FinancialModule;
  public static readonly contracts = ContractsModule;
  public static readonly workflow = WorkflowModule;
  public static readonly itsm = ItsmModule;
  public static readonly graph = GraphModule;
  public static readonly search = SearchModule;
  public static readonly telemetry = TelemetryModule;
  public static readonly analytics = AnalyticsModule;

  public static getDependencyGraph() {
    return [
      { name: 'AssetsModule', domain: 'assets', exports: ['AssetRepositoryPort', 'CreateAssetUseCase'], status: 'BOUNDED' },
      { name: 'CmdbModule', domain: 'cmdb', exports: ['CmdbRepositoryPort', 'ReconcileCiUseCase'], status: 'BOUNDED' },
      { name: 'DiscoveryModule', domain: 'discovery', exports: ['DiscoveryScanRepository', 'TriggerScanUseCase'], status: 'BOUNDED' },
      { name: 'SamModule', domain: 'sam', exports: ['SamLicenseRepository', 'CalculatePositionUseCase'], status: 'BOUNDED' },
      { name: 'ComplianceModule', domain: 'compliance', exports: ['ComplianceRepository', 'EvaluatePolicyUseCase'], status: 'BOUNDED' },
      { name: 'FinancialModule', domain: 'financial', exports: ['FinancialRepository', 'CalculateTcoUseCase'], status: 'BOUNDED' },
      { name: 'ContractsModule', domain: 'contracts', exports: ['ContractRepository', 'CheckExpirationUseCase'], status: 'BOUNDED' },
      { name: 'WorkflowModule', domain: 'workflow', exports: ['WorkflowRepository', 'TriggerWorkflowUseCase'], status: 'BOUNDED' },
      { name: 'ItsmModule', domain: 'itsm', exports: ['ItsmRepository', 'SyncTicketUseCase'], status: 'BOUNDED' },
      { name: 'GraphModule', domain: 'graph', exports: ['GraphTopologyService'], status: 'BOUNDED' },
      { name: 'SearchModule', domain: 'search', exports: ['CrossDomainSearchService'], status: 'BOUNDED' },
      { name: 'TelemetryModule', domain: 'telemetry', exports: ['TelemetryIngestService'], status: 'BOUNDED' },
      { name: 'AnalyticsModule', domain: 'analytics', exports: ['ExecutiveAnalyticsService'], status: 'BOUNDED' },
    ];
  }
}
