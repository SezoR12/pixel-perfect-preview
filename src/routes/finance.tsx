import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  CreditCard,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
  Banknote,
  ArrowRight,
  ShieldCheck,
  Landmark,
  Send,
  Receipt,
  TrendingUp
} from "lucide-react";
import { getLCs, getDPs, actOnLC, actOnDP, type LetterOfCredit, type DocumentaryCollection } from "@/lib/api";

export const Route = createFileRoute("/finance")({
  component: FinancePage,
});

const lcStatusSteps = [
  { id: "draft", label: "Draft", desc: "L/C being prepared" },
  { id: "issued", label: "Issued", desc: "Issued by applicant bank" },
  { id: "advised", label: "Advised", desc: "Advised to beneficiary" },
  { id: "documents_presented", label: "Docs Presented", desc: "Documents submitted" },
  { id: "clean_presentation", label: "Clean", desc: "No discrepancies" },
  { id: "settled", label: "Settled", desc: "Payment completed" },
];

const dpStatusSteps = [
  { id: "draft", label: "Draft", desc: "D/P being prepared" },
  { id: "sent_to_collecting_bank", label: "Sent", desc: "Sent to collecting bank" },
  { id: "presented_to_importer", label: "Presented", desc: "Presented to importer" },
  { id: "paid", label: "Paid", desc: "Payment received" },
  { id: "documents_released", label: "Released", desc: "Documents released" },
];

