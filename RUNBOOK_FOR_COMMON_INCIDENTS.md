# Operational Triage & Incident Response Runbook (Incident Response Plan)

**Document Reference:** `DOC_TECH_INCIDENT_RUNBOOK_2026_03`  
**Classification:** Institutional Engineering Blueprint & Operations Runbook  
**Target Subsystems:** B2B MENA Trade Terminal & Microservices Cluster  

---

## 🚨 1. Incident Escalation & Legal SLA Timeline Protocols

When a production lockup or potential data breach is trapped by our Prometheus monitoring nodes or user reports, Tureep enforces a definitive, highly structured triage workflow.

### 1.1 The 5-Stage Incident Lifecycle
1. **Detection & Triage (0-15 Minutes):** Prometheus or Datadog alerts trigger active alarms in the `#ops-incidents` Slack channel. The primary On-Call Site Reliability Engineer (SRE) logs into the administrative dashboard to assess impact severity (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`).
2. **Containment (15-45 Minutes):** If a specific microservice node is misbehaving or compromised, the SRE instantly updates Kong API Gateway routes or executes Blue/Green traffic shedding to divert requests away from the affected node.
3. **Eradication (45-90 Minutes):** Identifying and purging the exact root cause (e.g., rolling leaked database passwords, reverting broken DDL schema migrations, or deploying proactive regex input blocks).
4. **Recovery (90-120 Minutes):** Programmatically restoring traffic, flushing non-recoverable tasks from the active Dead Letter Queue (`dead_letter_queue`), and executing running HMAC chain link assertions to confirm system integrity.
5. **Post-Mortem & Comprehensive Triage Log:** Authored within 48 hours post-incident. Documenting Root Cause Analysis (RCA), timelines, and preventative engineering action items.

### 1.2 Mandatory Legal & Compliance Triage SLA Timelines
* **GDPR Breaches (72-Hour Legal Mandate):** If raw user contact details or corporate profile ledgers get compromised, **Article 33** of the GDPR mandates formal legal notification to your designated Lead Supervisory Authority and active counterparty entities within exactly **72 hours** post-discovery.
* **SOC 2 & PCI-DSS Triage Log:** Immediately notify your processing merchant bank and PCI Approved Scanning Vendor (ASV) if separate escrow charges or custom sub-accounts get tampered with.

---

## 🛠️ 2. Common Production Lockup Signatures & Specific Triage Triage Procedures

### 2.1 PgBouncer Database Connection Pool Saturation (`CRITICAL`)
#### Trapped Alarm Signature:
```text
sqlalchemy.exc.TimeoutError: QueuePool limit of size 5 overflow 15 reached, connection timed out, timeout 30.00
```
#### Root Cause:
FastAPI worker nodes are processing heavy multi-tenant commodity match matrices and holding database transaction threads open longer than the established 30-second networking timeout.
#### Exact Action Actions:
1. **Immediate Remediation:** Assert that your active `DATABASE_URL` is pointing directly to your **Supabase Transaction Pooler URL** rather than the bare-metal database instance:
   ```env
   # Ensure exactly this format is programmed in production:
   DATABASE_URL="postgresql://postgres.bkwajecszulriwqivqnd:Tureep%23Enterprise2026%21Secured%2399xL@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require"
   ```
2. **Kubernetes Autoscaling Restart:** Execute a rolling rollout of your matching workers to recycle stale pooling connections:
   ```bash
   kubectl rollout restart deployment tureep-trade-service -n tureep-production
   ```

### 2.2 Stripe Webhook Cryptographic Signature Validation Mismatches (`HIGH`)
#### Trapped Alarm Signature:
```text
stripe.error.SignatureVerificationError: No signatures found matching the expected signature for payload
```
#### Root Cause:
The `Stripe-Signature` HTTP header emitted by Stripe does not match the active `STRIPE_WEBHOOK_SECRET` environment variable programmed into your `finance_service` runtime memory.
#### Exact Action Actions:
1. **Verify Key Custody:** Access your active Stripe Developer Dashboard, navigate to **Webhooks**, and reveal your pristine live Webhook Secret (`whsec_...`).
2. **AWS Secrets Manager / GitHub Secrets Re-Injection:** Inject the pristine key into your cloud task definitions or remote GitHub CI repository:
   ```bash
   gh secret set STRIPE_WEBHOOK_SECRET --repo "SezoR12/pixel-perfect-preview" --body "whsec_ActualRotatedStripeSecretKey"
   ```

### 2.3 Lovable Visual Preview Browser Stall Forever (`"building..."` Freezes)
#### Trapped Alarm Signature:
The in-browser Lovable visual compilation iframe stalls forever showing `"building..."` or `"rebuilding..."` indefinitely.
#### Root Cause:
Vite HMR (Hot Module Replacement) WebSockets lost connectivity during an active CSS HMR injection run or encountered intermediate intermediate CORS network blocks.
#### Exact Action Actions:
1. **1-Click Self-Healing Watchdog:** Hitting our deeply proactive **`🔄 Manual Rebuild`** or `"snappy bypass"` buttons in your app desk will automatically invoke our DOM Stall Recovery Watchdog (`src/lib/preview-worker.ts`) executing a hard DOM state reload (`window.location.reload()`).
2. **Execute CLI Diagnostic Rebuild:** Hitting our persistent developer terminal CLI drawer in the bottom right and executing `rebuild` will flush the DOM cache instantly.

### 2.4 Celery / Redis Dead Letter Queue (DLQ) Saturation (`HIGH`)
#### Trapped Alarm Signature:
```text
🚨 Task async_generate_deals_task exhausted all retries. Securely transferred to Dead Letter Queue (DLQ).
```
#### Root Cause:
Non-recoverable external API drops (e.g., intermediate Dow Jones sanctions API disconnections) exhausted the established 5 exponential backoff retries (`max_retries=5`).
#### Exact Action Actions:
1. **Inspect Dead Letter Stream:** Query your active Redis cluster to reveal the failed task payload and precise exception traces:
   ```bash
   redis-cli -u "redis://localhost:6379/0" XREAD COUNT 10 STREAMS dead_letter_queue 0
   ```
2. **Execute Re-Queue Triage Manual Runner:** Formulate a Python diagnostic sidecar or Celery tool to pop DLQ entries and re-inject them into the active priority queue once external vendors regain uptime.
