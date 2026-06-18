# Tureep AI+ (تركيب AI+) — Complete Production Documentation

**Version:** 1.0  
**Date:** 2026-06-18  
**Classification:** Internal — Engineering & Product Specification  
**Prepared for:** Development team, stakeholders, compliance officers  

---

## Platform Context

| Attribute | Value |
|---|---|
| Platform Type | B2B trade platform (not C2C, not auction-only) |
| Core Markets | Sellers: Iraq, Iran. Buyers: Turkey, Iraq, EU, Africa, Asia |
| Primary Differentiator | AI Pre-Deal System — creates deals before any manual request |
| Secondary Differentiator | Master Account tier system (Bronze, Silver, Gold, Platinum, Black) |
| Tech Stack | Python/Django/FastAPI backend, React/Next.js frontend, PostgreSQL + MongoDB, TensorFlow/PyTorch, AWS/GCP, Docker/Kubernetes |
| Budget | $200,000 |
| Timeline | 6 months |
| Team Size | ~14 people |
| Languages | Arabic, Persian, Turkish, English + 6 others (RTL required) |
| Currencies | IQD, IRR, TRY, USD, EUR |

---

## TASK 1 — COMPLETE ERD (Database Schema)

### 1.1 Entity Relationship Overview

[ASSUMPTION: PostgreSQL is the primary transactional database. MongoDB stores audit logs, notifications, and unstructured translation data.]

| Entity | Primary Database | Notes |
|---|---|---|
| Users | PostgreSQL | Single-table design with roles |
| Companies | PostgreSQL | One company per user group; KYC linked |
| KYC_Verifications | PostgreSQL | Documents stored in S3, metadata in DB |
| Products | PostgreSQL | Multi-language fields stored in JSONB |
| Categories | PostgreSQL | Closure table for hierarchical navigation |
| Pre_Deals | PostgreSQL | Core AI-generated deal records |
| Deal_Matches | PostgreSQL | Buyer↔seller matching history |
| Orders | PostgreSQL | Parent order record |
| Order_Items | PostgreSQL | Line items per order |
| Payments | PostgreSQL | All payment methods unified |
| Shipments | PostgreSQL | One shipment per order |
| Shipment_Tracking_Events | PostgreSQL | Append-only tracking history |
| Master_Accounts | PostgreSQL | Tier subscriptions and privileges |
| Subscriptions | PostgreSQL | Billing history and renewal dates |
| Notifications | MongoDB | High-volume, ephemeral, searchable |
| Reviews_Ratings | PostgreSQL | Counterparty feedback |
| Trust_Scores | PostgreSQL | Computed reputation index |
| Disputes | PostgreSQL | Dispute case records |
| Dispute_Messages | PostgreSQL | Threaded messages per dispute |
| Translations | PostgreSQL + MongoDB | Cached translations; source strings in PG, revision history in MongoDB |
| Audit_Logs | MongoDB | Immutable compliance log stream |

### 1.2 Users

| Field | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK, default gen_random_uuid() | Unique user identifier |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Login identifier |
| phone | VARCHAR(20) | UNIQUE | Verified phone number (with country code) |
| password_hash | VARCHAR(255) | NOT NULL | Argon2id or bcrypt hash |
| role | ENUM | NOT NULL | buyer, seller, admin, compliance_officer, super_admin |
| account_status | ENUM | NOT NULL, default pending | pending, active, suspended, banned, deactivated |
| email_verified | BOOLEAN | NOT NULL, default false | Email verification flag |
| phone_verified | BOOLEAN | NOT NULL, default false | Phone verification flag |
| mfa_enabled | BOOLEAN | NOT NULL, default false | TOTP or SMS MFA enabled |
| mfa_secret | VARCHAR(255) | Nullable | Encrypted TOTP secret |
| preferred_language | VARCHAR(10) | NOT NULL, default en | ISO 639-1 code |
| preferred_currency | VARCHAR(3) | NOT NULL, default USD | ISO 4217 code |
| timezone | VARCHAR(50) | NOT NULL, default Asia/Baghdad | IANA timezone |
| created_at | TIMESTAMPTZ | NOT NULL, default now() | Registration timestamp |
| updated_at | TIMESTAMPTZ | NOT NULL, default now() | Last profile update |
| last_login | TIMESTAMPTZ | Nullable | Last successful login |
| company_id | UUID | FK → Companies(id) | Linked business entity |
| master_account_id | UUID | FK → Master_Accounts(id) | Current active tier (nullable) |
| trust_score_id | UUID | FK → Trust_Scores(id) | Current reputation record |
| referrer_id | UUID | FK → Users(id) | Referral source (self-referential) |

**Relationships:**
- Users 1:1 Companies (each user belongs to one company; a company may have multiple users)
- Users 1:1 KYC_Verifications (each user has one KYC record, re-verified over time)
- Users 1:1 Master_Accounts (at most one active master account at a time)
- Users 1:1 Trust_Scores
- Users 1:N Products (seller users)
- Users 1:N Orders (as buyer or seller)
- Users N:N Notifications (recipient relationship)

### 1.3 Companies

| Field | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | Unique company identifier |
| legal_name | VARCHAR(255) | NOT NULL | Registered legal name |
| trade_name | VARCHAR(255) | Nullable | Doing-business-as name |
| registration_number | VARCHAR(100) | UNIQUE, NOT NULL | Government registration number |
| tax_id | VARCHAR(100) | UNIQUE, Nullable | VAT/Tax identifier |
| country | VARCHAR(100) | NOT NULL | Country of incorporation |
| city | VARCHAR(100) | NOT NULL | City of operation |
| address | TEXT | NOT NULL | Full registered address |
| postal_code | VARCHAR(20) | Nullable | Postal/ZIP code |
| industry | VARCHAR(100) | NOT NULL | Primary industry sector |
| website | VARCHAR(255) | Nullable | Company website |
| year_established | SMALLINT | Nullable | Year founded |
| annual_volume_usd | DECIMAL(15,2) | Nullable | Self-reported annual trade volume |
| employee_count | ENUM | Nullable | 1-10, 11-50, 51-200, 201-500, 500+ |
| bank_account_iban | VARCHAR(34) | Nullable | Verified settlement account |
| bank_swift | VARCHAR(11) | Nullable | Bank SWIFT code |
| bank_name | VARCHAR(255) | Nullable | Bank name |
| kyc_status | ENUM | NOT NULL, default pending | pending, verified, rejected, expired |
| kyc_verified_at | TIMESTAMPTZ | Nullable | KYC approval timestamp |
| sanctions_screened | BOOLEAN | NOT NULL, default false | OFAC/EU/UN screening flag |
| sanctions_screened_at | TIMESTAMPTZ | Nullable | Last screening timestamp |
| created_at | TIMESTAMPTZ | NOT NULL, default now() | Record creation |
| updated_at | TIMESTAMPTZ | NOT NULL, default now() | Last update |

### 1.4 KYC_Verifications

| Field | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | Unique verification record |
| user_id | UUID | FK → Users(id), NOT NULL | Applicant |
| company_id | UUID | FK → Companies(id), NOT NULL | Applicant company |
| status | ENUM | NOT NULL, default submitted | submitted, in_review, approved, rejected, expired, re_requested |
| submitted_at | TIMESTAMPTZ | NOT NULL, default now() | Submission time |
| reviewed_at | TIMESTAMPTZ | Nullable | Review completion time |
| reviewed_by | UUID | FK → Users(id), Nullable | Reviewing admin/compliance officer |
| rejection_reason | TEXT | Nullable | Reason if rejected |
| document_type | ENUM | NOT NULL | passport, national_id, business_license, tax_certificate, bank_statement, articles_of_association, beneficial_ownership |
| document_url | VARCHAR(500) | NOT NULL | S3 URL to document |
| document_hash | VARCHAR(64) | NOT NULL | SHA-256 hash of document for integrity |
| verification_vendor | VARCHAR(50) | Nullable | Jumio, Onfido, Sumsub, or manual |
| vendor_reference | VARCHAR(255) | Nullable | External vendor reference ID |
| risk_level | ENUM | NOT NULL, default low | low, medium, high |
| next_review_date | DATE | Nullable | Scheduled re-verification |
| metadata | JSONB | Nullable | Vendor-specific raw data |

### 1.5 Categories

| Field | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | Unique category ID |
| parent_id | UUID | FK → Categories(id), Nullable | Parent category (null = root) |
| slug | VARCHAR(100) | UNIQUE, NOT NULL | URL-friendly identifier |
| name_translations | JSONB | NOT NULL | {"en": "Dates", "ar": "تمور", "fa": "خرما", "tr": "Hurma"} |
| description_translations | JSONB | Nullable | Localized descriptions |
| hs_code | VARCHAR(20) | Nullable | Harmonized System commodity code |
| image_url | VARCHAR(500) | Nullable | Category image |
| is_active | BOOLEAN | NOT NULL, default true | Visibility flag |
| sort_order | INTEGER | NOT NULL, default 0 | Display order |
| created_at | TIMESTAMPTZ | NOT NULL, default now() | Record creation |
| updated_at | TIMESTAMPTZ | NOT NULL, default now() | Last update |

[ASSUMPTION: A closure table `category_paths` is used for fast ancestor/descendant queries.]

### 1.6 Products

| Field | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | Unique product ID |
| seller_id | UUID | FK → Users(id), NOT NULL | Product owner |
| company_id | UUID | FK → Companies(id), NOT NULL | Owner company |
| category_id | UUID | FK → Categories(id), NOT NULL | Leaf category |
| name_translations | JSONB | NOT NULL | Multi-language product names |
| description_translations | JSONB | Nullable | Multi-language descriptions |
| specifications | JSONB | Nullable | Technical specs (moisture, grade, purity, etc.) |
| price | DECIMAL(15,4) | NOT NULL, CHECK > 0 | Unit price |
| price_currency | VARCHAR(3) | NOT NULL | ISO currency code |
| min_order_quantity | DECIMAL(12,4) | NOT NULL, CHECK > 0 | MOQ |
| available_quantity | DECIMAL(15,4) | NOT NULL, CHECK >= 0 | Stock level |
| unit | VARCHAR(20) | NOT NULL | ton, kg, m2, liter, piece, etc. |
| origin_country | VARCHAR(100) | NOT NULL | Country of origin |
| origin_city | VARCHAR(100) | Nullable | City/region of origin |
| incoterm | VARCHAR(10) | NOT NULL, default FOB | FOB, CIF, DDP, EXW, etc. |
| delivery_locations | JSONB | Nullable | Array of destination countries/cities |
| certification | JSONB | Nullable | ISO, SGS, Halal, etc. |
| images | JSONB | Nullable | Array of S3 image URLs |
| documents | JSONB | Nullable | COA, MSDS, phytosanitary certificates |
| is_active | BOOLEAN | NOT NULL, default true | Listing status |
| is_featured | BOOLEAN | NOT NULL, default false | Featured listing flag |
| ai_matchable | BOOLEAN | NOT NULL, default true | Whether AI can match this product |
| created_at | TIMESTAMPTZ | NOT NULL, default now() | Listing creation |
| updated_at | TIMESTAMPTZ | NOT NULL, default now() | Last update |
| expires_at | TIMESTAMPTZ | Nullable | Listing expiration |

### 1.7 Deal_Matches

| Field | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | Unique match record |
| product_id | UUID | FK → Products(id), NOT NULL | Seller product |
| buyer_id | UUID | FK → Users(id), NOT NULL | Buyer user |
| seller_id | UUID | FK → Users(id), NOT NULL | Seller user |
| buyer_demand_id | UUID | FK → Demands(id), Nullable | Matched buyer demand |
| match_score | DECIMAL(5,2) | NOT NULL, CHECK 0-100 | AI match score |
| price_score | DECIMAL(5,2) | Nullable | Sub-score for price alignment |
| location_score | DECIMAL(5,2) | Nullable | Sub-score for logistics proximity |
| reputation_score | DECIMAL(5,2) | Nullable | Sub-score for trust |
| urgency_score | DECIMAL(5,2) | Nullable | Sub-score for buyer urgency |
| category_score | DECIMAL(5,2) | Nullable | Sub-score for category match |
| model_version | VARCHAR(20) | Nullable | AI model version used |
| status | ENUM | NOT NULL, default active | active, converted_to_pre_deal, rejected, expired |
| created_at | TIMESTAMPTZ | NOT NULL, default now() | Match creation |
| expires_at | TIMESTAMPTZ | Nullable | Match validity |

### 1.8 Demands (Buyer Requests)

| Field | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | Unique demand ID |
| buyer_id | UUID | FK → Users(id), NOT NULL | Buyer user |
| company_id | UUID | FK → Companies(id), NOT NULL | Buyer company |
| category_id | UUID | FK → Categories(id), NOT NULL | Required category |
| product_name | VARCHAR(255) | NOT NULL | Desired product name |
| description | TEXT | Nullable | Additional requirements |
| quantity | DECIMAL(15,4) | NOT NULL, CHECK > 0 | Required quantity |
| unit | VARCHAR(20) | NOT NULL | Unit |
| budget_per_unit | DECIMAL(15,4) | NOT NULL, CHECK > 0 | Maximum budget per unit |
| budget_currency | VARCHAR(3) | NOT NULL | Budget currency |
| destination_country | VARCHAR(100) | NOT NULL | Delivery country |
| destination_city | VARCHAR(100) | Nullable | Delivery city |
| incoterm | VARCHAR(10) | Nullable | Preferred incoterm |
| urgency | SMALLINT | NOT NULL, CHECK 1-5 | 1 = low, 5 = critical |
| quality_requirements | JSONB | Nullable | Grade, certifications, etc. |
| is_active | BOOLEAN | NOT NULL, default true | Active search flag |
| created_at | TIMESTAMPTZ | NOT NULL, default now() | Creation |
| expires_at | TIMESTAMPTZ | Nullable | Demand expiration |

