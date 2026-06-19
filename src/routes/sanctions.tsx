import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getMe, screenSanctions, getMyScreenings, SanctionsScreening } from "@/lib/api";
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

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar activeRoute="sanctions" />

      <main className="flex-1 overflow-auto">
        <header className="flex h-16 items-center justify-between border-b border-border bg-white px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate({ to: "/dashboard" })} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-semibold text-foreground">Compliance & Sanctions Screening Gateway</h1>
          </div>
          <Badge variant="outline" className="border-red-500 text-red-700 bg-red-50">
            Live Automated OFAC / EU / UN Lists Mock
          </Badge>
        </header>

        <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
          <Card className="bg-gradient-to-r from-red-500/10 via-red-500/5 to-transparent border-red-500/20">
            <CardContent className="p-6 flex flex-col md:flex-row items-start gap-4 justify-between">
              <div className="flex items-start gap-3">
                <ShieldAlert className="h-8 w-8 text-red-600 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-lg font-bold text-foreground">Global Anti-Money Laundering & SDN Matcher</h2>
                  <p className="text-xs text-muted-foreground mt-1 max-w-3xl leading-relaxed">
                    Prior to executing escrow deposits or final export documentation, all involved trading entities (buyers, sellers, logistics carriers) are cross-referenced against Specially Designated Nationals (SDN) and automated consolidated embargo databases.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="screen" className="w-full">
            <TabsList className="mb-6 grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="screen" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Real-Time Scanner
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Audit Logs & History ({screeningsHistory.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="screen">
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-primary" />
                      Screen Entity or Beneficiary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="entityType">Entity Classification</Label>
                          <Select value={entityType} onValueChange={setEntityType}>
                            <SelectTrigger id="entityType">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="company">Corporate Entity / Holding</SelectItem>
                              <SelectItem value="user">Individual Beneficiary</SelectItem>
                              <SelectItem value="vessel">Shipping Vessel / IMO</SelectItem>
                              <SelectItem value="bank">Financial Intermediary</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="targetList">Regulatory Target Database</Label>
                          <Select value={targetList} onValueChange={setTargetList}>
                            <SelectTrigger id="targetList">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Consolidated (OFAC + EU + UN)</SelectItem>
                              <SelectItem value="ofac">US OFAC Specially Designated Nationals</SelectItem>
                              <SelectItem value="eu">EU Consolidated Sanctions List</SelectItem>
                              <SelectItem value="un">UN Security Council Resolutions</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="entityName">Exact Target Legal Name</Label>
                          <Input
                            id="entityName"
                            value={entityName}
                            onChange={(e) => setEntityName(e.target.value)}
                            placeholder="e.g., BASRA DATES CO. or IRAN OIL COMPANY"
                            required
                          />
                        </div>
                      </div>

                      {error && <p className="text-sm font-medium text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">{error}</p>}
                      
                      <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white py-2.5" disabled={loading}>
                        <Search className="mr-2 h-4 w-4" />
                        {loading ? "Cross-referencing global indices..." : "Execute Cryptographic Compliance Sweep"}
                      </Button>
                    </form>

                    {result && (
                      <div
                        className={`flex items-start gap-4 rounded-xl p-5 border ${
                          result.match_found
                            ? "bg-red-50 border-red-200 text-red-900"
                            : "bg-green-50 border-green-200 text-green-900"
                        }`}
                      >
                        {result.match_found ? (
                          <AlertTriangle className="h-8 w-8 text-red-600 flex-shrink-0 mt-0.5" />
                        ) : (
                          <CheckCircle2 className="h-8 w-8 text-green-600 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-base">
                              {result.match_found ? "RESTRICTED MATCH HIT (P0)" : "Entity Fully Cleared (No Hit)"}
                            </p>
                            <Badge variant={result.match_found ? "destructive" : "outline"} className={!result.match_found ? "bg-green-100 text-green-800 border-green-300" : ""}>
                              {result.match_found ? "Requires Escrow Freeze" : "Transaction Approved"}
                            </Badge>
                          </div>
                          <p className="text-xs font-mono text-muted-foreground">
                            Target Entity: {result.entity_name} ({result.entity_type})
                          </p>
                          <p className="text-sm pt-1 leading-relaxed">
                            {result.match_details || "No adverse media or sanctions records identified."}
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Demo Quick-Test Panel */}
                <Card className="bg-secondary/30 border-border">
                  <CardHeader>
                    <CardTitle className="text-base">Mock Verification Injection</CardTitle>
                    <CardDescription>Click below to populate known test targets</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-foreground">Simulate Positive Sanctions Hit:</p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full justify-start text-xs border-red-300 hover:bg-red-50 hover:text-red-700 font-mono"
                        onClick={() => runQuickTest("IRAN OIL COMPANY", "company")}
                      >
                        <AlertTriangle className="mr-2 h-3.5 w-3.5 text-red-600" />
                        IRAN OIL COMPANY
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full justify-start text-xs border-red-300 hover:bg-red-50 hover:text-red-700 font-mono"
                        onClick={() => runQuickTest("BANK OF IRAN", "bank")}
                      >
                        <AlertTriangle className="mr-2 h-3.5 w-3.5 text-red-600" />
                        BANK OF IRAN
                      </Button>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-border">
                      <p className="text-xs font-bold text-foreground">Simulate Clean Cleared Pass:</p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full justify-start text-xs border-green-300 hover:bg-green-50 hover:text-green-700 font-mono"
                        onClick={() => runQuickTest("Istanbul Imports Ltd.", "company")}
                      >
                        <CheckCircle2 className="mr-2 h-3.5 w-3.5 text-green-600" />
                        Istanbul Imports Ltd.
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full justify-start text-xs border-green-300 hover:bg-green-50 hover:text-green-700 font-mono"
                        onClick={() => runQuickTest("Basra Dates Co.", "company")}
                      >
                        <CheckCircle2 className="mr-2 h-3.5 w-3.5 text-green-600" />
                        Basra Dates Co.
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>Screening Audit Ledger</CardTitle>
                  <CardDescription>
                    All historical sanctions screenings are cryptographically time-stamped and logged for regulatory inspection.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {historyLoading ? (
                    <p className="text-sm text-muted-foreground">Retrieving immutable audit ledger...</p>
                  ) : screeningsHistory.length === 0 ? (
                    <p className="text-sm text-muted-foreground p-8 text-center bg-secondary/30 rounded-lg">No screenings executed yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {screeningsHistory.map((h) => (
                        <div key={h.id} className="flex items-center justify-between p-4 rounded-xl border border-border bg-white shadow-sm">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-foreground font-mono">{h.entity_name}</span>
                              <Badge variant="secondary" className="uppercase font-mono text-[10px]">{h.entity_type}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {h.match_details}
                            </p>
                            <span className="text-[10px] font-mono text-muted-foreground">
                              Timestamp: {new Date(h.screened_at).toUTCString()}
                            </span>
                          </div>

                          <Badge variant={h.match_found ? "destructive" : "outline"} className={!h.match_found ? "bg-green-50 text-green-700 border-green-300" : ""}>
                            {h.match_found ? "SDN MATCH HIT" : "CLEARED"}
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
      </main>
    </div>
  );
}
