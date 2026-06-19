# Production Deployment Procedures & DevOps Runbook

**Document Reference:** `DOC_TECH_DEPLOYMENT_2026_05`  
**Target Platform:** Tureep AI+ Phase 2 Hybrid Release  
**Infrastructure Topology:** AWS ECS Swarm • Kubernetes Cluster • Traefik Ingress

---

## 🚀 Executive Rollout Flow (Blue/Green Zero-Downtime Pipeline)

All formal production updates transition through our GitHub Actions immutable workflow pipeline (`.github/workflows/ci-cd-pipeline.yml`). Tureep enforces strict **Blue/Green traffic shedding** --- completely ensuring zero seconds of service unreachability for active Middle Eastern corporate trading counterparties.

### Phase 1: Cryptographic CI Initialization
1. **GitHub Release Tagging:** Engineers merge feature PRs into `main` after clearing two accredited Senior Engineering code owner approvals.
2. **Automated MLOps Artifacts Lock:** The pipeline executes `model_training_pipeline.py` to freeze your latest deterministic trade matching heuristics into active version storage (`/tureep/mlops/artifacts/v1.1.0-ops`).

### Phase 2: Multi-Stage Non-Root Docker Container Verification
The pipeline programmatically builds the decoupled FastAPI backend microservices and TanStack Start frontend trade terminal using multi-stage Alpine/Debian base images.
* **Non-Root Trapper Gatekeeper:** Containers strictly execute as non-root `tureep:tureep` user groups with memory write permissions explicitly revoked across application folders (`chmod -R 755 /app`).
* **Runtime Secrets Injection:** Containers execute absolute zero disk key material persistence. AWS Task Definitions (`aws_secretsmanager_secret`) inject live database connection pools (`/tureep/production/DATABASE_URL`) strictly at runtime.

### Phase 3: Traffic Orchestration & Health Gatekeepers
1. **Staging Canary Ingress Launch:** Kubernetes spawns your new application Pods (`Tureep Green Swarm`) alongside the existing production Pods (`Tureep Blue Swarm`). Traefik Ingress diverts exactly **10%** of live multi-tenant API matching requests to the Green pods.
2. **Smoke Assertion Sweep:** The pipeline invokes our programmatic 18-route Node.js automated smoke testing runner (`tests/smoke-test.js`) and monitors `/health` HTTP liveness status.
3. **100% Core Cutover Launch:** Upon confirming zero HTTP 5xx errors or `"building..."` lockups forever, Traefik routes **100%** of external REST traffic to the new Green swarm. Blue pods execute graceful TCP drains and un-deploy within 300 seconds.

---

## 🛠️ Standalone Emergency CLI Production Deploy Commands

If GitHub Actions cloud runners face external network delays, accredited DevOps administrators can initiate a pristine manual Docker Compose or Kubernetes deployment rollout directly from a secure AWS/GCP administrative shell.

### 1. Execute Kubernetes Multi-Node Rollout
```bash
# 1. Point kubeconfig to AWS EKS Production Cluster
aws eks update-kubeconfig --region eu-central-1 --name TureepContinuousProductionCluster

# 2. Apply explicit declarative multi-tenant ConfigMaps and Traefik Ingress WAF configurations
kubectl apply -f k8s/ --recursive

# 3. Force Rolling Rollout across Seven Highly Specialized Microservice Pods
kubectl rollout restart deployment/tureep-trade-service -n tureep-production
kubectl rollout status deployment/tureep-trade-service -n tureep-production --timeout=120s
```

### 2. Standalone VPS Full-Stack Production Cutover
```bash
# Execute directly from repository root on your Docker VPS
docker-compose -f docker-compose.yml -f docker-compose.monitoring.yml up --build -d --remove-orphans
```

---

## 📊 Live System Verification Gatekeeper Checklist
- [ ] Active Supabase connection fully verified against the **Supabase Transaction Pooler connection string** (`*.pooler.supabase.com:6543`).
- [ ] Automated static AST scanners (`bandit`) and Gitleaks SARIF vulnerability reports completely clear.
- [ ] HTTP `Strict-Transport-Security` header active and CORS explicitly restricted to accredited origins (`https://tureep.ai`).