### 1.9 Pre_Deals

| Field | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | Unique pre-deal ID |
| match_id | UUID | FK → Deal_Matches(id), Nullable | Source match |
| product_id | UUID | FK → Products(id), NOT NULL | Seller product |
| seller_id | UUID | FK → Users(id), NOT NULL | Seller |
| buyer_id | UUID | FK → Users(id), NOT NULL | Buyer |
| suggested_price | DECIMAL(15,4) | NOT NULL | AI-suggested unit price |
| price_currency | VARCHAR(3) | NOT NULL | Deal currency |
| quantity | DECIMAL(15,4) | NOT NULL | Agreed quantity |
| unit | VARCHAR(20) | NOT NULL | Unit |
| total_value | DECIMAL(15,2) | NOT NULL | Computed total deal value |
| shipping_cost | DECIMAL(15,2) | Nullable | Estimated logistics cost |
| shipping_cost_currency | VARCHAR(3) | Nullable | Shipping currency |
| estimated_delivery_days | INTEGER | Nullable | Estimated transit days |
| payment_terms | ENUM | NOT NULL | L/C, D/P, Escrow, Card, Bank_Transfer |
| priority_level | SMALLINT | NOT NULL, CHECK 0-5 | 0 = low, 5 = highest |
| is_exclusive | BOOLEAN | NOT NULL, default false | Master-only exclusive flag |
| match_score | DECIMAL(5,2) | NOT NULL | Match score at creation |
| status | ENUM | NOT NULL, default pending | pending, accepted, rejected, expired, converted_to_order |
| seller_response | ENUM | Nullable | pending, accepted, rejected |
| buyer_response | ENUM | Nullable | pending, accepted, rejected |
| seller_responded_at | TIMESTAMPTZ | Nullable | Seller response timestamp |
| buyer_responded_at | TIMESTAMPTZ | Nullable | Buyer response timestamp |
| expires_at | TIMESTAMPTZ | NOT NULL | Pre-deal expiration |
| created_at | TIMESTAMPTZ | NOT NULL, default now() | Creation |
| created_by_model | VARCHAR(20) | Nullable | AI model version |

### 1.10 Orders

| Field | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | Unique order ID |
| pre_deal_id | UUID | FK → Pre_Deals(id), Nullable | Source pre-deal |
| buyer_id | UUID | FK → Users(id), NOT NULL | Buyer |
| seller_id | UUID | FK → Users(id), NOT NULL | Seller |
| buyer_company_id | UUID | FK → Companies(id), NOT NULL | Buyer company |
| seller_company_id | UUID | FK → Companies(id), NOT NULL | Seller company |
| order_number | VARCHAR(20) | UNIQUE, NOT NULL | Human-readable order number (e.g., TUR-2026-000123) |
| status | ENUM | NOT NULL, default pending | pending, confirmed, payment_pending, paid, in_transit, delivered, completed, cancelled, disputed |
| total_value | DECIMAL(15,2) | NOT NULL | Total order value |
| currency | VARCHAR(3) | NOT NULL | Settlement currency |
| payment_method | ENUM | NOT NULL | L/C, D/P, Escrow, Card, Bank_Transfer |
| payment_status | ENUM | NOT NULL | pending, partially_paid, paid, failed, refunded |
| shipping_status | ENUM | NOT NULL | pending, booked, in_transit, customs_hold, delivered, failed |
| incoterm | VARCHAR(10) | NOT NULL | Incoterm |
| origin_country | VARCHAR(100) | NOT NULL | Origin |
| destination_country | VARCHAR(100) | NOT NULL | Destination |
| created_at | TIMESTAMPTZ | NOT NULL, default now() | Order creation |
| updated_at | TIMESTAMPTZ | NOT NULL, default now() | Last update |
| completed_at | TIMESTAMPTZ | Nullable | Completion timestamp |

### 1.11 Order_Items

| Field | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | Unique item ID |
| order_id | UUID | FK → Orders(id), NOT NULL | Parent order |
| product_id | UUID | FK → Products(id), NOT NULL | Product |
| quantity | DECIMAL(15,4) | NOT NULL, CHECK > 0 | Quantity |
| unit | VARCHAR(20) | NOT NULL | Unit |
| unit_price | DECIMAL(15,4) | NOT NULL | Price per unit |
| total_price | DECIMAL(15,2) | NOT NULL | Line total |
| currency | VARCHAR(3) | NOT NULL | Currency |
| specifications | JSONB | Nullable | Agreed specs |
| fulfillment_status | ENUM | NOT NULL, default pending | pending, picked, packed, shipped, delivered, rejected |

### 1.12 Payments

| Field | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | Unique payment ID |
| order_id | UUID | FK → Orders(id), NOT NULL | Parent order |
| payer_id | UUID | FK → Users(id), NOT NULL | Payer |
| payee_id | UUID | FK → Users(id), NOT NULL | Payee |
| method | ENUM | NOT NULL | L/C, D/P, Escrow, Card, Bank_Transfer, Crypto |
| amount | DECIMAL(15,2) | NOT NULL | Payment amount |
| currency | VARCHAR(3) | NOT NULL | Payment currency |
| status | ENUM | NOT NULL, default pending | pending, authorized, captured, held, released, failed, refunded, chargeback |
| processor | VARCHAR(50) | Nullable | Stripe, PayPal, regional_bank, crypto_gateway |
| processor_transaction_id | VARCHAR(255) | Nullable | External transaction reference |
| lc_reference | VARCHAR(255) | Nullable | Letter of Credit reference number |
| escrow_release_condition | ENUM | Nullable | delivery_confirmed, dispute_timeout, manual_release |
| escrow_released_at | TIMESTAMPTZ | Nullable | Escrow release timestamp |
| metadata | JSONB | Nullable | Processor-specific raw data |
| created_at | TIMESTAMPTZ | NOT NULL, default now() | Payment creation |
| updated_at | TIMESTAMPTZ | NOT NULL, default now() | Last update |

### 1.13 Shipments

| Field | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | Unique shipment ID |
| order_id | UUID | FK → Orders(id), NOT NULL | Parent order |
| carrier_id | UUID | FK → Logistics_Carriers(id), Nullable | Carrier (nullable for buyer-arranged) |
| tracking_number | VARCHAR(100) | Nullable | Carrier tracking number |
| tracking_url | VARCHAR(500) | Nullable | Public tracking URL |
| status | ENUM | NOT NULL, default pending | pending, booked, picked_up, in_transit, customs_hold, out_for_delivery, delivered, failed, returned |
| origin_address | TEXT | NOT NULL | Pickup address |
| destination_address | TEXT | NOT NULL | Delivery address |
| incoterm | VARCHAR(10) | NOT NULL | Shipment incoterm |
| shipping_cost | DECIMAL(15,2) | NOT NULL | Cost |
| shipping_cost_currency | VARCHAR(3) | NOT NULL | Currency |
| estimated_pickup | TIMESTAMPTZ | Nullable | Estimated pickup |
| estimated_delivery | TIMESTAMPTZ | Nullable | Estimated delivery |
| actual_pickup | TIMESTAMPTZ | Nullable | Actual pickup |
| actual_delivery | TIMESTAMPTZ | Nullable | Actual delivery |
| customs_document_url | VARCHAR(500) | Nullable | Customs document link |
| insurance_amount | DECIMAL(15,2) | Nullable | Insured value |
| created_at | TIMESTAMPTZ | NOT NULL, default now() | Creation |
| updated_at | TIMESTAMPTZ | NOT NULL, default now() | Last update |

### 1.14 Shipment_Tracking_Events

| Field | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | Unique event ID |
| shipment_id | UUID | FK → Shipments(id), NOT NULL | Parent shipment |
| event_code | VARCHAR(50) | NOT NULL | Carrier event code |
| event_description | VARCHAR(255) | NOT NULL | Human-readable description |
| location | VARCHAR(255) | Nullable | Event location |
| occurred_at | TIMESTAMPTZ | NOT NULL | Event timestamp |
| received_at | TIMESTAMPTZ | NOT NULL, default now() | When platform received it |
| raw_payload | JSONB | Nullable | Carrier webhook payload |

### 1.15 Logistics_Carriers

| Field | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | Unique carrier ID |
| name | VARCHAR(100) | NOT NULL | Carrier name (DHL, Maersk, etc.) |
| code | VARCHAR(20) | UNIQUE, NOT NULL | Internal code |
| api_base_url | VARCHAR(255) | Nullable | API endpoint |
| api_auth_type | ENUM | Nullable | api_key, oauth2, basic |
| supported_countries | JSONB | Nullable | Array of ISO country codes |
| service_types | JSONB | Nullable | road, sea, air, rail |
| is_active | BOOLEAN | NOT NULL, default true | Active flag |

### 1.16 Master_Accounts

| Field | Type | Constraints | Description |
|---|---|---|------------|
| id | UUID | PK | Unique master account ID |
| user_id | UUID | FK → Users(id), NOT NULL | Owner |
| tier | ENUM | NOT NULL | bronze, silver, gold, platinum, black |
| status | ENUM | NOT NULL, default active | active, expired, cancelled, suspended, pending_payment |
| monthly_price | DECIMAL(10,2) | NOT NULL | Recurring price in USD |
| annual_price | DECIMAL(10,2) | NOT NULL | Annual price in USD |
| billing_cycle | ENUM | NOT NULL | monthly, annual |
| start_date | DATE | NOT NULL | Activation date |
| end_date | DATE | NOT NULL | Expiration date |
| auto_renew | BOOLEAN | NOT NULL, default true | Auto-renewal flag |
| payment_method_id | UUID | FK → Payment_Methods(id), Nullable | Stored payment method |
| commission_rate | DECIMAL(4,3) | NOT NULL | Tier-specific commission (e.g., 0.008 = 0.8%) |
| pre_deal_lead_hours | SMALLINT | NOT NULL | Hours earlier than standard access |
| max_active_listings | INTEGER | Nullable | Product listing cap (null = unlimited) |
| dedicated_manager | BOOLEAN | NOT NULL, default false | Dedicated account manager |
| advanced_analytics | BOOLEAN | NOT NULL, default false | Analytics access |
| exclusive_auction_access | BOOLEAN | NOT NULL, default false | Auction access |
| support_sla_hours | DECIMAL(4,2) | NOT NULL | Support response SLA |
| created_at | TIMESTAMPTZ | NOT NULL, default now() | Creation |
| updated_at | TIMESTAMPTZ | NOT NULL, default now() | Last update |

### 1.17 Subscriptions

| Field | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | Unique subscription record |
| master_account_id | UUID | FK → Master_Accounts(id), NOT NULL | Linked master account |
| user_id | UUID | FK → Users(id), NOT NULL | Subscriber |
| invoice_number | VARCHAR(50) | UNIQUE, NOT NULL | Invoice reference |
| amount | DECIMAL(10,2) | NOT NULL | Billed amount |
| currency | VARCHAR(3) | NOT NULL | Invoice currency |
| period_start | DATE | NOT NULL | Subscription period start |
| period_end | DATE | NOT NULL | Subscription period end |
| status | ENUM | NOT NULL | paid, pending, failed, refunded, cancelled |
| processor | VARCHAR(50) | Nullable | Stripe, etc. |
| processor_subscription_id | VARCHAR(255) | Nullable | External subscription ID |
| created_at | TIMESTAMPTZ | NOT NULL, default now() | Creation |
| paid_at | TIMESTAMPTZ | Nullable | Payment timestamp |

### 1.18 Payment_Methods

| Field | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | Unique payment method ID |
| user_id | UUID | FK → Users(id), NOT NULL | Owner |
| type | ENUM | NOT NULL | card, bank_account, crypto_wallet |
| provider | VARCHAR(50) | NOT NULL | stripe, etc. |
| token | VARCHAR(255) | NOT NULL | Encrypted token/reference |
| last_four | VARCHAR(4) | Nullable | Last four digits (cards) |
| expiry_month | SMALLINT | Nullable | Card expiry month |
| expiry_year | SMALLINT | Nullable | Card expiry year |
| is_default | BOOLEAN | NOT NULL, default false | Default method |
| is_active | BOOLEAN | NOT NULL, default true | Active flag |
| billing_address | JSONB | Nullable | Billing address |
| created_at | TIMESTAMPTZ | NOT NULL, default now() | Creation |

### 1.19 Notifications

| Field | Type | Constraints | Description |
|---|---|---|---|
| _id | ObjectId | PK | MongoDB primary key |
| user_id | UUID | Indexed | Recipient |
| type | ENUM | NOT NULL | pre_deal_alert, order_update, payment_received, shipment_update, dispute_opened, kyc_status, subscription_renewal, system |
| title | VARCHAR(255) | NOT NULL | Notification title |
| body | TEXT | NOT NULL | Notification body |
| metadata | JSONB | Nullable | Related entity IDs |
| channels_sent | JSONB | NOT NULL | {push: true, email: true, sms: false, in_app: true} |
| priority | SMALLINT | NOT NULL | 0-5 |
| is_read | BOOLEAN | NOT NULL, default false | Read flag |
| read_at | TIMESTAMPTZ | Nullable | Read timestamp |
| created_at | TIMESTAMPTZ | NOT NULL, default now() | Creation |
| expires_at | TIMESTAMPTZ | Nullable | Notification expiry |

### 1.20 Reviews_Ratings

