-- ====================================================================
-- 🔒 SUPABASE ROW LEVEL SECURITY (RLS) ENTERPRISE MIGRATION SPEC
-- Application: Tureep AI+ B2B Cross-Border Trade Terminal
-- Date: 2026-06-19
-- ====================================================================

-- 1. Enable RLS across all application tables
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

-- 2. Define Pristine Security Policies

-- USERS TABLE
CREATE POLICY "Users can read own user record" 
  ON users FOR SELECT 
  USING (auth.uid() = id OR email = auth.jwt()->>'email');

CREATE POLICY "Users can update own profile" 
  ON users FOR UPDATE 
  USING (auth.uid() = id OR email = auth.jwt()->>'email');

-- MASTER ACCOUNTS TABLE
CREATE POLICY "Users can access own Master Account subscriptions" 
  ON master_accounts FOR SELECT 
  USING (user_id = auth.uid());

-- PRODUCTS TABLE
CREATE POLICY "Sellers can manage own products" 
  ON products FOR ALL 
  USING (user_id = auth.uid());

CREATE POLICY "Anyone can read available B2B products" 
  ON products FOR SELECT 
  USING (is_available = true);

-- DEMANDS TABLE
CREATE POLICY "Buyers can manage own commercial demands" 
  ON demands FOR ALL 
  USING (user_id = auth.uid());

CREATE POLICY "Anyone can read active buyer demands" 
  ON demands FOR SELECT 
  USING (is_active = true);

-- PRE-DEALS TABLE
CREATE POLICY "Trading counterparties can access suggested pre-deals" 
  ON pre_deals FOR SELECT 
  USING (seller_id = auth.uid() OR buyer_id = auth.uid());

CREATE POLICY "Counterparties can accept or reject pre-deals" 
  ON pre_deals FOR UPDATE 
  USING (seller_id = auth.uid() OR buyer_id = auth.uid());

-- ORDERS TABLE
CREATE POLICY "Counterparties can read own confirmed orders" 
  ON orders FOR SELECT 
  USING (buyer_id = auth.uid() OR seller_id = auth.uid());

-- ORDER ITEMS TABLE
CREATE POLICY "Counterparties can read items for own orders" 
  ON order_items FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND (orders.buyer_id = auth.uid() OR orders.seller_id = auth.uid())
    )
  );

-- PAYMENTS TABLE
CREATE POLICY "Counterparties can access own escrow and wire payments" 
  ON payments FOR SELECT 
  USING (payer_id = auth.uid() OR payee_id = auth.uid());

-- KYC VERIFICATIONS TABLE
CREATE POLICY "Users can read own submitted KYC documentation" 
  ON kyc_verifications FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert new KYC documentation proofs" 
  ON kyc_verifications FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Compliance Officers (Admins) can manage all KYC records" 
  ON kyc_verifications FOR ALL 
  USING (auth.jwt()->>'role' = 'admin');

-- SANCTIONS SCREENINGS TABLE
CREATE POLICY "Users can read own historical sanctions sweeps" 
  ON sanctions_screenings FOR SELECT 
  USING (user_id = auth.uid());

-- NOTIFICATIONS TABLE
CREATE POLICY "Users can read own multidispactch notifications" 
  ON notifications FOR SELECT 
  USING (user_id = auth.uid());

-- SUBSCRIPTIONS TABLE
CREATE POLICY "Users can access own Stripe billing rollings" 
  ON subscriptions FOR SELECT 
  USING (user_id = auth.uid());

-- TRADE FINANCE INSTRUMENTS (L/C & D/P)
CREATE POLICY "Applicants and beneficiaries can access Letters of Credit" 
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
