import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  Brain,
  Gauge,
  ArrowUpRight,
  ArrowDownRight,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Zap,
  ChevronRight,
  SlidersHorizontal
} from "lucide-react";
import {
  getPricePredictions,
  getDemandImbalances,
  getFeatureWeights,
  simulateMLMatching,
  type PricePrediction,
  type DemandAnalytics,
} from "@/lib/api";

export const Route = createFileRoute("/analytics")({
  component: AnalyticsPage,
});

function PriceCard({ prediction }: { prediction: PricePrediction }) {
  const isBullish = prediction.trend === "bullish";
  const current = parseFloat(prediction.current_price);
  const forecast = parseFloat(prediction.forecast_30d);
  const change = ((forecast - current) / current) * 100;
  const low = parseFloat(prediction.confidence_interval_low);
  const high = parseFloat(prediction.confidence_interval_high);

  return (
    <div className="bg-white rounded-2xl p-5 border border-surface-200 card-hover">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 className="text-sm font-semibold text-surface-800">{prediction.commodity_name}</h4>
          <p className="text-xs text-surface-400 mt-0.5">30-Day Forecast</p>
        </div>
        <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
          isBullish ? "bg-success-50 text-success-700" : "bg-danger-50 text-danger-700"
        }`}>
          {isBullish ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
          {isBullish ? "Bullish" : "Bearish"}
        </div>
      </div>

      <div className="flex items-end gap-3 mb-4">
        <div>
          <p className="text-[10px] text-surface-400 uppercase tracking-wider">Current</p>
          <p className="text-xl font-bold text-surface-800">${current.toFixed(2)}</p>
        </div>
        <ArrowUpRight className={`w-5 h-5 mb-1 ${isBullish ? "text-success-500" : "text-danger-500 rotate-90"}`} />
        <div>
          <p className="text-[10px] text-surface-400 uppercase tracking-wider">Forecast</p>
          <p className={`text-xl font-bold ${isBullish ? "text-success-600" : "text-danger-600"}`}>${forecast.toFixed(2)}</p>
        </div>
      </div>

      {/* Confidence interval bar */}
      <div className="mb-2">
        <div className="flex justify-between text-[10px] text-surface-400 mb-1">
          <span>Confidence Range</span>
          <span>${low.toFixed(0)} — ${high.toFixed(0)}</span>
        </div>
        <div className="h-2 bg-surface-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${isBullish ? "bg-success-400" : "bg-danger-400"}`}
            style={{ width: `${Math.min(100, Math.abs(change) * 3)}%` }}
          />
        </div>
      </div>

      <p className={`text-xs font-semibold ${isBullish ? "text-success-600" : "text-danger-600"}`}>
        {isBullish ? "+" : ""}{change.toFixed(1)}% projected change
      </p>
    </div>
  );
}

