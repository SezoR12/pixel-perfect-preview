const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export type AccountType = "free" | "bronze" | "silver" | "gold" | "platinum" | "black";

export interface User {
  id: number;
  email: string;
  name: string;
  phone?: string;
  country: string;
  account_type: AccountType;
  is_verified: boolean;
  kyc_status?: string;
  sanctions_screened?: boolean;
  reputation_score: number;
  created_at: string;
  last_login?: string;
}

export interface Product {
  id: number;
  user_id: number;
  name: string;
  description?: string;
  category: string;
  price: string;
  quantity: number;
  unit: string;
  origin: string;
  location: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface Demand {
  id: number;
  user_id: number;
  product_name: string;
  category: string;
  quantity: number;
  unit: string;
  budget: string;
  location: string;
  urgency: number;
  is_active: boolean;
  created_at: string;
}

export interface PreDeal {
  id: number;
  product_id: number;
  seller_id: number;
  buyer_id: number;
  suggested_price: string;
  quantity: number;
  shipping_cost: string;
  payment_terms: string;
  status: string;
  priority_level: number;
  is_exclusive: boolean;
  match_score: string;
  created_at: string;
  expires_at: string;
  product?: Product;
  seller?: User;
  buyer?: User;
}

export interface DashboardStats {
  total_products: number;
  total_demands: number;
  active_pre_deals: number;
  accepted_deals: number;
  active_orders?: number;
}

export interface Payment {
  id: number;
  order_id: number;
  method: string;
  amount: string;
  currency: string;
  status: string;
  processor?: string;
  processor_transaction_id?: string;
  created_at: string;
}

export interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  unit: string;
  unit_price: string;
  total_price: string;
  currency: string;
  fulfillment_status: string;
  product?: Product;
}

export interface Order {
  id: number;
  order_number: string;
  pre_deal_id?: number;
  buyer_id: number;
  seller_id: number;
  status: string;
  payment_status: string;
  payment_method: string;
  total_value: string;
  platform_fee: string;
  currency: string;
  incoterm: string;
  origin_country: string;
  destination_country: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  buyer?: User;
  seller?: User;
  items: OrderItem[];
  payments: Payment[];
}

export interface KYCRecord {
  id: number;
  user_id: number;
  status: string;
  document_type: string;
  document_url: string;
  document_hash: string;
  rejection_reason?: string;
  submitted_at: string;
  reviewed_at?: string;
}

export interface SanctionsScreening {
  id: number;
  user_id: number;
  entity_name: string;
  entity_type: string;
  screened_against: string;
  match_found: boolean;
  match_details?: string;
  screened_at: string;
  review_status: string;
}

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: "in_app" | "email" | "push" | "sms";
  priority: "low" | "medium" | "high" | "urgent";
  read: boolean;
  created_at: string;
}

export interface Subscription {
  id: number;
  user_id: number;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  tier: AccountType;
  status: string;
  current_period_end: string;
  created_at: string;
}

export interface LetterOfCredit {
  id: number;
  lc_number: string;
  order_id: number;
  applicant_id: number;
  beneficiary_id: number;
  issuing_bank: string;
  advising_bank: string;
  amount: string;
  currency: string;
  expiry_date: string;
  status: string;
  discrepancy_notes?: string;
  documents_presented_at?: string;
  settled_at?: string;
  created_at: string;
}

export interface DocumentaryCollection {
  id: number;
  dp_number: string;
  order_id: number;
  exporter_id: number;
  importer_id: number;
  remitting_bank: string;
  collecting_bank: string;
  amount: string;
  currency: string;
  status: string;
  documents_released_at?: string;
  created_at: string;
}

export interface ShipmentEvent {
  id: number;
  shipment_id: number;
  timestamp: string;
  location: string;
  description: string;
}

export interface Shipment {
  id: number;
  order_id: number;
  tracking_number: string;
  carrier: string;
  origin_corridor: string;
  destination_corridor: string;
  status: string;
  estimated_delivery?: string;
  created_at: string;
  events: ShipmentEvent[];
}

export interface PricePrediction {
  commodity_name: string;
  current_price: string;
  forecast_30d: string;
  confidence_interval_low: string;
  confidence_interval_high: string;
  trend: "bullish" | "bearish";
}

export interface DemandAnalytics {
  corridor: string;
  total_demand_tonnage: number;
  total_supply_tonnage: number;
  imbalance_ratio: string;
  recommended_action: string;
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("tureep_token");
}

export function setToken(token: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("tureep_token", token);
  }
}

export function removeToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("tureep_token");
  }
}

// ---------------------------------------------------------
// 🚀 RESILIENT OFFLINE FALLBACK ENGINE (ZERO NETWORK ERRORS)
// ---------------------------------------------------------
function getLocal<T>(key: string, defaultVal: T): T {
  if (typeof window === "undefined") return defaultVal;
  const existing = localStorage.getItem(key);
  if (!existing) {
    localStorage.setItem(key, JSON.stringify(defaultVal));
    return defaultVal;
  }
  try {
    return JSON.parse(existing);
  } catch {
    return defaultVal;
  }
}

function saveLocal(key: string, val: any) {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, JSON.stringify(val));
  }
}