| Field | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | Unique review ID |
| order_id | UUID | FK → Orders(id), NOT NULL | Related order |
| reviewer_id | UUID | FK → Users(id), NOT NULL | Reviewer |
| reviewee_id | UUID | FK → Users(id), NOT NULL | Reviewed party |
| role | ENUM | NOT NULL | buyer_reviewing_seller, seller_reviewing_buyer |
| rating | SMALLINT | NOT NULL, CHECK 1-5 | Star rating |
| title | VARCHAR(255) | Nullable | Review title |
| comment | TEXT | Nullable | Review text |
| categories | JSONB | Nullable | Timeliness, quality, communication, documentation |
| is_verified | BOOLEAN | NOT NULL, default true | Verified transaction flag |
| is_public | BOOLEAN | NOT NULL, default true | Visibility |
| created_at | TIMESTAMPTZ | NOT NULL, default now() | Creation |

### 1.21 Trust_Scores

| Field | Type | Constraints | Description |
|---|---|---|------------|
| id | UUID | PK | Unique score record |
| user_id | UUID | FK → Users(id), UNIQUE, NOT NULL | Owner |
| score | DECIMAL(5,2) | NOT NULL, CHECK 0-100 | Composite trust score |
| on_time_delivery | DECIMAL(5,2) | Nullable | Sub-score |
| dispute_rate | DECIMAL(5,2) | Nullable | Sub-score |
| response_time_score | DECIMAL(5,2) | Nullable | Sub-score |
| deal_volume_score | DECIMAL(5,2) | Nullable | Sub-score |
| review_score | DECIMAL(5,2) | Nullable | Sub-score |
| total_completed_deals | INTEGER | NOT NULL, default 0 | Deal count |
| total_disputes | INTEGER | NOT NULL, default 0 | Dispute count |
| calculation_date | TIMESTAMPTZ | NOT NULL | Last calculation |
| model_version | VARCHAR(20) | Nullable | Scoring algorithm version |

### 1.22 Disputes

| Field | Type | Constraints | Description |
|---|---|---|------------|
| id | UUID | PK | Unique dispute ID |
| order_id | UUID | FK → Orders(id), NOT NULL | Related order |
| initiator_id | UUID | FK → Users(id), NOT NULL | Dispute opener |
| respondent_id | UUID | FK → Users(id), NOT NULL | Other party |
| dispute_type | ENUM | NOT NULL | quality_mismatch, quantity_mismatch, late_delivery, non_delivery, payment_issue, documentation_issue, other |
| status | ENUM | NOT NULL, default open | open, under_review, evidence_period, resolved_buyer_favor, resolved_seller_favor, resolved_split, closed_no_action, appealed |
| claim_amount | DECIMAL(15,2) | Nullable | Claimed amount |
| claim_currency | VARCHAR(3) | Nullable | Claim currency |
| description | TEXT | NOT NULL | Initial dispute description |
| requested_resolution | ENUM | NOT NULL | refund, partial_refund, replacement, compensation, other |
| resolution_amount | DECIMAL(15,2) | Nullable | Resolved amount |
| resolution_notes | TEXT | Nullable | Resolution notes |
| resolved_by | UUID | FK → Users(id), Nullable | Resolver admin |
| resolved_at | TIMESTAMPTZ | Nullable | Resolution timestamp |
| evidence_deadline | TIMESTAMPTZ | NOT NULL | Evidence submission deadline |
| created_at | TIMESTAMPTZ | NOT NULL, default now() | Creation |
| updated_at | TIMESTAMPTZ | NOT NULL, default now() | Last update |

### 1.23 Dispute_Messages

| Field | Type | Constraints | Description |
|---|---|---|------------|
| id | UUID | PK | Unique message ID |
| dispute_id | UUID | FK → Disputes(id), NOT NULL | Parent dispute |
| sender_id | UUID | FK → Users(id), NOT NULL | Sender |
| sender_role | ENUM | NOT NULL | buyer, seller, admin, system |
| message | TEXT | NOT NULL | Message content |
| attachments | JSONB | Nullable | S3 URLs |
| is_internal | BOOLEAN | NOT NULL, default false | Internal admin note |
| created_at | TIMESTAMPTZ | NOT NULL, default now() | Timestamp |

### 1.24 Translations

| Field | Type | Constraints | Description |
|---|---|---|------------|
| id | UUID | PK | Unique translation record |
| entity_type | VARCHAR(50) | NOT NULL | product, category, page, notification, legal |
| entity_id | UUID | Nullable | Linked entity ID (if applicable) |
| field_name | VARCHAR(50) | NOT NULL | name, description, title, body, etc. |
| language_code | VARCHAR(10) | NOT NULL | ISO code |
| source_text | TEXT | NOT NULL | Original text |
| translated_text | TEXT | Nullable | Translated text (nullable if machine-pending) |
| translation_source | ENUM | NOT NULL | manual, machine, community, agency |
| status | ENUM | NOT NULL, default pending | pending, approved, rejected, auto |
| reviewed_by | UUID | FK → Users(id), Nullable | Human reviewer |
| created_at | TIMESTAMPTZ | NOT NULL, default now() | Creation |
| updated_at | TIMESTAMPTZ | NOT NULL, default now() | Last update |

### 1.25 Audit_Logs

| Field | Type | Constraints | Description |
|---|---|---|------------|
| _id | ObjectId | PK | MongoDB primary key |
| timestamp | TIMESTAMPTZ | NOT NULL, indexed | Event timestamp |
| actor_id | UUID | Nullable | User who performed action (null = system) |
| actor_role | VARCHAR(50) | Nullable | buyer, seller, admin, system, ai |
| action | VARCHAR(100) | NOT NULL | e.g., pre_deal_created, order_status_changed, payment_released |
| entity_type | VARCHAR(50) | NOT NULL | user, order, payment, pre_deal, dispute |
| entity_id | UUID | Nullable | Affected entity ID |
| ip_address | INET | Nullable | Client IP |
| user_agent | TEXT | Nullable | Client user agent |
| before_state | JSONB | Nullable | Previous state snapshot |
| after_state | JSONB | Nullable | New state snapshot |
| severity | ENUM | NOT NULL | info, warning, critical |
| metadata | JSONB | Nullable | Additional context |

### 1.26 Relationships Summary

| Relationship | Cardinality | Implementation |
|---|---|---|
| Users ↔ Companies | N:1 | Users.company_id |
| Users ↔ KYC_Verifications | 1:N | KYC_Verifications.user_id |
| Companies ↔ Products | 1:N | Products.company_id |
| Categories ↔ Categories | 1:N (tree) | Categories.parent_id + closure table |
| Products ↔ Categories | N:1 | Products.category_id |
| Users ↔ Products | 1:N | Products.seller_id |
| Products ↔ Deal_Matches | 1:N | Deal_Matches.product_id |
| Users ↔ Deal_Matches | 1:N (as buyer/seller) | Deal_Matches.buyer_id, seller_id |
| Deal_Matches ↔ Pre_Deals | 1:0-1 | Pre_Deals.match_id |
| Users ↔ Pre_Deals | 1:N (as buyer/seller) | Pre_Deals.buyer_id, seller_id |
| Pre_Deals ↔ Orders | 1:0-1 | Orders.pre_deal_id |
| Orders ↔ Order_Items | 1:N | Order_Items.order_id |
| Orders ↔ Payments | 1:N | Payments.order_id |
| Orders ↔ Shipments | 1:0-1 | Shipments.order_id |
| Shipments ↔ Shipment_Tracking_Events | 1:N | Shipment_Tracking_Events.shipment_id |
| Users ↔ Master_Accounts | 1:1 active | Users.master_account_id |
| Master_Accounts ↔ Subscriptions | 1:N | Subscriptions.master_account_id |
| Users ↔ Notifications | 1:N | Notifications.user_id |
| Users ↔ Reviews_Ratings | 1:N (as reviewer/reviewee) | Reviews_Ratings.reviewer_id, reviewee_id |
| Users ↔ Trust_Scores | 1:1 | Users.trust_score_id |
| Orders ↔ Disputes | 1:0-N | Disputes.order_id |
| Disputes ↔ Dispute_Messages | 1:N | Dispute_Messages.dispute_id |
| Users ↔ Payment_Methods | 1:N | Payment_Methods.user_id |

---

## TASK 2 — AI/ML SYSTEM SPECIFICATION

[ASSUMPTION: The ML pipeline runs as a separate microservice (AI/ML Service) and reads/writes via the main API. Models are versioned and deployed behind feature flags.]

### 2a. Matching Algorithm (FR-004)

#### Input Features

| Feature Group | Features | Data Type | Source |
|---|---|---|---|
| Product | category_id, origin_country, origin_city, unit, available_quantity, incoterm, certifications, price_per_unit | Categorical / Numerical | Product Catalog Service |
| Demand | category_id, destination_country, destination_city, required_quantity, unit, budget_per_unit, incoterm, quality_requirements, urgency | Categorical / Numerical | Demand records |
| Seller | country, city, trust_score, completed_deals, dispute_rate, response_time_hours, on_time_delivery_rate, years_on_platform | Numerical | User/Trust service |
| Buyer | country, city, trust_score, completed_deals, payment_reliability, response_time_hours, years_on_platform | Numerical | User/Trust service |
| Logistics | distance_km, route_complexity, customs_difficulty, carrier_availability, estimated_cost | Numerical | Shipping/Logistics service |
| Market | commodity_price_index, seasonality_index, demand_pressure | Numerical | External market data |
| Temporal | listing_age_days, demand_age_days, expiry_proximity | Numerical | Computed |
| Currency | price_currency, budget_currency, fx_rate | Numerical | FX service |

#### Model Recommendation

**Hybrid Two-Stage Model:**

1. **Stage 1 — Candidate Generation (Content-Based Filtering):**  
   Hard filters + light GBM classifier to reduce the candidate pool from all products to top 50 per demand. Uses category match, origin↔destination compatibility, incoterm fit, and quantity availability as primary filters.

2. **Stage 2 — Ranking (Neural Collaborative Filtering):**  
   A neural network (TensorFlow/PyTorch) learns embeddings for users and products. It scores the top 50 candidates and produces a match score (0-100). Combines:
   - User-product interaction history
   - Explicit profile features
   - Contextual features (urgency, logistics, seasonality)

**Justification:** Pure collaborative filtering fails for new users/products. Pure content-based filtering misses latent preferences. Hybrid balances both. B2B trade has sparse but high-value interactions, so candidate generation + ranking is more efficient than brute-force scoring.

#### Cold-Start Strategy

| User/Product Type | Strategy |
|---|---|
| New buyer | Use their declared demand features and match against content-similar products. Use company industry, country, and demand text to infer preferences. |
| New seller | Use product features and promote to buyers with matching demand categories/destinations. Initial ranking penalty: score is capped at 75 until first transaction. |
| New category | Fall back to category hierarchy similarity (parent category embeddings). |
| New product | Use seller's trust score and product category similarity. Price competitiveness bonus if within ±10% of market median. |
| New platform (Month 1-2) | Rule-based matching (see 2d Cold-start Plan). |

#### Training Data

| Source | Data Type | Minimum Required |
|---|---|---|
| Historical successful deals (accepted pre-deals → orders) | Positive labels | 500+ deals |
| Rejected pre-deals | Negative labels | 1,000+ samples |
| Buyer-seller interactions | Impressions, clicks, inquiries | 5,000+ events |
| Product metadata | Content features | 300+ products across 10+ categories |
| Demand records | Content features | 200+ demands |
| Market price data | External features | 12 months of weekly data per commodity |

**Minimum dataset before launch:** 1,000 labeled match outcomes (accept/reject) with feature coverage across all target categories.  
**Before reaching threshold:** Use rule-based fallback (2d).

#### Accuracy KPIs

| Metric | Definition | Minimum Threshold | Target |
|---|---|---|---|
| Precision@5 | Of top 5 scored matches, % accepted | 25% | 45% |
| Recall@20 | Of all accepted matches, % in top 20 | 40% | 70% |
| NDCG@10 | Ranking quality | 0.35 | 0.60 |
| Conversion rate | Pre-deals accepted / pre-deals generated | 15% | 30% |

**Go-live threshold:** Precision@5 ≥ 25% AND recall@20 ≥ 40% on a held-out validation set. Below threshold, deploy with manual review of all high-value pre-deals.

#### Retraining Schedule

| Trigger | Action |
|---|---|
| Scheduled | Weekly full retraining every Sunday 02:00 UTC using prior 90 days of data. |
| Data volume | Retrain immediately when 500+ new labeled interactions accumulate. |
| Performance degradation | If Precision@5 drops below 20% for 3 consecutive days, trigger emergency retraining. |
| New category launch | Retrain with category-specific data augmentation. |
| Model drift | Monitor feature distribution drift via KL divergence; retrain if drift > 0.1. |

### 2b. Price Prediction (FR-005)

#### Input Features

| Feature | Description |
|---|---|
| commodity_type | Category + HS code |
| origin_country / origin_city | Supply-side location |
| destination_country / destination_city | Demand-side location |
| season | Month/quarter; Ramadan, harvest cycles, new year demand |
| global_price_index | UN Comtrade / World Bank median price |
| historical_deal_prices | Last 12-24 months of platform deals |
| fx_rate | Origin/destination currency pair vs USD |
| logistics_cost_index | Route-specific freight index |
| supply_shock_indicators | Weather, geopolitical events, sanctions changes (one-hot encoded) |
| quality_grade | Product grade/specification |
| incoterm | FOB/CIF/DDP etc. |
| volume | Transaction size |

#### Model Type

**Primary:** LSTM neural network for time-series forecasting.  
**Why:** Commodity prices are sequential and autocorrelated. LSTM captures long-term seasonality and short-term shocks.  
**Secondary ensemble:** XGBoost regressor trained on tabular features (route, grade, incoterm) to capture non-sequential interactions.  
**Final output:** Weighted average of LSTM and XGBoost predictions, with confidence interval derived from ensemble variance.

#### External Data APIs

