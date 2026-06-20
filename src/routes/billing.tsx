import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Subscription, getMySubscription, createCheckoutSession, cancelSubscription, getMe, type User, type AccountType } from "@/lib/api";
import { Globe, CheckCircle2, Shield, Sparkles, AlertCircle, RefreshCw, XCircle, Zap, ExternalLink, Crown, Star, Gem, Diamond } from "lucide-react";

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
      setError(err.message || "Failed to consolidate billing ledger");
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
      setSuccess(`Stripe Checkout simulated successfully. Upgraded to ${targetTier.toUpperCase()} institutional node.`);
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
      setSuccess("Subscription canceled. Operating role reverted to Free Tier.");
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
      commission: "1.0% Platform Overhead",
      features: ["Standard Rule-Based Spot Matching", "Max 3 Active Products/Demands", "Basic Institutional Escrow Custody"],
    },
    {
      id: "bronze",
      name: "Bronze Account",
      monthlyPrice: "$149",
      description: "Entry-level commercial tools for emerging regional suppliers.",
      delay: "+72h Visibility Delay",
      commission: "0.8% Platform Overhead",
      features: ["Standard Heuristic Feature Criteria", "Max 10 Active Products", "Escrow & Documentary Collection (D/P)"],
    },
    {
      id: "silver",
      name: "Silver Master",
      monthlyPrice: "$399",
      description: "Enhanced priority routing for established cross-border operations.",
      delay: "+24h Visibility Delay",
      commission: "0.5% Platform Overhead",
      features: ["Full Rule-Based Matching Access", "Unlimited Active Products/Demands", "Dedicated SWIFT L/C Routing"],
    },
    {
      id: "gold",
      name: "Gold Priority",
      monthlyPrice: "$899",
      description: "Top-tier priority pool matching recommended for major Turkish/EU buyers.",
      delay: "+6h Visibility Delay",
      commission: "0.3% Platform Overhead",
      features: ["Advanced Commodity Price Forecasts", "Regional Demand Imbalance Alerts", "Automated OFAC/EU/UN Sanctions Sweeps"],
      popular: true,
    },
    {
      id: "platinum",
      name: "Platinum Sovereign",
      monthlyPrice: "$1,999",
      description: "Institutional cross-border trade framework with VIP account management.",
      delay: "Instant Visibility (Zero Delay)",
      commission: "0.1% Platform Overhead",
      features: ["Real-Time Container EDI Webhooks", "Zero-Trust mTLS Inter-Service Routing", "Dedicated Compliance Legal Counsel"],
      vip: true,
    },
    {
      id: "black",
      name: "Black Sovereign Admin",
      monthlyPrice: "Custom Quote",
      description: "Absolute apex priority node for multi-national holding conglomerates.",
      delay: "Instant Apex Visibility",
      commission: "0.0% Platform Overhead (Zero Fee)",
      features: ["Custom Criteria Heuristic Tuning", "Private Sovereign Escrow Pools", "Automated Customs Clearance Webhooks"],
      vip: true,
    },
  ];

  return (
    <div className="space-y-8 animate-slide-in font-sans select-none">
      
      {/* Vercel Style Main Overview Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-br from-surface-900 via-surface-800 to-slate-950 text-white p-8 rounded-3xl border border-surface-700 shadow-2xl">
        <div className="space-y-1.5">
          <Badge className="bg-amber-400 text-black font-black font-mono text-[10px] uppercase tracking-widest px-3 py-1">Stripe billing</Badge>
          <h1 className="text-3xl font-black tracking-tight text-white font-serif">Master Account Tier Orchestration</h1>
          <p className="text-xs text-surface-400 font-mono">Governs matching latency, platform commission overhead, and automated compliance routing</p>
        </div>

        <Badge variant="outline" className="border-primary text-primary bg-primary/10 font-mono font-extrabold text-xs px-4 py-2 self-start sm:self-auto uppercase tracking-wider">
          Current Operating Role: {user?.account_type || "Free"}
        </Badge>
      </div>

      {/* Stripe Reference Storage Card (mono-for-data Executed Impeccably) */}
      <Card className="bg-white border border-surface-200 rounded-3xl shadow-sm">
        <CardHeader className="bg-surface-50 border-b border-surface-100 rounded-t-3xl p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base font-extrabold text-surface-900 font-sans flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary-600 fill-primary-600/20" />
                <span>Stripe Connect Customer Subsytem Manifest</span>
              </CardTitle>
              <CardDescription className="text-xs font-mono">
                Real-world subaccount ID matching and automated separate Separate Charges clearing transfers
              </CardDescription>
            </div>
            <Button size="sm" variant="outline" onClick={load} disabled={loading} className="font-mono text-xs cursor-pointer rounded-xl">
              <RefreshCw className={`mr-2 h-3.5 w-3.5 ${loading ? "animate-spin animate-pulse" : ""}`} />
              Poll Stripe Ledger Status
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 select-text font-mono text-xs">
            <div className="p-4 rounded-2xl bg-surface-50 border border-surface-200/80 space-y-1">
              <span className="font-extrabold text-surface-500 block uppercase tracking-wider font-sans text-[10px]">Stripe Customer Reference</span>
              <span className="font-extrabold text-surface-900 block truncate">{subscription?.stripe_customer_id || "cus_unregistered_node"}</span>
            </div>

            <div className="p-4 rounded-2xl bg-surface-50 border border-surface-200/80 space-y-1">
              <span className="font-extrabold text-surface-500 block uppercase tracking-wider font-sans text-[10px]">Stripe Subscription ID</span>
              <span className="font-extrabold text-primary-600 block truncate select-all">{subscription?.stripe_subscription_id || "sub_unregistered_node"}</span>
            </div>

            <div className="p-4 rounded-2xl bg-surface-50 border border-surface-200/80 space-y-1">
              <span className="font-extrabold text-surface-500 block uppercase tracking-wider font-sans text-[10px]">Subscription Settlement State</span>
              <div className="pt-1">
                <Badge variant={subscription?.status === "active" ? "outline" : "secondary"} className={subscription?.status === "active" ? "bg-success-50 text-success-700 border-success-300 font-bold uppercase tracking-wider text-[10px]" : "font-bold uppercase tracking-wider text-[10px]"}>
                  ● {subscription?.status || "inactive"}
                </Badge>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-surface-50 border border-surface-200/80 space-y-1">
              <span className="font-extrabold text-surface-500 block uppercase tracking-wider font-sans text-[10px]">Current Billing Horizon</span>
              <span className="font-extrabold text-surface-900 block">
                {subscription?.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString() : "Rolling Horizon"}
              </span>
            </div>

            {subscription?.status === "active" && (
              <div className="col-span-1 sm:col-span-2 lg:col-span-4 pt-4 mt-2 border-t border-surface-100 flex justify-end select-none">
                <Button size="sm" variant="outline" className="border-danger-300 text-danger-700 hover:bg-danger-50 font-mono text-xs rounded-xl cursor-pointer" onClick={handleCancel}>
                  <XCircle className="mr-1.5 h-4 w-4" /> Cancel Active Subscription Handshake
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {error && <p className="text-xs font-bold text-danger-700 bg-danger-50 p-4 rounded-2xl border border-danger-200 select-text font-mono">{error}</p>}
      {success && <p className="text-xs font-bold text-success-700 bg-success-50 p-4 rounded-2xl border border-success-200 select-text font-mono">{success}</p>}

      {/* Executive Tier Pricing Grid */}
      <div className="space-y-6">
        <h2 className="text-xl font-black text-surface-900 tracking-tight font-sans">Select Middle Eastern Master Priority Pool</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
          {tiers.map((tier) => {
            const isCurrentTier = user?.account_type === tier.id;
            const isExecuting = upgradingTier === tier.id;

            return (
              <Card
                key={tier.id}
                className={`flex flex-col justify-between transition-all duration-300 relative overflow-hidden rounded-3xl ${
                  isCurrentTier
                    ? "border-primary-500 border-2 shadow-xl bg-primary-50/30 scale-[1.02]"
                    : tier.popular
                    ? "border-amber-400 border-2 shadow-lg bg-white scale-[1.01]"
                    : "border-surface-200 bg-white hover:border-primary-500/50 hover:shadow-xl card-hover"
                }`}
              >
                {tier.popular && (
                  <div className="bg-amber-400 text-neutral-950 text-[10px] font-black font-mono uppercase px-4 py-1.5 absolute top-0 right-0 rounded-bl-2xl tracking-widest shadow-sm select-none">
                    Recommended Exporter Hub
                  </div>
                )}
                {tier.vip && !tier.popular && (
                  <div className="bg-surface-900 text-white text-[10px] font-black font-mono uppercase px-4 py-1.5 absolute top-0 right-0 rounded-bl-2xl tracking-widest shadow-sm select-none">
                    Sovereign Enterprise Pool
                  </div>
                )}

                <CardHeader className="space-y-3 p-8 pb-6 select-text">
                  <div>
                    <Badge variant="secondary" className="uppercase font-mono font-black text-[10px] tracking-widest mb-2 border border-surface-200">{tier.id}</Badge>
                    <CardTitle className="text-2xl font-black text-surface-900 font-sans tracking-tight">{tier.name}</CardTitle>
                  </div>

                  <div className="flex items-baseline gap-1.5 pt-2 font-mono">
                    <span className="text-4xl font-black text-surface-900 font-mono tracking-tight">{tier.monthlyPrice}</span>
                    {tier.monthlyPrice !== "Custom Quote" && <span className="text-xs font-bold text-surface-500 font-sans">/ month</span>}
                  </div>

                  <p className="text-xs text-surface-600 font-sans leading-relaxed pt-2">{tier.description}</p>
                </CardHeader>

                <CardContent className="space-y-6 p-8 pt-0 flex-1 flex flex-col justify-between select-none">
                  <div className="space-y-6">
                    
                    {/* Impeccable SLA mono-for-data metrics */}
                    <div className="p-4 rounded-2xl bg-surface-100/80 border border-surface-200 space-y-2 font-mono text-xs select-text">
                      <div className="flex items-center justify-between">
                        <span className="text-surface-600 font-sans">Matching Latency:</span>
                        <span className="font-extrabold text-primary-600 font-mono">{tier.delay}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-surface-600 font-sans">Platform Overhead:</span>
                        <span className="font-extrabold text-surface-900 font-mono">{tier.commission}</span>
                      </div>
                    </div>

                    {/* Specific features */}
                    <div className="space-y-3 pt-2">
                      <span className="text-[10px] font-extrabold text-surface-500 uppercase tracking-widest block font-sans">Institutional Subsystem Privileges:</span>
                      {tier.features.map((f, fIdx) => (
                        <div key={fIdx} className="flex items-start gap-2.5 text-xs font-semibold text-surface-700 font-sans select-text">
                          <CheckCircle2 className="w-4 h-4 text-success-500 flex-shrink-0 mt-0.5" />
                          <span className="leading-snug">{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-surface-100 mt-auto select-none">
                    <Button
                      className={`w-full py-4 h-auto rounded-2xl font-black text-xs font-sans select-none tracking-wide cursor-pointer transition-all shadow-md ${
                        isCurrentTier
                          ? "bg-success-600 text-white hover:bg-success-600 cursor-default shadow-none"
                          : tier.vip
                          ? "bg-surface-900 hover:bg-surface-800 text-white shadow-xl hover:scale-105"
                          : "bg-primary-600 hover:bg-primary-500 text-white shadow-primary-600/30 hover:scale-105"
                      }`}
                      disabled={isCurrentTier || isExecuting}
                      onClick={() => handleCheckout(tier.id)}
                    >
                      {isExecuting && <RefreshCw className="mr-2 h-4 w-4 animate-spin animate-pulse" />}
                      {!isExecuting && <ExternalLink className="mr-2 h-4 w-4 text-yellow-400" />}
                      <span>
                        {isCurrentTier
                          ? "Active Operating Priority Node"
                          : tier.monthlyPrice === "Custom Quote"
                          ? "Simulate Black VIP Handshake"
                          : `Simulate Stripe Upgrade (${tier.id.toUpperCase()})`}
                      </span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default MasterAccountBillingPage;
