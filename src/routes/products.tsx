import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Product, createProduct, getProducts } from "@/lib/api";

export const Route = createFileRoute("/products")({
  component: ProductsPage,
});

function ProductsPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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
    } catch (err: any) {
      setError(err.message);
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
          <Button variant="outline" onClick={() => navigate({ to: "/pre-deals" })}>
            Pre-Deals
          </Button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold tracking-tight mb-6">Products</h2>
            {loading ? (
              <p>Loading...</p>
            ) : products.length === 0 ? (
              <p className="text-muted-foreground">No products available.</p>
            ) : (
              <div className="grid gap-4">
                {products.map((p) => (
                  <Card key={p.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{p.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {p.category} • {p.quantity} {p.unit} @ ${p.price} • {p.origin}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">{p.location}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">List Product</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Input id="category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required placeholder="e.g. dates" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="price">Price</Label>
                      <Input id="price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
                    </div>
                    <div>
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input id="quantity" type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} required />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="unit">Unit</Label>
                    <Input id="unit" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} required />
                  </div>
                  <div>
                    <Label htmlFor="origin">Origin</Label>
                    <Input id="origin" value={form.origin} onChange={(e) => setForm({ ...form, origin: e.target.value })} required />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required placeholder="e.g. Basra, Iraq" />
                  </div>
                  {error && <p className="text-sm text-red-500">{error}</p>}
                  <Button type="submit" className="w-full">Create Product</Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
