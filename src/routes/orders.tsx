import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  ClipboardCheck,
  Truck,
  Shield,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  DollarSign,
  Package,
  Lock,
  Unlock,
  RotateCcw,
  MapPin,
  CreditCard,
  FileText,
  ArrowRight
} from "lucide-react";
import { getOrders, createOrderFromPreDeal, createPayment, actOnPayment, type Order } from "@/lib/api";

export const Route = createFileRoute("/orders")({
  component: OrdersPage,
});

const statusConfig: Record<string, { label: string; bg: string; text: string; icon: any; desc: string }> = {
  pending: { label: "Pending", bg: "bg-surface-100", text: "text-surface-600", icon: Clock, desc: "Awaiting confirmation" },
  confirmed: { label: "Confirmed", bg: "bg-primary-50", text: "text-primary-700", icon: CheckCircle2, desc: "Order confirmed, payment pending" },
  paid: { label: "Paid", bg: "bg-success-50", text: "text-success-700", icon: DollarSign, desc: "Payment received" },
  in_transit: { label: "In Transit", bg: "bg-warning-50", text: "text-warning-700", icon: Truck, desc: "Shipment in progress" },
  delivered: { label: "Delivered", bg: "bg-success-50", text: "text-success-700", icon: Package, desc: "Goods delivered" },
  completed: { label: "Completed", bg: "bg-success-50", text: "text-success-700", icon: CheckCircle2, desc: "Trade complete" },
  cancelled: { label: "Cancelled", bg: "bg-danger-50", text: "text-danger-700", icon: AlertCircle, desc: "Order cancelled" },
  disputed: { label: "Disputed", bg: "bg-danger-50", text: "text-danger-700", icon: AlertCircle, desc: "Under dispute resolution" },
};

const paymentConfig: Record<string, { label: string; bg: string; text: string }> = {
  pending: { label: "Pending", bg: "bg-surface-100", text: "text-surface-600" },
  held: { label: "In Escrow", bg: "bg-primary-50", text: "text-primary-700" },
  released: { label: "Released", bg: "bg-success-50", text: "text-success-700" },
  refunded: { label: "Refunded", bg: "bg-danger-50", text: "text-danger-700" },
  failed: { label: "Failed", bg: "bg-danger-50", text: "text-danger-700" },
};

