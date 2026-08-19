# Software Normalization Catalog & Content Library

This isolated, additive subsystem provides an enterprise-grade reference software content library and string normalization engine.

---

## 1. Normalization Flow

```text
Raw Discovered Software String (e.g., "MSFT OFC 365 E3 (64-bit)")
          ↓
String Normalization & Parsing (Case, Punctuation, Edition & Architecture Extraction)
          ↓
Publisher Resolution (Alias Mapping: "MSFT" → "Microsoft")
          ↓
Product Candidate Matching (Variants, Identifier, Exact/Fuzzy Matching)
          ↓
Confidence Scoring (0 - 100) & Provenance Audit Trail Generation
          ↓
Canonical Software Product (Publisher: Microsoft, Product: Microsoft 365, Edition: E3)
          ↓
Existing Reconciliation Engine Integration
```

---

## 2. Core Capabilities

1. **Structured Canonical Model**:
   - Supports `Publisher`, `Product Name`, `Product Family`, `Edition`, `Major/Minor Version`, `Architecture`, `Software Type`, `Category`, `Lifecycle Status`, and `External Identifiers` (CPE, SWID Tag, Part Number).

2. **Raw Variant & Alias Mapping**:
   - Supports publisher aliases (`MS`, `MSFT`, `Microsoft Corp` → `Microsoft`).
   - Maps raw software variant names without duplicating canonical products.

3. **String Normalization Engine**:
   - Extracts architecture (`x64`, `x86`, `ARM`), edition (`E3`, `E5`, `Pro`, `Enterprise`), version numbers, and cleans brackets/punctuation while preserving the original raw discovery string for auditability.

4. **Confidence Scoring & Status**:
   - Scores matches (0-100) and assigns statuses: `Normalized`, `Possible Match`, `Needs Review`, `Unnormalized`, `Verified`.

5. **Manual Review Queue & Decision Learning**:
   - Allows administrators to review low-confidence or ambiguous matches. Approved mappings are learned and reused for future identical raw strings.

6. **Batch Processing Simulator**:
   - Supports asynchronous bulk normalization of discovery streams with batch report metrics.

7. **UI Theme Compliance**:
   - Strictly adheres to the **RED, BLACK, WHITE** visual theme mandate.