| Source | API | Data |
|---|---|---|
| UN Comtrade | `https://comtrade.un.org/api/` | Historical trade volumes and prices by HS code |
| World Bank Commodity Prices | `https://api.worldbank.org/v2/commodity` | Commodity price indices |
| FAO | FAOSTAT API | Agricultural commodity data |
| IMF Primary Commodity Prices | IMF API | Global commodity price indices |
| Freightos Baltic Index | Freightos API | Container freight rates |
| Central Bank of Turkey | CBRT EVDS API | TRY exchange rates and interest rates |
| Central Bank of Iraq | CBI daily rates | IQD rates |

[ASSUMPTION: Fallback to cached data if APIs are unavailable. Cache refreshed daily.]

#### Confidence Interval Output

```json
{
  "predicted_price": 215.50,
  "currency": "USD",
  "unit": "ton",
  "confidence_interval": {
    "lower": 198.20,
    "upper": 232.80,
    "confidence_level": 0.95
  },
  "confidence_score": 0.72,
  "model_version": "price_lstm_v2.3",
  "forecast_date": "2026-06-18"
}
```

#### Fallback When Confidence < Threshold

| Confidence Score | Action |
|---|---|
| ≥ 0.70 | Use AI predicted price as suggested price. |
| 0.50 – 0.69 | Use predicted price as a range midpoint; widen the suggested price range by ±10%. |
| 0.30 – 0.49 | Use the 30-day historical median of the same commodity/route. Flag for manual review. |
| < 0.30 | Do not generate pre-deal. Return to seller with market context and request manual pricing. |

### 2c. Demand Analysis (FR-006)

#### Signals Used

| Signal | Source | Weight |
|---|---|---|
| Search frequency | Search service logs | 25% |
| Inquiry volume | Messages and demand submissions | 25% |
| Pre-deal acceptance rate | Deal service | 20% |
| Seasonal patterns | Historical demand by month/quarter | 15% |
| Macro indicators | FX rates, commodity prices, GDP proxies | 10% |
| External trade data | UN Comtrade import/export trends | 5% |

#### Output Format

```json
{
  "commodity": "dates",
  "category_id": "uuid",
  "destination_market": "Turkey",
  "forecast_period": "30d",
  "demand_index": 128.5,
  "change_vs_last_period": "+12.4%",
  "confidence": 0.78,
  "trend": "rising",
  "seasonal_factor": "high",
  "top_buyer_segments": ["food_processor", "retail_chain"],
  "recommended_actions": ["increase_listings", "target_istanbul_region"],
  "last_updated": "2026-06-18T00:00:00Z"
}
```

#### Update Frequency

- **Demand index dashboard:** Daily refresh at 06:00 UTC.
- **Weekly reports:** Generated every Monday.
- **Monthly deep-dive reports:** First business day of the month.
- **Real-time alerts:** Triggered when demand index moves >20% in 24 hours.

### 2d. Cold-Start Plan

#### Months 1-2 (Before Sufficient Data)

| Phase | Action |
|---|---|
| Data collection | Require sellers to complete detailed product forms. Require buyers to submit structured demands. Capture every inquiry and click. |
| Rule-based matching | Use deterministic rules: category match + quantity fit + incoterm compatibility + destination within seller's listed regions. |
| Human curation | Operations team reviews every pre-deal before sending to buyers. Curation queue SLA: 4 hours during business days. |
| Pricing fallback | Use seller's listed price; do not apply AI price prediction until 30+ historical price points exist. |
| Manual demand reports | Use external data (UN Comtrade, FAO) and manual market research until platform signals are sufficient. |
| Incentivize data | Offer reduced commission for first 10 transactions in exchange for structured feedback and reviews. |

#### Rule-Based Fallback Logic

```
IF product.category == demand.category
AND product.available_quantity >= demand.quantity
AND product.price <= demand.budget_per_unit * 1.10
AND product.delivery_locations CONTAINS demand.destination_country
AND seller.kyc_status == verified
AND seller.sanctions_screened == true
THEN generate_candidate_match(score = 60 + price_alignment_bonus + trust_bonus)
```

#### Manual Curation Process

1. AI/rule engine generates candidate match.
2. Operations analyst reviews product, demand, and seller/buyer profiles.
3. Analyst adjusts suggested price, quantity, and payment terms if needed.
4. Analyst approves or rejects the pre-deal.
5. If approved, system sends notification to buyer with priority based on tier.
6. Curation decisions are logged and used as training data.

---

## TASK 3 — LEGAL & SANCTIONS COMPLIANCE DOCUMENT

[LEGAL REVIEW REQUIRED: All sanctions and legal strategies described below must be reviewed and approved by qualified international trade counsel before implementation.]

### 3a. Iran Sanctions Strategy

#### Applicable Sanction Regimes

| Regime | Jurisdiction | Key Scope |
|---|---|---|
| OFAC SDN List | United States | Prohibits dealings with designated persons/entities. Secondary sanctions risk for non-US persons doing business with Iran. |
| OFAC Iranian Transactions and Sanctions Regulations (ITSR) | United States | Prohibits most US-origin goods/services to Iran; limited general licenses for food, medicine, medical devices. |
| EU Regulation 267/2012 | European Union | Restricts trade with Iran in certain sectors (dual-use, oil, gas, financial messaging). |
| UN Security Council Resolutions | United Nations | Arms embargo and related restrictions. |
| UK Iran Sanctions | United Kingdom | Aligns largely with EU/OFAC. |
| Turkish National Measures | Turkey | Implementing UN/UNSCR; additional national restrictions. |

#### Recommended Legal Structure

[ASSUMPTION: Platform is incorporated as a UAE entity (DIFC or ADGM) to access regional markets while maintaining a neutral jurisdiction.]

| Element | Recommendation |
|---|---|
| Operating entity | UAE free-zone company (DIFC/ADGM) with UAE-resident compliance officer. |
| Iranian market access | Use a non-US, non-EU operating subsidiary if direct Iran services are required, or serve Iranian users via a regionally licensed partner. |
| Permitted trade focus | Limit platform-facilitated Iranian-origin transactions to categories covered by general licenses: food, agricultural products, medicine, medical devices, and humanitarian goods. |
| Prohibited goods | Block listings for oil/petroleum products, precious metals, dual-use goods, arms, and any HS codes under sectoral sanctions. |
| Banking | Use regional banks (e.g., UAE-based) with robust sanctions compliance programs. Avoid USD-clearing for Iran-origin transactions. |
| Legal counsel | Retain US sanctions counsel + EU sanctions counsel + local UAE/Turkey/Iraq counsel. |

#### Prohibited Transaction Categories

- Petroleum, petroleum products, and petrochemicals from Iran (unless specifically licensed).
- Gold, precious metals, and Iranian-origin bank notes.
- Dual-use items, military/defense goods, and nuclear-related items.
- Financial services to/from Iranian banks on the SDN list.
- Transactions involving any party on OFAC SDN, EU sanctions, or UN sanctions lists.
- Re-export of US-origin goods to Iran.
- Any transaction involving the Iranian government, IRGC, or designated entities.

#### Permitted Trade Categories (Under General Licenses / Humanitarian Exceptions)

| Category | Examples | Conditions |
|---|---|---|
| Food and agricultural products | Dates, grains, nuts, dairy, meat | Must not involve sanctioned parties. Payments must avoid SDN banks. |
| Medicine and medical devices | Pharmaceuticals, devices | Requires compliance with medicine-specific regulations. |
| Personal communications | Certain software/hardware | Limited scope; review required. |
| Humanitarian donations | NGO-registered aid | Notarized donation documentation required. |

#### Compliance Officer Role and Responsibilities

| Responsibility | Details |
|---|---|
| Sanctions screening | Screen all users, companies, products, counterparties, banks, and ports against OFAC SDN, EU, UN, and HMT lists. |
| Prohibited goods policy | Maintain and enforce HS-code blocklist. Review new category requests. |
| Transaction monitoring | Flag transactions above thresholds, unusual routing, or involving high-risk jurisdictions. |
| KYC/AML oversight | Approve/reject KYC, manage vendor relationships, and ensure ongoing monitoring. |
| Regulatory reporting | File suspicious activity reports (SARs) to relevant authorities. |
| Training | Conduct quarterly sanctions training for all customer-facing and operations staff. |
| Record keeping | Maintain 7-year audit trail of all compliance decisions. |
| Incident response | Lead breach investigations and liaise with external counsel. |

### 3b. KYC/AML Flow

#### Seller Onboarding

| Step | Action | SLA |
|---|---|---|
| 1. Registration | Email/phone verification, password creation, role selection. | Instant |
| 2. Company profile | Legal name, registration number, tax ID, address, industry, website. | 5 minutes |
| 3. Identity upload | Upload passport/national ID of authorized representative. | 10 minutes |
| 4. Business docs | Upload business license, articles of association, tax certificate, bank statement. | 24 hours |
| 5. Sanctions screening | Automated screening against SDN/EU/UN lists. | Real-time |
| 6. Vendor verification | Jumio/Onfido/Sumsub document liveness and business verification. | 1-3 business days |
| 7. Compliance review | Manual review for high-risk countries (Iran, high-risk Iraq regions). | 2-5 business days |
| 8. Approval / rejection | Email notification with status and next steps. | Same day as review |

#### Buyer Onboarding

| Step | Action | SLA |
|---|---|---|
| 1. Registration | Email/phone verification, role selection. | Instant |
| 2. Company profile | Legal name, registration number, tax ID, address, industry. | 5 minutes |
| 3. Identity upload | Passport/national ID of authorized representative. | 10 minutes |
| 4. Business docs | Business license, tax certificate, bank statement. | 24 hours |
| 5. Sanctions screening | Automated screening. | Real-time |
| 6. Vendor verification | Document and business verification. | 1-3 business days |
| 7. Approval | Buyers may browse; trading requires KYC approval. | Same day as review |

#### Required Documents by Country

| Country | Individuals | Companies | Additional |
|---|---|---|---|
| Iraq | Passport or national ID; proof of address | Commercial registry, tax certificate, articles of association | Ministry of Trade registration for exporters. |
| Iran | Passport; national ID | Business license (Shenasnameh), tax ID, articles of association | Bank statement; sanctions-screened domestic bank. |
| Turkey | Turkish ID or passport | Ticaret Sicil Gazetesi, Mersis number, tax certificate, signature circular | Chamber of commerce certificate. |
| EU | Passport or national ID; proof of address | Commercial registry extract, VAT number, articles of association | UBO declaration. |
| Other | Passport + proof of address | Equivalent local registration documents | Case-by-case review. |

#### Verification Vendor Options

| Vendor | Strengths | Best For |
|---|---|---|
| Jumio | Global ID verification, liveness, AML checks | North America/Europe |
| Onfido | Strong AI document checks, sandbox friendly | UK/EU/Asia |
| Sumsub | Strong in emerging markets, MENA, Russia/CIS, Turkey, Iran-adjacent | Iraq, Turkey, Iran, UAE |
| Trulioo | Global identity verification, business verification | Multi-region B2B |

[ASSUMPTION: Sumsub is recommended as primary vendor for MENA/Turkey coverage.]

#### Rejection Criteria and Appeals

| Rejection Reason | Appeal Process |
|---|---|
| Document unclear | User can resubmit with clearer documents. 2 retries allowed. |
| Business not registered | User must register legally and reapply. |
| Sanctions match | User can provide evidence of false positive; compliance officer reviews within 5 business days. |
| High-risk jurisdiction | User can provide additional documentation; escalated to senior compliance officer. |
| Fraud indicators | Permanent ban; no appeal. |

#### Ongoing Monitoring Triggers

| Trigger | Action |
|---|---|
| Transaction velocity >3x baseline | Generate compliance alert; review deal chain. |
| Payment to/from newly listed SDN entity | Block transaction; freeze pending funds; report. |
| Shipping route diversion | Flag for investigation; request delivery proof. |
| Negative news / adverse media | Rescreen entity and review active deals. |
| KYC expiry | Prompt re-verification before next deal. |
| Chargeback or dispute rate >10% | Restrict account; require enhanced due diligence. |

### 3c. Data Jurisdiction

| Region | Storage Location | Rationale |
|---|---|---|
| EU users | AWS Frankfurt (eu-central-1) or GCP Belgium | GDPR compliance, data residency. |
| Iraq users | AWS Frankfurt or UAE (me-central-1) | No strict Iraqi data-localization law, but regional proximity and UAE neutrality. |
| Iran users | UAE (me-central-1) | Avoid US/EU data centers for Iranian data; UAE is a neutral financial hub. |
| Turkey users | AWS Frankfurt or AWS Istanbul (eu-south-1) | Turkey KVKK compliance; regional proximity. |
| Global users | Nearest region with GDPR/SCC compliance | AWS CloudFront + regional RDS. |

#### Cross-Border Transfer Mechanisms

| Mechanism | Use Case |
|---|---|
| Standard Contractual Clauses (SCCs) | EU user data to UAE or other third countries. |
| Adequacy decisions | If EU grants adequacy to UAE in future. |
| Data Processing Agreements (DPAs) | With all subprocessors (AWS, Stripe, Jumio, etc.). |
| Regional data segregation | Iranian user data physically separated from EU/US data where possible. |

[LEGAL REVIEW REQUIRED: Cross-border data transfer strategy for Iranian user data must be confirmed with sanctions counsel.]

### 3d. Payment Processor Constraints

#### Processor Availability by Market

| Processor | Iran | Iraq | Turkey | EU/US | Notes |
|---|---|---|---|---|---|
| Stripe | No | Limited (Stripe may not support IQD) | Yes | Yes | No Iran; limited Iraq support. |
| PayPal | No | No | Yes | Yes | No Iran; no Iraq. |
| Adyen | No | Limited | Yes | Yes | Limited Iran/Iraq. |
| Checkout.com | No | Limited | Yes | Yes | Limited Iran/Iraq. |
| Regional Turkish banks (Kuveytturk, Ziraat) | No | No | Yes | No | TRY transactions, Islamic finance options. |
| Regional Iraqi banks | No | Yes | No | No | IQD transactions, local settlement. |
| UAE-based payment processors | No | Yes | Yes | Yes | Neutral hub for cross-border settlements. |
| Cryptocurrency | [LEGAL REVIEW REQUIRED] | No | Limited | Varies | Not recommended for Iran-origin due to sanctions complexity. |

