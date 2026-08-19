// ==================== DECLARATIVE RULES ENGINE ADAPTER ====================
// Isolated expression evaluator supporting deterministic rule priority and tenant isolation.

import { RulesEngineInterface } from '../interfaces/RulesEngineInterface';
import { BusinessRule } from '../types/workflowTypes';

export class DeclarativeRulesEngineAdapter implements RulesEngineInterface {
  private static rulesStore: Map<string, BusinessRule[]> = new Map();

  constructor() {
    this.seedDefaultRules();
  }

  private seedDefaultRules() {
    if (DeclarativeRulesEngineAdapter.rulesStore.size > 0) return;

    const defaultRules: BusinessRule[] = [
      {
        ruleId: 'RULE-FIN-101',
        ruleName: 'High Value Asset Retirement Finance Approval',
        priority: 10,
        tenantId: 'tenant-kspl-global',
        conditionField: 'purchaseCost',
        operator: 'GREATER_THAN',
        value: 2000,
        actionRequired: 'REQUIRE_FINANCE_APPROVAL',
        isActive: true,
      },
      {
        ruleId: 'RULE-SEC-202',
        ruleName: 'Critical Database CI Data Wipe Security Verification',
        priority: 20,
        tenantId: 'tenant-kspl-global',
        conditionField: 'criticality',
        operator: 'EQUALS',
        value: 'CRITICAL',
        actionRequired: 'REQUIRE_SECURITY_APPROVAL',
        isActive: true,
      },
      {
        ruleId: 'RULE-COMP-303',
        ruleName: 'Non-Compliant SAM License Escalation',
        priority: 30,
        tenantId: 'tenant-kspl-global',
        conditionField: 'complianceStatus',
        operator: 'EQUALS',
        value: 'NON_COMPLIANT',
        actionRequired: 'FLAG_COMPLIANCE',
        isActive: true,
      },
    ];

    DeclarativeRulesEngineAdapter.rulesStore.set('tenant-kspl-global', defaultRules);
  }

  public async registerRule(rule: BusinessRule): Promise<void> {
    const list = DeclarativeRulesEngineAdapter.rulesStore.get(rule.tenantId) || [];
    list.push(rule);
    // Sort by priority descending
    list.sort((a, b) => b.priority - a.priority);
    DeclarativeRulesEngineAdapter.rulesStore.set(rule.tenantId, list);
  }

  public async evaluateRules(entityData: Record<string, any>, tenantId: string): Promise<BusinessRule[]> {
    const tenantRules = DeclarativeRulesEngineAdapter.rulesStore.get(tenantId) || [];
    const matchedRules: BusinessRule[] = [];

    for (const rule of tenantRules) {
      if (!rule.isActive) continue;

      const entityVal = entityData[rule.conditionField];
      let matches = false;

      if (rule.operator === 'GREATER_THAN' && typeof entityVal === 'number') {
        matches = entityVal > Number(rule.value);
      } else if (rule.operator === 'EQUALS') {
        matches = String(entityVal).toLowerCase() === String(rule.value).toLowerCase();
      } else if (rule.operator === 'CONTAINS') {
        matches = String(entityVal).toLowerCase().includes(String(rule.value).toLowerCase());
      } else if (rule.operator === 'LESS_THAN' && typeof entityVal === 'number') {
        matches = entityVal < Number(rule.value);
      }

      if (matches) {
        matchedRules.push(rule);
      }
    }

    return matchedRules;
  }
}
