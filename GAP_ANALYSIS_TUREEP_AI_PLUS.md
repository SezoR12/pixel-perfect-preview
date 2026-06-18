# Tureep AI+ — Gap Analysis

**Version:** 1.0  
**Date:** 2026-06-18  
**Scope:** Current MVP codebase (`pixel-perfect-preview` repo) vs. the production-ready Tureep AI+ specification in `TUREEP_AI_PLUS_COMPLETE_DOCUMENTATION.md`.

---

## 1. Executive Summary

The current repository contains a **functional Phase 1 MVP** of Tureep AI+ with:
- FastAPI backend with user auth, products, demands, pre-deals, and a rule-based AI matching engine.
- TanStack Start frontend with landing page, login, dashboard, products, and pre-deals.
- SQLite/PostgreSQL support, Docker Compose, and a seeded demo dataset.

However, the repo is **not production-ready** for a live B2B trade platform. Major gaps exist in:
- **Payment processing** (L/C, D/P, Escrow, multi-currency) — not implemented.
- **Logistics integration** (DHL, Maersk tracking) — not implemented.
- **Compliance/sanctions screening** (OFAC, KYC/AML) — not implemented.
- **Notifications** (push, email, SMS) — not implemented beyond local state.
- **Microservices architecture** — current backend is a monolith.
- **ML models** — only rule-based matching; no trained ML, price prediction, or demand forecasting.
- **RTL/localization** — not implemented.
- **Production deployment** — frontend ready for Lovable; backend not deployed.
- **Testing, monitoring, security hardening** — minimal.

This gap analysis maps each missing area to the specification, assigns severity, and recommends the next implementation phase.

---

## 2. Gap Analysis Methodology

| Dimension | Source of Truth | Assessment Method |
|---|---|---|
| Functional requirements | `TUREEP_AI_PLUS_COMPLETE_DOCUMENTATION.md` (Tasks 1-10) | Code review + API surface inspection |
| Architecture | Microservices spec (Task 4) | Codebase structure review |
| Compliance | Legal & sanctions annex (Task 3) | Code review + policy review |
| UI/UX | Landing page + app designs | Visual inspection + route coverage |
| DevOps/deployment | README + Docker configs | Infrastructure review |
| Security | Security notes in README + compliance doc | Static review |
| Testing | Industry standard + spec | Test coverage review |

**Severity legend:**
- **P0 (Critical)** — Blocks production launch or legal operation.
- **P1 (High)** — Required for meaningful MVP launch with real users.
- **P2 (Medium)** — Important for scale, retention, and operations.
- **P3 (Low)** — Nice-to-have or post-launch optimization.

---

## 3. Functional Gap Matrix

### 3.1 Authentication & User Management

| Requirement | Spec Status | Implementation Status | Gap | Severity | Notes |
|---|---|---|---|---|---|
| User registration | Required | Implemented (`/api/auth/register`) | Minor | P2 | No email verification flow; accounts auto-verified. |
| JWT login | Required | Implemented (`/api/auth/login`) | None | — | Uses bcrypt + JWT. |
| MFA/TOTP | Required | **Not implemented** | Full gap | P1 | Spec requires 2FA (TOTP/SMS). No MFA model or endpoints. |
| Password reset | Required | **Not implemented** | Full gap | P1 | No forgot-password flow. |
| Role-based access | Required | Partial (role field exists) | Partial | P2 | Roles stored but no RBAC enforcement on routes. |
| Company profiles | Required | **Not implemented** | Full gap | P1 | `Company` entity not in code; users are individuals only. |
| KYC verification | Required | **Not implemented** | Full gap | P0 | No KYC upload, screening, or approval workflow. |
| Admin panel | Required | **Not implemented** | Full gap | P1 | No admin UI for user/KYC/order management. |

### 3.2 Product & Demand Management

| Requirement | Spec Status | Implementation Status | Gap | Severity | Notes |
|---|---|---|---|---|---|
| Product CRUD | Required | Implemented | None | — | Basic CRUD works. |
| Multi-language product fields | Required | **Not implemented** | Full gap | P1 | Only single `name` field; no `name_translations`. |
| Hierarchical categories | Required | **Not implemented** | Full gap | P2 | Categories are simple strings; no `Categories` table. |
| Product images/documents | Required | **Not implemented** | Full gap | P2 | No S3 upload integration. |
| Demand CRUD | Required | Implemented (backend) | Partial | P2 | Backend has demands; frontend has no demand page. |
| Quality specifications | Required | **Not implemented** | Full gap | P2 | No structured specs (moisture, grade, etc.). |

