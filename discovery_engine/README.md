# Multi-Method ITAM Discovery Engine

This isolated, additive discovery subsystem provides five enterprise ingestion vectors feeding a unified CMDB reconciliation candidate model.

---

## 1. Five Ingestion Discovery Methods

1. **Agentless Network Discovery**:
   - SNMP (v1, v2c, v3)
   - WMI Credentialed Windows Scan
   - SSH Credentialed Linux Scan
   - Subnet CIDR Sweep (Rate Limited & Scope Restricted)

2. **Lightweight Endpoint Agent**:
   - Cross-platform Go Agent design specs
   - Deep OS & Hardware Profile
   - Software Registry Audit
   - Missing Security Patch Inventory
   - Heartbeats & Signed Auto-Update

3. **Cloud API Connectors**:
   - AWS EC2, S3, RDS, VPC
   - Azure VMs, Managed Disks, VNet, Blob
   - GCP Compute Engine, Persistent Disks, Cloud SQL, GKE
   - Read-Only API execution

4. **SaaS / OAuth & CASB Shadow IT**:
   - Microsoft 365, Google Workspace, GitHub
   - License Usage vs Active Users
   - CASB Security Log Ingestion for unapproved SaaS detection

5. **Manual Entry & Bulk Import**:
   - Manual Web Console Form
   - Bulk CSV / JSON Ingestion Engine

---

## 2. Common Normalized Discovery Result Model

Every discovery vector outputs a standardized candidate record:

```typescript
export interface UnifiedDiscoveryResult {
  id: string;
  sourceMethod: DiscoveryMethod;
  tenantId: string;
  confidenceScore: number;
  rawIdentifier: string;
  hostname: string;
  ipAddress?: string;
  macAddress?: string;
  serialNumber?: string;
  candidateClass: 'Hardware' | 'Software' | 'Cloud' | 'Service';
  candidateType: string;
  status: 'Pending Reconciliation' | 'Reconciled' | 'Duplicate Candidate' | 'Rejected';
}
```

---

## 3. UI Theme Compliance

The UI component `/src/discovery_engine/DiscoveryEngineDashboardModule.tsx` strictly complies with the **RED, BLACK, WHITE** visual theme mandate.
