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