### 3.3 AI Pre-Deal System

| Requirement | Spec Status | Implementation Status | Gap | Severity | Notes |
|---|---|---|---|---|---|
| Rule-based matching | Required | Implemented | None | — | Score based on price, distance, reputation, urgency, category. |
| ML-based matching | Required | **Not implemented** | Full gap | P1 | No trained model, no feature engineering pipeline, no model versioning. |
| Cold-start handling | Required | Partial | Partial | P2 | Rule-based fallback exists, but no formal cold-start KPIs or threshold. |
| Price prediction | Required | **Not implemented** | Full gap | P1 | No LSTM/XGBoost model, no external market data integration. |
| Demand analysis | Required | **Not implemented** | Full gap | P2 | No demand forecasting, no search/inquiry signal collection. |
| Pre-deal priority queue | Required | Partial | Partial | P2 | Lead-time logic exists but no Redis queue or scheduler. |
| Deal expiry & re-routing | Required | Partial | Partial | P2 | Expiry exists; no automatic re-routing on rejection. |
| Accept/reject workflow | Required | Implemented | None | — | Both parties can accept/reject. |

### 3.4 Orders & Payments

| Requirement | Spec Status | Implementation Status | Gap | Severity | Notes |
|---|---|---|---|---|---|
| Order creation from pre-deal | Required | **Not implemented** | Full gap | P0 | Pre-deal status changes to `accepted` but no `Order` is created. |
| Order status workflow | Required | **Not implemented** | Full gap | P0 | No `Orders` or `Order_Items` entities. |
| Letter of Credit (L/C) | Required | **Not implemented** | Full gap | P0 | No L/C state machine or bank integration. |
| Documentary Collection (D/P) | Required | **Not implemented** | Full gap | P0 | No D/P flow. |
| Escrow payments | Required | **Not implemented** | Full gap | P0 | No escrow account or release logic. |
| Card payments (Stripe) | Required | **Not implemented** | Full gap | P1 | No Stripe integration. |
| Multi-currency/FX | Required | **Not implemented** | Full gap | P1 | No FX rate service or settlement logic. |
| Invoicing | Required | **Not implemented** | Full gap | P2 | No invoice generation. |
| Commission calculation | Required | **Not implemented** | Full gap | P1 | No commission logic; Master Account commission rates not applied. |

### 3.5 Shipping & Logistics

| Requirement | Spec Status | Implementation Status | Gap | Severity | Notes |
|---|---|---|---|---|---|
| Shipment model | Required | **Not implemented** | Full gap | P1 | No `Shipments` or `Shipment_Tracking_Events` tables. |
| Carrier integration (DHL, Maersk) | Required | **Not implemented** | Full gap | P1 | No carrier APIs or quote logic. |
| Tracking events | Required | **Not implemented** | Full gap | P2 | No tracking webhook handling. |
| Shipping cost estimation | Required | Partial | Partial | P2 | Simple distance-based estimate exists in `ai/matching.py` but no carrier quotes. |
| Customs document handling | Required | **Not implemented** | Full gap | P2 | No document upload for customs. |
| Insurance | Required | **Not implemented** | Full gap | P2 | No insurance option. |

### 3.6 Master Account & Billing

| Requirement | Spec Status | Implementation Status | Gap | Severity | Notes |
|---|---|---|---|---|---|
| Tier model | Required | Implemented (DB model) | None | — | `MasterAccount` table exists. |
| Subscription billing | Required | **Not implemented** | Full gap | P1 | No Stripe Billing integration; no `Subscriptions` table. |
| Upgrade/downgrade logic | Required | **Not implemented** | Full gap | P2 | No proration or effective-date logic. |
| Feature gates | Required | Partial | Partial | P2 | Tier field used for lead time, but no feature-gate enforcement. |
| Affiliate/referral program | Required | **Not implemented** | Full gap | P3 | No referral tracking. |

### 3.7 Notifications

