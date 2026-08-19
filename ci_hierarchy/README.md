# Enterprise Typed CI Class Hierarchy Subsystem

This additive subsystem provides a typed, extensible **Configuration Item (CI) Class Hierarchy** model for Enterprise CMDB and ITAM operations.

---

## 1. Class Hierarchy Architecture

```text
Configuration Item (Base CI)
│
├── Hardware
│   ├── Server (Hostname, CPU, RAM, Storage, OS, Serial Number, Rack, Datacenter)
│   ├── Laptop (Assigned User, Dept, Hostname, Serial Number, OS)
│   └── Network Device (Device Type, Management IP, Firmware, Ports, Network Zone)
│
├── Software
│   ├── Application (Publisher, Version, Install Count, Edition)
│   ├── License (License Type, Entitlements, Consumed Allocations, Compliance)
│   └── SaaS (Subscription Plan, Provider, Paid Seats, Active Users, Renewal Date)
│
├── Cloud
│   ├── Virtual Machine (Instance ID, Provider, vCPU, RAM, VPC IP, Account ID)
│   ├── Container (Workload ID, Image, Cluster, Namespace, CPU/Memory Limits)
│   └── Storage (Bucket/Storage ID, Provider, Storage Tier, Capacity, Encryption)
│
└── Service
    └── Logical Service (Business Owner, Tech Owner, Criticality Tier, SLA)
```

---

## 2. Dynamic Attribute Validation Rules

1. **Class-Specific Isolation**: Laptop CIs only load Laptop attributes; Network Devices only validate IP and Firmware specs; SaaS subscriptions evaluate renewal dates and licensed seats.
2. **Base CI Model**: All CIs inherit standard properties (`id`, `name`, `ciClass`, `ciType`, `status`, `owner`, `environment`, `tenantId`, `discoverySource`).
3. **Validation Engine**: Prevents invalid values or missing mandatory attributes before saving to the CMDB.

---

## 3. Visual UI Theme Compliance

The CI Class Hierarchy Module (`/src/ci_hierarchy/CiHierarchyModule.tsx`) strictly follows the mandated **RED, BLACK, WHITE** visual theme.
