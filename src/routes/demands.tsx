import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TopWorkflowBar } from "@/components/TopWorkflowBar";
import { Demand, getDemands, createDemand, generatePreDeals } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { ClipboardList, Plus, ArrowLeft, Globe, MapPin, Sparkles, Handshake, CheckCircle2, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/demands")({
  component: DemandsPage,
});

function DemandsPage() {
  const navigate = useNavigate();
  const { t, dir } = useI18n();
  const [demands, setDemands] = useState<Demand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);

  // New Demand Form State
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("dates");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("ton");
  const [budget, setBudget] = useState("");
  const [location, setLocation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const d = await getDemands();
      setDemands(d);
    } catch (err: any) {
      setError(err.message || "Failed to query demand pool");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const created = await createDemand({
        product_name: productName,
        category: category || "general",
        quantity: Number(quantity) || 100,
        unit: unit || "ton",
        budget: Number(budget).toFixed(2),
        location: location || "Istanbul, Turkey",
        urgency: 2,
      });
      setDemands([created, ...demands]);
      setShowForm(false);
      setProductName("");
      setQuantity("");
      setBudget("");
      setLocation("");
      setSuccess(t("demands.post.success", "Commercial inquiry posted successfully. Distributed match indexing active."));
    } catch (err: any) {
      setError(err.message || "Failed to post commercial demand");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStepToStage2() {
    setGenerating(true);
    setError("");
    setSuccess("");
    try {
      await generatePreDeals();
      navigate({ to: "/pre-deals" });
    } catch (err: any) {
      setError(err.message || "Matchmaking execution failed");
    } finally {
      setGenerating(false);
    }
  }

  const isRtl = dir === "rtl";

  return (
    <div className={`flex min-h-screen bg-background ${isRtl ? "font-sans text-right" : "font-sans text-left"}`} dir={dir}>
      <AppSidebar activeRoute="demands" />

      <main className="flex-1 overflow-auto">
        <header className="flex h-16 items-center justify-between border-b border-border bg-white px-6 lg:px-8 select-none">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate({ to: "/dashboard" })} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className={isRtl ? "h-5 w-5 rotate-180" : "h-5 w-5"} />
            </button>
            <h1 className="text-lg font-bold text-foreground">
              {t("dash.metrics.demands", "Active Commercial Demands & Purchasing Inquiries")}
            </h1>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="bg-primary hover:bg-primary/90 text-white font-bold">
            <Plus className={isRtl ? "ml-2 h-4 w-4" : "mr-2 h-4 w-4"} />
            <span>{showForm ? t("btn.submit", "Cancel") : t("Post Purchasing Inquiry", "Post Purchasing Inquiry")}</span>
          </Button>
        </header>

        <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
          
          {/* Universal Workflow Handoff Status Card */}
          <Card className="bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent border-2 border-amber-500/80 shadow-lg select-none">
            <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-1.5 max-w-2xl select-text">
                <Badge className="bg-amber-500 text-black font-extrabold uppercase font-mono text-[10px] tracking-widest">Workflow Trajectory Handshake Handoff</Badge>
                <h2 className="text-lg font-extrabold text-foreground font-sans">Advance to Stage 02: Launch Smart Spot Matching</h2>
                <p className="text-xs text-muted-foreground leading-relaxed font-sans">
                  Once your target corporate purchasing inquiries are active below, trigger our automated smart matching sidecar. The engine actively correlates purchasing volumes against verified international spot catalogs (/products) and generates bilateral handshakes.
                </p>
              </div>

              <Button
                size="lg"
                onClick={handleStepToStage2}
                disabled={generating}
                className="bg-amber-500 hover:bg-amber-400 text-black font-black text-sm sm:text-base px-8 py-6 rounded-2xl shadow-xl hover:scale-105 transition-all select-none flex items-center gap-2.5 flex-shrink-0 group self-end md:self-center font-mono"
              >
                <Sparkles className="h-5 w-5 fill-black animate-spin" style={{ animationDuration: "6s" }} />
                <span>{generating ? "Executing Match Algorithms..." : "🤝 Step to Stage 02 (Run Match Engine)"}</span>
                <ChevronRight className={isRtl ? "h-5 w-5 rotate-180 group-hover:-translate-x-1" : "h-5 w-5 group-hover:translate-x-1"} />
              </Button>
            </CardContent>
          </Card>

          {success && <p className="text-sm font-bold text-green-600 bg-green-50 p-3 rounded-lg border border-green-200">{success}</p>}
          {error && <p className="text-sm font-bold text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">{error}</p>}

          {/* New Demand Form */}
          {showForm && (
            <Card className="border-2 border-primary/40 bg-white shadow-lg font-mono">
              <CardHeader>
                <CardTitle className="text-base font-extrabold text-foreground font-sans">Inject Structured B2B Purchasing Manifest</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium font-mono">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="productName" className="font-bold font-sans">Target Commodity Title</Label>
                      <Input id="productName" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="e.g., Standard Basra Bulk Dates" required />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category" className="font-bold font-sans">Category Code</Label>
                      <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g., dates or steel_scrap" required />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="quantity" className="font-bold font-sans">Purchasing Tonnage Tonnage</Label>
                      <Input id="quantity" type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="e.g., 500" required />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="unit" className="font-bold font-sans">Standard Unit</Label>
                      <Input id="unit" value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="e.g., ton or container" required />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="budget" className="font-bold font-sans">Max Target FOB FOB Budget ($ / unit)</Label>
                      <Input id="budget" type="number" step="0.05" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="e.g., 2.75" required />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location" className="font-bold font-sans">Destination Free Zone or Free Free Port</Label>
                      <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g., Mersin Bonded Warehouse, Turkey" required />
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 mt-2 font-sans" disabled={submitting}>
                    {submitting ? "Broadcasting purchasing requirements..." : "Authorize Purchasing Inquiry"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Demands Ledger */}
          <div className="space-y-4">
            {loading ? (
              <p className="text-muted-foreground text-sm">Querying active commercial demands...</p>
            ) : demands.length === 0 ? (
              <Card className="p-12 text-center bg-secondary/30">
                <ClipboardList className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-3 font-medium text-foreground">Zero Active Purchasing Inquiries</p>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {demands.map((demand) => (
                  <Card key={demand.id} className="overflow-hidden border border-border bg-white shadow-sm hover:border-primary/50 transition-colors flex flex-col justify-between">
                    <CardHeader className="p-5 pb-3 bg-secondary/30 border-b border-border">
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="uppercase font-mono text-[10px]">{demand.category}</Badge>
                        <span className="text-[10px] text-muted-foreground font-mono">Inquiry #{demand.id}</span>
                      </div>
                      <h3 className="font-extrabold text-foreground text-base pt-2">{demand.product_name}</h3>
                    </CardHeader>

                    <CardContent className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                      <div className="space-y-2 text-xs font-mono">
                        <div className="flex items-center justify-between p-2 rounded bg-secondary/40">
                          <span className="text-muted-foreground font-sans">Target Volume:</span>
                          <span className="font-black text-foreground">{demand.quantity} {demand.unit.toUpperCase()}</span>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded bg-primary/10 text-primary">
                          <span className="font-sans font-bold">Max Target Target Budget:</span>
                          <span className="font-black">${Number(demand.budget).toFixed(2)} / {demand.unit}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-600 font-sans pt-1">
                          <MapPin className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                          <span className="truncate">{demand.location}</span>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-border flex justify-between items-center text-[10px] text-muted-foreground font-mono">
                        <span>Urgency SLA: {demand.urgency ? `${demand.urgency}x Priority` : "Standard"}</span>
                        <Button size="sm" className="bg-primary hover:bg-primary/90 text-white font-sans font-bold h-8 text-xs" onClick={() => navigate({ to: "/pre-deals" })}>
                          Match Match Engine
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