| Requirement | Spec Status | Implementation Status | Gap | Severity | Notes |
|---|---|---|---|---|---|
| In-app notifications | Required | **Not implemented** | Full gap | P1 | No notification model or UI. |
| Push notifications (Firebase) | Required | **Not implemented** | Full gap | P1 | No Firebase integration. |
| Email (SendGrid) | Required | **Not implemented** | Full gap | P1 | No email service. |
| SMS (Twilio) | Required | **Not implemented** | Full gap | P2 | No SMS service. |
| Priority queue by tier | Required | **Not implemented** | Full gap | P2 | No notification priority queue. |
| User preferences | Required | **Not implemented** | Full gap | P2 | No preference management. |

### 3.8 Reputation, Reviews & Disputes

| Requirement | Spec Status | Implementation Status | Gap | Severity | Notes |
|---|---|---|---|---|---|
| Trust score model | Required | Partial | Partial | P2 | `reputation_score` field on User; no `Trust_Scores` table or algorithm. |
| Reviews/Ratings | Required | **Not implemented** | Full gap | P2 | No `Reviews_Ratings` table or UI. |
| Dispute workflow | Required | **Not implemented** | Full gap | P0 | No `Disputes` or `Dispute_Messages` tables. |
| Dispute evidence | Required | **Not implemented** | Full gap | P0 | No evidence upload or decision workflow. |

### 3.9 Compliance & Legal

| Requirement | Spec Status | Implementation Status | Gap | Severity | Notes |
|---|---|---|---|---|---|
| Sanctions screening (OFAC/EU/UN) | Required | **Not implemented** | Full gap | P0 | No screening integration. |
| KYC/AML workflow | Required | **Not implemented** | Full gap | P0 | No KYC service or vendor integration. |
| Audit logging | Required | **Not implemented** | Full gap | P1 | No `Audit_Logs` collection. |
| GDPR/KVKK/data jurisdiction | Required | **Not implemented** | Full gap | P0 | No data residency logic; no privacy controls. |
| Legal text localization | Required | **Not implemented** | Full gap | P1 | No terms/privacy policy documents. |

### 3.10 Localization & RTL

| Requirement | Spec Status | Implementation Status | Gap | Severity | Notes |
|---|---|---|---|---|---|
| RTL support | Required | **Not implemented** | Full gap | P1 | CSS uses left/right physical properties; no `dir=rtl` handling. |
| Multi-language UI | Required | **Not implemented** | Full gap | P1 | No i18n framework or translation files. |
| Arabic/Persian fonts | Required | **Not implemented** | Full gap | P2 | No Noto Sans Arabic / Vazirmatn loaded. |
| Jalali/Hijri calendars | Required | **Not implemented** | Full gap | P2 | No calendar localization. |
| Currency/number formatting | Required | **Not implemented** | Full gap | P2 | No `Intl.NumberFormat` usage; amounts displayed as raw strings. |

### 3.11 Auctions & Long-Term Contracts

| Requirement | Spec Status | Implementation Status | Gap | Severity | Notes |
|---|---|---|---|---|---|
| English ascending auction | Required | **Not implemented** | Full gap | P2 | No auction tables or endpoints. |
| Dutch auction | Required | **Not implemented** | Full gap | P3 | No Dutch auction support. |
| Long-term contracts | Required | **Not implemented** | Full gap | P2 | No contract locking or recurring orders. |

---

## 4. Architecture Gap Matrix

| Spec Requirement | Current State | Gap | Severity | Notes |
|---|---|---|---|---|
| Microservices decomposition | Single FastAPI monolith | Full gap | P1 | All routers in one `app`. No service boundaries. |
| API Gateway (Kong/AWS) | None | Full gap | P1 | Direct client-to-backend calls. |
| Service-to-service REST/gRPC | None | Full gap | P1 | No inter-service calls needed yet because monolith. |
| Event bus (Kafka/RabbitMQ) | None | Full gap | P1 | No async event architecture. |
| Elasticsearch search service | None | Full gap | P2 | Search is simple SQL `ILIKE`. |
| Translation service | None | Full gap | P2 | No translation service. |
| Admin & reporting service | None | Full gap | P1 | No admin capabilities. |
| Audit & compliance service | None | Full gap | P0 | No centralized audit or compliance engine. |
| AI/ML service as separate service | Matching logic in `app/ai/matching.py` | Partial | P2 | Rule-based logic is embedded; ML should be separate service. |
| Redis used for queue | Redis configured but unused | Partial | P2 | Redis is in Docker Compose but not used for notifications/queue. |
| S3 for document/image storage | None | Full gap | P2 | No S3 integration. |
| CDN for static assets | None | Full gap | P3 | No CDN configured. |

