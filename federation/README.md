# CMDB Federation & Read-Through External System of Record Layer

This isolated, strictly additive module enables the ITAM/CMDB system to reference authoritative information from external Systems of Record (HRIS, ERP, Procurement, Entra ID) without duplicating or copying authoritative records into local CMDB storage.

---

## 1. Subsystem Architecture

```text
ITAM CI Record Reference (e.g., EMP-1024 / CC-1005 / PO-9902)
            ↓
Read-Through Federation Layer & Connector Interface
            ↓
External System of Record (Workday, SAP, Coupa, Entra ID)
            ↓
Authoritative Attribute Resolution
            ↓
Field-Level Provenance Tagging ([FEDERATED • HR], [LOCAL • ITAM])
            ↓
Display in UI with Live / Cached Freshness & Audit Provenance
```

---

## 2. Key Features

1. **Read-Through Reference Model**:
   - Stores references (`EMP-1024`, `CC-1005`, `PO-99021`) rather than copying complete records into CMDB local tables.

2. **Authoritative Systems of Record**:
   - HR / HRIS owns Employee, Designation, Department, Manager.
   - ERP / SAP owns Cost Center, Budget Owner, Financial Allocation.
   - Procurement owns Purchase Orders, Vendors, Contracts.

3. **Field-Level Provenance**:
   - Explicit tags distinguishing `[FEDERATED • HR]`, `[FEDERATED • ERP]`, and `[LOCAL • ITAM]`.

4. **Source Conflict Resolution**:
   - Compares local CMDB values against external authoritative data and enables review without destructive overwrites.

5. **Strict Color Palette**:
   - Styled exclusively using **RED, BLACK, WHITE** UI design.
