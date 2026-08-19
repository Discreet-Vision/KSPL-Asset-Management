# Configurable Reconciliation Rules & CI Identification Engine

This isolated, additive subsystem provides an enterprise-grade reconciliation pipeline and attribute-level field precedence engine.

---

## 1. Reconciliation Pipeline Flow

```text
Discovery Candidate Stream
          ↓
CI Identification (Exact & Fuzzy Matching)
          ↓
Confidence Scoring (0 - 100)
          ↓
Configurable Field Precedence Rules
          ↓
Quality Filter (Empty/NULL Ignored)
          ↓
Conflict Detection & Field Provenance Tracking
          ↓
Canonical CI Records Database
```

---

## 2. Key Features

1. **Configurable Attribute Precedence**:
   - Priority defined per field (e.g. `osVersion`: `Agent` > `WMI` > `SSH` > `Agentless` > `Manual` > `Import`).
   - Quality protection: NULL/empty values do not overwrite valid existing data.

2. **Confidence Scoring & Decision Thresholds**:
   - `Auto-Merge Threshold` (Default: 85%): Automatically reconciles discovery record into existing Canonical CI.
   - `Review Threshold` (Default: 65%): Flags ambiguous candidates for human admin review.
   - `< Review Threshold`: Creates new Canonical CI.

3. **Conflict & Field Provenance Tracking**:
   - Stores winning value, winning source, confidence, timestamp, and conflicting historical values for every single field.

4. **Dry-Run Simulation**:
   - Test rule precedence changes against in-memory discovery data without affecting live CMDB records.

5. **UI Theme Compliance**:
   - The UI module `/src/reconciliation_engine/ReconciliationDashboardModule.tsx` strictly adheres to the **RED, BLACK, WHITE** visual theme mandate.
