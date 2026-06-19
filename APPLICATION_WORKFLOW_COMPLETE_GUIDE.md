# 🔄 Tureep AI+ — Definitive End-to-End Application Workflow Guide
**Version:** 2.0 (Complete Hybrid MVP Architecture)  
**Date:** today, 2026-06-19 in local Asia/Baghdad timezone.  
**Scope:** Exhaustive operational manual and state machine breakdown charting exactly how international commodity buyers, Middle Eastern suppliers, compliance administrators, and logistics carriers step through the complete 17-route **Tureep AI+** cross-border platform.

---

## 🗺️ 1. Complete Application Route Surface & Interoperability Map

The complete application layout unifies domain-specific operations into a fully standardized, localized, and multi-tenant terminal. Trading counterparties move across three core operational horizons:

```text
[COMMERCIAL HORIZON]                               [FINANCIAL HORIZON]                         [OPERATIONAL HORIZON]
 ├── Landing Gateway (/)                            ├── Master Account Billing (/billing)       ├── EDI Container Logistics (/shipments)
 ├── User Authentication (/login)                   ├── Orders & Secure Escrow (/orders)        ├── ML Intelligence Sandbox (/ml-analytics)
 ├── Consolidated Partner Desk (/profile)           └── SWIFT LC / DP State (/trade-finance)    ├── Regulatory KYC/AML Audit (/kyc)
 ├── Master Commodity Catalog (/products)                                                       ├── OFAC/EU/UN Sanctions (/sanctions)
 ├── Active Purchasing Inquiries (/demands)                                                     ├── Multi-Channel Inbox (/notifications)
 └── AI Matching Handshakes (/pre-deals)                                                        ├── Supabase Core Suite (/supabase-portal)
                                                                                                ├── Microservices Spec (/microservices-spec)
                                                                                                └── Technical Hardening (/hardening-notes)
```

---

## 🚀 2. The 7-Stage Institutional Deal Journey (Step-by-Step Walkthrough)

### 🧠 Stage 1: Multi-Vector AI Discovery & Catalog Indexing
* **User Actions:** 
  * Middle Eastern suppliers (e.g., *Basra Dates Co.* in Iraq or *Iran Steel Group*) navigate to **`/products`** and list bulk inventory specifications (Quantity, Unit FOB Face Value, Origin Storage Port).
  * Turkish and European corporate buyers (e.g., *Istanbul Imports Ltd.*) navigate to **`/demands`** and inject structured target purchasing budgest and delivery Free Zones.
* **Underlying System Execution:** The Python FastAPI matching algorithm (`/api/ml-analytics/simulate`) continuously evaluates market spot catalogs against active inquiries across five primary decision vectors:
  1. *Price Elasticity & Vector Alignment (35%)*
  2. *Geographical Corridor Distance & Maritime Risk (22%)*
  3. *Counterparty Trust Index & Regulatory Tier Level (18%)*
  4. *Delivery Urgency Lead-Time Multiplier (15%)*
  5. *Historical Discrepancy/Default Ratio (10%)*

### 🤝 Stage 2: Institutional Pre-Deal Generation & Latency Delay
* **User Actions:** Counterparties navigate to **`/pre-deals`** to view auto-generated commercial match propositions.
* **Underlying System Execution:** 
  * When a high match score is locked (`>= 75.0`), the system emits a structured `PreDeal` entity containing suggested FOB settlement terms, carrier shipping quotes, and complete expiry horizons.
  * **Master Account Latency Enforcement:** To monetize the network, the visibility of new pre-deals is delayed based on the user's Master Account tier (**`/billing`**):
    * *Free Node:* `+120 hours delay`
    * *Bronze Account:* `+72 hours delay`
    * *Silver Master:* `+24 hours delay`
    * *Gold Priority:* `+6 hours delay`
    * *Platinum / Black Enterprise Nodes:* **`Instantaneous Visibility (Zero Latency)`**

### ✍️ Stage 3: Mutual Acceptance Handshake & Order Auto-Conversion
* **User Actions:** On the **`/pre-deals`** page, the Seller and Buyer evaluate the suggested commercial terms and click **`Accept Deal`**.
* **Underlying System Execution:** Once both counterparties acknowledge the match, the status advances to `accepted`. The application reveals a prominent **`Convert to Order`** button. Clicking this triggers `createOrderFromPreDeal`, generating an immutable transaction manifest (e.g., **`Order #TUR-2026-000001`**) and assigning the precise platform overhead commission fee (`1.0%` for Free down to `0.0%` for Black Sovereign).

