import { useNavigate } from "@tanstack/react-router";
import { removeToken } from "@/lib/api";
import {
  LayoutDashboard,
  Package,
  Handshake,
  ShoppingCart,
  FileCheck,
  Shield,
  LogOut,
  Lock,
} from "lucide-react";

interface AppSidebarProps {
  activeRoute: "dashboard" | "products" | "pre-deals" | "orders" | "kyc" | "sanctions" | "hardening-notes";
}

export function AppSidebar({ activeRoute }: AppSidebarProps) {
  const navigate = useNavigate();

  function logout() {
    removeToken();
    navigate({ to: "/login" });
  }

  const items = [
    { id: "dashboard", label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { id: "products", label: "Products", path: "/products", icon: Package },
    { id: "pre-deals", label: "Pre-Deals", path: "/pre-deals", icon: Handshake },
    { id: "orders", label: "Orders & Escrow", path: "/orders", icon: ShoppingCart },
    { id: "kyc", label: "KYC / AML", path: "/kyc", icon: FileCheck },
    { id: "sanctions", label: "Sanctions Screening", path: "/sanctions", icon: Shield },
    { id: "hardening-notes", label: "HTTPS / Hardening", path: "/hardening-notes", icon: Lock },
  ];

  return (
    <aside className="hidden w-64 flex-col border-r border-border bg-white lg:flex">
      <div className="flex h-16 items-center gap-3 border-b border-border px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <span className="font-mono text-sm font-bold">T</span>
        </div>
        <span className="text-lg font-semibold text-foreground">Tureep AI+</span>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeRoute === item.id;
          return (
            <button
              key={item.id}
              onClick={() => navigate({ to: item.path })}
              className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-secondary text-foreground font-semibold"
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </button>
          );
        })}
      </nav>
      <div className="border-t border-border p-4">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      </div>
    </aside>
  );
}
