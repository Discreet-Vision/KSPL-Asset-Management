# Software Asset Management (SAM) Advanced Engine

This isolated, strictly additive SAM module provides Effective License Position (ELP) calculations, publisher compliance packs (Microsoft, Oracle, SAP, Adobe, IBM), canonical software normalization, SaaS / Shadow-IT discovery, and publisher audit simulation readiness reports.

---

## 1. Subsystem Architecture

```text
Discovery & Inventory Adapters
            ↓
Canonical Software Normalization (Confidence Scoring & Queue)
            ↓
Software Entitlement Model (Owned Quantity, Metrics, POs, Contracts)
            ↓
Effective License Position (ELP) Reconciliation Ledger (Owned vs Consumed)
            ↓
Publisher-Specific Compliance Packs (Microsoft v2.1, Oracle v1.4, SAP v3.0, Adobe v1.1, IBM v2.0)
            ↓
SaaS / Shadow-IT Risk Discovery (SSO, CASB, Expense, OAuth)
            ↓
Publisher Audit Simulation Engine & Exportable Defense Packet
```

---

## 2. Key Features

1. **Effective License Position (ELP)**:
   - Evaluates owned entitlements against effective consumption per publisher, product, and metric (Per User, Per Core, Per Device, Per Socket).
   - Generates compliance states (`Compliant`, `Under-Licensed`, `Over-Licensed`).

2. **Publisher Compliance Packs**:
   - Isolated rules for Microsoft (M365 Dual-Use, SQL Core), Oracle (Processor Core Factors, NUP), SAP (S/4HANA User Types), Adobe (VIP Named User), and IBM (PVU Sub-Capacity).

3. **SaaS & Shadow-IT Discovery**:
   - Classifies unapproved SaaS applications with risk scoring (`Low`, `Medium`, `High`, `Critical`) and administrative approval controls.

4. **Publisher Audit Simulation**:
   - Calculates audit readiness score (0-100), financial exposure estimate, and generates exportable Defense Packets.

5. **Strict Color Palette**:
   - Styled exclusively using **RED, BLACK, WHITE** UI design.
