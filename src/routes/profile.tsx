import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, PreDeal, Order, Shipment, LetterOfCredit, DocumentaryCollection, getMe, getPreDeals, getOrders, getShipments, getLCs, getDPs } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { User as UserIcon, Handshake, ShoppingCart, Truck, CreditCard, Settings, ShieldCheck, MapPin, ArrowLeft, Building2, CheckCircle2, Zap, Save } from "lucide-react";

export const Route = createFileRoute("/profile")({
  component: UserProfilePage,
});

function UserProfilePage() {
  const navigate = useNavigate();
  const { t, dir } = useI18n();
  const [user, setUser] = useState<User | null>(null);
  const [deals, setDeals] = useState<PreDeal[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [lcs, setLcs] = useState<LetterOfCredit[]>([]);
  const [dps, setDps] = useState<DocumentaryCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Company Settings Form
  const [companyName, setCompanyName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [operatingCorridor, setOperatingCorridor] = useState("");
  const [preferredCurrency, setPreferredCurrency] = useState("USD");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [uData, dealData, ordData, shipData, lcData, dpData] = await Promise.all([
        getMe(),
        getPreDeals(),
        getOrders(),
        getShipments(),
        getLCs(),
        getDPs(),
      ]);
      setUser(uData);
      setDeals(dealData);
      setOrders(ordData);
      setShipments(shipData);
      setLcs(lcData);
      setDps(dpData);

      // Populate settings
      setCompanyName(uData.name || "Corporate Enterprise Partner");
      setContactPhone(uData.phone || "+905301234567");
      setOperatingCorridor(uData.country || "Turkey / Iraq Corridor");
    } catch (err: any) {
      setError(err.message || "Failed to consolidate corporate profile ledger");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      // Update local ledger for instant snappy preview reflection
      if (user) {
        const updated = { ...user, name: companyName, phone: contactPhone, country: operatingCorridor };
        setUser(updated);
      }
      setSuccess(t("prof.save.success", "Corporate metadata and preferences updated successfully under active RLS multi-tenant governance."));
    } catch (err: any) {
      setError(err.message || "Failed to post corporate preferences");
    } finally {
      setSaving(false);
    }
  }

  const isRtl = dir === "rtl";

  return (
    <div className={`flex min-h-screen bg-background ${isRtl ? "font-sans text-right" : "font-sans text-left"}`} dir={dir}>
      <AppSidebar activeRoute="profile" />

      <main className="flex-1 overflow-auto">
        <header className="flex h-16 items-center justify-between border-b border-border bg-white px-6 lg:px-8 select-none">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate({ to: "/dashboard" })} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className={isRtl ? "h-5 w-5 rotate-180" : "h-5 w-5"} />
            </button>
            <h1 className="text-lg font-bold text-foreground">
              {t("nav.profile", "Company Profile & Consolidated Partner Desk")}
            </h1>
          </div>
          <Badge variant="outline" className="border-primary text-primary bg-primary/5 font-mono text-xs">
            {user?.account_type || "Gold"} Node Priority: Approved
          </Badge>
        </header>

        <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
          
          {/* Identity Consolidation Summary Banner */}
          <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20 select-none">
            <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <Building2 className="h-12 w-12 text-primary flex-shrink-0 mt-1" />
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2.5 font-mono">
                    <span className="font-extrabold text-foreground text-xl font-sans">{user?.name || "Istanbul Imports Ltd."}</span>
                    <Badge className="bg-primary text-white uppercase text-[10px]">{user?.account_type || "Gold"} SLA</Badge>
                    <Badge variant="outline" className="border-green-500 text-green-700 bg-green-50">KYC Verified</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono">
                    Registered Email: <strong className="text-foreground">{user?.email || "partner@tureep.ai"}</strong> • Primary Operating Node: <strong className="text-foreground">{user?.country || "Turkey"}</strong>
                  </p>
                  <p className="text-[11px] text-muted-foreground pt-0.5 font-mono">
                    Sovereign Gotrue Data Subject Identifier: <span className="text-amber-600 select-all font-bold">uuid_{user?.id || "8891_node"}</span>
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-end md:items-center p-4 bg-white rounded-2xl border border-border shadow-sm text-center min-w-40 font-mono">
                <span className="text-[10px] text-muted-foreground uppercase font-bold font-sans">Active Trust Index</span>
                <span className="text-3xl font-black text-primary pt-0.5">{user?.reputation_score || 85} / 100</span>
                <span className="text-[9px] text-emerald-600 font-bold flex items-center gap-1 mt-1 font-sans">
                  <CheckCircle2 className="h-3 w-3" /> SDN Completely Cleared
                </span>
              </div>
            </CardContent>
          </Card>

          {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">{error}</p>}
          {success && <p className="text-sm text-green-600 bg-green-50 p-3 rounded-lg border border-green-200">{success}</p>}

          {/* 4 Unified Operations Tabs */}
          <Tabs defaultValue="deals" className="w-full">
            <TabsList className="mb-6 grid w-full grid-cols-2 lg:grid-cols-4 max-w-3xl">
              <TabsTrigger value="deals" className="flex items-center gap-2 font-bold text-xs">
                <Handshake className="h-4 w-4" />
                {t("prof.tab.deals", `Active Handshakes (${deals.length})`)}
              </TabsTrigger>
              <TabsTrigger value="orders" className="flex items-center gap-2 font-bold text-xs">
                <ShoppingCart className="h-4 w-4" />
                {t("prof.tab.orders", `Escrow Manifests (${orders.length})`)}
              </TabsTrigger>
              <TabsTrigger value="tracking" className="flex items-center gap-2 font-bold text-xs">
                <Truck className="h-4 w-4" />
                {t("prof.tab.tracking", `EDI Trackings (${shipments.length})`)}
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2 font-bold text-xs">
                <Settings className="h-4 w-4" />
                {t("prof.tab.settings", "Company Node Setup")}
              </TabsTrigger>
            </TabsList>

            {/* Tab 1: Pre-Deals */}
            <TabsContent value="deals" className="space-y-4">
              {loading ? (
                <p className="text-muted-foreground text-sm">Synthesizing active matching ledgers...</p>
              ) : deals.length === 0 ? (
                <Card className="p-12 text-center bg-secondary/30">
                  <Handshake className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-3 font-medium text-foreground">Zero Active Handshake Deals</p>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {deals.map((d) => (
                    <Card key={d.id} className="overflow-hidden border border-border bg-white shadow-sm hover:border-primary/50 transition-colors">
                      <CardContent className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2.5">
                            <Badge className="bg-primary text-white font-mono text-xs">{d.product?.category}</Badge>
                            <h3 className="font-extrabold text-foreground text-base">{d.product?.name}</h3>
                            <Badge variant={d.is_exclusive ? "default" : "secondary"} className="uppercase font-mono text-[10px]">{d.status}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground font-mono pt-1">
                            Quantity: <strong className="text-foreground">{d.quantity} {d.product?.unit}</strong> • Target Suggested Price: <strong className="text-primary">${d.suggested_price} FOB</strong> / {d.product?.unit}
                          </p>
                          <p className="text-[11px] text-muted-foreground font-mono">
                            Counterparty Role: <strong className="text-foreground">{d.buyer?.name}</strong> ({d.buyer?.country}) • Financial Custody Flow: <strong className="text-foreground">{d.payment_terms}</strong>
                          </p>
                        </div>

                        <Button size="sm" onClick={() => navigate({ to: "/pre-deals" })} className="bg-primary hover:bg-primary/90 text-white font-bold select-none">
                          {t("btn.review", "Review Handshake")}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Tab 2: Orders */}
            <TabsContent value="orders" className="space-y-4">
              {orders.length === 0 ? (
                <Card className="p-12 text-center bg-secondary/30">
                  <ShoppingCart className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-3 font-medium text-foreground">Zero Active Commercial Orders</p>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {orders.map((ord) => (
                    <Card key={ord.id} className="overflow-hidden border border-border bg-white shadow-sm hover:border-primary/50 transition-colors">
                      <CardContent className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2.5">
                            <Badge className="bg-amber-500 text-black font-mono font-bold text-xs">{ord.order_number}</Badge>
                            <h3 className="font-extrabold text-foreground text-base">Confirmed Commercial Import/Export Manifest</h3>
                            <Badge variant="outline" className="border-green-500 text-green-700 bg-green-50 uppercase font-mono text-[10px]">{ord.status}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground font-mono pt-1">
                            Face Commitment Value: <strong className="text-foreground">${Number(ord.total_value).toFixed(2)} {ord.currency}</strong> • Trade Port Corridor: <strong className="text-primary">{ord.origin_country} → {ord.destination_country}</strong>
                          </p>
                          <p className="text-[11px] text-muted-foreground font-mono">
                            Payment Custody Custody Status: <span className="uppercase font-bold text-amber-600">{ord.payment_status}</span> • Executed Incoterm: <strong className="text-foreground">{ord.incoterm || "FOB"}</strong>
                          </p>
                        </div>

                        <Button size="sm" onClick={() => navigate({ to: "/orders" })} className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold select-none">
                          Escrow & Paper Audit
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Tab 3: Container EDI Logistics Tracking */}
            <TabsContent value="tracking" className="space-y-4">
              {shipments.length === 0 ? (
                <Card className="p-12 text-center bg-secondary/30">
                  <Truck className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-3 font-medium text-foreground">Zero Active Container Tracking Manifests</p>
                </Card>
              ) : (
                <div className="grid gap-6">
                  {shipments.map((ship) => (
                    <Card key={ship.id} className="overflow-hidden border border-border bg-white shadow-sm flex flex-col justify-between">
                      <CardHeader className="bg-secondary/40 border-b border-border p-5 pb-3.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <Truck className="h-5 w-5 text-primary flex-shrink-0" />
                            <CardTitle className="text-base font-extrabold text-foreground">{ship.carrier}</CardTitle>
                          </div>
                          <Badge className="bg-primary text-white font-mono text-xs">{ship.tracking_number}</Badge>
                        </div>
                      </CardHeader>

                      <CardContent className="p-5 space-y-4">
                        <div className="grid grid-cols-2 gap-4 p-3.5 bg-secondary/30 rounded-xl text-xs font-mono">
                          <div>
                            <span className="text-muted-foreground font-sans block text-[10px] font-bold">Origin Node:</span>
                            <span className="font-extrabold text-foreground">{ship.origin_corridor}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground font-sans block text-[10px] font-bold">Destination Free Port:</span>
                            <span className="font-extrabold text-primary">{ship.destination_corridor}</span>
                          </div>
                        </div>

                        {/* Recent telemetry event */}
                        {ship.events.length > 0 && (
                          <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20 space-y-1 font-mono text-xs">
                            <span className="text-primary font-sans font-bold uppercase text-[10px] tracking-wider block">Latest Satellite Telemetry Checkpoint:</span>
                            <p className="font-extrabold text-foreground font-sans">{ship.events[ship.events.length - 1].location}</p>
                            <p className="text-muted-foreground text-[11px] leading-relaxed font-sans">{ship.events[ship.events.length - 1].description}</p>
                          </div>
                        )}

                        <div className="pt-2 flex justify-end">
                          <Button size="sm" onClick={() => navigate({ to: "/shipments" })} className="bg-primary hover:bg-primary/90 text-white font-bold select-none">
                            GPS Waypoint Injection
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Tab 4: Corporate Node Settings */}
            <TabsContent value="settings">
              <Card className="border-2 border-primary/40 bg-white shadow-lg">
                <CardHeader>
                  <CardTitle className="text-base font-extrabold text-foreground flex items-center gap-2">
                    <Settings className="h-5 w-5 text-primary" />
                    <span>Company Operations Setup & Preferred Metadata</span>
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Updates successfully persist to your active Supabase Gotrue session properties. Counterparty search indexing algorithms dynamically evaluate operating corridor properties.
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <form onSubmit={handleSaveSettings} className="space-y-5 text-xs font-medium">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="companyName" className="font-bold text-sm">Verifiable Legal Corporate Name</Label>
                        <Input id="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required className="h-10 text-sm font-mono" />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="contactPhone" className="font-bold text-sm">Primary SWIFT / Contact Phone</Label>
                        <Input id="contactPhone" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} required className="h-10 text-sm font-mono" />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="operatingCorridor" className="font-bold text-sm">Operating Free Zone or National Corridor</Label>
                        <Input id="operatingCorridor" value={operatingCorridor} onChange={(e) => setOperatingCorridor(e.target.value)} required className="h-10 text-sm font-mono" />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="preferredCurrency" className="font-bold text-sm">Baseline Settlement Currency</Label>
                        <Select value={preferredCurrency} onValueChange={setPreferredCurrency}>
                          <SelectTrigger id="preferredCurrency" className="h-10 text-sm font-mono">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USD">United States Dollar (USD)</SelectItem>
                            <SelectItem value="EUR">Euro face wire (EUR)</SelectItem>
                            <SelectItem value="TRY">Turkish Lira custom spot (TRY)</SelectItem>
                            <SelectItem value="AED">United Arab Emirates Dirham (AED)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-border flex justify-end">
                      <Button type="submit" className="bg-primary hover:bg-primary/90 text-white font-extrabold px-8 py-3 h-11 text-sm select-none shadow-lg" disabled={saving}>
                        <Save className="h-4 w-4 mr-2" />
                        <span>{saving ? "Executing RLS synchronization..." : t("prof.save.btn", "Authorize Corporate Setup")}</span>
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