### 📑 Stage 4: Regulatory Compliance KYC/AML & Sanctions Audit
* **User Actions:** 
  * Counterparties navigate to **`/kyc`** and upload accredited corporate proofs (Certificate of Incorporation, Tax proofs, Executive IDs) alongside cryptographic SHA-256 integrity hashes.
  * Counterparties navigate to **`/sanctions`** to execute real-time sweeps against consolidated automated embargo databases (**US OFAC Specially Designated Nationals**, **EU Consolidated**, **UN Security Council** lists).
* **Underlying System Execution:** Accounts possessing the cryptographic `'admin'` claim in their Supabase Gotrue JWT (e.g., `admin@tureep.ai`) access the Compliance Review Queue on `/kyc`, verifying cryptographic integrity and approving Master trading permissions under strict **Row Level Security (RLS)** multi-tenant isolation rules.

### 🏛️ Stage 5: Trade Finance Locking & Custody Deposit
* **User Actions:** Counterparties navigate to **`/orders`** and **`/trade-finance`** to lock down financial custody.
* **Underlying System Execution:** 
  * **Neutral Escrow Custody (`/orders`):** Buyers initiate deposits into the secure Tureep institutional escrow custody account (`#ESC-2026-991`).
  * **ICC UCP 600 Letters of Credit (`/trade-finance`):** Importers open formal SWIFT MT700 L/Cs with issuing banks (e.g., *Garanti BBVA Istanbul*), which are advised via correspondent banks (*Trade Bank of Iraq*). The platform state machine tracks every SWIFT status step (`Draft` → `MT700 Issued` → `Advised` → `Docs Presented` → `Clean Audit` → `Settled`).
  * **URC 522 Documentary Collections (`/trade-finance`):** Implemented automated D/P tracking state machines capturing Importer wire payments before electronically releasing physical transport papers.

### 🚛 Stage 6: EDI Logistics Container Tracking & Geo-Waypoints
* **User Actions:** Counterparties navigate to **`/shipments`** to monitor active freight transit manifests connected to **DHL Global Forwarding** and **Maersk Line**.
* **Underlying System Execution:** 
  * The platform consumes automated EDI tracking webhooks from shipping carriers.
  * Using our built-in **`Simulate EDI Webhook`** geo-waypoint injection sandbox, logistics operators or developers can cryptographically inject precise satellite telemetries (e.g., *Customs Clearing Export Node — Umm Qasr Port* or *Suez Canal Maritime Waypoints*) right into the immutable transaction timeline.

### Landmark Stage 7: Settle Wire MT756 & Complete Handshake
* **User Actions:** On the **`/orders`** page, once physical delivery is authenticated and **SGS Quality Inspection** certificates are unsealed, counterparties click **`Release Escrow to Seller`** (or settle SWIFT MT756 wire transfers).
* **Underlying System Execution:** Payment status actively transitions to `released` (`completed`). The Redis priority queue event bus (**`/notifications`**) instantly enqueues and broadcasts high-performance confirmation payloads across WebSocket, SendGrid email, Firebase mobile push, and Twilio SMS.

---

## 📊 3. Master Systems Interoperability Schema

```text
       [Sellers: /products]                [Buyers: /demands]
                 │                                  │
                 └───────────────┬──────────────────┘
                                 ▼
                     [AI Matching: /ml-analytics]
                                 │
                                 ▼
                     [Active Deals: /pre-deals]
                                 │
                                 ▼ (Mutual Acceptance Handshake)
                     [Confirmed Order: /orders]
                                 │
         ┌───────────────────────┴───────────────────────┐
         ▼                                               ▼
[Compliance: /kyc, /sanctions]          [Finance: /trade-finance, /billing]
         │                                               │
         └───────────────────────┬───────────────────────┘
                                 ▼
                    [Physical Freight: /shipments]
                                 │
                                 ▼ (SGS Docs / EDI Webhooks Authenticated)
                    [Escrow Release & Final Wire Settlement]
                                 │
                                 ▼
                   [Event Bus: /notifications Broadcast]
```

This absolute masterwork operational framework entirely protects high-risk cross-border trade corridors --- delivering ultimate institutional velocity, cryptographical security, and zero-trust multi-tenant isolation!
