import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { PricePrediction, DemandAnalytics, getFeatureWeights, getPricePredictions, getDemandImbalances, simulateMLMatching } from "@/lib/api";
import { Sparkles, TrendingUp, TrendingDown, Activity, Sliders, Cpu, AlertTriangle, CheckCircle2, DollarSign, RefreshCw, BarChart3, LineChart, Globe } from "lucide-react";

export const Route = createFileRoute("/ml-analytics")({
  component: MLAnalyticsPage,
});

function MLAnalyticsPage() {
  const [featureData, setFeatureData] = useState<{ model_version: string; accuracy_r2: string; weights: any[] } | null>(null);
  const [prices, setPrices] = useState<PricePrediction[]>([]);
  const [demands, setDemands] = useState<DemandAnalytics[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Simulation Sliders State
  const [oilPrice, setOilPrice] = useState<number>(75.0);
  const [freightRisk, setFreightRisk] = useState<number>(1.2);
  const [urgency, setUrgency] = useState<number>(1.5);
  const [simResult, setSimResult] = useState<{ adjusted_match_score: number; dynamic_shipping_quote_per_ton: number; ai_node_verdict: string } | null>(null);
  const [simLoading, setSimLoading] = useState(false);

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    runSim();
  }, [oilPrice, freightRisk, urgency]);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [fData, pData, dData] = await Promise.all([
        getFeatureWeights(),
        getPricePredictions(),
        getDemandImbalances(),
      ]);
      setFeatureData(fData);
      setPrices(pData);
      setDemands(dData);
    } catch (err: any) {
      setError(err.message || "Failed to load market intelligence models");
    } finally {
      setLoading(false);
    }
  }

  async function runSim() {
    setSimLoading(true);
    try {
      const res = await simulateMLMatching(oilPrice, freightRisk, urgency);
      setSimResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setSimLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar activeRoute="ml-analytics" />

      <main className="flex-1 overflow-auto">
        <header className="flex h-16 items-center justify-between border-b border-border bg-white px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Cpu className="h-5 w-5 text-primary flex-shrink-0" />
            <h1 className="text-lg font-semibold text-foreground">Smart Trade Intelligence & Matching Terminal</h1>
          </div>
          <Badge variant="outline" className="border-purple-500 text-purple-700 bg-purple-50 font-mono">
            Model: {featureData?.model_version || "rule-based-scoring-v1.0"}
          </Badge>
        </header>

        <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
          {/* Engine Metric Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10 text-primary flex-shrink-0">
                  <Activity className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-black text-foreground font-mono">{featureData?.accuracy_r2 || "N/A — heuristic"}</p>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-0.5">Heuristic Engine Baseline</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent border-blue-500/20">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-500/10 text-blue-600 flex-shrink-0">
                  <Sliders className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-black text-foreground font-mono">5 Scoring Criteria</p>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-0.5">Matching Feature Importances</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500/10 via-green-500/5 to-transparent border-green-500/20">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-500/10 text-green-600 flex-shrink-0">
                  <LineChart className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-black text-foreground font-mono">Statistical Forecast</p>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-0.5">Market Trend Analysis</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border-amber-500/20">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-amber-500/10 text-amber-600 flex-shrink-0">
                  <Globe className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-black text-foreground font-mono">Live Corridors</p>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-0.5">Supply/Demand Heatmap</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {error && <p className="text-sm font-medium text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">{error}</p>}

          {/* Interactive ML Simulator Sandbox */}
          <Card className="border-2 border-primary/30 bg-gradient-to-br from-white via-primary/5 to-secondary/20 shadow-md">
            <CardHeader className="pb-3 border-b border-border/80">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Sliders className="h-5 w-5 text-primary" />
                    Interactive Trade Matching Sandbox — Dynamic Indicator Response
                  </CardTitle>
                  <CardDescription>
                    Adjust real-time macroeconomic simulation sliders below to observe how our rule-based matching algorithm dynamically readjusts counterparty match scores and freight recommendations.
                  </CardDescription>
                </div>
                <Badge className="bg-primary text-white font-mono text-xs px-3 py-1">Real-Time Trajectory</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6 grid md:grid-cols-3 gap-8 items-center">
              {/* Sliders Column */}
              <div className="space-y-6 md:col-span-2">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <Label className="font-bold font-sans text-foreground">Brent Crude Oil Price ($ / barrel):</Label>
                    <span className="font-black text-primary">${oilPrice.toFixed(1)}</span>
                  </div>
                  <Slider
                    defaultValue={[75.0]}
                    min={40.0}
                    max={120.0}
                    step={0.5}
                    value={[oilPrice]}
                    onValueChange={(val) => setOilPrice(val[0])}
                    className="cursor-pointer"
                  />
                  <span className="text-[10px] text-muted-foreground block font-mono">
                    [IMPACT] Higher crude oil increases shipping overhead and lowers baseline profitability match score.
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <Label className="font-bold font-sans text-foreground">Geopolitical Maritime Freight Risk Index:</Label>
                    <span className="font-black text-amber-600">{freightRisk.toFixed(2)}x</span>
                  </div>
                  <Slider
                    defaultValue={[1.2]}
                    min={1.0}
                    max={2.5}
                    step={0.05}
                    value={[freightRisk]}
                    onValueChange={(val) => setFreightRisk(val[0])}
                    className="cursor-pointer"
                  />
                  <span className="text-[10px] text-muted-foreground block font-mono">
                    [IMPACT] Escalated maritime risk indices incur dynamic freight insurance penalties.
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <Label className="font-bold font-sans text-foreground">Counterparty Urgency Lead-Time Multiplier:</Label>
                    <span className="font-black text-green-600">{urgency.toFixed(2)}x</span>
                  </div>
                  <Slider
                    defaultValue={[1.5]}
                    min={1.0}
                    max={3.0}
                    step={0.1}
                    value={[urgency]}
                    onValueChange={(val) => setUrgency(val[0])}
                    className="cursor-pointer"
                  />
                  <span className="text-[10px] text-muted-foreground block font-mono">
                    [IMPACT] High counterparty urgency boosts match scores for verified inventory suppliers.
                  </span>
                </div>
              </div>

              {/* Dynamic Algorithm Result Card */}
              <div className="p-6 rounded-2xl bg-slate-900 text-slate-100 flex flex-col justify-between space-y-4 border border-slate-800 shadow-inner">
                <div>
                  <span className="text-[10px] font-mono tracking-widest text-primary uppercase block">Dynamic Verdict Output:</span>
                  <div className="flex items-baseline gap-1 pt-1 font-mono">
                    <span className="text-5xl font-black text-white">{simResult?.adjusted_match_score || 82.5}%</span>
                    <span className="text-xs text-slate-400">Match Score</span>
                  </div>
                  <Badge variant={simResult?.adjusted_match_score && simResult.adjusted_match_score >= 80 ? "outline" : "destructive"} className={simResult?.adjusted_match_score && simResult.adjusted_match_score >= 80 ? "bg-green-500/20 text-green-300 border-green-500 font-mono text-[10px] mt-2" : "mt-2 font-mono text-[10px]"}>
                    {simResult?.ai_node_verdict || "Optimal Cross-Border Route"}
                  </Badge>
                </div>

                <div className="p-3 bg-slate-800/80 rounded-xl space-y-1 font-mono text-xs">
                  <span className="text-slate-400 text-[10px] block font-sans uppercase font-bold">Suggested Shipping Overhead:</span>
                  <span className="text-lg font-black text-amber-400">
                    ${simResult?.dynamic_shipping_quote_per_ton ? simResult.dynamic_shipping_quote_per_ton.toFixed(2) : "54.00"} / ton
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="weights" className="w-full">
            <TabsList className="mb-6 grid w-full grid-cols-3 max-w-xl">
              <TabsTrigger value="weights" className="flex items-center gap-2">
                <Sliders className="h-4 w-4" />
                Matching Vector Breakdown
              </TabsTrigger>
              <TabsTrigger value="predictions" className="flex items-center gap-2">
                <LineChart className="h-4 w-4" />
                30-Day Market Analysis
              </TabsTrigger>
              <TabsTrigger value="demands" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Regional Imbalance Heatmap
              </TabsTrigger>
            </TabsList>

            {/* Feature Importances Tab */}
            <TabsContent value="weights">
              <Card>
                <CardHeader>
                  <CardTitle>Heuristic Decision Criteria Breakdown</CardTitle>
                  <CardDescription>
                    Our smart matching engine evaluates cross-border trading opportunities across five weighted operational criteria.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {loading ? (
                    <p className="text-muted-foreground text-sm">Querying criteria weights...</p>
                  ) : (
                    <div className="space-y-4">
                      {featureData?.weights?.map((w, idx) => (
                        <div key={idx} className="space-y-1.5 p-4 rounded-xl border border-border bg-white shadow-sm">
                          <div className="flex justify-between items-center text-sm">
                            <span className="font-bold text-foreground flex items-center gap-2">
                              <span className="inline-block w-2.5 h-2.5 rounded-full bg-primary flex-shrink-0" />
                              {w.feature}
                            </span>
                            <div className="flex items-center gap-3 font-mono">
                              <Badge variant="secondary" className="uppercase text-[10px]">{w.category}</Badge>
                              <span className="font-black text-base text-primary">{(w.weight * 100).toFixed(0)}%</span>
                            </div>
                          </div>
                          {/* Rich visual progress bar */}
                          <div className="w-full h-2.5 bg-secondary rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all duration-1000"
                              style={{ width: `${w.weight * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Price Predictions Tab */}
            <TabsContent value="predictions">
              <Card>
                <CardHeader>
                  <CardTitle>Market Trend Commodity Forecasting</CardTitle>
                  <CardDescription>
                    Real-time 30-day commodity price trajectories derived from regional historical trading ledgers and maritime spot quotes.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <p className="text-muted-foreground text-sm">Synthesizing statistical trajectories...</p>
                  ) : (
                    <div className="grid gap-6 md:grid-cols-3">
                      {prices.map((p, idx) => (
                        <Card key={idx} className="overflow-hidden border border-border bg-white shadow-sm flex flex-col justify-between">
                          <CardHeader className="p-5 pb-3 bg-secondary/30 border-b border-border">
                            <div className="flex items-center justify-between">
                              <Badge variant={p.trend === "bullish" ? "default" : "secondary"} className={p.trend === "bullish" ? "bg-green-600 text-white font-mono text-[10px]" : "font-mono text-[10px]"}>
                                {p.trend.toUpperCase()} FORECAST
                              </Badge>
                              {p.trend === "bullish" ? (
                                <TrendingUp className="h-5 w-5 text-green-600" />
                              ) : (
                                <TrendingDown className="h-5 w-5 text-red-600" />
                              )}
                            </div>
                            <h3 className="font-bold text-foreground text-base pt-2">{p.commodity_name}</h3>
                          </CardHeader>

                          <CardContent className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                              <div className="p-3 bg-secondary/40 rounded-lg">
                                <span className="text-muted-foreground font-sans block text-[10px]">Current Spot:</span>
                                <span className="font-black text-base text-foreground">${Number(p.current_price).toFixed(2)}</span>
                              </div>
                              <div className="p-3 bg-primary/10 rounded-lg text-primary">
                                <span className="font-sans block text-[10px] font-bold">30D Forecast:</span>
                                <span className="font-black text-base">${Number(p.forecast_30d).toFixed(2)}</span>
                              </div>
                            </div>

                            <div className="p-3 rounded-lg border border-border space-y-1 text-[11px] font-mono">
                              <span className="text-muted-foreground block font-sans font-bold">95% Statistical Confidence Interval:</span>
                              <div className="flex justify-between font-bold text-foreground">
                                <span className="text-red-700">${Number(p.confidence_interval_low).toFixed(2)}</span>
                                <span className="text-muted-foreground">↔</span>
                                <span className="text-green-700">${Number(p.confidence_interval_high).toFixed(2)}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Demand Imbalance Tab */}
            <TabsContent value="demands">
              <Card>
                <CardHeader>
                  <CardTitle>Regional Corridor Imbalance Heatmap</CardTitle>
                  <CardDescription>
                    Identify lucrative market opportunities by analyzing supply-demand discrepancies across cross-border trading corridors.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <p className="text-muted-foreground text-sm">Processing corridor imbalance matrices...</p>
                  ) : (
                    <div className="grid gap-6">
                      {demands.map((d, idx) => (
                        <Card key={idx} className="p-6 border border-border bg-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                          <div className="space-y-2 flex-1">
                            <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
                              <Globe className="h-5 w-5 text-primary" />
                              {d.corridor}
                            </h3>
                            <div className="flex flex-wrap items-center gap-4 text-xs font-mono pt-1">
                              <span>Total Demand: <strong className="text-foreground">{d.total_demand_tonnage} Tons</strong></span>
                              <span>•</span>
                              <span>Available Supply: <strong className="text-foreground">{d.total_supply_tonnage} Tons</strong></span>
                              <span>•</span>
                              <Badge className="bg-amber-500 text-amber-950 font-black">
                                Imbalance Ratio: {Number(d.imbalance_ratio).toFixed(2)}x
                              </Badge>
                            </div>
                          </div>

                          <div className="p-4 rounded-xl bg-secondary/60 border border-border max-w-md text-xs leading-relaxed">
                            <span className="font-bold text-foreground block mb-0.5">Automated Smart Advice:</span>
                            <span className="text-muted-foreground">{d.recommended_action}</span>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
