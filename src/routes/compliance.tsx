import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Shield,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  Search,
  Upload,
  ChevronRight,
  UserCheck,
  Globe,
  Lock
} from "lucide-react";
import { getKYCStatus, screenSanctions, getMyScreenings, type KYCRecord, type SanctionsScreening } from "@/lib/api";

export const Route = createFileRoute("/compliance")({
  component: CompliancePage,
});

function StatusBadge({ status }: { status: string }) {
  const configs: Record<string, { bg: string; text: string; icon: any }> = {
    approved: { bg: "bg-success-50", text: "text-success-700", icon: CheckCircle2 },
    submitted: { bg: "bg-warning-50", text: "text-warning-700", icon: Clock },
    in_review: { bg: "bg-primary-50", text: "text-primary-700", icon: Clock },
    rejected: { bg: "bg-danger-50", text: "text-danger-700", icon: XCircle },
    pending: { bg: "bg-surface-100", text: "text-surface-600", icon: Clock },
    cleared: { bg: "bg-success-50", text: "text-success-700", icon: ShieldCheck },
  };
  const config = configs[status] || configs.pending;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
      <Icon className="w-3.5 h-3.5" />
      {status.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
    </span>
  );
}

function CompliancePage() {
  const [kyc, setKyc] = useState<KYCRecord | null>(null);
  const [screenings, setScreenings] = useState<SanctionsScreening[]>([]);
  const [loading, setLoading] = useState(true);
  const [screenEntity, setScreenEntity] = useState("");
  const [screening, setScreening] = useState(false);
  const [screenResult, setScreenResult] = useState<any>(null);

  async function loadData() {
    setLoading(true);
    try {
      const [kycData, screeningData] = await Promise.all([
        getKYCStatus(),
        getMyScreenings().catch(() => []),
      ]);
      setKyc(kycData);
      setScreenings(screeningData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleScreen() {
    if (!screenEntity.trim()) return;
    setScreening(true);
    setScreenResult(null);
    try {
      const result = await screenSanctions(screenEntity, "company");
      setScreenResult(result);
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setScreening(false);
    }
  }

  return (
    <div className="space-y-6 animate-slide-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-surface-800">Compliance Center</h1>
        <p className="text-sm text-surface-500 mt-0.5">KYC verification, sanctions screening, and regulatory compliance</p>
      </div>

      {/* Compliance Overview Cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-surface-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-success-50 flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-success-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-surface-800">KYC Status</p>
              <p className="text-xs text-surface-500">Identity verification</p>
            </div>
          </div>
          <StatusBadge status={kyc?.status || "pending"} />
        </div>
        <div className="bg-white rounded-2xl p-5 border border-surface-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-surface-800">Sanctions</p>
              <p className="text-xs text-surface-500">Screening status</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-success-50 text-success-700">
            <CheckCircle2 className="w-3.5 h-3.5" /> Cleared
          </span>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-surface-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
              <Lock className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-surface-800">Trade Ready</p>
              <p className="text-xs text-surface-500">Account status</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-success-50 text-success-700">
            <CheckCircle2 className="w-3.5 h-3.5" /> Verified
          </span>
        </div>
      </div>

      {/* KYC Section */}
      <div className="bg-white rounded-2xl p-6 border border-surface-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
            <FileText className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h3 className="font-bold text-surface-800">KYC Verification</h3>
            <p className="text-sm text-surface-500">Know Your Customer documentation status</p>
          </div>
        </div>

        {kyc ? (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-surface-50 rounded-xl p-4">
                <p className="text-[10px] text-surface-400 uppercase tracking-wider mb-1">Document Type</p>
                <p className="text-sm font-semibold text-surface-800">{kyc.document_type.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}</p>
              </div>
              <div className="bg-surface-50 rounded-xl p-4">
                <p className="text-[10px] text-surface-400 uppercase tracking-wider mb-1">Status</p>
                <StatusBadge status={kyc.status} />
              </div>
              <div className="bg-surface-50 rounded-xl p-4">
                <p className="text-[10px] text-surface-400 uppercase tracking-wider mb-1">Submitted</p>
                <p className="text-sm font-semibold text-surface-800">{new Date(kyc.submitted_at).toLocaleDateString()}</p>
              </div>
              <div className="bg-surface-50 rounded-xl p-4">
                <p className="text-[10px] text-surface-400 uppercase tracking-wider mb-1">Document Hash</p>
                <p className="text-xs font-mono text-surface-600 truncate">{kyc.document_hash.slice(0, 16)}...</p>
              </div>
            </div>
            {kyc.rejection_reason && (
              <div className="flex items-start gap-2 p-4 bg-danger-50 border border-danger-200 rounded-xl">
                <AlertTriangle className="w-4 h-4 text-danger-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-danger-700">{kyc.rejection_reason}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="w-10 h-10 text-surface-300 mx-auto mb-3" />
            <p className="text-surface-500 font-medium">No KYC records found</p>
            <p className="text-sm text-surface-400 mt-1">Submit your verification documents to start trading</p>
          </div>
        )}
      </div>

      {/* Sanctions Screening */}
      <div className="bg-white rounded-2xl p-6 border border-surface-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
            <Search className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-bold text-surface-800">Sanctions Screening</h3>
            <p className="text-sm text-surface-500">Screen entities against OFAC, EU, and UN sanctions lists</p>
          </div>
        </div>

        {/* Screen Tool */}
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <input
              type="text"
              value={screenEntity}
              onChange={(e) => setScreenEntity(e.target.value)}
              placeholder="Enter company or entity name..."
              className="w-full pl-10 pr-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm text-surface-800 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              onKeyDown={(e) => e.key === "Enter" && handleScreen()}
            />
          </div>
          <button
            onClick={handleScreen}
            disabled={screening || !screenEntity.trim()}
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {screening ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            Screen
          </button>
        </div>

        {/* Screen Result */}
        {screenResult && (
          <div className={`p-5 rounded-xl border mb-6 animate-slide-in ${
            screenResult.match_found
              ? "bg-danger-50 border-danger-200"
              : "bg-success-50 border-success-200"
          }`}>
            <div className="flex items-start gap-3">
              {screenResult.match_found ? (
                <AlertTriangle className="w-5 h-5 text-danger-600 flex-shrink-0 mt-0.5" />
              ) : (
                <ShieldCheck className="w-5 h-5 text-success-600 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p className={`text-sm font-semibold ${screenResult.match_found ? "text-danger-800" : "text-success-800"}`}>
                  {screenResult.match_found ? "Match Found — Review Required" : "Entity Cleared"}
                </p>
                <p className={`text-xs mt-1 ${screenResult.match_found ? "text-danger-600" : "text-success-600"}`}>
                  {screenResult.match_details}
                </p>
                <p className="text-[10px] text-surface-400 mt-2">
                  Screened against: {screenResult.screened_against} · {new Date(screenResult.screened_at).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Screening History */}
        {screenings.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-surface-600 mb-3">Screening History</p>
            <div className="space-y-2">
              {screenings.map((s, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-surface-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    {s.match_found ? (
                      <AlertTriangle className="w-4 h-4 text-danger-500" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-success-500" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-surface-800">{s.entity_name}</p>
                      <p className="text-[10px] text-surface-400">{s.screened_against}</p>
                    </div>
                  </div>
                  <StatusBadge status={s.review_status} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Compliance Standards */}
      <div className="bg-gradient-to-r from-primary-50 to-indigo-50 rounded-2xl p-6 border border-primary-100">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-5 h-5 text-primary-600" />
          <h3 className="font-bold text-surface-800">Compliance Standards</h3>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Globe, label: "OFAC SDN", desc: "US Treasury sanctions" },
            { icon: ShieldCheck, label: "EU Sanctions", desc: "European Union lists" },
            { icon: Lock, label: "UN Lists", desc: "United Nations sanctions" },
            { icon: FileText, label: "KYC/AML", desc: "Anti-money laundering" },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="bg-white rounded-xl p-4 border border-primary-100">
                <Icon className="w-5 h-5 text-primary-500 mb-2" />
                <p className="text-sm font-semibold text-surface-800">{item.label}</p>
                <p className="text-xs text-surface-500 mt-0.5">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
