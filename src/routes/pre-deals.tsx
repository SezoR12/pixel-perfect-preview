import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PreDeal, actOnPreDeal, generatePreDeals, getPreDeals } from "@/lib/api";
import { Badge } from "@/components/ui/badge";

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
      setDeals(deals.map((d) => (d.id === dealId ? { ...d, status: action === "accept" ? "accepted" : "rejected" } : d)));
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
      <nav className="border-b border-border px-6 py-4 flex items-center justify-between">
        <span className="font-mono font-bold tracking-tighter text-xl">TUREEP AI+</span>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate({ to: "/dashboard" })}>
            Dashboard
          </Button>
          <Button variant="outline" onClick={() => navigate({ to: "/products" })}>
            Products
          </Button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold tracking-tight">Pre-Deals</h2>
          <Button onClick={handleGenerate} disabled={generating}>
            {generating ? "Generating..." : "Generate Pre-Deals"}
          </Button>
        </div>

        {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

        {loading ? (
          <p>Loading...</p>
        ) : deals.length === 0 ? (
          <p className="text-muted-foreground">No pre-deals available. Create products and demands, then generate.</p>
        ) : (
          <div className="grid gap-4">
            {deals.map((deal) => (
              <Card key={deal.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{deal.product?.name}</h3>
                        {deal.is_exclusive && <Badge variant="secondary">Exclusive</Badge>}
                        <Badge>{deal.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {deal.quantity} {deal.product?.unit} @ ${deal.suggested_price}/{deal.product?.unit} —{" "}
                        {deal.payment_terms}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Seller: {deal.seller?.name} → Buyer: {deal.buyer?.name} • Match: {deal.match_score}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Shipping: ${deal.shipping_cost} • Expires: {new Date(deal.expires_at).toLocaleString()}
                      </p>
                    </div>
                    {deal.status === "pending" && (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleAction(deal.id, "accept")}>
                          Accept
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleAction(deal.id, "reject")}>
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
      </main>
    </div>
  );
}
