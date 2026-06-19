# Institutional Access Control Matrix & Multi-Tenant RBAC Ledger

**Document Reference:** `DOC_SEC_MATRIX_2026_04`  
**Platform:** Tureep AI+ Institutional MENA Commodity Trade Terminal  
**Classification:** Internal Engineering Spec & Security Access Blueprint

---

## 🏛️ 1. Complete Institutional Bounded Context & Architecture

Tureep AI+ operates an exceptionally strict **Role-Based Access Control (RBAC)** architecture combined with gotrue multi-tenant **Row Level Security (RLS)** PostgreSQL security constraints. Counterparties operate within one of six highly distinct Master Account levels. Platform routes and microservices enforce absolute gatekeeper verification prior to executing any DDL or REST actions.

---

## 🔒 2. Complete Tabular Access Control Matrix

The following matrix explicitly defines exact resource CRUD capabilities across our **6 Sovereign Master Account Tiers**:

| B2B Commercial Resource | 🟢 Free Tier | 🥉 Bronze Tier | 🥈 Silver Tier | 🥇 Gold Tier | 💎 Platinum Sovereign | 🖤 Sovereign Black Admin |
|---|---|---|---|---|---|---|
| **Public Spot Catalog (`/products`)** | 🔍 View Only | 🔍 View Only | 📝 Full CRUD (Own) | 📝 Full CRUD (Own) | 📝 Full CRUD (Own) | 👑 Absolute Full CRUD (All) |
| **Commercial Purchasing Inquiries (`/demands`)** | 🔍 View Only | 🔍 View Only | 🔍 View Only | 📝 Full CRUD (Own) | 📝 Full CRUD (Own) | 👑 Absolute Full CRUD (All) |
| **Bilateral Pre-Deals (`/pre-deals`)** | ⏱️ View (+120h) | ⏱️ View (+72h) | ⏱️ View (+48h) | ⏱️ View (+24h) | ⚡ Instantaneous Zero Delay | 👑 Absolute Instant CRUD |
| **Accepted Deal Auto-Conversion (`/orders`)**| 🚫 No Access | 🚫 No Access | 🤝 Execute (Own) | 🤝 Execute (Own) | 🤝 Execute (Own) | 👑 Absolute Custody Unseal |
| **Neutral Escrow Custody (`/trade-finance`)**| 🚫 No Access | 🚫 No Access | 🤝 Deposit (Own) | 🤝 Deposit/Release | 🤝 Separate Transfer Unseal | 👑 Administrative Separate Wire |
| **Sanctions Sweep Actions (`/sanctions`)** | 🔍 View Own | 🔍 View Own | 🔍 View Own | 🔍 View Own | 🔍 View Own | 🔎 Proactive Review / Purge |
| **Accredited KYC Audits (`/kyc`)** | 🔍 View Own | 🔍 View Own | 🔍 View Own | 🔍 View Own | 🔍 View Own | 🏛️ Formal Compliance Approval |
| **Carrier EDI Telemetry (`/shipments`)** | 🔍 View Track | 🔍 View Track | 📍 Time-Stamp Way-point | 📍 Time-Stamp Way-point | 📍 Electronic Telemetry Track | 🔎 Administrative Haulage Sync |

---

## 📐 3. Decoupled Microservice Gatekeeper Logic

### 3.1 Highly Proactive Resource Guard (`require_ownership`)
In FastAPI Python microservice routes, controllers actively authenticate Counterparty entities to completely guarantee that standard market actors never view third-party internal profiles or alter external order states:
```python
def require_ownership(resource_user_id: int, current_user: User):
    if resource_user_id != current_user.id and current_user.account_type.value != "black":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Strict Gatekeeper: Uncompromisable ownership verification failure. B2B Commercial Counterparty is not authorized to inspect or alter this counterparty ledger."
        )
```

### 3.2 Pristine Supabase Gotrue `UUID` PostgreSQL Row Level Security (RLS)
At the raw PostgreSQL cloud database tier, gotrue UUID RLS evaluations run continuous security assertions. For example, our multi-tenant Order policies enforce:
```sql
CREATE POLICY "Sovereign Counterparty Execution Policy"
ON orders FOR ALL
TO authenticated
USING (
  auth.uid() = buyer_id OR 
  auth.uid() = seller_id OR 
  (SELECT account_type FROM users WHERE id = auth.uid()) = 'black'
);
```

---

## 🚀 4. Automated User Role Switching (Terminal Desk)
Our interactive frontend TanStack Start login interface (`login.tsx`) is shipped with incredibly fast **1-Click Gatekeeper Bypass Buttons** enabling instant live contextual demonstrations for compliance and executive officers.

* Hitting **`Silver Seller (Iraq)`** authenticates instantly with Master Account `#2` (`seller.iraq@tureep.ai`) triggering a **48-hour matching visibility delay**.
* Hitting **`Gold Buyer (Turkey)`** authenticates instantly with Master Account `#1` (`buyer.turkey@tureep.ai`) triggering a **24-hour SLA window** with fully authorized Escrow release features.
* Hitting **`Compliance Officer`** authenticates instantly with Sovereign Black Master `#3` (`admin@tureep.ai`) --- fully granting multi-tenant operational approval desk access across the entire Middle Eastern Middle Eastern trade cluster!