function CorridorCard({ data }: { data: DemandAnalytics }) {
  const ratio = parseFloat(data.imbalance_ratio);
  const isDeficit = ratio > 1;
  const severity = ratio > 1.5 ? "high" : ratio > 1 ? "moderate" : "low";

  return (
    <div className="bg-white rounded-2xl p-5 border border-surface-200 card-hover">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary-500" />
          <h4 className="text-sm font-semibold text-surface-800">{data.corridor}</h4>
        </div>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
          severity === "high" ? "bg-danger-50 text-danger-700" :
          severity === "moderate" ? "bg-warning-50 text-warning-700" :
          "bg-success-50 text-success-700"
        }`}>
          {severity === "high" ? "High Alert" : severity === "moderate" ? "Moderate" : "Balanced"}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center">
          <p className="text-lg font-bold text-surface-800">{data.total_demand_tonnage.toLocaleString()}</p>
          <p className="text-[10px] text-surface-400 uppercase tracking-wider mt-0.5">Demand (ton)</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-surface-800">{data.total_supply_tonnage.toLocaleString()}</p>
          <p className="text-[10px] text-surface-400 uppercase tracking-wider mt-0.5">Supply (ton)</p>
        </div>
        <div className="text-center">
          <p className={`text-lg font-bold ${isDeficit ? "text-danger-600" : "text-success-600"}`}>
            {ratio.toFixed(2)}x
          </p>
          <p className="text-[10px] text-surface-400 uppercase tracking-wider mt-0.5">Ratio</p>
        </div>
      </div>

      {/* Visual bar */}
      <div className="flex h-3 rounded-full overflow-hidden mb-3">
        <div
          className="bg-primary-400"
          style={{ width: `${(data.total_supply_tonnage / (data.total_demand_tonnage + data.total_supply_tonnage)) * 100}%` }}
        />
        <div
          className="bg-accent-400"
          style={{ width: `${(data.total_demand_tonnage / (data.total_demand_tonnage + data.total_supply_tonnage)) * 100}%` }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-surface-400 mb-3">
        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-primary-400" /> Supply</span>
        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-accent-400" /> Demand</span>
      </div>

      <div className={`flex items-start gap-2 p-3 rounded-xl text-xs ${
        isDeficit ? "bg-danger-50 text-danger-700" : "bg-success-50 text-success-700"
      }`}>
        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <p>{data.recommended_action}</p>
      </div>
    </div>
  );
}

function SimulatorPanel() {
  const [crudeOil, setCrudeOil] = useState(75);
  const [freightRisk, setFreightRisk] = useState(1.2);
  const [urgency, setUrgency] = useState(1.5);
  const [result, setResult] = useState<any>(null);
  const [simulating, setSimulating] = useState(false);

  async function runSimulation() {
    setSimulating(true);
    try {
      const data = await simulateMLMatching(crudeOil, freightRisk, urgency);
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setSimulating(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-surface-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-accent-50 flex items-center justify-center">
          <SlidersHorizontal className="w-5 h-5 text-accent-600" />
        </div>
        <div>
          <h3 className="font-bold text-surface-800">AI Match Simulator</h3>
          <p className="text-sm text-surface-500">Adjust market conditions to see impact on match scores</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-6 mb-6">
        <div>
          <label className="flex items-center justify-between text-xs font-semibold text-surface-600 mb-2">
            <span>Crude Oil Price</span>
            <span className="text-primary-600">${crudeOil}/barrel</span>
          </label>
          <input
            type="range"
            min="40"
            max="120"
            step="1"
            value={crudeOil}
            onChange={(e) => setCrudeOil(Number(e.target.value))}
            className="w-full h-2 bg-surface-200 rounded-full appearance-none cursor-pointer accent-primary-600"
          />
          <div className="flex justify-between text-[10px] text-surface-400 mt-1">
            <span>$40</span>
            <span>$120</span>
          </div>
        </div>
        <div>
          <label className="flex items-center justify-between text-xs font-semibold text-surface-600 mb-2">
            <span>Freight Risk Index</span>
            <span className="text-primary-600">{freightRisk}x</span>
          </label>
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.1"
            value={freightRisk}
            onChange={(e) => setFreightRisk(Number(e.target.value))}
            className="w-full h-2 bg-surface-200 rounded-full appearance-none cursor-pointer accent-primary-600"
          />
          <div className="flex justify-between text-[10px] text-surface-400 mt-1">
            <span>0.5x</span>
            <span>3.0x</span>
          </div>
        </div>
        <div>
          <label className="flex items-center justify-between text-xs font-semibold text-surface-600 mb-2">
            <span>Urgency Multiplier</span>
            <span className="text-primary-600">{urgency}x</span>
          </label>
          <input
            type="range"
            min="1"
            max="3"
            step="0.1"
            value={urgency}
            onChange={(e) => setUrgency(Number(e.target.value))}
            className="w-full h-2 bg-surface-200 rounded-full appearance-none cursor-pointer accent-primary-600"
          />
          <div className="flex justify-between text-[10px] text-surface-400 mt-1">
            <span>1.0x</span>
            <span>3.0x</span>
          </div>
        </div>
      </div>

      <button
        onClick={runSimulation}
        disabled={simulating}
        className="w-full sm:w-auto px-6 py-2.5 bg-accent-500 text-white rounded-xl text-sm font-semibold hover:bg-accent-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
      >
        {simulating ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <Zap className="w-4 h-4" />
        )}
        Run Simulation
      </button>

      {result && (
        <div className="mt-6 p-5 bg-surface-50 rounded-2xl border border-surface-200 animate-slide-in">
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <p className="text-[10px] text-surface-400 uppercase tracking-wider mb-1">Match Score</p>
              <p className={`text-2xl font-bold ${result.adjusted_match_score >= 80 ? "text-success-600" : "text-warning-600"}`}>
                {result.adjusted_match_score}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-surface-400 uppercase tracking-wider mb-1">Shipping Quote</p>
              <p className="text-2xl font-bold text-surface-800">${result.dynamic_shipping_quote_per_ton}/ton</p>
            </div>
            <div>
              <p className="text-[10px] text-surface-400 uppercase tracking-wider mb-1">AI Verdict</p>
              <p className={`text-sm font-semibold ${result.adjusted_match_score >= 80 ? "text-success-700" : "text-warning-700"}`}>
                {result.ai_node_verdict}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AnalyticsPage() {
  const [predictions, setPredictions] = useState<PricePrediction[]>([]);
  const [imbalances, setImbalances] = useState<DemandAnalytics[]>([]);
  const [features, setFeatures] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getPricePredictions(), getDemandImbalances(), getFeatureWeights()])
      .then(([p, i, f]) => {
        setPredictions(p);
        setImbalances(i);
        setFeatures(f);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center gap-3 text-surface-400">
          <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          Loading market intelligence...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-slide-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-surface-800">Market Insights</h1>
        <p className="text-sm text-surface-500 mt-0.5">AI-powered price forecasts, demand analysis, and trade intelligence</p>
      </div>

      {/* Model Info */}
      {features && (
        <div className="bg-gradient-to-r from-indigo-50 to-primary-50 rounded-2xl p-6 border border-indigo-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
              <Brain className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-bold text-surface-800">AI Matching Engine</h3>
              <p className="text-sm text-surface-500">Model: {features.model_version} · Accuracy R²: {features.accuracy_r2}</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-5 gap-3">
            {features.weights.map((w: any, i: number) => (
              <div key={i} className="bg-white rounded-xl p-3 border border-indigo-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">{w.category}</span>
                  <span className="text-xs font-bold text-surface-800">{(w.weight * 100).toFixed(0)}%</span>
                </div>
                <p className="text-xs text-surface-600 leading-tight">{w.feature}</p>
                <div className="h-1.5 bg-surface-100 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${w.weight * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Price Predictions */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <Activity className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-bold text-surface-800">30-Day Price Forecasts</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
          {predictions.map((p, i) => (
            <PriceCard key={i} prediction={p} />
          ))}
        </div>
      </div>

      {/* Demand Imbalances */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <Gauge className="w-5 h-5 text-accent-600" />
          <h2 className="text-lg font-bold text-surface-800">Corridor Demand Analysis</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4 stagger-children">
          {imbalances.map((d, i) => (
            <CorridorCard key={i} data={d} />
          ))}
        </div>
      </div>

      {/* Simulator */}
      <SimulatorPanel />
    </div>
  );
}
