import { createFileRoute } from "@tanstack/react-router";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Network, Database, Cpu, Lock, Bell, ShoppingCart, Landmark, Truck, ShieldCheck, ArrowRight, CheckCircle2, Layers } from "lucide-react";

export const Route = createFileRoute("/microservices-spec")({
  component: MicroservicesSpecPage,
});

function MicroservicesSpecPage() {
  const services = [
    {
      id: "auth-service",
      name: "Authentication & Identity Service",
      icon: Lock,
      tech: "FastAPI • PostgreSQL • Redis",
      port: ":8001",
      repo: "backend/microservices/auth_service/",
      desc: "Manages individual and corporate user registration, secure bcrypt JWT emission, role-based access control (RBAC), and Master Account tier levels.",
      endpoints: ["POST /api/auth/register", "POST /api/auth/login", "GET /api/users/me"],
      events: ["Emits: user.registered, master_account.upgraded"],
    },
    {
      id: "trade-service",
      name: "Core Trade & Matching Service",
      icon: ShoppingCart,
      tech: "FastAPI • PostgreSQL • SQLAlchemy ORM",
      port: ":8002",
      repo: "backend/microservices/trade_service/",
      desc: "Handles B2B product catalogs, buyer demands, deal lifecycle state machines, and converts accepted pre-deals into formal commercial Orders.",
      endpoints: ["GET /api/products/", "POST /api/demands/", "POST /api/orders/"],
      events: ["Consumes: user.registered • Emits: order.created"],
    },
    {
      id: "finance-service",
      name: "Escrow & Trade Finance Service",
      icon: Landmark,
      tech: "FastAPI • PostgreSQL • Stripe SDK",
      port: ":8003",
      repo: "backend/microservices/finance_service/",
      desc: "Governs institutional escrow custody accounts, SWIFT MT700 L/C and URC 522 D/P state machines, and Stripe subscription rollings.",
      endpoints: ["POST /api/trade-finance/lc", "POST /api/orders/{id}/payments", "POST /api/billing/checkout"],
      events: ["Consumes: order.created • Emits: escrow.released, lc.settled"],
    },
    {
      id: "logistics-service",
      name: "Logistics & EDI Tracking Service",
      icon: Truck,
      tech: "FastAPI • PostgreSQL • Celery / ARQ",
      port: ":8004",
      repo: "backend/microservices/logistics_service/",
      desc: "Integrates with carrier APIs (DHL, Maersk Line), consumes real-time shipping EDI webhooks, and logs immutable container GPS telemetry.",
      endpoints: ["POST /api/logistics/shipments/", "POST /api/logistics/shipments/{id}/events"],
      events: ["Consumes: order.created • Emits: shipment.customs_cleared"],
    },
    {
      id: "ai-ml-service",
      name: "Smart Trade Intelligence Service",
      icon: Cpu,
      tech: "FastAPI • Python Heuristic Engine",
      port: ":8005",
      repo: "backend/microservices/ai_ml_service/",
      desc: "Executes weighted multi-vector counterparty matching, 30-day statistical commodity price predictions, and regional corridor demand forecasting.",
      endpoints: ["GET /api/ml-analytics/feature-weights", "GET /api/ml-analytics/price-predictions", "POST /api/ml-analytics/simulate"],
      events: ["Consumes: product.created, demand.created • Emits: predeals.generated"],
    },
    {
      id: "compliance-service",
      name: "Compliance & Sanctions Service",
      icon: ShieldCheck,
      tech: "FastAPI • PostgreSQL • Enterprise APIs",
      port: ":8006",
      repo: "backend/microservices/compliance_service/",
      desc: "Validates applicant documentation hashes (KYC/AML) and performs automated screening against real-time OFAC, EU, and UN embargo indices.",
      endpoints: ["POST /api/compliance/sanctions/screen", "POST /api/kyc/submit", "GET /api/kyc/pending"],
      events: ["Consumes: user.registered • Emits: kyc.approved, sanctions.hit"],
    },
    {
      id: "notification-service",
      name: "Event Bus & Notification Service",
      icon: Bell,
      tech: "FastAPI • Redis Priority Queue • FCM",
      port: ":8007",
      repo: "backend/microservices/notification_service/",
      desc: "Consumes system-wide events and enqueues high-performance dispatch batches across in-app WebSockets, SendGrid, Firebase push, and Twilio SMS.",
      endpoints: ["GET /api/notifications/", "POST /api/notifications/trigger-mock"],
      events: ["Consumes: ALL platform events • Broadcasts: WebSocket payload"],
    },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar activeRoute="microservices-spec" />

      <main className="flex-1 overflow-auto">
        <header className="flex h-16 items-center justify-between border-b border-border bg-white px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Network className="h-5 w-5 text-primary flex-shrink-0" />
            <h1 className="text-lg font-semibold text-foreground">Microservices Architectural Decomposition & API Gateway</h1>
          </div>
          <Badge variant="outline" className="border-primary text-primary bg-primary/5 font-mono">
            Kong / AWS API Gateway Orchestration
          </Badge>
        </header>

        <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
          {/* Executive Architecture Banner */}
          <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
            <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center gap-6 justify-between">
              <div className="flex items-start gap-4">
                <Layers className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
                <div className="space-y-1">
                  <h2 className="text-lg font-extrabold text-foreground">Monolith-to-Microservices Migration Roadmap</h2>
                  <p className="text-xs text-muted-foreground max-w-3xl leading-relaxed">
                    To maintain flawless reliability and ultra-low latency as transaction volumes scale across the Iraq-Iran-Turkey-EU corridors, our underlying FastAPI monolithic engine is structured to cleanly decouple into seven highly specialized, domain-driven microservices orchestrated by Docker Compose and Kubernetes.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Architectural Diagram Box */}
          <Card className="bg-slate-900 text-slate-100 border-slate-800 shadow-xl overflow-hidden">
            <CardHeader className="bg-slate-800/80 border-b border-slate-700/80 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold flex items-center gap-2 text-white">
                  <Network className="h-5 w-5 text-primary" />
                  Service Interoperability Topology & Event Topology
                </CardTitle>
                <Badge className="bg-primary text-white font-mono text-[10px]">Zero-Trust mTLS Backbone</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6 text-xs font-mono">
              <div className="flex flex-col md:flex-row items-stretch justify-between gap-4 text-center">
                {/* Client Gateways */}
                <div className="p-4 rounded-xl bg-slate-800 border border-slate-700 flex flex-col justify-center flex-1 shadow-sm">
                  <span className="font-bold text-white block font-sans">TanStack Start Trade Terminal</span>
                  <span className="text-[10px] text-slate-400 mt-1 block">React 19 • Vite • Tailwind</span>
                </div>

                <div className="flex items-center justify-center text-primary font-bold">
                  <ArrowRight className="h-6 w-6 rotate-90 md:rotate-0" />
                </div>

                {/* API Gateway */}
                <div className="p-4 rounded-xl bg-primary/20 border-2 border-primary text-primary-foreground flex flex-col justify-center flex-1 shadow-md">
                  <span className="font-bold text-white block font-sans">Kong / AWS Edge API Gateway</span>
                  <span className="text-[10px] text-primary-300 mt-1 block">SSL / TLS 1.3 Termination • Rate Limiting</span>
                </div>

                <div className="flex items-center justify-center text-primary font-bold">
                  <ArrowRight className="h-6 w-6 rotate-90 md:rotate-0" />
                </div>

                {/* Event Bus */}
                <div className="p-4 rounded-xl bg-amber-500/20 border-2 border-amber-500 text-amber-200 flex flex-col justify-center flex-1 shadow-md">
                  <span className="font-bold text-white block font-sans">Redis / Kafka Asynchronous Bus</span>
                  <span className="text-[10px] text-amber-300 mt-1 block">Pub/Sub Backbone • ARQ Tasks</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/80 text-slate-300 text-[11px] leading-relaxed font-sans">
                <strong className="text-white font-bold block mb-1">Decoupled Operational Strategy:</strong>
                All internal inter-service communication requests authenticate via high-speed asynchronous gRPC and REST sidecars. Database layers are strictly isolated per bounded context — ensuring that intense AI matching matrices or compliance sweeps never degrade core escrow settlement capabilities.
              </div>
            </CardContent>
          </Card>

          {/* Microservices Directory Breakdown Grid */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-foreground">Domain-Driven Microservices Ledger</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((svc) => {
                const Icon = svc.icon;

                return (
                  <Card key={svc.id} className="border border-border bg-white shadow-sm flex flex-col justify-between hover:border-primary/50 transition-colors">
                    <CardHeader className="space-y-3 pb-4 border-b border-border bg-secondary/20">
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="uppercase font-mono text-[10px]">{svc.id}</Badge>
                        <Badge variant="outline" className="font-mono text-[10px] bg-white text-primary border-primary">
                          Port {svc.port}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 pt-1">
                        <div className="p-2.5 rounded-lg bg-primary/10 text-primary flex-shrink-0">
                          <Icon className="h-5 w-5" />
                        </div>
                        <CardTitle className="text-base font-extrabold text-foreground">{svc.name}</CardTitle>
                      </div>
                      <span className="text-[11px] font-mono text-muted-foreground block tracking-tight">
                        Stack: {svc.tech}
                      </span>
                    </CardHeader>

                    <CardContent className="space-y-4 pt-4 flex-1 flex flex-col justify-between text-xs">
                      <p className="text-muted-foreground leading-relaxed">{svc.desc}</p>

                      <div className="space-y-3 pt-2">
                        {/* Sample endpoints */}
                        <div className="space-y-1">
                          <span className="font-bold text-foreground block uppercase text-[10px] tracking-wider font-mono">Sample Routers:</span>
                          <div className="p-2.5 bg-slate-900 text-slate-100 rounded-lg space-y-1 font-mono text-[11px] overflow-x-auto">
                            {svc.endpoints.map((ep, eIdx) => (
                              <div key={eIdx} className="truncate">{ep}</div>
                            ))}
                          </div>
                        </div>

                        {/* Asynchronous Event hooks */}
                        <div className="p-2.5 bg-secondary/50 rounded-lg border border-border text-[11px] font-mono text-muted-foreground">
                          {svc.events.map((ev, evIdx) => (
                            <div key={evIdx}>{ev}</div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
