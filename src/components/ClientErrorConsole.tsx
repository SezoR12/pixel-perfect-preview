import React, { useState, useEffect } from "react";
import { AlertTriangle, Terminal, X, ChevronDown, ChevronUp } from "lucide-react";

interface TrappedErrorLog {
  id: string;
  timestamp: string;
  message: string;
  source: string;
  lineno?: number;
  colno?: number;
  stack?: string;
  type: "error" | "unhandled_rejection" | "react_error";
}

export const ClientErrorConsole: React.FC = () => {
  const [errorLogs, setErrorLogs] = useState<TrappedErrorLog[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Fully intercept window global errors
    const handleError = (e: ErrorEvent) => {
      const newLog: TrappedErrorLog = {
        id: Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toLocaleTimeString(),
        message: e.message || "Unknown runtime JS exception",
        source: e.filename || "In-Browser Execution",
        lineno: e.lineno,
        colno: e.colno,
        stack: e.error?.stack || "No stack captured by route browser runtime.",
        type: "error",
      };
      
      console.error("🚨 Client Diagnostic Logger Intercepted JS Error:", newLog);
      setErrorLogs((prev) => [newLog, ...prev.slice(0, 49)]); // Retain 50 logs
      setIsOpen(true);
    };

    // 2. Fully intercept unhandled Promise rejections (e.g. failed fetch or async SSR throws)
    const handleRejection = (e: PromiseRejectionEvent) => {
      const reasonStr = typeof e.reason === "string" ? e.reason : e.reason?.message || JSON.stringify(e.reason) || "Promise rejection";
      const newLog: TrappedErrorLog = {
        id: Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toLocaleTimeString(),
        message: `Unhandled Rejection: ${reasonStr}`,
        source: "Async Promise Loop",
        stack: e.reason?.stack || "No async stack available.",
        type: "unhandled_rejection",
      };

      console.error("🚨 Client Diagnostic Logger Intercepted Rejection:", newLog);
      setErrorLogs((prev) => [newLog, ...prev.slice(0, 49)]);
      setIsOpen(true);
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
    };
  }, []);

  if (errorLogs.length === 0 || !isOpen) return null;

  return (
    <div className="fixed top-4 right-4 z-[99999] font-mono select-text pointer-events-auto">
      {/* Minimized Trigger Pill */}
      {isMinimized && (
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-danger-950/95 border-2 border-danger-500 text-danger-300 font-bold text-xs shadow-2xl hover:scale-105 transition-all backdrop-blur-md cursor-pointer"
        >
          <AlertTriangle className="w-4 h-4 text-danger-400 animate-bounce" />
          <span>Trapped Client Errors ({errorLogs.length})</span>
        </button>
      )}

      {/* Expanded Error Console Drawer */}
      {!isMinimized && (
        <div className="w-[90vw] sm:w-[500px] bg-slate-950/95 border-2 border-danger-500 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl flex flex-col justify-between max-h-[75vh] text-surface-50 animate-slide-in">
          {/* Console Header */}
          <div className="p-4 bg-danger-950/60 border-b border-danger-500/40 flex items-center justify-between select-none">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-danger-500/20 text-danger-400 border border-danger-500/30">
                <Terminal className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <h3 className="text-xs font-black text-white tracking-wide">Client Diagnostic Log Trapper</h3>
                <span className="text-[9px] text-danger-300">Absolute Console Error Output</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsMinimized(true)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-surface-400 hover:text-white transition-colors cursor-pointer"
                title="Minimize diagnostic trapper"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button
                onClick={() => { setErrorLogs([]); setIsOpen(false); }}
                className="p-1.5 rounded-lg hover:bg-danger-500/20 text-surface-400 hover:text-danger-400 transition-colors cursor-pointer"
                title="Dismiss error console"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Error Stream Output */}
          <div className="p-4 space-y-3 flex-1 overflow-y-auto select-text text-xs">
            {errorLogs.map((log) => (
              <div key={log.id} className="p-3.5 rounded-2xl bg-danger-950/40 border border-danger-500/30 space-y-1.5 text-danger-200">
                <div className="flex items-center justify-between text-[10px] text-danger-400 border-b border-danger-500/20 pb-1">
                  <span className="font-extrabold uppercase tracking-wider">{log.type.replace("_", " ")}</span>
                  <span className="font-mono text-surface-400">{log.timestamp}</span>
                </div>
                <p className="font-bold text-white text-xs select-text font-sans">{log.message}</p>
                <div className="text-[10px] text-surface-400 flex items-center justify-between pt-1">
                  <span className="truncate max-w-[200px]">Node: {log.source}</span>
                  {log.lineno && <span>Line: {log.lineno}:{log.colno}</span>}
                </div>
                <pre className="p-2 rounded-xl bg-black/80 text-[9px] font-mono text-slate-400 overflow-x-auto leading-relaxed border border-white/5 select-text max-h-36">
                  {log.stack}
                </pre>
              </div>
            ))}
          </div>

          {/* Console Footer */}
          <div className="p-3 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-[10px] text-surface-400">
            <span>Runtime JS Window Logs: <strong className="text-danger-400">Captured Active</strong></span>
            <button
              onClick={() => setErrorLogs([])}
              className="px-2.5 py-1 rounded bg-surface-800 hover:bg-surface-700 text-white font-bold transition-all text-[10px]"
            >
              Clear Log Frame
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
