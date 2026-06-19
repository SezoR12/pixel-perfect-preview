import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AppSidebar } from "@/components/AppSidebar";
import { TopWorkflowBar } from "@/components/TopWorkflowBar";
import {
  PreDeal,
  actOnPreDeal,
  createOrderFromPreDeal,
  generatePreDeals,
  getPreDeals,
} from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import {
  Handshake,
  ArrowLeft,
  Sparkles,
  Package,
  CheckCircle2,
  XCircle,
  Clock,
  Truck,
  ShoppingCart,
  ChevronRight,
} from "lucide-react";

export const Route = createFileRoute("/pre-deals")({
  component: PreDealsPage,
});

function PreDealsPage() {
  const navigate = useNavigate();
  const { t, dir } = useI18n();
  const [deals, setDeals] = useState<PreDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [generating, setGenerating] = useState(false);
  const [converting, setConverting] = useState(false);

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

  async function handleCreateOrder(dealId: number) {
    setConverting(true);
    setError("");
    try {
      await createOrderFromPreDeal(dealId);
      navigate({ to: "/orders" });
    } catch (err: any) {
      setError(err.message || "Failed to auto-convert to order");
    } finally {
      setConverting(false);
    }
  }

  const isRtl = dir === "rtl";
  const acceptedDeals = deals.filter((d) => d.status === "accepted");

  return (
    <div className={`flex min-h-screen bg-background ${isRtl ? "font-sans text-right" : "font-sans text-left"}`} dir={dir}>
      <AppSidebar activeRoute="pre-deals" />

      <main className="flex-1 overflow-auto">
        <header className="flex h-16 items-center justify-between border-b border-border bg-white px-6 lg:px-8 select-none">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate({ to: "/dashboard" })} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className={isRtl ? "h-5 w-5 rotate-180" : "h-5 w-5"} />
            </button>
            <h1 className="text-lg font-bold text-foreground">
              {t("nav.pre_deals", "Pre-Deals & Bilateral Handshake Propositions")}
            </h1>
          </div>
          <Button onClick={handleGenerate} disabled={generating} className="bg-primary hover:bg-primary/90 text-white font-bold">
            <Sparkles className={isRtl ? "ml-2 h-4 w-4" : "mr-2 h-4 w-4"} />
            <span>{generating ? "Synthesizing Vectors..." : t("Generate pre-deals", "Generate Match Propositions")}</span>
          </Button>
        </header>

        <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
          
          {/* Universal Workflow Handoff Subsystem Card */}
          <Card className="bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent border-2 border-amber-500/80 shadow-lg select-none">
            <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-1.5 max-w-2xl select-text">
                <Badge className="bg-amber-500 text-black font-extrabold uppercase font-mono text-[10px] tracking-widest">Workflow Trajectory Order Handshake Handoff</Badge>
                <h2 className="text-lg font-extrabold text-foreground font-sans">Advance to Stage 03: Auto-Convert Match Proposition into B2B Commercial Order</h2>
                <p className="text-xs text-muted-foreground leading-relaxed font-sans">
                  Once trading entities evaluate suggested FOB pricing and click 'Accept Deal', pre-deals unlock order emission privileges. Executing our auto-conversion service commits an immutable transaction manifest (Order #TUR-2026-000001) and locks active financial overhead fees.
                </p>
              </div>

              <Button
                size="lg"
                onClick={() => handleCreateOrder(acceptedDeals[0]?.id || deals[0]?.id || 501)}
                disabled={converting || (deals.length === 0)}
                className="bg-amber-500 hover:bg-amber-400 text-black font-black text-sm sm:text-base px-8 py-6 rounded-2xl shadow-xl hover:scale-105 transition-all select-none flex items-center gap-2.5 flex-shrink-0 group self-end md:self-center font-mono"
              >
                <ShoppingCart className="h-5 w-5 fill-black" />
                <span>{converting ? "Emitting Target Order..." : "🛒 Step to Stage 03 (Convert to Order)"}</span>
                <ChevronRight className={isRtl ? "h-5 w-5 rotate-180 group-hover:-translate-x-1" : "h-5 w-5 group-hover:translate-x-1"} />
              </Button>
            </CardContent>
          </Card>

          {error && <p className="text-sm font-bold text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">{error}</p>}

          {loading ? (
            <p className="text-muted-foreground text-sm">Synthesizing pre-deal matching propositions...</p>
          ) : deals.length === 0 ? (
            <Card className="p-12 text-center bg-secondary/30">
              <Handshake className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-3 font-medium text-foreground">Zero Match Propositions</p>
              <p className="text-xs text-muted-foreground mt-1">Run our ML Intelligence engine to actively pair market spot catalogs against commercial demands.</p>
              <Button className="mt-4 bg-primary hover:bg-primary/90 text-white font-bold" onClick={handleGenerate} disabled={generating}>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Match Propositions
              </Button>
            </Card>
          ) : (
            <div className="grid gap-4">
              {deals.map((deal) => (
                <Card key={deal.id} className="overflow-hidden border border-border bg-white shadow-sm hover:border-primary/50 transition-colors">
                  <CardContent className="p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="flex-1 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <h3 className="text-base font-extrabold text-foreground font-sans">
                            {deal.product?.name || "B2B Cross-Border Commodity"}
                          </h3>
                          <Badge variant={deal.status === "accepted" ? "outline" : "secondary"} className={deal.status === "accepted" ? "bg-green-50 text-green-700 border-green-300 uppercase font-mono text-[10px]" : "uppercase font-mono text-[10px]"}>
                            State: {deal.status}
                          </Badge>
                          {deal.is_exclusive && (
                            <Badge variant="outline" className="border-primary text-primary font-mono text-[10px]">
                              Exclusive Node
                            </Badge>
                          )}
                          <Badge className="bg-primary text-white font-mono text-[10px]">{deal.payment_terms} Flow</Badge>
                        </div>
                        
                        <p className="text-xs text-muted-foreground font-mono pt-1">
                          Settlement Target: {deal.quantity} {deal.product?.unit} @ Suggested FOB Rate: <strong className="text-foreground">${deal.suggested_price}</strong> / {deal.product?.unit}
                        </p>

                        <div className="mt-4 grid gap-3 text-xs text-muted-foreground sm:grid-cols-2 lg:grid-cols-4 bg-secondary/30 p-3.5 rounded-xl font-mono">
                          <div className="flex items-center gap-2 font-sans">
                            <Package className="h-4 w-4 text-primary" />
                            <span>Supplier: <strong className="text-foreground">{deal.seller?.name}</strong></span>
                          </div>
                          <div className="flex items-center gap-2 font-sans">
                            <Handshake className="h-4 w-4 text-primary" />
                            <span>Importer: <strong className="text-foreground">{deal.buyer?.name}</strong></span>
                          </div>
                          <div className="flex items-center gap-2 font-sans">
                            <Truck className="h-4 w-4 text-primary" />
                            <span>Carrier Freight: ${deal.shipping_cost}</span>
                          </div>
                          <div className="flex items-center gap-2 font-sans">
                            <Clock className="h-4 w-4 text-primary" />
                            <span>Expiry SLA: {new Date(deal.expires_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 lg:flex-col select-none self-end lg:self-center">
                        {deal.status === "pending" && (
                          <>
                            <Button size="sm" className="bg-primary hover:bg-primary/90 text-white font-bold" onClick={() => handleAction(deal.id, "accept")}>
                              <CheckCircle2 className="mr-1.5 h-4 w-4" />
                              <span>{t("btn.accept", "Accept Handshake")}</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-300 text-red-700 hover:bg-red-50 font-bold"
                              onClick={() => handleAction(deal.id, "reject")}
                            >
                              <XCircle className="mr-1.5 h-4 w-4" />
                              <span>{t("btn.reject", "Reject")}</span>
                            </Button>
                          </>
                        )}
                        {deal.status === "accepted" && (
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white font-extrabold shadow-md"
                            onClick={() => handleCreateOrder(deal.id)}
                            disabled={converting}
                          >
                            <ShoppingCart className="mr-1.5 h-4 w-4" />
                            <span>{converting ? "Transmitting Manifest..." : t("Convert to Order", "Convert to Order")}</span>
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
  );
}
