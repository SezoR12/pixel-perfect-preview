import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AppSidebar } from "@/components/AppSidebar";
import { Product, createProduct, getProducts } from "@/lib/api";
import { Package, ArrowLeft, Plus } from "lucide-react";

export const Route = createFileRoute("/products")({
  component: ProductsPage,
});

function ProductsPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const product = await createProduct({
        name: form.name,
        category: form.category,
        price: form.price,
        quantity: Number(form.quantity),
        unit: form.unit,
        origin: form.origin,
        location: form.location,
        description: form.description,
      });
      setProducts([product, ...products]);
      setForm({ name: "", category: "", price: "", quantity: "", unit: "ton", origin: "", location: "", description: "" });
      setShowForm(false);
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen">
        <AppSidebar activeRoute="products" />

        <main className="flex-1">
          <header className="flex h-16 items-center justify-between border-b border-border bg-white px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate({ to: "/dashboard" })} className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-lg font-semibold text-foreground">Products</h1>
            </div>
            <Button onClick={() => setShowForm(!showForm)}>
              <Plus className="mr-2 h-4 w-4" />
              {showForm ? "Cancel" : "List product"}
            </Button>
          </header>

          <div className="p-6 lg:p-8">
            {showForm && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="text-lg">List a new product</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="name">Product name</Label>
                      <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Input id="category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required placeholder="e.g. dates" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price">Price per unit</Label>
                      <Input id="price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input id="quantity" type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="unit">Unit</Label>
                      <Input id="unit" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="origin">Origin country</Label>
                      <Input id="origin" value={form.origin} onChange={(e) => setForm({ ...form, origin: e.target.value })} required />
                    </div>
                    <div className="space-y-2 sm:col-span-2 lg:col-span-3">
                      <Label htmlFor="location">Location</Label>
                      <Input id="location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required placeholder="e.g. Basra, Iraq" />
                    </div>
                    <div className="sm:col-span-2 lg:col-span-3">
                      <Button type="submit">Create product</Button>
                    </div>
                    {error && <p className="col-span-full text-sm font-medium text-red-600">{error}</p>}
                  </form>
                </CardContent>
              </Card>
            )}

            {loading ? (
              <p className="text-muted-foreground">Loading products...</p>
            ) : products.length === 0 ? (
              <Card className="p-12 text-center">
                <Package className="mx-auto h-10 w-10 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">No products listed yet.</p>
                <Button className="mt-4" onClick={() => setShowForm(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  List product
                </Button>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((p) => (
                  <Card key={p.id} className="overflow-hidden">
                    <CardContent className="p-5">
                      <p className="text-xs font-semibold uppercase tracking-wide text-primary">{p.category}</p>
                      <h3 className="mt-2 text-lg font-semibold text-foreground">{p.name}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{p.origin} • {p.location}</p>
                      <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                        <p className="text-sm font-medium text-foreground">
                          {p.quantity} {p.unit}
                        </p>
                        <p className="text-sm font-semibold text-foreground">${p.price}</p>
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
