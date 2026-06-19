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
} from "lucide-react";

interface AppSidebarProps {
  activeRoute: string;
}

export function AppSidebar({ activeRoute }: AppSidebarProps) {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useI18n();

  async function logout() {
    await logoutWithSupabase();
    navigate({ to: "/login" });
  }

  const items = [
    { id: "dashboard", label: t("nav.dashboard", "Dashboard"), path: "/dashboard", icon: LayoutDashboard },
    { id: "profile", label: t("nav.profile", "Company Profile"), path: "/profile", icon: Building2 },
    { id: "products", label: t("nav.products", "Products"), path: "/products", icon: Package },
    { id: "demands", label: t("nav.demands", "Demands"), path: "/demands", icon: ClipboardList },
    { id: "pre-deals", label: t("nav.pre_deals", "Pre-Deals"), path: "/pre-deals", icon: Handshake },
    { id: "orders", label: t("nav.orders", "Orders & Escrow"), path: "/orders", icon: ShoppingCart },
    { id: "trade-finance", label: t("nav.finance", "Trade Finance (L/C & D/P)"), path: "/trade-finance", icon: CreditCard },
    { id: "shipments", label: t("nav.shipments", "Logistics & Tracking"), path: "/shipments", icon: Truck },
    { id: "billing", label: t("nav.billing", "Master Account Billing"), path: "/billing", icon: Globe },
    { id: "ml-analytics", label: t("nav.analytics", "Smart Trade Analytics"), path: "/ml-analytics", icon: Sparkles },
    { id: "kyc", label: t("nav.kyc", "KYC / AML Workflow"), path: "/kyc", icon: FileCheck2 },
    { id: "sanctions", label: t("nav.sanctions", "Sanctions Screening"), path: "/sanctions", icon: Shield },
    { id: "notifications", label: t("nav.notifications", "Notifications"), path: "/notifications", icon: Bell },
    { id: "supabase-portal", label: t("nav.supabase", "Supabase Core & RLS"), path: "/supabase-portal", icon: Database },
    { id: "microservices-spec", label: t("nav.microservices", "Microservices Layout"), path: "/microservices-spec", icon: Network },
    { id: "workflow", label: t("nav.workflow", "Trade Workflow Explorer"), path: "/workflow", icon: Layers },
    { id: "hardening-notes", label: t("nav.hardening", "HTTPS / Hardening"), path: "/hardening-notes", icon: Lock },
  ];

  const normalizedActive = activeRoute.toLowerCase();

  return (
    <aside className="hidden w-64 flex-col border-r border-border bg-white lg:flex flex-shrink-0 select-none shadow-lg">
      {/* Platform Header Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-border px-6 bg-slate-950 text-white cursor-pointer" onClick={() => navigate({ to: "/" })}>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-yellow-500 text-slate-950 shadow-md">
          <span className="font-serif text-base font-black">T</span>
        </div>
        <div>
          <span className="text-base font-extrabold tracking-tight font-serif text-white block leading-tight">{t("app.title", "Tureep AI+")}</span>
          <span className="text-[10px] text-yellow-400 font-mono block">Institutional Trade Terminal</span>
        </div>
      </div>

      {/* Language Bar Widget */}
      <div className="p-3 border-b border-border bg-secondary/40">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-primary flex-shrink-0" />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="w-full bg-transparent text-xs font-bold text-foreground cursor-pointer focus:outline-none font-mono uppercase"
          >
            <option value="en">🇬🇧 English (LTR)</option>
            <option value="ar">🇸🇦 العربية (RTL)</option>
            <option value="tr">🇹🇷 Türkçe (LTR)</option>
            <option value="ku">☀️ کوردی (RTL)</option>
            <option value="fa">🇮🇷 فارسی (RTL)</option>
          </select>
        </div>
      </div>

      {/* Interactive Navigation Menu */}
      <nav className="flex-1 space-y-1 p-3 overflow-y-auto select-none">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = normalizedActive === item.id || normalizedActive.includes("/" + item.id);
          
          return (
            <button
              key={item.id}
              onClick={() => navigate({ to: item.path })}
              className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? "bg-primary text-white font-extrabold shadow-md translate-x-1"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{item.label}</span>
              {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse flex-shrink-0" />}
            </button>
          );
        })}
      </nav>

      {/* Support / Logout Sidebar Footer */}
      <div className="border-t border-border p-3 space-y-1 bg-secondary/20">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold text-danger-600 hover:bg-danger hover:text-white transition-all cursor-pointer"
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          <span>{t("btn.logout", "Sign Out of Terminal")}</span>
        </button>
      </div>
    </aside>
  );
}
