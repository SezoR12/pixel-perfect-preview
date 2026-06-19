import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AppSidebar } from "@/components/AppSidebar";
import {
  DashboardStats,
  PreDeal,
  User,
  getDashboard,
  getMe,
  getPreDeals,
} from "@/lib/api";
import {
  Package,
  ClipboardList,
  Handshake,
  ArrowRight,
  TrendingUp,
  ShoppingCart,
  Shield,
  FileCheck,
} from "lucide-react";

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
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
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
    <div className="min-h-screen bg-background">
      {/* Sidebar + header layout */}
      <div className="flex min-h-screen">
        <AppSidebar activeRoute="dashboard" />

        <main className="flex-1">
          {/* Header */}
          <header className="flex h-16 items-center justify-between border-b border-border bg-white px-6 lg:px-8">
            <h1 className="text-lg font-semibold text-foreground">Dashboard</h1>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.account_type}</p>
              </div>
              <Badge variant="secondary" className="capitalize">
                {user?.account_type}
              </Badge>
            </div>
          </header>

          <div className="p-6 lg:p-8">
            {/* Metrics */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <MetricCard
                icon={Package}
                label="Products"
                value={stats?.total_products ?? 0}
              />
              <MetricCard
                icon={ClipboardList}
                label="Demands"
                value={stats?.total_demands ?? 0}
              />
              <MetricCard
                icon={Handshake}
                label="Active Pre-Deals"
                value={stats?.active_pre_deals ?? 0}
              />
              <MetricCard
                icon={TrendingUp}
                label="Accepted Deals"
                value={stats?.accepted_deals ?? 0}
              />
              <MetricCard
                icon={ShoppingCart}
                label="Active Orders"
                value={stats?.active_orders ?? 0}
              />
            </div>

            {/* Compliance quick actions */}
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <FileCheck className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">KYC Verification</p>
                    <p className="text-sm text-muted-foreground">Status: {user?.kyc_status || "pending"}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => navigate({ to: "/kyc" })}>
                    Verify
                  </Button>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Sanctions Screening</p>
                    <p className="text-sm text-muted-foreground">
                      {user?.sanctions_screened ? "Cleared" : "Not screened"}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => navigate({ to: "/sanctions" })}>
                    Screen
                  </Button>
                </div>
              </Card>
            </div>

            {/* Pre-deals */}
            <div className="mt-8">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Active Pre-Deals</h2>
                <Button variant="outline" onClick={() => navigate({ to: "/pre-deals" })}>
                  View all
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>

              {preDeals.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">No active pre-deals found.</p>
                  <Button
                    className="mt-4"
                    variant="outline"
                    onClick={() => navigate({ to: "/products" })}
                  >
                    Add products
                  </Button>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {preDeals.slice(0, 5).map((deal) => (
                    <Card key={deal.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-foreground">
                                {deal.product?.name}
                              </h3>
                              <Badge variant={deal.is_exclusive ? "default" : "secondary"}>
                                {deal.status}
                              </Badge>
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {deal.quantity} {deal.product?.unit} @ ${deal.suggested_price} —{" "}
                              {deal.payment_terms}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              Buyer: {deal.buyer?.name} ({deal.buyer?.country}) • Match{" "}
                              {deal.match_score}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => navigate({ to: "/pre-deals" })}
                          >
                            Review
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
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
