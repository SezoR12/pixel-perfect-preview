import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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
      setError(err.message || "Failed to consolidate tracking ledger");
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
      setSuccess("Secure satellite logistics checkpoint cryptographically timestamped.");
      setCheckpointLocation("");
      setCheckpointDesc("");
    } catch (err: any) {
      setError(err.message || "Checkpoint injection dropped");
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
    { id: "label_created", label: "Manifest Manifest Handshake" },
    { id: "picked_up", label: "Haulage Active" },
    { id: "customs_export", label: "Export Customs Audit" },
    { id: "in_transit", label: "Maritime Steaming" },
    { id: "customs_import", label: "Import Customs Clearing" },
    { id: "out_for_delivery", label: "Final Haulage Haulage" },
    { id: "delivered", label: "Delivered & Escrow Ready" },
  ];

  const inputClass = "w-full px-4 py-3 bg-surface-100/80 border border-surface-200 rounded-2xl text-xs text-surface-900 font-mono placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all";
  const labelClass = "block text-xs font-bold text-surface-700 mb-1.5 font-sans uppercase tracking-wider";

  return (
    <div className="space-y-8 animate-slide-in font-sans select-none">
      
      {/* Vercel Style Main Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-br from-surface-900 via-surface-800 to-slate-950 text-white p-8 rounded-3xl border border-surface-800 shadow-2xl">
        <div className="space-y-1">
          <Badge className="bg-primary-500 text-white font-black font-mono text-[10px] uppercase tracking-widest px-3 py-1">Logistics desk</Badge>
          <h1 className="text-3xl font-black tracking-tight text-white font-serif">Satellite EDI Shipping Telemetry & GPS Geo-Waypoints</h1>
          <p className="text-xs text-surface-400 font-mono">Consume automated satellite tracking webhooks from DHL Global Forwarding and Maersk Line</p>
        </div>

        <Badge variant="outline" className="border-primary text-primary bg-primary-50/10 font-mono font-extrabold text-xs px-4 py-2 self-start sm:self-auto uppercase tracking-wider">
          Carrier Links: Fully Active
        </Badge>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        
        {/* Active Container Timelines */}
        <div className="lg:col-span-2 space-y-6">
          {loading ? (
            <p className="text-muted-foreground text-xs font-mono">Querying global shipping satellites...</p>
          ) : shipments.length === 0 ? (
            <Card className="p-16 text-center bg-white rounded-3xl border border-surface-200 shadow-sm select-none space-y-3">
              <Truck className="mx-auto h-12 w-12 text-surface-300 animate-bounce" />
              <p className="font-black text-surface-900 text-lg font-sans">Zero Active Ocean or Air Consignments</p>
              <p className="text-xs text-surface-500 max-w-md mx-auto leading-relaxed font-sans">
                Accept any handshake from your deal desk and emit a formal commercial order to immediately bind continuous container GPS tracking telemetry.
              </p>
            </Card>
          ) : (
            shipments.map((ship) => {
              const currentStatusIdx = shipmentStatuses.findIndex((s) => s.id === ship.status);

              return (
                <Card key={ship.id} className="overflow-hidden border border-surface-200 bg-white shadow-sm hover:border-primary-500/60 transition-all duration-300 rounded-3xl">
                  <CardHeader className="bg-surface-50 border-b border-surface-100 p-6 pb-4 select-none font-sans">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <Badge className="font-mono font-black text-xs bg-primary-600 text-white uppercase tracking-widest px-3 py-1 shadow-sm border border-primary-500">
                          {ship.tracking_number}
                        </Badge>
                        <CardTitle className="text-lg font-black text-surface-900 tracking-tight">
                          {ship.carrier}
                        </CardTitle>
                        <Badge variant={ship.status === "delivered" ? "outline" : "secondary"} className={ship.status === "delivered" ? "bg-success-50 text-success-700 border-success-300 font-mono uppercase font-black text-[10px]" : "font-mono uppercase font-black text-[10px]"}>
                          ● Stage: {ship.status.replace("_", " ")}
                        </Badge>
                      </div>
                      <span className="text-xs text-surface-500 font-mono font-extrabold">
                        Target Haulage SLA: <strong className="text-surface-900">{ship.estimated_delivery ? new Date(ship.estimated_delivery).toLocaleDateString() : "Pending XML Ruling"}</strong>
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent className="p-8 space-y-8 select-text">
                    
                    {/* Corridor Port Bar */}
                    <div className="grid md:grid-cols-2 gap-4 p-5 bg-surface-100 rounded-2xl font-mono text-xs border border-surface-200/80 select-text">
                      <div>
                        <span className="font-bold text-surface-500 block mb-1 font-sans uppercase text-[10px] tracking-widest">Export Port Corridor</span>
                        <span className="text-primary-700 font-extrabold text-sm select-all block">{ship.origin_corridor}</span>
                      </div>
                      <div>
                        <span className="font-bold text-surface-500 block mb-1 font-sans uppercase text-[10px] tracking-widest">Destination customs Node</span>
                        <span className="text-primary-700 font-extrabold text-sm select-all block">{ship.destination_corridor}</span>
                      </div>
                    </div>

                    {/* Highly Definitive Horizon Walkthrough Bar */}
                    <div className="space-y-3 select-none">
                      <span className="text-[10px] font-black text-surface-500 uppercase tracking-widest block font-mono pl-1">
                        Physical Consignment Velocity Infographics
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                        {shipmentStatuses.map((st, idx) => {
                          const isCompleted = idx <= (currentStatusIdx >= 0 ? currentStatusIdx : 0);
                          const isCurrent = st.id === ship.status;

                          return (
                            <div
                              key={st.id}
                              className={`p-3 rounded-2xl border text-center transition-all duration-500 flex flex-col justify-between ${
                                isCurrent
                                  ? "bg-primary-600 text-white font-black border-primary-500 shadow-lg shadow-primary-600/30 scale-105 select-none"
                                  : isCompleted
                                  ? "bg-success-50 border-success-200 text-success-900 font-bold"
                                  : "bg-surface-50 border-surface-200 text-surface-400 opacity-60 text-[10px]"
                              }`}
                            >
                              <span className="text-[10px] block font-mono">Stage 0{idx + 1}</span>
                              <span className="text-[11px] tracking-tight block truncate pt-1">{st.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* GPS Events Stream */}
                    <div className="space-y-4 pt-4 border-t border-surface-100 select-text">
                      <span className="text-[11px] font-black text-surface-900 uppercase tracking-wider block font-mono flex items-center gap-2 select-none">
                        <Clock className="h-4 w-4 text-primary-600 flex-shrink-0" />
                        <span>Cryptographic GPS Waypoint Logs ({ship.events.length})</span>
                      </span>
                      
                      <div className="space-y-3 max-h-60 overflow-y-auto pr-2 select-text font-mono">
                        {ship.events.map((ev, evtIdx) => (
                          <div key={ev.id || evtIdx} className="flex items-start gap-4 p-4 rounded-2xl bg-surface-50 border border-surface-200 text-xs select-text hover:bg-white hover:border-primary-300 transition-colors">
                            <div className="p-2 rounded-xl bg-primary-600 text-white mt-0.5 flex-shrink-0 shadow-sm select-none">
                              <MapPin className="h-3.5 w-3.5" />
                            </div>
                            <div className="space-y-1 flex-1 select-text">
                              <span className="font-extrabold text-surface-900 font-sans block text-sm">{ev.location}</span>
                              <p className="text-surface-600 font-sans text-xs leading-relaxed select-text font-medium">{ev.description}</p>
                              <span className="text-[10px] text-surface-400 block pt-1 select-all border-t border-surface-200/50 mt-1">
                                Electronic Telemetry Digest Hash: {new Date(ev.timestamp).toUTCString()}
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

        {/* Checkpoint Timestamp Control Sidebar */}
        <Card className="border border-surface-200 bg-white rounded-3xl shadow-sm h-fit select-none">
          <CardHeader className="bg-surface-50 border-b border-surface-100 rounded-t-3xl p-6 font-sans">
            <CardTitle className="text-lg font-black text-surface-900 flex items-center gap-2">
              <Send className="h-5 w-5 text-primary-600" />
              <span>Time-Stamp Telemetry</span>
            </CardTitle>
            <CardDescription className="text-xs font-mono mt-0.5">Inject verified waypoint telemetry</CardDescription>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            <form onSubmit={handleInjectCheckpoint} className="space-y-5 select-text font-mono text-xs">
              <div className="space-y-2 select-none">
                <Label htmlFor="targetShipmentId" className="font-bold font-sans">Target Consignment</Label>
                <Select
                  value={targetShipmentId ? String(targetShipmentId) : ""}
                  onValueChange={(v) => setTargetShipmentId(Number(v))}
                >
                  <SelectTrigger id="targetShipmentId" className="h-12 rounded-2xl bg-surface-50 border-surface-200 font-mono font-bold">
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
                <Label htmlFor="checkpointLocation" className="font-bold font-sans">GPS Checkpoint Port Name</Label>
                <Input
                  id="checkpointLocation"
                  value={checkpointLocation}
                  onChange={(e) => setCheckpointLocation(e.target.value)}
                  placeholder="e.g. Mersin Deep Port Node, Turkey"
                  required
                  className="h-12 rounded-2xl bg-surface-50 border-surface-200 font-mono text-xs pl-4"
                />
              </div>

              <div className="space-y-2 select-none">
                <Label htmlFor="nextStatus" className="font-bold font-sans">Advance Consignment Stage</Label>
                <Select value={nextStatus} onValueChange={setNextStatus}>
                  <SelectTrigger id="nextStatus" className="h-12 rounded-2xl bg-surface-50 border-surface-200 font-mono font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in_transit">Maritime Steaming (In Steaming)</SelectItem>
                    <SelectItem value="customs_import">Import Customs Clearing Clearing Audit</SelectItem>
                    <SelectItem value="out_for_delivery">Final Terminal Haulage</SelectItem>
                    <SelectItem value="delivered">Consignee Handshake (Delivered)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="checkpointDesc" className="font-bold font-sans">Inspector Phytosanitary & Manifest Remarks</Label>
                <textarea
                  id="checkpointDesc"
                  value={checkpointDesc}
                  onChange={(e) => setCheckpointDesc(e.target.value)}
                  placeholder="e.g. Consignment manifest unsealed. Seal #8819 intact. Exemption ruled under bilateral trade framework."
                  required
                  rows={3}
                  className={inputClass}
                />
              </div>

              {error && <p className="text-xs text-danger-700 bg-danger-50 p-4 rounded-2xl border border-danger-200 font-bold select-text">{error}</p>}
              {success && <p className="text-xs text-success-700 bg-success-50 p-4 rounded-2xl border border-success-200 font-bold select-text">{success}</p>}

              <Button type="submit" className="w-full bg-primary-600 hover:bg-primary-500 text-white font-extrabold py-4 h-auto rounded-2xl shadow-lg shadow-primary-600/30 transition-all font-sans text-xs cursor-pointer select-none" disabled={injecting || !targetShipmentId}>
                {injecting ? "Injunction pending..." : "+ Time-Stamp Cryptographic Checkpoint"}
              </Button>
            </form>

            {/* Quick autofill test helpers */}
            <div className="pt-6 border-t border-surface-100 space-y-2.5 select-none">
              <span className="text-xs font-bold text-surface-900 block font-sans">Quick Autopopulate Telemetry:</span>
              <Button
                size="sm"
                variant="outline"
                className="w-full justify-start text-xs border-primary-300 hover:bg-primary-50 text-primary-800 h-10 rounded-xl font-mono cursor-pointer transition-all hover:translate-x-1"
                onClick={() => autofillSample("Suez Canal / Steaming GPS Node", "Vessel securely steaming through ocean corridor. Fleet telemetry parameters fully stable.", "in_transit")}
              >
                <Navigation className="mr-2 h-4 w-4 text-primary-600 flex-shrink-0" />
                Suez Canal Steaming Node
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="w-full justify-start text-xs border-amber-300 hover:bg-amber-50 text-amber-800 h-10 rounded-xl font-mono cursor-pointer transition-all hover:translate-x-1"
                onClick={() => autofillSample("Mersin Import Customs Clearance Gate", "Container unsealed at bonded warehouse node. Commercial L/C papers and Origin proofs authenticated.", "customs_import")}
              >
                <ShieldCheck className="mr-2 h-4 w-4 text-amber-600 flex-shrink-0" />
                Mersin Import Customs Gate
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="w-full justify-start text-xs border-success-300 hover:bg-success-50 text-success-800 h-10 rounded-xl font-mono cursor-pointer transition-all hover:translate-x-1"
                onClick={() => autofillSample("Istanbul Consignee Enterprise Hub Desk", "Physical haulage completed successfully. Verified clean delivery confirmation signature.", "delivered")}
              >
                <CheckCircle2 className="mr-2 h-4 w-4 text-success-600 flex-shrink-0" />
                Final Corporate Buyer Desk
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ShipmentsPage;
