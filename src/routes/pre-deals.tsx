import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  AlertCircle,
  RefreshCw,
  ExternalLink,
  MapPin,
  DollarSign
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
  const [success, setSuccess] = useState("");
  const [generating, setGenerating] = useState(false);
  const [converting, setConverting] = useState(false);

  useEffect(() => {
    loadDeals();
  }, []);

  async function loadDeals() {
    setLoading(true);
    setError("");
    try {
      const d = await getPreDeals();
      setDeals(d);
    } catch (err: any) {
      setError(err.message || "Failed to consolidate pre-deal stream");
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(dealId: number, targetAction: "accept" | "reject") {
    setError("");
    setSuccess("");
    try {
      await actOnPreDeal(dealId, targetAction);
      setDeals((prev) =>
        prev.map((d) =>
          d.id === dealId
            ? { ...d, status: targetAction === "accept" ? "accepted" : "rejected" }
            : d
        )
      );
      setSuccess(`Proposition ${targetAction}ed successfully. Status synchronized.`);
    } catch (err: any) {
      setError(err.message || `Failed to evaluate handshake ${targetAction}`);
    }
  }

  async function handleGenerate() {
    setGenerating(true);
    setError("");
    setSuccess("");
    try {
      await generatePreDeals();
      await loadDeals();
      setSuccess("Smart match heuristics calculated successfully. New propositions added to your desk.");
    } catch (err: any) {
      setError(err.message || "Match generation execution dropped");
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
      setError(err.message || "Failed to auto-convert accepted deal into B2B commercial order");
    } finally {
      setConverting(false);
    }
  }

  const isRtl = dir === "rtl";
  const acceptedDeals = deals.filter((d) => d.status === "accepted");

  return (
    <div className={`space-y-8 animate-slide-in font-sans select-none ${isRtl ? "text-right" : "text-left"}`} dir={dir}>
      
      {/* Vercel Style Overview Desk Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-br from-surface-900 via-surface-800 to-slate-950 text-white p-8 rounded-3xl border border-surface-700 shadow-2xl select-none">
        <div className="space-y-1">
          <Badge className="bg-amber-400 text-black font-black font-mono text-[10px] uppercase tracking-widest px-3 py-1">Bilateral hub desk</Badge>
          <h1 className="text-3xl font-black tracking-tight text-white font-serif">
            {t("nav.pre_deals", "Active Institutional Pre-Deals & Handshake Propositions")}
          </h1>
          <p className="text-xs text-surface-400 font-mono">Evaluate automated smart heuristic rule-based spot matches and execute Bilateral order settlements</p>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={generating}
          className="bg-yellow-500 hover:bg-yellow-400 text-neutral-950 font-black text-xs px-6 py-3.5 h-auto rounded-2xl shadow-xl hover:scale-105 transition-all select-none cursor-pointer self-start sm:self-auto font-mono flex-shrink-0"
        >
          <Sparkles className={`w-4 h-4 fill-neutral-950 ${generating ? "animate-spin" : ""}`} />
          <span>{generating ? "Synthesizing Spot Vectors..." : t("Generate pre-deals", "+ Trigger Match Calculation")}</span>
        </Button>
      </div>

      {/* Universal 7-Stage Workflow Step 03 Handoff Subsystem Card */}
      <Card className="bg-gradient-to-br from-amber-500/20 via-amber-500/5 to-transparent border-2 border-amber-500/80 shadow-xl rounded-3xl select-none overflow-hidden relative">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <CardContent className="p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl select-text">
            <Badge className="bg-amber-500 text-black font-black uppercase font-mono text-[10px] tracking-widest px-3 py-1 shadow-sm">Workflow Step 03 Handshake Conversion</Badge>
            <h2 className="text-xl font-black text-surface-900 font-sans tracking-tight">Advance to Stage 03: Auto-Convert Accepted Proposition into B2B Commercial Order</h2>
            <p className="text-xs text-surface-600 leading-relaxed font-sans select-text">
              Once trading counterparties mutually review suggested FOB pricing and click 'Accept Handshake', pre-deals unlock formal order conversion privileges. Hitting our active Cutover service spawns an immutable commercial manifest (`Order #TUR-2026-000001`) and locks regional Free Trade Agreement Form A tariff rules.
            </p>
          </div>

          <Button
            size="lg"
            onClick={() => handleCreateOrder(acceptedDeals[0]?.id || deals[0]?.id || 501)}
            disabled={converting || (deals.length === 0)}
            className="bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-xs sm:text-sm px-8 py-5 h-auto rounded-2xl shadow-2xl hover:scale-105 transition-all select-none flex items-center justify-center gap-2.5 flex-shrink-0 group self-end md:self-center font-mono cursor-pointer"
          >
            <ShoppingCart className="h-5 w-5 fill-neutral-950" />
            <span>{converting ? "Emitting Structural Manifest..." : "🛒 Step to Stage 03 (Convert to Order)"}</span>
            <ChevronRight className={isRtl ? "h-5 w-5 rotate-180 group-hover:-translate-x-1 transition-transform" : "h-5 w-5 group-hover:translate-x-1 transition-transform"} />
          </Button>
        </CardContent>
      </Card>

      {success && <p className="text-xs font-bold text-success-700 bg-success-50 p-4 rounded-2xl border border-success-200 select-text font-mono">{success}</p>}
      {error && <p className="text-xs font-bold text-danger-700 bg-danger-50 p-4 rounded-2xl border border-danger-200 select-text font-mono">{error}</p>}

      {/* Handshakes Proposition Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between bg-surface-100 p-4 rounded-2xl border border-surface-200 select-none">
          <h3 className="text-base font-extrabold text-surface-900 font-sans flex items-center gap-2">
            <Handshake className="w-5 h-5 text-primary-600" />
            <span>Mutually Computed Candidate Pairings Queue</span>
          </h3>
          <span className="text-xs font-bold text-surface-500 font-mono">Distributed Pool: {deals.length} Active Pair{deals.length === 1 ? "" : "s"}</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-3xl p-6 border border-surface-200 animate-pulse space-y-4">
                <div className="h-3 bg-surface-200 rounded-full w-1/3" />
                <div className="h-6 bg-surface-200 rounded-lg w-3/4" />
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="h-16 bg-surface-100 rounded-2xl" />
                  <div className="h-16 bg-surface-100 rounded-2xl" />
                </div>
              </div>
            ))}
          </div>
        ) : deals.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 border border-surface-200 text-center space-y-4 shadow-sm select-none">
            <Handshake className="w-16 h-16 text-surface-300 mx-auto animate-pulse" />
            <h3 className="text-xl font-bold text-surface-900">Zero Target Deal Handshakes</h3>
            <p className="text-xs text-surface-500 max-w-md mx-auto leading-relaxed">
              Your match calculation queue is currently completely clear. Hitting '+ Trigger Match Calculation' above will actively pair market spot catalogs against corporate demands.
            </p>
            <Button
              onClick={handleGenerate}
              disabled={generating}
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-primary-600 text-white rounded-2xl text-xs font-extrabold hover:bg-primary-500 transition-all shadow-md cursor-pointer font-mono mt-2"
            >
              <Sparkles className="w-4 h-4 text-yellow-400" /> Calculate Spot Matches
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children select-text font-mono">
            {deals.map((deal) => {
              const scoreNum = parseFloat(deal.match_score);
              const isAccepted = deal.status === "accepted";
              const isPending = deal.status === "pending";

              return (
                <Card
                  key={deal.id}
                  className={`flex flex-col justify-between transition-all duration-300 relative overflow-hidden rounded-3xl border ${
                    isAccepted
                      ? "border-success-500/60 bg-success-50/20 shadow-xl"
                      : "border-surface-200 bg-white hover:border-primary-500 hover:shadow-xl group"
                  }`}
                >
                  <CardHeader className="p-6 pb-4 bg-surface-50/80 border-b border-surface-100 rounded-t-3xl select-none font-sans">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-primary-500 text-white font-mono text-[10px] uppercase tracking-widest px-2.5 py-0.5">
                          {deal.product?.category || "general"}
                        </Badge>
                        {deal.is_exclusive && (
                          <Badge variant="outline" className="border-amber-400 text-amber-700 bg-amber-50 font-mono text-[10px]">
                            Exclusive Node Hub
                          </Badge>
                        )}
                      </div>
                      <span className="text-[10px] text-surface-400 font-mono font-bold">Pairing #{deal.id}</span>
                    </div>

                    <CardTitle className="font-extrabold text-surface-900 text-base leading-tight font-sans select-text">
                      {deal.product?.name || "B2B MENA Verified Commodity"}
                    </CardTitle>

                    <div className="flex items-center justify-between pt-3 text-xs font-mono text-surface-500">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-primary-600 flex-shrink-0" />
                        <span className="truncate max-w-[180px]">{deal.product?.origin} → {deal.buyer?.country}</span>
                      </div>
                      <Badge variant={isAccepted ? "outline" : "secondary"} className={isAccepted ? "bg-success-100 text-success-800 border-success-300 font-mono uppercase text-[9px] font-black" : "font-mono uppercase text-[9px] font-black"}>
                        State: {deal.status}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="p-6 space-y-6 flex-1 flex flex-col justify-between select-text font-mono">
                    
                    {/* Impeccable mono-for-data visualizer */}
                    <div className="grid grid-cols-2 gap-3 font-mono select-text text-xs">
                      <div className="bg-surface-50 rounded-2xl p-3.5 border border-surface-200/80 flex flex-col justify-between">
                        <span className="text-[10px] text-surface-500 font-bold uppercase tracking-wider font-sans">Suggested Net Volume</span>
                        <span className="font-black text-surface-900 text-sm font-mono pt-1">{deal.quantity} {deal.product?.unit}</span>
                      </div>

                      <div className="bg-primary-50/60 rounded-2xl p-3.5 border border-primary-100 text-primary-900 flex flex-col justify-between">
                        <span className="text-[10px] text-primary-700 font-bold uppercase tracking-wider font-sans">Suggested FOB Price</span>
                        <span className="font-black text-primary-700 text-sm font-mono pt-1">${deal.suggested_price} / {deal.product?.unit}</span>
                      </div>

                      <div className="bg-surface-50 rounded-2xl p-3.5 border border-surface-200/80 flex flex-col justify-between col-span-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-surface-500 font-bold uppercase tracking-wider font-sans flex items-center gap-1">
                            <Truck className="w-3 h-3 text-accent-600" /> Carrier Overhead Freight
                          </span>
                          <span className="text-[9px] font-bold text-slate-500 font-mono">FOB Secure Flow</span>
                        </div>
                        <span className="font-black text-surface-900 text-xs font-mono pt-1">${deal.shipping_cost} Total Estimated Clearing</span>
                      </div>
                    </div>

                    {/* Highly Definitive Target Metadata */}
                    <div className="p-4 bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 space-y-2 text-xs font-mono select-text shadow-inner">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 text-[11px]">
                        <span className="text-slate-400 font-bold font-sans">Counterparty Trust Matrix:</span>
                        <span className="text-yellow-400 font-black">{deal.match_score}% Optimization</span>
                      </div>
                      <div className="truncate"><span className="text-slate-500 block text-[10px]">Verifiable Inventory Owner:</span> <strong className="text-white font-sans">{deal.seller?.name}</strong></div>
                      <div className="truncate"><span className="text-slate-500 block text-[10px]">Institutional Importer:</span> <strong className="text-accent-300 font-sans">{deal.buyer?.name}</strong></div>
                      <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800/80 flex justify-between">
                        <span>Payment: {deal.payment_terms}</span>
                        <span>SLA: {new Date(deal.expires_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Execution Actions */}
                    <div className="pt-4 border-t border-surface-100 mt-auto flex flex-col sm:flex-row items-stretch gap-2.5 select-none">
                      {isPending && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 border-danger-300 text-danger-700 hover:bg-danger-50 font-sans font-bold h-11 rounded-xl text-xs cursor-pointer"
                            onClick={() => handleAction(deal.id, "reject")}
                          >
                            <XCircle className="mr-1.5 h-4 w-4" />
                            <span>{t("btn.reject", "Reject")}</span>
                          </Button>

                          <Button
                            size="sm"
                            className="flex-1 bg-primary-600 hover:bg-primary-500 text-white font-sans font-extrabold h-11 rounded-xl text-xs shadow-md cursor-pointer"
                            onClick={() => handleAction(deal.id, "accept")}
                          >
                            <CheckCircle2 className="mr-1.5 h-4 w-4 text-yellow-400" />
                            <span>{t("btn.accept", "Accept Handshake Props")}</span>
                          </Button>
                        </>
                      )}

                      {isAccepted && (
                        <Button
                          size="lg"
                          className="w-full bg-success-600 hover:bg-success-500 text-white font-sans font-black h-12 rounded-2xl text-xs shadow-lg shadow-success-600/30 cursor-pointer flex items-center justify-center gap-2"
                          onClick={() => handleCreateOrder(deal.id)}
                          disabled={converting}
                        >
                          <ShoppingCart className="w-4 h-4 fill-white" />
                          <span>{converting ? "Transmitting Operational Manifest..." : "+ Execute Formal structural Order Auto-Conversion"}</span>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default PreDealsPage;
