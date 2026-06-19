import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AppSidebar } from "@/components/AppSidebar";
import { Product, createProduct, getProducts, generatePreDeals } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { Package, ArrowLeft, Plus, Globe, Sparkles, Handshake, CheckCircle2, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/products")({
  component: ProductsPage,
});

function ProductsPage() {
  const navigate = useNavigate();
  const { t, dir } = useI18n();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    category: "",
    price: "",
    quantity: "",
    unit: "ton",
    origin: "",
    location: "",
    description: "",
  });

  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const product = await createProduct({
        name: form.name,
        category: form.category,
        price: Number(form.price).toFixed(2),
        quantity: Number(form.quantity),
        unit: form.unit,
        origin: form.origin,
        location: form.location,
        description: form.description,
      });
      setProducts([product, ...products]);
      setForm({ name: "", category: "", price: "", quantity: "", unit: "ton", origin: "", location: "", description: "" });
      setShowForm(false);
      setSuccess(t("prod.list.success", "Commodity listed successfully under RLS public indexing filters. Ready for AI evaluation."));
    } catch (err: any) {
      setError(err.message);
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
      <AppSidebar activeRoute="products" />

      <main className="flex-1 overflow-auto">
        <header className="flex h-16 items-center justify-between border-b border-border bg-white px-6 lg:px-8 select-none">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate({ to: "/dashboard" })} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className={isRtl ? "h-5 w-5 rotate-180" : "h-5 w-5"} />
            </button>
            <h1 className="text-lg font-bold text-foreground">
              {t("nav.products", "Products & Verifiable Bulk Spot Catalogs")}
            </h1>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="bg-primary hover:bg-primary/90 text-white font-bold">
            <Plus className={isRtl ? "ml-2 h-4 w-4" : "mr-2 h-4 w-4"} />
            <span>{showForm ? t("btn.submit", "Cancel") : t("List new Bulk Commodity", "List new Bulk Commodity")}</span>
          </Button>
        </header>

        <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
          
          {/* Universal Handoff Step Status Component */}
          <Card className="bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent border-2 border-amber-500/80 shadow-lg select-none">
            <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-1.5 max-w-2xl select-text">
                <Badge className="bg-amber-500 text-black font-extrabold uppercase font-mono text-[10px] tracking-widest">Workflow Trajectory Handshake Handoff</Badge>
                <h2 className="text-lg font-extrabold text-foreground font-sans">Advance to Stage 02: Launch XGBoost Spot Matching</h2>
                <p className="text-xs text-muted-foreground leading-relaxed font-sans">
                  Once your physical export commodity specifications are validated below, trigger our automated Python matching sidecar. The engine evaluates catalog specifications against active purchasing inquiries (/demands) and generates instant bilateral handshakes.
                </p>
              </div>

              <Button
                size="lg"
                onClick={handleStepToStage2}
                disabled={generating}
                className="bg-amber-500 hover:bg-amber-400 text-black font-black text-sm sm:text-base px-8 py-6 rounded-2xl shadow-xl hover:scale-105 transition-all select-none flex items-center gap-2.5 flex-shrink-0 group self-end md:self-center"
              >
                <Sparkles className="h-5 w-5 fill-black animate-spin" style={{ animationDuration: "6s" }} />
                <span>{generating ? "Evaluating XGBoost Vectors..." : "🤝 Step to Stage 02 (Run Match Engine)"}</span>
                <ChevronRight className={isRtl ? "h-5 w-5 rotate-180 group-hover:-translate-x-1" : "h-5 w-5 group-hover:translate-x-1"} />
              </Button>
            </CardContent>
          </Card>

          {success && <p className="text-sm font-bold text-green-600 bg-green-50 p-3 rounded-lg border border-green-200">{success}</p>}
          {error && <p className="text-sm font-bold text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">{error}</p>}

          {/* New Product Manifest Form */}
          {showForm && (
            <Card className="border-2 border-primary/40 bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="text-base font-extrabold text-foreground">Inject Verifiable Export Commodity Spec</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
                  <div className="grid md:grid-cols-3 gap-4 font-mono">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="font-bold font-sans">Commodity Spec Title</Label>
                      <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g., Premium Iraqi Medjool Dates" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category" className="font-bold font-sans">Category Code</Label>
                      <Input id="category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g., dates or phosphate" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price" className="font-bold font-sans">FOB Unit Settlement Rate ($ / unit)</Label>
                      <Input id="price" type="number" step="0.05" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="e.g., 2.50" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="quantity" className="font-bold font-sans">Available Volume Tonnage</Label>
                      <Input id="quantity" type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} placeholder="e.g., 500" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="unit" className="font-bold font-sans">Standard Unit</Label>
                      <Input id="unit" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="e.g., ton" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="origin" className="font-bold font-sans">National Storage Operating Node</Label>
                      <Input id="origin" value={form.origin} onChange={(e) => setForm({ ...form, origin: e.target.value })} placeholder="e.g., Iraq" required />
                    </div>
                    <div className="space-y-2 md:col-span-3">
                      <Label htmlFor="location" className="font-bold font-sans">Exact Physical Terminal Port Storage Port</Label>
                      <Input id="location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g., Basra Port Bonded Terminal #4, Iraq" required />
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 mt-2 font-sans">
                    Authorize Bulk Spot Item Listing
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Catalogs Grid */}
          <div className="space-y-4">
            {loading ? (
              <p className="text-muted-foreground text-sm">Querying distributed commodity ledgers...</p>
            ) : products.length === 0 ? (
              <Card className="p-12 text-center bg-secondary/30">
                <Package className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-3 font-medium text-foreground">Zero Bulk Spot Catalogs</p>
                <Button className="mt-4 bg-primary hover:bg-primary/90 text-white font-bold" onClick={() => setShowForm(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  List Bulk Spot Product
                </Button>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((p) => (
                  <Card key={p.id} className="overflow-hidden border border-border bg-white shadow-sm hover:border-primary/50 transition-colors flex flex-col justify-between">
                    <CardHeader className="p-5 pb-3 bg-secondary/30 border-b border-border">
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="uppercase font-mono text-[10px]">{p.category}</Badge>
                        <span className="text-[10px] text-muted-foreground font-mono">Catalog #{p.id || 881}</span>
                      </div>
                      <h3 className="font-extrabold text-foreground text-base pt-2">{p.name}</h3>
                    </CardHeader>

                    <CardContent className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                      <div className="space-y-2 text-xs font-mono">
                        <div className="flex items-center justify-between p-2 rounded bg-secondary/40">
                          <span className="text-muted-foreground font-sans">Available Volume:</span>
                          <span className="font-black text-foreground">{p.quantity} {p.unit.toUpperCase()}</span>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded bg-primary/10 text-primary">
                          <span className="font-sans font-bold">FOB Settlement Face Value:</span>
                          <span className="font-black">${Number(p.price).toFixed(2)} / {p.unit}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-600 font-sans pt-1">
                          <MapPin className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                          <span className="truncate">{p.location}</span>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-border flex justify-between items-center text-[10px] text-emerald-600 font-bold font-sans">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" /> RLS Index Locked
                        </span>
                        <Button size="sm" className="bg-primary hover:bg-primary/90 text-white font-bold h-8 text-xs font-mono" onClick={() => navigate({ to: "/ml-analytics" })}>
                          AI AI Trajectory
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