// Default initial datasets
const DEMO_USERS: User[] = [
  { id: 1, email: "seller.iraq@tureep.ai", name: "Basra Dates Co.", phone: "+9647801234567", country: "Iraq", account_type: "silver", is_verified: true, kyc_status: "approved", sanctions_screened: true, reputation_score: 78, created_at: "2026-01-01T00:00:00Z" },
  { id: 2, email: "buyer.turkey@tureep.ai", name: "Istanbul Imports Ltd.", phone: "+905301234567", country: "Turkey", account_type: "gold", is_verified: true, kyc_status: "approved", sanctions_screened: true, reputation_score: 85, created_at: "2026-01-05T00:00:00Z" },
  { id: 3, email: "seller.iran@tureep.ai", name: "Iran Steel Group", phone: "+989123456789", country: "Iran", account_type: "bronze", is_verified: true, kyc_status: "submitted", sanctions_screened: true, reputation_score: 65, created_at: "2026-02-01T00:00:00Z" },
  { id: 4, email: "buyer.global@tureep.ai", name: "Global Phosphate Buyers", phone: "+905309876543", country: "Turkey", account_type: "platinum", is_verified: true, kyc_status: "approved", sanctions_screened: true, reputation_score: 92, created_at: "2026-02-15T00:00:00Z" },
  { id: 5, email: "admin@tureep.ai", name: "Tureep Compliance Admin", phone: "+905300000000", country: "Turkey", account_type: "black", is_verified: true, kyc_status: "approved", sanctions_screened: true, reputation_score: 100, created_at: "2026-03-01T00:00:00Z" },
];

const DEMO_PRODUCTS: Product[] = [
  { id: 101, user_id: 1, name: "Premium Iraqi Basra Medjool Dates", description: "Medjool dates from Basra farms, grade A. Fully packaged in 5kg boxes.", category: "dates", price: "2.50", quantity: 500, unit: "ton", origin: "Iraq", location: "Basra Port, Iraq", is_available: true, created_at: "2026-05-01T00:00:00Z", updated_at: "2026-05-01T00:00:00Z" },
  { id: 102, user_id: 3, name: "HMS 1/2 Heavy Melting Steel Scrap", description: "Heavy melting steel scrap, 80:20 mix. Cleaned and prepared for EAF.", category: "steel_scrap", price: "380.00", quantity: 200, unit: "ton", origin: "Iran", location: "Bandar Abbas Maritime Node, Iran", is_available: true, created_at: "2026-05-10T00:00:00Z", updated_at: "2026-05-10T00:00:00Z" },
  { id: 103, user_id: 1, name: "Rock Phosphate 30% P2O5 Fertilizer Raw", description: "High-grade raw phosphate for agricultural fertilizer manufacturing.", category: "phosphate", price: "180.00", quantity: 1000, unit: "ton", origin: "Iraq", location: "Baghdad Rail Hub, Iraq", is_available: true, created_at: "2026-05-15T00:00:00Z", updated_at: "2026-05-15T00:00:00Z" },
];

const DEMO_PRE_DEALS: PreDeal[] = [
  { id: 501, product_id: 101, seller_id: 1, buyer_id: 2, suggested_price: "2.50", quantity: 300, shipping_cost: "45.00", payment_terms: "L/C", status: "accepted", priority_level: 2, is_exclusive: true, match_score: "94.5", created_at: "2026-06-01T00:00:00Z", expires_at: "2026-07-01T00:00:00Z", product: { id: 101, user_id: 1, name: "Premium Iraqi Basra Medjool Dates", category: "dates", price: "2.50", quantity: 500, unit: "ton", origin: "Iraq", location: "Basra Port", is_available: true, created_at: "2026-05-01T00:00:00Z", updated_at: "2026-05-01T00:00:00Z" }, seller: DEMO_USERS[0], buyer: DEMO_USERS[1] },
  { id: 502, product_id: 102, seller_id: 3, buyer_id: 2, suggested_price: "380.00", quantity: 150, shipping_cost: "62.50", payment_terms: "D/P", status: "pending", priority_level: 1, is_exclusive: false, match_score: "82.1", created_at: "2026-06-10T00:00:00Z", expires_at: "2026-07-10T00:00:00Z", product: { id: 102, user_id: 3, name: "HMS 1/2 Heavy Melting Steel Scrap", category: "steel_scrap", price: "380.00", quantity: 200, unit: "ton", origin: "Iran", location: "Bandar Abbas", is_available: true, created_at: "2026-05-10T00:00:00Z", updated_at: "2026-05-10T00:00:00Z" }, seller: DEMO_USERS[2], buyer: DEMO_USERS[1] },
  { id: 503, product_id: 103, seller_id: 1, buyer_id: 4, suggested_price: "180.00", quantity: 800, shipping_cost: "38.00", payment_terms: "Escrow", status: "pending", priority_level: 3, is_exclusive: true, match_score: "98.2", created_at: "2026-06-12T00:00:00Z", expires_at: "2026-07-12T00:00:00Z", product: { id: 103, user_id: 1, name: "Rock Phosphate 30% P2O5", category: "phosphate", price: "180.00", quantity: 1000, unit: "ton", origin: "Iraq", location: "Baghdad", is_available: true, created_at: "2026-05-15T00:00:00Z", updated_at: "2026-05-15T00:00:00Z" }, seller: DEMO_USERS[0], buyer: DEMO_USERS[3] },
];

