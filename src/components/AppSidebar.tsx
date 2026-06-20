import React, { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { logoutWithSupabase } from "@/lib/supabase";
import { useI18n, Language } from "@/lib/i18n";
import {
  LayoutDashboard,
  Building2,
  Package,
  ClipboardList,
  Handshake,
  ShoppingCart,
  FileCheck2,
  Shield,
  LogOut,
  Lock,
  CreditCard,
  Truck,
  Sparkles,
  Bell,
  Network,
  Globe,
  Database,
  Layers,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Laptop,
} from "lucide-react";

interface AppSidebarProps {
  activeRoute: string;
}

export function AppSidebar({ activeRoute }: AppSidebarProps) {
  const navigate = useNavigate();
  const { language, setLanguage, t, dir } = useI18n();
  const [collapsed, setCollapsed] = useState(false);
  const [themeMode, setThemeMode] = useState<"light" | "dark" | "system">("dark");

  async function logout() {
    await logoutWithSupabase();
    navigate({ to: "/login" });
  }

  const toggleTheme = (mode: "light" | "dark" | "system") => {
    setThemeMode(mode);
    if (typeof window !== "undefined") {
      if (mode === "dark") {
        document.documentElement.classList.add("dark");
      } else if (mode === "light") {
        document.documentElement.classList.remove("dark");
      } else {
        const isSystemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        if (isSystemDark) document.documentElement.classList.add("dark");
        else document.documentElement.classList.remove("dark");
      }
    }
  };

  const menuSections = [
    {
      title: "Command Desk",
      items: [
        { id: "dashboard", label: t("nav.dashboard", "Dashboard"), path: "/dashboard", icon: LayoutDashboard, shortcut: "⌘1" },
        { id: "profile", label: t("nav.profile", "Company Hub"), path: "/profile", icon: Building2, shortcut: "⌘2" },
      ],
    },
    {
      title: "Commercial Execution",
      items: [
        { id: "products", label: t("nav.products", "Spot Catalog"), path: "/products", icon: Package, shortcut: "⌘3" },
        { id: "demands", label: t("nav.demands", "Inquiries Desk"), path: "/demands", icon: ClipboardList, shortcut: "⌘4" },
        { id: "pre-deals", label: t("nav.pre_deals", "Bilateral Hub"), path: "/pre-deals", icon: Handshake, shortcut: "⌘5" },
        { id: "orders", label: t("nav.orders", "Orders Manifests"), path: "/orders", icon: ShoppingCart, shortcut: "⌘6" },
      ],
    },
    {
      title: "Trade Logistics & Escrow",
      items: [
        { id: "trade-finance", label: t("nav.finance", "Trade Finance Instruments"), path: "/trade-finance", icon: CreditCard, shortcut: "⌘7" },
        { id: "shipments", label: t("nav.shipments", "Carrier EDI Waypoints"), path: "/shipments", icon: Truck, shortcut: "⌘8" },
        { id: "billing", label: t("nav.billing", "SLA Bureau Upgrade"), path: "/billing", icon: Globe, shortcut: "⌘9" },
      ],
    },
    {
      title: "Compliance & Sovereign AI",
      items: [
        { id: "ml-analytics", label: t("nav.analytics", "Smart Matching AI"), path: "/ml-analytics", icon: Sparkles, shortcut: "⇧A" },
        { id: "kyc", label: t("nav.kyc", "Corporate KYC/AML Audits"), path: "/kyc", icon: FileCheck2, shortcut: "⇧K" },
        { id: "sanctions", label: t("nav.sanctions", "Global Sanctions Sweep"), path: "/sanctions", icon: Shield, shortcut: "⇧S" },
      ],
    },
    {
      title: "Engineering Topology",
      items: [
        { id: "workflow", label: t("nav.workflow", "7-Stage Trade Explorer"), path: "/workflow", icon: Layers, shortcut: "⌥W" },
        { id: "microservices-spec", label: t("nav.microservices", "Microservices Bureau"), path: "/microservices-spec", icon: Network, shortcut: "⌥M" },
        { id: "supabase-portal", label: t("nav.supabase", "Gotrue Database RLS Desk"), path: "/supabase-portal", icon: Database, shortcut: "⌥D" },
        { id: "notifications", label: t("nav.notifications", "Event Broadcast Feeds"), path: "/notifications", icon: Bell, shortcut: "⌥N" },
        { id: "hardening-notes", label: t("nav.hardening", "mTLS Network Manual"), path: "/hardening-notes", icon: Lock, shortcut: "⌥H" },
      ],
    },
  ];

  const normalizedActive = activeRoute.toLowerCase();

  return (
    <aside
      className={`relative sticky top-0 left-0 h-screen z-50 flex flex-col justify-between bg-surface-950 text-surface-50 border-r border-surface-800 transition-all duration-300 select-none shadow-2xl font-sans ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* 1. App Identifier Brand Bar (Linear Style) */}
      <div className="h-16 px-4 border-b border-surface-800 flex items-center justify-between select-none bg-surface-900/60 backdrop-blur-md">
        <div className="flex items-center gap-3 cursor-pointer overflow-hidden" onClick={() => navigate({ to: "/" })}>
          <div className="w-8 h-8 rounded-xl bg-yellow-500 flex items-center justify-center text-slate-950 font-serif font-black flex-shrink-0 shadow-lg shadow-yellow-500/20">
            <span className="text-sm leading-none">T</span>
          </div>
          {!collapsed && (
            <div className="min-w-0 animate-slide-in">
              <h1 className="font-extrabold text-white text-xs tracking-tight font-serif truncate">Tureep AI+</h1>
              <p className="text-[10px] text-yellow-400 font-mono block tracking-wider leading-none mt-0.5">Sovereign Desk</p>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-lg hover:bg-surface-800 text-surface-400 hover:text-white transition-colors cursor-pointer flex-shrink-0"
          title={collapsed ? "Expand sidebar" : "Collapse navigation"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* 2. Top App Language / Layout Direction Widget */}
      {!collapsed && (
        <div className="p-3 border-b border-surface-800 bg-surface-900/30">
          <div className="flex items-center gap-2 px-2 py-1 rounded-xl bg-surface-900 border border-surface-800">
            <Globe className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="w-full bg-transparent text-xs font-bold text-white cursor-pointer focus:outline-none font-mono"
            >
              <option value="en" className="bg-surface-900 text-white">🇬🇧 English (LTR)</option>
              <option value="ar" className="bg-surface-900 text-white">🇸🇦 العربية (RTL)</option>
              <option value="tr" className="bg-surface-900 text-white">🇹🇷 Türkçe (LTR)</option>
              <option value="ku" className="bg-surface-900 text-white">☀️ کوردی (RTL)</option>
              <option value="fa" className="bg-surface-900 text-white">🇮🇷 فارسی (RTL)</option>
            </select>
          </div>
        </div>
      )}

      {/* 3. Reusable Expandable Silicon Valley Navigation Tree */}
      <nav className="flex-1 overflow-y-auto p-2.5 space-y-4 select-none">
        {menuSections.map((sec, sIdx) => (
          <div key={sIdx} className="space-y-1">
            {!collapsed && (
              <span className="text-[9px] font-black uppercase tracking-widest text-surface-500 pl-3 block font-mono">
                {sec.title}
              </span>
            )}
            <div className="space-y-0.5">
              {sec.items.map((item) => {
                const Icon = item.icon;
                const isActive = normalizedActive === item.id || normalizedActive.includes("/" + item.id);

                return (
                  <button
                    key={item.id}
                    onClick={() => navigate({ to: item.path })}
                    className={`flex items-center gap-3 w-full px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer group ${
                      isActive
                        ? "bg-primary-600 text-white font-extrabold shadow-lg shadow-primary-600/30 translate-x-0.5"
                        : "text-surface-400 hover:bg-surface-900 hover:text-white"
                    }`}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-white" : "text-surface-400 group-hover:text-yellow-400"}`} />
                    {!collapsed && <span className="truncate tracking-tight">{item.label}</span>}
                    {!collapsed && item.shortcut && (
                      <span className={`ml-auto font-mono text-[9px] font-bold px-1.5 py-0.5 rounded ${isActive ? "bg-black/30 text-yellow-300" : "bg-surface-800 text-surface-500"}`}>
                        {item.shortcut}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* 4. Bottom Support / SRE Triage & Sign-Out Footers */}
      <div className="p-3 border-t border-surface-800 bg-surface-900/30 space-y-2 select-none">
        {!collapsed && (
          <div className="flex items-center justify-between p-1 rounded-full bg-surface-900 border border-surface-800">
            <button
              onClick={() => toggleTheme("light")}
              className={`flex-1 flex items-center justify-center py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${themeMode === "light" ? "bg-white text-black shadow-md" : "text-surface-400 hover:text-white"}`}
              title="Light theme mode"
            >
              <Sun className="w-3 h-3" />
            </button>
            <button
              onClick={() => toggleTheme("dark")}
              className={`flex-1 flex items-center justify-center py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${themeMode === "dark" ? "bg-primary-600 text-white shadow-md" : "text-surface-400 hover:text-white"}`}
              title="Dark theme mode"
            >
              <Moon className="w-3 h-3" />
            </button>
            <button
              onClick={() => toggleTheme("system")}
              className={`flex-1 flex items-center justify-center py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${themeMode === "system" ? "bg-surface-800 text-white shadow-md" : "text-surface-400 hover:text-white"}`}
              title="System OS auto-matching theme"
            >
              <Laptop className="w-3 h-3" />
            </button>
          </div>
        )}

        <button
          onClick={logout}
          className={`flex items-center gap-3 w-full px-3 py-2 rounded-xl text-xs font-bold text-danger-400 hover:bg-danger-500 hover:text-white transition-all cursor-pointer ${collapsed ? "justify-center" : ""}`}
          title={collapsed ? "Sign out of terminal" : undefined}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span className="truncate">Sign Out of Terminal</span>}
        </button>
      </div>
    </aside>
  );
}