---

## 5. Data & Database Gap Matrix

| Spec Requirement | Current State | Gap | Severity | Notes |
|---|---|---|---|---|
| PostgreSQL production schema | SQLite used locally; Supabase URL configured | Partial | P2 | Schema exists but not fully aligned with spec (missing many tables). |
| MongoDB for logs/notifications | Not configured | Full gap | P1 | No MongoDB connection. |
| Entity relationships | Basic relations (User→Product, User→PreDeal) | Partial | P2 | Missing Companies, Orders, Shipments, Disputes, etc. |
| Multi-language JSONB fields | Single string fields | Full gap | P1 | No JSONB translation fields. |
| Audit trail tables | None | Full gap | P0 | No audit tables. |
| Data retention policies | None | Full gap | P1 | No retention configuration. |
| Database migrations | `Base.metadata.create_all()` | Partial | P2 | No Alembic migrations. Production requires versioned migrations. |
| Seeding | Demo seed script exists | None | — | Good for dev. |

---

## 6. UI/UX Gap Matrix

| Page/Feature | Implemented | Gap | Severity | Notes |
|---|---|---|---|---|
| Landing page | Yes | Minor | P2 | Luxury redesign done; needs A/B testing and conversion tracking. |
| Login page | Yes | None | — | Works. |
| Dashboard | Yes | Partial | P2 | Basic stats; missing charts, alerts, and quick actions. |
| Products page | Yes | Partial | P2 | List + create; no edit, bulk upload, or analytics. |
| Pre-deals page | Yes | Partial | P2 | Accept/reject; missing filters, sorting, and history. |
| Demands page | **No** | Full gap | P1 | Backend exists; no frontend page. |
| Orders page | **No** | Full gap | P0 | Orders not implemented. |
| Payments page | **No** | Full gap | P0 | Payments not implemented. |
| Shipments/tracking page | **No** | Full gap | P1 | Not implemented. |
| Admin panel | **No** | Full gap | P1 | Not implemented. |
| KYC upload page | **No** | Full gap | P0 | Not implemented. |
| User profile/settings | **No** | Full gap | P2 | Not implemented. |
| Notifications panel | **No** | Full gap | P1 | Not implemented. |
| Help/FAQ/support | **No** | Full gap | P3 | Not implemented. |
| Mobile responsiveness | Partial | Partial | P2 | Basic responsive classes; needs mobile-specific UX review. |

---

## 7. Deployment & DevOps Gap Matrix

| Requirement | Current State | Gap | Severity | Notes |
|---|---|---|---|---|
| Docker Compose local stack | Implemented | None | — | Works for local dev. |
| Frontend Dockerfile | Implemented | None | — | `Dockerfile.frontend` exists. |
| Backend Dockerfile | Implemented | None | — | `backend/Dockerfile` exists. |
| CI/CD pipeline (GitHub Actions) | **Not implemented** | Full gap | P1 | No `.github/workflows/`. |
| Production backend deployment | **Not implemented** | Full gap | P0 | No AWS/Railway/Render config. |
| Lovable frontend deployment | Ready | Minor | P2 | Lovable can deploy from GitHub. Backend needs separate URL. |
| Environment variable management | `.env.example` only | Partial | P2 | Production secrets management not defined (AWS Secrets Manager, etc.). |
| Monitoring/observability | **Not implemented** | Full gap | P1 | No CloudWatch, Datadog, or Sentry. |
| Logging aggregation | Console logs only | Full gap | P2 | No centralized logging. |
| Health checks | Basic `/health` endpoint | Minor | P3 | Add deeper health checks for DB/Redis. |
| Backup strategy | None | Full gap | P1 | No database backup policy. |
| SSL/TLS | Not configured | Full gap | P1 | Required for production; usually handled by platform (Lovable/AWS). |

---

## 8. Security Gap Matrix

