import { FeatureFlag, FlagProvider } from './types';

export class FeatureFlagClient {
  private provider: FlagProvider;
  private flags: Map<string, FeatureFlag> = new Map();
  private redisCacheEnabled: boolean = false;

  constructor(provider: FlagProvider = 'LaunchDarkly') {
    this.provider = provider;
    this.initializeDefaultFlags();
  }

  private initializeDefaultFlags() {
    const defaultFlags: FeatureFlag[] = [
      {
        key: 'new_cmdb_dashboard',
        name: 'New Interactive CMDB Graph Dashboard',
        description: 'Advanced canvas-based dependency visualization for Enterprise CMDB assets',
        enabled: true,
        type: 'TenantTargeted',
        environment: 'production',
        defaultValue: false,
        rules: [
          { id: 'rule-1', type: 'tenant', attribute: 'tenantId', values: ['tenant-kspl-global', 'tenant-acme-corp'] }
        ],
        enabledTenants: ['tenant-kspl-global', 'tenant-acme-corp'],
        enabledRoles: ['Admin', 'ITAM Manager'],
        rolloutPercentage: 100,
        updatedAt: new Date().toISOString(),
        updatedBy: 'DevOps Release Manager'
      },
      {
        key: 'new_discovery_engine',
        name: 'Agentless SNMPv3 & WMI High-Speed Scanner',
        description: 'Parallelized multi-threaded agentless subnet discovery engine',
        enabled: true,
        type: 'Percentage',
        environment: 'production',
        defaultValue: false,
        rules: [
          { id: 'rule-2', type: 'percentage', attribute: 'tenantId', values: [], rolloutPercentage: 25 }
        ],
        enabledTenants: ['tenant-kspl-global'],
        enabledRoles: ['Admin', 'IT Operator'],
        rolloutPercentage: 25,
        updatedAt: new Date().toISOString(),
        updatedBy: 'SecOps Team'
      },
      {
        key: 'new_ai_copilot',
        name: 'Claude 3.5 Sonnet Intelligent Asset Assistant',
        description: 'Natural language query and compliance auditing AI Copilot',
        enabled: false,
        type: 'Boolean',
        environment: 'production',
        defaultValue: false,
        rules: [],
        enabledTenants: [],
        enabledRoles: ['Admin'],
        rolloutPercentage: 0,
        updatedAt: new Date().toISOString(),
        updatedBy: 'Product Lead'
      }
    ];

    defaultFlags.forEach(flag => this.flags.set(flag.key, flag));
  }

  public setProvider(provider: FlagProvider) {
    this.provider = provider;
  }

  public getProvider(): FlagProvider {
    return this.provider;
  }

  /**
   * Fail-Safe Feature Flag Evaluation
   */
  public evaluate(
    flagKey: string,
    context: { tenantId?: string; userRole?: string; userId?: string; environment?: string }
  ): boolean {
    try {
      const flag = this.flags.get(flagKey);

      // Rule 1: Unknown flag -> Safe default (false)
      if (!flag) {
        return false;
      }

      // Rule 2: Flag disabled globally -> Return false
      if (!flag.enabled) {
        return flag.defaultValue;
      }

      // Rule 3: Environment matching
      if (context.environment && flag.environment !== context.environment && context.environment !== 'production') {
        return flag.defaultValue;
      }

      // Rule 4: Tenant-based targeting
      if (context.tenantId && flag.enabledTenants.length > 0) {
        if (!flag.enabledTenants.includes(context.tenantId)) {
          return false;
        }
      }

      // Rule 5: Role-based targeting
      if (context.userRole && flag.enabledRoles.length > 0) {
        if (!flag.enabledRoles.includes(context.userRole)) {
          return false;
        }
      }

      // Rule 6: Sticky percentage-based rollout
      if (flag.type === 'Percentage' && context.tenantId) {
        const hash = this.deterministicHash(context.tenantId + ':' + flagKey);
        const tenantBucket = hash % 100;
        return tenantBucket < flag.rolloutPercentage;
      }

      return true;
    } catch (err) {
      // Fail-Safe Fallback on provider/evaluation error
      console.warn(`Feature flag evaluation failed for key '${flagKey}'. Falling back to safe default.`, err);
      return false;
    }
  }

  /**
   * Deterministic Murmur-like string hash for sticky targeting
   */
  private deterministicHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  public getAllFlags(): FeatureFlag[] {
    return Array.from(this.flags.values());
  }

  public updateFlag(flagKey: string, updates: Partial<FeatureFlag>): FeatureFlag | null {
    const existing = this.flags.get(flagKey);
    if (!existing) return null;

    const updated: FeatureFlag = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.flags.set(flagKey, updated);
    return updated;
  }
}

export const featureFlagClient = new FeatureFlagClient('LaunchDarkly');