function OrderCard({ order, onUpdate }: { order: Order; onUpdate: () => void }) {
  const [showDetails, setShowDetails] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [conditionsMet, setConditionsMet] = useState(false);

  const status = statusConfig[order.status] || statusConfig.pending;
  const payment = paymentConfig[order.payment_status] || paymentConfig.pending;
  const StatusIcon = status.icon;

  async function handlePay() {
    setProcessing(true);
    try {
      await createPayment(order.id, order.payment_method, order.total_value, order.currency);
      onUpdate();
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(false);
    }
  }

  async function handleRelease() {
    if (!order.payments.length) return;
    setProcessing(true);
    try {
      await actOnPayment(order.id, order.payments[0].id, "release");
      onUpdate();
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(false);
    }
  }

  async function handleRefund() {
    if (!order.payments.length) return;
    setProcessing(true);
    try {
      await actOnPayment(order.id, order.payments[0].id, "refund");
      onUpdate();
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-surface-200 card-hover overflow-hidden">
      {/* Header */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl ${status.bg} flex items-center justify-center`}>
              <StatusIcon className={`w-6 h-6 ${status.text}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-surface-800">{order.order_number}</h3>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${status.bg} ${status.text}`}>
                  {status.label}
                </span>
              </div>
              <p className="text-xs text-surface-500 mt-0.5">{status.desc}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-surface-800">${Number(order.total_value).toFixed(2)}</p>
            <p className="text-xs text-surface-400">{order.currency}</p>
          </div>
        </div>

        {/* Product Info */}
        <div className="flex items-center gap-4 p-4 bg-surface-50 rounded-xl mb-4">
          <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
            <Package className="w-6 h-6 text-primary-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-surface-800">{order.items[0]?.product?.name || "B2B Commodity"}</p>
            <div className="flex items-center gap-3 mt-1 text-xs text-surface-500">
              <span>{order.items[0]?.quantity} {order.items[0]?.unit}</span>
              <span className="text-surface-300">|</span>
              <span>${Number(order.items[0]?.unit_price).toFixed(2)}/{order.items[0]?.unit}</span>
              <span className="text-surface-300">|</span>
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {order.origin_country} → {order.destination_country}</span>
            </div>
          </div>
        </div>

        {/* Trade Details */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div className="bg-surface-50 rounded-xl p-3">
            <p className="text-[10px] text-surface-400 uppercase tracking-wider mb-1">Incoterm</p>
            <p className="text-sm font-bold text-surface-800">{order.incoterm}</p>
          </div>
          <div className="bg-surface-50 rounded-xl p-3">
            <p className="text-[10px] text-surface-400 uppercase tracking-wider mb-1">Payment</p>
            <p className="text-sm font-bold text-surface-800">{order.payment_method}</p>
          </div>
          <div className="bg-surface-50 rounded-xl p-3">
            <p className="text-[10px] text-surface-400 uppercase tracking-wider mb-1">Platform Fee</p>
            <p className="text-sm font-bold text-surface-800">${Number(order.platform_fee).toFixed(2)}</p>
          </div>
          <div className="bg-surface-50 rounded-xl p-3">
            <p className="text-[10px] text-surface-400 uppercase tracking-wider mb-1">Payment Status</p>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${payment.bg} ${payment.text}`}>
              {payment.label}
            </span>
          </div>
        </div>

        {/* Escrow Info */}
        {order.payment_status === "held" && (
          <div className="flex items-start gap-3 p-4 bg-primary-50 border border-primary-200 rounded-xl mb-4">
            <Lock className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-primary-800">Funds Secured in Escrow</p>
              <p className="text-xs text-primary-600 mt-0.5">
                ${Number(order.total_value).toFixed(2)} is held in neutral custody. Release requires verified shipping documents and quality inspection.
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          {order.status === "pending" && order.payment_status === "pending" && (
            <button
              onClick={handlePay}
              disabled={processing}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 disabled:opacity-50 transition-colors"
            >
              <CreditCard className="w-4 h-4" />
              {processing ? "Processing..." : "Pay & Secure Escrow"}
            </button>
          )}

          {order.payment_status === "held" && (
            <>
              <div className="flex items-center gap-2 p-3 bg-surface-50 rounded-xl border border-surface-200 flex-1">
                <input
                  type="checkbox"
                  id={`conditions-${order.id}`}
                  checked={conditionsMet}
                  onChange={(e) => setConditionsMet(e.target.checked)}
                  className="w-4 h-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor={`conditions-${order.id}`} className="text-xs text-surface-600 cursor-pointer">
                  I confirm shipping docs & SGS inspection passed
                </label>
              </div>
              <button
                onClick={handleRelease}
                disabled={processing || !conditionsMet}
                className="flex items-center gap-2 px-4 py-2 bg-success-600 text-white rounded-xl text-sm font-semibold hover:bg-success-700 disabled:opacity-50 transition-colors"
              >
                <Unlock className="w-4 h-4" />
                {processing ? "Releasing..." : "Release Funds"}
              </button>
              <button
                onClick={handleRefund}
                disabled={processing}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-surface-200 text-surface-600 rounded-xl text-sm font-semibold hover:bg-surface-50 disabled:opacity-50 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Refund
              </button>
            </>
          )}

          {order.payment_status === "released" && (
            <div className="flex items-center gap-2 px-4 py-2 bg-success-50 text-success-700 rounded-xl text-sm font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              Funds Released — Trade Complete
            </div>
          )}

          {order.payment_status === "refunded" && (
            <div className="flex items-center gap-2 px-4 py-2 bg-danger-50 text-danger-700 rounded-xl text-sm font-semibold">
              <AlertCircle className="w-4 h-4" />
              Refunded to Buyer
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  async function loadOrders() {
    setLoading(true);
    try {
      const data = await getOrders();
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  const stats = {
    total: orders.length,
    active: orders.filter((o) => ["confirmed", "paid", "in_transit"].includes(o.status)).length,
    completed: orders.filter((o) => o.status === "completed").length,
    escrow: orders.filter((o) => o.payment_status === "held").length,
  };

  return (
    <div className="space-y-6 animate-slide-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-surface-800">Orders & Shipments</h1>
        <p className="text-sm text-surface-500 mt-0.5">Track and manage your trade transactions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-surface-200">
          <div className="flex items-center gap-2 mb-2">
            <ClipboardCheck className="w-4 h-4 text-primary-500" />
            <span className="text-xs text-surface-500">Total Orders</span>
          </div>
          <p className="text-2xl font-bold text-surface-800">{stats.total}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-surface-200">
          <div className="flex items-center gap-2 mb-2">
            <Truck className="w-4 h-4 text-warning-500" />
            <span className="text-xs text-surface-500">In Progress</span>
          </div>
          <p className="text-2xl font-bold text-warning-600">{stats.active}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-surface-200">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-success-500" />
            <span className="text-xs text-surface-500">Completed</span>
          </div>
          <p className="text-2xl font-bold text-success-600">{stats.completed}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-surface-200">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-primary-500" />
            <span className="text-xs text-surface-500">In Escrow</span>
          </div>
          <p className="text-2xl font-bold text-primary-600">{stats.escrow}</p>
        </div>
      </div>

      {/* Escrow Explainer */}
      <div className="bg-gradient-to-r from-primary-50 to-indigo-50 rounded-2xl p-6 border border-primary-100">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm flex-shrink-0">
            <Shield className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h3 className="font-bold text-surface-800 mb-1">Secure Escrow Protection</h3>
            <p className="text-sm text-surface-600 leading-relaxed">
              All transactions are protected by our institutional neutral escrow system. Funds are held securely until 
              shipping documents and SGS quality inspections are verified. This protects both buyers and sellers 
              across Iraq, Iran, Turkey, and global corridors.
            </p>
            <div className="flex flex-wrap gap-4 mt-4">
              <div className="flex items-center gap-2 text-xs text-surface-600">
                <Lock className="w-3.5 h-3.5 text-primary-500" /> Funds Locked
              </div>
              <div className="flex items-center gap-2 text-xs text-surface-600">
                <FileText className="w-3.5 h-3.5 text-primary-500" /> Doc Verification
              </div>
              <div className="flex items-center gap-2 text-xs text-surface-600">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary-500" /> SGS Inspection
              </div>
              <div className="flex items-center gap-2 text-xs text-surface-600">
                <Unlock className="w-3.5 h-3.5 text-primary-500" /> Conditional Release
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {["all", "confirmed", "in_transit", "completed", "cancelled"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              filter === f
                ? "bg-primary-600 text-white shadow-sm"
                : "bg-white border border-surface-200 text-surface-600 hover:bg-surface-50"
            }`}
          >
            {f === "all" ? "All Orders" : f.replace("_", " ").replace(/\w/g, (l) => l.toUpperCase())}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-surface-200 animate-pulse">
              <div className="flex gap-3 mb-4">
                <div className="w-12 h-12 bg-surface-200 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-surface-200 rounded w-1/4" />
                  <div className="h-3 bg-surface-200 rounded w-1/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-surface-200 text-center">
          <ClipboardCheck className="w-12 h-12 text-surface-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-surface-700 mb-1">No orders yet</h3>
          <p className="text-sm text-surface-500 mb-6">Accept a pre-deal to create your first order</p>
        </div>
      ) : (
        <div className="space-y-4 stagger-children">
          {filtered.map((order) => (
            <OrderCard key={order.id} order={order} onUpdate={loadOrders} />
          ))}
        </div>
      )}
    </div>
  );
}
