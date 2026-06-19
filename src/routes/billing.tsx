import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Subscription, getMySubscription, createCheckoutSession, cancelSubscription, getMe, User, AccountType } from "@/lib/api";
import { Globe, CheckCircle2, Shield, Sparkles, AlertCircle, RefreshCw, XCircle, Zap, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/billing")({
  component: MasterAccountBillingPage,
});

function MasterAccountBillingPage() {
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [upgradingTier, setUpgradingTier] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const [u, s] = await Promise.all([getMe(), getMySubscription()]);
      setUser(u);
      setSubscription(s);
    } catch (err: any) {
      setError(err.message || "Failed to retrieve billing ledger");
    } finally {
      setLoading(false);
    }
  }

  async function handleCheckout(targetTier: AccountType) {
    setUpgradingTier(targetTier);
    setError("");
    setSuccess("");
    try {
      const updatedSub = await createCheckoutSession(targetTier);
      setSubscription(updatedSub);
      setUser((prev) => (prev ? { ...prev, account_type: targetTier } : null));
      setSuccess(`Stripe checkout simulated successfully. Upgraded to ${targetTier.toUpperCase()} tier.`);
    } catch (err: any) {
      setError(err.message || "Stripe Checkout session creation failed");
    } finally {
      setUpgradingTier(null);
    }
  }

  async function handleCancel() {
    setError("");
    setSuccess("");
    try {
      await cancelSubscription();
      setSubscription((prev) => (prev ? { ...prev, status: "canceled" } : null));
      setUser((prev) => (prev ? { ...prev, account_type: "free" } : null));
      setSuccess("Subscription canceled. Account reverted to Free Tier.");
    } catch (err: any) {
      setError(err.message || "Cancellation operation failed");
    }
  }

  const tiers: Array<{
    id: AccountType;
    name: string;
    monthlyPrice: string;
    description: string;
    delay: string;
    commission: string;
    features: string[];
    popular?: boolean;
    vip?: boolean;
  }> = [
    {
      id: "free",
      name: "Free Node",
      monthlyPrice: "$0",
      description: "Baseline access for individual local trading exploration.",
      delay: "+120h Visibility Delay",
      commission: "1.0% Platform Commission",
      features: ["Standard Rule-Based Matching", "Max 3 Active Products/Demands", "Basic Institutional Escrow Custody"],
    },
    {
      id: "bronze",
      name: "Bronze Account",
      monthlyPrice: "$149",
      description: "Entry-level commercial tools for emerging regional suppliers.",
      delay: "+72h Visibility Delay",
      commission: "0.8% Platform Commission",
      features: ["Standard ML Feature Weights", "Max 10 Active Products", "Escrow & Documentary Collection (D/P)"],
    },
    {
      id: "silver",
      name: "Silver Master",
      monthlyPrice: "$399",
      description: "Enhanced priority routing for established cross-border operations.",
      delay: "+24h Visibility Delay",
      commission: "0.5% Platform Commission",
      features: ["Full AI/ML Matching Model Access", "Unlimited Active Products/Demands", "Dedicated L/C State Machine Routing"],
    },
    {
      id: "gold",
      name: "Gold Priority",
      monthlyPrice: "$899",
      description: "Top-tier priority pool matching recommended for major Turkish/EU buyers.",
      delay: "+6h Visibility Delay",
      commission: "0.3% Platform Commission",
      features: ["Advanced Commodity Price Prediction", "Regional Demand Imbalance Alerts", "Automated OFAC/EU/UN Sanctions Sweeps"],
      popular: true,
    },
    {
      id: "platinum",
      name: "Platinum Executive",
      monthlyPrice: "$1,999",
      description: "Institutional cross-border trade framework with VIP account management.",
      delay: "Instant Visibility (Zero Delay)",
      commission: "0.1% Platform Commission",
      features: ["Real-Time Container GPS Webhooks", "Zero-Trust mTLS Inter-Service Routing", "Dedicated Compliance Legal Counsel"],
      vip: true,
    },
    {
      id: "black",
      name: "Black Sovereign",
      monthlyPrice: "Custom Quote",
      description: "Absolute apex priority node for multi-national holding conglomerates.",
      delay: "Instant Apex Visibility",
      commission: "0.0% Platform Commission (Zero Fee)",
      features: ["Custom ML Model Fine-Tuning", "Private Sovereign Escrow Pools", "Automated Customs Clearance Webhooks"],
      vip: true,
    },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar activeRoute="billing" />

      <main className="flex-1 overflow-auto">
        <header className="flex h-16 items-center justify-between border-b border-border bg-white px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Globe className="h-5 w-5 text-primary flex-shrink-0" />
            <h1 className="text-lg font-semibold text-foreground">Master Account Tier Orchestration & Stripe Billing</h1>
          </div>
          <Badge variant="outline" className="border-primary text-primary bg-primary/5 capitalize">
            Current Node Role: {user?.account_type || "Free"}
          </Badge>
        </header>

        <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
          {/* Status Overview Card */}
          <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    Stripe Subscription Subsystem
                  </CardTitle>
                  <CardDescription>
                    Master Account privileges dictate matching latency, platform commission overhead, and automated compliance routing.
                  </CardDescription>
                </div>
                <Button size="sm" variant="outline" onClick={load} disabled={loading}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Poll Stripe Customer Status
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4 p-4 bg-white rounded-xl border border-border shadow-sm text-xs">
                <div>
                  <span className="font-bold text-foreground block mb-0.5">Stripe Customer Reference:</span>
                  <span className="font-mono text-muted-foreground">{subscription?.stripe_customer_id || "cus_unregistered_node"}</span>
                </div>
                <div>
                  <span className="font-bold text-foreground block mb-0.5">Stripe Subscription ID:</span>
                  <span className="font-mono text-muted-foreground">{subscription?.stripe_subscription_id || "sub_unregistered_node"}</span>
                </div>
                <div>
                  <span className="font-bold text-foreground block mb-0.5">Subscription Settlement State:</span>
                  <Badge variant={subscription?.status === "active" ? "outline" : "secondary"} className={subscription?.status === "active" ? "bg-green-50 text-green-700 border-green-300 capitalize" : "capitalize"}>
                    {subscription?.status || "inactive"}
                  </Badge>
                </div>
                <div>
                  <span className="font-bold text-foreground block mb-0.5">Current Billing Horizon:</span>
                  <span className="font-mono text-muted-foreground">
                    {subscription?.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString() : "Rolling Horizon"}
                  </span>
                </div>

                {subscription?.status === "active" && (
                  <div className="col-span-4 pt-3 mt-2 border-t border-border flex justify-end">
                    <Button size="sm" variant="outline" className="border-red-300 text-red-700 hover:bg-red-50" onClick={handleCancel}>
                      <XCircle className="mr-1.5 h-4 w-4" /> Cancel Rolling Subscription
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {error && <p className="text-sm font-medium text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">{error}</p>}
          {success && <p className="text-sm font-medium text-green-600 bg-green-50 p-3 rounded-lg border border-green-200">{success}</p>}

          {/* Master Account Pricing Grid */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">Select Master Account Priority Pool</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tiers.map((tier) => {
                const isCurrentTier = user?.account_type === tier.id;
                const isExecuting = upgradingTier === tier.id;

                return (
                  <Card
                    key={tier.id}
                    className={`flex flex-col justify-between transition-all relative overflow-hidden ${
                      isCurrentTier
                        ? "border-primary border-2 shadow-md bg-primary/5"
                        : tier.popular
                        ? "border-amber-400 border-2 shadow-sm bg-white"
                        : "border-border bg-white hover:border-primary/50"
                    }`}
                  >
                    {tier.popular && (
                      <div className="bg-amber-400 text-amber-950 text-[10px] font-extrabold uppercase px-3 py-1 absolute top-0 right-0 rounded-bl-lg tracking-wider">
                        Recommended Corridor Buyer Node
                      </div>
                    )}
                    {tier.vip && !tier.popular && (
                      <div className="bg-slate-900 text-slate-100 text-[10px] font-extrabold uppercase px-3 py-1 absolute top-0 right-0 rounded-bl-lg tracking-wider">
                        Sovereign Enterprise Pool
                      </div>
                    )}

                    <CardHeader className="space-y-2 pb-4">
                      <div>
                        <Badge variant="secondary" className="uppercase font-mono text-[10px] mb-1">{tier.id}</Badge>
                        <CardTitle className="text-lg font-extrabold text-foreground">{tier.name}</CardTitle>
                      </div>
                      <div className="flex items-baseline gap-1 pt-1">
                        <span className="text-3xl font-black text-foreground">{tier.monthlyPrice}</span>
                        {tier.monthlyPrice !== "Custom Quote" && <span className="text-xs text-muted-foreground font-medium">/ month</span>}
                      </div>
                      <p className="text-xs text-muted-foreground pt-1 leading-relaxed">{tier.description}</p>
                    </CardHeader>

                    <CardContent className="space-y-6 pt-0 flex-1 flex flex-col justify-between">
                      <div className="space-y-4">
                        {/* Critical SLA metadata */}
                        <div className="p-3 rounded-lg bg-secondary/50 space-y-1.5 text-xs font-mono">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Matching Latency:</span>
                            <span className="font-bold text-primary">{tier.delay}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Platform Overhead:</span>
                            <span className="font-bold text-foreground">{tier.commission}</span>
                          </div>
                        </div>

                        {/* Specific capabilities */}
                        <div className="space-y-2 pt-1">
                          <span className="text-[11px] font-bold text-foreground uppercase tracking-wider block">Feature Gates Included:</span>
                          {tier.features.map((f, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                              <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                              <span>{f}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-6 border-t border-border mt-auto">
                        <Button
                          className={`w-full font-bold ${
                            isCurrentTier
                              ? "bg-secondary text-foreground hover:bg-secondary cursor-default"
                              : tier.vip
                              ? "bg-slate-900 hover:bg-slate-800 text-white"
                              : "bg-primary hover:bg-primary/90 text-white"
                          }`}
                          disabled={isCurrentTier || isExecuting}
                          onClick={() => handleCheckout(tier.id)}
                        >
                          {isExecuting && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                          {!isExecuting && <ExternalLink className="mr-2 h-4 w-4" />}
                          {isCurrentTier
                            ? "Active Sovereign Role"
                            : tier.monthlyPrice === "Custom Quote"
                            ? "Simulate Black VIP Upgrading"
                            : `Simulate Stripe Checkout (${tier.id.toUpperCase()})`}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
