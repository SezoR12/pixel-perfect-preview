import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  Package,
  Handshake,
  ClipboardCheck,
  Truck,
  ArrowRight,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Zap,
  BarChart3,
  MapPin,
  DollarSign,
  ShieldCheck
} from "lucide-react";
import { getDashboard, getPreDeals, getOrders, getNotifications, type PreDeal, type Order, type DashboardStats } from "@/lib/api";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

const quickActions = [
  { label: "List New Product", path: "/products", icon: Package, color: "bg-primary-50 text-primary-600" },
  { label: "Find Deals", path: "/deals", icon: Sparkles, color: "bg-accent-50 text-accent-600" },
  { label: "Track Shipment", path: "/logistics", icon: Truck, color: "bg-success-50 text-success-600" },
  { label: "View Analytics", path: "/analytics", icon: BarChart3, color: "bg-indigo-50 text-indigo-600" },
];

const workflowSteps = [
  { id: 1, title: "List or Browse", desc: "Add products or explore demands", icon: Package, status: "active" },
  { id: 2, title: "Smart Matching", desc: "Get matched with best partners", icon: Sparkles, status: "active" },
  { id: 3, title: "Review Deals", desc: "Evaluate pre-deal proposals", icon: Handshake, status: "pending" },
  { id: 4, title: "Confirm Order", desc: "Lock in with escrow protection", icon: ClipboardCheck, status: "pending" },
  { id: 5, title: "Ship & Track", desc: "Monitor haulage in real-time", icon: Truck, status: "pending" },
];

