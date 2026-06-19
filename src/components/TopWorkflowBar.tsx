import React from "react";
import { useNavigate, useLocation } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { Cpu, Handshake, ShoppingCart, ShieldCheck, Landmark, Truck, Bell, ChevronRight } from "lucide-react";

export function TopWorkflowBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, dir, language } = useI18n();

  const currentPath = location.pathname.toLowerCase();
  if (currentPath === "/" || currentPath.includes("/login")) return null; // Hide on landing page and login

  const stages: Array<{
    id: string;
    step: string;
    label: string;
    icon: React.ElementType;
    routes: string[];
    defaultPath: string;
  }> = [
    {
      id: "discovery",
      step: "01",
      label: "Discovery Desk",
      icon: Cpu,
      routes: ["/products", "/demands", "/ml-analytics"],
      defaultPath: "/ml-analytics",
    },
    {
      id: "predeals",
      step: "02",
      label: "Pre-Deal Handshakes",
      icon: Handshake,
      routes: ["/pre-deals"],
      defaultPath: "/pre-deals",
    },
    {
      id: "orders",
      step: "03",
      label: "Confirmed Manifests",
      icon: ShoppingCart,
      routes: ["/orders"],
      defaultPath: "/orders",
    },
    {
      id: "compliance",
      step: "04",
      label: "Compliance Sweeps",
      icon: ShieldCheck,
      routes: ["/kyc", "/sanctions"],
      defaultPath: "/sanctions",
    },
    {
      id: "finance",
      step: "05",
      label: "SWIFT LC / Escrow",
      icon: Landmark,
      routes: ["/trade-finance", "/billing"],
      defaultPath: "/trade-finance",
    },
    {
      id: "logistics",
      step: "06",
      label: "EDI Shipping Tracking",
      icon: Truck,
      routes: ["/shipments"],
      defaultPath: "/shipments",
    },
    {
      id: "settlement",
      step: "07",
      label: "MT756 Final Settlement",
      icon: Bell,
      routes: ["/notifications"],
      defaultPath: "/notifications",
    },
  ];

  const activeStageIdx = stages.findIndex((st) => st.routes.some((r) => currentPath.includes(r)));

  const isRtl = dir === "rtl";

  return (
    <div className="sticky top-0 z-40 bg-slate-950/95 border-b border-slate-800 text-white select-none font-mono text-xs shadow-xl backdrop-blur-md overflow-x-auto select-none py-2 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-start md:justify-center gap-1.5 min-w-max">
        
        <span className="text-yellow-400 font-extrabold px-2 font-sans tracking-wide hidden lg:inline">
          ● Hybrid Trade Trajectory:
        </span>

        {stages.map((st, idx) => {
          const Icon = st.icon;
          const isActive = activeStageIdx === idx;
          const isPassed = activeStageIdx > idx;

          return (
            <React.Fragment key={st.id}>
              <button
                onClick={() => navigate({ to: st.defaultPath })}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full font-bold transition-all select-none flex-shrink-0 ${
                  isActive
                    ? "bg-yellow-500 text-black shadow-lg scale-105"
                    : isPassed
                    ? "bg-slate-800 text-slate-300 border border-slate-700 hover:text-yellow-400"
                    : "bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-black ${isActive ? "bg-black text-white" : "bg-slate-800 text-slate-400"}`}>
                  {st.step}
                </span>
                <Icon className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="font-sans text-xs tracking-tight">{st.label}</span>
              </button>

              {idx < stages.length - 1 && (
                <ChevronRight className={`h-4 w-4 flex-shrink-0 ${isPassed ? "text-yellow-500" : "text-slate-700"}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
