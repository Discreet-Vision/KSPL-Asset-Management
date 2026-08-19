# Enterprise Typed CI Relationship & Graph Engine

This additive subsystem provides a typed, directional **Graph Relationship Engine** for enterprise CMDB dependency tracking and blast-radius impact analysis.

---

## 1. Supported Directional Relationship Types

```text
Application ──runs on──> Server
Application ──depends on──> Database / SaaS
Container   ──hosted by──> Virtual Machine
Server      ──connects to──> Network Device / Firewall
Software    ──used by──> Service / User Group
```

---

## 2. Directional Integrity & Bidirectional Navigation

- Direction is strictly enforced (e.g. `App --depends on--> DB` is asymmetric).
- Single-hop queries support incoming and outgoing edge traversal.
- Multi-hop traversal evaluates recursive dependency trees with configurable maximum depth limits (1-10 hops).

---

## 3. Cascade Blast-Radius Analysis

When a root CI node experiences failure, the Blast-Radius Engine traverses incoming dependency links to calculate all downstream impacted software, microservices, and logical business offerings.

---

## 4. Visual UI Theme Compliance

The CI Relationship Dashboard (`/src/ci_relationships/CiRelationshipDashboardModule.tsx`) strictly complies with the **RED, BLACK, WHITE** visual theme mandate.