#### Recommended Payment Architecture

| Scenario | Solution |
|---|---|
| Turkey ↔ Iraq | Stripe or UAE processor for USD settlement; local bank for TRY/IQD payout. |
| Turkey ↔ Iran | [LEGAL REVIEW REQUIRED] Regional bank or licensed partner; USD avoided; settlement via non-USD trade finance. |
| Iraq ↔ EU | Stripe/Adyen for USD/EUR; Iraqi bank for IQD payout. |
| Platform commission | Collected via Stripe (for Turkey/EU) or UAE processor (for Iraq/Iran). |

#### Escrow Provider Options

| Provider | Coverage | Notes |
|---|---|---|
| Payoneer Escrow | Global except sanctioned | Not for Iran. |
| Trustly/OpenPayd | EU/UK/Turkey | Strong for B2B. |
| UAE-based escrow/trust accounts | MENA, Iraq, Turkey | Neutral jurisdiction. |
| Platform self-managed escrow | All markets | Requires licensing as a payment institution or e-money issuer in operating jurisdiction. |

[LEGAL REVIEW REQUIRED: Platform-managed escrow requires payment institution license in UAE or operating jurisdiction.]

---

## TASK 4 — COMPLETE SYSTEM ARCHITECTURE

[ASSUMPTION: Kubernetes (EKS) on AWS is the primary runtime. Services are containerized. PostgreSQL via RDS, MongoDB via Atlas, Redis via ElastiCache, Kafka/MSK for events.]

### 4a. Service Decomposition

| Service | Responsibility | Tech Stack | Database Owned | APIs Exposed | Depends On |
|---|---|---|---|---|---|
| **API Gateway** | Routing, auth, rate limiting, WAF, request transformation | Kong / AWS API Gateway | None | All external routes | Auth Service, Rate Limiting (Redis) |
| **Auth Service** | Registration, login, MFA, JWT issuance, session management, password reset | Django + Django REST Framework | PostgreSQL (users, sessions, MFA) | POST /auth/register, /auth/login, /auth/refresh, /auth/mfa/verify, /auth/password-reset | User Service, Notification Service |
| **User/Company Service** | User profiles, companies, KYC orchestration, roles | FastAPI | PostgreSQL (users, companies, kyc_verifications) | GET/PUT /users/{id}, /companies/{id}, /kyc, /users/search | Auth Service, Audit Service, Notification Service |
| **Product Catalog Service** | Product CRUD, categories, images, search index, multi-language fields | FastAPI + Elasticsearch client | PostgreSQL (products, categories), Elasticsearch index | GET/POST /products, /categories, /products/search, /products/{id} | Translation Service, Search Service, Audit Service |
| **AI/ML Service** | Pre-deal matching, price prediction, demand analysis, model training/inference | Python + FastAPI + TensorFlow/PyTorch + MLflow | PostgreSQL (read-only), model artifacts in S3 | POST /match/predict, /price/predict, /demand/forecast, /train | Product Catalog, Deal Service, User Service, Market Data APIs |
| **Deal & Order Service** | Pre-deal lifecycle, order creation, status management, deal matches | FastAPI | PostgreSQL (pre_deals, orders, order_items, deal_matches) | GET/POST /pre-deals, /orders, /deals/{id}/accept, /deals/{id}/reject | AI/ML Service, Payment Service, Shipping Service, Notification Service, Master Account Service |
| **Payment Service** | Payment processing, escrow, L/D coordination, refunds, commission calculation | FastAPI + Stripe SDK + regional bank APIs | PostgreSQL (payments, payment_methods, subscriptions) | POST /payments/process, /payments/escrow/release, /payments/refund, /invoices | Order Service, User Service, Notification Service, Audit Service |
| **Shipping & Logistics Service** | Shipping quotes, booking, tracking, customs docs, carrier integration | FastAPI + DHL/Maersk APIs | PostgreSQL (shipments, shipment_tracking_events, logistics_carriers) | POST /shipments/quote, /shipments/book, /shipments/{id}/track | Order Service, Notification Service, External Carrier APIs |
| **Notification Service** | Push, email, SMS, in-app notifications, preference management, delivery retry | FastAPI + Firebase + SendGrid + Twilio | MongoDB (notifications), Redis (queues) | POST /notifications/send, /notifications/preferences, /notifications/{id}/read | User Service, Master Account Service |
| **Search Service** | Product/demand indexing, full-text search, faceted filters, autocomplete | Elasticsearch / OpenSearch | Elasticsearch indices | POST /search/products, /search/demands, /suggest | Product Catalog Service, Demand records |
| **Reputation & Trust Service** | Trust score calculation, review aggregation, score history, ranking signals | FastAPI | PostgreSQL (trust_scores, reviews_ratings) | GET /trust/{user_id}, /reviews, POST /reviews | Order Service, Deal Service, User Service |
| **Master Account & Billing Service** | Tier management, subscriptions, billing, renewals, upgrade/downgrade logic, feature gates | FastAPI + Stripe Billing | PostgreSQL (master_accounts, subscriptions) | POST /master/upgrade, /master/cancel, /master/renew, GET /master/features | Payment Service, User Service, Notification Service |
| **Translation Service** | Machine translation (DeepL/Google), translation storage, glossary, RTL detection | FastAPI + DeepL API + Google Translate API | PostgreSQL + MongoDB (translations) | POST /translate, /translations/{lang}, /glossary | None |
| **Admin & Reporting Service** | Admin dashboards, user management, KYC queue, dispute queue, analytics reports | Django + React Admin | PostgreSQL (read-only views), MongoDB | GET /admin/users, /admin/kyc-queue, /admin/disputes, /admin/reports | All services |
| **Audit & Compliance Service** | Audit logging, sanctions screening, compliance rule engine, alerts | FastAPI + OFAC/EU API clients | MongoDB (audit_logs), PostgreSQL (screening_results) | POST /audit/log, /compliance/screen, /compliance/screening-results | All services |

### 4b. Inter-Service Communication

#### Synchronous Calls

| Service Pair | Protocol | Reason |
|---|---|---|
| API Gateway ↔ Auth Service | HTTPS/REST | Authentication is request-bound and latency-sensitive. |
| API Gateway ↔ User Service | HTTPS/REST | Profile reads are synchronous. |
| Deal Service ↔ Payment Service | gRPC | High-frequency, low-latency order-payment coordination. |
| Deal Service ↔ Shipping Service | gRPC | Quote/booking needs fast response. |
| AI/ML Service ↔ Product Catalog | gRPC | Bulk feature retrieval for inference. |
| Notification Service ↔ User Service | REST | User preference lookup. |
| Admin Service ↔ All services | REST | Admin operations tolerate higher latency. |

[ASSUMPTION: gRPC is used for internal high-frequency service pairs; REST is used for external-facing and admin operations.]

#### Asynchronous Events (Kafka Topics)

| Topic | Producer | Consumers | Payload Schema |
|---|---|---|---|
| `user.registered` | Auth Service | User Service, Notification Service, Audit Service | {user_id, email, role, country, timestamp} |
| `user.kyc.submitted` | User Service | Compliance Service, Notification Service | {user_id, company_id, document_type, submitted_at} |
| `user.kyc.approved` | Compliance Service | User Service, Notification Service, Master Account Service | {user_id, kyc_id, approved_at} |
| `product.created` | Product Catalog | Search Service, AI/ML Service, Audit Service | {product_id, seller_id, category_id, country, timestamp} |
| `demand.created` | Product Catalog | AI/ML Service, Notification Service | {demand_id, buyer_id, category_id, country, timestamp} |
| `match.generated` | AI/ML Service | Deal Service, Notification Service | {match_id, product_id, buyer_id, seller_id, score} |
| `pre-deal.created` | Deal Service | Notification Service, Payment Service (if pre-paid), Audit Service | {pre_deal_id, buyer_id, seller_id, priority_level, expires_at} |
| `pre-deal.accepted` | Deal Service | Order Service, Payment Service, Shipping Service | {pre_deal_id, order_id, payment_terms} |
| `order.created` | Deal Service | Payment Service, Shipping Service, Notification Service | {order_id, buyer_id, seller_id, total_value, incoterm} |
| `payment.authorized` | Payment Service | Order Service, Notification Service | {order_id, payment_id, amount, status} |
| `payment.released` | Payment Service | Order Service, Shipping Service, Notification Service | {order_id, payment_id, released_at} |
| `shipment.booked` | Shipping Service | Order Service, Notification Service | {shipment_id, order_id, tracking_number, carrier} |
| `shipment.delivered` | Shipping Service | Order Service, Payment Service, Notification Service | {shipment_id, order_id, delivered_at} |
| `dispute.opened` | Order Service | Notification Service, Compliance Service, Admin Service | {dispute_id, order_id, initiator_id, type} |
| `master.upgraded` | Master Account Service | Notification Service, Payment Service | {user_id, tier, start_date, end_date} |
| `audit.event` | All services | Audit & Compliance Service | {action, entity_type, entity_id, actor_id, timestamp, metadata} |
| `compliance.sanctions.hit` | Compliance Service | User Service, Payment Service, Admin Service | {user_id, entity_name, list, matched_at} |

#### API Gateway Rules

| Rule | Configuration |
|---|---|
| Authentication | Bearer JWT validation via Auth Service on all protected routes. |
| Rate limiting (Free/Bronze) | 100 requests/minute per IP/user. |
| Rate limiting (Silver/Gold) | 500 requests/minute. |
| Rate limiting (Platinum/Black) | 2,000 requests/minute + burst allowance. |
| Public routes | /health, /auth/login, /auth/register, /waitlist, /translations/public. |
| CORS | Whitelist Tureep domains and Lovable preview domains. |
| WAF | AWS WAF with OWASP core rule set + custom rules for Iran/Iraq IP geo-fencing if required. |
| Logging | All gateway requests logged to CloudWatch + Audit Service. |

### 4c. Data Flow Diagrams

#### Journey 1: AI Pre-Deal → Notification → Acceptance → Payment → Shipment

1. Seller creates product in Product Catalog Service.
2. Product Catalog publishes `product.created` event.
3. AI/ML Service consumes event and matches product against active demands and historical buyer behavior.
4. AI/ML Service generates `Deal_Match` record(s) and publishes `match.generated` event.
5. Deal Service consumes `match.generated`, creates `Pre_Deal` with suggested price, terms, and expiry.
6. Deal Service calls Master Account Service to determine priority level and notification lead time.
7. Deal Service publishes `pre-deal.created` event.
8. Notification Service consumes event, filters eligible users by tier (Black/Platinum first), and dispatches push/email/in-app alerts.
9. Buyer clicks notification; frontend calls Deal Service `/pre-deals/{id}`.
10. Buyer accepts; Deal Service records buyer_response=accepted and calls seller notification.
11. Seller accepts; Deal Service records seller_response=accepted.
12. Deal Service creates `Order` and publishes `order.created` event.
13. Payment Service consumes `order.created`, initializes payment based on terms (Escrow/L/C/D/P/Card).
14. Buyer completes payment; Payment Service publishes `payment.authorized` or `payment.held` (escrow).
15. Order Service updates status to `payment_pending` → `paid`.
16. Shipping Service consumes `payment.authorized`, books shipment and publishes `shipment.booked`.
17. Carrier delivers; webhook triggers `shipment.delivered`.
18. Payment Service releases escrow (if escrow) on delivery confirmation or dispute timeout.
19. Payment Service publishes `payment.released`.
20. Order Service marks order `completed`.
21. Reputation Service updates trust scores and publishes review requests.

#### Journey 2: New Seller Registers → KYC → First Product → First Match

1. Seller registers via Auth Service; `user.registered` event published.
2. User Service creates profile and sends welcome notification.
3. Seller completes Company profile and uploads KYC documents.
4. User Service publishes `user.kyc.submitted`.
5. Compliance Service screens documents and entity against sanctions lists.
6. Compliance Service publishes `user.kyc.approved`.
7. User Service updates user.account_status=active and company.kyc_status=verified.
8. Seller creates first product in Product Catalog Service.
9. Product Catalog publishes `product.created`.
10. AI/ML Service matches product against active demands.
11. If no sufficient data, rule-based matching produces candidate matches.
12. Deal Service creates Pre_Deal and notifies Master Account holders first, then standard users.
13. If no active demand exists, product is indexed in Search Service for discovery.

#### Journey 3: Buyer Disputes Delivered Order → Escrow Release Decision

1. Buyer opens dispute via Order Service; provides type, description, and requested resolution.
2. Order Service creates `Dispute` and publishes `dispute.opened`.
3. Order Service updates order status to `disputed` and halts escrow release timer.
4. Notification Service alerts seller, admin, and compliance.
5. Both parties submit evidence via Dispute_Messages within `evidence_deadline`.
6. Admin/Compliance Service reviews evidence, carrier tracking, and payment status.
7. Decision options:
   - Buyer favor: partial or full refund from escrow.
   - Seller favor: release escrow to seller.
   - Split: partial release to both parties.
8. Admin updates dispute status and resolution amount.
9. Payment Service executes the financial decision (refund or release).
10. Payment Service publishes `payment.released` or `payment.refunded`.
11. Order Service updates order status to `completed` or `cancelled` depending on outcome.
12. Reputation Service adjusts trust scores for both parties.
13. Audit Service logs all dispute actions.

---

## TASK 5 — PAYMENT & FINANCIAL FLOWS

[ASSUMPTION: USD is the default settlement currency for cross-border deals. Local currency display is for quoting only. Platform commission is deducted at payment time.]

