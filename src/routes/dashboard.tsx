import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardStats, PreDeal, User, getDashboard, getMe, getPreDeals, removeToken } from "@/lib/api";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [preDeals, setPreDeals] = useState<PreDeal[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [u, s, d] = await Promise.all([getMe(), getDashboard(), getPreDeals()]);
        setUser(u);
        setStats(s);
        setPreDeals(d);
      } catch (err: any) {
        setError(err.message || "Failed to load dashboard");
      }
    }
    load();
  }, []);

  function logout() {
    removeToken();
    navigate({ to: "/login" });
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="font-mono">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button onClick={() => navigate({ to: "/login" })}>Go to Login</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="border-b border-border px-6 py-4 flex items-center justify-between">
        <span className="font-mono font-bold tracking-tighter text-xl">TUREEP AI+</span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">{user?.name}</span>
          <span className="text-xs font-mono uppercase px-2 py-1 bg-primary/10 text-primary rounded">
            {user?.account_type}
          </span>
          <Button variant="outline" size="sm" onClick={logout}>
            Logout
          </Button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <MetricCard label="Products" value={stats?.total_products ?? 0} />
          <MetricCard label="Demands" value={stats?.total_demands ?? 0} />
          <MetricCard label="Active Pre-Deals" value={stats?.active_pre_deals ?? 0} />
          <MetricCard label="Accepted Deals" value={stats?.accepted_deals ?? 0} />
        </div>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold tracking-tight">Pre-Deals</h2>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate({ to: "/products" })}>
              Products
            </Button>
            <Button variant="outline" onClick={() => navigate({ to: "/pre-deals" })}>
              View All
            </Button>
          </div>
        </div>

        {preDeals.length === 0 ? (
          <p className="text-muted-foreground">No active pre-deals found.</p>
        ) : (
          <div className="grid gap-4">
            {preDeals.slice(0, 5).map((deal) => (
              <Card key={deal.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-semibold">{deal.product?.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {deal.quantity} {deal.product?.unit} @ ${deal.suggested_price}/{deal.product?.unit} —{" "}
                        {deal.payment_terms}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Buyer: {deal.buyer?.name} ({deal.buyer?.country}) • Match Score: {deal.match_score}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono uppercase px-2 py-1 bg-primary/10 text-primary rounded">
                        {deal.status}
                      </span>
                    </div>
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

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs font-mono uppercase text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
      </CardContent>
    </Card>
  );
}
