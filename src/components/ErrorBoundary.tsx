import React, { Component, ErrorInfo } from "react";
import { AlertTriangle, RefreshCw, ShieldCheck, Home } from "lucide-react";

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("🔒 Enterprise Error Boundary Trapped Exception:", error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  private handleHome = () => {
    if (typeof window !== "undefined") {
      window.location.href = "/dashboard";
    }
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-surface-900 text-surface-50 p-6 font-sans">
          <div className="max-w-xl w-full bg-surface-800 border border-surface-700 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-danger-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-danger-500/20 border border-danger-500/30 flex items-center justify-center text-danger-400 flex-shrink-0">
                <AlertTriangle className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">Enterprise Runtime Exception Trapped</h1>
                <p className="text-xs text-surface-400 font-mono">React JS Error Boundary Isolation Layer</p>
              </div>
            </div>

            <div className="p-4 bg-surface-900/90 rounded-2xl border border-surface-700/80 mb-8 space-y-2 font-mono text-xs overflow-auto max-h-56">
              <span className="text-danger-400 font-bold block font-sans uppercase tracking-widest text-[10px]">Trapped Exception Signature:</span>
              <p className="text-white font-bold">{this.state.error?.message || "Operational lockup identified."}</p>
              {this.state.errorInfo && (
                <pre className="text-surface-400 text-[10px] leading-relaxed pt-2 border-t border-surface-800">
                  {this.state.errorInfo.componentStack}
                </pre>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-surface-700">
              <div className="flex items-center gap-2 text-xs text-success-400 font-mono">
                <ShieldCheck className="w-4 h-4" />
                <span>Sandbox auto-recovery active</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={this.handleHome}
                  className="px-4 py-2.5 rounded-xl bg-surface-700 hover:bg-surface-600 text-white font-semibold text-xs flex items-center gap-2 transition-all"
                >
                  <Home className="w-4 h-4" />
                  Terminal Desk
                </button>
                <button
                  onClick={this.handleReload}
                  className="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-primary-600/30 transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                  🔄 Recovery Reload
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