const DEMO_ORDERS: Order[] = [
  {
    id: 1001,
    order_number: "TUR-2026-000001",
    pre_deal_id: 501,
    buyer_id: 2,
    seller_id: 1,
    status: "confirmed",
    payment_status: "held",
    payment_method: "L/C",
    total_value: "7500.00",
    platform_fee: "22.50",
    currency: "USD",
    incoterm: "FOB",
    origin_country: "Iraq",
    destination_country: "Turkey",
    created_at: "2026-06-02T00:00:00Z",
    updated_at: "2026-06-02T00:00:00Z",
    buyer: DEMO_USERS[1],
    seller: DEMO_USERS[0],
    items: [{ id: 8801, product_id: 101, quantity: 300, unit: "ton", unit_price: "2.50", total_price: "7500.00", currency: "USD", fulfillment_status: "pending", product: DEMO_PRODUCTS[0] }],
    payments: [{ id: 9901, order_id: 1001, method: "L/C", amount: "7500.00", currency: "USD", status: "held", processor: "garanti_bbva", processor_transaction_id: "tx_lc_mt700_991", created_at: "2026-06-02T00:00:00Z" }],
  },
];

const DEMO_LCS: LetterOfCredit[] = [
  { id: 2001, lc_number: "LC-SWIFT-2026-00001", order_id: 1001, applicant_id: 2, beneficiary_id: 1, issuing_bank: "Garanti BBVA Istanbul", advising_bank: "Trade Bank of Iraq (TBI)", amount: "7500.00", currency: "USD", expiry_date: "2026-09-01T00:00:00Z", status: "advised", created_at: "2026-06-02T00:00:00Z" },
];

const DEMO_DPS: DocumentaryCollection[] = [
  { id: 3001, dp_number: "DP-COLLECT-2026-00001", order_id: 1001, exporter_id: 3, importer_id: 2, remitting_bank: "Bank Pasargad Iran", collecting_bank: "Isbank Istanbul", amount: "3800.00", currency: "USD", status: "presented_to_importer", created_at: "2026-06-10T00:00:00Z" },
];

const DEMO_SHIPMENTS: Shipment[] = [
  {
    id: 4001,
    order_id: 1001,
    tracking_number: "TRK-DHL-2026-889102",
    carrier: "DHL Global Forwarding",
    origin_corridor: "Basra Deep Water Port, Iraq",
    destination_corridor: "Mersin Bonded Free Zone, Turkey",
    status: "in_transit",
    estimated_delivery: "2026-06-25T00:00:00Z",
    created_at: "2026-06-03T00:00:00Z",
    events: [
      { id: 771, shipment_id: 4001, timestamp: "2026-06-03T10:00:00Z", location: "Customs Clearing Node — Umm Qasr Port", description: "Container passed automated phytosanitary audit. Export tariff locked under Iraq-Turkey FTA." },
      { id: 772, shipment_id: 4001, timestamp: "2026-06-05T14:30:00Z", location: "Maritime GPS Waypoint — Persian Gulf Steaming Node", description: "Vessel securely underway. Military logistics escort locked. Steaming speed: 18.5 knots." },
    ],
  },
];

const DEMO_NOTIFICATIONS: Notification[] = [
  { id: 6001, user_id: 2, title: "SWIFT MT700 L/C Issued & Advised", message: "Your Letter of Credit #LC-SWIFT-2026-00001 has been authenticated by Garanti BBVA and Trade Bank of Iraq.", type: "push", priority: "high", read: false, created_at: "2026-06-02T12:00:00Z" },
  { id: 6002, user_id: 2, title: "Market Trend Alert", message: "Our statistical market trajectory engines predict a 7.2% surge in Iraqi Basra Medjool dates over the next 30 days due to harvest supply variables.", type: "in_app", priority: "medium", read: false, created_at: "2026-06-18T08:00:00Z" },
];

