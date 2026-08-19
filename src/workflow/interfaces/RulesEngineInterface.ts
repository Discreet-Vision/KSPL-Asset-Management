// ==================== RULES ENGINE INTERFACE ====================
// Declarative Rules Engine interface evaluating configurable business logic without code modification.

import { BusinessRule } from '../types/workflowTypes';

export interface RulesEngineInterface {
  registerRule(rule: BusinessRule): Promise<void>;
  evaluateRules(entityData: Record<string, any>, tenantId: string): Promise<BusinessRule[]>;
}
