import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n";
import { Cpu, Handshake, ShoppingCart, ShieldCheck, Landmark, Truck, Bell, ExternalLink, ArrowLeft, BookOpen } from "lucide-react";

export const Route = createFileRoute("/workflow")({
  component: DealWorkflowPage,
});

function DealWorkflowPage() {
  const navigate = useNavigate();
  const { t, dir } = useI18n();

  const stages = [
    {
      id: "discovery",
      step: "01",
      icon: Cpu,
      title: "Smart Trade Matchmaking & Discovery",
      badge: "FastAPI • Heuristic Engine",
      path: "/ml-analytics",
      action: "Launch Intelligence Desk",
      desc: "Suppliers list verified physical product catalogs (`/products`) while institutional corporate buyers inject structured purchasing inquiries (`/demands`). Our smart heuristic algorithms actively evaluate spot ledgers across Price, Operational Distance, Lead Times, and Counterparty Trust.",
      rls: "RLS Catalog Indexing: Available inventory bypasses strict ownership solely for active deal matchmaking.",
      api: "GET /api/v1/ml-analytics/feature-weights • POST /api/v1/ml-analytics/simulate",
    },
    {
      id: "predeals",
      step: "02",
      icon: Handshake,
      title: "Pre-Deal Generation & Master Account Latency",
      badge: "SLA Feature Gate",
      path: "/pre-deals",
      action: "Review Handshake Pairings",
      desc: "When a heuristic criteria match reaches our minimum threshold (`>= 75.0`), the platform automatically constructs a bilateral PreDeal manifest. Visibility is gated based on the buyer's Master Account SLA: Free (+120h Delay) down to Executive Sovereign Tiers (Instantaneous Zero Delay).",
      rls: "RLS Partner Lock: Only authorized counterparty IDs linked to the deal can evaluate or query specific pairings.",
      api: "GET /api/v1/deals/pre-deals • POST /api/v1/deals/generate-pre-deals",
    },
    {
      id: "orders",
      step: "03",
      icon: ShoppingCart,
      title: "Bilateral Acknowledgment & Order Complete Shipped Transition",
      badge: "Transactional Manifest",
      path: "/orders",
      action: "Inspect Escrow Actions",
      desc: "Once both trading entities mutually click 'Accept Proposition', the pre-deal instantly transitions to an accepted state. Executing 'Convert to Order' commits an immutable commercial order manifest (`Order #TUR-2026-000001`) and applies calculated multi-tenant platform overhead fees.",
      rls: "RLS Execution Guard: Only verified institutional Buyers and Suppliers can access their specific active Orders.",
      api: "POST /api/v1/orders/ • GET /api/v1/orders/{id}",
    },
    {
      id: "compliance",
      step: "04",
      icon: ShieldCheck,
      title: "Regulatory Corporate KYC/AML Proofs & Global Sanctions Sweeps",
      badge: "Consolidated OFAC / EU / UN",
      path: "/sanctions",
      action: "Execute SDN Compliance Sweep",
      desc: "Before any Escrow deposit can get unsealed, corporate identities must submit legal proofs to our Compliance Admin Queue. All involved individual and haulage vessel names are cross-referenced against Specially Designated Nationals (SDN) OFAC and consolidated embargo databases.",
      rls: "RLS Audit Bounded Context: Universal management access granted to verified `'admin'` RBAC claims.",
      api: "POST /api/v1/compliance/sanctions/screen • POST /api/v1/kyc/submit",
    },
    {
      id: "finance",
      step: "05",
      icon: Landmark,
      title: "Neutral Platforms Escrow Custody & SWIFT MT Instrument Trajectory",
      badge: "ICC UCP 600 / URC 522",
      path: "/trade-finance",
      action: "Open Financial Instruments",
      desc: "Transaction sums are held in secure neutral platform escrow or governed under formal SWIFT MT700 Letters of Credit. Our visual Explorer charts every stage (Issued -> Advised -> Commercial Docs Presented -> Clean Shipped Audit -> Wire sight Settled).",
      rls: "RLS Financial Desk: financial intermediaries and designated counterparty entities query specific instruments.",
      api: "POST /api/v1/trade-finance/lc • POST /api/v1/trade-finance/dp",
    },
    {
      id: "logistics",
      step: "06",
      icon: Truck,
      title: "Satellite EDI Haulage Container Tracking & GPS Geo-Waypoints",
      badge: "DHL Global EDI / Maersk Line XML",
      path: "/shipments",
      action: "Time-Stamp XML Checkpoint",
      desc: "The logistics engine consumes automated real REST EDI tracking webhooks from shipping lines. Using our geo-waypoint interactive dashboard, haulage operators cryptographically add verified clearing checkpoints directly into the transaction manifest.",
      rls: "RLS Telemetry Hashes: Counterparties strictly track XML geo-waypoints connected to their active orders.",
      api: "GET /api/v1/logistics/shipments/ • POST /api/v1/logistics/shipments/{id}/events",
    },
    {
      id: "settlement",
      step: "07",
      icon: Bell,
      title: "SGS Quality Inspection Document Unsealing & Multichannel Automated Settlements",
      badge: "Redis Asynchronous Messaging Bus",
      path: "/notifications",
      action: "Access Multi-Channel Ledgers",
      desc: "Upon physical delivery confirmation and unsealing certified SGS Quality Inspection papers, users click 'Release Escrow Payout'. The underlying Redis priority message broker instantly enqueues high-performance clearing alerts across in-app WebSockets, SendGrid email, and Twilio SMS.",
      rls: "RLS Message Engine: Users successfully receive self-contained priority cryptographic digests.",
      api: "GET /api/v1/notifications/ • POST /api/v1/notifications/trigger-mock",
    },
  ];

  const isRtl = dir === "rtl";

  return (
    <div className={`space-y-8 animate-slide-in font-sans select-none ${isRtl ? "text-right" : "text-left"}`} dir={dir}>
      
      {/* Vercel Style Main Title Header Layout */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-br from-surface-900 via-surface-800 to-slate-950 text-white p-8 rounded-3xl border border-surface-800 shadow-2xl">
        <div className="space-y-1">
          <Badge className="bg-primary-500 text-white font-black font-mono text-[10px] uppercase tracking-widest px-3 py-1">Explorer desk</Badge>
          <h1 className="text-3xl font-black tracking-tight text-white font-serif">
            {t("wf.title", "Institutional 7-Stage Cross-Border Deal Desk & Workflows Workflow Workflow Hub Explorer")}
          </h1>
          <p className="text-xs text-surface-400 font-mono">Explore underlying FastAPI Python subsystems, PostgreSQL table schema constraints, and instant interactive tool handshakes</p>
        </div>

        <a
          href="/APPLICATION_WORKFLOW_COMPLETE_GUIDE.md"
          target="_blank"
          rel="noreferrer"
          className="bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black text-xs px-6 py-3.5 h-auto rounded-2xl shadow-xl hover:scale-105 transition-all select-none cursor-pointer self-start sm:self-auto font-mono flex items-center gap-2 flex-shrink-0"
        >
          <BookOpen className="h-4 w-4 fill-slate-950" />
          <span>Complete Shipped Specs Document</span>
        </a>
      </div>

      <div className="max-w-6xl mx-auto space-y-6">
        {stages.map((st) => {
          const Icon = st.icon;

          return (
            <Card key={st.id} className="overflow-hidden border border-surface-200 bg-white shadow-sm hover:border-primary-500 transition-all duration-300 rounded-3xl hover:shadow-xl flex flex-col md:flex-row items-stretch group select-text">
              {/* Number Horizontal Column */}
              <div className="bg-slate-950 text-yellow-400 p-8 flex flex-col items-center justify-center min-w-32 border-b md:border-b-0 md:border-r border-surface-200/80 select-none font-mono">
                <span className="text-[10px] text-surface-400 uppercase tracking-widest block font-bold font-sans">Stage Node Stage</span>
                <span className="text-5xl font-black font-mono tracking-tight">{st.step}</span>
              </div>

              {/* Descriptions Column Center */}
              <div className="p-8 space-y-5 flex-1 select-text">
                <div className="flex flex-wrap items-center justify-between gap-3 select-none font-sans">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-primary-600 text-white flex-shrink-0 shadow-sm">
                      <Icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-lg sm:text-xl font-black text-surface-900 font-sans tracking-tight">{st.title}</CardTitle>
                  </div>
                  <Badge variant="outline" className="border-primary text-primary bg-primary-50/50 font-mono font-bold text-xs px-3 py-1">
                    {st.badge}
                  </Badge>
                </div>

                <p className="text-xs text-surface-600 leading-relaxed font-sans select-text font-medium">
                  {st.desc}
                </p>

                {/* Highly Definitive RLS / API code snippet sub-bars */}
                <div className="space-y-2 pt-2 font-mono text-xs">
                  <div className="p-4 rounded-2xl bg-surface-50 border border-surface-200/80 text-surface-700 text-xs leading-relaxed select-text">
                    <strong className="text-surface-900 font-bold font-sans block mb-1 uppercase text-[10px] tracking-widest">Underlying Subsystem Isolation Hook:</strong>
                    <span>{st.rls}</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 text-xs overflow-x-auto select-all shadow-inner border border-slate-800">
                    <span className="text-primary-400 font-bold block mb-1 font-sans uppercase text-[10px] tracking-widest select-none">FastAPI Monolithic Core Python Gateways:</span>
                    <span className="text-emerald-400 font-mono font-black">{st.api}</span>
                  </div>
                </div>
              </div>

              {/* Launch Interaction Right Column Button Desk */}
              <div className="p-8 bg-surface-50 border-t md:border-t-0 md:border-l border-surface-200 flex items-center justify-center min-w-64 select-none">
                <Button
                  className="bg-primary-600 hover:bg-primary-500 text-white font-extrabold px-8 py-4 h-auto w-full text-xs shadow-lg shadow-primary-600/30 flex items-center justify-center gap-2 select-none group-hover:scale-105 transition-all cursor-pointer font-sans rounded-2xl"
                  onClick={() => navigate({ to: st.path })}
                >
                  <span>{st.action}</span>
                  <ExternalLink className="h-4 w-4 text-yellow-400 flex-shrink-0" />
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default DealWorkflowPage;
