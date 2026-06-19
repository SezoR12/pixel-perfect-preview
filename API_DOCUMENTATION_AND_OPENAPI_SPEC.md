# Tureep AI+ Institutional Trade API & OpenAPI Specifications

**Document Reference:** `DOC_TECH_TUREEP_API_2026_01`  
**Classification:** Engineering Bounded Context & External Interface Specification  
**Version:** v1.0.0 (Mirrored for `/api/v1` and `/api` Monolithic Gateways)  
**Protocol:** REST • HTTP/1.1 • HTTP/2 over pristine mTLS

---

## 🔒 1. Universal Authentication & Security Handshakes

All non-public endpoints require strict cryptographical authentication. The API Gateway enforces JSON Web Tokens (JWT) inside **strict `httpOnly` HTTP Cookies** or standard **`Authorization: Bearer <token>` HTTP request headers**.

### 1.1 Exquisite OAuth2 / Token Acquisition (`POST /api/v1/auth/login`)
Clients obtain long-lived session tokens by submitting JSON or `application/x-www-form-urlencoded` credentials.

* **Rate Limit:** Exactly `5 / minute` per source IP.
* **Payload Constraints:** User passphrases undergo strict evaluation against highly optimized `bcrypt` digests. Weak fallbacks or demo default pre-fills are strictly rejected.

```bash
# Example cURL Request:
curl -X POST "https://api.tureep.ai/api/v1/auth/login" \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "username=buyer.turkey@tureep.ai&password=Tureep*Auth#2026!xKey"
```

