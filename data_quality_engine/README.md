# CMDB Data Quality Scoring & Health Engine

This isolated, strictly additive subsystem calculates CMDB Health and CI Data Quality Scores without altering underlying CI attributes or business logic.

---

## 1. Quality Scoring Evaluation Architecture

```text
Existing CI Attribute Payload
          ↓
Class Quality Rule Mapping (Required Fields, Field Weightings)
          ↓
Completeness Score Calculation (Ignoring NULL / Empty / "N/A" / "Unknown")
          ↓
Data Format Validity Check (IPv4/v6, MAC Address, Email, Non-placeholder Serial Number)
          ↓
Data Consistency Evaluation (Manufacturer / Model Conflicts)
          ↓
Discovery Verification Freshness & Source Confidence (Agent > WMI/SSH > Manual/Import)
          ↓
Conflict Penalty & Stale Data Deductions
          ↓
Final 0–100 Normalized Quality Score & Status (Excellent, Good, Needs Improvement, Poor, Critical)
          ↓
Detailed Dimensional Breakdown & Recommended Remediation Actions
```

---

## 2. Core Features

1. **Normalized 0–100 Score**:
   - `90–100`: Excellent
   - `75–89`: Good
   - `50–74`: Needs Improvement
   - `25–49`: Poor
   - `0–24`: Critical

2. **Attribute Weighting & Required Field Rules**:
   - Class-specific required field definitions (Server, Laptop, Cloud VM, Network Device).
   - Configurable field weighting (e.g., Serial Number 25%, Hostname 20%, IP 20%, OS 20%, MAC 15%).

3. **Placeholder & Meaningless Value Elimination**:
   - Does not credit `NULL`, `N/A`, `Unknown`, `Not Available`, `-`, or `00000000`.

4. **Data Format Validity**:
   - Validates IP addresses, MAC addresses, email formats, and serial number validity.

5. **Freshness Policies**:
   - `0–1 day`: 100%
   - `2–7 days`: 90%
   - `8–30 days`: 75%
   - `31–90 days`: 50%
   - `91+ days`: 25% / Stale Status

6. **Quality Dashboard & Detail Panel**:
   - Executive metrics, historical quality trend tracking, alert generation, and remediation suggestions.

7. **Strict Color Restriction Compliance**:
   - Built exclusively in **RED, BLACK, WHITE** UI elements.
