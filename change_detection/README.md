# Change Detection & Configuration Drift Engine

This isolated, strictly additive module compares real-time discovered CI attributes against historical discovery states and approved baselines to detect unauthorized changes and configuration drift.

---

## 1. Subsystem Architecture

```text
Latest Discovered Attributes
            ↓
Read Previous Known State / Baseline Configuration
            ↓
Field-Level Difference Normalization & Comparison
            ↓
Change Classification (Hardware, Software, OS, Network, Security, Config)
            ↓
ITSM Change Ticket Correlation (e.g. CHG-00892)
            ↓
Authorization Status (Authorized, Unauthorized, Expected, Under Review)
            ↓
Drift Severity & Risk Score Calculation (0 - 100)
            ↓
Remediation Recommendations & Review Workflow
```

---

## 2. Key Features

1. **Before vs. After Field-Level Comparison**:
   - Detects modifications across OS version, RAM memory, installed software versions, network/DNS settings, and security agent statuses.

2. **Baseline Management & Versioning**:
   - Defines approved baseline snapshots per CI class with version tracking (`v1.2 Prod Server Approved`).

3. **Authorization & Risk Assessment**:
   - Correlates with approved ITSM change tickets (`CHG-00892`) to mark changes as Authorized or flag Unauthorized Security Drift.

4. **Strict Color Palette**:
   - Styled exclusively using **RED, BLACK, WHITE** UI design.
