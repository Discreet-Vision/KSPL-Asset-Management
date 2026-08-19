# Enterprise ITAM / CMDB Data Model Engine

This isolated, strictly additive module provides a normalized, high-performance Enterprise CMDB Data Model architecture with full support for:

1. **Hierarchical CI Classes & Dynamic Schemas**:
   - `ci_classes` hierarchy supporting Hardware, Server, Laptop, Software, Cloud, Facilities, Fleet, OT, and IoT with dynamic JSONB attribute schemas.

2. **Configuration Items (`configuration_items`)**:
   - Full confidence scores, discovery tracking, dynamic JSONB properties, and multi-tenant isolation.

3. **Directional Graph Relationships (`ci_relationships`)**:
   - Relationship engine supporting graph traversal for `runs_on`, `depends_on`, `hosted_by`, `connects_to`, `used_by`, `contains`, `located_in`, `managed_by`, and `assigned_to`.

4. **Software Normalization & Effective License Position (ELP)**:
   - `normalization_catalog` mapping raw string patterns to `canonical_products`.
   - `software_licenses` & `license_consumption` driving real-time ELP ledger calculations (`ELP = Entitled Quantity - Consumed Quantity`).

5. **Financial Management & Depreciation**:
   - `contracts`, `purchase_orders`, `cost_centers`, and `depreciation_schedules` supporting straight-line and declining-balance book value depreciation.

6. **Governance, Policy Violations & Immutable Audit**:
   - Policy violation tracking (`policy_violations`), CVE vulnerability matching (`vulnerabilities`), and tamper-proof change history (`audit_logs`).

7. **Strict UI Palette**:
   - Styled exclusively in **RED, BLACK, WHITE**.
