# Enterprise Feature Delivery & Blue-Green Release Management

This directory and associated components provide an isolated, enterprise-grade Feature Delivery system with support for:
- **Feature Flags**: Provider abstraction (LaunchDarkly or Unleash) with fail-safe local fallback.
- **Sticky Targeting**: Deterministic hashing ensures users/tenants stay on their assigned variant.
- **Blue-Green Deployment**: Kubernetes ingress traffic splitting (90/10 canary or instant 100% switch) with zero downtime and instant emergency rollback.
- **Audit Logging & Safety**: All flag toggles and traffic shifts are tracked in release audit logs.

---

## 1. Feature Flag Evaluation & Fail-Safe Strategy

1. **Unknown Flag Key**: Evaluates to `false` (safe default).
2. **Provider Disruption**: Automatically falls back to in-memory/cached configuration without throwing exceptions or blocking requests.
3. **Tenant & Role Targeting**: Flags evaluate against `tenantId` and `userRole` without modifying application authorization layers.

---

## 2. Blue-Green Deployment Commands

### Switch 100% Traffic to Green Release:

```bash
kubectl apply -f blue_green/ingress-bluegreen.yaml
```

### Emergency Instant Rollback to Blue:

```bash
kubectl patch ingress itam-bluegreen-ingress -n itam-production --type merge -p '{"spec":{"rules":[{"host":"app.enterprise-itam.com","http":{"paths":[{"path":"/","pathType":"Prefix","backend":{"service":{"name":"itam-frontend-blue","port":{"number":3000}}}}]}}]}}'
```

---

## 3. UI Dashboard Theme Compliance

The Release Management Dashboard (`/src/feature_delivery/FeatureDeliveryDashboardModule.tsx`) strictly complies with the **RED, BLACK, WHITE** visual theme mandate.