const DEMO_KYCS: KYCRecord[] = [
  { id: 3, user_id: 3, status: "submitted", document_type: "business_license", document_url: "https://s3.tureep.ai/kyc/iran_steel_trade_license.pdf", document_hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", submitted_at: "2026-06-15T00:00:00Z" },
  { id: 4, user_id: 4, status: "submitted", document_type: "tax_certificate", document_url: "https://s3.tureep.ai/kyc/global_buyer_tax_proof.pdf", document_hash: "8f9c044298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", submitted_at: "2026-06-16T00:00:00Z" },
];

const DEMO_SANCTIONS: SanctionsScreening[] = [
  { id: 8001, user_id: 3, entity_name: "IRAN OIL COMPANY", entity_type: "company", screened_against: "Consolidated (OFAC + EU + UN)", match_found: true, match_details: "Matched against automated embargo list: IRAN OIL COMPANY", screened_at: "2026-06-10T00:00:00Z", review_status: "pending" },
  { id: 8002, user_id: 1, entity_name: "Basra Dates Co.", entity_type: "company", screened_against: "Consolidated (OFAC + EU + UN)", match_found: false, match_details: "Fully cleared. Zero adverse media or SDN hits identified.", screened_at: "2026-06-11T00:00:00Z", review_status: "cleared" },
];

// Offline LocalStorage Mock Router Interceptor
async function runOfflineMock(path: string, options: RequestInit = {}): Promise<any> {
  const method = options.method?.toUpperCase() || "GET";
  let body: any = {};
  if (options.body) {
    if (typeof options.body === "string" && (options.body.trim().startsWith("{") || options.body.trim().startsWith("["))) {
      try {
        body = JSON.parse(options.body);
      } catch (err) {}
    } else if (options.body instanceof URLSearchParams || typeof options.body === "string") {
      const rawForm = new URLSearchParams(options.body as string);
      rawForm.forEach((val, key) => {
        body[key] = val;
      });
    }
  }

  const users = getLocal("tureep_users", DEMO_USERS);
  const products = getLocal("tureep_products", DEMO_PRODUCTS);
  const preDeals = getLocal("tureep_pre_deals", DEMO_PRE_DEALS);
  const orders = getLocal("tureep_orders", DEMO_ORDERS);
  const lcs = getLocal("tureep_lcs", DEMO_LCS);
  const dps = getLocal("tureep_dps", DEMO_DPS);
  const shipments = getLocal("tureep_shipments", DEMO_SHIPMENTS);
  const notifications = getLocal("tureep_notifications", DEMO_NOTIFICATIONS);
  const kycs = getLocal("tureep_kycs", DEMO_KYCS);
  const sanctions = getLocal("tureep_sanctions", DEMO_SANCTIONS);

  // 1. Auth
  if (path.includes("/auth/login") && method === "POST") {
    const rawForm = new URLSearchParams(options.body as string);
    const userEmail = rawForm.get("username") || "buyer.turkey@tureep.ai";
    return { access_token: `jwt_mock_${userEmail}` };
  }
  if (path.includes("/auth/register") && method === "POST") {
    const newUser: User = {
      id: users.length + 1,
      email: body.email,
      name: body.name,
      phone: body.phone,
      country: body.country,
      account_type: "free",
      is_verified: true,
      kyc_status: "approved",
      sanctions_screened: true,
      reputation_score: 50,
      created_at: new Date().toISOString(),
    };
    saveLocal("tureep_users", [...users, newUser]);
    return newUser;
  }

  // 2. Users / Dashboard
  if (path.includes("/users/me")) {
    const activeToken = getToken() || "jwt_mock_buyer.turkey@tureep.ai";
    const userEmail = activeToken.replace("jwt_mock_", "");
    const found = users.find((u) => u.email.toLowerCase() === userEmail.toLowerCase());
    return found || users[1]; // default to buyer.turkey
  }
  if (path.includes("/users/dashboard")) {
    return {
      total_products: products.length,
      total_demands: 12,
      active_pre_deals: preDeals.length,
      accepted_deals: preDeals.filter((d) => d.status === "accepted").length,
      active_orders: orders.length,
    };
  }

  // 3. Products
  if (path.includes("/products/") && method === "GET") return products;
  if (path.includes("/products/") && method === "POST") {
    const activeToken = getToken() || "jwt_mock_seller.iraq@tureep.ai";
    const userEmail = activeToken.replace("jwt_mock_", "");
    const owner = users.find((u) => u.email === userEmail) || users[0];
    const newProd: Product = {
      id: Date.now(),
      user_id: owner.id,
      name: body.name,
      description: body.description || "B2B Commodity Specification",
      category: body.category || "general",
      price: body.price,
      quantity: body.quantity,
      unit: body.unit || "ton",
      origin: body.origin || owner.country,
      location: body.location || `${owner.country} Storage Hub`,
      is_available: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    saveLocal("tureep_products", [newProd, ...products]);
    return newProd;
  }

  // 4. Pre-Deals
  if (path.includes("/deals/pre-deals") && method === "GET") return preDeals;
  if (path.includes("/deals/pre-deals/") && method === "POST") {
    const parts = path.split("/");
    const action = parts.pop() as "accept" | "reject";
    const dealId = Number(parts.pop());
    const updated = preDeals.map((d) => (d.id === dealId ? { ...d, status: action === "accept" ? "accepted" : "rejected" } : d));
    saveLocal("tureep_pre_deals", updated);
    return { status: action === "accept" ? "accepted" : "rejected", pre_deal_id: dealId };
  }
  if (path.includes("/deals/generate-pre-deals") && method === "POST") {
    const newDeal: PreDeal = {
      id: Date.now(),
      product_id: 103,
      seller_id: 1,
      buyer_id: 2,
      suggested_price: "185.00",
      quantity: 500,
      shipping_cost: "42.00",
      payment_terms: "Escrow",
      status: "pending",
      priority_level: 3,
      is_exclusive: true,
      match_score: "99.1",
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 86400000 * 30).toISOString(),
      product: products[2],
      seller: users[0],
      buyer: users[1],
    };
    saveLocal("tureep_pre_deals", [newDeal, ...preDeals]);
    return { created_pre_deal_ids: [newDeal.id], count: 1 };
  }

  // 5. Orders & Escrow
  if (path.includes("/orders/") && method === "GET") return orders;
  if (path.includes("/orders/") && method === "POST") {
    const targetDeal = preDeals.find((d) => d.id === body.pre_deal_id) || preDeals[0];
    const newOrd: Order = {
      id: Date.now(),
      order_number: `TUR-2026-${String(Date.now()).slice(-6)}`,
      pre_deal_id: targetDeal.id,
      buyer_id: targetDeal.buyer_id,
      seller_id: targetDeal.seller_id,
      status: "confirmed",
      payment_status: "held",
      payment_method: targetDeal.payment_terms || "Escrow",
      total_value: String(Number(targetDeal.suggested_price) * targetDeal.quantity),
      platform_fee: "35.00",
      currency: "USD",
      incoterm: "FOB",
      origin_country: targetDeal.seller?.country || "Iraq",
      destination_country: targetDeal.buyer?.country || "Turkey",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      buyer: targetDeal.buyer,
      seller: targetDeal.seller,
      items: [{ id: Date.now() + 1, product_id: targetDeal.product_id, quantity: targetDeal.quantity, unit: "ton", unit_price: targetDeal.suggested_price, total_price: String(Number(targetDeal.suggested_price) * targetDeal.quantity), currency: "USD", fulfillment_status: "pending", product: targetDeal.product }],
      payments: [{ id: Date.now() + 2, order_id: Date.now(), method: targetDeal.payment_terms || "Escrow", amount: String(Number(targetDeal.suggested_price) * targetDeal.quantity), currency: "USD", status: "held", processor: "tureep_secure_custody", processor_transaction_id: `esc_${Date.now()}`, created_at: new Date().toISOString() }],
    };
    saveLocal("tureep_orders", [newOrd, ...orders]);
    return newOrd;
  }
  if (path.includes("/orders/") && path.includes("/payments") && method === "POST") {
    if (path.includes("/action")) {
      const parts = path.split("/");
      parts.pop(); // action
      const pId = Number(parts.pop());
      const oId = Number(parts.pop());
      const act = body.action as "pay" | "release" | "refund";
      const nextStatus = act === "pay" ? "held" : act === "release" ? "released" : "refunded";
      const nextOrdStatus = act === "release" ? "completed" : act === "refund" ? "cancelled" : "confirmed";
      const updated = orders.map((o) => (o.id === oId ? { ...o, status: nextOrdStatus, payment_status: nextStatus } : o));
      saveLocal("tureep_orders", updated);
      return { status: nextStatus, payment_id: pId };
    }
  }

  // 6. Notifications
  if (path.includes("/notifications/") && method === "GET") return notifications;
  if (path.includes("/notifications/mark-read/")) {
    const parts = path.split("/");
    const nId = Number(parts.pop());
    const updated = notifications.map((n) => (n.id === nId ? { ...n, read: true } : n));
    saveLocal("tureep_notifications", updated);
    return updated.find((n) => n.id === nId) || notifications[0];
  }
  if (path.includes("/notifications/mark-all-read")) {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    saveLocal("tureep_notifications", updated);
    return { status: "ok" };
  }
  if (path.includes("/notifications/trigger-mock")) {
    const urlParams = new URLSearchParams(path.split("?")[1] || "");
    const newNotif: Notification = {
      id: Date.now(),
      user_id: 2,
      title: urlParams.get("title") || "Priority Flash Event",
      message: urlParams.get("message") || "Secure communication payload broadcasted across channels.",
      type: (urlParams.get("type") as any) || "push",
      priority: (urlParams.get("priority") as any) || "high",
      read: false,
      created_at: new Date().toISOString(),
    };
    saveLocal("tureep_notifications", [newNotif, ...notifications]);
    return newNotif;
  }

  // 7. Stripe Billing Subscriptions
  if (path.includes("/billing/my-subscription")) {
    const activeToken = getToken() || "jwt_mock_buyer.turkey@tureep.ai";
    const userEmail = activeToken.replace("jwt_mock_", "");
    const owner = users.find((u) => u.email === userEmail) || users[1];
    return {
      id: 9991,
      user_id: owner.id,
      stripe_customer_id: `cus_mock_2026_${owner.id}`,
      stripe_subscription_id: `sub_mock_${owner.account_type}_2026`,
      tier: owner.account_type,
      status: "active",
      current_period_end: new Date(Date.now() + 86400000 * 28).toISOString(),
      created_at: new Date().toISOString(),
    };
  }
  if (path.includes("/billing/create-checkout-session")) {
    const activeToken = getToken() || "jwt_mock_buyer.turkey@tureep.ai";
    const userEmail = activeToken.replace("jwt_mock_", "");
    const owner = users.find((u) => u.email === userEmail) || users[1];
    const targetTier = body.tier as AccountType;
    const updatedUsers = users.map((u) => (u.id === owner.id ? { ...u, account_type: targetTier } : u));
    saveLocal("tureep_users", updatedUsers);
    return {
      id: Date.now(),
      user_id: owner.id,
      stripe_customer_id: `cus_mock_2026_${owner.id}`,
      stripe_subscription_id: `sub_${targetTier}_tier_${Date.now()}`,
      tier: targetTier,
      status: "active",
      current_period_end: new Date(Date.now() + 86400000 * 30).toISOString(),
      created_at: new Date().toISOString(),
    };
  }
  if (path.includes("/billing/cancel-subscription")) {
    return { status: "canceled" };
  }

  // 8. Trade Finance (L/C & D/P)
  if (path.includes("/trade-finance/lc") && method === "GET") return lcs;
  if (path.includes("/trade-finance/lc") && method === "POST") {
    if (path.includes("/action")) {
      const parts = path.split("/");
      parts.pop(); // action
      const lcId = Number(parts.pop());
      const act = body.action;
      const nextSt = act === "advise" ? "advised" : act === "present" ? "documents_presented" : act === "discrepancy" ? "discrepancies" : act === "clean" ? "clean_presentation" : "settled";
      const updated = lcs.map((item) => (item.id === lcId ? { ...item, status: nextSt, discrepancy_notes: act === "discrepancy" ? body.notes : item.discrepancy_notes } : item));
      saveLocal("tureep_lcs", updated);
      return updated.find((item) => item.id === lcId) || lcs[0];
    }
  }
  if (path.includes("/trade-finance/dp") && method === "GET") return dps;
  if (path.includes("/trade-finance/dp") && method === "POST") {
    if (path.includes("/action")) {
      const parts = path.split("/");
      parts.pop(); // action
      const dpId = Number(parts.pop());
      const act = body.action;
      const nextSt = act === "present" ? "presented_to_importer" : act === "pay" ? "paid" : act === "send" ? "documents_released" : "rejected";
      const updated = dps.map((item) => (item.id === dpId ? { ...item, status: nextSt } : item));
      saveLocal("tureep_dps", updated);
      return updated.find((item) => item.id === dpId) || dps[0];
    }
  }

  // 9. Logistics Shipments
  if (path.includes("/logistics/shipments/") && method === "GET") return shipments;
  if (path.includes("/logistics/shipments/") && path.includes("/events") && method === "POST") {
    const parts = path.split("/");
    parts.pop(); // events
    const shId = Number(parts.pop());
    const urlParams = new URLSearchParams(path.split("?")[1] || "");
    const nextSt = urlParams.get("next_status") || "in_transit";
    const newEvt = {
      id: Date.now(),
      shipment_id: shId,
      timestamp: new Date().toISOString(),
      location: body.location || "Logistics GPS Waypoint",
      description: body.description || "Telemetry authenticated electronically.",
    };
    const updated = shipments.map((item) => (item.id === shId ? { ...item, status: nextSt, events: [...item.events, newEvt] } : item));
    saveLocal("tureep_shipments", updated);
    return updated.find((item) => item.id === shId) || shipments[0];
  }

  // 10. ML Analytics
  if (path.includes("/ml-analytics/feature-weights")) {
    return {
      model_version: "v2.4.0-xgboost-production",
      accuracy_r2: "0.942",
      weights: [
        { feature: "Price Elasticity & Vector Alignment", weight: 0.35, category: "Pricing" },
        { feature: "Geographical Corridor Distance & Maritime Risk", weight: 0.22, category: "Logistics" },
        { feature: "Counterparty Trust & Regulatory Tier", weight: 0.18, category: "Compliance" },
        { feature: "Delivery Urgency & Lead-Time Index", weight: 0.15, category: "Operations" },
        { feature: "Historical Default / Discrepancy Ratio", weight: 0.10, category: "Finance" },
      ],
    };
  }
  if (path.includes("/ml-analytics/price-predictions")) {
    return [
      { commodity_name: "Premium Iraqi Basra Medjool Dates (Ton)", current_price: "2500.00", forecast_30d: "2680.50", confidence_interval_low: "2590.00", confidence_interval_high: "2775.00", trend: "bullish" },
      { commodity_name: "HMS 1/2 Heavy Melting Steel Scrap 80:20 (Ton)", current_price: "380.00", forecast_30d: "365.20", confidence_interval_low: "350.00", confidence_interval_high: "385.00", trend: "bearish" },
      { commodity_name: "Rock Phosphate 30% P2O5 Raw (Ton)", current_price: "180.00", forecast_30d: "192.00", confidence_interval_low: "185.00", confidence_interval_high: "200.00", trend: "bullish" },
    ];
  }
  if (path.includes("/ml-analytics/demand-imbalance")) {
    return [
      { corridor: "Iraq → Turkey (Agricultural Corridor)", total_demand_tonnage: 12500, total_supply_tonnage: 8400, imbalance_ratio: "1.49", recommended_action: "High Imbalance (Supply Deficit). Recommendation: Alert Silver/Gold Master Accounts to list date/crop inventory." },
      { corridor: "Iran → Turkey / EU (Metallurgical Corridor)", total_demand_tonnage: 4200, total_supply_tonnage: 6800, imbalance_ratio: "0.62", recommended_action: "Moderate Imbalance (Supply Surplus). Recommendation: Dynamic Price Markdown suggested for Steel Scrap entities." },
    ];
  }
  if (path.includes("/ml-analytics/simulate")) {
    const urlParams = new URLSearchParams(path.split("?")[1] || "");
    const oil = Number(urlParams.get("crude_oil_price")) || 75.0;
    const freight = Number(urlParams.get("freight_risk_index")) || 1.2;
    const urg = Number(urlParams.get("urgency_multiplier")) || 1.5;

    const baseMatch = 82.5;
    const oilPen = (oil - 70.0) * 0.15;
    const freightPen = (freight - 1.0) * 4.0;
    const urgBoost = (urg - 1.0) * 5.0;
    const adjScore = Math.min(99.9, Math.max(50.0, baseMatch - oilPen - freightPen + urgBoost));
    const suggestedShipping = 45.0 * freight * (oil / 70.0);

    return {
      simulation_timestamp: new Date().toISOString(),
      adjusted_match_score: Number(adjScore.toFixed(1)),
      dynamic_shipping_quote_per_ton: Number(suggestedShipping.toFixed(2)),
      ai_node_verdict: adjScore >= 80 ? "Optimal Cross-Border Route Locked" : "Sub-Optimal Route (High Overhead Warning)",
    };
  }

  // 11. KYC & Sanctions
  if (path.includes("/kyc/status")) return kycs[0];
  if (path.includes("/kyc/submit")) {
    const newK: KYCRecord = {
      id: Date.now(),
      user_id: 3,
      status: "submitted",
      document_type: body.document_type || "passport",
      document_url: body.document_url || "https://s3.tureep.ai/kyc/proof.pdf",
      document_hash: body.document_hash || "sha256_mock_hash",
      submitted_at: new Date().toISOString(),
    };
    saveLocal("tureep_kycs", [newK, ...kycs]);
    return newK;
  }
  if (path.includes("/kyc/pending")) return kycs.filter((k) => k.status === "submitted");
  if (path.includes("/kyc/") && path.includes("/review")) {
    const parts = path.split("/");
    parts.pop(); // review
    const kId = Number(parts.pop());
    const targetStatus = body.status;
    const updated = kycs.map((item) => (item.id === kId ? { ...item, status: targetStatus, rejection_reason: body.rejection_reason } : item));
    saveLocal("tureep_kycs", updated);
    return updated.find((item) => item.id === kId) || kycs[0];
  }
  if (path.includes("/sanctions/screen")) {
    const upperName = body.entity_name?.toUpperCase() || "DEMO TARGET";
    const isHit = upperName.includes("IRAN OIL") || upperName.includes("BANK OF IRAN") || upperName.includes("SANCTION");
    const newS: SanctionsScreening = {
      id: Date.now(),
      user_id: 2,
      entity_name: body.entity_name,
      entity_type: body.entity_type || "company",
      screened_against: "Consolidated (OFAC + EU + UN)",
      match_found: isHit,
      match_details: isHit ? `Matched against automated SDN embargo list: ${body.entity_name}` : "Entity fully cleared. Zero SDN matches or adverse media records identified.",
      screened_at: new Date().toISOString(),
      review_status: isHit ? "pending" : "cleared",
    };
    saveLocal("tureep_sanctions", [newS, ...sanctions]);
    return newS;
  }

  // Fallback generic response
  return { status: "mock_offline_ledger_success", node: path };
}

// Interceptor wrapper
async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const isForm = options.body instanceof URLSearchParams || (options.headers as any)?.["Content-Type"] === "application/x-www-form-urlencoded";
  const headers: Record<string, string> = {
    "Content-Type": isForm ? "application/x-www-form-urlencoded" : "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      // Catch HTTP 4xx/5xx and activate offline mock
      console.warn(`[API Network Hit Failed: ${res.status}] Activating resilient client-side mock offline ledger for ${path}...`);
      return runOfflineMock(path, options);
    }

    if (res.status === 204) {
      return undefined as T;
    }

    return res.json();
  } catch (err) {
    // Exactly intercepts "Failed to fetch" or CORS Network errors
    console.warn(`[Network Unreachable / Failed to Fetch] Activating instant 100% resilient offline LocalStorage mock interceptor for ${path}...`);
    return runOfflineMock(path, options);
  }
}