function LCWorkflow({ lc, onUpdate }: { lc: LetterOfCredit; onUpdate: () => void }) {
  const [processing, setProcessing] = useState(false);
  const currentIndex = lcStatusSteps.findIndex((s) => s.id === lc.status);
  const nextAction = lc.status === "advised" ? "present" :
                     lc.status === "documents_presented" ? "clean" :
                     lc.status === "clean_presentation" ? "settle" : null;

  async function handleAction() {
    if (!nextAction) return;
    setProcessing(true);
    try {
      await actOnLC(lc.id, nextAction);
      onUpdate();
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-surface-200 card-hover overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center">
              <FileText className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-semibold text-surface-800 text-sm">{lc.lc_number}</h3>
              <p className="text-xs text-surface-500">Letter of Credit</p>
            </div>
          </div>
          <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
            lc.status === "settled" ? "bg-success-50 text-success-700" :
            lc.status === "discrepancies" ? "bg-danger-50 text-danger-700" :
            "bg-primary-50 text-primary-700"
          }`}>
            {lc.status.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div className="bg-surface-50 rounded-xl p-3">
            <p className="text-[10px] text-surface-400 uppercase tracking-wider mb-1">Amount</p>
            <p className="text-sm font-bold text-surface-800">${Number(lc.amount).toFixed(2)} {lc.currency}</p>
          </div>
          <div className="bg-surface-50 rounded-xl p-3">
            <p className="text-[10px] text-surface-400 uppercase tracking-wider mb-1">Issuing Bank</p>
            <p className="text-sm font-bold text-surface-800">{lc.issuing_bank}</p>
          </div>
          <div className="bg-surface-50 rounded-xl p-3">
            <p className="text-[10px] text-surface-400 uppercase tracking-wider mb-1">Advising Bank</p>
            <p className="text-sm font-bold text-surface-800">{lc.advising_bank}</p>
          </div>
          <div className="bg-surface-50 rounded-xl p-3">
            <p className="text-[10px] text-surface-400 uppercase tracking-wider mb-1">Expiry</p>
            <p className="text-sm font-bold text-surface-800">{new Date(lc.expiry_date).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Workflow Steps */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-surface-600">Document Flow</span>
            <span className="text-xs text-surface-400">Step {currentIndex + 1} of {lcStatusSteps.length}</span>
          </div>
          <div className="flex items-center gap-1">
            {lcStatusSteps.map((step, idx) => {
              const isCompleted = idx <= currentIndex;
              const isCurrent = idx === currentIndex;
              return (
                <div key={step.id} className="flex-1 flex flex-col items-center">
                  <div className={`
                    w-full h-2 rounded-full mb-1.5
                    ${isCompleted ? "bg-indigo-500" : "bg-surface-200"}
                    ${isCurrent ? "ring-2 ring-indigo-200" : ""}
                  `} />
                  <p className={`text-[10px] font-medium text-center ${isCompleted ? "text-indigo-700" : "text-surface-400"}`}>
                    {step.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {nextAction && (
          <button
            onClick={handleAction}
            disabled={processing}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            <Send className="w-4 h-4" />
            {processing ? "Processing..." : `Advance to ${nextAction.replace(/_/g, " ")}`}
          </button>
        )}
      </div>
    </div>
  );
}

function DPWorkflow({ dp, onUpdate }: { dp: DocumentaryCollection; onUpdate: () => void }) {
  const [processing, setProcessing] = useState(false);
  const currentIndex = dpStatusSteps.findIndex((s) => s.id === dp.status);
  const nextAction = dp.status === "presented_to_importer" ? "pay" :
                     dp.status === "paid" ? "send" : null;

  async function handleAction() {
    if (!nextAction) return;
    setProcessing(true);
    try {
      await actOnDP(dp.id, nextAction);
      onUpdate();
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-surface-200 card-hover overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-accent-50 flex items-center justify-center">
              <Receipt className="w-6 h-6 text-accent-600" />
            </div>
            <div>
              <h3 className="font-semibold text-surface-800 text-sm">{dp.dp_number}</h3>
              <p className="text-xs text-surface-500">Documentary Collection (D/P)</p>
            </div>
          </div>
          <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
            dp.status === "documents_released" ? "bg-success-50 text-success-700" :
            "bg-accent-50 text-accent-700"
          }`}>
            {dp.status.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div className="bg-surface-50 rounded-xl p-3">
            <p className="text-[10px] text-surface-400 uppercase tracking-wider mb-1">Amount</p>
            <p className="text-sm font-bold text-surface-800">${Number(dp.amount).toFixed(2)} {dp.currency}</p>
          </div>
          <div className="bg-surface-50 rounded-xl p-3">
            <p className="text-[10px] text-surface-400 uppercase tracking-wider mb-1">Remitting Bank</p>
            <p className="text-sm font-bold text-surface-800">{dp.remitting_bank}</p>
          </div>
          <div className="bg-surface-50 rounded-xl p-3">
            <p className="text-[10px] text-surface-400 uppercase tracking-wider mb-1">Collecting Bank</p>
            <p className="text-sm font-bold text-surface-800">{dp.collecting_bank}</p>
          </div>
          <div className="bg-surface-50 rounded-xl p-3">
            <p className="text-[10px] text-surface-400 uppercase tracking-wider mb-1">Status</p>
            <p className="text-sm font-bold text-surface-800">{dp.status.replace(/_/g, " ")}</p>
          </div>
        </div>

        {/* Workflow Steps */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-surface-600">Collection Flow</span>
            <span className="text-xs text-surface-400">Step {currentIndex + 1} of {dpStatusSteps.length}</span>
          </div>
          <div className="flex items-center gap-1">
            {dpStatusSteps.map((step, idx) => {
              const isCompleted = idx <= currentIndex;
              return (
                <div key={step.id} className="flex-1 flex flex-col items-center">
                  <div className={`
                    w-full h-2 rounded-full mb-1.5
                    ${isCompleted ? "bg-accent-500" : "bg-surface-200"}
                  `} />
                  <p className={`text-[10px] font-medium text-center ${isCompleted ? "text-accent-700" : "text-surface-400"}`}>
                    {step.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {nextAction && (
          <button
            onClick={handleAction}
            disabled={processing}
            className="flex items-center gap-2 px-4 py-2 bg-accent-500 text-white rounded-xl text-sm font-semibold hover:bg-accent-600 disabled:opacity-50 transition-colors"
          >
            <Banknote className="w-4 h-4" />
            {processing ? "Processing..." : `Advance to ${nextAction}`}
          </button>
        )}
      </div>
    </div>
  );
}

function FinancePage() {
  const [lcs, setLcs] = useState<LetterOfCredit[]>([]);
  const [dps, setDps] = useState<DocumentaryCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"lc" | "dp">("lc");

  async function loadData() {
    setLoading(true);
    try {
      const [lcData, dpData] = await Promise.all([getLCs(), getDPs()]);
      setLcs(lcData);
      setDps(dpData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6 animate-slide-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-surface-800">Trade Finance</h1>
        <p className="text-sm text-surface-500 mt-0.5">Manage Letters of Credit and Documentary Collections</p>
      </div>

      {/* Payment Methods Overview */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-surface-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
              <FileText className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-surface-800">L/C (Letter of Credit)</p>
              <p className="text-xs text-surface-500">Bank-guaranteed payment</p>
            </div>
          </div>
          <p className="text-xs text-surface-500 leading-relaxed">
            Most secure payment method. Bank guarantees payment upon presentation of compliant documents.
          </p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-surface-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-accent-50 flex items-center justify-center">
              <Receipt className="w-5 h-5 text-accent-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-surface-800">D/P (Documents against Payment)</p>
              <p className="text-xs text-surface-500">Payment before release</p>
            </div>
          </div>
          <p className="text-xs text-surface-500 leading-relaxed">
            Documents released only after importer pays. Lower cost than L/C but less secure.
          </p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-surface-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-surface-800">Escrow</p>
              <p className="text-xs text-surface-500">Neutral custody</p>
            </div>
          </div>
          <p className="text-xs text-surface-500 leading-relaxed">
            Funds held by Tureep until shipping documents and quality inspection are verified.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab("lc")}
          className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
            activeTab === "lc"
              ? "bg-indigo-600 text-white shadow-sm"
              : "bg-white border border-surface-200 text-surface-600 hover:bg-surface-50"
          }`}
        >
          Letters of Credit ({lcs.length})
        </button>
        <button
          onClick={() => setActiveTab("dp")}
          className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
            activeTab === "dp"
              ? "bg-accent-500 text-white shadow-sm"
              : "bg-white border border-surface-200 text-surface-600 hover:bg-surface-50"
          }`}
        >
          Documentary Collections ({dps.length})
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-surface-200 animate-pulse">
              <div className="h-4 bg-surface-200 rounded w-1/3 mb-4" />
              <div className="h-2 bg-surface-200 rounded mb-4" />
            </div>
          ))}
        </div>
      ) : activeTab === "lc" ? (
        lcs.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 border border-surface-200 text-center">
            <FileText className="w-12 h-12 text-surface-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-surface-700 mb-1">No Letters of Credit</h3>
            <p className="text-sm text-surface-500">L/Cs will appear here when created for orders</p>
          </div>
        ) : (
          <div className="space-y-4 stagger-children">
            {lcs.map((lc) => (
              <LCWorkflow key={lc.id} lc={lc} onUpdate={loadData} />
            ))}
          </div>
        )
      ) : (
        dps.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 border border-surface-200 text-center">
            <Receipt className="w-12 h-12 text-surface-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-surface-700 mb-1">No Documentary Collections</h3>
            <p className="text-sm text-surface-500">D/Ps will appear here when created for orders</p>
          </div>
        ) : (
          <div className="space-y-4 stagger-children">
            {dps.map((dp) => (
              <DPWorkflow key={dp.id} dp={dp} onUpdate={loadData} />
            ))}
          </div>
        )
      )}
    </div>
  );
}
