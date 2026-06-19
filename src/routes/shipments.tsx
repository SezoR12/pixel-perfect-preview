import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shipment, getShipments, addTrackingEvent } from "@/lib/api";
import { Truck, Navigation, CheckCircle2, Clock, MapPin, RefreshCw, Send, AlertTriangle, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/shipments")({
  component: ShipmentsPage,
});

function ShipmentsPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Checkpoint Injection State
  const [targetShipmentId, setTargetShipmentId] = useState<number | null>(null);
  const [checkpointLocation, setCheckpointLocation] = useState("");
  const [checkpointDesc, setCheckpointDesc] = useState("");
  const [nextStatus, setNextStatus] = useState("in_transit");
  const [injecting, setInjecting] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await getShipments();
      setShipments(data);
      if (data.length && !targetShipmentId) {
        setTargetShipmentId(data[0].id);
      }
    } catch (err: any) {
      setError(err.message || "Failed to retrieve tracking ledger");
    } finally {
      setLoading(false);
    }
  }

  async function handleInjectCheckpoint(e: React.FormEvent) {
    e.preventDefault();
    if (!targetShipmentId) return;
    setInjecting(true);
    setError("");
    setSuccess("");
    try {
      const updated = await addTrackingEvent(targetShipmentId, checkpointLocation, checkpointDesc, nextStatus);
      setShipments(shipments.map((item) => (item.id === targetShipmentId ? updated : item)));
      setSuccess("Secure logistics checkpoint cryptographically injected.");
      setCheckpointLocation("");
      setCheckpointDesc("");
    } catch (err: any) {
      setError(err.message || "Checkpoint injection failed");
    } finally {
      setInjecting(false);
    }
  }

  function autofillSample(loc: string, desc: string, status: string) {
    setCheckpointLocation(loc);
    setCheckpointDesc(desc);
    setNextStatus(status);
  }

  const shipmentStatuses = [
    { id: "label_created", label: "Manifest Dispatched" },
    { id: "picked_up", label: "Freight Secured" },
    { id: "customs_export", label: "Export Customs Audit" },
    { id: "in_transit", label: "Maritime Steaming" },
    { id: "customs_import", label: "Import Customs Node" },
    { id: "out_for_delivery", label: "Final Haulage" },
    { id: "delivered", label: "Delivered & Verified" },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar activeRoute="shipments" />

      <main className="flex-1 overflow-auto">
        <header className="flex h-16 items-center justify-between border-b border-border bg-white px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Truck className="h-5 w-5 text-primary flex-shrink-0" />
            <h1 className="text-lg font-semibold text-foreground">Logistics Container Tracking & GPS Waypoints</h1>
          </div>
          <Badge variant="outline" className="border-primary text-primary bg-primary/5 font-mono">
            Carrier APIs Connected: DHL / Maersk / Maersk Line
          </Badge>
        </header>

        <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
          <Card className="bg-gradient-to-r from-secondary/40 via-secondary/20 to-transparent border-border">
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Navigation className="h-5 w-5 text-primary" />
                    Electronic Bill of Lading & Webhook Subsystem
                  </CardTitle>
                  <CardDescription>
                    Monitor physical cross-border freight trajectories. The platform consumes automated EDI tracking webhooks from shipping lines, updating commercial escrow custody locks upon customs clearing.
                  </CardDescription>
                </div>
                <Button size="sm" variant="outline" onClick={load} disabled={loading}>
                  <RefreshCw className="mr-2 h-4 w-4" /> Sync Satellite Data
                </Button>
              </div>
            </CardHeader>
          </Card>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Active Shipments Timeline Column */}
            <div className="lg:col-span-2 space-y-6">
              {loading ? (
                <p className="text-muted-foreground text-sm">Querying global freight satellites...</p>
              ) : shipments.length === 0 ? (
                <Card className="p-12 text-center bg-secondary/30">
                  <Truck className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-3 font-medium text-foreground">Zero Active Containers</p>
                  <p className="text-xs text-muted-foreground mt-1">Accept a deal and generate an Order to create an active container tracking manifest.</p>
                </Card>
              ) : (
                shipments.map((ship) => {
                  const currentStatusIdx = shipmentStatuses.findIndex((s) => s.id === ship.status);

                  return (
                    <Card key={ship.id} className="overflow-hidden border border-border bg-white shadow-sm">
                      <CardHeader className="bg-secondary/40 border-b border-border pb-4">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <Badge className="font-mono text-xs bg-primary text-white">{ship.tracking_number}</Badge>
                            <CardTitle className="text-base font-bold text-foreground">
                              {ship.carrier}
                            </CardTitle>
                            <Badge variant={ship.status === "delivered" ? "outline" : "secondary"} className={ship.status === "delivered" ? "bg-green-50 text-green-700 border-green-300 uppercase font-mono text-[10px]" : "uppercase font-mono text-[10px]"}>
                              State: {ship.status.replace("_", " ")}
                            </Badge>
                          </div>
                          <span className="text-xs text-muted-foreground font-mono">
                            Target SLA: {ship.estimated_delivery ? new Date(ship.estimated_delivery).toLocaleDateString() : "Pending Calculation"}
                          </span>
                        </div>
                      </CardHeader>

                      <CardContent className="p-6 space-y-6">
                        {/* Corridor Metadata Bar */}
                        <div className="grid md:grid-cols-2 gap-4 p-4 bg-secondary/30 rounded-xl text-xs font-mono">
                          <div>
                            <span className="font-bold text-foreground block mb-0.5 font-sans">Origin Trade Port:</span>
                            <span className="text-primary font-semibold">{ship.origin_corridor}</span>
                          </div>
                          <div>
                            <span className="font-bold text-foreground block mb-0.5 font-sans">Destination Customs Node:</span>
                            <span className="text-primary font-semibold">{ship.destination_corridor}</span>
                          </div>
                        </div>

                        {/* Logistics Horizon Progress Bar */}
                        <div className="space-y-2">
                          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block font-mono">
                            Cross-Border Physical Horizon
                          </span>
                          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5">
                            {shipmentStatuses.map((st, idx) => {
                              const isCompleted = idx <= (currentStatusIdx >= 0 ? currentStatusIdx : 0);
                              const isCurrent = st.id === ship.status;

                              return (
                                <div
                                  key={st.id}
                                  className={`p-2 rounded-lg border text-center transition-all ${
                                    isCurrent
                                      ? "bg-primary text-primary-foreground font-bold border-primary shadow-sm scale-105 select-none"
                                      : isCompleted
                                      ? "bg-green-50 border-green-200 text-green-900 font-medium"
                                      : "bg-secondary/40 border-border text-muted-foreground opacity-50 text-[10px]"
                                  }`}
                                >
                                  <span className="text-[10px] block font-mono">Stage {idx + 1}</span>
                                  <span className="text-[11px] tracking-tight block truncate">{st.label}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Immutable Timeline Tracking Events */}
                        <div className="space-y-3 pt-2 border-t border-border">
                          <span className="text-[11px] font-bold text-foreground uppercase tracking-wider block font-mono flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-primary" />
                            GPS Telemetry Events ({ship.events.length})
                          </span>
                          
                          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                            {ship.events.map((ev, evtIdx) => (
                              <div key={ev.id || evtIdx} className="flex items-start gap-3 p-3 rounded-xl bg-secondary/30 border border-border/80 text-xs">
                                <div className="p-1 rounded bg-primary/10 text-primary mt-0.5 flex-shrink-0">
                                  <MapPin className="h-3.5 w-3.5" />
                                </div>
                                <div className="space-y-0.5 flex-1 font-mono">
                                  <span className="font-bold text-foreground font-sans block">{ev.location}</span>
                                  <p className="text-muted-foreground font-sans text-[11px] leading-relaxed">{ev.description}</p>
                                  <span className="text-[9px] text-muted-foreground block pt-0.5">
                                    Telemetry Hash: {new Date(ev.timestamp).toUTCString()}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>

            {/* Checkpoint Injection Control Box */}
            <Card className="border border-primary/20 bg-white h-fit">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Send className="h-4 w-4 text-primary" />
                  Simulate EDI Webhook Hook
                </CardTitle>
                <CardDescription>Transmit mock GPS coordinates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleInjectCheckpoint} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="targetShipmentId">Target Container Manifest</Label>
                    <Select
                      value={targetShipmentId ? String(targetShipmentId) : ""}
                      onValueChange={(v) => setTargetShipmentId(Number(v))}
                    >
                      <SelectTrigger id="targetShipmentId">
                        <SelectValue placeholder="Select manifest" />
                      </SelectTrigger>
                      <SelectContent>
                        {shipments.map((s) => (
                          <SelectItem key={s.id} value={String(s.id)}>
                            {s.tracking_number} ({s.carrier})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="checkpointLocation">Satellite Geo-Waypoint</Label>
                    <Input
                      id="checkpointLocation"
                      value={checkpointLocation}
                      onChange={(e) => setCheckpointLocation(e.target.value)}
                      placeholder="e.g. Mersin Free Zone, Turkey"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nextStatus">Advance Freight SLA Stage</Label>
                    <Select value={nextStatus} onValueChange={setNextStatus}>
                      <SelectTrigger id="nextStatus">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="in_transit">Maritime Steaming (In Transit)</SelectItem>
                        <SelectItem value="customs_import">Import Customs Audit Node</SelectItem>
                        <SelectItem value="out_for_delivery">Final Haulage (Out for Delivery)</SelectItem>
                        <SelectItem value="delivered">Delivered & Escrow Ready</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="checkpointDesc">Inspector XML Remarks</Label>
                    <Input
                      id="checkpointDesc"
                      value={checkpointDesc}
                      onChange={(e) => setCheckpointDesc(e.target.value)}
                      placeholder="e.g. Customs papers unsealed. Physical container seal intact."
                      required
                    />
                  </div>

                  {error && <p className="text-sm text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">{error}</p>}
                  {success && <p className="text-sm text-green-600 bg-green-50 p-2.5 rounded-lg border border-green-200">{success}</p>}

                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white" disabled={injecting || !targetShipmentId}>
                    {injecting ? "Injunction pending..." : "Inject Cryptographic Checkpoint"}
                  </Button>
                </form>

                {/* Quick autofill sample buttons */}
                <div className="pt-4 border-t border-border space-y-2">
                  <span className="text-[11px] font-bold text-foreground block">Quick Autopopulate Targets:</span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full justify-start text-xs border-blue-300 hover:bg-blue-50 font-mono"
                    onClick={() => autofillSample("Suez Canal / Eastern Med Maritime Waypoint", "Vessel transiting restricted corridor seamlessly. Military escort accompanying fleet.", "in_transit")}
                  >
                    <Navigation className="mr-2 h-3.5 w-3.5 text-blue-600 flex-shrink-0" />
                    Suez Canal Waypoint (In Transit)
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full justify-start text-xs border-amber-300 hover:bg-amber-50 font-mono"
                    onClick={() => autofillSample("Mersin Free Zone Import Customs Desk", "Cargo unloaded to bonded warehouse. Commercial invoice and certificate of origin authenticated.", "customs_import")}
                  >
                    <ShieldCheck className="mr-2 h-3.5 w-3.5 text-amber-600 flex-shrink-0" />
                    Mersin Import Customs Audit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full justify-start text-xs border-green-300 hover:bg-green-50 font-mono"
                    onClick={() => autofillSample("Istanbul Importer Industrial Facility", "Physical commodity delivered. 100% Quality verification confirmed by SGS field inspector.", "delivered")}
                  >
                    <CheckCircle2 className="mr-2 h-3.5 w-3.5 text-green-600 flex-shrink-0" />
                    Final Importer Facility (Delivered)
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
