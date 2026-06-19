import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LetterOfCredit, DocumentaryCollection, getLCs, actOnLC, getDPs, actOnDP, getOrders, Order } from "@/lib/api";
import { CreditCard, ArrowRight, CheckCircle2, AlertTriangle, FileText, Landmark, RefreshCw, Send, XCircle, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/trade-finance")({
  component: TradeFinancePage,
});

function TradeFinancePage() {
  const [lcs, setLCs] = useState<LetterOfCredit[]>([]);
  const [dps, setDPs] = useState<DocumentaryCollection[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [lcData, dpData] = await Promise.all([getLCs(), getDPs()]);
      setLCs(lcData);
      setDPs(dpData);
    } catch (err: any) {
      setError(err.message || "Failed to load trade finance state machines");
    } finally {
      setLoading(false);
    }
  }

  async function handleLCAction(lcId: number, targetAction: string, notes?: string) {
    setError("");
    setSuccess("");
    try {
      const updated = await actOnLC(lcId, targetAction, notes);
      setLCs(lcs.map((item) => (item.id === lcId ? updated : item)));
      setSuccess(`SWIFT L/C state advanced successfully: ${updated.status}`);
    } catch (err: any) {
      setError(err.message || "L/C state action failed");
    }
  }

  async function handleDPAction(dpId: number, targetAction: string) {
    setError("");
    setSuccess("");
    try {
      const updated = await actOnDP(dpId, targetAction);
      setDPs(dps.map((item) => (item.id === dpId ? updated : item)));
      setSuccess(`Documentary Collection state advanced: ${updated.status}`);
    } catch (err: any) {
      setError(err.message || "D/P state action failed");
    }
  }

  const lcSteps = [
    { id: "draft", label: "SWIFT Draft" },
    { id: "issued", label: "MT700 Issued" },
    { id: "advised", label: "Advised by Bank" },
    { id: "documents_presented", label: "Docs Presented" },
    { id: "clean_presentation", label: "Clean Audit" },
    { id: "settled", label: "MT756 Settled" },
  ];

  const dpSteps = [
    { id: "draft", label: "Collection Draft" },
    { id: "sent_to_collecting_bank", label: "Sent to Bank" },
    { id: "presented_to_importer", label: "Presented to Importer" },
    { id: "paid", label: "Funds Captured" },
    { id: "documents_released", label: "Docs Released" },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar activeRoute="trade-finance" />

      <main className="flex-1 overflow-auto">
        <header className="flex h-16 items-center justify-between border-b border-border bg-white px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Landmark className="h-5 w-5 text-primary flex-shrink-0" />
            <h1 className="text-lg font-semibold text-foreground">Trade Finance & Institutional State Machines</h1>
          </div>
          <Badge variant="outline" className="border-green-500 text-green-700 bg-green-50 font-mono">
            UCP 600 / URC 522 SWIFT Nodes: Active
          </Badge>
        </header>

        <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
          {/* Executive Summary Card */}
          <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    B2B Commercial Instrument Automation
                  </CardTitle>
                  <CardDescription>
                    Tureep AI+ orchestrates rigorous financial state machines. Letters of Credit (L/C) are governed by ICC UCP 600 rules, while Documentary Collections (D/P) execute under URC 522 protocols.
                  </CardDescription>
                </div>
                <Button size="sm" variant="outline" onClick={load} disabled={loading}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Sync Core Banks
                </Button>
              </div>
            </CardHeader>
          </Card>

          {error && <p className="text-sm font-medium text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">{error}</p>}
          {success && <p className="text-sm font-medium text-green-600 bg-green-50 p-3 rounded-lg border border-green-200">{success}</p>}

          <Tabs defaultValue="lc" className="w-full">
            <TabsList className="mb-6 grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="lc" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Letters of Credit (L/C)
              </TabsTrigger>
              <TabsTrigger value="dp" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Documentary Collection (D/P)
              </TabsTrigger>
            </TabsList>

            {/* Letters of Credit Tab */}
            <TabsContent value="lc" className="space-y-6">
              {loading ? (
                <p className="text-muted-foreground text-sm">Querying SWIFT messaging pool...</p>
              ) : lcs.length === 0 ? (
                <div className="p-12 text-center bg-secondary/30 rounded-xl border border-border">
                  <Landmark className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-3 font-medium text-foreground">No Active L/Cs</p>
                  <p className="text-xs text-muted-foreground mt-1">Convert a pre-deal with L/C payment terms to initiate an instrument.</p>
                </div>
              ) : (
                lcs.map((lc) => {
                  const currentStepIdx = lcSteps.findIndex((s) => s.id === lc.status);

                  return (
                    <Card key={lc.id} className="overflow-hidden border border-border bg-white shadow-sm">
                      <CardHeader className="bg-secondary/40 border-b border-border pb-4">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <Badge variant="secondary" className="font-mono text-xs">{lc.lc_number}</Badge>
                            <CardTitle className="text-base font-bold text-foreground">
                              SWIFT MT700 Documentary Instrument
                            </CardTitle>
                            <Badge variant={lc.status === "settled" ? "outline" : lc.status === "discrepancies" ? "destructive" : "default"} className={lc.status === "settled" ? "bg-green-50 text-green-700 border-green-300 uppercase font-mono text-[10px]" : "uppercase font-mono text-[10px]"}>
                              State: {lc.status.replace("_", " ")}
                            </Badge>
                          </div>
                          <span className="text-xs text-muted-foreground font-mono">
                            Expires: {new Date(lc.expiry_date).toLocaleDateString()}
                          </span>
                        </div>
                      </CardHeader>

                      <CardContent className="p-6 space-y-6">
                        {/* State Machine Progress Bar */}
                        <div className="space-y-2">
                          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block font-mono">
                            UCP 600 State Machine Trajectory
                          </span>
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                            {lcSteps.map((step, idx) => {
                              const isCompleted = idx <= (currentStepIdx >= 0 ? currentStepIdx : 0);
                              const isCurrent = step.id === lc.status;

                              return (
                                <div
                                  key={step.id}
                                  className={`p-3 rounded-lg border text-center transition-all ${
                                    isCurrent
                                      ? "bg-primary text-primary-foreground font-bold border-primary shadow-sm"
                                      : isCompleted
                                      ? "bg-green-50 border-green-200 text-green-900 font-medium"
                                      : "bg-secondary/50 border-border text-muted-foreground opacity-60"
                                  }`}
                                >
                                  <span className="text-[11px] block font-mono">Step {idx + 1}</span>
                                  <span className="text-xs tracking-tight">{step.label}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Institutional routing metadata */}
                        <div className="grid md:grid-cols-3 gap-4 p-4 bg-secondary/30 rounded-xl text-xs">
                          <div>
                            <span className="font-bold text-foreground block mb-0.5">Issuing Institutional Bank:</span>
                            <span className="font-mono text-muted-foreground">{lc.issuing_bank}</span>
                          </div>
                          <div>
                            <span className="font-bold text-foreground block mb-0.5">Advising Institutional Bank:</span>
                            <span className="font-mono text-muted-foreground">{lc.advising_bank}</span>
                          </div>
                          <div>
                            <span className="font-bold text-foreground block mb-0.5">Total Settlement Commitment:</span>
                            <span className="font-bold text-base text-foreground font-mono">${Number(lc.amount).toFixed(2)} {lc.currency}</span>
                          </div>
                        </div>

                        {/* Discrepancy Note Box */}
                        {lc.status === "discrepancies" && (
                          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 space-y-1">
                            <div className="flex items-center gap-2 font-bold text-xs">
                              <AlertTriangle className="h-4 w-4 text-red-600" />
                              <span>SWIFT MT734 Discrepancies Identified</span>
                            </div>
                            <p className="text-xs leading-relaxed pt-0.5">{lc.discrepancy_notes}</p>
                            <p className="text-[10px] text-red-700 pt-1">
                              Action required: Exporter must submit clean compliant documentation or applicant must officially waive discrepancies.
                            </p>
                          </div>
                        )}

                        {/* State Machine Transition Actions */}
                        <div className="pt-2 border-t border-border flex flex-wrap items-center justify-end gap-2.5">
                          {lc.status === "issued" && (
                            <Button size="sm" onClick={() => handleLCAction(lc.id, "advise")}>
                              <Send className="mr-2 h-4 w-4" /> Simulate SWIFT Advise (MT710)
                            </Button>
                          )}

                          {lc.status === "advised" && (
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => handleLCAction(lc.id, "present")}>
                              <FileText className="mr-2 h-4 w-4" /> Present Commercial Documents
                            </Button>
                          )}

                          {lc.status === "documents_presented" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-red-300 text-red-700 hover:bg-red-50"
                                onClick={() => handleLCAction(lc.id, "discrepancy", "Port of export mismatch identified in Commercial Invoice #8812.")}
                              >
                                <AlertTriangle className="mr-1.5 h-4 w-4" /> Simulate SWIFT MT734 Discrepancy
                              </Button>
                              <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleLCAction(lc.id, "clean")}>
                                <CheckCircle2 className="mr-1.5 h-4 w-4" /> Confirm Clean Compliant Audit
                              </Button>
                            </>
                          )}

                          {(lc.status === "clean_presentation" || lc.status === "discrepancies") && (
                            <Button size="sm" className="bg-primary hover:bg-primary/90 text-white font-bold" onClick={() => handleLCAction(lc.id, "settle")}>
                              <Landmark className="mr-2 h-4 w-4" /> Settle Wire MT756 ($7,500)
                            </Button>
                          )}

                          {lc.status === "settled" && (
                            <span className="text-xs font-bold text-green-700 bg-green-50 px-4 py-2 rounded-md border border-green-300 flex items-center gap-1.5 font-mono">
                              <CheckCircle2 className="h-4 w-4" /> L/C Settled Fully & Wire MT756 Authenticated
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </TabsContent>

            {/* Documentary Collection Tab */}
            <TabsContent value="dp" className="space-y-6">
              {loading ? (
                <p className="text-muted-foreground text-sm">Querying Documentary Collection pool...</p>
              ) : dps.length === 0 ? (
                <div className="p-12 text-center bg-secondary/30 rounded-xl border border-border">
                  <FileText className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-3 font-medium text-foreground">No Active D/P Instruments</p>
                </div>
              ) : (
                dps.map((dp) => {
                  const currentStepIdx = dpSteps.findIndex((s) => s.id === dp.status);

                  return (
                    <Card key={dp.id} className="overflow-hidden border border-border bg-white shadow-sm">
                      <CardHeader className="bg-secondary/40 border-b border-border pb-4">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <Badge variant="secondary" className="font-mono text-xs">{dp.dp_number}</Badge>
                            <CardTitle className="text-base font-bold text-foreground">
                              URC 522 Documents Against Payment (D/P)
                            </CardTitle>
                            <Badge variant={dp.status === "documents_released" ? "outline" : "default"} className={dp.status === "documents_released" ? "bg-green-50 text-green-700 border-green-300 uppercase font-mono text-[10px]" : "uppercase font-mono text-[10px]"}>
                              State: {dp.status.replace("_", " ")}
                            </Badge>
                          </div>
                          <span className="text-xs text-muted-foreground font-mono">
                            Created: {new Date(dp.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </CardHeader>

                      <CardContent className="p-6 space-y-6">
                        <div className="space-y-2">
                          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block font-mono">
                            URC 522 State Machine Trajectory
                          </span>
                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                            {dpSteps.map((step, idx) => {
                              const isCompleted = idx <= (currentStepIdx >= 0 ? currentStepIdx : 0);
                              const isCurrent = step.id === dp.status;

                              return (
                                <div
                                  key={step.id}
                                  className={`p-3 rounded-lg border text-center transition-all ${
                                    isCurrent
                                      ? "bg-primary text-primary-foreground font-bold border-primary shadow-sm"
                                      : isCompleted
                                      ? "bg-green-50 border-green-200 text-green-900 font-medium"
                                      : "bg-secondary/50 border-border text-muted-foreground opacity-60"
                                  }`}
                                >
                                  <span className="text-[11px] block font-mono">Step {idx + 1}</span>
                                  <span className="text-xs tracking-tight">{step.label}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4 p-4 bg-secondary/30 rounded-xl text-xs font-mono">
                          <div>
                            <span className="font-bold text-foreground block mb-0.5 font-sans">Remitting Bank (Exporter):</span>
                            <span>{dp.remitting_bank}</span>
                          </div>
                          <div>
                            <span className="font-bold text-foreground block mb-0.5 font-sans">Collecting Bank (Importer):</span>
                            <span>{dp.collecting_bank}</span>
                          </div>
                          <div>
                            <span className="font-bold text-foreground block mb-0.5 font-sans">Collection Face Value:</span>
                            <span className="font-bold text-base text-foreground">${Number(dp.amount).toFixed(2)} {dp.currency}</span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-border flex flex-wrap items-center justify-end gap-2.5">
                          {dp.status === "sent_to_collecting_bank" && (
                            <Button size="sm" onClick={() => handleDPAction(dp.id, "present")}>
                              <Send className="mr-2 h-4 w-4" /> Present Commercial Papers to Importer
                            </Button>
                          )}

                          {dp.status === "presented_to_importer" && (
                            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleDPAction(dp.id, "pay")}>
                              <Landmark className="mr-2 h-4 w-4" /> Capture Importer Wire Payment ($3,800)
                            </Button>
                          )}

                          {dp.status === "paid" && (
                            <Button size="sm" className="bg-primary hover:bg-primary/90 text-white" onClick={() => handleDPAction(dp.id, "send")}>
                              <CheckCircle2 className="mr-2 h-4 w-4" /> Release Commercial Shipment Documents
                            </Button>
                          )}

                          {dp.status === "documents_released" && (
                            <span className="text-xs font-bold text-green-700 bg-green-50 px-4 py-2 rounded-md border border-green-300 flex items-center gap-1.5 font-mono">
                              <CheckCircle2 className="h-4 w-4" /> Collection Paid & Documents Released to Importer
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
