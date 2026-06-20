import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Demand, getDemands, createDemand, generatePreDeals } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { ClipboardList, Plus, ArrowLeft, Globe, MapPin, Sparkles, Handshake, CheckCircle2, ChevronRight, AlertCircle, RefreshCw } from "lucide-react";

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
    setError("");
    try {
      const d = await getDemands();
      setDemands(d);
    } catch (err: any) {
      setError(err.message || "Failed to query active commercial demand pool");
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
      setSuccess(t("demands.post.success", "Commercial purchasing inquiry posted successfully. Distributed index matching active."));
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
  const inputClass = "w-full px-4 py-3 bg-surface-100/80 border border-surface-200 rounded-2xl text-xs text-surface-900 font-mono placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all";
  const labelClass = "block text-xs font-bold text-surface-700 mb-1.5 font-sans uppercase tracking-wider";

  return (
    <div className={`space-y-8 animate-slide-in font-sans select-none ${isRtl ? "text-right" : "text-left"}`} dir={dir}>
      
      {/* Vercel Style Main Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-900 text-white p-8 rounded-3xl border border-surface-800 shadow-2xl select-none">
        <div className="space-y-1">
          <Badge className="bg-amber-400 text-black font-black font-mono text-[10px] uppercase tracking-widest px-3 py-1">Inquiries desk</Badge>
          <h1 className="text-3xl font-black tracking-tight text-white font-serif">
            {t("dash.metrics.demands", "Active Commercial Demands & Purchasing Manifests")}
          </h1>
          <p className="text-xs text-surface-400 font-mono">Inject structured B2B international purchasing inquiries to source Middle Eastern raw commodities</p>
        </div>

        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black text-xs px-6 py-3.5 h-auto rounded-2xl shadow-xl hover:scale-105 transition-all select-none cursor-pointer self-start sm:self-auto font-mono flex-shrink-0"
        >
          <Plus className={isRtl ? "ml-2 h-4 w-4 fill-slate-950" : "mr-2 h-4 w-4 fill-slate-950"} />
          <span>{showForm ? t("btn.submit", "Abort Handshake") : t("Post Purchasing Inquiry", "+ Post Purchasing Manifest")}</span>
        </Button>
      </div>

      {/* Universal 7-Stage Workflow Step 02 Handshake Card */}
      <Card className="bg-gradient-to-br from-amber-500/20 via-amber-500/5 to-transparent border-2 border-amber-500/80 shadow-xl rounded-3xl select-none overflow-hidden relative">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <CardContent className="p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl select-text">
            <Badge className="bg-amber-500 text-black font-black uppercase font-mono text-[10px] tracking-widest px-3 py-1 shadow-sm">Workflow Step 02 Handshake Handoff</Badge>
            <h2 className="text-xl font-black text-surface-900 font-sans tracking-tight">Advance to Stage 02: Launch Smart Spot Matching</h2>
            <p className="text-xs text-surface-600 leading-relaxed font-sans select-text">
              Once your target corporate purchasing inquiries are active below, trigger our automated smart matching sidecar. The engine actively correlates purchasing volumes against verified international spot catalogs (`/products`) and generates formal bilateral pre-deals.
            </p>
          </div>

          <Button
            size="lg"
            onClick={handleStepToStage2}
            disabled={generating}
            className="bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-xs sm:text-sm px-8 py-5 h-auto rounded-2xl shadow-xl hover:scale-105 transition-all select-none flex items-center justify-center gap-2.5 flex-shrink-0 group self-end md:self-center font-mono cursor-pointer"
          >
            <Sparkles className="h-5 w-5 fill-neutral-950 animate-spin" style={{ animationDuration: "6s" }} />
            <span>{generating ? "Evaluating Matching Vectors..." : "🤝 Step to Stage 02 (Run Match Engine)"}</span>
            <ChevronRight className={isRtl ? "h-5 w-5 rotate-180 group-hover:-translate-x-1 transition-transform" : "h-5 w-5 group-hover:translate-x-1 transition-transform"} />
          </Button>
        </CardContent>
      </Card>

      {success && <p className="text-xs font-bold text-success-700 bg-success-50 p-4 rounded-2xl border border-success-200 select-text font-mono">{success}</p>}
      {error && <p className="text-xs font-bold text-danger-700 bg-danger-50 p-4 rounded-2xl border border-danger-200 select-text font-mono">{error}</p>}

      {/* Structured Injection Form */}
      {showForm && (
        <Card className="border-2 border-primary-500/60 bg-white shadow-2xl rounded-3xl animate-slide-in select-text">
          <CardHeader className="p-8 pb-6 border-b border-surface-100 bg-surface-50/50 rounded-t-3xl select-none">
            <CardTitle className="text-xl font-black text-surface-900 font-sans tracking-tight">Inject Structured B2B Commercial Purchasing Inquiry</CardTitle>
            <CardDescription className="text-xs font-mono">
              Verified entities execute instant asynchronous query broadcasts
            </CardDescription>
          </CardHeader>

          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className={labelClass}>Target Commodity Title</label>
                  <input type="text" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="e.g., Standard Basra Bulk Medjool Dates" className={inputClass} required />
                </div>

                <div>
                  <label className={labelClass}>Category Ruling</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className={`${inputClass} cursor-pointer font-bold font-mono`}>
                    <option value="dates">Dates (0804.10)</option>
                    <option value="phosphate">Phosphate (2510.10)</option>
                    <option value="steel_scrap">Steel Scrap (7204.49)</option>
                    <option value="petrochemicals">Petrochemicals (2710.12)</option>
                    <option value="textiles">Textiles (5201.00)</option>
                    <option value="general">General Consolidated Manifest</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Purchasing Haulage Tonnage</label>
                  <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="e.g., 500" className={inputClass} required />
                </div>

                <div>
                  <label className={labelClass}>Standard Unit</label>
                  <select value={unit} onChange={(e) => setUnit(e.target.value)} className={`${inputClass} cursor-pointer font-bold font-mono`}>
                    <option value="ton">Metric Ton (Ton)</option>
                    <option value="container">Ocean Container (40ft)</option>
                    <option value="kg">Kilogram (Kg)</option>
                    <option value="unit">Individual Commercial Unit</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Max Target FOB Budget ($ / unit)</label>
                  <input type="number" step="0.05" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="e.g., 2.75" className={inputClass} required />
                </div>

                <div>
                  <label className={labelClass}>Destination Free Port or Waypoint</label>
                  <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g., Mersin Bonded Warehouse, Turkey" className={inputClass} required />
                </div>
              </div>

              <div className="pt-4 border-t border-surface-100 flex justify-end select-none">
                <Button type="submit" className="bg-primary-600 hover:bg-primary-500 text-white font-extrabold px-8 py-3.5 h-auto rounded-2xl shadow-lg shadow-primary-600/30 font-sans text-xs cursor-pointer" disabled={submitting}>
                  {submitting ? "Broadcasting institutional manifest..." : "+ Authorize Commercial Manifest"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Highly Definitive Active Demands Ledger Showcase */}
      <div className="space-y-4">
        <div className="flex items-center justify-between bg-surface-100 p-4 rounded-2xl border border-surface-200 select-none">
          <h3 className="text-base font-extrabold text-surface-900 font-sans flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-primary-600" />
            <span>Consolidated Exporter Purchasing Demand Queue</span>
          </h3>
          <span className="text-xs font-bold text-surface-500 font-mono">Distributed Indexing: {demands.length} Active Node{demands.length === 1 ? "" : "s"}</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-3xl p-6 border border-surface-200 animate-pulse space-y-4">
                <div className="h-3 bg-surface-200 rounded-full w-1/3" />
                <div className="h-6 bg-surface-200 rounded-lg w-3/4" />
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="h-12 bg-surface-100 rounded-xl" />
                  <div className="h-12 bg-surface-100 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : demands.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 border border-surface-200 text-center space-y-4 shadow-sm select-none">
            <ClipboardList className="w-16 h-16 text-surface-300 mx-auto animate-pulse" />
            <h3 className="text-xl font-bold text-surface-900">Zero Active Commercial Demands</h3>
            <p className="text-xs text-surface-500 max-w-md mx-auto leading-relaxed">
              Your institutional purchasing inquiries ledger is entirely silent. Post your target operational purchasing requirements to surface raw spot catalogs.
            </p>
            <Button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-yellow-500 text-slate-950 rounded-2xl text-xs font-black hover:bg-yellow-400 transition-all shadow-xl hover:scale-105 cursor-pointer font-mono mt-2"
            >
              <Plus className="w-4 h-4 fill-slate-950" /> Post Purchasing Manifest Manifest
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children select-text font-mono">
            {demands.map((demand) => (
              <Card key={demand.id} className="overflow-hidden border border-surface-200 bg-white shadow-sm hover:border-primary-500 transition-all duration-300 rounded-3xl hover:shadow-xl flex flex-col justify-between group">
                <CardHeader className="p-6 pb-4 bg-surface-50/80 border-b border-surface-100 rounded-t-3xl select-none font-sans">
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black font-mono bg-primary-50 text-primary-700 uppercase tracking-widest border border-primary-100">
                      {demand.category}
                    </span>
                    <span className="text-[10px] text-surface-400 font-mono font-bold">Inquiry #{demand.id}</span>
                  </div>
                  <CardTitle className="font-extrabold text-surface-900 text-base leading-tight font-sans select-text">{demand.product_name}</CardTitle>
                </CardHeader>

                <CardContent className="p-6 space-y-6 flex-1 flex flex-col justify-between font-mono">
                  <div className="grid grid-cols-2 gap-3 font-mono select-text text-xs">
                    <div className="bg-surface-50 rounded-2xl p-3.5 border border-surface-200/80 flex flex-col justify-between">
                      <span className="text-[10px] text-surface-500 font-bold uppercase tracking-wider font-sans">Target Volume</span>
                      <span className="font-black text-surface-900 text-sm font-mono pt-1">{demand.quantity} {demand.unit.toUpperCase()}</span>
                    </div>

                    <div className="bg-primary-50/50 rounded-2xl p-3.5 border border-primary-100 text-primary-900 flex flex-col justify-between">
                      <span className="text-[10px] text-primary-700 font-bold uppercase tracking-wider font-sans">Max Target Budget</span>
                      <span className="font-black text-primary-700 text-sm font-mono pt-1">${Number(demand.budget).toFixed(2)} / {demand.unit}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono text-surface-600 select-text pt-2 border-t border-surface-100">
                    <MapPin className="w-4 h-4 text-primary-500 flex-shrink-0" />
                    <span className="truncate leading-relaxed">{demand.location}</span>
                  </div>

                  <div className="pt-4 border-t border-surface-100 flex justify-between items-center text-[10px] text-surface-400 font-mono select-none">
                    <span>SLA Priority: <strong className="text-success-600 font-bold">{demand.urgency ? `${demand.urgency}x Standard Flow` : "Standard"}</strong></span>
                    <Button size="sm" className="bg-primary-600 hover:bg-primary-500 text-white font-sans font-bold h-9 px-4 rounded-xl text-xs shadow-md group-hover:scale-105 transition-transform cursor-pointer" onClick={() => navigate({ to: "/pre-deals" })}>
                      <span>Smart Spot Match</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default DemandsPage;
