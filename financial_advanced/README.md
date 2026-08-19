# Financial & Contract Management Engine

This isolated, strictly additive Financial module provides Contract Repository & Renewal Lifecycle Management, TCO & Straight-Line/Declining-Balance Depreciation calculation, Internal Chargeback/Showback Ledgering, and Multi-Cloud FinOps Visibility & Anomaly Detection.

---

## 1. Subsystem Architecture

```text
Contract Repository (MSA, PO, SOW, License, Support, Cloud Agreements)
            ↓
Renewal Deadline Alert System (90 / 60 / 30 / 15-day Notice Windows)
            ↓
TCO & Depreciation Engine (Straight-Line & Declining Balance Calculation)
            ↓
Cost Allocation & Internal Chargeback / Showback Ledger
            ↓
Multi-Cloud FinOps Ingestion & Anomaly Detection (AWS, Azure, GCP)
```

---

## 2. Key Features

1. **Contract Repository & Lifecycle**:
   - Manages MSA, SOW, License, Support, Maintenance, and Cloud agreements with configurable status transitions and renewal alerts.

2. **Total Cost of Ownership (TCO)**:
   - Aggregates purchase cost, installation, maintenance, repair, support, licensing, and residual values across assets and services.

3. **Depreciation Engine**:
   - Computes annual depreciation rates, accumulated depreciation, and current book value floor using straight-line and declining-balance formulas.

4. **Chargeback / Showback**:
   - Maps IT spend to cost centers and departments, distinguishing between binding chargeback billing and informational showback visibility.

5. **Cloud FinOps & Anomaly Detection**:
   - Normalizes AWS, Azure, and GCP spend with detection for unusual daily spend spikes and unallocated cloud resources.

6. **Strict Color Palette**:
   - Styled strictly in **RED, BLACK, WHITE**.
