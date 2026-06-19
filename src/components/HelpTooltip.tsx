import React, { useState } from "react";
import { HelpCircle, ExternalLink, Settings, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";

interface HelpTooltipProps {
  title: string;
  content: React.ReactNode;
  docUrl?: string;
  children?: React.ReactNode;
}

export const HelpTooltip: React.FC<HelpTooltipProps> = ({ title, content, docUrl, children }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative inline-block font-sans select-none" onMouseEnter={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)}>
      {children || (
        <button
          type="button"
          aria-label={`Show institutional engineering help tooltip for ${title}`}
          onClick={() => setShowTooltip(!showTooltip)}
          className="p-1 rounded-full text-surface-400 hover:text-primary-600 hover:bg-surface-100 transition-colors inline-flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <HelpCircle className="w-4 h-4 cursor-pointer" />
        </button>
      )}

      {showTooltip && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-4 bg-surface-900 text-surface-100 rounded-2xl shadow-2xl border border-surface-700 font-mono text-xs animate-slide-in pointer-events-auto select-text">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-surface-800">
            <span className="font-bold text-success-400 font-sans tracking-tight text-sm flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              {title}
            </span>
            <span className="text-[9px] font-bold text-surface-400 uppercase tracking-widest px-2 py-0.5 rounded bg-surface-800">Help SLA</span>
          </div>

          <div className="space-y-2 text-surface-300 leading-relaxed font-sans text-xs">
            {content}
          </div>

          {docUrl && (
            <div className="pt-3 mt-3 border-t border-surface-800 flex items-center justify-between">
              <a
                href={docUrl}
                target="_blank"
                rel="noreferrer"
                className="text-primary-400 hover:text-primary-300 underline inline-flex items-center gap-1 font-semibold text-[11px] font-sans"
              >
                <span>Read Definitive Triage Runbook</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
          {/* Diagnostic Triangle */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-surface-900 border-b border-r border-surface-700 rotate-45 pointer-events-none" />
        </div>
      )}
    </div>
  );
};
