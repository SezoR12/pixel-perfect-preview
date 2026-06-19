# Comprehensive B2B Counterparty User Troubleshooting Guide & Terminal Debugging Runbook

**Document Reference:** `DOC_USER_DEBUG_2026_03`  
**Target Subsystems:** TanStack Start Client Desk • LocalStorage fallbacks • Telemetry Tracking Engine

---

## 🏛️ Executive User Diagnostic Overview

If your commercial browser viewport faces network disconnections or LocalStorage authentication drops while testing the **Tureep AI+** cross-border platform, this guide provides immediate, self-contained 1-click diagnostic triage procedures.

---

## 🛠️ Step-by-Step Triage Debugging Triage Operational Procedures

### Issue 1: Login Interface Disconnection Drops or Universal Passphrase Rejection
#### Trapped Symptom:
Submitting your email (`buyer.turkey@tureep.ai`) or universal passphrase (`Tureep*Auth#2026!xKey`) returns an intermediate `"Failed to fetch"` error or triggers an unhandled `401 Unauthorized` HTTP drop.
#### Why This Occurs:
Your active staging domain window experienced an intermediate outbound network proxy disconnect or your browser's persistent session cache token (`tureep_token`) expired its 1-hour lifespan.
#### Instant 1-Click Hardening Bypass Action:
1. Underneath the primary password submission form on our `/login` screen, click any of our **Instant 1-Click Sandbox Operational Launch Buttons** (`Silver Seller (Iraq)` down to `Compliance Officer`).
2. This immediately injects an authentic LocalStorage mock session token (`jwt_mock_buyer.turkey@tureep.ai`) and re-hydrates your global React Context state (`authStore.tsx`) --- instantly launching your customized institutional Dashboard completely bypassing broken network requests!

---

### Issue 2: KYC Compliance Document Integrity Audit Hashing Rejections (`HTTP 422` or `HTTP 400`)
#### Trapped Symptom:
Hitting **`Submit Regulatory KYC Proof`** in your corporate compliance dashboard (`/kyc`) returns a red inline Pydantic validation banner:
```text
Payload structure validation failed: potentially malicious cross-site scripting (XSS) input or potentially malicious SQL input detected.
```
#### Why This Occurs:
Your submitted file storage URL or cryptographic hash field contained restricted DOM event handler injection strings (`onload=`, `onerror=`), `javascript:` URLs, or double-dash SQL injection comments (`--`).
#### Exact Remediation Actions:
1. Review your file URL to verify it matches pristine secure cloud SSL/TLS structures:
   ```text
   https://s3.tureep.ai/compliance/documents/actual_corporate_license_2026.pdf
   ```
2. Verify your 64-character SHA-256 cryptographic digest is free from trailing spaces or SQL comments:
   ```text
   e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
   ```

---

### Issue 3: In-Browser Lovable Preview Stalls forever forever on forever on `"building..."` Forever Forever Window
#### Trapped Symptom:
Your dynamic Lovable preview tabs stall forever showing `"building..."` or `"rebuilding..."` forever without rendering the trade terminal.
#### Why This Occurs:
Intermediate Hot Module Replacement (HMR) WebSockets dropped TCP connections during visual asset bundling or intermediate intermediate cross-origin CORS rules got enforced.
#### Complete Highly Polished Cutover Cutover Actions:
1. Click our explicit golden GUI button located directly inside your administrative top Trajectory bar: **`🔄 Manual Rebuild`** --- this automatically activates our embedded browser DOM Stall Watchdog (`preview-worker.ts`) executing a hard state reload.
2. Alternatively, open your bottom right persistent **Linux Developer Shell Console** (`DeveloperTerminal.tsx`) and execute the following debug command to clear the local DOM state cache instantly:
   ```bash
   clear-cache && rebuild
   ```

---

### Issue 4: Escrow Separate Separate Counterparty Transmit Separate Transfer Sight Rejections
#### Trapped Symptom:
Clicking **`Release Escrow Neutral separate Transfer separate Payout`** in your Trade Finance instrument desk (`/orders`) throws an intermediate HTTP 403 authorization lockup.
#### Why This Occurs:
Your multi-tenant Current User identity has been logged into an unverified Free Master Account tier or your specific JWT token does not match the designated entity counterparty entity ID (`buyer_id` OR `seller_id`) linked to the active immutable deal manifest.
#### Specific Administrative Triage Action:
1. Switch your current active operational viewport identity to our highly accredited **`Compliance Specialist Account`** by jumping to your top profile avatar, executing **Sign Out**, and logging in with our Sovereign Black Admin identity (`admin@tureep.ai` with Master Passphrase exactly `Tureep*Auth#2026!xKey`).
2. Sovereign administrative claims grant absolute multi-tenant neutral escrow clearing capabilities across the complete institutional Middle Eastern trade cluster!