### 5a. Letter of Credit (L/C)

#### Step-by-Step Process

1. Buyer and seller accept pre-deal with payment_terms = L/C.
2. Order is created with status `pending` and payment_status `pending`.
3. Buyer initiates L/C application via Payment Service; buyer's bank is selected.
4. Buyer's bank issues L/C in favor of seller (or seller's bank) and sends SWIFT MT700/MT701 to seller's bank.
5. Seller's bank advises L/C to seller.
6. Seller ships goods and presents documents (bill of lading, invoice, packing list, certificate of origin, insurance) to their bank.
7. Seller's bank checks documents against L/C terms (documentary compliance).
8. Seller's bank forwards documents to buyer's bank.
9. Buyer's bank verifies documents and either pays (sight L/C) or accepts draft (usance L/C).
10. Platform receives payment status update from buyer's bank or seller's bank.
11. On confirmation of payment, Payment Service updates `payment.status = paid`.
12. Order status moves to `in_transit` (if not already) and then `delivered` upon shipment tracking.
13. Platform commission is deducted from seller's payout if platform is collecting fees.

#### Platform's Role in Documentary Verification

| Action | Platform Role |
|---|---|
| Document collection | Provide secure upload portal for seller to share L/C documents with buyer and banks. |
| Document checklist | Display required documents per incoterm and L/C terms. |
| Document OCR | Extract key fields (BL number, invoice amount, container number) for validation. |
| Status tracking | Show L/C status to both parties in deal timeline. |
| Alerting | Notify parties when documents are received, discrepancies found, or payment confirmed. |

[LEGAL REVIEW REQUIRED: Platform is not a bank and cannot verify L/C documents as a bank would; it acts as a coordination/tracking layer only.]

#### L/C State Machine

| State | Event | New State |
|---|---|---|
| `lc_requested` | Buyer applies for L/C | `lc_issued` |
| `lc_issued` | Seller's bank advises L/C | `lc_advised` |
| `lc_advised` | Seller ships and presents documents | `documents_presented` |
| `documents_presented` | Documents compliant | `documents_accepted` |
| `documents_presented` | Documents discrepant | `documents_discrepant` |
| `documents_discrepant` | Buyer waives discrepancies | `documents_accepted` |
| `documents_discrepant` | Buyer rejects discrepancies | `lc_cancelled` |
| `documents_accepted` | Payment confirmed | `paid` |
| `paid` | Shipment delivered | `completed` |
| `paid` | Dispute opened | `disputed` |

### 5b. Documentary Collection (D/P)

#### Process Flow

1. Pre-deal accepted with payment_terms = D/P.
2. Order created; buyer's bank is notified (or buyer provides bank details).
3. Seller ships goods and presents documents to their bank with collection instructions.
4. Seller's bank sends documents to buyer's bank via D/P.
5. Buyer's bank notifies buyer that documents are available against payment.
6. Buyer pays buyer's bank.
7. Buyer's bank releases documents to buyer.
8. Buyer's bank remits funds to seller's bank.
9. Seller's bank credits seller's account.
10. Platform receives payment confirmation and updates order/payment status.

#### Platform's Escrow-Lite Role

- The platform does not hold funds in D/P but tracks the collection status.
- If payment is not received within the agreed tenor (e.g., 30/60/90 days), the platform flags the order and notifies the seller.
- The platform can hold a small security deposit (optional) from the buyer to reduce seller risk.

#### D/P Failure States and Recovery

| Failure | State | Recovery |
|---|---|---|
| Buyer does not pay on arrival | `payment_overdue` | Platform sends reminders; after 7 days, seller can recall goods or request legal action. |
| Documents discrepant | `documents_discrepant` | Seller corrects documents or buyer accepts discrepancies. |
| Buyer rejects goods | `disputed` | Dispute resolution process (Task 7a). |

### 5c. Escrow (Platform-Held)

#### Escrow Release Conditions

| Condition | Release Action |
|---|---|
| Delivery confirmed by carrier tracking | Release funds to seller after 24-hour inspection window. |
| Buyer manually confirms delivery | Release funds to seller. |
| Dispute timeout expires (no dispute within 72 hours of delivery) | Auto-release to seller. |
| Dispute resolved in seller's favor | Release to seller. |
| Dispute resolved in buyer's favor | Refund to buyer. |
| Dispute resolved split | Partial release/refund. |

#### Third-Party Escrow Provider Integration

[ASSUMPTION: For non-Iran transactions, a UAE-based escrow partner or Stripe Connect holds funds. For Iran transactions, [LEGAL REVIEW REQUIRED] platform may need to use a licensed regional trust arrangement.]

| Provider | Use Case |
|---|---|
| UAE-based escrow/trust account | Cross-border deals involving Iraq/Iran/Turkey. |
| Stripe Connect | Turkey/EU/US buyer-seller transactions. |
| Payoneer Escrow | Global non-sanctioned transactions. |

#### Escrow State Machine

| State | Event | New State |
|---|---|---|
| `pending` | Buyer makes payment | `funded` |
| `funded` | Seller ships goods | `held_pending_delivery` |
| `held_pending_delivery` | Delivery confirmed | `release_pending` |
| `release_pending` | 24-hour inspection window passes | `released` |
| `held_pending_delivery` | Dispute opened | `frozen` |
| `frozen` | Dispute resolved | `released` or `refunded` |
| `funded` | Order cancelled before shipment | `refunded` |

### 5d. Card / Direct Payment

#### Stripe Integration (Non-Iran Transactions)

1. Buyer selects card payment.
2. Payment Service creates Stripe PaymentIntent with `capture_method: manual` for high-value B2B transactions.
3. Buyer enters card details via Stripe Elements (PCI-compliant iframe).
4. Stripe authorizes funds.
5. Payment Service holds authorization until delivery confirmation (or ships for immediate payment if terms allow).
6. On delivery, Payment Service captures the authorized amount.
7. Stripe transfers net amount (minus Stripe fees and platform commission) to seller's connected account.

#### Alternative Processor for IQD/IRR Transactions

[ASSUMPTION: For IQD and IRR, use a regional bank transfer or licensed money service business. Card payments are generally not available for Iran.]

| Currency | Processor | Flow |
|---|---|---|
| IQD | Regional Iraqi bank or UAE-based processor | Buyer initiates bank transfer; platform verifies receipt via bank API/manual confirmation. |
| IRR | Regional bank or licensed trade-finance partner | [LEGAL REVIEW REQUIRED] Non-USD settlement; documentation of permitted trade category. |
| TRY | Turkish bank or Stripe | Standard bank transfer or card flow. |

#### Chargeback Handling

| Step | Action |
|---|---|
| 1. Chargeback received | Payment Service is notified by processor. |
| 2. Hold funds | Seller's pending payout is frozen for the chargeback amount. |
| 3. Evidence collection | Seller submits evidence (tracking, delivery proof, communication). |
| 4. Representment | Platform assists seller in submitting evidence to processor. |
| 5. Decision | If chargeback won, funds released. If lost, seller is debited. |
| 6. Reputation impact | Seller trust score adjusted; repeated chargebacks trigger account review. |

### 5e. Multi-Currency / FX

#### FX Provider Recommendation

| Provider | Best For | Notes |
|---|---|---|
| Open Exchange Rates | Display rates, low cost | Recommended for display rates. |
| XE API | Mid-market rates, historical data | Recommended for invoice settlement rates. |
| Bank APIs (CBRT, CBI) | Local TRY/IQD rates | Used for local currency payouts. |
| Wise/Bank partner | Actual settlement conversions | For cross-border payouts. |

[ASSUMPTION: Open Exchange Rates is primary for display; XE is primary for settlement rate.]

#### Rate Refresh Interval

- Display rates: Every 15 minutes.
- Settlement rates: Locked at order creation for 24 hours; refreshed after 24 hours if payment not initiated.
- Invoice rates: Fixed at invoice generation time.

#### Settlement Currency per Transaction Type

| Transaction Type | Settlement Currency | Notes |
|---|---|---|
| Cross-border B2B deal | USD or EUR | Widely accepted; bankable. |
| Turkey domestic deal | TRY | Local settlement. |
| Iraq domestic deal | IQD | Local settlement. |
| Iran deal | [LEGAL REVIEW REQUIRED] | Non-USD; often EUR or local partner currency. |
| Platform commission | USD | Always charged in USD to platform. |
| Subscription | USD | Master Account subscriptions billed in USD. |

#### Currency Display vs Settlement

| Field | Behavior |
|---|---|
| Display price | Shown in buyer's preferred currency using latest display FX rate. |
| Deal currency | Locked at order creation (USD by default). |
| Invoice amount | Calculated in deal currency. |
| Payout currency | Seller receives in their preferred bank account currency; FX conversion happens at payout. |
| Platform fee | Always calculated and deducted in USD. |

---

## TASK 6 — MASTER ACCOUNT PRICING & BUSINESS MODEL

### 6a. Master Account Tiers

[ASSUMPTION: 5 tiers: Bronze, Silver, Gold, Platinum, Black. Free tier is a separate standard account with 1% commission.]

| Tier | Monthly Price (USD) | Annual Price (USD) | Pre-Deal Lead Time | Commission | Max Active Listings | Dedicated Manager | Advanced Analytics | Exclusive Auction | Support SLA |
|---|---|---|---|---|---|---|---|---|---|
| Bronze | $100 | $1,000 | +96h earlier than standard | 0.8% | 25 | No | No | No | 48h |
| Silver | $300 | $3,000 | +72h earlier | 0.5% | 100 | No | Yes | No | 24h |
| Gold | $1,000 | $10,000 | +48h earlier | 0.3% | 500 | No | Yes | Yes | 12h |
| Platinum | $5,000 | $50,000 | +24h earlier | 0.1% | Unlimited | Yes | Yes | Yes | 4h |
| Black | $20,000 | $200,000 | Instant | 0% | Unlimited | Yes | Yes | Yes | 1h |

[ASSUMPTION: Standard (non-Master) account has no subscription fee, 1% commission, 120h delay on pre-deals, and 5 active listings.]

#### Feature Gates

| Feature | Bronze | Silver | Gold | Platinum | Black |
|---|---|---|---|---|---|
| Priority listing | ✓ | ✓ | ✓ | ✓ | ✓ |
| Featured badge | — | ✓ | ✓ | ✓ | ✓ |
| Exclusive high-value deals | — | — | ✓ | ✓ | ✓ |
| Auction access | — | — | ✓ | ✓ | ✓ |
| Custom analytics | — | ✓ | ✓ | ✓ | ✓ |
| API access | — | — | ✓ | ✓ | ✓ |
| White-label/enterprise | — | — | — | — | ✓ |
| Custom deal terms | — | — | — | ✓ | ✓ |

### 6b. Revenue Model

#### Standard Account Commission

| Account Type | Commission on Completed Deal |
|---|---|
| Standard (Free) | 1.0% |
| Bronze | 0.8% |
| Silver | 0.5% |
| Gold | 0.3% |
| Platinum | 0.1% |
| Black | 0% |

