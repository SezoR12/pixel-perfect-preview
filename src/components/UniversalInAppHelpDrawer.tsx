import React, { useState } from "react";
import { HelpCircle, ExternalLink, Search, Shield, FileText, X, ChevronRight, Sparkles } from "lucide-react";

export const UniversalInAppHelpDrawer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const helpTopics = [
    {
      title: "1. Common Matching Delays & Local Storage Triage",
      category: "Troubleshooting Desk",
      desc: "If your browser preview returns 'Failed to fetch', click any of the 1-click Quick Login bypass pills on the `/login` screen to instantly re-hydrate offline test sessions.",
      docUrl: "/USER_TROUBLESHOOTING_GUIDE.md",
    },
    {
      title: "2. Absolute Pydantic SHA-256 Hashes & KYC Compliance",
      category: "Compliance Protocols",
      desc: "Upload official trade proofs below `/kyc`. Ensure your cryptographic digest contains exactly 64 hexadecimal characters to satisfy automated OFAC and Dow Jones API matching rules.",
      docUrl: "/ENTERPRISE_COMPLIANCE_AND_LEGAL_MANDATE_2026.md",
    },
    {
      title: "3. Trade Finance SWIFT MT700 L/C Instruments",
      category: "Banking Instruments",
      desc: "We generate real-world standardized SWIFT L/C and URC 522 D/P messaging models. Ensure your commercial document presentations match ICC UCP 600 Clean Presentation rulings.",
      docUrl: "/API_DOCUMENTATION_AND_OPENAPI_SPEC.md",
    },
    {
      title: "4. Autonomous Database Saturation & Pooler Triage",
      category: "DevOps & SRE Alarms",
      desc: "If live queries experience QueuePool saturation (min 5, max 20), verify your `DATABASE_URL` maps directly to Supabase Transaction Pooler strings (`*.pooler.supabase.com:6543`).",
      docUrl: "/RUNBOOK_FOR_COMMON_INCIDENTS.md",
    },
    {
      title: "5. Highly Definitive Operational Specifications",
      category: "Master B2B Specs",
      desc: "Authored definitive executive Gap Analyses, Architecture Decision Records (ADRs), and 7-stage state machine Walkthroughs available in full markdown formatting.",
      docUrl: "/APPLICATION_WORKFLOW_COMPLETE_GUIDE.md",
    },
  ];

  const filteredTopics = searchQuery.trim() === ""
    ? helpTopics
    : helpTopics.filter((t) => t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.desc.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="fixed bottom-6 left-6 z-50 font-sans select-none pointer-events-auto">
      {/* Floating In-App Trigger Button */}
      {!isOpen && (
        <button
          type="button"
          aria-label="Launch institutional interactive Self-Help & Documentation desk"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 px-5 py-3.5 rounded-3xl bg-surface-900 hover:bg-surface-800 text-white font-extrabold text-xs shadow-2xl border border-surface-700 hover:border-primary-500 transition-all hover:scale-105 group font-mono tracking-tight cursor-pointer"
        >
          <div className="w-6 h-6 rounded-full bg-primary-600 flex items-center justify-center text-white flex-shrink-0 group-hover:rotate-180 transition-transform duration-500">
            <HelpCircle className="w-3.5 h-3.5" />
          </div>
          <span>💬 Institutional B2B Tooltips & FAQ Desk</span>
        </button>
      )}

      {/* Floating Searchable Self-Help Drawer Component */}
      {isOpen && (
        <div className="absolute bottom-0 left-0 w-[90vw] sm:w-[460px] bg-surface-900 border border-surface-700 rounded-3xl shadow-2xl overflow-hidden animate-slide-in flex flex-col justify-between max-h-[85vh] text-surface-50">
          {/* Top Banner */}
          <div className="p-6 bg-gradient-to-br from-primary-600/20 via-surface-900 to-surface-900 border-b border-surface-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-primary-600 text-white flex-shrink-0 shadow-lg">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white tracking-tight">Tureep In-App Tooltips Desk</h2>
                <p className="text-[10px] text-surface-400 font-mono">2026 Sovereign Documentation & FAQ Assistant</p>
              </div>
            </div>
            <button
              type="button"
              aria-label="Close self-help help desk"
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-2xl hover:bg-surface-800 text-surface-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Interactive Search Bar */}
          <div className="p-4 border-b border-surface-800 bg-surface-950/40">
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 w-4 h-4 text-surface-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search FAQ, incident runbooks, Pydantic constraints..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-surface-800 border border-surface-700 text-xs text-white placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono transition-all"
              />
            </div>
          </div>

          {/* Searchable Topics Ledger */}
          <div className="p-6 space-y-4 flex-1 overflow-y-auto select-text">
            {filteredTopics.length === 0 ? (
              <div className="py-12 text-center text-surface-400 font-mono text-xs">
                <FileText className="w-8 h-8 mx-auto mb-2 text-surface-600" />
                <p>Zero matching documentation topics found.</p>
                <span className="text-[10px]">Try searching for 'Stripe', 'KYC', or 'PgBouncer'.</span>
              </div>
            ) : (
              filteredTopics.map((topic, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-surface-800/80 border border-surface-700/80 space-y-2 group hover:border-primary-500/60 transition-all select-text">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-primary-400 font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-primary-950/80 border border-primary-800">
                      {topic.category}
                    </span>
                  </div>
                  <h3 className="font-bold text-white text-xs leading-tight font-sans select-text">{topic.title}</h3>
                  <p className="text-surface-300 text-xs leading-relaxed font-sans select-text">{topic.desc}</p>
                  
                  <div className="pt-2 flex items-center justify-end border-t border-surface-700/50">
                    <a
                      href={topic.docUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-primary-400 hover:text-primary-300 font-bold inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform font-mono"
                    >
                      <span>Read Full Triage Manual</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Quick Support Footer */}
          <div className="p-4 bg-surface-950 border-t border-surface-800 flex items-center justify-between text-[11px] font-mono text-surface-400">
            <span>SRE On-Call Pool: <strong className="text-success-400">100% Operational</strong></span>
            <a href="/API_DOCUMENTATION_AND_OPENAPI_SPEC.md" target="_blank" rel="noreferrer" className="text-white underline font-semibold">
              OpenAPI Path Spec
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
