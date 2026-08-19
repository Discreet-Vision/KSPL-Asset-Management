# Workflow, ITSM & Governance / Security Engine

This isolated, strictly additive module provides Low-Code Approval Workflows, Bi-Directional ITSM Linking, Self-Service Request Catalog, Field-Level RBAC, Append-Only Immutable Audit Trail, Policy & Risk Engine, and CVE Vulnerability Correlation.

---

## 1. Subsystem Architecture

```text
Visual Approval Workflows (Start → Conditions → Manager/SecOps Approvals → Actions → End)
            ↓
Bi-Directional ITSM Integration (Incidents, Changes, Problems → CMDB CI Context)
            ↓
Self-Service Catalog & Request Lifecycle (Hardware, Software, Cloud Requests)
            ↓
Field-Level RBAC & Data Classification (Public, Internal, Confidential, Restricted)
            ↓
Append-Only Immutable Audit Log
            ↓
Policy & Risk Engine + Software CVE Correlation Engine
```

---

## 2. Key Features

1. **Low-Code Approval Workflows**:
   - Visual nodes (START, APPROVAL, CONDITION, ACTION, NOTIFICATION) with versioning and execution tracking.

2. **Bi-Directional ITSM Link**:
   - Contextual mapping between ITSM records (P1 Incidents, Changes) and underlying CIs.

3. **Self-Service Request Catalog**:
   - Request forms with SLA calculations and approval triggers.

4. **Field-Level RBAC & Data Classification**:
   - Configurable field rules (`Asset.purchase_cost`, `Contract.vendor_security_credentials`) across PUBLIC, INTERNAL, CONFIDENTIAL, and RESTRICTED levels.

5. **Immutable Audit Trail**:
   - Append-only change logging recording user, action, entity, before/after state, and IP context.

6. **Policy & Risk Engine + CVE Correlation**:
   - Automated policy evaluation and CVSS vulnerability correlation for normalized software.

7. **Strict Color Palette**:
   - Styled exclusively in **RED, BLACK, WHITE**.