[ASSUMPTION: Commission is calculated on total order value and deducted from seller's payout.]

#### Value-Added Service Fees

| Service | Fee | Collection Method |
|---|---|---|
| Logistics facilitation | 5-10% of shipping cost | Added to shipping quote. |
| Cargo insurance | 1-2% of cargo value | Optional at checkout. |
| Financing referral | 1-2% of financed amount | Paid by financier or buyer. |
| L/C coordination | $200-500 per L/C | Flat fee per transaction. |
| Customs brokerage | $100-300 per shipment | Flat fee. |
| Translation services | $0.02-0.05 per word | Per use. |
| Premium listing promotion | $50-500 per month | Monthly subscription. |

#### Year 1 Revenue Projections

| Scenario | Active Users | Avg Deal Value | Monthly Deals/User | Commission Revenue | Subscription Revenue | VAS Revenue | Total Year 1 |
|---|---|---|---|---|---|---|---|
| Conservative | 100 | $50,000 | 0.5 | $300,000 | $120,000 | $80,000 | $500,000 |
| Target | 500 | $75,000 | 0.7 | $1,575,000 | $600,000 | $425,000 | $2,600,000 |
| Optimistic | 1,000 | $100,000 | 1.0 | $4,000,000 | $1,200,000 | $1,000,000 | $6,200,000 |

[ASSUMPTION: 30% of users are Master Account subscribers; 60% are Silver/Gold; 20% are free; average subscription mix weighted toward Silver.]

### 6c. Upgrade/Downgrade Rules

#### Mid-Cycle Upgrade

| Rule | Implementation |
|---|---|
| Proration | Upgrade is prorated daily. User pays difference between new and old tier for remaining days. |
| Immediate effect | New features activate immediately. Pre-deal lead time and commission updated immediately. |
| Billing | New invoice generated; old subscription period is closed and credited. |
| Invoice | Invoice shows prorated credit from old tier and charge for new tier. |

#### Downgrade

| Rule | Implementation |
|---|---|
| Effective date | Downgrade takes effect at the end of the current billing period. |
| Feature retention | User retains higher-tier features until period end. |
| Listing cap | If new tier has lower cap, user cannot add new listings beyond cap until period end. Existing active listings remain. |
| Refund | No partial refund for downgrade. |

#### Cancellation and Refund

| Rule | Implementation |
|---|---|
| Cancellation | User can cancel auto-renewal at any time. Access continues until period end. |
| Refund | No refunds for partial months unless required by local law. |
| Grace period | 7-day grace period after expiry before features are revoked; account becomes standard. |
| Data retention | Historical data retained; user can reactivate by paying current tier price. |

#### Trial Period and Conversion

| Element | Policy |
|---|---|
| Trial offer | 30-day Silver trial for new verified companies. |
| Trial restrictions | 5 active listings, 10% commission (instead of Silver 0.5%), no auction access. |
| Conversion | Auto-converts to paid Silver monthly unless cancelled 3 days before trial end. |
| Trial abuse | One trial per company; duplicate companies detected via tax/registration number. |

---

## TASK 7 — MISSING FLOWS & PROCESSES

### 7a. Dispute Resolution Flow

#### Step-by-Step Process

1. **Dispute opened:** Buyer or seller opens dispute from order detail page, selecting type and describing issue.
2. **Evidence deadline set:** System sets 72-hour evidence deadline based on dispute type and order value.
3. **Counterparty notified:** Notification sent to other party with dispute summary and deadline.
4. **Evidence submission:** Both parties upload photos, documents, tracking data, and communication logs.
5. **Automated preliminary check:** System cross-references tracking events, payment status, and order specifications.
6. **Human review assigned:** Admin/compliance officer reviews case; complex cases escalated to senior reviewer.
7. **Decision:** Admin selects resolution: full refund, partial refund, replacement, compensation, or no action.
8. **Financial execution:** Payment Service releases/refunds escrow or processes adjustment.
9. **Notification:** Both parties notified of decision and reasoning.
10. **Appeal window:** 7-day appeal window for losing party; appeal requires new evidence.
11. **Appeal review:** Senior reviewer or external arbitrator reviews appeal.
12. **Final decision:** Binding final decision executed.
13. **Trust score update:** Reputation Service adjusts scores based on outcome.
14. **Audit log:** All actions logged immutably.

#### SLA Timeline

| Phase | SLA |
|---|---|
| Dispute acknowledged | Within 4 hours |
| Evidence period | 72 hours (extendable by admin) |
| Initial decision | 5 business days from evidence close |
| Appeal decision | 5 business days from appeal submission |
| Financial execution | 24 hours after decision |

#### Escalation to Human Review

| Trigger | Escalation |
|---|---|
| Order value > $50,000 | Senior compliance officer required. |
| Sanctions or compliance concern | Legal team involved. |
| Both parties provide conflicting evidence | External arbitrator option for Black/Platinum accounts. |
| Repeated disputes from same user | Account review and possible suspension. |

#### Escrow Release or Refund Trigger

| Outcome | Financial Action |
|---|---|
| Buyer favor (full) | Refund full order value to buyer from escrow. |
| Buyer favor (partial) | Refund partial amount; release remainder to seller. |
| Seller favor | Release full escrow to seller. |
| Split | Refund X% to buyer, release (100-X)% to seller. |
| Replacement | Seller ships replacement; original payment held until delivery. |
| No action | Release escrow per normal delivery timeline. |

### 7b. Reputation & Trust Score Algorithm

#### Input Signals and Weights

| Signal | Weight | Calculation |
|---|---|---|
| On-time delivery | 30% | % of orders delivered by estimated date. |
| Dispute rate | 25% | Disputes opened / completed orders (lower is better). |
| Response time | 15% | Average hours to respond to messages/pre-deals. |
| Deal volume | 15% | Completed deal value normalized across platform. |
| Review score | 15% | Average 1-5 star rating weighted by verified transaction. |

#### Score Range and Display

| Score | Badge | Meaning |
|---|---|---|
| 90-100 | Platinum | Exceptional trust. |
| 80-89 | Gold | High trust. |
| 70-79 | Silver | Good trust. |
| 60-69 | Bronze | Acceptable. |
| 40-59 | Standard | Needs improvement. |
| 0-39 | At Risk | Restricted trading. |

**Display format:** Score shown as "87/100 — Gold" with a progress indicator.

#### Decay Function

| Rule | Implementation |
|---|---|
| Time decay | Deals older than 12 months contribute 50% weight; older than 24 months contribute 25%. |
| Volume cap | No single deal can contribute more than 10% of total score. |
| Recent disputes | Disputes in the last 90 days have 2x negative impact. |

#### Score Manipulation Protection

| Protection | Implementation |
|---|---|
| Verified reviews only | Reviews only allowed after completed order. |
| Review window | 14-day window after delivery; cannot review before. |
| Self-dealing detection | Flag same IP, same bank account, same device reviewing each other. |
| Incentive prohibition | Platform policy bans paying for reviews; violators suspended. |
| Statistical anomaly detection | Sudden score spikes/drops trigger manual review. |

#### Minimum Score to Trade

| Action | Score Threshold |
|---|---|
| Can receive pre-deals | ≥ 50 |
| Can receive high-value (> $50K) pre-deals | ≥ 70 |
| Can list products | ≥ 40 (with limited visibility below 50) |
| Account suspended | < 30 for 30 consecutive days |

#### Impact on Search Ranking

| Score Range | Search Impact |
|---|---|
| 90-100 | +30% ranking boost. |
| 80-89 | +15% ranking boost. |
| 70-79 | No boost. |
| 60-69 | -10% ranking penalty. |
| 40-59 | -25% ranking penalty. |
| < 40 | Suppressed from search. |

### 7c. Exclusive Auction Mechanics

#### Auction Types Supported

| Type | Description | Use Case |
|---|---|---|
| English ascending | Bidders place increasingly higher bids; highest bidder wins. | High-demand commodities (dates, phosphate). |
| Dutch descending | Price starts high and decreases until a bidder accepts. | Perishable goods or time-sensitive clearance. |
| Sealed first-price | Bidders submit private bids; highest wins and pays their bid. | Sensitive procurements. |

[ASSUMPTION: English ascending is the default. Dutch is available for Gold+ tier only.]

#### Auction Rules

| Parameter | Rule |
|---|---|
| Minimum bid increment | 1% of starting price or $100, whichever is higher. |
| Reserve price | Seller sets hidden reserve; auction only completes if reserve met. |
| Auction duration | 24 hours, 72 hours, or 7 days (seller selects). |
| Auto-extend | If bid placed in last 5 minutes, extend by 5 minutes (max 3 extensions). |
| Winner notification | Immediate email/push/in-app notification. |
| Payment deadline | 24 hours for English/Dutch; 48 hours for sealed bid. |
| No-payment penalty | Forfeit deposit (if held), 1-week auction suspension, trust score penalty. |
| Bid visibility | English: public bid history. Sealed: hidden until close. Dutch: current price visible. |

#### Auction Access Tiers

| Tier | Auction Access |
|---|---|
| Standard/Bronze | Can view; cannot bid. |
| Silver | Can bid on standard auctions. |
| Gold+ | Can bid on exclusive auctions and create auctions. |
| Black | Can create private invitation-only auctions. |

### 7d. Notification Architecture

#### Notification Types and Channels

| Notification Type | Push | Email | SMS | In-App | Priority |
|---|---|---|---|---|---|
| Pre-deal alert | ✓ | ✓ | — | ✓ | High (5) |
| Pre-deal expiring soon | ✓ | ✓ | — | ✓ | High (4) |
| Order created | ✓ | ✓ | — | ✓ | High (4) |
| Payment received | ✓ | ✓ | ✓ | ✓ | High (5) |
| Payment failed | ✓ | ✓ | ✓ | ✓ | Critical (5) |
| Shipment booked | ✓ | ✓ | — | ✓ | Medium (3) |
| Shipment in transit | ✓ | — | — | ✓ | Low (2) |
| Shipment delivered | ✓ | ✓ | — | ✓ | High (4) |
| Dispute opened | ✓ | ✓ | ✓ | ✓ | Critical (5) |
| Dispute resolved | ✓ | ✓ | — | ✓ | High (4) |
| KYC status update | ✓ | ✓ | — | ✓ | High (4) |
| Subscription renewal | ✓ | ✓ | — | ✓ | Medium (3) |
| Subscription failed | ✓ | ✓ | ✓ | ✓ | High (4) |
| Trust score change | — | — | — | ✓ | Low (1) |
| System maintenance | — | ✓ | — | ✓ | Low (1) |

#### Priority Queue Design

| Tier | Pre-Deal Notification Lead Time | Queue Priority |
|---|---|---|
| Black | Instant | 1 (highest) |
| Platinum | +24h before standard | 2 |
| Gold | +48h before standard | 3 |
| Silver | +72h before standard | 4 |
| Bronze | +96h before standard | 5 |
| Standard | Standard time | 6 |

[ASSUMPTION: "Standard time" means pre-deal becomes visible to non-Master users 120 hours after creation.]

#### Notification Dispatch Logic

1. Pre-deal is created with `priority_level` and `expires_at`.
2. System calculates `visible_at` for each tier based on `expires_at - lead_time`.
3. A scheduled job (Celery/Amazon EventBridge) checks every 15 minutes for pre-deals that just became visible to a tier.
4. For each eligible user in that tier, Notification Service queues a personalized notification.
5. Notifications are sent via channels based on user preference and type priority.
6. Delivery status tracked per channel; failures retried.

#### User Preference Management

| Control | Default |
|---|---|
| Email opt-out | Cannot opt out of critical (payment, dispute, KYC) emails. Can opt out of marketing. |
| Push opt-out | Can disable all push except critical. |
| SMS opt-out | Can disable non-payment SMS. |
| In-app | Cannot disable; can mark read. |
| Quiet hours | Users can set do-not-disturb hours (does not apply to critical). |

#### Retry Logic and Delivery Confirmation

| Channel | Retry Strategy | Delivery Confirmation |
|---|---|---|
| Email | Retry 3 times with exponential backoff (5 min, 30 min, 2 hours). | Webhook from SendGrid. |
| Push (Firebase) | Retry 3 times immediately. | FCM delivery receipt. |
| SMS | Retry 2 times (5 min, 30 min). | Twilio status callback. |
| In-app | No retry; stored in MongoDB. | Read receipt via API. |

---

## TASK 8 — COMPLETE PROJECT GANTT PLAN

### 8.1 Sprint Plan (12 Sprints, 2 Weeks Each)

[ASSUMPTION: Project start date is Day 1 (2026-06-18). Sprint dates are illustrative.]

| Sprint | Dates | Goal | Deliverables | Team | Dependencies | Definition of Done |
|---|---|---|---|---|---|---|
| S1 | Jun 18 – Jul 1 | Foundation & architecture | Repo setup, CI/CD, AWS account, Docker/K8s base, ERD finalization, API contracts | Platform/Lead + DevOps | None | All devs can build and deploy locally; ERD signed off. |
| S2 | Jul 2 – Jul 15 | Auth & user foundation | Auth Service (JWT, MFA, password reset), User/Company Service, KYC table schema, basic registration/login UI | Backend (2) + Frontend (2) + QA | S1 | Users can register, verify email, and log in. |
| S3 | Jul 16 – Jul 29 | Company & KYC | Company CRUD, KYC upload flow, sanctions screening integration, KYC admin queue UI | Backend (2) + Frontend (2) + Compliance | S2 | Seller can submit KYC; admin can approve/reject. |
| S4 | Jul 30 – Aug 12 | Product catalog & search | Product CRUD, categories (multi-level), multi-language fields, Elasticsearch indexing, search UI | Backend (2) + Frontend (2) + Search | S3 | Sellers can list products; buyers can search and filter. |
| S5 | Aug 13 – Aug 26 | AI matching MVP | Rule-based matching engine, Deal_Match model, Pre_Deal creation, basic notification dispatch | AI/ML (2) + Backend (2) + Frontend (1) | S4 | System generates pre-deals from product+demand matches. |
| S6 | Aug 27 – Sep 9 | Master Accounts & billing | Master_Account model, subscription billing (Stripe), tier feature gates, upgrade/downgrade UI | Backend (2) + Frontend (2) + Billing | S2 | Users can subscribe to tiers; billing cycle works. |
| S7 | Sep 10 – Sep 23 | Orders & payments | Order/Order_Item models, Escrow payment flow, payment status tracking, order detail UI | Backend (2) + Frontend (2) + Payment | S5, S6 | Pre-deal accepted → order created → payment held in escrow. |
| S8 | Sep 24 – Oct 7 | Shipping & logistics | Shipment model, carrier API integrations (DHL, Maersk), tracking events, shipment UI | Backend (2) + Frontend (2) + Logistics | S7 | Orders can be booked and tracked. |
| S9 | Oct 8 – Oct 21 | Disputes & reputation | Dispute workflow, evidence upload, admin decision UI, trust score calculation, reviews | Backend (2) + Frontend (2) + Compliance | S7, S8 | Dispute can be opened, reviewed, and resolved. |
| S10 | Oct 22 – Nov 4 | L/C & D/P + auctions | L/C and D/P state machines, document upload, auction MVP (English ascending) | Backend (2) + Frontend (2) + Trade Finance | S7 | L/C and D/P orders can be created and tracked. |
| S11 | Nov 5 – Nov 18 | Advanced features & AI | ML-based matching v1, price prediction MVP, demand analytics dashboard, RTL/localization | AI/ML (2) + Backend (1) + Frontend (2) | S5, S10 | AI models deployed behind feature flags; dashboard shows analytics. |
| S12 | Nov 19 – Dec 2 | Testing, security, launch prep | Load testing, security audit (OWASP), penetration test, compliance review, beta onboarding | QA + DevOps + Compliance + All teams | S1-S11 | All critical paths tested; security audit passed; 100 beta users onboarded. |

### 8.2 Milestones

| Milestone | Date | Criteria | Go/No-Go Decision |
|---|---|---|---|
| M1 — Architecture & Foundation | Jul 1 | CI/CD, AWS infrastructure, ERD, API contracts complete. | Go if all devs can deploy end-to-end. |
| M2 — Identity & Trust | Jul 29 | Auth, KYC, sanctions screening operational. | Go if KYC approval rate >80% and false positive rate <10%. |
| M3 — Marketplace Core | Aug 26 | Product catalog, search, and rule-based matching live. | Go if pre-deals can be generated and displayed. |
| M4 — Monetization & Orders | Sep 23 | Master Accounts, subscriptions, orders, and escrow payments live. | Go if payment flow completes without errors in staging. |
| M5 — Logistics & Disputes | Oct 21 | Shipping tracking, disputes, and reputation live. | Go if dispute SLA can be met and trust scores compute. |
| M6 — Beta Launch | Dec 2 | Security audit passed, 100 beta users active, core workflows functional. | Go if no critical bugs and compliance sign-off. |

### 8.3 Critical Path

| Task | If Delayed, Delays |
|---|---|
| ERD & API contracts (S1) | All subsequent sprints. |
| Auth Service (S2) | User Service, KYC, Product Catalog, all user-facing features. |
| KYC/sanctions screening (S3) | Product listing, pre-deal generation, payments. |
| Product catalog + search (S4) | AI matching, pre-deals, orders. |
| Pre-deal generation (S5) | Orders, payments, logistics. |
| Escrow payment flow (S7) | Order completion, shipping, disputes, beta launch. |
| Security audit (S12) | Launch date. |

---

## TASK 9 — SRS APPENDICES

### 9a. Appendix 8.1 — Pre-Deal System Flow

1. **Data Collection:** Product Catalog Service and Demand records provide product and buyer-demand data. External market data (prices, FX, logistics) is fetched.
2. **Data Normalization:** AI/ML Service normalizes units, currencies, locations, and quality specifications into a consistent feature set.
3. **Candidate Generation:** Rule-based or content-based filters create a shortlist of product↔demand pairs that pass hard constraints (category, quantity, location, incoterm, KYC status).
4. **AI Scoring:** Ranking model scores each candidate on price alignment, logistics proximity, trust, urgency, and category fit.
5. **Match Record Creation:** For each candidate above threshold, a `Deal_Match` record is created with sub-scores and model version.
6. **Pre-Deal Construction:** For top-scoring matches, the Deal Service calculates suggested price, shipping cost, payment terms, and total value.
7. **Priority Assignment:** Pre-deal is assigned a priority level (0-5) and exclusivity flag based on deal value and tier rules.
8. **Expiry Calculation:** Pre-deal expiry is set (default 48 hours; shorter for high-value or urgent deals).
9. **Pre-Deal Persistence:** Pre_Deal record is saved with status `pending`.
10. **Priority Queue Insertion:** Pre-deal is inserted into the notification queue with visibility timestamps per tier.
11. **Master Account Notification:** At the tier's lead time, eligible Black/Platinum/Gold/etc. users are notified via push/email/in-app.
12. **Standard User Notification:** After the Master Account lead time, pre-deal becomes visible to standard users.
13. **Buyer Response:** Buyer views pre-deal and accepts, rejects, or ignores it.
14. **Seller Response:** If buyer accepts, seller is notified and must accept or reject.
15. **Both Accepted:** Pre-deal status becomes `converted_to_order`; Order Service creates an Order and Order_Items.
16. **One Party Rejected:** Pre-deal status becomes `rejected`; AI/ML Service is notified to find the next best match for the product or demand.
17. **Expired:** If no response before expiry, pre-deal status becomes `expired`; next-best match is attempted.
18. **Order Initiation:** Order triggers payment and shipment workflows (Task 9c).
19. **Feedback Loop:** All accept/reject outcomes are logged as training data for model retraining.
20. **Escalation:** High-value or disputed pre-deals are flagged for manual review by compliance/operations.

### 9b. Appendix 8.2 — Master Account System Flow

1. **Registration:** User registers and completes company profile.
2. **KYC Completion:** User submits KYC and is approved.
3. **Tier Selection:** User visits Master Account page and selects tier (Bronze, Silver, Gold, Platinum, Black).
4. **Pricing Display:** System shows monthly and annual price, feature list, and savings for annual billing.
5. **Billing Cycle Selection:** User selects monthly or annual.
6. **Payment Method:** User adds or selects payment method (card, bank, etc.).
7. **Payment Authorization:** Payment Service authorizes or charges the first period.
8. **Activation:** On successful payment, Master_Account is created with status `active`, start_date=today, end_date=period end.
9. **User Profile Update:** Users.master_account_id is updated; feature flags are enabled.
10. **Welcome Notification:** Notification Service sends activation confirmation with tier benefits.
11. **Priority Routing Logic:** For every new pre-deal, the system checks the user's tier to determine `visible_at` and notification priority.
12. **Lead-Time Calculation:** `visible_at = expires_at - tier_lead_hours`. Black users see immediately; Bronze users see 96 hours before standard time.
13. **Exclusive Feature Gates:**
    - Gold+ can access exclusive high-value pre-deals.
    - Gold+ can access auctions.
    - Silver+ can access advanced analytics.
    - Platinum+ has dedicated account manager.
    - Black has custom deal terms and white-label options.
14. **Daily Renewal Check:** A job checks expiring Master Accounts and sends renewal reminders (7 days, 1 day before expiry).
15. **Auto-Renewal:** If auto_renew=true and payment method valid, Subscription is created and payment is charged.
16. **Renewal Success:** Master_Account end_date extended; user notified.
17. **Renewal Failure:** Account enters grace period; user notified; features remain active for 7 days.
18. **Grace Period Expiry:** If payment not received, account reverts to standard; listings capped; commission returns to 1%.
19. **Upgrade Path:** User can upgrade anytime; prorated charge calculated; new features activate immediately; invoice generated.
20. **Downgrade Path:** User selects lower tier; downgrade effective at end of current period; confirmation sent.
21. **Cancellation:** User cancels auto-renew; access continues until period end; no refund unless legally required.

### 9c. Appendix 8.3 — Payment System Flows

#### L/C Flow

1. Pre-deal accepted; order created with payment_method = L/C.
2. Buyer provides issuing bank details.
3. Buyer applies for L/C at their bank.
4. Issuing bank sends SWIFT L/C to advising bank (seller's bank).
5. Seller's bank advises seller; platform status = `lc_advised`.
6. Seller ships goods and uploads/presents documents to advising bank.
7. Advising bank forwards documents to issuing bank.
8. Issuing bank checks documents; if compliant, pays (sight L/C) or accepts draft (usance L/C).
9. If discrepant, issuing bank requests waiver from buyer.
10. Buyer accepts or rejects waiver.
11. On payment confirmation, platform status = `paid`; payment record updated with L/C reference.
12. Error state: Document discrepancy → buyer waives or L/C cancelled.
13. Recovery: Seller resubmits corrected documents or parties switch to D/P/Escrow.

#### D/P Flow

1. Pre-deal accepted; order created with payment_method = D/P.
2. Seller ships goods and presents documents to their bank with D/P instructions.
3. Seller's bank sends documents to buyer's bank.
4. Buyer's bank notifies buyer that documents are available against payment.
5. Buyer pays buyer's bank.
6. Buyer's bank releases documents to buyer and remits funds to seller's bank.
7. Seller's bank credits seller's account.
8. Platform receives payment confirmation; status = `paid`.
9. Error state: Buyer does not pay within tenor → `payment_overdue`.
10. Recovery: Seller recalls goods, negotiates extension, or opens dispute.

#### Escrow Flow

1. Pre-deal accepted; order created with payment_method = Escrow.
2. Buyer makes payment to escrow account/platform-held escrow.
3. Platform confirms funds received; status = `funded`.
4. Seller ships goods; status = `held_pending_delivery`.
5. Carrier delivers goods; tracking event confirms delivery.
6. 24-hour inspection window begins.
7. If no dispute, funds released to seller; status = `released`.
8. If dispute opened, funds frozen; status = `frozen`.
9. Dispute resolved; funds released or refunded accordingly.
10. Error state: Seller does not ship → buyer refunded after deadline.
11. Recovery: Dispute resolution or cancellation with refund.

#### Card Flow

1. Pre-deal accepted; order created with payment_method = Card.
2. Payment Service creates PaymentIntent with `capture_method: manual`.
3. Buyer enters card via Stripe Elements; Stripe authorizes funds.
4. Platform status = `authorized`.
5. Seller ships goods.
6. On delivery confirmation, Payment Service captures authorized amount.
7. Platform status = `captured`/`paid`.
8. Stripe settles net amount to seller's connected account.
9. Error state: Authorization fails → `payment_failed`; buyer retries.
10. Recovery: Retry payment or switch to escrow/L/C.

---

## TASK 10 — LOCALIZATION & RTL SPEC

### 10.1 RTL Implementation Strategy

| Layer | Approach |
|---|---|
| CSS | Use logical properties (`margin-inline-start`, `padding-inline-end`, `border-inline-start`) instead of `margin-left`/`margin-right`. |
| Direction | Apply `dir="rtl"` on the `<html>` element when language is Arabic or Persian. Set via React context or TanStack Router meta. |
| Layout | Use CSS Grid/Flexbox; avoid absolute positioning based on left/right. |
| Icons | Arrow icons (e.g., chevron-right) should flip horizontally in RTL using CSS transform or mirrored icon variants. |
| Text alignment | Text alignment should follow direction naturally; do not force `text-align: left` globally. |
| Tables | Table columns should reverse order in RTL when using fixed visual order; otherwise use logical CSS. |
| Calendars | Use locale-specific calendar components. |

### 10.2 Font Stack per Language

| Language | Font Stack | Notes |
|---|---|---|
| English | Inter, system-ui, sans-serif | Default Latin font already loaded. |
| Arabic | "Noto Sans Arabic", "Dubai", "Tahoma", sans-serif | Ensure Arabic numerals are supported. |
| Persian (Farsi) | "Noto Sans Arabic", "Vazirmatn", "IranSans", sans-serif | Persian uses Arabic script but may have different local fonts. |
| Turkish | Inter, "Noto Sans", system-ui, sans-serif | Latin-ext subset sufficient. |
| Kurdish | "Noto Sans Arabic", sans-serif | Kurdish Sorani uses Arabic script. |

[ASSUMPTION: Google Fonts or self-hosted Noto Sans Arabic and Vazirmatn are used.]

### 10.3 Calendar Systems

| Market | Primary Calendar | Secondary Display | When Secondary Displayed |
|---|---|---|---|
| Iraq | Gregorian | Hijri (Islamic) | Optional user preference; religious holidays. |
| Iran | Gregorian | Jalali (Solar Hijri) | Always show Jalali date alongside Gregorian for Iranian users. |
| Turkey | Gregorian | Hijri | Optional; religious holidays. |
| EU/Global | Gregorian | — | — |

[ASSUMPTION: Date picker supports Gregorian by default; Jalali picker added for Persian users via a library like `react-datepicker-jalali`.]

### 10.4 Number Formatting

| Currency | Format | Example | Notes |
|---|---|---|---|
| USD | $#,##0.00 | $1,250.50 | Standard decimal. |
| EUR | #,##0.00 € | 1.250,50 € | European decimal comma. |
| TRY | #,##0.00 ₺ | 1.250,50 ₺ | Turkish grouping. |
| IQD | #,##0 IQD | 1,250 IQD | No decimal places. |
| IRR | #,##0 ﷼ | 1,250,000 ﷼ | Large numbers; use toman (1/10) optionally for display. |

[ASSUMPTION: `Intl.NumberFormat` is used with locale-specific options. Backend stores all amounts as decimals without formatting.]

### 10.5 Date/Time and Timezones

| Region | Timezone | Default Display |
|---|---|---|
| Iraq | Asia/Baghdad (UTC+3) | Localized to user's timezone. |
| Iran | Asia/Tehran (UTC+3:30) | Localized to user's timezone; note DST changes. |
| Turkey | Europe/Istanbul (UTC+3) | Localized to user's timezone. |
| EU | User's local timezone | Detected from browser or profile. |
| Backend | UTC | All timestamps stored in UTC. |

[ASSUMPTION: Backend uses TIMESTAMPTZ; frontend converts using `date-fns-tz` or `Intl.DateTimeFormat`.]

### 10.6 Translation Management

| Component | Approach |
|---|---|
| Source strings | Stored in JSON files per namespace (e.g., `common.json`, `product.json`, `checkout.json`) per language. |
| Keys | Use structured keys: `product.quantity_error`, `payment.lc_documents_required`. |
| Dynamic content | Product names/descriptions stored in `Products.name_translations` JSONB; rendered based on user language. |
| Machine translation | Use DeepL for high-quality translation; Google Translate as fallback for low-resource languages. |
| Human review | Legal and UI-critical strings reviewed by native speakers before production. |
| Deployment | Translation files bundled at build time; dynamic content fetched from API. Hot-reload for non-critical strings via CMS. |
| Glossary | Maintain a platform glossary (e.g., "pre-deal", "Master Account", "incoterm") for consistent translation. |
| RTL detection | Language metadata includes `direction: rtl` or `ltr`; applied at runtime. |

### 10.7 Legal Text Localization

[LEGAL REVIEW REQUIRED: Terms of service, privacy policy, and sanctions disclaimers must be reviewed by local counsel in each jurisdiction.]

| Document | Strategy |
|---|---|
| Terms of Service | Master English version drafted by US/UAE counsel; localized translations reviewed by local counsel in Iraq, Iran, Turkey, and EU. |
| Privacy Policy | GDPR-compliant EU version; localized for KVKK (Turkey), Iraqi data protection (if applicable), and Iranian users. |
| KYC consent | Translated consent forms for document collection and sanctions screening. |
| Dispute resolution | Localized arbitration/mediation clauses. |
| Sanctions disclaimer | Displayed in Arabic, Persian, Turkish, and English before every deal. |
| Cookie policy | EU cookie banner; simplified notice for other regions. |

[ASSUMPTION: A legal translation agency specializing in MENA jurisdictions is retained for all legal text localization.]

---

## Document Control

| Version | Date | Author | Changes |
|---|---|---|---|
| 1.0 | 2026-06-18 | Tureep AI Product & Architecture Team | Initial complete production documentation package. |

**Next Review Date:** 2026-07-18  
**Approval Status:** Draft — pending engineering, legal, and compliance review.
