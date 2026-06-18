import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Order,
  actOnPayment,
  createPayment,
  getOrders,
} from "@/lib/api";
import {
  ShoppingCart,
  ArrowLeft,
  LayoutDashboard,
  Package,
  Handshake,
  CreditCard,
  Truck,
  CheckCircle2,
} from "lucide-react";

export const Route = createFileRoute("/orders")({
  component: OrdersPage,
});

function OrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 flex-col border-r border-border bg-white lg:flex">
          <div className="flex h-16 items-center gap-2 border-b border-border px-6">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <span className="font-mono text-sm font-bold">T</span>
            </div>
            <span className="text-lg font-semibold text-foreground">Tureep AI+</span>
          </div>
          <nav className="flex-1 space-y-1 p-4">
            <a
              href="/dashboard"
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </a>
            <a
              href="/products"
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <Package className="h-4 w-4" />
              Products
            </a>
            <a
              href="/pre-deals"
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <Handshake className="h-4 w-4" />
              Pre-Deals
            </a>
            <a
              href="/orders"
              className="flex items-center gap-3 rounded-md bg-secondary px-3 py-2 text-sm font-medium text-foreground"
            >
              <ShoppingCart className="h-4 w-4" />
              Orders
            </a>
          </nav>
        </aside>

        <main className="flex-1">
          <header className="flex h-16 items-center justify-between border-b border-border bg-white px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate({ to: "/dashboard" })}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-lg font-semibold text-foreground">Orders</h1>
            </div>
          </header>

          <div className="p-6 lg:p-8">
            {error && (
              <Card className="mb-6 border-red-200 bg-red-50 p-4">
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
                  Accept a pre-deal to create your first order.
                </p>
                <Button className="mt-4" onClick={() => navigate({ to: "/pre-deals" })}>
                  View pre-deals
                </Button>
              </Card>
            ) : (
              <div className="grid gap-4">
                {orders.map((order) => (
                  <Card key={order.id} className="overflow-hidden">
                    <CardContent className="p-5">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-semibold text-foreground">
                              Order {order.order_number}
                            </h3>
                            <Badge>{order.status}</Badge>
                            <Badge variant="outline">{order.payment_status}</Badge>
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {order.items[0]?.quantity} {order.items[0]?.unit} of{" "}
                            {order.items[0]?.product?.name} — ${order.total_value} ({order.currency})
                          </p>
                          <div className="mt-4 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2 lg:grid-cols-4">
                            <div className="flex items-center gap-2">
                              <CreditCard className="h-4 w-4 text-primary" />
                              <span>{order.payment_method}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Truck className="h-4 w-4 text-primary" />
                              <span>
                                {order.origin_country} → {order.destination_country}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-primary" />
                              <span>Platform fee: ${order.platform_fee}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-foreground">Buyer:</span>
                              <span>{order.buyer?.name}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          {order.status === "pending" && order.payment_status === "pending" && (
                            <Button size="sm" onClick={() => handlePay(order)}>
                              <CreditCard className="mr-2 h-4 w-4" />
                              Pay into Escrow
                            </Button>
                          )}
                          {order.payment_status === "held" && (
                            <Button size="sm" onClick={() => handleRelease(order)}>
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Release Escrow
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
