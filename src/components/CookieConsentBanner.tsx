import React, { useState, useEffect } from "react";
import { Shield, CheckCircle2, Settings, X } from "lucide-react";

export const CookieConsentBanner: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [consentState, setConsentState] = useState({
    necessary: true, // Always locked for CSRF and authentic sessions
    analytics: true,
    functional: true,
  });

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("tureep_gdpr_consent") : null;
    if (!saved) {
      setShowBanner(true);
    }
  }, []);

  const saveConsent = (preferences: any) => {
    setConsentState(preferences);
    if (typeof window !== "undefined") {
      localStorage.setItem("tureep_gdpr_consent", JSON.stringify(preferences));
    }
    setShowBanner(false);
  };

  const handleAcceptAll = () => {
    saveConsent({ necessary: true, analytics: true, functional: true });
  };

  const handleRejectNonEssential = () => {
    saveConsent({ necessary: true, analytics: false, functional: false });
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 lg:p-6 select-none animate-slide-in font-sans">
      <div className="max-w-5xl mx-auto bg-surface-900 border border-surface-700 text-surface-50 p-6 lg:p-8 rounded-3xl shadow-2xl space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-primary-500/20 text-primary-400 border border-primary-500/30 flex-shrink-0">
              <Shield className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">Institutional GDPR Privacy & Consent Handshake</h3>
              <p className="text-xs text-surface-400 mt-0.5 max-w-xl leading-relaxed">
                We employ high-performance cryptographic cookies and LocalStorage ledgers to authenticate sessions, run smart heuristic matching algorithms, and assemble regional trade analytics.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="px-4 py-2.5 rounded-xl bg-surface-800 hover:bg-surface-700 text-surface-300 hover:text-white font-semibold text-xs flex items-center gap-2 border border-surface-700 transition-all font-mono"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>{showDetails ? "Hide SLA" : "Customize"}</span>
            </button>
            <button
              onClick={handleRejectNonEssential}
              className="px-4 py-2.5 rounded-xl bg-surface-800 hover:bg-surface-700 text-surface-300 hover:text-white font-semibold text-xs border border-surface-700 transition-all"
            >
              Necessary Only
            </button>
            <button
              onClick={handleAcceptAll}
              className="px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-semibold text-xs shadow-lg shadow-primary-600/30 transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4 text-success-400" />
              Accept Master Terms
            </button>
          </div>
        </div>

        {/* Detailed structural options */}
        {showDetails && (
          <div className="p-5 bg-surface-950/60 rounded-2xl border border-surface-800 space-y-4 text-xs font-mono animate-slide-in">
            <div className="flex items-center justify-between p-3 rounded-xl bg-surface-900 border border-surface-800">
              <div>
                <span className="font-bold text-success-400 block font-sans">Strict Transactional Claims (Necessary)</span>
                <span className="text-[10px] text-surface-400 block font-sans">Absolute prerequisite. Traps active CSRF payloads and encrypts persistent sessions.</span>
              </div>
              <span className="text-[10px] font-bold text-surface-400 uppercase tracking-widest px-2.5 py-1 rounded bg-surface-800">Always Locked</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-surface-900 border border-surface-800">
              <div>
                <span className="font-bold text-white block font-sans">Smart Trade Analytics & Imbalance Matrix</span>
                <span className="text-[10px] text-surface-400 block font-sans">Aggregates anonymized cross-border telemetry to dynamically balance corridor quotes.</span>
              </div>
              <input
                type="checkbox"
                checked={consentState.analytics}
                onChange={(e) => setConsentState({ ...consentState, analytics: e.target.checked })}
                className="w-4 h-4 rounded accent-primary-600 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-surface-900 border border-surface-800">
              <div>
                <span className="font-bold text-white block font-sans">Functional Multi-Tenant Cache & SLA Delay</span>
                <span className="text-[10px] text-surface-400 block font-sans">Remembers specific multilingual font isolation states and pre-deal visibility SLA criteria.</span>
              </div>
              <input
                type="checkbox"
                checked={consentState.functional}
                onChange={(e) => setConsentState({ ...consentState, functional: e.target.checked })}
                className="w-4 h-4 rounded accent-primary-600 cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
