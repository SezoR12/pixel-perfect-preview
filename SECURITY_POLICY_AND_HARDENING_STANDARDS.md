# B2B Cross-Border Information Security Policy & Core Hardening Standards

**Document Reference:** `DOC_SEC_POLICY_2026_01`  
**Platform:** Tureep AI+ B2B Hybrid MENA Commodity Trade Desk  
**Target Release:** Phase 2 Hybrid Enterprise Release  
**Enforcement:** Universal Sovereign Mandate across all Middle Eastern Operations

---

## 🏛️ 1. Executive Mission & Security Sovereignty Mandate

Tureep AI+ connects highly accredited commodity suppliers in Iraq and Iran to corporate institutional buyers in Turkey, Europe, and global markets. Because cross-border transactions involve sensitive commercial purchasing inquiries, international multi-node logistics, and high-value banking instruments (Escrow and SWIFT MT Letters of Credit), absolute information security is an uncompromisable prerequisite.

This Security Policy establishes the immutable baseline standards required for all system engineers, infrastructure DevOps pipelines, and cloud database pools.

---

## 🔒 2. Data Encryption Hardening Standards

### 2.1 Cryptography at Rest
All persistent storage volumes must implement industry-standard encryption to protect multi-tenant commercial ledgers against physical server theft or bare-metal data extraction:
* **Cloud Database Ledgers:** PostgreSQL Enterprise databases run continuous AES-256 transparent disk encryption.
* **Biometric Compliance Vaults:** Executive passports, corporate trade licenses, and tax certificates submitted to our KYC/AML review queues (`kyc.py`) are uploaded exclusively via AWS S3 Pre-Signed KMS buckets with Server-Side Encryption (SSE-KMS) and real virus scanning sidecars actively attached.
* **Cached Analytical Matrices:** B2B cart states and rule-based commodity match scoring criteria cached in our Redis clusters undergo strict `httpOnly` state isolation.

### 2.2 Cryptography in Transit (Strict Transport Backbone)
Plaintext HTTP traffic (`http://`) or unencrypted gRPC inter-service communication is actively restricted across all platform modules.
* **HTTPS Enforcement:** Production FastAPI routers (`main.py`) programmatically enforce `HTTPSRedirectMiddleware` and `TrustedHostMiddleware` --- actively dropping plaintext TCP connection requests and verifying incoming HTTP host headers match accredited corporate identities (`tureep.ai`, `*.tureep.ai`).
* **HSTS Injection Gatekeeper:** Transmitted HTTP responses embed strict **HTTP Strict Transport Security (HSTS)** headers:
  ```http
  Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
  ```
* **Zero-Trust gRPC mTLS Bus:** Inside Kubernetes swarms, all inter-service communications execute absolute Zero-Trust mutual TLS (mTLS) handshakes.

---

## 🔐 3. Authentication & Access Gatekeepers (RBAC Bounded Context)

### 3.1 Highly Robust Passphrases & Password Cryptography
* **Minimum Complexity:** Passwords submitted upon individual or corporate registration MUST satisfy strict client-side (`login.tsx`) and backend (`schemas.py`) structural validation --- enforcing a minimum of 8 characters, mixed case (uppercase & lowercase), numerical digits, and special cryptographic symbols (`validate_password_strength`). Fallbacks or exposed plaintext defaults (`password123`) are completely eradicated.
* **Bcrypt Plaintext Trapper:** Passphrases are never stored or logged in raw plaintext. All user passphrases are digested directly via highly robust **`bcrypt`** adaptive key derivation hashing functions (`security.py`).
* **Account Lockout Protection:** The `/api/v1/auth/login` endpoint maintains an active in-memory / Redis lockout tracking ledger (`_lockout_ledger`). Users failing **5 consecutive login handshakes within 15 minutes** get temporarily locked out for exactly 15 minutes, triggering automated JSON security audit logs (`ACCOUNT_LOCKOUT_TRIGGERED`).

### 3.2 Role-Based Access Control (RBAC) Gatekeepers
* **Current User Active Gatekeeper:** Authenticated routes invoke `get_current_active_user` confirming the corporate identity has been successfully authenticated by an accredited compliance specialist.
* **Sovereign Black Privileges:** Core trade compliance actions (`review_kyc`, `act_on_lc`, `gdpr_right_to_delete`) require verified Administrative RBAC roles (`"black"` Master Account level / Compliance Officer claims). Counterparty entities are completely restricted from inspecting third-party KYCs or unsanctioned pre-deal handshakes (`require_ownership`).

---

## 🛡️ 4. Vulnerability Mitigation & Immutability Chain Protocols

### 4.1 Dependency Trees & Secret Scanning
Third-party Node.js / Bun and Python dependencies are automatically scanned for CVE security risks on weekly schedules. Staged git modifications get audited automatically by our pre-commit `detect-secrets` hook to guarantee zero cryptographic key material or `.env` URLs ever enter your version histories.

### 4.2 Tamper-Proof Audit Logging (Cryptographic Chain Links)
Every single administrative update, payment custody action, deal decision, or login attempt is logged into a unified, structured JSON format (`audit.py`). 
* **HMAC SHA-256 Immutability Chaining:** Each new JSON log entry calculates a running cryptographic HMAC SHA-256 digest referencing the preceding log's cryptographic link (`cryptographic_chain_link`). This provides mathematically irrefutable proof of operational integrity against active internal database tampering --- establishing pristine evidence for third-party **SOC 2 Type I and Type II auditing bureaus**!
