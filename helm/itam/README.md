# Enterprise ITAM Helm Chart & Kubernetes Deployment Guide

This directory contains the production-grade Helm Chart (`itam`) for deploying the Enterprise ITAM & CMDB SaaS platform onto managed Kubernetes clusters including:
- **AWS EKS** (Elastic Kubernetes Service)
- **Microsoft AKS** (Azure Kubernetes Service)
- **Google GKE** (Google Kubernetes Engine)
- **Self-Managed / On-Premise Kubernetes**

---

## 1. Quick Start Installation

```bash
# Lint the Helm Chart
helm lint ./helm/itam

# Dry-run template generation for verification
helm template itam ./helm/itam -f ./helm/itam/values-dev.yaml

# Install in Development Namespace
helm install itam-dev ./helm/itam \
  --namespace itam-dev \
  --create-namespace \
  -f ./helm/itam/values-dev.yaml

# Upgrade in Production Namespace
helm upgrade --install itam-prod ./helm/itam \
  --namespace itam-production \
  --create-namespace \
  -f ./helm/itam/values-production.yaml
```

---

## 2. Cloud Provider Integrations

### AWS EKS Configuration
- **Ingress Controller**: AWS Load Balancer Controller (`alb`)
- **StorageClass**: `gp3` or `ebs-csi`
- **IAM Roles for Service Accounts (IRSA)**: Annotate `serviceAccount.annotations` with AWS IAM Role ARN for S3 access.

### Microsoft AKS Configuration
- **Ingress Controller**: Application Gateway Ingress Controller (AGIC)
- **StorageClass**: `managed-csi`
- **Managed Identity**: Link Azure Workload Identity to ServiceAccount.

### Google GKE Configuration
- **Ingress Controller**: GKE Ingress (`gce`)
- **Workload Identity**: Link Google Service Account to Kubernetes ServiceAccount.

---

## 3. High Availability & Rolling Zero-Downtime Updates

The Chart enforces:
- **RollingUpdate Strategy**: `maxSurge: 1`, `maxUnavailable: 0`
- **HorizontalPodAutoscaler**: Auto-scales frontend pods between 5 and 25 replicas based on 70% CPU target utilization.
- **Liveness & Readiness Probes**: Verified HTTP probes prevent traffic routing to starting or unhealthy pods.

---

## 4. Rollback Strategy

In the event of deployment issues:

```bash
# View release history
helm history itam-prod -n itam-production

# Roll back to previous revision
helm rollback itam-prod <REVISION_NUMBER> -n itam-production
```
