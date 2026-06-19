import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AppSidebar } from "@/components/AppSidebar";
import { getSupabaseSession } from "@/lib/supabase";
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
  HelpCircle,
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

  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen">
        <AppSidebar activeRoute="orders" />

        <main className="flex-1 overflow-auto">
          <header className="flex h-16 items-center justify-between border-b border-border bg-white px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate({ to: "/dashboard" })}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-lg font-semibold text-foreground">Orders & Escrow Management</h1>
            </div>
          </header>

          <div className="p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
            {/* Escrow Educational Banner */}
            <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
              <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center gap-4 justify-between">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h2 className="text-lg font-bold text-foreground">Tureep Secure Cross-Border Escrow Flow</h2>
                    <p className="text-xs text-muted-foreground mt-1 max-w-3xl leading-relaxed">
                      To safeguard buyers in Turkey/EU and sellers in Iraq/Iran, transaction funds are held in a secure neutral institutional escrow account (#ESC-2026-991). Funds are only released to the seller upon mutually verified fulfillment of Release Conditions (e.g., SGS inspection certificate and Bill of Lading verification).
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {error && (
              <Card className="border-red-200 bg-red-50 p-4">
                <p className="text-sm font-medium text-red-700">{error}</p>
              </Card>
            )}

            {loading ? (
              <p className="text-muted-foreground">Loading orders...</p>
            ) : orders.length === 0 ? (
              <Card className="p-12 text-center">
                <ShoppingCart className="mx-auto h-10 w-10 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">No orders yet.</p>
                <p className="text-sm text-muted-foreground">
                  Accept a pre-deal and convert it to create your first order.
                </p>
                <Button className="mt-4" onClick={() => navigate({ to: "/pre-deals" })}>
                  View pre-deals
                </Button>
              </Card>
            ) : (
              <div className="grid gap-6">
                {orders.map((order) => {
                  const hasConditionsChecked = simulatedConditions[order.id] || false;
                  return (
                    <Card key={order.id} className="overflow-hidden border-border shadow-sm">
                      <CardHeader className="bg-secondary/40 border-b border-border pb-4">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-bold text-foreground">
                              Order {order.order_number}
                            </h3>
                            <Badge variant={order.status === "completed" ? "outline" : "default"} className={order.status === "completed" ? "bg-green-50 text-green-700 border-green-300" : ""}>
                              Status: {order.status}
                            </Badge>
                            <Badge variant="secondary" className="capitalize">
                              Payment: {order.payment_status}
                            </Badge>
                          </div>
                          <span className="text-xs text-muted-foreground font-mono">
                            Created: {new Date(order.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </CardHeader>

                      <CardContent className="p-6 space-y-6">
                        {/* Order specifics */}
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="text-sm font-semibold text-foreground mb-2">Item Summary</h4>
                            <div className="p-4 bg-secondary/30 rounded-lg space-y-1 text-sm">
                              <p className="font-medium text-foreground">
                                {order.items[0]?.product?.name || "B2B Bulk Product"}
                              </p>
                              <p className="text-muted-foreground">
                                {order.items[0]?.quantity} {order.items[0]?.unit} @ ${(Number(order.items[0]?.unit_price) || 0).toFixed(2)} / {order.items[0]?.unit}
                              </p>
                              <div className="pt-2 mt-2 border-t border-border flex justify-between font-bold text-foreground">
                                <span>Total Transaction Value:</span>
                                <span>${Number(order.total_value).toFixed(2)} {order.currency}</span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3 text-xs text-muted-foreground">
                            <h4 className="text-sm font-semibold text-foreground">Logistics & Escrow Metadata</h4>
                            <div className="grid grid-cols-2 gap-2 p-4 bg-secondary/30 rounded-lg">
                              <div>
                                <span className="font-semibold text-foreground">Payment Custody:</span> {order.payment_method}
                              </div>
                              <div>
                                <span className="font-semibold text-foreground">Incoterm:</span> {order.incoterm || "FOB"}
                              </div>
                              <div>
                                <span className="font-semibold text-foreground">Origin Corridor:</span> {order.origin_country}
                              </div>
                              <div>
                                <span className="font-semibold text-foreground">Destination:</span> {order.destination_country}
                              </div>
                              <div className="col-span-2 pt-1">
                                <span className="font-semibold text-foreground">Platform Overhead Fee:</span> ${Number(order.platform_fee).toFixed(2)} {order.currency}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Release conditions section */}
                        <div className="border border-primary/20 bg-primary/5 p-4 rounded-lg space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-primary flex items-center gap-1.5 uppercase tracking-wider font-mono">
                              <FileText className="h-4 w-4" />
                              Escrow Release Conditions
                            </span>
                            <span className="text-xs text-muted-foreground">
                              Neutral Audit Node: Active
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            Payment funds remain secured in institutional escrow until mock compliance proof is authenticated. In this terminal preview, simulate condition satisfaction below:
                          </p>
                          
                          {order.payment_status === "held" && (
                            <div className="pt-2 flex items-center gap-3">
                              <input
                                id={`cond-${order.id}`}
                                type="checkbox"
                                checked={hasConditionsChecked}
                                onChange={() => toggleCondition(order.id)}
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary flex-shrink-0"
                              />
                              <label htmlFor={`cond-${order.id}`} className="text-xs font-medium text-foreground cursor-pointer">
                                [MOCK PROOF] Confirm verified Bill of Lading (B/L) and approved SGS Certificate of Inspection.
                              </label>
                            </div>
                          )}
                        </div>

                        {/* Workflow Action Bar */}
                        <div className="pt-2 border-t border-border flex flex-wrap items-center justify-end gap-3">
                          {order.status === "pending" && order.payment_status === "pending" && (
                            <Button className="bg-primary hover:bg-primary/90 text-white" onClick={() => handlePay(order)}>
                              <CreditCard className="mr-2 h-4 w-4" />
                              Deposit ${Number(order.total_value).toFixed(2)} to Escrow
                            </Button>
                          )}

                          {order.payment_status === "held" && (
                            <>
                              <Button
                                variant="outline"
                                className="border-red-300 text-red-700 hover:bg-red-50"
                                onClick={() => handleRefund(order)}
                              >
                                <AlertCircle className="mr-2 h-4 w-4" />
                                Initiate Mock Dispute (Refund)
                              </Button>
                              <Button
                                className="bg-green-600 hover:bg-green-700 text-white"
                                disabled={!hasConditionsChecked}
                                onClick={() => handleRelease(order)}
                              >
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Release Escrow to Seller
                              </Button>
                            </>
                          )}

                          {order.payment_status === "released" && (
                            <div className="flex items-center gap-2 text-sm font-bold text-green-600 bg-green-50 px-4 py-2 rounded-md border border-green-200">
                              <CheckCircle2 className="h-5 w-5" />
                              Escrow Released & Settled Successfully
                            </div>
                          )}

                          {order.payment_status === "refunded" && (
                            <div className="flex items-center gap-2 text-sm font-bold text-red-600 bg-red-50 px-4 py-2 rounded-md border border-red-200">
                              <AlertCircle className="h-5 w-5" />
                              Escrow Disputed & Refunded to Buyer
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
    </div>
  );
}

