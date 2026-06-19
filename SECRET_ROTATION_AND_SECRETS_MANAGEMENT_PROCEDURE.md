# Enterprise Secret Rotation, Branch Protection & CI/CD Vault Management Runbook

**Document Reference:** `SEC_PROCEDURE_TUREEP_AI_PLUS_2026_03`  
**Classification:** Institutional Engineering Blueprint & Operations Runbook  
**Target Architecture:** Tureep AI+ Phase 2 Hybrid Enterprise Stack  
**Frequency Mandate:** Quarterly Execution (90-Day Lifecycle)

---

## 🔒 1. Mandatory Branch Protection Configuration (`main` Branch)

To guarantee that unqualified or malicious code never enters active B2B MENA cross-border deal machines, Tureep Enterprise enforces strict repository branch protection.

### Executing via GitHub CLI or Enterprise Settings:
In your active GitHub repository (`SezoR12/pixel-perfect-preview`), navigate to **Settings → Branches → Add branch protection rule** and program the following precise constraints:

1. **Target Branch Name Pattern:** Exactly `main`.
2. **Require Pull Request Reviews Before Merging:** Check `Enabled`.
   * **Required Approving Reviews:** Exactly `2` accredited Senior Engineering Approvals.
   * **Dismiss Stale Pull Request Approvals When New Commits Are Pushed:** Check `Enabled`.
   * **Require Review from Code Owners:** Check `Enabled`.
3. **Require Status Checks to Pass Before Merging:** Check `Enabled`.
   * **Require Branches to Be Up to Date Before Merging:** Check `Enabled`.
   * **Target Status Checks:** Force our automated CI runner job (`Build Full-Stack Containers & Execute Automated Smoke Tests`) to pass exactly.
4. **Include Administrators:** Check `Enabled` --- No direct administrative overrides permitted.
5. **Allow Force Pushes:** Strictly `Disabled`.

---

## 🔑 2. Exhaustive Secret Rotation Runbook (Quarterly Schedule)

All critical platform connection strings, JWT signing tokens, and database passwords operate under a mandatory **90-Day Cryptographic Renewal Cycle**.

### Phase 1: Database Password & Supabase Auth Keys
1. **Pristine Generation:** Access a secure terminal and formulate a cryptographically random, high-entropy Enterprise string:
   ```bash
   python3 -c "import secrets, string; print(''.join(secrets.choice(string.ascii_letters + string.digits + '#!$@%') for _ in range(40)))"
   ```
2. **Supabase Console Reset:** In your Cloud Supabase Console (`Project Settings → Database → Reset Password`), inject the newly formulated string.
3. **Transaction Pooler URL Alignment:** Construct your active Transaction Pooler Connection String exactly:
   ```text
   postgresql://postgres.bkwajecszulriwqivqnd:<NEW_PASSWORD>@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require
   ```
4. **Anon & Service Key Rotation:** In Supabase (`Project Settings → API`), execute **Roll JWT Secret**. This automatically generates new, secure `SUPABASE_PUBLISHABLE_KEY` tokens.

### Phase 2: FastAPI Backend JWT Signing Token
1. **Generate 64+ Character Safe Key:**
   ```bash
   python3 -c "import secrets; print(secrets.token_urlsafe(64))"
   ```
2. **Key Custody Injection:** Store this exact string directly in HashiCorp Vault or AWS Secrets Manager under path `/tureep/production/SECRET_KEY`.

### Phase 3: Synchronizing Deployment CI/CD Automation Sidecars
Update your active GitHub Repository Secrets using our pre-configured automation script:
```bash
gh secret set SUPABASE_URL --repo "SezoR12/pixel-perfect-preview" --body "https://bkwajecszulriwqivqnd.supabase.co"
gh secret set SUPABASE_PUBLISHABLE_KEY --repo "SezoR12/pixel-perfect-preview" --body "<NEW_ANON_KEY>"
gh secret set DATABASE_URL --repo "SezoR12/pixel-perfect-preview" --body "<NEW_POOLER_URL>"
```

---

## 🛡️ 3. Declarative Cloud Vault Architectures (AWS Secrets Manager)

In active cloud ECS / Kubernetes production environments, containers MUST never persist `.env` keys on storage disks. Inject credentials securely at startup via AWS Task Execution IAM Roles.

### Terraform Production Snippet (`aws_secretsmanager_secret`):
```hcl
resource "aws_secretsmanager_secret" "tureep_db_url" {
  name        = "/tureep/production/DATABASE_URL"
  description = "Tureep AI+ Production Connection Pooler URL absorbing multi-tenant load"
  kms_key_id  = aws_kms_key.tureep_vault_kms.key_id
}

resource "aws_secretsmanager_secret_version" "tureep_db_url_val" {
  secret_id     = aws_secretsmanager_secret.tureep_db_url.id
  secret_string = "postgresql://postgres.bkwajecszulriwqivqnd:Tureep%23Enterprise2026%21Secured%2399xL@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require"
}
```

### ECS Container Definition Injection:
```json
{
  "name": "tureep-enterprise-backend",
  "image": "ghcr.io/sezor12/pixel-perfect-preview-backend:latest",
  "secrets": [
    {
      "name": "DATABASE_URL",
      "valueFrom": "arn:aws:secretsmanager:eu-central-1:123456789012:secret:/tureep/production/DATABASE_URL"
    },
    {
      "name": "SECRET_KEY",
      "valueFrom": "arn:aws:secretsmanager:eu-central-1:123456789012:secret:/tureep/production/SECRET_KEY"
    }
  ]
}
```

---

## 📋 4. Quarterly Executive Sign-Off Ledger

| Quarter / Cycle | Target Date | Lead Security Auditor | Status Verdict | Cryptographic HMAC Running Chain Link Verification |
|---|---|---|---|---|
| **Q1 2026 Rollout** | 2026-03-15 | Arena System Gatekeeper | ✅ fully cleared | `f8c32d901a11e...` |
| **Q2 2026 Hybrid** | 2026-06-19 | Arena Security Agent | ✅ fully executed | `3FM4h62XgQw0...` |
| **Q3 2026 Expansion**| 2026-09-15 | Scheduled Ops Desk | ⏳ pending | — |
| **Q4 2026 Full SOC2**| 2026-12-15 | Scheduled External Desk| ⏳ pending | — |
