import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  Handshake,
  BarChart3,
  Settings,
  Bell,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Shield,
  Truck,
  CreditCard,
  Sparkles,
  Menu,
  X,
  Globe,
  User as UserIcon
} from "lucide-react";
import { getMe, removeToken } from "@/lib/api";
import type { User as ApiUser } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { GlobalStoreProvider } from "@/stores/GlobalStoreProvider";
import { CookieConsentBanner } from "@/components/CookieConsentBanner";
import { UniversalInAppHelpDrawer } from "@/components/UniversalInAppHelpDrawer";
import { ClientErrorConsole } from "@/components/ClientErrorConsole";

export const Route = createFileRoute("/__root")({
  component: RootLayout,
});

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard, badge: null },
  { path: "/products", label: "My Products", icon: Package, badge: null },
  { path: "/deals", label: "Deal Hub", icon: Handshake, badge: "deals" },
  { path: "/orders", label: "Orders & Shipments", icon: ClipboardList, badge: null },
  { path: "/logistics", label: "Logistics", icon: Truck, badge: null },
  { path: "/finance", label: "Trade Finance", icon: CreditCard, badge: null },
  { path: "/analytics", label: "Market Insights", icon: BarChart3, badge: null },
  { path: "/compliance", label: "Compliance", icon: Shield, badge: null },
  { path: "/settings", label: "Settings", icon: Settings, badge: null },
];

function RootLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<ApiUser | null>(null);
  const [notifications, setNotifications] = useState(3);
  const location = useLocation();
  const { logout } = useAuth();

  useEffect(() => {
    getMe().then(setUser).catch(() => setUser(null));
  }, []);

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + "/");

  const tierColors: Record<string, string> = {
    free: "bg-surface-200 text-surface-600",
    bronze: "bg-amber-100 text-amber-700",
    silver: "bg-slate-200 text-slate-700",
    gold: "bg-yellow-100 text-yellow-700",
    platinum: "bg-indigo-100 text-indigo-700",
    black: "bg-surface-800 text-white",
  };

  return (
    <GlobalStoreProvider>
      <div className="min-h-screen bg-surface-50 flex">
        {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen z-50
          bg-white border-r border-surface-200
          flex flex-col transition-all duration-300 ease-in-out
          ${collapsed ? "w-16" : "w-64"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Logo area */}
        <div className="h-16 flex items-center px-4 border-b border-surface-100">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center flex-shrink-0 shadow-sm">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <div className="animate-slide-in">
                <h1 className="font-bold text-surface-800 text-sm tracking-tight">Tureep AI+</h1>
                <p className="text-[10px] text-surface-400 -mt-0.5">Trade Intelligence</p>
              </div>
            )}
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden ml-auto p-1.5 rounded-lg hover:bg-surface-100"
          >
            <X className="w-4 h-4 text-surface-500" />
          </button>
        </div>

        {/* User mini profile */}
        <div className="px-3 py-3 border-b border-surface-100">
          <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
            <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
              <UserIcon className="w-4 h-4 text-primary-600" />
            </div>
            {!collapsed && user && (
              <div className="min-w-0 animate-slide-in">
                <p className="text-sm font-medium text-surface-800 truncate">{user.name}</p>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${tierColors[user.account_type] || tierColors.free}`}>
                  {user.account_type}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {navItems.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                  transition-all duration-200 group relative
                  ${active
                    ? "bg-primary-50 text-primary-700 shadow-sm"
                    : "text-surface-600 hover:bg-surface-100 hover:text-surface-800"
                  }
                  ${collapsed ? "justify-center" : ""}
                `}
              >
                <Icon className={`w-[18px] h-[18px] flex-shrink-0 ${active ? "text-primary-600" : "text-surface-400 group-hover:text-surface-600"}`} />
                {!collapsed && (
                  <span className="truncate animate-slide-in">{item.label}</span>
                )}
                {!collapsed && item.badge === "deals" && notifications > 0 && (
                  <span className="ml-auto bg-accent-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {notifications}
                  </span>
                )}
                {collapsed && (
                  <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-surface-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="p-2 border-t border-surface-100 space-y-1">
          <button
            onClick={() => {}}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-surface-600 hover:bg-surface-100 transition-colors w-full ${collapsed ? "justify-center" : ""}`}
          >
            <Bell className="w-[18px] h-[18px] text-surface-400" />
            {!collapsed && <span className="animate-slide-in">Notifications</span>}
            {!collapsed && notifications > 0 && (
              <span className="ml-auto bg-accent-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {notifications}
              </span>
            )}
          </button>
          <button
            onClick={logout}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-surface-600 hover:bg-danger-50 hover:text-danger-600 transition-colors w-full ${collapsed ? "justify-center" : ""}`}
          >
            <LogOut className="w-[18px] h-[18px] text-surface-400" />
            {!collapsed && <span className="animate-slide-in">Sign Out</span>}
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex items-center justify-center w-full py-2 rounded-xl hover:bg-surface-100 transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4 text-surface-400" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-surface-400" />
            )}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-surface-100 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl hover:bg-surface-100"
            >
              <Menu className="w-5 h-5 text-surface-600" />
            </button>
            <div>
              <h2 className="text-lg font-semibold text-surface-800">
                {navItems.find((n) => isActive(n.path))?.label || "Dashboard"}
              </h2>
              <p className="text-xs text-surface-400 hidden sm:block">
                {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-success-50 border border-success-200">
              <div className="w-2 h-2 rounded-full bg-success-500 status-pulse" />
              <span className="text-xs font-medium text-success-700">Platform Active</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 border border-primary-200">
              <Globe className="w-3.5 h-3.5 text-primary-600" />
              <span className="text-xs font-medium text-primary-700">EN</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="p-4 lg:p-8">
          <Outlet />
        </div>
        <CookieConsentBanner />
        <UniversalInAppHelpDrawer />
        <ClientErrorConsole />
      </main>
    </div>
    </GlobalStoreProvider>
  );
}
