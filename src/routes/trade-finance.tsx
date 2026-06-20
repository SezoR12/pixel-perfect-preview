import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LetterOfCredit, DocumentaryCollection, getLCs, actOnLC, getDPs, actOnDP } from "@/lib/api";
import { CreditCard, ArrowRight, CheckCircle2, AlertTriangle, FileText, Landmark, RefreshCw, Send } from "lucide-react";

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
    { id: "draft", label: "Collection Collection Collection Draft" },
    { id: "sent_to_collecting_bank", label: "Sent to Bank" },
    { id: "presented_to_importer", label: "Presented Importer" },
    { id: "paid", label: "Funds Captured" },
    { id: "documents_released", label: "Docs Released" },
  ];

  return (
    <div className="space-y-8 animate-slide-in font-sans select-none">
      
      {/* Vercel Style Main Overview Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-br from-surface-900 via-surface-800 to-slate-950 text-white p-8 rounded-3xl border border-surface-800 shadow-2xl">
        <div className="space-y-1">
          <Badge className="bg-emerald-500 text-white font-black font-mono text-[10px] uppercase tracking-widest px-3 py-1">Banking gateway</Badge>
          <h1 className="text-3xl font-black tracking-tight text-white font-serif">Trade Finance Instruments & SWIFT MT State Desks</h1>
          <p className="text-xs text-surface-400 font-mono">Simulate SWIFT MT700 L/C instrument transitions and Documentary Collection (D/P) Sight Sight unsealings</p>
        </div>

        <Button
          onClick={load}
          disabled={loading}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-6 py-3.5 h-auto rounded-2xl shadow-lg shadow-emerald-600/30 transition-all select-none cursor-pointer self-start sm:self-auto font-mono flex-shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin animate-pulse" : ""}`} />
          <span>{loading ? "Polling SWIFT Engine..." : "Sync Banking Gateways"}</span>
        </Button>
      </div>

      {error && <p className="text-xs font-bold text-danger-700 bg-danger-50 p-4 rounded-2xl border border-danger-200 select-text font-mono">{error}</p>}
      {success && <p className="text-xs font-bold text-success-700 bg-success-50 p-4 rounded-2xl border border-success-200 select-text font-mono">{success}</p>}

      <Tabs defaultValue="lc" className="w-full">
        <TabsList className="mb-8 grid w-full grid-cols-2 max-w-lg font-mono">
          <TabsTrigger value="lc" className="flex items-center gap-2 font-bold text-xs cursor-pointer h-12">
            <CreditCard className="h-4 w-4 text-emerald-500" />
            <span>SWIFT Letters of Credit (L/C)</span>
          </TabsTrigger>
          <TabsTrigger value="dp" className="flex items-center gap-2 font-bold text-xs cursor-pointer h-12">
            <FileText className="h-4 w-4 text-primary-500" />
            <span>Documentary Collections (D/P)</span>
          </TabsTrigger>
        </TabsList>

        {/* Letters of Credit Desk Tab */}
        <TabsContent value="lc" className="space-y-6">
          {loading ? (
            <p className="text-xs text-muted-foreground font-mono">Querying live SWIFT Letter of Credit API nodes...</p>
          ) : lcs.length === 0 ? (
            <Card className="p-16 text-center bg-white rounded-3xl border border-surface-200 shadow-sm select-none space-y-3">
              <Landmark className="mx-auto h-12 w-12 text-surface-300 animate-pulse" />
              <p className="font-black text-surface-900 text-lg font-sans">Zero Active SWIFT MT700 Instruments</p>
              <p className="text-xs text-surface-500 max-w-md mx-auto leading-relaxed font-sans">
                Convert any handshake proposition from your deal desk with L/C payment terms to initiate an authentic banking Sight sight instrument.
              </p>
            </Card>
          ) : (
            lcs.map((lc) => {
              const currentStepIdx = lcSteps.findIndex((s) => s.id === lc.status);

              return (
                <Card key={lc.id} className="overflow-hidden border border-surface-200 bg-white shadow-sm hover:border-emerald-500/60 transition-all duration-300 rounded-3xl">
                  <CardHeader className="bg-surface-50 border-b border-surface-100 p-6 pb-4 select-none font-sans">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <Badge className="font-mono font-black text-xs bg-emerald-600 text-white uppercase tracking-widest px-3 py-1 shadow-sm border border-emerald-500">
                          {lc.lc_number}
                        </Badge>
                        <CardTitle className="text-lg font-black text-surface-900 tracking-tight">
                          SWIFT MT700 Documentary Credit
                        </CardTitle>
                        <Badge variant={lc.status === "settled" ? "outline" : lc.status === "discrepancies" ? "destructive" : "default"} className={lc.status === "settled" ? "bg-success-50 text-success-700 border-success-300 font-mono uppercase font-black text-[10px]" : "font-mono uppercase font-black text-[10px]"}>
                          ● Status: {lc.status.replace("_", " ")}
                        </Badge>
                      </div>
                      <span className="text-xs text-surface-500 font-mono font-extrabold">
                        Instrument Instrument SLA Expiry: <strong className="text-surface-900">{new Date(lc.expiry_date).toLocaleDateString()}</strong>
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent className="p-8 space-y-8 select-text">
                    
                    {/* Financial Banking Metadata Bar */}
                    <div className="grid md:grid-cols-3 gap-6 p-5 bg-surface-100 rounded-2xl font-mono text-xs border border-surface-200/80 select-text">
                      <div>
                        <span className="font-bold text-surface-500 block mb-1 font-sans uppercase text-[10px] tracking-widest">Issuing Bank Reference</span>
                        <span className="text-surface-900 font-black text-sm select-all block">{lc.issuing_bank}</span>
                      </div>
                      <div>
                        <span className="font-bold text-surface-500 block mb-1 font-sans uppercase text-[10px] tracking-widest">Advising Correspondent Node</span>
                        <span className="text-primary-700 font-extrabold text-sm select-all block">{lc.advising_bank}</span>
                      </div>
                      <div className="bg-emerald-50/80 p-3 rounded-xl border border-emerald-200 text-emerald-950 flex flex-col justify-between -m-1">
                        <span className="font-bold text-emerald-800 block font-sans uppercase text-[10px] tracking-widest">Target Core Face Sum</span>
                        <span className="font-black text-base text-emerald-900 font-mono select-all">${Number(lc.amount).toFixed(2)} {lc.currency}</span>
                      </div>
                    </div>

                    {/* Highly Definitive Timeline Status Explorer */}
                    <div className="space-y-3 select-none">
                      <span className="text-[10px] font-black text-surface-500 uppercase tracking-widest block font-mono pl-1">
                        ICC UCP 600 Visual Trajectory State Machine
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                        {lcSteps.map((step, idx) => {
                          const isCompleted = idx <= (currentStepIdx >= 0 ? currentStepIdx : 0);
                          const isCurrent = step.id === lc.status;

                          return (
                            <div
                              key={step.id}
                              className={`p-3.5 rounded-2xl border text-center transition-all duration-500 flex flex-col justify-between ${
                                isCurrent
                                  ? "bg-emerald-600 text-white font-black border-emerald-500 shadow-lg shadow-emerald-600/30 scale-105 select-none"
                                  : isCompleted
                                  ? "bg-success-50 border-success-200 text-success-900 font-bold"
                                  : "bg-surface-50 border-surface-200 text-surface-400 opacity-60 text-[10px]"
                              }`}
                            >
                              <span className="text-[10px] block font-mono">Stage 0{idx + 1}</span>
                              <span className="text-xs tracking-tight block truncate pt-1">{step.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Specific Discrepancy Action Banner */}
                    {lc.status === "discrepancies" && (
                      <div className="p-5 rounded-2xl bg-danger-50/90 border border-danger-300 text-danger-950 space-y-2 select-text font-sans">
                        <strong className="font-black flex items-center gap-2 text-danger-900 text-sm">
                          <AlertTriangle className="h-5 w-5 text-danger-600 animate-bounce flex-shrink-0" />
                          <span>SWIFT MT734 Refusal Discrepancies Ruled</span>
                        </strong>
                        <p className="text-xs font-mono leading-relaxed select-text text-danger-900/90 pl-7">{lc.discrepancy_notes}</p>
                        <span className="text-[10px] text-danger-800 font-bold block pt-2 border-t border-danger-200 pl-7">
                          ● Action mandated: Exporter must transmit clean phytosanitary papers or corporate applicant must formally waive non-compliant clauses.
                        </span>
                      </div>
                    )}

                    {/* Instrument Instrument Transition Controls */}
                    <div className="pt-6 border-t border-surface-100 flex flex-wrap items-center justify-end gap-3 select-none">
                      {lc.status === "issued" && (
                        <Button size="sm" onClick={() => handleLCAction(lc.id, "advise")} className="bg-primary-600 hover:bg-primary-500 text-white font-bold px-6 py-3 h-auto rounded-xl text-xs font-mono cursor-pointer shadow-md">
                          <Send className="mr-2 h-3.5 w-3.5" /> Simulate SWIFT Advise (MT710)
                        </Button>
                      )}

                      {lc.status === "advised" && (
                        <Button size="sm" className="bg-accent-600 hover:bg-accent-500 text-white font-extrabold px-6 py-3 h-auto rounded-xl text-xs font-sans cursor-pointer shadow-md" onClick={() => handleLCAction(lc.id, "present")}>
                          <FileText className="mr-2 h-4 w-4" /> Present Commercial Presentation Proofs
                        </Button>
                      )}

                      {lc.status === "documents_presented" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-danger-300 text-danger-700 hover:bg-danger-50 font-bold px-5 py-3 h-auto rounded-xl text-xs font-mono cursor-pointer"
                            onClick={() => handleLCAction(lc.id, "discrepancy", "Port FOB customs stamp mismatch identified in Commercial Invoice #8812.")}
                          >
                            <AlertTriangle className="mr-1.5 h-3.5 w-3.5 text-danger-600 flex-shrink-0" /> Simulate MT734 Refusal Note
                          </Button>
                          <Button size="sm" className="bg-success-600 hover:bg-success-500 text-white font-extrabold px-6 py-3 h-auto rounded-xl text-xs font-sans cursor-pointer shadow-md flex items-center gap-1.5" onClick={() => handleLCAction(lc.id, "clean")}>
                            <CheckCircle2 className="w-4 h-4 text-white" /> Shipped Clean Presentation Audit
                          </Button>
                        </>
                      )}

                      {(lc.status === "clean_presentation" || lc.status === "discrepancies") && (
                        <Button size="lg" className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-black px-8 py-4 h-auto rounded-2xl text-xs font-mono shadow-lg shadow-emerald-600/30 cursor-pointer flex items-center justify-center gap-2" onClick={() => handleLCAction(lc.id, "settle")}>
                          <Landmark className="w-4 h-4 fill-white" /> Authorize SWIFT Wire MT756 ($7,500)
                        </Button>
                      )}

                      {lc.status === "settled" && (
                        <span className="text-xs font-black text-success-800 bg-success-50 px-5 py-3 rounded-2xl border border-success-300 flex items-center gap-2 font-mono">
                          <CheckCircle2 className="h-4 w-4 text-success-600 flex-shrink-0" /> ● Documentary Instrument Fully wire Settled & Sight SWIFT Wire MT756 Cleared
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        {/* Documentary Collections Desk Tab */}
        <TabsContent value="dp" className="space-y-6">
          {loading ? (
            <p className="text-xs text-muted-foreground font-mono">Querying Documents Against Payment ledgers...</p>
          ) : dps.length === 0 ? (
            <Card className="p-16 text-center bg-white rounded-3xl border border-surface-200 shadow-sm select-none space-y-3">
              <FileText className="mx-auto h-12 w-12 text-surface-300 animate-bounce" />
              <p className="font-black text-surface-900 text-lg font-sans">Zero Active D/P Cash Transactions</p>
              <p className="text-xs text-surface-500 max-w-md mx-auto leading-relaxed font-sans">
                Formulate an exporter collection draft to register an official URC 522 Documents Against Payment ledger.
              </p>
            </Card>
          ) : (
            dps.map((dp) => {
              const currentStepIdx = dpSteps.findIndex((s) => s.id === dp.status);

              return (
                <Card key={dp.id} className="overflow-hidden border border-surface-200 bg-white shadow-sm hover:border-primary-500/60 transition-all duration-300 rounded-3xl">
                  <CardHeader className="bg-surface-50 border-b border-surface-100 p-6 pb-4 select-none font-sans">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <Badge className="font-mono font-black text-xs bg-primary-600 text-white uppercase tracking-widest px-3 py-1 shadow-sm border border-primary-500">
                          {dp.dp_number}
                        </Badge>
                        <CardTitle className="text-lg font-black text-surface-900 tracking-tight">
                          URC 522 Documentary Collection (D/P)
                        </CardTitle>
                        <Badge variant={dp.status === "documents_released" ? "outline" : "default"} className={dp.status === "documents_released" ? "bg-success-50 text-success-700 border-success-300 font-mono uppercase font-black text-[10px]" : "font-mono uppercase font-black text-[10px]"}>
                          ● Status: {dp.status.replace("_", " ")}
                        </Badge>
                      </div>
                      <span className="text-xs text-surface-500 font-mono font-extrabold">
                        Registered Registration Date: <strong className="text-surface-900">{new Date(dp.created_at).toLocaleDateString()}</strong>
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent className="p-8 space-y-8 select-text">
                    
                    <div className="space-y-3 select-none">
                      <span className="text-[10px] font-black text-surface-500 uppercase tracking-widest block font-mono pl-1">
                        URC 522 Financial Cash Transfer Trajectory
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {dpSteps.map((step, idx) => {
                          const isCompleted = idx <= (currentStepIdx >= 0 ? currentStepIdx : 0);
                          const isCurrent = step.id === dp.status;

                          return (
                            <div
                              key={step.id}
                              className={`p-3.5 rounded-2xl border text-center transition-all duration-500 flex flex-col justify-between ${
                                isCurrent
                                  ? "bg-primary-600 text-white font-black border-primary-500 shadow-lg shadow-primary-600/30 scale-105 select-none"
                                  : isCompleted
                                  ? "bg-success-50 border-success-200 text-success-900 font-bold"
                                  : "bg-surface-50 border-surface-200 text-surface-400 opacity-60 text-[10px]"
                              }`}
                            >
                              <span className="text-[10px] block font-mono">Stage 0{idx + 1}</span>
                              <span className="text-xs tracking-tight block truncate pt-1">{step.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 p-5 bg-surface-100 rounded-2xl font-mono text-xs border border-surface-200/80 select-text">
                      <div>
                        <span className="font-bold text-surface-500 block mb-1 font-sans uppercase text-[10px] tracking-widest">Remitting Bank (Exporter Node)</span>
                        <span className="text-surface-900 font-black text-sm select-all block">{dp.remitting_bank}</span>
                      </div>
                      <div>
                        <span className="font-bold text-surface-500 block mb-1 font-sans uppercase text-[10px] tracking-widest">Collecting Bank (Importer Hub)</span>
                        <span className="text-primary-700 font-extrabold text-sm select-all block">{dp.collecting_bank}</span>
                      </div>
                      <div className="bg-primary-50/80 p-3 rounded-xl border border-primary-200 text-primary-950 flex flex-col justify-between -m-1">
                        <span className="font-bold text-primary-800 block font-sans uppercase text-[10px] tracking-widest">Cash Face Transfer Sum</span>
                        <span className="font-black text-base text-primary-900 font-mono select-all">${Number(dp.amount).toFixed(2)} {dp.currency}</span>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-surface-100 flex flex-wrap items-center justify-end gap-3 select-none">
                      {dp.status === "sent_to_collecting_bank" && (
                        <Button size="sm" className="bg-primary-600 hover:bg-primary-500 text-white font-bold px-6 py-3 h-auto rounded-xl text-xs font-mono cursor-pointer shadow-md" onClick={() => handleDPAction(dp.id, "present")}>
                          <Send className="mr-2 h-3.5 w-3.5" /> Present Formal Trade Documents to Importer
                        </Button>
                      )}

                      {dp.status === "presented_to_importer" && (
                        <Button size="sm" className="bg-success-600 hover:bg-success-500 text-white font-extrabold px-6 py-3 h-auto rounded-xl text-xs font-sans cursor-pointer shadow-md" onClick={() => handleDPAction(dp.id, "pay")}>
                          <Landmark className="mr-2 h-4 w-4" /> Capture Importer Direct Wire Transfer ($3,800)
                        </Button>
                      )}

                      {dp.status === "paid" && (
                        <Button size="lg" className="bg-primary-600 hover:bg-primary-500 text-white font-black px-8 py-4 h-auto rounded-2xl text-xs font-mono shadow-lg shadow-primary-600/30 cursor-pointer flex items-center gap-2" onClick={() => handleDPAction(dp.id, "send")}>
                          <CheckCircle2 className="w-4 h-4 text-yellow-400" /> Release Physical Haulage Bill of Lading
                        </Button>
                      )}

                      {dp.status === "documents_released" && (
                        <span className="text-xs font-black text-success-800 bg-success-50 px-5 py-3 rounded-2xl border border-success-300 flex items-center gap-2 font-mono">
                          <CheckCircle2 className="h-4 w-4 text-success-600 flex-shrink-0" /> ● Cash Transfer Captured Fully & Physical Papers Released
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
  );
}

export default TradeFinancePage;
