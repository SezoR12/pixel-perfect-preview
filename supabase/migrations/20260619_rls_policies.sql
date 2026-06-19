-- ====================================================================
-- 🏗️ COMPLETE ENTERPRISE UUID DDL & ROW LEVEL SECURITY (RLS) LEDGER
-- Application: Tureep AI+ B2B Cross-Border Trade Terminal
-- Date: 2026-06-19
-- Idempotent Specification: Upgrades all BIGINT IDs to fully compliant Supabase Gotrue UUIDs
-- ====================================================================

-- --------------------------------------------------------------------
-- SECTION 1: CLEAN UP LEGACY BIGINT SCHEMAS
-- --------------------------------------------------------------------

DROP TABLE IF EXISTS waitlist CASCADE;
DROP TABLE IF EXISTS shipment_events CASCADE;
DROP TABLE IF EXISTS shipments CASCADE;
DROP TABLE IF EXISTS documentary_collections CASCADE;
DROP TABLE IF EXISTS letters_of_credit CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS sanctions_screenings CASCADE;
DROP TABLE IF EXISTS kyc_verifications CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS pre_deals CASCADE;
DROP TABLE IF EXISTS demands CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS master_accounts CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- --------------------------------------------------------------------
-- SECTION 2: ENTERPRISE POSTGRESQL SCHEMA DEFINITION (UUID DDL)
-- --------------------------------------------------------------------

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    country VARCHAR(100) NOT NULL,
    account_type VARCHAR(50) DEFAULT 'free' NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    kyc_status VARCHAR(50) DEFAULT 'pending' NOT NULL,
    sanctions_screened BOOLEAN DEFAULT FALSE,
    sanctions_screened_at TIMESTAMP WITH TIME ZONE,
    reputation_score INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    last_login TIMESTAMP WITH TIME ZONE
);

CREATE TABLE master_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    level VARCHAR(50) NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    monthly_price DECIMAL(10, 2) NOT NULL
);

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity >= 0),
    unit VARCHAR(20) NOT NULL,
    origin VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

CREATE TABLE demands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity >= 0),
    unit VARCHAR(20) NOT NULL,
    budget DECIMAL(10, 2) NOT NULL,
    location VARCHAR(255) NOT NULL,
    urgency INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

CREATE TABLE pre_deals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    seller_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    buyer_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    suggested_price DECIMAL(10, 2) NOT NULL,
    quantity INTEGER NOT NULL,
    shipping_cost DECIMAL(10, 2) DEFAULT 0,
    payment_terms VARCHAR(20) DEFAULT 'Escrow',
    status VARCHAR(50) DEFAULT 'pending' NOT NULL,
    seller_response VARCHAR(20) DEFAULT 'pending',
    buyer_response VARCHAR(20) DEFAULT 'pending',
    priority_level INTEGER DEFAULT 0,
    is_exclusive BOOLEAN DEFAULT FALSE,
    match_score DECIMAL(5, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    pre_deal_id UUID REFERENCES pre_deals(id) ON DELETE SET NULL,
    buyer_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    seller_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'pending' NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'Escrow' NOT NULL,
    total_value DECIMAL(15, 2) NOT NULL,
    platform_fee DECIMAL(15, 2) DEFAULT 0,
    currency VARCHAR(3) NOT NULL,
    incoterm VARCHAR(10) NOT NULL,
    origin_country VARCHAR(100) NOT NULL,
    destination_country VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    quantity INTEGER NOT NULL,
    unit VARCHAR(20) NOT NULL,
    unit_price DECIMAL(15, 4) NOT NULL,
    total_price DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    fulfillment_status VARCHAR(20) DEFAULT 'pending'
);

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    payer_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    payee_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    method VARCHAR(50) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' NOT NULL,
    processor VARCHAR(50),
    processor_transaction_id VARCHAR(255),
    escrow_release_condition VARCHAR(50),
    escrow_released_at TIMESTAMP WITH TIME ZONE,
    extra_data TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

CREATE TABLE kyc_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    status VARCHAR(50) DEFAULT 'submitted' NOT NULL,
    document_type VARCHAR(50) NOT NULL,
    document_url VARCHAR(500) NOT NULL,
    document_hash VARCHAR(64) NOT NULL,
    rejection_reason TEXT,
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    next_review_date TIMESTAMP WITH TIME ZONE,
    extra_data TEXT
);

CREATE TABLE sanctions_screenings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_name VARCHAR(255) NOT NULL,
    screened_against VARCHAR(50) NOT NULL,
    match_found BOOLEAN DEFAULT FALSE NOT NULL,
    match_details TEXT,
    screened_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    review_status VARCHAR(20) DEFAULT 'pending'
);

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'in_app' NOT NULL,
    priority VARCHAR(50) DEFAULT 'medium' NOT NULL,
    read BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    stripe_customer_id VARCHAR(100) NOT NULL,
    stripe_subscription_id VARCHAR(100) NOT NULL,
    tier VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'active' NOT NULL,
    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

CREATE TABLE letters_of_credit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lc_number VARCHAR(100) UNIQUE NOT NULL,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    applicant_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    beneficiary_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    issuing_bank VARCHAR(255) NOT NULL,
    advising_bank VARCHAR(255) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) DEFAULT 'draft' NOT NULL,
    discrepancy_notes TEXT,
    documents_presented_at TIMESTAMP WITH TIME ZONE,
    settled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

