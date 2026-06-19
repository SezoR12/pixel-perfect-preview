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
  FileCheck,
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
    { id: "ml-analytics", label: t("nav.analytics", "AI / ML Analytics"), path: "/ml-analytics", icon: Sparkles },
    { id: "kyc", label: t("nav.kyc", "KYC / AML"), path: "/kyc", icon: FileCheck },
    { id: "sanctions", label: t("nav.sanctions", "Sanctions Screening"), path: "/sanctions", icon: Shield },
    { id: "notifications", label: t("nav.notifications", "Notifications"), path: "/notifications", icon: Bell },
    { id: "supabase-portal", label: t("nav.supabase", "Supabase Core & RLS"), path: "/supabase-portal", icon: Database },
    { id: "microservices-spec", label: t("nav.microservices", "Microservices Architecture"), path: "/microservices-spec", icon: Network },
    { id: "hardening-notes", label: t("nav.hardening", "HTTPS / Hardening"), path: "/hardening-notes", icon: Lock },
  ];

  return (
    <aside className="hidden w-64 flex-col border-r border-border bg-white lg:flex flex-shrink-0 select-none">
      <div className="flex h-16 items-center gap-3 border-b border-border px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <span className="font-mono text-sm font-bold">T</span>
        </div>
        <span className="text-lg font-semibold text-foreground">{t("app.title", "Tureep AI+")}</span>
      </div>

      <div className="p-3 border-b border-border bg-secondary/30">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="w-full bg-transparent text-xs font-medium text-foreground cursor-pointer focus:outline-none"
          >
            <option value="en">English (LTR)</option>
            <option value="ar">العربية (RTL)</option>
            <option value="tr">Türkçe (LTR)</option>
            <option value="ku">کوردی (RTL)</option>
            <option value="fa">فارسی (RTL)</option>
          </select>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 p-3 overflow-y-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeRoute === item.id;
          return (
            <button
              key={item.id}
              onClick={() => navigate({ to: item.path })}
              className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-xs font-medium transition-colors ${
                isActive
                  ? "bg-secondary text-foreground font-semibold shadow-sm"
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="border-t border-border p-3">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          <span>{t("btn.logout", "Log out")}</span>
        </button>
      </div>
    </aside>
  );
}
