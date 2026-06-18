import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  PreDeal,
  actOnPreDeal,
  generatePreDeals,
  getPreDeals,
} from "@/lib/api";
import {
  Handshake,
  ArrowLeft,
  Sparkles,
  LayoutDashboard,
  Package,
  CheckCircle2,
  XCircle,
  Clock,
  Truck,
} from "lucide-react";

export const Route = createFileRoute("/pre-deals")({
  component: PreDealsPage,
});

function PreDealsPage() {
  const navigate = useNavigate();
  const [deals, setDeals] = useState<PreDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadDeals();
  }, []);

  async function loadDeals() {
    setLoading(true);
    try {
      const d = await getPreDeals();
      setDeals(d);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(dealId: number, action: "accept" | "reject") {
    try {
      await actOnPreDeal(dealId, action);
      setDeals(
        deals.map((d) =>
          d.id === dealId
            ? { ...d, status: action === "accept" ? "accepted" : "rejected" }
            : d
        )
      );
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleGenerate() {
    setGenerating(true);
    try {
      await generatePreDeals();
      await loadDeals();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGenerating(false);
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
              className="flex items-center gap-3 rounded-md bg-secondary px-3 py-2 text-sm font-medium text-foreground"
            >
              <Handshake className="h-4 w-4" />
              Pre-Deals
            </a>
          </nav>
        </aside>

        <main className="flex-1">
          <header className="flex h-16 items-center justify-between border-b border-border bg-white px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate({ to: "/dashboard" })} className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-lg font-semibold text-foreground">Pre-Deals</h1>
            </div>
            <Button onClick={handleGenerate} disabled={generating}>
              <Sparkles className="mr-2 h-4 w-4" />
              {generating ? "Generating..." : "Generate pre-deals"}
            </Button>
          </header>

          <div className="p-6 lg:p-8">
            {error && (
              <Card className="mb-6 border-red-200 bg-red-50 p-4">
                <p className="text-sm font-medium text-red-700">{error}</p>
              </Card>
            )}

            {loading ? (
              <p className="text-muted-foreground">Loading pre-deals...</p>
            ) : deals.length === 0 ? (
              <Card className="p-12 text-center">
                <Handshake className="mx-auto h-10 w-10 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">No pre-deals available.</p>
                <p className="text-sm text-muted-foreground">
                  Add products and demands, then generate matches.
                </p>
                <Button className="mt-4" onClick={handleGenerate} disabled={generating}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate pre-deals
                </Button>
              </Card>
            ) : (
              <div className="grid gap-4">
                {deals.map((deal) => (
                  <Card key={deal.id} className="overflow-hidden">
                    <CardContent className="p-5">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-semibold text-foreground">
                              {deal.product?.name}
                            </h3>
                            <Badge variant={deal.is_exclusive ? "default" : "secondary"}>
                              {deal.status}
                            </Badge>
                            {deal.is_exclusive && (
                              <Badge variant="outline" className="border-primary text-primary">
                                Exclusive
                              </Badge>
                            )}
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {deal.quantity} {deal.product?.unit} at suggested price ${deal.suggested_price} per{" "}
                            {deal.product?.unit} • {deal.payment_terms}
                          </p>

                          <div className="mt-4 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2 lg:grid-cols-4">
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4 text-primary" />
                              <span>Seller: {deal.seller?.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Handshake className="h-4 w-4 text-primary" />
                              <span>Buyer: {deal.buyer?.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Truck className="h-4 w-4 text-primary" />
                              <span>Shipping: ${deal.shipping_cost}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-primary" />
                              <span>Expires: {new Date(deal.expires_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>

                        {deal.status === "pending" && (
                          <div className="flex gap-2 lg:flex-col">
                            <Button size="sm" onClick={() => handleAction(deal.id, "accept")}>
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAction(deal.id, "reject")}
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Reject
                            </Button>
                          </div>
                        )}
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
