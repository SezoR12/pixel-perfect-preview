import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Handshake,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  MapPin,
  DollarSign,
  Shield,
  ChevronRight,
  Zap,
  Filter,
  Star,
  ArrowRight,
  AlertCircle,
  Package
} from "lucide-react";
import { getPreDeals, actOnPreDeal, generatePreDeals, type PreDeal } from "@/lib/api";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/deals")({
  component: DealsPage,
});

const filters = [
  { id: "all", label: "All Deals" },
  { id: "pending", label: "Pending Review" },
  { id: "accepted", label: "Accepted" },
  { id: "rejected", label: "Declined" },
];

function DealCard({ deal, onAction }: { deal: PreDeal; onAction: () => void }) {
  const score = parseFloat(deal.match_score);
  const isPending = deal.status === "pending";
  const isAccepted = deal.status === "accepted";
  const isRejected = deal.status === "rejected";

  const scoreColor = score >= 90 ? "bg-success-500" : score >= 75 ? "bg-primary-500" : "bg-warning-500";
  const scoreBg = score >= 90 ? "bg-success-50" : score >= 75 ? "bg-primary-50" : "bg-warning-50";
  const scoreText = score >= 90 ? "text-success-700" : score >= 75 ? "text-primary-700" : "text-warning-700";

  async function handleAccept() {
    try {
      await actOnPreDeal(deal.id, "accept");
      onAction();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleReject() {
    try {
      await actOnPreDeal(deal.id, "reject");
      onAction();
    } catch (err) {
      console.error(err);
    }
  }

  const daysLeft = Math.ceil((new Date(deal.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <div className="bg-white rounded-2xl border border-surface-200 card-hover overflow-hidden">
      {/* Score bar */}
      <div className="h-1.5 bg-surface-100">
        <div
          className={`h-full ${scoreColor} transition-all duration-500`}
          style={{ width: `${score}%` }}
        />
      </div>

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-14 h-14 rounded-2xl ${scoreBg} flex items-center justify-center flex-shrink-0`}>
              <span className={`text-lg font-bold ${scoreText}`}>{deal.match_score}</span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${scoreBg} ${scoreText}`}>
                  <Star className="w-3 h-3" />
                  {score >= 90 ? "Excellent Match" : score >= 75 ? "Good Match" : "Fair Match"}
                </span>
                {deal.is_exclusive && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-accent-50 text-accent-700 uppercase tracking-wider">
                    Exclusive
                  </span>
                )}
              </div>
              <h3 className="font-semibold text-surface-800 text-sm">{deal.product?.name || "Cross-Border Commodity"}</h3>
            </div>
          </div>
          <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
            isAccepted ? "bg-success-50 text-success-700 border border-success-200" :
            isRejected ? "bg-danger-50 text-danger-700 border border-danger-200" :
            "bg-warning-50 text-warning-700 border border-warning-200"
          }`}>
            {isAccepted ? "Accepted" : isRejected ? "Declined" : "Pending Review"}
          </span>
        </div>

        {/* Route */}
        <div className="flex items-center gap-3 mb-4 p-3 bg-surface-50 rounded-xl">
          <div className="flex-1">
            <p className="text-xs text-surface-400 mb-0.5">Seller</p>
            <p className="text-sm font-semibold text-surface-700">{deal.seller?.name}</p>
            <p className="text-xs text-surface-500 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3" /> {deal.product?.origin}
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center">
              <ArrowRight className="w-4 h-4 text-primary-600" />
            </div>
            <span className="text-[10px] text-surface-400 mt-1">Trade Lane</span>
          </div>
          <div className="flex-1 text-right">
            <p className="text-xs text-surface-400 mb-0.5">Buyer</p>
            <p className="text-sm font-semibold text-surface-700">{deal.buyer?.name}</p>
            <p className="text-xs text-surface-500 flex items-center justify-end gap-1 mt-0.5">
              <MapPin className="w-3 h-3" /> {deal.buyer?.country}
            </p>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="bg-surface-50 rounded-xl p-3 text-center">
            <p className="text-[10px] text-surface-400 uppercase tracking-wider mb-1">Quantity</p>
            <p className="text-sm font-bold text-surface-800">{deal.quantity}</p>
            <p className="text-[10px] text-surface-500">{deal.product?.unit}</p>
          </div>
          <div className="bg-surface-50 rounded-xl p-3 text-center">
            <p className="text-[10px] text-surface-400 uppercase tracking-wider mb-1">Price</p>
            <p className="text-sm font-bold text-surface-800">${deal.suggested_price}</p>
            <p className="text-[10px] text-surface-500">per {deal.product?.unit}</p>
          </div>
          <div className="bg-surface-50 rounded-xl p-3 text-center">
            <p className="text-[10px] text-surface-400 uppercase tracking-wider mb-1">Shipping</p>
            <p className="text-sm font-bold text-surface-800">${deal.shipping_cost}</p>
            <p className="text-[10px] text-surface-500">estimated</p>
          </div>
          <div className="bg-surface-50 rounded-xl p-3 text-center">
            <p className="text-[10px] text-surface-400 uppercase tracking-wider mb-1">Payment</p>
            <p className="text-sm font-bold text-surface-800">{deal.payment_terms}</p>
            <p className="text-[10px] text-surface-500">terms</p>
          </div>
        </div>

        {/* Total & Expiry */}
        <div className="flex items-center justify-between mb-4 py-3 border-t border-surface-100">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-surface-400" />
            <span className="text-sm text-surface-500">Total Value:</span>
            <span className="text-lg font-bold text-surface-800">
              ${(parseFloat(deal.suggested_price) * deal.quantity).toFixed(2)}
            </span>
          </div>
          {isPending && (
            <div className="flex items-center gap-1.5 text-xs text-surface-500">
              <Clock className="w-3.5 h-3.5" />
              {daysLeft > 0 ? `${daysLeft} days left` : "Expired"}
            </div>
          )}
        </div>

        {/* Actions */}
        {isPending ? (
          <div className="flex gap-3">
            <button
              onClick={handleAccept}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-success-600 text-white rounded-xl text-sm font-semibold hover:bg-success-700 transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" /> Accept Deal
            </button>
            <button
              onClick={handleReject}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-surface-200 text-surface-600 rounded-xl text-sm font-semibold hover:bg-surface-50 transition-colors"
            >
              <XCircle className="w-4 h-4" /> Decline
            </button>
          </div>
        ) : isAccepted ? (
          <Link
            to="/orders"
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-primary-50 text-primary-700 rounded-xl text-sm font-semibold hover:bg-primary-100 transition-colors"
          >
            <Package className="w-4 h-4" /> View Order Details <ChevronRight className="w-4 h-4" />
          </Link>
        ) : (
          <div className="flex items-center justify-center gap-2 px-4 py-2.5 bg-surface-100 text-surface-500 rounded-xl text-sm">
            <XCircle className="w-4 h-4" /> Deal Declined
          </div>
        )}
      </div>
    </div>
  );
}

function DealsPage() {
  const [deals, setDeals] = useState<PreDeal[]>([]);
  const [filtered, setFiltered] = useState<PreDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [generating, setGenerating] = useState(false);

  async function loadDeals() {
    setLoading(true);
    try {
      const data = await getPreDeals();
      setDeals(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDeals();
  }, []);

  useEffect(() => {
    if (activeFilter === "all") {
      setFiltered(deals);
    } else {
      setFiltered(deals.filter((d) => d.status === activeFilter));
    }
  }, [activeFilter, deals]);

  async function handleGenerate() {
    setGenerating(true);
    try {
      await generatePreDeals();
      await loadDeals();
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  }

  const stats = {
    total: deals.length,
    pending: deals.filter((d) => d.status === "pending").length,
    accepted: deals.filter((d) => d.status === "accepted").length,
    avgScore: deals.length > 0 ? (deals.reduce((sum, d) => sum + parseFloat(d.match_score), 0) / deals.length).toFixed(1) : "0",
  };

  return (
    <div className="space-y-6 animate-slide-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-800">Deal Hub</h1>
          <p className="text-sm text-surface-500 mt-0.5">AI-matched trade opportunities curated for you</p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent-500 text-white rounded-xl text-sm font-semibold hover:bg-accent-600 disabled:opacity-50 transition-colors shadow-sm"
        >
          {generating ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          Find New Matches
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-surface-200">
          <div className="flex items-center gap-2 mb-2">
            <Handshake className="w-4 h-4 text-primary-500" />
            <span className="text-xs text-surface-500">Total Deals</span>
          </div>
          <p className="text-2xl font-bold text-surface-800">{stats.total}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-surface-200">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-warning-500" />
            <span className="text-xs text-surface-500">Pending</span>
          </div>
          <p className="text-2xl font-bold text-warning-600">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-surface-200">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-success-500" />
            <span className="text-xs text-surface-500">Accepted</span>
          </div>
          <p className="text-2xl font-bold text-success-600">{stats.accepted}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-surface-200">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-4 h-4 text-accent-500" />
            <span className="text-xs text-surface-500">Avg Match Score</span>
          </div>
          <p className="text-2xl font-bold text-surface-800">{stats.avgScore}</p>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-2xl p-6 border border-primary-100">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-primary-600" />
          <h3 className="font-bold text-surface-800">How AI Matching Works</h3>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="text-sm font-bold text-primary-600">1</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-surface-800">Smart Analysis</p>
              <p className="text-xs text-surface-500 mt-0.5">AI analyzes price, location, reputation, and urgency</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="text-sm font-bold text-primary-600">2</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-surface-800">Pre-Deal Generation</p>
              <p className="text-xs text-surface-500 mt-0.5">Auto-generated proposals with pricing and terms</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="text-sm font-bold text-primary-600">3</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-surface-800">One-Click Confirm</p>
              <p className="text-xs text-surface-500 mt-0.5">Accept to instantly create a secured order</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setActiveFilter(f.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              activeFilter === f.id
                ? "bg-primary-600 text-white shadow-sm"
                : "bg-white border border-surface-200 text-surface-600 hover:bg-surface-50"
            }`}
          >
            {f.label}
            {f.id !== "all" && (
              <span className="ml-1.5 text-[10px] opacity-70">
                ({deals.filter((d) => d.status === f.id).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Deals Grid */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-surface-200 animate-pulse">
              <div className="h-1.5 bg-surface-200 rounded mb-4" />
              <div className="flex gap-3 mb-4">
                <div className="w-14 h-14 bg-surface-200 rounded-2xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-surface-200 rounded w-1/3" />
                  <div className="h-3 bg-surface-200 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-surface-200 text-center">
          <Sparkles className="w-12 h-12 text-surface-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-surface-700 mb-1">No deals found</h3>
          <p className="text-sm text-surface-500 mb-2">{activeFilter === "all" ? "Generate AI matches to see opportunities" : `No ${activeFilter} deals`}</p>
          {activeFilter === "all" && (
            <button
              onClick={handleGenerate}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent-500 text-white rounded-xl text-sm font-semibold hover:bg-accent-600 transition-colors mt-4"
            >
              <Sparkles className="w-4 h-4" /> Find Matches
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4 stagger-children">
          {filtered.map((deal) => (
            <DealCard key={deal.id} deal={deal} onAction={loadDeals} />
          ))}
        </div>
      )}
    </div>
  );
}
