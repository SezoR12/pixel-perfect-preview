import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AppSidebar } from "@/components/AppSidebar";
import { TopWorkflowBar } from "@/components/TopWorkflowBar";
import { getSupabaseSession } from "@/lib/supabase";
import { useI18n } from "@/lib/i18n";
import {
  Order,
  actOnPayment,
  createPayment,
  getOrders,
} from "@/lib/api";
import {
  ShoppingCart,
  ArrowLeft,
  CreditCard,
  Truck,
  CheckCircle2,
  ShieldCheck,
  FileText,
  AlertCircle,
  ChevronRight,
} from "lucide-react";

export const Route = createFileRoute("/orders")({
  beforeLoad: async ({ location }) => {
    const { session } = await getSupabaseSession();
    if (!session) {
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
      });
    }
  },
  component: OrdersPage,
});

function OrdersPage() {
  const navigate = useNavigate();
  const { t, dir } = useI18n();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [simulatedConditions, setSimulatedConditions] = useState<Record<number, boolean>>({});

  useEffect(() => {
    getOrders()
      .then(setOrders)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function handlePay(order: Order) {
    try {
      await createPayment(order.id, "Escrow", order.total_value, order.currency);
      const updated = await getOrders();
      setOrders(updated);
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleRelease(order: Order) {
    if (!order.payments.length) return;
    try {
      await actOnPayment(order.id, order.payments[0].id, "release");
      const updated = await getOrders();
      setOrders(updated);
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleRefund(order: Order) {
    if (!order.payments.length) return;
    try {
      await actOnPayment(order.id, order.payments[0].id, "refund");
      const updated = await getOrders();
      setOrders(updated);
    } catch (err: any) {
      setError(err.message);
    }
  }

  function toggleCondition(orderId: number) {
    setSimulatedConditions((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  }

  const isRtl = dir === "rtl";

  return (
    <div className={`flex min-h-screen bg-background ${isRtl ? "font-sans text-right" : "font-sans text-left"}`} dir={dir}>
      <AppSidebar activeRoute="orders" />

      <main className="flex-1 overflow-auto">
        <header className="flex h-16 items-center justify-between border-b border-border bg-white px-6 lg:px-8 select-none">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate({ to: "/dashboard" })}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className={isRtl ? "h-5 w-5 rotate-180" : "h-5 w-5"} />
            </button>
            <h1 className="text-lg font-bold text-foreground">
              {t("nav.orders", "Orders & Escrow Operations")}
            </h1>
          </div>
        </header>

        <div className="p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
          
          {/* Universal Handoff Subsystem Status Card */}
          <Card className="bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent border-2 border-amber-500/80 shadow-lg select-none font-mono">
            <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-1.5 max-w-2xl select-text">
                <Badge className="bg-amber-500 text-black font-extrabold uppercase font-mono text-[10px] tracking-widest">Workflow Trajectory Complete Step Handoff</Badge>
                <h2 className="text-lg font-extrabold text-foreground font-sans">Advance to Stage 04 & Stage 05: Launch Regulatory KYC & SWIFT Gateways</h2>
                <p className="text-xs text-muted-foreground leading-relaxed font-sans">
                  Once your transaction manifests and neutral escrow locks are active below, execute mandatory counterparty regulatory identity proofs or initiate official SWIFT MT700 L/C status state machines.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
                <Button
                  size="lg"
                  onClick={() => navigate({ to: "/sanctions" })}
                  className="bg-black/90 hover:bg-black text-white font-bold text-xs sm:text-sm px-6 py-5 rounded-2xl shadow-xl hover:scale-105 transition-all select-none flex items-center gap-2 group font-mono"
                >
                  <ShieldCheck className="h-4 w-4 text-yellow-400" />
                  <span>📑 Step to Stage 04 (KYC & Sanctions)</span>
                  <ChevronRight className={isRtl ? "h-4 w-4 rotate-180 group-hover:-translate-x-1" : "h-4 w-4 group-hover:translate-x-1"} />
                </Button>

                <Button
                  size="lg"
                  onClick={() => navigate({ to: "/trade-finance" })}
                  className="bg-amber-500 hover:bg-amber-400 text-black font-black text-xs sm:text-sm px-6 py-5 rounded-2xl shadow-xl hover:scale-105 transition-all select-none flex items-center gap-2 group font-mono"
                >
                  <CreditCard className="h-4 w-4 fill-black" />
                  <span>🏛️ Step to Stage 05 (SWIFT Trade Setup)</span>
                  <ChevronRight className={isRtl ? "h-4 w-4 rotate-180 group-hover:-translate-x-1" : "h-4 w-4 group-hover:translate-x-1"} />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Escrow Educational Banner */}
          <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20 select-none">
            <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center gap-4 justify-between">
              <div className="flex items-start gap-3">
                <ShieldCheck className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-lg font-extrabold text-foreground">{t("ord.banner.title", "Tureep Secure Neutral Escrow Workflow Subsystem")}</h2>
                  <p className="text-xs text-muted-foreground mt-1 max-w-3xl leading-relaxed">
                    {t("ord.banner.desc", "To safeguard cross-border commodity buyers in Turkey/Europe and suppliers in Iraq/Iran, transaction value is held in an institutional neutral escrow custody account (#ESC-2026-991). Releasing funds requires verification of shipping documents and SGS quality inspection reports.")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {error && (
            <Card className="border-red-200 bg-red-50 p-4">
              <p className="text-sm font-bold text-red-700">{error}</p>
            </Card>
          )}

          {loading ? (
            <p className="text-muted-foreground text-sm">Synthesizing commercial transactions...</p>
          ) : orders.length === 0 ? (
            <Card className="p-12 text-center bg-secondary/30">
              <ShoppingCart className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-3 font-medium text-foreground">Zero Active Commercial Orders</p>
              <p className="text-xs text-muted-foreground mt-1">
                Evaluate a pre-deal proposition and auto-convert it to commit an order.
              </p>
              <Button className="mt-4 bg-primary hover:bg-primary/90 text-white font-bold" onClick={() => navigate({ to: "/pre-deals" })}>
                Review Handshakes
              </Button>
            </Card>
          ) : (
            <div className="grid gap-6">
              {orders.map((order) => {
                const hasConditionsChecked = simulatedConditions[order.id] || false;
                return (
                  <Card key={order.id} className="overflow-hidden border border-border bg-white shadow-sm hover:border-primary/50 transition-colors">
                    <CardHeader className="bg-secondary/40 border-b border-border pb-4 p-5">
                      <div className="flex flex-wrap items-center justify-between gap-4 font-mono">
                        <div className="flex items-center gap-3">
                          <Badge className="bg-amber-500 text-black font-extrabold text-xs">{order.order_number}</Badge>
                          <h3 className="text-base font-extrabold text-foreground font-sans">
                            Confirmed Commercial Trade Manifest
                          </h3>
                          <Badge variant={order.status === "completed" ? "outline" : "default"} className={order.status === "completed" ? "bg-green-50 text-green-700 border-green-300 uppercase text-[10px]" : "uppercase text-[10px]"}>
                            Status: {order.status}
                          </Badge>
                          <Badge className="bg-primary text-white uppercase text-[10px]">
                            Payment Status: {order.payment_status}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          Created Date: {new Date(order.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </CardHeader>

                    <CardContent className="p-6 space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-xs font-bold text-foreground mb-2 uppercase font-mono tracking-wider">Commodity Summary</h4>
                          <div className="p-4 bg-secondary/30 rounded-xl space-y-1.5 text-xs font-mono">
                            <p className="font-extrabold text-foreground font-sans text-sm">
                              {order.items[0]?.product?.name || "B2B International Bulk Commodity"}
                            </p>
                            <p className="text-muted-foreground font-sans">
                              Total Purchasing Volume: <strong className="text-foreground">{order.items[0]?.quantity} {order.items[0]?.unit}</strong> @ ${(Number(order.items[0]?.unit_price) || 0).toFixed(2)} / {order.items[0]?.unit}
                            </p>
                            <div className="pt-3 mt-2 border-t border-border flex justify-between font-extrabold text-foreground font-sans text-sm">
                              <span>Total Transaction Commitment:</span>
                              <span className="text-primary font-mono select-all">${Number(order.total_value).toFixed(2)} {order.currency}</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3 text-xs text-muted-foreground font-mono">
                          <h4 className="text-xs font-bold text-foreground uppercase tracking-wider font-mono">Financial Gateways & Operations Metadata</h4>
                          <div className="grid grid-cols-2 gap-2.5 p-4 bg-secondary/30 rounded-xl">
                            <div>
                              <span className="font-extrabold text-foreground font-sans">Custody Route:</span> {order.payment_method}
                            </div>
                            <div>
                              <span className="font-extrabold text-foreground font-sans">Executed Incoterm:</span> {order.incoterm || "FOB"}
                            </div>
                            <div>
                              <span className="font-extrabold text-foreground font-sans">Origin Corridor:</span> {order.origin_country}
                            </div>
                            <div>
                              <span className="font-extrabold text-foreground font-sans">Target Free Port:</span> {order.destination_country}
                            </div>
                            <div className="col-span-2 pt-2 border-t border-border">
                              <span className="font-extrabold text-foreground font-sans">Platform Overhad Overhead SLA Fee:</span> <strong className="text-primary">${Number(order.platform_fee).toFixed(2)} {order.currency}</strong>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Release Conditions Subsystem */}
                      <div className="border border-primary/20 bg-primary/5 p-5 rounded-xl space-y-3 select-none">
                        <div className="flex items-center justify-between font-mono">
                          <span className="text-xs font-black text-primary flex items-center gap-2 uppercase tracking-wider font-sans">
                            <FileText className="h-4 w-4" />
                            Escrow Face Release Conditions Subsystem
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Neutral Custody Node: Fully Active
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed font-medium select-text">
                          Payment funds remain locked in institutional escrow custody until documentary compliance verification is authenticated. In this terminal preview, simulate physical documentary clearing below:
                        </p>
                        
                        {order.payment_status === "held" && (
                          <div className="pt-3 flex items-center gap-3 select-text">
                            <input
                              id={`cond-${order.id}`}
                              type="checkbox"
                              checked={hasConditionsChecked}
                              onChange={() => toggleCondition(order.id)}
                              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary flex-shrink-0 cursor-pointer"
                            />
                            <label htmlFor={`cond-${order.id}`} className="text-xs font-bold text-foreground cursor-pointer select-none font-mono">
                              [MOCK CLEARING PROOF] Confirm verified Ocean Bill of Lading (B/L) and passed SGS Quality Inspection field report.
                            </label>
                          </div>
                        )}
                      </div>

                      {/* Operations Action Bar */}
                      <div className="pt-4 border-t border-border flex flex-wrap items-center justify-end gap-3 select-none font-mono">
                        {order.status === "pending" && order.payment_status === "pending" && (
                          <Button size="lg" className="bg-primary hover:bg-primary/90 text-white font-extrabold text-sm shadow-md font-sans" onClick={() => handlePay(order)}>
                            <CreditCard className="mr-2 h-4 w-4" />
                            <span>{t("btn.pay", `Deposit Strictly $${Number(order.total_value).toFixed(2)} into Secure Neutral Escrow`)}</span>
                          </Button>
                        )}

                        {order.payment_status === "held" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-300 text-red-700 hover:bg-red-50 font-bold h-10 px-4 font-sans"
                              onClick={() => handleRefund(order)}
                            >
                              <AlertCircle className="mr-2 h-4 w-4" />
                              <span>{t("btn.dispute", "Initiate Mock Dispute (Chargeback)")}</span>
                            </Button>

                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white font-black h-10 px-6 shadow-md font-sans"
                              disabled={!hasConditionsChecked}
                              onClick={() => handleRelease(order)}
                            >
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              <span>{t("btn.release", "Release Secured Escrow to Supplier")}</span>
                            </Button>
                          </>
                        )}

                        {order.payment_status === "released" && (
                          <div className="flex items-center gap-2 text-xs sm:text-sm font-black text-green-700 bg-green-50 px-5 py-3 rounded-xl border border-green-300 shadow-sm font-sans">
                            <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                            <span>Escrow Face Value Released & Automated Settled MT756 Swift Shipped</span>
                          </div>
                        )}

                        {order.payment_status === "refunded" && (
                          <div className="flex items-center gap-2 text-xs sm:text-sm font-black text-red-700 bg-red-50 px-5 py-3 rounded-xl border border-red-300 shadow-sm font-sans">
                            <AlertCircle className="h-5 w-5 flex-shrink-0" />
                            <span>Escrow Transaction Legally Disputed & Value Dispatched Back to Buyer</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
