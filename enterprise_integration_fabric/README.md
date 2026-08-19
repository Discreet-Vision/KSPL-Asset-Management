# Enterprise Integration Fabric Subsystem

This isolated, strictly additive module provides a hybrid multi-cloud Enterprise Integration Fabric that connects the ITAM SaaS platform to 13 external system categories without becoming a duplicate system of record:

1. **Integration Fabric Core**:
   - Connector management, protocol drivers (REST API, Webhooks, Scheduled Sync, ETL, Event Streaming).
   - Enterprise Authentication handlers (OAuth 2.0, OIDC, SAML, API keys, Service Accounts, Vendor Auth).
   - Rate limiting, exponential backoff, retry handling, sync history, and immutable audit logging.

2. **Supported System Categories & Providers**:
   - **HRIS**: Workday, SAP SuccessFactors (Employee lifecycle sync, onboarding access, offboarding return tracking).
   - **ERP / Finance**: SAP S/4HANA, Oracle NetSuite (POs, Invoices, Cost Centers, GL Codes).
   - **External ITSM**: ServiceNow, Jira Service Management, BMC Helix (Bi-directional Incident, Change, Problem, Request ↔ CI mapping).
   - **Cloud Providers**: AWS (Cost Explorer), Azure (Cost Management), GCP Billing (VM, Storage, DB, Container, Serverless discovery & ARN/ID reconciliation).
   - **Cloud Cost Synchronization**: Daily/monthly service cost allocation to Cloud CIs & Cost Centers without overwriting history.
   - **MDM / UEM**: Microsoft Intune, Jamf, VMware Workspace ONE (Device identity, OS, compliance, encryption, serial reconciliation).
   - **SSO / IdP**: Okta, Microsoft Entra ID / Azure AD, Ping Identity (Authentication federation & identity mapping).
   - **SaaS Usage Discovery**: SSO/IdP login signals for Shadow IT detection & license optimization.
   - **CASB / Security**: Vulnerability findings & risk score mapping.
   - **Procurement Platforms**: Coupa, SAP Ariba (Requisitions & PO approvals).
   - **BI / Data Warehouse**: Snowflake, BigQuery (ETL exports & event streaming).
   - **SIEM**: Splunk HEC, Microsoft Sentinel (Real-time audit streaming without token exposure).

3. **Standardized Event Model & Outbound Webhooks**:
   - Tenant-aware event model (`asset.*`, `ci.*`, `employee.*`, `license.*`, `contract.*`, `policy.violation.*`, `vulnerability.*`).
   - Outbound webhooks with HMAC-SHA256 signature validation and exponential backoff retry policies.

4. **Field-Level Source Precedence**:
   - Configurable precedence matrix (e.g., `OS Version`: MDM > Cloud > HRIS; `Employee Dept`: HRIS > IdP > ERP).

5. **Strict UI Palette**:
   - Styled exclusively in **RED, BLACK, WHITE**.
