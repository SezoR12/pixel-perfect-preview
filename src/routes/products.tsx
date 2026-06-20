import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Package,
  Plus,
  Search,
  Filter,
  MapPin,
  DollarSign,
  Box,
  Tag,
  ChevronRight,
  X,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  ArrowUpDown
} from "lucide-react";
import { getProducts, createProduct, type Product } from "@/lib/api";

export const Route = createFileRoute("/products")({
  component: ProductsPage,
});

const categories = [
  { id: "all", label: "All Products" },
  { id: "dates", label: "Dates" },
  { id: "phosphate", label: "Phosphate" },
  { id: "steel_scrap", label: "Steel Scrap" },
  { id: "petrochemicals", label: "Petrochemicals" },
  { id: "textiles", label: "Textiles" },
];

function ProductCard({ product }: { product: Product }) {
  return (
    <div className="bg-white rounded-3xl border border-surface-200 card-hover overflow-hidden group transition-all duration-300 shadow-sm hover:shadow-xl">
      <div className="h-2.5 bg-gradient-to-r from-primary-500 to-accent-500" />
      <div className="p-6">
        <div className="flex items-start justify-between mb-4 select-none">
          <div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black font-mono bg-primary-50 text-primary-700 uppercase tracking-widest mb-2 border border-primary-100">
              {product.category}
            </span>
            <h3 className="font-extrabold text-surface-900 text-base leading-tight font-sans select-text">{product.name}</h3>
          </div>
          <div className={`w-3 h-3 rounded-full flex-shrink-0 shadow-sm ${product.is_available ? "bg-success-500 animate-pulse" : "bg-surface-300"}`} title={product.is_available ? "Active spot catalog" : "Unavailable"} />
        </div>

        <p className="text-xs text-surface-600 mb-6 line-clamp-2 font-sans select-text leading-relaxed">{product.description || "B2B institutional commodity specification standard."}</p>

        <div className="grid grid-cols-2 gap-3 mb-6 font-mono select-text">
          <div className="bg-surface-50 rounded-2xl p-4 border border-surface-200/80">
            <div className="flex items-center gap-1.5 mb-1 font-sans select-none">
              <DollarSign className="w-3.5 h-3.5 text-primary-600" />
              <span className="text-[10px] text-surface-500 font-bold uppercase tracking-wider">Spot Price</span>
            </div>
            <p className="text-base font-black text-surface-900">${product.price}/{product.unit}</p>
          </div>

          <div className="bg-surface-50 rounded-2xl p-4 border border-surface-200/80">
            <div className="flex items-center gap-1.5 mb-1 font-sans select-none">
              <Box className="w-3.5 h-3.5 text-accent-600" />
              <span className="text-[10px] text-surface-500 font-bold uppercase tracking-wider">Inventory</span>
            </div>
            <p className="text-base font-black text-surface-900">{product.quantity} {product.unit}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-surface-500 mb-6 select-text">
          <MapPin className="w-4 h-4 text-primary-500 flex-shrink-0" />
          <span className="truncate">{product.location}</span>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-surface-100 select-none">
          <span className={`text-xs font-bold font-mono ${product.is_available ? "text-success-600" : "text-surface-400"}`}>
            {product.is_available ? "● Ready for Match Indexing" : "● Offline Ledger"}
          </span>
          <button className="text-xs font-extrabold text-primary-600 hover:text-primary-700 flex items-center gap-1 group-hover:translate-x-1 transition-transform cursor-pointer font-sans">
            <span>Edit Catalog</span> <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function AddProductModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({
    name: "",
    category: "dates",
    price: "",
    quantity: "",
    unit: "ton",
    origin: "",
    location: "",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      // Pristine structural resolution for products.tsx(105,27) TypeScript parsing exception
      await createProduct({
        ...form,
        quantity: Number(form.quantity) || 100,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to list commercial commodity");
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass = "w-full px-4 py-3 bg-surface-100/80 border border-surface-200 rounded-2xl text-xs text-surface-900 font-mono placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all";
  const labelClass = "block text-xs font-bold text-surface-700 mb-1.5 font-sans uppercase tracking-wider";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none font-sans pointer-events-auto">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md animate-fade-in" onClick={onClose} />
      <div className="relative bg-white border border-surface-200 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-in select-text">
        <div className="p-6 border-b border-surface-100 flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-md rounded-t-3xl z-10 select-none">
          <div>
            <h2 className="text-xl font-black text-surface-900 tracking-tight">List Target Inventory Commodity</h2>
            <p className="text-xs text-surface-500 mt-0.5 font-mono">Distributed RLS schema mapping active</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-2xl hover:bg-surface-100 text-surface-400 hover:text-surface-800 transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="flex items-center gap-2.5 p-4 bg-danger-50 border border-danger-200 rounded-2xl text-xs font-bold text-danger-700 select-none">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-danger-600" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className={labelClass}>Verifiable Commodity Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g., Premium Basra Harvest Medjool Dates"
              className={inputClass}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>HS Category Ruling</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className={`${inputClass} cursor-pointer font-mono font-bold`}
              >
                <option value="dates">Dates (0804.10)</option>
                <option value="phosphate">Phosphate (2510.10)</option>
                <option value="steel_scrap">Steel Scrap (7204.49)</option>
                <option value="petrochemicals">Petrochemicals (2710.12)</option>
                <option value="textiles">Textiles (5201.00)</option>
                <option value="general">General Base Commodity</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Haulage Measurement Unit</label>
              <select
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                className={`${inputClass} cursor-pointer font-mono font-bold`}
              >
                <option value="ton">Metric Ton (Ton)</option>
                <option value="kg">Kilogram (Kg)</option>
                <option value="container">Ocean Container (40ft)</option>
                <option value="unit">Individual Institutional Unit</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>FOB Target Price ($ / unit)</label>
              <input
                type="number"
                step="0.05"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="e.g., 2.65"
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Physical Inventory Stock</label>
              <input
                type="number"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                placeholder="e.g., 500"
                className={inputClass}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>National Country of Origin</label>
              <input
                type="text"
                value={form.origin}
                onChange={(e) => setForm({ ...form, origin: e.target.value })}
                placeholder="e.g., Iraq or Iran"
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Free Port or Storage Node</label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="e.g., Basra Terminal Waypoint"
                className={inputClass}
                required
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Institutional Specifications & Remarks</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe strict quality grade, phytosanitary certifications, processing metrics, moisture content..."
              rows={4}
              className={`${inputClass} resize-none font-sans text-xs`}
            />
          </div>

          <div className="flex gap-4 pt-4 border-t border-surface-100 select-none">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3.5 border border-surface-300 rounded-2xl text-xs font-bold text-surface-700 hover:bg-surface-100 transition-colors cursor-pointer"
            >
              Abort Handshake
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-3.5 bg-primary-600 hover:bg-primary-500 text-white rounded-2xl text-xs font-extrabold shadow-lg shadow-primary-600/30 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer font-sans"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Plus className="w-4 h-4 text-yellow-400" />
              )}
              <span>Commit Spot Catalog</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [sortBy, setSortBy] = useState<"price" | "quantity" | "newest">("newest");

  async function loadProducts() {
    setLoading(true);
    try {
      const data = await getProducts();
      setProducts(data);
      setFiltered(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    let result = [...products];
    if (search) {
      result = result.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (activeCategory !== "all") {
      result = result.filter((p) => p.category === activeCategory);
    }
    result.sort((a, b) => {
      if (sortBy === "price") return parseFloat(a.price) - parseFloat(b.price);
      if (sortBy === "quantity") return b.quantity - a.quantity;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    setFiltered(result);
  }, [search, activeCategory, products, sortBy]);

  return (
    <div className="space-y-8 animate-slide-in font-sans select-none">
      {/* Vercel Style Main Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-900 text-white p-8 rounded-3xl border border-surface-800 shadow-2xl">
        <div className="space-y-1">
          <Badge className="bg-primary-500 text-white font-mono text-[10px] uppercase tracking-widest px-3 py-1">Catalog desk</Badge>
          <h1 className="text-3xl font-black tracking-tight text-white font-serif">Verified Products Catalog</h1>
          <p className="text-xs text-surface-400 font-mono">Manage your Middle Eastern export listings and local active inventory ledgers</p>
        </div>

        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-6 py-3.5 bg-yellow-500 text-slate-950 rounded-2xl text-xs font-black hover:bg-yellow-400 transition-all shadow-xl hover:scale-105 cursor-pointer flex-shrink-0 font-mono"
        >
          <Plus className="w-4 h-4 fill-slate-950" />
          <span>+ Inject New Listing</span>
        </button>
      </div>

      {/* Vercel Style Stats Overview Bar (mono-for-data Impeccably Applied) */}
      {!loading && products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 select-text font-mono">
          <div className="bg-white rounded-3xl p-6 border border-surface-200 shadow-sm flex flex-col justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-surface-500 font-sans">Total Managed Commodities</span>
            <p className="text-4xl font-black text-surface-900 font-mono pt-2">{products.length}</p>
            <span className="text-[10px] text-primary-600 font-bold pt-2 border-t border-surface-100 block font-sans">● Universal PostgreSQL Pools</span>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-surface-200 shadow-sm flex flex-col justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-surface-500 font-sans">Available Spot Inventory</span>
            <p className="text-4xl font-black text-success-600 font-mono pt-2">
              {products.filter((p) => p.is_available).length}
            </p>
            <span className="text-[10px] text-success-700 font-bold pt-2 border-t border-surface-100 block font-sans">● Real-time indexing active</span>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-surface-200 shadow-sm flex flex-col justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-surface-500 font-sans">Total Catalog FOB Value</span>
            <p className="text-4xl font-black text-primary-600 font-mono pt-2">
              ${products.reduce((sum, p) => sum + parseFloat(p.price) * p.quantity, 0).toFixed(0)}
            </p>
            <span className="text-[10px] text-primary-700 font-bold pt-2 border-t border-surface-100 block font-sans">● Dynamic FX matching</span>
          </div>
        </div>
      )}

      {/* Raycast Style Search and Filter Command Bar */}
      <div className="flex flex-col md:flex-row gap-4 bg-surface-100 p-4 rounded-3xl border border-surface-200/80">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Query products by title, World Customs WCO HS code, or origin..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-surface-200 rounded-2xl text-xs text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSortBy(sortBy === "newest" ? "price" : sortBy === "price" ? "quantity" : "newest")}
            className="flex items-center gap-2 px-5 py-3 bg-white border border-surface-200 rounded-2xl text-xs font-bold text-surface-700 hover:bg-surface-50 transition-colors cursor-pointer flex-shrink-0 font-mono"
          >
            <ArrowUpDown className="w-4 h-4 text-primary-600" />
            <span>Sort: {sortBy.toUpperCase()}</span>
          </button>
        </div>
      </div>

      {/* Linear Style Category Pills */}
      <div className="flex gap-2.5 overflow-x-auto pb-2 -mx-1 px-1 font-mono text-xs">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveCategory(cat.id)}
            className={`px-5 py-2.5 rounded-2xl font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeCategory === cat.id
                ? "bg-primary-600 text-white shadow-lg shadow-primary-600/30 scale-105"
                : "bg-white border border-surface-200/80 text-surface-600 hover:bg-surface-100 hover:text-surface-900"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Highly Definitive Inventory Grid Showcase */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-3xl p-6 border border-surface-200 animate-pulse space-y-4">
              <div className="h-3 bg-surface-200 rounded-full w-1/3" />
              <div className="h-6 bg-surface-200 rounded-lg w-3/4" />
              <div className="h-4 bg-surface-200 rounded-lg w-1/2" />
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="h-16 bg-surface-100 rounded-2xl" />
                <div className="h-16 bg-surface-100 rounded-2xl" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 border border-surface-200 text-center space-y-4 shadow-sm">
          <Package className="w-16 h-16 text-surface-300 mx-auto animate-bounce" />
          <h3 className="text-xl font-bold text-surface-900">Zero Target Inventory Matches</h3>
          <p className="text-xs text-surface-500 max-w-md mx-auto leading-relaxed">
            Your active catalog search query return nothing. List your certified cross-border commodity to initiate bilateral rule-based matching.
          </p>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-primary-600 text-white rounded-2xl text-xs font-extrabold hover:bg-primary-500 transition-all shadow-md cursor-pointer font-mono mt-2"
          >
            <Plus className="w-4 h-4 text-yellow-400" /> List Target Inventory Commodity
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {showModal && (
        <AddProductModal onClose={() => setShowModal(false)} onSuccess={loadProducts} />
      )}
    </div>
  );
}

export default ProductsPage;