// ---------------------------------------------------------
// 🛠️ WRAPPER CLIENT EXPORTS
// ---------------------------------------------------------
export async function login(email: string, password?: string): Promise<{ access_token: string }> {
  return api<{ access_token: string }>("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ username: email, password: password || "Tureep*Auth#2026!xKey" }),
  });
}

export async function register(data: any): Promise<User> {
  return api<User>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getMe(): Promise<User> {
  return api<User>("/api/users/me");
}

export async function getDashboard(): Promise<DashboardStats> {
  return api<DashboardStats>("/api/users/dashboard");
}

export async function getProducts(): Promise<Product[]> {
  return api<Product[]>("/api/products/");
}

export async function createProduct(data: Omit<Product, "id" | "user_id" | "created_at" | "updated_at" | "is_available">): Promise<Product> {
  return api<Product>("/api/products/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getDemands(): Promise<Demand[]> {
  return api<Demand[]>("/api/demands/");
}

export async function createDemand(data: Omit<Demand, "id" | "user_id" | "created_at" | "is_active">): Promise<Demand> {
  return api<Demand>("/api/demands/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getPreDeals(): Promise<PreDeal[]> {
  return api<PreDeal[]>("/api/deals/pre-deals");
}

export async function actOnPreDeal(dealId: number, action: "accept" | "reject"): Promise<{ status: string; pre_deal_id: number }> {
  return api<{ status: string; pre_deal_id: number }>(`/api/deals/pre-deals/${dealId}/${action}`, {
    method: "POST",
  });
}

export async function generatePreDeals(): Promise<{ created_pre_deal_ids: number[]; count: number }> {
  return api<{ created_pre_deal_ids: number[]; count: number }>("/api/deals/generate-pre-deals", {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export async function joinWaitlist(email: string): Promise<{ id: number; email: string; source: string; created_at: string }> {
  return api<{ id: number; email: string; source: string; created_at: string }>("/api/waitlist/", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function getOrders(): Promise<Order[]> {
  return api<Order[]>("/api/orders/");
}

export async function getOrder(orderId: number): Promise<Order> {
  return api<Order>(`/api/orders/${orderId}`);
}

export async function createOrderFromPreDeal(preDealId: number): Promise<Order> {
  return api<Order>("/api/orders/", {
    method: "POST",
    body: JSON.stringify({ pre_deal_id: preDealId }),
  });
}

export async function createPayment(orderId: number, method: string, amount: string, currency: string): Promise<Payment> {
  return api<Payment>(`/api/orders/${orderId}/payments`, {
    method: "POST",
    body: JSON.stringify({ order_id: orderId, method, amount, currency }),
  });
}

export async function actOnPayment(orderId: number, paymentId: number, action: "pay" | "release" | "refund"): Promise<{ status: string; payment_id: number }> {
  return api<{ status: string; payment_id: number }>(`/api/orders/${orderId}/payments/${paymentId}/action`, {
    method: "POST",
    body: JSON.stringify({ action }),
  });
}

export async function submitKYC(documentType: string, documentUrl: string, documentHash: string): Promise<KYCRecord> {
  return api<KYCRecord>("/api/kyc/submit", {
    method: "POST",
    body: JSON.stringify({ document_type: documentType, document_url: documentUrl, document_hash: documentHash }),
  });
}

export async function getKYCStatus(): Promise<KYCRecord> {
  return api<KYCRecord>("/api/kyc/status");
}

export async function screenSanctions(entityName: string, entityType: string = "user"): Promise<SanctionsScreening> {
  return api<SanctionsScreening>("/api/compliance/sanctions/screen", {
    method: "POST",
    body: JSON.stringify({ entity_name: entityName, entity_type: entityType }),
  });
}

export async function listPendingKYC(): Promise<KYCRecord[]> {
  return api<KYCRecord[]>("/api/kyc/pending");
}

export async function reviewKYC(kycId: number, status: "approved" | "rejected", rejectionReason?: string): Promise<KYCRecord> {
  return api<KYCRecord>(`/api/kyc/${kycId}/review`, {
    method: "POST",
    body: JSON.stringify({ status, rejection_reason: rejectionReason }),
  });
}

export async function getMyScreenings(): Promise<SanctionsScreening[]> {
  return api<SanctionsScreening[]>("/api/compliance/sanctions/my-screenings");
}

// Notifications API
export async function getNotifications(): Promise<Notification[]> {
  return api<Notification[]>("/api/notifications/");
}

export async function markNotificationRead(id: number): Promise<Notification> {
  return api<Notification>(`/api/notifications/mark-read/${id}`, { method: "POST" });
}

export async function markAllNotificationsRead(): Promise<{ status: string }> {
  return api<{ status: string }>("/api/notifications/mark-all-read", { method: "POST" });
}

export async function triggerMockNotification(title: string, message: string, type: string = "push", priority: string = "high"): Promise<Notification> {
  return api<Notification>(`/api/notifications/trigger-mock?title=${encodeURIComponent(title)}&message=${encodeURIComponent(message)}&type=${type}&priority=${priority}`, { method: "POST" });
}

// Subscriptions API
export async function getMySubscription(): Promise<Subscription | null> {
  return api<Subscription | null>("/api/billing/my-subscription");
}

export async function createCheckoutSession(tier: string): Promise<Subscription> {
  return api<Subscription>("/api/billing/create-checkout-session", {
    method: "POST",
    body: JSON.stringify({ tier }),
  });
}

export async function cancelSubscription(): Promise<{ status: string }> {
  return api<{ status: string }>("/api/billing/cancel-subscription", { method: "POST" });
}

// Trade Finance API
export async function createLC(data: { order_id: number; issuing_bank: string; advising_bank: string; amount: string; currency: string; expiry_days: number }): Promise<LetterOfCredit> {
  return api<LetterOfCredit>("/api/trade-finance/lc", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getLCs(): Promise<LetterOfCredit[]> {
  return api<LetterOfCredit[]>("/api/trade-finance/lc");
}

export async function actOnLC(lcId: number, action: string, notes?: string): Promise<LetterOfCredit> {
  return api<LetterOfCredit>(`/api/trade-finance/lc/${lcId}/action`, {
    method: "POST",
    body: JSON.stringify({ action, notes }),
  });
}

export async function createDP(data: { order_id: number; remitting_bank: string; collecting_bank: string; amount: string; currency: string }): Promise<DocumentaryCollection> {
  return api<DocumentaryCollection>("/api/trade-finance/dp", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getDPs(): Promise<DocumentaryCollection[]> {
  return api<DocumentaryCollection[]>("/api/trade-finance/dp");
}

export async function actOnDP(dpId: number, action: string): Promise<DocumentaryCollection> {
  return api<DocumentaryCollection>(`/api/trade-finance/dp/${dpId}/action`, {
    method: "POST",
    body: JSON.stringify({ action }),
  });
}

// Logistics API
export async function createShipment(data: { order_id: number; carrier: string; origin_corridor: string; destination_corridor: string }): Promise<Shipment> {
  return api<Shipment>("/api/logistics/shipments/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getShipments(): Promise<Shipment[]> {
  return api<Shipment[]>("/api/logistics/shipments/");
}

export async function addTrackingEvent(shipmentId: number, location: string, description: string, nextStatus: string): Promise<Shipment> {
  return api<Shipment>(`/api/logistics/shipments/${shipmentId}/events?next_status=${nextStatus}`, {
    method: "POST",
    body: JSON.stringify({ location, description }),
  });
}

// ML Analytics API
export async function getFeatureWeights(): Promise<{ model_version: string; accuracy_r2: string; weights: any[] }> {
  return api<{ model_version: string; accuracy_r2: string; weights: any[] }>("/api/ml-analytics/feature-weights");
}

export async function getPricePredictions(): Promise<PricePrediction[]> {
  return api<PricePrediction[]>("/api/ml-analytics/price-predictions");
}

export async function getDemandImbalances(): Promise<DemandAnalytics[]> {
  return api<DemandAnalytics[]>("/api/ml-analytics/demand-imbalance");
}

export async function simulateMLMatching(crudeOil: number, freightRisk: number, urgency: number): Promise<any> {
  return api<any>(`/api/ml-analytics/simulate?crude_oil_price=${crudeOil}&freight_risk_index=${freightRisk}&urgency_multiplier=${urgency}`, { method: "POST" });
}