CREATE TABLE documentary_collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dp_number VARCHAR(100) UNIQUE NOT NULL,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    exporter_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    importer_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    remitting_bank VARCHAR(255) NOT NULL,
    collecting_bank VARCHAR(255) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    status VARCHAR(50) DEFAULT 'draft' NOT NULL,
    documents_released_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

CREATE TABLE shipments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    tracking_number VARCHAR(100) UNIQUE NOT NULL,
    carrier VARCHAR(100) NOT NULL,
    origin_corridor VARCHAR(100) NOT NULL,
    destination_corridor VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'label_created' NOT NULL,
    estimated_delivery TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

CREATE TABLE shipment_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id UUID REFERENCES shipments(id) ON DELETE CASCADE NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
    location VARCHAR(255) NOT NULL,
    description TEXT NOT NULL
);

CREATE TABLE waitlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    source VARCHAR(100) DEFAULT 'landing_page',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- --------------------------------------------------------------------
-- SECTION 3: ROW LEVEL SECURITY (RLS) MULTI-TENANT POLICIES
-- --------------------------------------------------------------------

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE demands ENABLE ROW LEVEL SECURITY;
ALTER TABLE pre_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE sanctions_screenings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE letters_of_credit ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentary_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipment_events ENABLE ROW LEVEL SECURITY;

-- USERS TABLE (UUID = UUID flawless evaluation)
CREATE POLICY "Users can read own Profile" 
  ON users FOR SELECT 
  USING (auth.uid() = id OR email = auth.jwt()->>'email');

CREATE POLICY "Users can update own Profile" 
  ON users FOR UPDATE 
  USING (auth.uid() = id OR email = auth.jwt()->>'email');

-- MASTER ACCOUNTS TABLE
CREATE POLICY "Users can access own Master Account rollings" 
  ON master_accounts FOR SELECT 
  USING (user_id = auth.uid());

-- PRODUCTS TABLE
CREATE POLICY "Sellers can manage own B2B products" 
  ON products FOR ALL 
  USING (user_id = auth.uid());

CREATE POLICY "Anyone can read available B2B products catalog" 
  ON products FOR SELECT 
  USING (is_available = true);

-- DEMANDS TABLE
CREATE POLICY "Buyers can manage own demands" 
  ON demands FOR ALL 
  USING (user_id = auth.uid());

CREATE POLICY "Anyone can read active buyer demands" 
  ON demands FOR SELECT 
  USING (is_active = true);

-- PRE-DEALS TABLE
CREATE POLICY "Counterparties can view active pre-deals" 
  ON pre_deals FOR SELECT 
  USING (seller_id = auth.uid() OR buyer_id = auth.uid());

CREATE POLICY "Counterparties can accept or reject pre-deals" 
  ON pre_deals FOR UPDATE 
  USING (seller_id = auth.uid() OR buyer_id = auth.uid());

-- ORDERS TABLE
CREATE POLICY "Counterparties can read confirmed transactions" 
  ON orders FOR SELECT 
  USING (buyer_id = auth.uid() OR seller_id = auth.uid());

-- ORDER ITEMS TABLE
CREATE POLICY "Counterparties can query items for own transactions" 
  ON order_items FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND (orders.buyer_id = auth.uid() OR orders.seller_id = auth.uid())
    )
  );

-- PAYMENTS TABLE
CREATE POLICY "Counterparties can view escrow custody and wire states" 
  ON payments FOR SELECT 
  USING (payer_id = auth.uid() OR payee_id = auth.uid());

-- KYC VERIFICATIONS TABLE
CREATE POLICY "Users can inspect own submitted regulatory KYC" 
  ON kyc_verifications FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can submit new corporate regulatory documentation" 
  ON kyc_verifications FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Compliance Officers receive universal KYC management access" 
  ON kyc_verifications FOR ALL 
  USING (auth.jwt()->>'role' = 'admin');

-- SANCTIONS SCREENINGS TABLE
CREATE POLICY "Users can query historical regulatory sweeps" 
  ON sanctions_screenings FOR SELECT 
  USING (user_id = auth.uid());

-- NOTIFICATIONS TABLE
CREATE POLICY "Users can view own multidispactch messages" 
  ON notifications FOR SELECT 
  USING (user_id = auth.uid());

-- SUBSCRIPTIONS TABLE
CREATE POLICY "Users can read own Stripe billing tiers" 
  ON subscriptions FOR SELECT 
  USING (user_id = auth.uid());

-- TRADE FINANCE INSTRUMENTS (L/C & D/P)
CREATE POLICY "Applicants and beneficiaries can access Letters of Credit state" 
  ON letters_of_credit FOR SELECT 
  USING (applicant_id = auth.uid() OR beneficiary_id = auth.uid());

CREATE POLICY "Exporters and importers can access Documentary Collections" 
  ON documentary_collections FOR SELECT 
  USING (exporter_id = auth.uid() OR importer_id = auth.uid());

-- SHIPMENTS TABLE
CREATE POLICY "Counterparties can track container logistics manifests" 
  ON shipments FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = shipments.order_id 
      AND (orders.buyer_id = auth.uid() OR orders.seller_id = auth.uid())
    )
  );

-- SHIPMENT EVENTS TABLE
CREATE POLICY "Counterparties can read satellite GPS telemetry" 
  ON shipment_events FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM shipments 
      JOIN orders ON orders.id = shipments.order_id
      WHERE shipments.id = shipment_events.shipment_id 
      AND (orders.buyer_id = auth.uid() OR orders.seller_id = auth.uid())
    )
  );