#### Authentic JSON Response (`HTTP 200 OK`):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZXhwIjoxNzgxODcwNTA0fQ.SecureSignatureHash",
  "token_type": "bearer"
}
```

### 1.2 Universal Request & Response Headers
To enable deep distributed telemetry tracing and secure iframe embedding, every response embed specific Enterprise security claims:
* **`X-Request-ID`:** A 36-character `UUID` (e.g., `req-8f9c0442-98fc-1c14-9afb-f4c8996fb924`).
* **`Strict-Transport-Security`:** Exactly `max-age=63072000; includeSubDomains; preload`.
* **`X-Content-Type-Options`:** Exactly `nosniff`.
* **`X-Frame-Options`:** Exactly `DENY`.

---

## 📦 2. Core Operational Endpoints (The 7-Stage Workflow Machine)

### 2.1 Commodity Supplier Catalog (`GET /api/v1/products/`)
Retrieves institutional commodity inventory items indexed by regional counterparties in Iraq and Iran.

* **Pagination Query Parameters:** `page` (Default: `1`), `page_size` (Default: `20`, Max: `100`).
* **Filtering Filters:** `search` (Proactive regex XSS/SQL Injection sanitized), `category` (`dates`, `steel_scrap`, `phosphate`), `country` (`Iraq`, `Iran`).

```json
// Example Response Schema (PaginatedResponse):
{
  "items": [
    {
      "id": 101,
      "user_id": 1,
      "name": "Premium Iraqi Basra Medjool Dates",
      "description": "Medjool dates from Basra farms, grade A. Fully packaged in 5kg boxes.",
      "category": "dates",
      "price": "2.50",
      "quantity": 500,
      "unit": "ton",
      "origin": "Iraq",
      "location": "Basra Deep Water Port, Iraq",
      "is_available": true,
      "created_at": "2026-05-01T00:00:00Z",
      "updated_at": "2026-05-01T00:00:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "page_size": 20,
  "total_pages": 1,
  "has_next": false,
  "has_prev": false
}
```

### 2.2 Commercial Purchasing Inquiries (`POST /api/v1/demands/`)
Institutional corporate buyers in Turkey or global markets inject structured purchasing inquiries.

* **Rate Limit:** Exactly `10 / minute`.
* **Ownership Gatekeeper:** Successfully validated Current User ID is automatically injected as `user_id`.

```json
// Request Payload:
{
  "product_name": "Iraqi Dates Bulk",
  "category": "dates",
  "quantity": 300,
  "unit": "ton",
  "budget": "2.80",
  "location": "Mersin Free Zone, Turkey"
}
```

### 2.3 Highly Definitive Bilateral Pre-Deal Ledgers (`GET /api/v1/deals/pre-deals`)
Retrieves mutually compatible pre-deal handshakes computed by our smart heuristic engine.

* **SLA Delay Policy Applied:** Visibility is actively withheld based on Current User Master Account tier --- Free (+120h) down to Sovereign Black Admin (Zero instantaneous delay).
* **Referential RLS Isolation:** Evaluates gotrue `UUID = UUID` multi-tenant claims to completely eradicate cross-tenant data leaks.

### 2.4 Pre-Deal Acknowledgment & State Action (`POST /api/v1/deals/pre-deals/{deal_id}/{action}`)
Allows an authentic authenticated counterparty entity (strictly the matching `buyer_id` or `seller_id`) to accept or reject a bilateral deal.

* **Path Constraints:** `{action}` must evaluate strictly to `accept` or `reject`.
* **Order Auto-Conversion Workflow:** If both counterparties execute `accept`, the underlying state machine Explorer instantly converts the pre-deal into a formal institutional `Order` transaction manifest and calculates preferential commission fees.

```json
// Authentic Success Response:
{
  "status": "accepted",
  "pre_deal_id": 501,
  "order_id": 1001,
  "order_number": "TUR-2026-000001"
}
```

### 2.5 Trade Finance Instrument Emission (`POST /api/v1/trade-finance/lc`)
Initiates an official SWIFT MT700 Letter of Credit state machine supporting cross-border trade settlements.

* **Accredited Authorization Gatekeeper:** Fully verifies ownership against the active `buyer_id` linked to the designated `Order`.
* **Validation SLA:** Enforces strict positive numerical validation (`amount > 0`).

```json
// Request Schema:
{
  "order_id": 1001,
  "issuing_bank": "Garanti BBVA Istanbul",
  "advising_bank": "Trade Bank of Iraq (TBI)",
  "amount": 7500.00,
  "currency": "USD",
  "expiry_days": 90
}
```

---

## 🔔 3. Highly Definitive Notification Webhooks & Celery ARQ Events Bus

Tureep AI+ operates an exceptionally clean asynchronous Webhooks architecture --- broadcasting verifiable JSON events directly to registered corporate callback endpoints upon major deal transitions.

### 3.1 Standard Webhook Payload Definition (`predeal.accepted`, `order.created`, `shipment.cleared`)
When a deal completes or an ocean container securely steps through a way-point, our underlying Celery cluster emits a signed `HTTP POST` callback to your configured integration webhook URL.

```json
// Example Webhook Emitted Payload:
{
  "event_id": "evt_99102-88192-TUR",
  "event_type": "shipment.customs_cleared",
  "timestamp": "2026-06-19T10:30:00Z",
  "data": {
    "order_number": "TUR-2026-000001",
    "tracking_number": "TRK-DHL-2026-889102",
    "carrier": "DHL Global Forwarding",
    "clearing_corridor": "Customs Export Node — Umm Qasr Port",
    "fta_verdict": "Tariff locked under preferential Article 14 Quota"
  },
  "cryptographic_verification_signature": "v1=e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
}
```

---

## ⚠️ 4. Universal Standardized Error JSON Formatter

In strict accordance with our institutional architecture specifications, all validation rejects, rate limits, and network errors return an exceptionally descriptive, beautifully structured error format:

```json
{
  "error": {
    "code": 422,
    "message": "Payload structure validation failed.",
    "details": [
      {
        "field": "password",
        "message": "Password must contain at least one special symbol"
      }
    ],
    "request_id": "req-99102-88192-TUR",
    "timestamp": "2026-06-19T12:00:00Z"
  }
}
```
