import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n";
import { Cpu, Handshake, ShoppingCart, ShieldCheck, Landmark, Truck, Bell, ArrowRight, CheckCircle2, Terminal, ExternalLink, ArrowLeft, BookOpen } from "lucide-react";

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
      action: "Launch Intelligence Sandbox",
      desc: "Suppliers list verified physical product catalogs (/products) while institutional buyers inject structured purchasing inquiries (/demands). Our smart heuristic algorithms evaluate spot ledgers across Price, Geographical Geo-Risk, Urgency, and Counterparty Trust.",
      rls: "RLS Catalog Indexing: Available inventory bypasses strict ownership solely for public matching.",
      api: "GET /api/ml-analytics/feature-weights • POST /api/ml-analytics/simulate",
    },
    {
      id: "predeals",
      step: "02",
      icon: Handshake,
      title: "Pre-Deal Generation & Master Account Latency",
      badge: "SLA Feature Gate",
      path: "/pre-deals",
      action: "Review Pre-Deal Handshakes",
      desc: "When a match reaches our minimum threshold (>= 75.0), the platform automatically constructs a bilateral PreDeal entity. To monetize the network, visibility is actively delayed based on the buyer's Master Account SLA: Free (+120h) down to Platinum/Black Sovereign (Instantaneous Zero Delay).",
      rls: "RLS Partner Lock: Only authorized counterparty IDs can evaluate or query specific pre-deals.",
      api: "GET /api/deals/pre-deals • POST /api/deals/generate-pre-deals",
    },
    {
      id: "orders",
      step: "03",
      icon: ShoppingCart,
      title: "Bilateral Acknowledgment & Order Auto-Conversion",
      badge: "Transactional Lock",
      path: "/orders",
      action: "Inspect Escrow Transactions",
      desc: "Once both trading entities mutually click 'Accept Deal', the pre-deal instantly transitions to an accepted state. Executing 'Convert to Order' commits an immutable transaction manifest (Order #TUR-2026-000001) and applies exact platform overhead overhead fees.",
      rls: "RLS Execution Guard: Only verified Buyers and Sellers can access their specific active Orders.",
      api: "POST /api/orders/ • GET /api/orders/{id}",
    },
    {
      id: "compliance",
      step: "04",
      icon: ShieldCheck,
      title: "Regulatory KYC/AML Audits & Global Sanctions Sweeps",
      badge: "Consolidated OFAC / EU / UN",
      path: "/sanctions",
      action: "Execute SDN Compliance Sweep",
      desc: "Before any Escrow deposit can get unsealed, corporate identities must submit legal proofs to our Compliance Admin Queue. All individual and vessel names are cross-referenced against Specially Designated Nationals (SDN) and automated consolidated embargo indices.",
      rls: "RLS Audit Bounded Context: Universal management access granted to 'admin' JWT claims.",
      api: "POST /api/compliance/sanctions/screen • POST /api/kyc/submit",
    },
    {
      id: "finance",
      step: "05",
      icon: Landmark,
      title: "Neutral Custody Escrow & SWIFT LC State Machines",
      badge: "ICC UCP 600 / URC 522",
      path: "/trade-finance",
      action: "Open Finance Instruments",
      desc: "Transaction funds are held in secure neutral institutional escrow (#ESC-2026-991) or governed under formal SWIFT MT700 Letters of Credit. Our visual state machine charts every stage (Issued -> Advised -> Docs Presented -> Clean Presentation -> wire Settled).",
      rls: "RLS Finance Ledger: Solely associated financial intermediaries and counterparties query states.",
      api: "POST /api/trade-finance/lc • POST /api/trade-finance/dp",
    },
    {
      id: "logistics",
      step: "06",
      icon: Truck,
      title: "Satellite EDI Container Tracking & GPS Geo-Waypoints",
      badge: "DHL Global Feeds",
      path: "/shipments",
      action: "Track Geo-Logistics",
      desc: "The platform consumes real-time electronic EDI tracking webhooks from shipping lines. Using our interactive geo-waypoint sandbox, operators or field inspectors cryptographically time-stamp physical customs clearing events directly into the transaction manifest.",
      rls: "RLS Telemetry Hash: Counterparties strictly track GPS events connected to active orders.",
      api: "GET /api/logistics/shipments/ • POST /api/logistics/shipments/{id}/events",
    },
    {
      id: "settlement",
      step: "07",
      icon: Bell,
      title: "SGS Document Unsealing & Final Wire Settlement",
      badge: "Redis Asynchronous Bus",
      path: "/notifications",
      action: "Access Multi-Channel Bus",
      desc: "Upon confirming physical haulage and unsealing SGS Quality Inspection reports, counterparties click 'Release Escrow'. The underlying Redis priority queue immediately dispatches high-performance confirmation payloads across WebSocket, SendGrid email, and Twilio SMS.",
      rls: "RLS Event Engine: Counterparties successfully receive self-contained cryptographic toasts.",
      api: "GET /api/notifications/ • POST /api/notifications/trigger-mock",
    },
  ];

  const isRtl = dir === "rtl";

  return (
    <div className={`flex min-h-screen bg-background ${isRtl ? "font-sans text-right" : "font-sans text-left"}`} dir={dir}>
      <AppSidebar activeRoute="microservices-spec" />

      <main className="flex-1 overflow-auto">
        <header className="flex h-16 items-center justify-between border-b border-border bg-white px-6 lg:px-8 select-none">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate({ to: "/dashboard" })} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className={isRtl ? "h-5 w-5 rotate-180" : "h-5 w-5"} />
            </button>
            <h1 className="text-lg font-bold text-foreground">
              {t("wf.title", "Definitive 7-Stage Trade Workflow & System Explorer")}
            </h1>
          </div>
          <a
            href="/APPLICATION_WORKFLOW_COMPLETE_GUIDE.md"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold px-4 py-2 rounded-lg text-xs font-mono select-none"
          >
            <BookOpen className="h-4 w-4" />
            <span>Read Complete Markdown Specs</span>
          </a>
        </header>

        <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-8 select-none">
          
          {/* Status Walkthrough Summary Banner */}
          <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
            <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1.5 max-w-3xl select-text">
                <Badge className="bg-primary text-white uppercase text-[10px] font-mono tracking-wider">End-To-End Journey</Badge>
                <h2 className="text-lg font-extrabold text-foreground">How Tureep Counterparties Stepping Through the Hybrid Stack</h2>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Every cross-border transaction naturally steps through seven distinct operational state machines. Click any of the interactive stage simulation cards below to explore underlying PostgreSQL schemas, Supabase RLS isolation notes, and instantly jump to that exact tool in our trade terminal!
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 7 Horizontal Workflow Stages */}
          <div className="space-y-6">
            {stages.map((st) => {
              const Icon = st.icon;

              return (
                <Card key={st.id} className="overflow-hidden border border-border bg-white shadow-sm hover:border-primary/60 transition-all hover:scale-[1.01] flex flex-col md:flex-row items-stretch">
                  {/* Left Column: Number Bar */}
                  <div className="bg-slate-900 text-emerald-400 p-6 flex flex-col items-center justify-center min-w-28 border-b md:border-b-0 md:border-r border-slate-800 shadow-inner select-none font-mono">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold font-sans">Stage</span>
                    <span className="text-4xl font-black">{st.step}</span>
                  </div>

                  {/* Center Column: Descriptions */}
                  <div className="p-6 space-y-4 flex-1 select-text">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-primary/10 text-primary flex-shrink-0">
                          <Icon className="h-5 w-5" />
                        </div>
                        <CardTitle className="text-base sm:text-lg font-extrabold text-foreground">{st.title}</CardTitle>
                      </div>
                      <Badge variant="outline" className="border-primary text-primary bg-primary/5 font-mono text-xs">
                        {st.badge}
                      </Badge>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                      {st.desc}
                    </p>

                    <div className="space-y-2 pt-1 font-mono text-xs">
                      <div className="p-2.5 rounded-lg bg-secondary/60 border text-muted-foreground text-[11px] leading-relaxed">
                        <strong className="text-foreground font-bold font-sans block mb-0.5">Underlying Subsystem Hooks:</strong>
                        {st.rls}
                      </div>

                      <div className="p-2.5 rounded-lg bg-slate-950 text-slate-300 text-[11px] overflow-x-auto">
                        <span className="text-primary-400 font-bold block mb-0.5">FastAPI Python Routers:</span>
                        <span className="text-emerald-400">{st.api}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Launch Execution Button */}
                  <div className="p-6 bg-secondary/20 border-t md:border-t-0 md:border-l border-border flex items-center justify-center min-w-56 select-none">
                    <Button
                      className="bg-primary hover:bg-primary/90 text-white font-extrabold px-6 py-4 h-auto w-full text-xs shadow-lg flex items-center justify-center gap-2 select-none group"
                      onClick={() => navigate({ to: st.path })}
                    >
                      <span>{st.action}</span>
                      <ExternalLink className="h-4 w-4 group-hover:scale-125 transition-transform flex-shrink-0" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