| Requirement | Current State | Gap | Severity | Notes |
|---|---|---|---|---|
| Password hashing (bcrypt) | Implemented | None | — | Uses bcrypt. |
| JWT auth | Implemented | None | — | Uses python-jose. |
| HTTPS/TLS | Not configured | Full gap | P0 | Production must use HTTPS. |
| Input validation | Pydantic schemas | Minor | P2 | Good; add rate limiting and stricter sanitization. |
| SQL injection prevention | SQLAlchemy ORM | None | — | ORM protects against injection. |
| XSS/CSRF | Not explicitly handled | Partial | P2 | No CSRF tokens; frontend uses bearer auth. |
| Rate limiting | Not implemented | Full gap | P1 | No rate limiting on API. |
| CORS | Configured for localhost | Partial | P2 | Must lock down to production domains. |
| Secrets management | `.env` files | Partial | P2 | Use AWS Secrets Manager or similar in production. |
| Data encryption at rest | Not configured | Full gap | P1 | RDS/S3 encryption needed in production. |
| Penetration testing | Not done | Full gap | P1 | Required before production. |
| Dependency scanning | Not configured | Full gap | P2 | No Snyk/Dependabot. |
| Security headers | Not configured | Full gap | P2 | No Helmet.js / HSTS / CSP headers. |
| RBAC enforcement | Not implemented | Full gap | P1 | Roles exist but no access control. |
| Audit logging | Not implemented | Full gap | P0 | No security audit trail. |

---

## 9. Testing & QA Gap Matrix

| Requirement | Current State | Gap | Severity | Notes |
|---|---|---|---|---|
| Unit tests (backend) | **Not implemented** | Full gap | P1 | No pytest suite. |
| Unit tests (frontend) | **Not implemented** | Full gap | P1 | No Jest/Vitest tests. |
| Integration tests | **Not implemented** | Full gap | P1 | No API integration tests. |
| E2E tests | **Not implemented** | Full gap | P2 | No Cypress/Playwright. |
| Load testing | **Not implemented** | Full gap | P2 | No k6/Artillery. |
| API documentation (OpenAPI) | Auto-generated by FastAPI | None | — | Available at `/docs`. |
| Test data / fixtures | `seed.py` exists | Partial | P2 | Add dedicated test fixtures. |
| CI test automation | **Not implemented** | Full gap | P1 | No GitHub Actions test job. |

---

## 10. Risk Register

| Risk | Likelihood | Impact | Mitigation | Owner |
|---|---|---|---|---|
| Sanctions violation due to missing screening | High | Critical | Implement OFAC/EU/UN screening before any Iran-related launch. | Compliance/Legal |
| Payment fraud/chargebacks without escrow | High | High | Implement escrow for all deals until trust established. | Product/Engineering |
| KYC fraud allows bad actors on platform | Medium | High | Integrate KYC vendor + manual review for high-risk countries. | Compliance |
| Backend monolith cannot scale | Medium | Medium | Plan microservices decomposition post-MVP; use load balancing now. | Engineering |
| No production backend deployment | High | Critical | Deploy backend to AWS/Railway/Render before public launch. | DevOps |
| Data breach due to weak secrets management | Medium | Critical | Use AWS Secrets Manager, encrypt at rest, enforce HTTPS. | Security/DevOps |
| Model produces poor matches at launch | Medium | High | Use rule-based fallback with human curation until ML threshold met. | Data/AI |
| Disputes handled ad-hoc | Medium | High | Build formal dispute workflow before handling real transactions. | Product/Legal |
| RTL/localization bugs alienate MENA users | High | Medium | Implement i18n and RTL early; test with native speakers. | Frontend |
| Lack of monitoring causes long outages | Medium | Medium | Add Sentry/CloudWatch before launch. | DevOps |

---

## 11. Prioritized Roadmap to Production

### Phase 1: Compliance Foundation (Blocks Launch) — 4-6 weeks

| Priority | Task | Why Critical |
|---|---|---|
| P0 | Implement OFAC/EU/UN sanctions screening | Legal requirement for any Iran/Iraq trade. |
| P0 | Build KYC/AML workflow + vendor integration | Cannot onboard real users without verification. |
| P0 | Implement dispute workflow + evidence handling | Required for escrow release and trust. |
| P0 | Create Orders/Order_Items schema and API | Core transaction entity missing. |
| P0 | Deploy backend to production (AWS/Railway/Render) | Frontend cannot function without backend. |
| P0 | Set up HTTPS, secrets management, and encryption | Security baseline. |

### Phase 2: Payment & Logistics (Required for Real Transactions) — 6-8 weeks

