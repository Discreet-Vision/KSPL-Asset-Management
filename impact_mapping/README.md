# Impact / Dependency Mapping & Blast-Radius Engine

This isolated, strictly additive module provides CI dependency analysis, blast-radius risk calculations, and change risk simulation without altering underlying CMDB data or existing business logic.

---

## 1. Engine Flow

```text
Selected CI (or multi-CI change set)
          ↓
Read-Only Relationship Adapter (Consuming CMDB & Reconciliation Relationship Data)
          ↓
Upstream / Downstream Traversal (Configurable Depths: 1, 2, 3, 5, Unlimited)
          ↓
Blast-Radius Calculation (Direct Impact vs. Indirect Impact Counts)
          ↓
Single Point of Failure (SPOF) Detection & Critical Path Identification
          ↓
Risk Scoring (0 - 100) & Risk Categorization (Low, Medium, High, Critical)
          ↓
Interactive Dependency Graph Projection & Explanation Breakdowns
          ↓
Impact Snapshots & Report Export
```

---

## 2. Key Capabilities

1. **Typed Dependency Relationship Support**:
   - Traverses relationships: `runs on`, `depends on`, `hosted by`, `connects to`, `used by`, `provides service to`, `supports`.

2. **Downstream / Upstream Analysis**:
   - **Upstream**: "What does this CI depend on?"
   - **Downstream**: "What components fail if this CI becomes unavailable?"

3. **Blast-Radius & Risk Score (0–100)**:
   - Evaluates direct vs indirect dependencies, affected applications, business services, and single points of failure.

4. **Change Risk Simulator**:
   - Simulates proposed patching, hardware swapping, or decommissioning changes before execution.

5. **Strict Visual Theme**:
   - Styled exclusively using **RED, BLACK, WHITE** UI palette.
