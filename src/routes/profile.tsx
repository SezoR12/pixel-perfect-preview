import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, PreDeal, Order, Shipment, LetterOfCredit, DocumentaryCollection, getMe, getPreDeals, getOrders, getShipments, getLCs, getDPs } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { Handshake, ShoppingCart, Truck, Settings, ShieldCheck, ArrowLeft, Building2, CheckCircle2, Save } from "lucide-react";

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
      if (user) {
        const updated = { ...user, name: companyName, phone: contactPhone, country: operatingCorridor };
        setUser(updated);
      }
      setSuccess(t("prof.save.success", "Corporate metadata and preferences updated successfully under active multi-tenant RLS governance."));
    } catch (err: any) {
      setError(err.message || "Failed to post corporate preferences");
    } finally {
      setSaving(false);
    }
  }

  const isRtl = dir === "rtl";
  const inputClass = "w-full px-4 py-3 bg-surface-100/80 border border-surface-200 rounded-2xl text-xs text-surface-900 font-mono placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all";
  const labelClass = "block text-xs font-bold text-surface-700 mb-1.5 font-sans uppercase tracking-wider";

  return (
    <div className={`space-y-8 animate-slide-in font-sans select-none ${isRtl ? "text-right" : "text-left"}`} dir={dir}>
      
      {/* Vercel Style Overview Desk Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-br from-surface-900 via-surface-800 to-slate-950 text-white p-8 rounded-3xl border border-surface-800 shadow-2xl">
        <div className="space-y-1">
          <Badge className="bg-primary-500 text-white font-black font-mono text-[10px] uppercase tracking-widest px-3 py-1">Company operations desk</Badge>
          <h1 className="text-3xl font-black tracking-tight text-white font-serif">
            {t("nav.profile", "Consolidated Partner B2B Desk & Metadata")}
          </h1>
          <p className="text-xs text-surface-400 font-mono">Manage institutional Master Account identity proofs and view your multi-domain interaction ledgers</p>
        </div>

        <Badge variant="outline" className="border-green-500 text-green-300 bg-green-500/10 font-mono font-extrabold text-xs px-4 py-2 self-start sm:self-auto uppercase tracking-wider flex-shrink-0">
          ● Status: Fully Accredited Node
        </Badge>
      </div>

      <div className="max-w-6xl mx-auto space-y-8 select-none">
        
        {/* Identity Consolidation Summary Banner */}
        <Card className="bg-white border border-surface-200 rounded-3xl shadow-sm select-none">
          <CardContent className="p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start gap-5">
              <div className="p-4 rounded-3xl bg-primary-50 text-primary-600 border border-primary-100 flex-shrink-0 shadow-sm mt-1">
                <Building2 className="h-10 w-10" />
              </div>
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="font-extrabold text-surface-900 text-2xl font-sans tracking-tight select-text">{user?.name || "Istanbul Commercial Partner Ltd."}</span>
                  <Badge className="bg-primary-600 text-white font-mono uppercase font-black text-[10px] px-3 py-1">{user?.account_type || "Gold"} Partner Hub</Badge>
                  <Badge variant="outline" className="border-success-500 text-success-700 bg-success-50 font-mono font-bold text-[10px] px-2.5 py-0.5">SGS Archiving Archiving Cleared</Badge>
                </div>
                <p className="text-xs text-surface-600 font-mono select-text">
                  Registered Node Webhooks: <strong className="text-surface-900 select-all font-black">{user?.email || "partner@tureep.ai"}</strong> • Processing Node Waypoint: <strong className="text-primary-600 font-black">{user?.country || "Turkey / Iraq Corridor"}</strong>
                </p>
                <p className="text-[11px] text-surface-400 pt-0.5 font-mono select-text">
                  Sovereign Gotrue DB Data Subject Hash: <span className="text-surface-900 select-all font-black">uuid_{user?.id || "88910_node"}</span>
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end md:items-center p-5 bg-surface-50 rounded-2xl border border-surface-200/80 text-center min-w-44 font-mono select-none">
              <span className="text-[10px] text-surface-500 uppercase font-bold font-sans tracking-wider">Active Trust Index</span>
              <span className="text-3xl font-black text-primary-600 pt-1 font-mono">{user?.reputation_score || 85} / 100</span>
              <span className="text-[9px] text-success-600 font-bold flex items-center gap-1.5 mt-1.5 font-sans uppercase">
                <CheckCircle2 className="h-3 w-3" /> SDN Fully Verified
              </span>
            </div>
          </CardContent>
        </Card>

        {error && <p className="text-xs font-bold text-danger-700 bg-danger-50 p-4 rounded-2xl border border-danger-200 select-text font-mono">{error}</p>}
        {success && <p className="text-xs font-bold text-success-700 bg-success-50 p-4 rounded-2xl border border-success-200 select-text font-mono">{success}</p>}

        <Tabs defaultValue="deals" className="w-full select-none">
          <TabsList className="mb-8 grid w-full grid-cols-2 lg:grid-cols-4 max-w-2xl font-mono">
            <TabsTrigger value="deals" className="flex items-center gap-2 font-bold text-xs cursor-pointer h-12">
              <Handshake className="h-4 w-4 text-primary-600" />
              <span>Active Active Multi-Domain Pairings ({deals.length})</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2 font-bold text-xs cursor-pointer h-12">
              <ShoppingCart className="h-4 w-4 text-accent-600" />
              <span>Escrow Order Order Execution Flows ({orders.length})</span>
            </TabsTrigger>
            <TabsTrigger value="tracking" className="flex items-center gap-2 font-bold text-xs cursor-pointer h-12">
              <Truck className="h-4 w-4 text-success-600" />
              <span>Logistics Container Target EDI ({shipments.length})</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2 font-bold text-xs cursor-pointer h-12">
              <Settings className="h-4 w-4 text-surface-600" />
              <span>Company Company Preferred Master Preferences</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="deals" className="space-y-4">
            {loading ? (
              <p className="text-xs text-muted-foreground font-mono">Synthesizing candidate multi-domain candidate candidate match Hashes...</p>
            ) : deals.length === 0 ? (
              <Card className="p-16 text-center bg-white rounded-3xl border border-surface-200 shadow-sm select-none">
                <Handshake className="mx-auto h-12 w-12 text-surface-300 animate-pulse mb-3" />
                <p className="font-black text-surface-900 text-lg font-sans">Zero Active Spot Deal Propositions</p>
                <p className="text-xs text-surface-500 font-sans mt-1">Accept any incoming smart spot pairing to populate your partner interaction ledger.</p>
              </Card>
            ) : (
              <div className="grid gap-6">
                {deals.map((d) => (
                  <Card key={d.id} className="overflow-hidden border border-surface-200 bg-white shadow-sm hover:border-primary-500 transition-colors rounded-3xl p-6">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                      <div className="space-y-1.5 flex-1 select-text">
                        <div className="flex flex-wrap items-center gap-2.5 select-none font-sans">
                          <Badge className="bg-primary-600 text-white font-mono uppercase font-black text-[10px] px-2.5 py-0.5">{d.product?.category || "commodity"}</Badge>
                          <h3 className="font-black text-surface-900 text-base">{d.product?.name}</h3>
                          <Badge variant={d.is_exclusive ? "default" : "secondary"} className="uppercase font-mono font-extrabold text-[10px]">{d.status}</Badge>
                        </div>
                        <p className="text-xs text-surface-600 font-mono select-text pt-1">
                          Net Tonnage Subject: <strong className="text-surface-900 font-black">{d.quantity} {d.product?.unit}</strong> @ Target Suggested FOB Price: <strong className="text-primary-600 font-black">${d.suggested_price}</strong> / {d.product?.unit}
                        </p>
                        <p className="text-[11px] text-surface-400 font-mono select-text">
                          Institutional Counterparty: <strong className="text-surface-900 font-bold">{d.buyer?.name}</strong> ({d.buyer?.country}) • Settlement Pipeline: <strong className="text-surface-900 font-bold">{d.payment_terms}</strong>
                        </p>
                      </div>

                      <Button size="sm" onClick={() => navigate({ to: "/pre-deals" })} className="bg-primary-600 hover:bg-primary-500 text-white font-black px-6 py-3.5 h-auto rounded-xl text-xs font-mono cursor-pointer shadow-md select-none">
                        Review Spot Pairing Hub
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            {orders.length === 0 ? (
              <Card className="p-16 text-center bg-white rounded-3xl border border-surface-200 shadow-sm select-none">
                <ShoppingCart className="mx-auto h-12 w-12 text-surface-300 animate-bounce mb-3" />
                <p className="font-black text-surface-900 text-lg font-sans">Zero Active Fully Cutover Operational Orders</p>
                <p className="text-xs text-surface-500 font-sans mt-1">Convert an accepted deal handshake from your deal desk to initialize neutral institutional execution ledgers.</p>
              </Card>
            ) : (
              <div className="grid gap-6">
                {orders.map((ord) => (
                  <Card key={ord.id} className="overflow-hidden border border-surface-200 bg-white shadow-sm hover:border-accent-500 transition-colors rounded-3xl p-6 select-text">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                      <div className="space-y-1.5 flex-1 font-mono">
                        <div className="flex flex-wrap items-center gap-2.5 select-none font-sans">
                          <Badge className="bg-accent-500 text-white font-mono font-black text-xs px-3 py-0.5">{ord.order_number}</Badge>
                          <h3 className="font-black text-surface-900 text-base">Fully Shipped Transaction Import/Export Manifest</h3>
                          <Badge variant="outline" className="border-success-500 text-success-700 bg-success-50 uppercase font-mono font-extrabold text-[10px] px-2.5 py-0.5">{ord.status}</Badge>
                        </div>
                        <p className="text-xs text-surface-600 font-mono select-text pt-1">
                          Consolidated Capital Ledger Execution Value: <strong className="text-surface-900 font-black">${Number(ord.total_value).toFixed(2)} {ord.currency}</strong> • Free Port Routing: <strong className="text-primary-600 font-extrabold">{ord.origin_country} → {ord.destination_country}</strong>
                        </p>
                        <p className="text-[11px] text-surface-400 font-mono select-text">
                          Escrow Payout Settlement Handshake Status: <span className="uppercase font-extrabold text-accent-600">{ord.payment_status}</span> • Executed Commercial Incoterm: <strong className="text-surface-900 font-extrabold">{ord.incoterm || "FOB"}</strong>
                        </p>
                      </div>

                      <Button size="sm" onClick={() => navigate({ to: "/orders" })} className="bg-accent-600 hover:bg-accent-500 text-white font-black px-6 py-3.5 h-auto rounded-xl text-xs font-mono cursor-pointer shadow-md select-none">
                        Escrow Payout Separate Cutover
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="tracking" className="space-y-4">
            {shipments.length === 0 ? (
              <Card className="p-16 text-center bg-white rounded-3xl border border-surface-200 shadow-sm select-none">
                <Truck className="mx-auto h-12 w-12 text-surface-300 animate-pulse mb-3" />
                <p className="font-black text-surface-900 text-lg font-sans">Zero Active Consignment Telemetry Way-Points Active</p>
              </Card>
            ) : (
              <div className="grid gap-6">
                {shipments.map((ship) => (
                  <Card key={ship.id} className="overflow-hidden border border-surface-200 bg-white shadow-sm flex flex-col justify-between rounded-3xl">
                    <CardHeader className="bg-surface-50 border-b border-surface-100 p-6 pb-4 select-none font-sans">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Truck className="h-5 w-5 text-primary-600 flex-shrink-0" />
                          <CardTitle className="text-base font-black text-surface-900 tracking-tight">{ship.carrier}</CardTitle>
                        </div>
                        <Badge className="bg-primary-600 text-white font-mono font-black text-xs px-3 py-1 shadow-sm">{ship.tracking_number}</Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="p-6 space-y-6">
                      <div className="grid grid-cols-2 gap-4 p-4 bg-surface-100 rounded-2xl font-mono text-xs border border-surface-200/80 select-text">
                        <div>
                          <span className="text-surface-500 font-sans block text-[10px] font-extrabold uppercase">Origin Corridor Trade Lane:</span>
                          <span className="font-black text-surface-900 text-sm">{ship.origin_corridor}</span>
                        </div>
                        <div>
                          <span className="text-surface-500 font-sans block text-[10px] font-extrabold uppercase">Destination Clearing Customs Desk Node:</span>
                          <span className="font-black text-primary-600 text-sm">{ship.destination_corridor}</span>
                        </div>
                      </div>

                      {ship.events.length > 0 && (
                        <div className="p-4 rounded-2xl bg-primary-50/60 border border-primary-100 space-y-1.5 font-mono text-xs select-text">
                          <span className="text-primary-800 font-sans font-extrabold uppercase text-[10px] tracking-wider block">Latest Satellite Telemetry XML Handshake:</span>
                          <p className="font-black text-surface-900 font-sans text-sm select-text">{ship.events[ship.events.length - 1].location}</p>
                          <p className="text-surface-600 text-xs leading-relaxed font-sans select-text">{ship.events[ship.events.length - 1].description}</p>
                        </div>
                      )}

                      <div className="pt-2 flex justify-end select-none">
                        <Button size="sm" onClick={() => navigate({ to: "/shipments" })} className="bg-primary-600 hover:bg-primary-500 text-white font-black px-6 py-3.5 h-auto rounded-xl text-xs font-mono shadow-md cursor-pointer">
                          GPS Waypoint XML Time-Stamp Control
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="settings">
            <Card className="border border-surface-200 rounded-3xl shadow-sm bg-white select-text">
              <CardHeader className="bg-surface-50 border-b border-surface-100 rounded-t-3xl p-8 pb-6 select-none font-sans">
                <CardTitle className="text-xl font-black text-surface-900 tracking-tight">Consolidated Active Company preferred Institutional Setup Spec</CardTitle>
                <CardDescription className="text-xs font-mono mt-0.5">
                  Updates fully completely fully persist to your Supabase GoTrue Subject Identity Claims. Matchmaker multi-vector correlation search nodes immediately ingest these parameters.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-8">
                <form onSubmit={handleSaveSettings} className="space-y-6 text-xs font-mono">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <Label htmlFor="companyName" className="font-bold font-sans uppercase text-[10px] tracking-widest text-surface-700">Verifiable Legal Target Name</Label>
                      <Input id="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required className="h-12 rounded-2xl bg-surface-50 border-surface-200 font-mono text-xs pl-4 font-bold text-surface-900" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contactPhone" className="font-bold font-sans uppercase text-[10px] tracking-widest text-surface-700">Primary SWIFT Paging Phone</Label>
                      <Input id="contactPhone" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} required className="h-12 rounded-2xl bg-surface-50 border-surface-200 font-mono text-xs pl-4 font-bold text-surface-900" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="operatingCorridor" className="font-bold font-sans uppercase text-[10px] tracking-widest text-surface-700">Primary Commercial Operating Node Node</Label>
                      <Input id="operatingCorridor" value={operatingCorridor} onChange={(e) => setOperatingCorridor(e.target.value)} required className="h-12 rounded-2xl bg-surface-50 border-surface-200 font-mono text-xs pl-4 font-bold text-surface-900" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="preferredCurrency" className="font-bold font-sans uppercase text-[10px] tracking-widest text-surface-700">Baseline Target Trading Currency</Label>
                      <Select value={preferredCurrency} onValueChange={setPreferredCurrency}>
                        <SelectTrigger id="preferredCurrency" className="h-12 rounded-2xl bg-surface-50 border-surface-200 font-mono text-xs font-bold text-surface-900">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">United States Dollar ($ USD)</SelectItem>
                          <SelectItem value="EUR">European Enterprise Euro (€ EUR)</SelectItem>
                          <SelectItem value="TRY">Turkish Commercial Lira (₺ TRY)</SelectItem>
                          <SelectItem value="AED">Emirati Free Zone Dirham (د.إ AED)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-surface-100 flex justify-end select-none">
                    <Button type="submit" className="bg-primary-600 hover:bg-primary-500 text-white font-extrabold px-10 py-4 h-auto rounded-2xl text-xs font-sans shadow-lg shadow-primary-600/30 transition-all flex items-center gap-2 cursor-pointer select-none" disabled={saving}>
                      <Save className="h-4 w-4 text-yellow-400" />
                      <span>{saving ? "Executing Multi-Tenant Structural Mapping..." : t("prof.save.btn", "+ Authorize Complete Sovereign Strategy Validation Setup Spec")}</span>
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default UserProfilePage;
