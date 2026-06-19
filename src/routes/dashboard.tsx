import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AppSidebar } from "@/components/AppSidebar";
import { useI18n, Language } from "@/lib/i18n";
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
  Globe,
  Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const navigate = useNavigate();
  const { language, setLanguage, t, dir } = useI18n();
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
      <div className="flex min-h-screen">
        <AppSidebar activeRoute="dashboard" />

        <main className="flex-1 overflow-auto">
          <header className="flex h-16 items-center justify-between border-b border-border bg-white px-6 lg:px-8 select-none">
            <h1 className="text-lg font-semibold text-foreground">{t("dash.welcome", "B2B Trade Network Intelligence")}</h1>
            <div className="flex items-center gap-4">
              <div className={dir === "rtl" ? "text-left font-mono" : "text-right font-mono"}>
                <p className="text-sm font-bold text-foreground">{user?.name || "Tureep Edge Node"}</p>
                <p className="text-xs text-muted-foreground uppercase">{user?.account_type || "Gold"}</p>
              </div>
              <Badge variant="secondary" className="capitalize text-xs font-mono">
                {user?.account_type || "Gold"} Member
              </Badge>
            </div>
          </header>

          <div className="p-6 lg:p-8 space-y-8 max-w-6xl mx-auto">
            {/* Multi-Language / RTL Localization Showcase Card */}
            <Card className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-amber-500/30">
              <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-1.5 max-w-2xl">
                  <Badge className="bg-amber-500 text-amber-950 font-black uppercase text-[10px] tracking-widest font-mono">MENA LTR / RTL Gateway</Badge>
                  <h2 className="text-lg font-extrabold text-foreground">{t("dash.showcase.title", "MENA & Cross-Border Localization Gateway")}</h2>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {t("dash.showcase.desc", "Tureep AI+ strictly enforces instant layout mirroring (dir='rtl') and rich native fonts for institutional trade corridors connecting Iraq, Iran, Turkey, and EU markets.")}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 select-none self-end md:self-center">
                  <Button size="sm" variant={language === "ar" ? "default" : "outline"} className={`text-xs font-mono h-8 ${language === "ar" ? "bg-amber-500 text-black font-bold" : ""}`} onClick={() => setLanguage("ar")}>
                    العربية (RTL)
                  </Button>
                  <Button size="sm" variant={language === "tr" ? "default" : "outline"} className={`text-xs font-mono h-8 ${language === "tr" ? "bg-amber-500 text-black font-bold" : ""}`} onClick={() => setLanguage("tr")}>
                    Türkçe (LTR)
                  </Button>
                  <Button size="sm" variant={language === "ku" ? "default" : "outline"} className={`text-xs font-mono h-8 ${language === "ku" ? "bg-amber-500 text-black font-bold" : ""}`} onClick={() => setLanguage("ku")}>
                    کوردی (RTL)
                  </Button>
                  <Button size="sm" variant={language === "fa" ? "default" : "outline"} className={`text-xs font-mono h-8 ${language === "fa" ? "bg-amber-500 text-black font-bold" : ""}`} onClick={() => setLanguage("fa")}>
                    فارسی (RTL)
                  </Button>
                  <Button size="sm" variant={language === "en" ? "default" : "outline"} className={`text-xs font-mono h-8 ${language === "en" ? "bg-amber-500 text-black font-bold" : ""}`} onClick={() => setLanguage("en")}>
                    English (LTR)
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Metrics */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <MetricCard
                icon={Package}
                label={t("dash.metrics.prods", "Listed Products")}
                value={stats?.total_products ?? 3}
              />
              <MetricCard
                icon={ClipboardList}
                label={t("dash.metrics.demands", "Active Demands")}
                value={stats?.total_demands ?? 12}
              />
              <MetricCard
                icon={Handshake}
                label={t("dash.metrics.deals", "Active Pre-Deals")}
                value={stats?.active_pre_deals ?? 3}
              />
              <MetricCard
                icon={TrendingUp}
                label={t("dash.metrics.accepted", "Accepted Deals")}
                value={stats?.accepted_deals ?? 1}
              />
              <MetricCard
                icon={ShoppingCart}
                label={t("dash.metrics.orders", "Active Orders")}
                value={stats?.active_orders ?? 1}
              />
            </div>

            {/* Compliance quick actions */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="p-5 border-border shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary flex-shrink-0">
                      <FileCheck className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-bold text-foreground text-base">{t("dash.kyc.title", "KYC Identity Audit")}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 capitalize font-mono">Status: {user?.kyc_status || "Approved"}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => navigate({ to: "/kyc" })} className="font-bold">
                    {t("btn.verify", "Verify Proof")}
                  </Button>
                </div>
              </Card>
              <Card className="p-5 border-border shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary flex-shrink-0">
                      <Shield className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-bold text-foreground text-base">{t("dash.sanctions.title", "Global Sanctions Check")}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                        {user?.sanctions_screened ? "SDN Cleared (Zero Hit)" : "Pending Sweep"}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => navigate({ to: "/sanctions" })} className="font-bold">
                    {t("btn.screen", "Execute Sweep")}
                  </Button>
                </div>
              </Card>
            </div>

            {/* Pre-deals */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-foreground">{t("dash.deals.title", "Active Institutional Pre-Deals")}</h2>
                <Button variant="outline" size="sm" onClick={() => navigate({ to: "/pre-deals" })} className="font-mono text-xs">
                  <span>{t("btn.viewall", "View all")}</span>
                  <ArrowRight className={dir === "rtl" ? "mr-2 h-4 w-4 rotate-180" : "ml-2 h-4 w-4"} />
                </Button>
              </div>

              {preDeals.length === 0 ? (
                <Card className="p-12 text-center bg-secondary/30">
                  <Handshake className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-3 font-medium text-foreground">No active pre-deals found.</p>
                  <Button
                    className="mt-4"
                    variant="outline"
                    onClick={() => navigate({ to: "/products" })}
                  >
                    List new B2B product
                  </Button>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {preDeals.slice(0, 5).map((deal) => (
                    <Card key={deal.id} className="overflow-hidden border border-border bg-white shadow-sm hover:border-primary/50 transition-colors">
                      <CardContent className="p-5">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2.5">
                              <h3 className="font-extrabold text-foreground text-base">
                                {deal.product?.name || "B2B Cross-Border Commodity"}
                              </h3>
                              <Badge variant={deal.is_exclusive ? "default" : "secondary"} className="uppercase font-mono text-[10px]">
                                {deal.status}
                              </Badge>
                              <span className="text-xs text-muted-foreground font-mono font-bold">•</span>
                              <span className="text-xs font-bold text-primary font-mono">{deal.payment_terms} Flow</span>
                            </div>
                            <p className="text-xs text-muted-foreground font-mono">
                              {deal.quantity} {deal.product?.unit} @ Suggested FOB: <strong className="text-foreground">${deal.suggested_price}</strong> / {deal.product?.unit}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              Target Importer: <strong className="text-foreground">{deal.buyer?.name}</strong> ({deal.buyer?.country}) • AI Scoring: <strong className="text-amber-600 font-mono">{deal.match_score}</strong>
                            </p>
                          </div>
                          <Button
                            size="sm"
                            className="bg-primary hover:bg-primary/90 text-white font-bold select-none self-end sm:self-center"
                            onClick={() => navigate({ to: "/pre-deals" })}
                          >
                            {t("btn.review", "Review Handshake")}
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
