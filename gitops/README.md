# Enterprise ITAM CI/CD & GitOps Documentation

This directory and associated GitHub Actions / Argo CD manifests define the production-grade GitOps delivery infrastructure for the Enterprise ITAM SaaS platform.

---

## 1. CI/CD Architecture

```
Developer
   ↓
Git Repository (Push / PR)
   ↓
GitHub Actions / GitLab CI
   ├── Code Validation & Lint
   ├── Unit & Integration Testing
   ├── Security Vulnerability Scans
   ├── Multi-Stage Docker Container Builds
   └── Container Image Push (GHCR / ECR)
   ↓
GitOps Manifest Repository (`gitops/environments/*`)
   ↓
Argo CD Controller
   ↓
Kubernetes Cluster (EKS / AKS / GKE / On-Prem)
   ↓
Argo Rollouts (Progressive Canary Release 10% → 25% → 50% → 100%)
```

---

## 2. Directory Structure

```
.github/
└── workflows/
    ├── ci.yml                 # Main CI pipeline (Validation, Test, Container Build, Image Scan)
    └── argocd-sync.yml         # Argo CD sync trigger and health verification

.gitlab-ci.yml                 # GitLab CI configuration alternative

gitops/
├── environments/
│   ├── dev/values.yaml        # Development environment overrides
│   ├── staging/values.yaml    # Staging environment overrides
│   └── production/values.yaml # Production environment overrides
└── README.md                  # This documentation

argocd/
├── applications/
│   ├── itam-dev.yaml          # Argo CD Dev Application CRD
│   ├── itam-staging.yaml      # Argo CD Staging Application CRD
│   └── itam-production.yaml   # Argo CD Production Application CRD
└── rollouts/
    └── canary-rollout.yaml    # Progressive Canary Rollout definition
```

---

## 3. Argo CD Application Setup

To deploy the Argo CD Applications to your Kubernetes cluster:

```bash
kubectl apply -f argocd/applications/itam-dev.yaml
kubectl apply -f argocd/applications/itam-staging.yaml
kubectl apply -f argocd/applications/itam-production.yaml
```

---

## 4. Progressive Delivery & Rollback

In Production, Argo Rollouts performs a phased rollout:
1. **10% Traffic**: Initial canary verification (10 minutes pause).
2. **25% Traffic**: Medium traffic analysis (30 minutes pause).
3. **50% Traffic**: High load evaluation (1 hour pause).
4. **100% Traffic**: Full promotion if error rates remain below 0.1%.

### Manual Instant Rollback via Argo CD:

```bash
argocd app rollback itam-production <PREVIOUS_REVISION>
```
