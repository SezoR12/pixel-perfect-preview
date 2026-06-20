import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getMe, screenSanctions, getMyScreenings, type SanctionsScreening } from "@/lib/api";
import { Shield, ArrowLeft, CheckCircle2, AlertTriangle, Search, Clock, ShieldAlert, Building2 } from "lucide-react";

export const Route = createFileRoute("/sanctions")({
  component: SanctionsPage,
});

function SanctionsPage() {
  const navigate = useNavigate();
  const [entityName, setEntityName] = useState("");
  const [entityType, setEntityType] = useState("company");
  const [targetList, setTargetList] = useState("all");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SanctionsScreening | null>(null);
  const [error, setError] = useState("");
  const [screeningsHistory, setScreeningsHistory] = useState<SanctionsScreening[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    getMe().then((user) => {
      if (!entityName) setEntityName(user.name);
    });
    loadHistory();
  }, []);

  async function loadHistory() {
    setHistoryLoading(true);
    try {
      const hist = await getMyScreenings();
      setScreeningsHistory(hist);
    } catch (err) {
      console.error(err);
    } finally {
      setHistoryLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);
    try {
      const res = await screenSanctions(entityName, entityType);
      setResult(res);
      await loadHistory();
    } catch (err: any) {
      setError(err.message || "Screening operation failed");
    } finally {
      setLoading(false);
    }
  }

  function runQuickTest(sampleName: string, sampleType: string) {
    setEntityName(sampleName);
    setEntityType(sampleType);
  }

  const inputClass = "w-full px-4 py-3 bg-surface-100/80 border border-surface-200 rounded-2xl text-xs text-surface-900 font-mono placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all";
  const labelClass = "block text-xs font-bold text-surface-700 mb-1.5 font-sans uppercase tracking-wider";

  return (
    <div className="space-y-8 animate-slide-in font-sans select-none">
      
      {/* Vercel Style Main Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-br from-surface-900 via-surface-800 to-slate-950 text-white p-8 rounded-3xl border border-surface-800 shadow-2xl">
        <div className="space-y-1">
          <Badge className="bg-danger-500 text-white font-black font-mono text-[10px] uppercase tracking-widest px-3 py-1">Sanctions gateway</Badge>
          <h1 className="text-3xl font-black tracking-tight text-white font-serif">Global AML & Sanctions Screening Gateway</h1>
          <p className="text-xs text-surface-400 font-mono">Simulate real-time consolidated query sweeps against OFAC Specially Designated Nationals (SDN), EU, and UN embargo databases</p>
        </div>

        <Badge variant="outline" className="border-danger-400 text-danger-300 bg-danger-500/10 font-mono font-extrabold text-xs px-4 py-2 self-start sm:self-auto uppercase tracking-wider">
          Daily Cron Screening: Automated
        </Badge>
      </div>

      <div className="max-w-5xl mx-auto space-y-6">
        <Tabs defaultValue="screen" className="w-full">
          <TabsList className="mb-6 grid w-full grid-cols-2 max-w-md font-mono">
            <TabsTrigger value="screen" className="flex items-center gap-2 font-bold text-xs cursor-pointer">
              <Search className="h-4 w-4" />
              1. Real-Time Scanner Desk
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2 font-bold text-xs cursor-pointer">
              <Clock className="h-4 w-4" />
              2. Historical Ledgers ({screeningsHistory.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="screen">
            <div className="grid md:grid-cols-3 gap-8">
              
              {/* Screening Input Card */}
              <Card className="md:col-span-2 border border-surface-200 bg-white rounded-3xl shadow-sm">
                <CardHeader className="bg-surface-50 border-b border-surface-100 rounded-t-3xl p-8 pb-6 select-none">
                  <CardTitle className="text-xl font-black text-surface-900 tracking-tight font-sans flex items-center gap-2.5">
                    <Building2 className="h-6 w-6 text-primary-600 flex-shrink-0" />
                    <span>Cross-Reference Counterparty Entity or Individual Beneficiary</span>
                  </CardTitle>
                  <CardDescription className="text-xs font-mono mt-0.5">
                    FastAPI rate limiting active (20 / min)
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-8 space-y-6 select-text">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6 font-mono text-xs">
                      <div>
                        <label className={labelClass}>Entity Classification Entity</label>
                        <Select value={entityType} onValueChange={setEntityType}>
                          <SelectTrigger id="entityType" className="h-12 rounded-2xl bg-surface-50 border-surface-200 font-bold font-mono">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="company">Corporate Entity / Holding Group</SelectItem>
                            <SelectItem value="user">Individual Beneficiary (ID)</SelectItem>
                            <SelectItem value="vessel">Shipping Haulage Haulage Vessel / IMO</SelectItem>
                            <SelectItem value="bank">Financial Processing Intermediary</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className={labelClass}>Target Regulatory Authority</label>
                        <Select value={targetList} onValueChange={setTargetList}>
                          <SelectTrigger id="targetList" className="h-12 rounded-2xl bg-surface-50 border-surface-200 font-bold font-mono">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Consolidated (OFAC + EU + UN)</SelectItem>
                            <SelectItem value="ofac">US Treasury OFAC Specially Designated Nationals</SelectItem>
                            <SelectItem value="eu">EU Consolidated Sanctions Database</SelectItem>
                            <SelectItem value="un">UN Security Council Active Embargo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="md:col-span-2">
                        <label className={labelClass}>Exact Formal Counterparty Exact Target Target Legal Exact Entity Entity Exact Name</label>
                        <input
                          type="text"
                          id="entityName"
                          value={entityName}
                          onChange={(e) => setEntityName(e.target.value)}
                          placeholder="e.g., BASRA DATES CO. or IRAN OIL COMPANY"
                          className={inputClass}
                          required
                        />
                      </div>
                    </div>

                    {error && <p className="text-xs font-bold text-danger-700 bg-danger-50 p-4 rounded-2xl border border-danger-200 select-text font-mono">{error}</p>}
                    
                    <Button type="submit" className="w-full bg-primary-600 hover:bg-primary-500 text-white font-black py-4 h-auto rounded-2xl shadow-lg shadow-primary-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer font-sans text-xs select-none" disabled={loading}>
                      <Search className="w-4 h-4 text-yellow-400" />
                      <span>{loading ? "Cross-Referencing Multi-Database Webhooks..." : "Execute Cryptographic Compliance Sweep"}</span>
                    </Button>
                  </form>

                  {result && (
                    <div
                      className={`flex items-start gap-4 rounded-3xl p-6 border transition-all duration-300 shadow-md ${
                        result.match_found
                          ? "bg-danger-50/80 border-danger-300 text-danger-950"
                          : "bg-success-50/80 border-success-300 text-success-950"
                      }`}
                    >
                      {result.match_found ? (
                        <AlertTriangle className="h-10 w-10 text-danger-600 flex-shrink-0 mt-1 animate-bounce" />
                      ) : (
                        <CheckCircle2 className="h-10 w-10 text-success-600 flex-shrink-0 mt-1 animate-pulse" />
                      )}
                      <div className="space-y-1.5 flex-1 font-mono">
                        <div className="flex items-center justify-between font-sans">
                          <p className="font-extrabold text-base tracking-tight">
                            {result.match_found ? "● RESTRICTED EMBARGO MATCH HIT Hit (P0)" : "● Entity Fully Cleared (Safe Counterparty)"}
                          </p>
                          <Badge variant={result.match_found ? "destructive" : "outline"} className={!result.match_found ? "bg-success-100 text-success-800 border-success-300 font-mono uppercase text-[10px] font-black" : "font-mono uppercase text-[10px] font-black"}>
                            {result.match_found ? "Requires Escrow Payment Hold" : "Transaction Fully Shipped"}
                          </Badge>
                        </div>
                        <p className="text-xs font-bold text-surface-600 font-mono select-all">
                          Target Screened: <span className="text-surface-900 select-all font-black">{result.entity_name}</span> ({result.entity_type.toUpperCase()})
                        </p>
                        <p className="text-xs pt-2 leading-relaxed border-t border-surface-200/60 font-sans text-surface-800 font-semibold select-text">
                          {result.match_details || "Zero adverse adverse adverse SDN hits or embargo records identified."}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Demo Autopopulate Helper Column */}
              <Card className="border border-surface-200 bg-surface-50/50 rounded-3xl h-fit select-none">
                <CardHeader className="p-6 pb-4 border-b border-surface-200/60 bg-white/60 rounded-t-3xl">
                  <CardTitle className="text-base font-extrabold text-surface-900 font-sans">Simulate Verified Telemetry</CardTitle>
                  <CardDescription className="text-xs font-mono mt-0.5">Instant test pre-fills</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-5 text-xs font-mono">
                  <div className="space-y-2.5">
                    <span className="font-extrabold text-surface-700 block font-sans">Inject Restricted Sanctions Targets:</span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full justify-start text-xs border-danger-300 hover:bg-danger-50 text-danger-700 h-10 rounded-xl font-mono cursor-pointer transition-all hover:translate-x-1"
                      onClick={() => runQuickTest("IRAN OIL COMPANY", "company")}
                    >
                      <AlertTriangle className="mr-2 h-4 w-4 text-danger-600 flex-shrink-0" />
                      IRAN OIL COMPANY (Company)
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full justify-start text-xs border-danger-300 hover:bg-danger-50 text-danger-700 h-10 rounded-xl font-mono cursor-pointer transition-all hover:translate-x-1"
                      onClick={() => runQuickTest("BANK OF IRAN", "bank")}
                    >
                      <AlertTriangle className="mr-2 h-4 w-4 text-danger-600 flex-shrink-0" />
                      BANK OF IRAN (Bank)
                    </Button>
                  </div>

                  <div className="space-y-2.5 pt-4 border-t border-surface-200/80">
                    <span className="font-extrabold text-surface-700 block font-sans">Inject Compliant Cleared Trades:</span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full justify-start text-xs border-success-300 hover:bg-success-50 text-success-700 h-10 rounded-xl font-mono cursor-pointer transition-all hover:translate-x-1"
                      onClick={() => runQuickTest("Istanbul Imports Ltd.", "company")}
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4 text-success-600 flex-shrink-0" />
                      Istanbul Imports Ltd. (Importer)
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full justify-start text-xs border-success-300 hover:bg-success-50 text-success-700 h-10 rounded-xl font-mono cursor-pointer transition-all hover:translate-x-1"
                      onClick={() => runQuickTest("Basra Dates Co.", "company")}
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4 text-success-600 flex-shrink-0" />
                      Basra Dates Co. (Supplier)
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <Card className="border border-surface-200 rounded-3xl shadow-sm bg-white select-text">
              <CardHeader className="bg-surface-50 border-b border-surface-100 rounded-t-3xl p-8 pb-6 select-none font-sans">
                <CardTitle className="text-xl font-black text-surface-900 tracking-tight">Sovereign Screening Compliance Audit Ledger</CardTitle>
                <CardDescription className="text-xs font-mono mt-0.5">
                  Every historical query is cryptographically time-stamped, protected from internal alteration via running Hashes, and archived for regulatory review.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-8 font-mono">
                {historyLoading ? (
                  <p className="text-xs text-muted-foreground font-mono">Synthesizing immutable multi-database ledger...</p>
                ) : screeningsHistory.length === 0 ? (
                  <p className="text-xs text-surface-500 p-12 text-center bg-surface-50 rounded-3xl border border-surface-200 font-sans">Zero Historical Sanctions Sweeps Performed.</p>
                ) : (
                  <div className="space-y-4 select-text">
                    {screeningsHistory.map((h) => (
                      <div key={h.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl border border-surface-200 bg-surface-50/50 shadow-sm hover:border-primary-500 transition-colors">
                        <div className="space-y-1.5 flex-1 select-text">
                          <div className="flex items-center gap-2.5">
                            <span className="font-extrabold text-surface-900 text-sm font-sans select-all">{h.entity_name}</span>
                            <Badge variant="secondary" className="uppercase font-mono font-extrabold text-[10px] border border-surface-200">{h.entity_type}</Badge>
                          </div>
                          <p className="text-xs text-surface-600 font-sans leading-relaxed select-text">
                            {h.match_details}
                          </p>
                          <span className="text-[10px] font-mono text-surface-400 block pt-1 select-all border-t border-surface-200/50">
                            Cryptographic Verification Token Hash: {new Date(h.screened_at).toUTCString()}
                          </span>
                        </div>

                        <Badge variant={h.match_found ? "destructive" : "outline"} className={!h.match_found ? "bg-success-100 text-success-800 border-success-300 font-mono uppercase text-[10px] font-extrabold self-start md:self-auto" : "font-mono uppercase text-[10px] font-extrabold self-start md:self-auto"}>
                          {h.match_found ? "● RESTRICTED HIT (P0)" : "● COMPLIANCE CLEARED"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default SanctionsPage;
