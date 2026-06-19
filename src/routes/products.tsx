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
    <div className="bg-white rounded-2xl border border-surface-200 card-hover overflow-hidden group">
      <div className="h-2 bg-gradient-to-r from-primary-400 to-primary-600" />
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-primary-50 text-primary-700 uppercase tracking-wider mb-2">
              {product.category}
            </span>
            <h3 className="font-semibold text-surface-800 text-sm leading-tight">{product.name}</h3>
          </div>
          <div className={`w-2.5 h-2.5 rounded-full ${product.is_available ? "bg-success-500" : "bg-surface-300"}`} />
        </div>

        <p className="text-xs text-surface-500 mb-4 line-clamp-2">{product.description || "No description provided"}</p>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-surface-50 rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <DollarSign className="w-3 h-3 text-surface-400" />
              <span className="text-[10px] text-surface-400 uppercase tracking-wider">Price</span>
            </div>
            <p className="text-sm font-bold text-surface-800">${product.price}/{product.unit}</p>
          </div>
          <div className="bg-surface-50 rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Box className="w-3 h-3 text-surface-400" />
              <span className="text-[10px] text-surface-400 uppercase tracking-wider">Stock</span>
            </div>
            <p className="text-sm font-bold text-surface-800">{product.quantity} {product.unit}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-surface-500 mb-4">
          <MapPin className="w-3.5 h-3.5 text-surface-400" />
          {product.location}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-surface-100">
          <span className={`text-xs font-medium ${product.is_available ? "text-success-600" : "text-surface-400"}`}>
            {product.is_available ? "Available for Trade" : "Unavailable"}
          </span>
          <button className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            Edit <ChevronRight className="w-3.5 h-3.5" />
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
      await createProduct(form);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to create product");
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass = "w-full px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm text-surface-800 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all";
  const labelClass = "block text-xs font-semibold text-surface-600 mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-in">
        <div className="p-6 border-b border-surface-100 flex items-center justify-between sticky top-0 bg-white rounded-t-3xl z-10">
          <div>
            <h2 className="text-xl font-bold text-surface-800">List New Product</h2>
            <p className="text-sm text-surface-500 mt-0.5">Add your commodity to the marketplace</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-surface-100 transition-colors">
            <X className="w-5 h-5 text-surface-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-danger-50 border border-danger-200 rounded-xl text-sm text-danger-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div>
            <label className={labelClass}>Product Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g., Premium Iraqi Medjool Dates"
              className={inputClass}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className={inputClass}
              >
                <option value="dates">Dates</option>
                <option value="phosphate">Phosphate</option>
                <option value="steel_scrap">Steel Scrap</option>
                <option value="petrochemicals">Petrochemicals</option>
                <option value="textiles">Textiles</option>
                <option value="general">General</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Unit</label>
              <select
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                className={inputClass}
              >
                <option value="ton">Ton</option>
                <option value="kg">Kilogram</option>
                <option value="unit">Unit</option>
                <option value="container">Container</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Price per Unit ($)</label>
              <input
                type="number"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="2.50"
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Available Quantity</label>
              <input
                type="number"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                placeholder="500"
                className={inputClass}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Origin Country</label>
              <input
                type="text"
                value={form.origin}
                onChange={(e) => setForm({ ...form, origin: e.target.value })}
                placeholder="Iraq"
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Storage Location</label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Basra Port Terminal"
                className={inputClass}
                required
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe your product specifications, quality grade, packaging details..."
              rows={3}
              className={`${inputClass} resize-none`}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-surface-200 rounded-xl text-sm font-semibold text-surface-600 hover:bg-surface-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              List Product
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
    <div className="space-y-6 animate-slide-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-800">My Products</h1>
          <p className="text-sm text-surface-500 mt-0.5">Manage your commodity listings and inventory</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> List New Product
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-surface-200 rounded-xl text-sm text-surface-800 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSortBy(sortBy === "newest" ? "price" : sortBy === "price" ? "quantity" : "newest")}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-surface-200 rounded-xl text-sm font-medium text-surface-600 hover:bg-surface-50 transition-colors"
          >
            <ArrowUpDown className="w-4 h-4" />
            {sortBy === "newest" ? "Newest" : sortBy === "price" ? "Price" : "Quantity"}
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              activeCategory === cat.id
                ? "bg-primary-600 text-white shadow-sm"
                : "bg-white border border-surface-200 text-surface-600 hover:bg-surface-50"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-surface-200 animate-pulse">
              <div className="h-2 bg-surface-200 rounded mb-4" />
              <div className="h-4 bg-surface-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-surface-200 rounded w-1/2 mb-4" />
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="h-12 bg-surface-200 rounded-xl" />
                <div className="h-12 bg-surface-200 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-surface-200 text-center">
          <Package className="w-12 h-12 text-surface-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-surface-700 mb-1">No products found</h3>
          <p className="text-sm text-surface-500 mb-6">Start by listing your first commodity</p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-4 h-4" /> List Product
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Stats Summary */}
      {!loading && products.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-surface-200 text-center">
            <p className="text-2xl font-bold text-surface-800">{products.length}</p>
            <p className="text-xs text-surface-500 mt-1">Total Products</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-surface-200 text-center">
            <p className="text-2xl font-bold text-success-600">
              {products.filter((p) => p.is_available).length}
            </p>
            <p className="text-xs text-surface-500 mt-1">Available</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-surface-200 text-center">
            <p className="text-2xl font-bold text-primary-600">
              ${products.reduce((sum, p) => sum + parseFloat(p.price) * p.quantity, 0).toFixed(0)}
            </p>
            <p className="text-xs text-surface-500 mt-1">Total Value</p>
          </div>
        </div>
      )}

      {showModal && (
        <AddProductModal onClose={() => setShowModal(false)} onSuccess={loadProducts} />
      )}
    </div>
  );
}