function StatCard({ title, value, change, changeType, icon: Icon, subtitle }: any) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-surface-200 card-hover">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${changeType === "up" ? "bg-success-50" : changeType === "down" ? "bg-danger-50" : "bg-primary-50"}`}>
          <Icon className={`w-5 h-5 ${changeType === "up" ? "text-success-600" : changeType === "down" ? "text-danger-600" : "text-primary-600"}`} />
        </div>
        {change && (
          <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${changeType === "up" ? "bg-success-50 text-success-700" : "bg-danger-50 text-danger-700"}`}>
            {changeType === "up" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {change}
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-surface-800">{value}</p>
      <p className="text-sm text-surface-500 mt-0.5">{title}</p>
      {subtitle && <p className="text-xs text-surface-400 mt-1">{subtitle}</p>}
    </div>
  );
}

function DealCard({ deal }: { deal: PreDeal }) {
  const score = parseFloat(deal.match_score);
  const scoreColor = score >= 90 ? "bg-success-500" : score >= 75 ? "bg-primary-500" : "bg-warning-500";
  const isAccepted = deal.status === "accepted";
  const isPending = deal.status === "pending";

  return (
    <div className="bg-white rounded-2xl p-5 border border-surface-200 card-hover group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl ${scoreColor} bg-opacity-10 flex items-center justify-center`}>
            <span className={`text-sm font-bold ${score >= 90 ? "text-success-700" : score >= 75 ? "text-primary-700" : "text-warning-700"}`}>
              {deal.match_score}
            </span>
          </div>
          <div>
            <h4 className="font-semibold text-surface-800 text-sm">{deal.product?.name || "Cross-Border Commodity"}</h4>
            <p className="text-xs text-surface-400 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3" />
              {deal.product?.origin} → {deal.buyer?.country}
            </p>
          </div>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
          isAccepted ? "bg-success-50 text-success-700" :
          isPending ? "bg-warning-50 text-warning-700" :
          "bg-surface-100 text-surface-500"
        }`}>
          {isAccepted ? "Accepted" : isPending ? "Pending" : deal.status}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-surface-50 rounded-xl p-2.5">
          <p className="text-[10px] text-surface-400 uppercase tracking-wider">Quantity</p>
          <p className="text-sm font-semibold text-surface-800">{deal.quantity} {deal.product?.unit}</p>
        </div>
        <div className="bg-surface-50 rounded-xl p-2.5">
          <p className="text-[10px] text-surface-400 uppercase tracking-wider">Price</p>
          <p className="text-sm font-semibold text-surface-800">${deal.suggested_price}/{deal.product?.unit}</p>
        </div>
        <div className="bg-surface-50 rounded-xl p-2.5">
          <p className="text-[10px] text-surface-400 uppercase tracking-wider">Payment</p>
          <p className="text-sm font-semibold text-surface-800">{deal.payment_terms}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-surface-500">
          <Clock className="w-3.5 h-3.5" />
          Expires {new Date(deal.expires_at).toLocaleDateString()}
        </div>
        <Link
          to="/deals"
          className="flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors"
        >
          Review <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  const statusConfig: Record<string, { bg: string; text: string; icon: any }> = {
    confirmed: { bg: "bg-primary-50", text: "text-primary-700", icon: CheckCircle2 },
    completed: { bg: "bg-success-50", text: "text-success-700", icon: CheckCircle2 },
    in_transit: { bg: "bg-warning-50", text: "text-warning-700", icon: Truck },
    pending: { bg: "bg-surface-100", text: "text-surface-600", icon: Clock },
  };
  const config = statusConfig[order.status] || statusConfig.pending;
  const StatusIcon = config.icon;

  return (
    <div className="bg-white rounded-2xl p-5 border border-surface-200 card-hover">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center`}>
            <StatusIcon className={`w-5 h-5 ${config.text}`} />
          </div>
          <div>
            <p className="text-sm font-semibold text-surface-800">{order.order_number}</p>
            <p className="text-xs text-surface-400">{order.items[0]?.product?.name || "B2B Commodity"}</p>
          </div>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${config.bg} ${config.text}`}>
          {order.status.replace("_", " ").toUpperCase()}
        </span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <span className="text-surface-500">{order.items[0]?.quantity} {order.items[0]?.unit}</span>
          <span className="text-surface-300">|</span>
          <span className="font-semibold text-surface-800">${Number(order.total_value).toFixed(2)}</span>
        </div>
        <Link to="/orders" className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1">
          Details <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [deals, setDeals] = useState<PreDeal[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getDashboard(), getPreDeals(), getOrders()])
      .then(([s, d, o]) => {
        setStats(s);
        setDeals(d.slice(0, 3));
        setOrders(o.slice(0, 3));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center gap-3 text-surface-400">
          <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          Loading your trade dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-slide-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-slate-900 rounded-3xl p-8 lg:p-10 text-white relative overflow-hidden shadow-2xl border border-white/10 select-none">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-500/10 rounded-full translate-y-1/2 -translate-x-1/3 blur-xl" />
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2.5 font-mono text-xs">
            <Badge className="bg-yellow-400 text-black font-black uppercase text-[10px] tracking-widest px-3 py-1 shadow-md">Sovereign Command Desk</Badge>
            <span className="text-primary-200 font-bold hidden sm:inline">● Shipped Hybrid Enterprise Trajectory Engine</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-black tracking-tight pt-1">Institutional Deal Command Center</h1>
          <p className="text-primary-100 max-w-2xl text-xs lg:text-sm leading-relaxed font-sans">
            Your smart heuristic trade terminal is actively correlating purchasing queries and physical spot ledgers across the primary Iraq, Iran, Turkey, and EU cross-border lanes.
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.path}
              to={action.path}
              className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-surface-200 card-hover group"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${action.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-sm font-semibold text-surface-700 group-hover:text-surface-900">{action.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Products"
          value={stats?.total_products || 0}
          change="+2"
          changeType="up"
          icon={Package}
          subtitle="Listed for buyers"
        />
        <StatCard
          title="Active Pre-Deals"
          value={stats?.active_pre_deals || 0}
          change="+1"
          changeType="up"
          icon={Handshake}
          subtitle="Awaiting your review"
        />
        <StatCard
          title="Confirmed Orders"
          value={stats?.accepted_deals || 0}
          change="0"
          changeType="neutral"
          icon={ClipboardCheck}
          subtitle="In progress"
        />
        <StatCard
          title="Market Insights"
          value="3"
          change="New"
          changeType="up"
          icon={BarChart3}
          subtitle="Price predictions ready"
        />
      </div>

      {/* Workflow Progress */}
      <div className="bg-white rounded-2xl p-6 border border-surface-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-surface-800">Your Trade Workflow</h3>
            <p className="text-sm text-surface-500 mt-0.5">Follow these steps to complete a successful trade</p>
          </div>
          <Link to="/deals" className="text-sm font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1">
            Continue <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-5 gap-2 lg:gap-4">
          {workflowSteps.map((step, idx) => {
            const Icon = step.icon;
            const isActive = step.status === "active";
            const isCompleted = idx < workflowSteps.findIndex((s) => s.status === "pending");
            return (
              <div key={step.id} className="relative text-center">
                {idx < workflowSteps.length - 1 && (
                  <div className={`hidden lg:block absolute top-5 left-[60%] w-[80%] h-0.5 ${isCompleted || isActive ? "bg-primary-500" : "bg-surface-200"}`} />
                )}
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 relative z-10
                  ${isCompleted ? "bg-primary-500 text-white" :
                    isActive ? "bg-primary-100 text-primary-600 ring-2 ring-primary-500 ring-offset-2" :
                    "bg-surface-100 text-surface-400"}
                `}>
                  {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <p className={`text-xs font-semibold ${isActive || isCompleted ? "text-surface-800" : "text-surface-400"}`}>{step.title}</p>
                <p className="text-[10px] text-surface-400 hidden lg:block mt-0.5">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Deals */}
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-surface-100 p-4 rounded-2xl border border-surface-200">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary-600" />
              <h3 className="text-base font-extrabold text-surface-800 font-sans">Smart-Matched Pre-Deals</h3>
            </div>
            <Link to="/deals" className="text-xs font-black text-primary-600 hover:text-primary-700 flex items-center gap-1 font-mono uppercase tracking-wider bg-white px-3 py-1.5 rounded-full shadow-sm">
              <span>View Hub Desk</span> <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-3 stagger-children">
            {deals.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 border border-surface-200 text-center shadow-sm">
                <Sparkles className="w-12 h-12 text-primary-400 mx-auto mb-3 animate-spin" style={{ animationDuration: "10s" }} />
                <p className="text-surface-800 font-extrabold text-base">Zero Smart Deals Generated</p>
                <p className="text-xs text-surface-500 mt-1 leading-relaxed">Add verified target inventory or commercial purchasing inquiries to get matched automatically.</p>
                <Link to="/products" className="inline-flex items-center gap-2 mt-5 px-6 py-3 bg-primary-600 text-white rounded-2xl text-xs font-bold hover:bg-primary-500 transition-all shadow-md">
                  <Package className="w-4 h-4" /> List Commodity Product
                </Link>
              </div>
            ) : (
              deals.map((deal) => <DealCard key={deal.id} deal={deal} />)
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-surface-100 p-4 rounded-2xl border border-surface-200">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-accent-600" />
              <h3 className="text-base font-extrabold text-surface-800 font-sans">Active Orders & Custody Separate Separate Payout</h3>
            </div>
            <Link to="/orders" className="text-xs font-black text-accent-600 hover:text-accent-700 flex items-center gap-1 font-mono uppercase tracking-wider bg-white px-3 py-1.5 rounded-full shadow-sm">
              <span>View Escrow Paper</span> <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-3 stagger-children">
            {orders.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 border border-surface-200 text-center shadow-sm">
                <ClipboardCheck className="w-12 h-12 text-accent-400 mx-auto mb-3 animate-bounce" />
                <p className="text-surface-800 font-extrabold text-base">Zero Active Transaction Manifests Manifests Manifests</p>
                <p className="text-xs text-surface-500 mt-1 leading-relaxed">Accept any pre-deal from your deal stream to immediately initialize formal neutral custody separate Payout handshakes.</p>
                <Link to="/deals" className="inline-flex items-center gap-2 mt-5 px-6 py-3 bg-accent-600 text-white rounded-2xl text-xs font-bold hover:bg-accent-500 transition-all shadow-md">
                  <Handshake className="w-4 h-4" /> Inspect Safe Deals Hub
                </Link>
              </div>
            ) : (
              orders.map((order) => <OrderCard key={order.id} order={order} />)
            )}
          </div>
        </div>
      </div>

      {/* Compliance Status */}
      <div className="bg-white rounded-2xl p-6 border border-surface-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-success-50 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-success-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-surface-800">Compliance Status</h3>
            <p className="text-sm text-surface-500">Your account verification and sanctions screening</p>
          </div>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-4 bg-success-50 rounded-xl border border-success-200">
            <CheckCircle2 className="w-5 h-5 text-success-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-success-800">Identity Verified</p>
              <p className="text-xs text-success-600">KYC approved</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-success-50 rounded-xl border border-success-200">
            <CheckCircle2 className="w-5 h-5 text-success-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-success-800">Sanctions Cleared</p>
              <p className="text-xs text-success-600">Zero SDN hits</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-primary-50 rounded-xl border border-primary-200">
            <ShieldCheck className="w-5 h-5 text-primary-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-primary-800">Escrow Protected</p>
              <p className="text-xs text-primary-600">All transactions secured</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
