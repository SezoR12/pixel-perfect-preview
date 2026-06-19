import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Truck,
  MapPin,
  Clock,
  CheckCircle2,
  Package,
  AlertCircle,
  ChevronRight,
  Navigation,
  Calendar,
  TrendingUp,
  ShieldCheck
} from "lucide-react";
import { getShipments, type Shipment } from "@/lib/api";

export const Route = createFileRoute("/logistics")({
  component: LogisticsPage,
});

const statusSteps = [
  { id: "label_created", label: "Label Created", icon: Package },
  { id: "picked_up", label: "Picked Up", icon: Truck },
  { id: "customs_export", label: "Export Customs", icon: ShieldCheck },
  { id: "in_transit", label: "In Transit", icon: Navigation },
  { id: "customs_import", label: "Import Customs", icon: ShieldCheck },
  { id: "out_for_delivery", label: "Out for Delivery", icon: Truck },
  { id: "delivered", label: "Delivered", icon: CheckCircle2 },
];

function ShipmentCard({ shipment }: { shipment: Shipment }) {
  const [expanded, setExpanded] = useState(false);
  const currentStepIndex = statusSteps.findIndex((s) => s.id === shipment.status);
  const progress = ((currentStepIndex + 1) / statusSteps.length) * 100;

  return (
    <div className="bg-white rounded-2xl border border-surface-200 card-hover overflow-hidden">
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center">
              <Truck className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-surface-800 text-sm">{shipment.tracking_number}</h3>
                <span className="text-xs text-surface-400">{shipment.carrier}</span>
              </div>
              <p className="text-xs text-surface-500 mt-0.5">
                {shipment.origin_corridor} → {shipment.destination_corridor}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
              shipment.status === "delivered" ? "bg-success-50 text-success-700" :
              shipment.status === "in_transit" ? "bg-primary-50 text-primary-700" :
              "bg-warning-50 text-warning-700"
            }`}>
              {shipment.status.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex justify-between text-[10px] text-surface-400 mb-1.5">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-surface-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Route info */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-surface-50 rounded-xl p-3">
            <p className="text-[10px] text-surface-400 uppercase tracking-wider mb-1">Origin</p>
            <p className="text-sm font-semibold text-surface-800">{shipment.origin_corridor}</p>
          </div>
          <div className="bg-surface-50 rounded-xl p-3">
            <p className="text-[10px] text-surface-400 uppercase tracking-wider mb-1">Destination</p>
            <p className="text-sm font-semibold text-surface-800">{shipment.destination_corridor}</p>
          </div>
          <div className="bg-surface-50 rounded-xl p-3">
            <p className="text-[10px] text-surface-400 uppercase tracking-wider mb-1">Est. Delivery</p>
            <p className="text-sm font-semibold text-surface-800">
              {shipment.estimated_delivery
                ? new Date(shipment.estimated_delivery).toLocaleDateString()
                : "Calculating..."}
            </p>
          </div>
        </div>

        {/* Timeline */}
        {expanded && (
          <div className="border-t border-surface-100 pt-4 animate-slide-in">
            <div className="relative">
              {statusSteps.map((step, idx) => {
                const isCompleted = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;
                const StepIcon = step.icon;
                return (
                  <div key={step.id} className="flex gap-4 pb-6 last:pb-0">
                    <div className="flex flex-col items-center">
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center z-10
                        ${isCompleted ? "bg-primary-500 text-white" :
                          "bg-surface-200 text-surface-400"}
                        ${isCurrent ? "ring-4 ring-primary-100" : ""}
                      `}>
                        <StepIcon className="w-4 h-4" />
                      </div>
                      {idx < statusSteps.length - 1 && (
                        <div className={`w-0.5 flex-1 mt-1 ${isCompleted && idx < currentStepIndex ? "bg-primary-300" : "bg-surface-200"}`} />
                      )}
                    </div>
                    <div className="pb-2">
                      <p className={`text-sm font-semibold ${isCompleted ? "text-surface-800" : "text-surface-400"}`}>
                        {step.label}
                      </p>
                      {isCurrent && (
                        <p className="text-xs text-primary-600 mt-0.5">Current status</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Event log */}
            {shipment.events && shipment.events.length > 0 && (
              <div className="mt-4 p-4 bg-surface-50 rounded-xl">
                <p className="text-xs font-semibold text-surface-600 mb-3">Tracking Events</p>
                <div className="space-y-3">
                  {shipment.events.map((event, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary-400 mt-1.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-surface-600">{event.description}</p>
                        <p className="text-[10px] text-surface-400 mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {event.location} · {new Date(event.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors"
        >
          {expanded ? "Hide Details" : "View Tracking Timeline"}
          <ChevronRight className={`w-3.5 h-3.5 transition-transform ${expanded ? "rotate-90" : ""}`} />
        </button>
      </div>
    </div>
  );
}

function LogisticsPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getShipments()
      .then(setShipments)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const stats = {
    total: shipments.length,
    inTransit: shipments.filter((s) => s.status === "in_transit").length,
    delivered: shipments.filter((s) => s.status === "delivered").length,
    pending: shipments.filter((s) => ["label_created", "picked_up"].includes(s.status)).length,
  };

  return (
    <div className="space-y-6 animate-slide-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-surface-800">Logistics & Tracking</h1>
        <p className="text-sm text-surface-500 mt-0.5">Monitor shipments across trade corridors in real-time</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-surface-200">
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-4 h-4 text-primary-500" />
            <span className="text-xs text-surface-500">Total Shipments</span>
          </div>
          <p className="text-2xl font-bold text-surface-800">{stats.total}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-surface-200">
          <div className="flex items-center gap-2 mb-2">
            <Navigation className="w-4 h-4 text-primary-500" />
            <span className="text-xs text-surface-500">In Transit</span>
          </div>
          <p className="text-2xl font-bold text-primary-600">{stats.inTransit}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-surface-200">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-success-500" />
            <span className="text-xs text-surface-500">Delivered</span>
          </div>
          <p className="text-2xl font-bold text-success-600">{stats.delivered}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-surface-200">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-warning-500" />
            <span className="text-xs text-surface-500">Pending</span>
          </div>
          <p className="text-2xl font-bold text-warning-600">{stats.pending}</p>
        </div>
      </div>

      {/* Active Corridors */}
      <div className="bg-gradient-to-r from-primary-50 to-indigo-50 rounded-2xl p-6 border border-primary-100">
        <div className="flex items-center gap-3 mb-4">
          <MapPin className="w-5 h-5 text-primary-600" />
          <h3 className="font-bold text-surface-800">Active Trade Corridors</h3>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 border border-primary-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-success-500" />
              <span className="text-xs font-semibold text-surface-700">Iraq → Turkey</span>
            </div>
            <p className="text-xs text-surface-500">Dates, Phosphate, Marble</p>
            <p className="text-[10px] text-surface-400 mt-1">Avg transit: 5-7 days</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-primary-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-primary-500" />
              <span className="text-xs font-semibold text-surface-700">Iran → Turkey / EU</span>
            </div>
            <p className="text-xs text-surface-500">Steel Scrap, Petrochemicals</p>
            <p className="text-[10px] text-surface-400 mt-1">Avg transit: 8-12 days</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-primary-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-accent-500" />
              <span className="text-xs font-semibold text-surface-700">Turkey → Global</span>
            </div>
            <p className="text-xs text-surface-500">Processed Commodities</p>
            <p className="text-[10px] text-surface-400 mt-1">Avg transit: 10-15 days</p>
          </div>
        </div>
      </div>

      {/* Shipments */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-surface-200 animate-pulse">
              <div className="h-4 bg-surface-200 rounded w-1/3 mb-4" />
              <div className="h-2 bg-surface-200 rounded mb-4" />
            </div>
          ))}
        </div>
      ) : shipments.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-surface-200 text-center">
          <Truck className="w-12 h-12 text-surface-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-surface-700 mb-1">No active shipments</h3>
          <p className="text-sm text-surface-500">Create an order to start tracking shipments</p>
        </div>
      ) : (
        <div className="space-y-4 stagger-children">
          {shipments.map((shipment) => (
            <ShipmentCard key={shipment.id} shipment={shipment} />
          ))}
        </div>
      )}
    </div>
  );
}