| Priority | Task | Why Critical |
|---|---|---|
| P1 | Implement escrow payments + release conditions | Buyer/seller protection. |
| P1 | Implement L/C and D/P state machines | Critical for B2B trade. |
| P1 | Integrate Stripe for non-sanctioned card payments | Turkey/EU buyers. |
| P1 | Implement shipment model + carrier tracking (DHL/Maersk) | Buyers need delivery tracking. |
| P1 | Multi-currency display and FX locking | Cross-border pricing. |
| P1 | Commission calculation and invoicing | Platform monetization. |

### Phase 3: Master Accounts & Notifications — 3-4 weeks

| Priority | Task | Why Critical |
|---|---|---|
| P1 | Stripe Billing subscription integration | Revenue. |
| P1 | Push/email/SMS notification service | User engagement. |
| P2 | Tier feature gates and priority queue | Master Account value proposition. |
| P2 | Referral program | Growth. |

### Phase 4: AI/ML & Scale — 4-6 weeks

| Priority | Task | Why Critical |
|---|---|---|
| P1 | Deploy ML-based matching model | Core differentiator. |
| P2 | Price prediction model | Dynamic pricing. |
| P2 | Demand analysis dashboard | Market intelligence. |
| P2 | Migrate to microservices if scale requires | Operational scalability. |
| P2 | Elasticsearch for search | Search quality. |

### Phase 5: Localization & Polish — 3-4 weeks

| Priority | Task | Why Critical |
|---|---|---|
| P1 | i18n framework + RTL support | MENA user experience. |
| P2 | Arabic/Persian fonts and calendars | Cultural fit. |
| P2 | Currency/number formatting | Professional UX. |
| P2 | Admin panel | Operations. |
| P2 | Testing suite + CI/CD | Quality assurance. |

---

## 12. Estimated Effort to Production-Ready

| Phase | Duration | Engineering Effort | Main Deliverables |
|---|---|---|---|
| Phase 1: Compliance Foundation | 4-6 weeks | 3-4 engineers | Sanctions, KYC, orders, backend deployment, security baseline |
| Phase 2: Payments & Logistics | 6-8 weeks | 4-5 engineers | Escrow, L/C, D/P, Stripe, shipping tracking, FX |
| Phase 3: Master Accounts & Notifications | 3-4 weeks | 2-3 engineers | Subscriptions, notifications, feature gates |
| Phase 4: AI/ML & Scale | 4-6 weeks | 3-4 engineers | ML matching, price prediction, demand analytics, search |
| Phase 5: Localization & Polish | 3-4 weeks | 2-3 engineers | i18n/RTL, admin panel, testing, CI/CD |
| **Total** | **20-28 weeks** | **14-19 engineer-months** | Production-ready platform |

[ASSUMPTION: This estimate assumes a 14-person team with 2-3 senior engineers and dedicated compliance/legal support.]

---

## 13. Quick-Win Recommendations (Immediate Next Steps)

If the goal is to deploy a functional demo quickly:

1. **Deploy backend to Railway or Render** (fastest path).
2. **Point Lovable frontend to the deployed backend** via `VITE_API_BASE_URL`.
3. **Fix remaining build issues** — run `bun run build` and resolve any errors.
4. **Add a basic Orders page** so the pre-deal → order flow is visible, even if payments are mocked.
5. **Add a simple notification toast** so users see success/error messages across the app.

If the goal is real production launch:

1. Do not launch before **sanctions screening + KYC + escrow + dispute workflow** are implemented.
2. Hire or retain **sanctions counsel** and **payment/compliance experts** immediately.
3. Choose **one corridor** (e.g., Iraq → Turkey dates) for a controlled beta with vetted users.

---

## 14. Conclusion

The current Tureep AI+ MVP is a solid **technical proof-of-concept** and demonstrates the core AI matching concept. However, it is approximately **30-40% complete** relative to the production specification. The biggest blockers to production are compliance (sanctions/KYC), payments (escrow/L/C/D/P), orders, and backend deployment. These should be the immediate focus before any public launch or real-money transactions.

**Recommended immediate priority order:**
1. Compliance & sanctions (P0)
2. Orders + payments (P0)
3. Production backend deployment (P0)
4. KYC/AML (P0)
5. Notifications + Master Account billing (P1)
6. ML model deployment (P1)
7. Localization/RTL (P1)
8. Testing/CI/CD/security hardening (P1)
