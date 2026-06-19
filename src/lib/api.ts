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
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("tureep_token");
}

async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json();
}

export async function login(email: string, password: string): Promise<{ access_token: string }> {
  const form = new URLSearchParams();
  form.append("username", email);
  form.append("password", password);
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Login failed" }));
    throw new Error(err.detail || "Login failed");
  }
  return res.json();
}

export async function register(data: {
  email: string;
  password: string;
  name: string;
  phone?: string;
  country: string;
}): Promise<User> {
  return api<User>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
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


