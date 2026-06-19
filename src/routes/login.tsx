import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { loginWithSupabase } from "@/lib/supabase";
import { setToken } from "@/lib/api";
import { ArrowRight, Globe, Sparkles, Zap, ShieldCheck, Mail, Lock } from "lucide-react";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("seller.iraq@tureep.ai");
  const [password, setPassword] = useState("Tureep*Auth#2026!xKey");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { session } = await loginWithSupabase(email, password);
      setToken(session?.access_token || `jwt_mock_${email}`);
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  function handleQuickLogin(testEmail: string) {
    if (typeof window !== "undefined") {
      localStorage.setItem("tureep_token", `jwt_mock_${testEmail}`);
    }
    setToken(`jwt_mock_${testEmail}`);
    navigate({ to: "/dashboard" });
  }

  const inputClass = "w-full pl-11 pr-4 py-3 bg-white border border-surface-200 rounded-xl text-sm text-surface-800 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all";

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/3" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-white/3 rounded-full -translate-x-1/2 -translate-y-1/2" />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg tracking-tight">Tureep AI+</h1>
              <p className="text-primary-200 text-[10px] -mt-0.5">Trade Intelligence Platform</p>
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-white mb-4 leading-tight">
                Trade at the speed<br />of intelligence
              </h2>
              <p className="text-primary-100 text-sm leading-relaxed max-w-sm">
                Connect with verified buyers and sellers across Iraq, Iran, Turkey, and global markets. 
                Our platform pre-generates institutional deals, clears compliance, and orchestrates logistics.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-4 h-4 text-accent-300" />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">Smart Trade Matching</p>
                  <p className="text-primary-200 text-xs">Rule-based deal generation evaluating spot ledgers across criteria</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-4 h-4 text-accent-300" />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">Secure Escrow Custody</p>
                  <p className="text-primary-200 text-xs">Neutral custody protects every international shipment</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Globe className="w-4 h-4 text-accent-300" />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">Global Trade Corridors</p>
                  <p className="text-primary-200 text-xs">Iraq → Turkey → EU cross-border trade lanes</p>
                </div>
              </div>
            </div>

            {/* Quick Helper Credentials Text */}
            <div className="pt-6 border-t border-white/10 grid gap-2 text-xs text-primary-200 font-mono">
              <p className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-white flex-shrink-0"></span>
                <span>Seller (Silver): <strong>seller.iraq@tureep.ai</strong></span>
              </p>
              <p className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-400 flex-shrink-0"></span>
                <span>Buyer (Gold): <strong>buyer.turkey@tureep.ai</strong></span>
              </p>
              <p className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-purple-400 flex-shrink-0"></span>
                <span>Global Buyer (Platinum): <strong>buyer.global@tureep.ai</strong></span>
              </p>
              <p className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-slate-900 flex-shrink-0"></span>
                <span>Compliance Officer (Admin): <strong>admin@tureep.ai</strong></span>
              </p>
              <p className="flex items-center gap-2 pt-1 border-t border-white/10">
                <span className="h-2 w-2 rounded-full bg-green-400 flex-shrink-0"></span>
                <span>Universal Password: <strong>Tureep*Auth#2026!xKey</strong></span>
              </p>
            </div>
          </div>

          <p className="text-primary-300 text-xs">
            Trusted by commodity traders, manufacturers, and logistics operators across MENA.
          </p>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-surface-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-surface-800 text-lg">Tureep AI+</h1>
              <p className="text-surface-400 text-[10px] -mt-0.5">Trade Intelligence Platform</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-surface-800 mb-2">Welcome back</h2>
            <p className="text-sm text-surface-500">Sign in to access your trade dashboard</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-4 bg-danger-50 border border-danger-200 rounded-xl text-sm text-danger-700 mb-6">
              <ShieldCheck className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-surface-600 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seller.iraq@tureep.ai"
                  className={inputClass}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-surface-600 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={inputClass}
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full py-3 h-12 text-sm font-semibold rounded-xl bg-primary-600 hover:bg-primary-700 text-white shadow-sm transition-all" disabled={loading}>
              {loading ? "Authenticating..." : "Sign in to Terminal"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          {/* Quick 1-Click Sandbox Bypass Buttons */}
          <div className="mt-8 pt-6 border-t border-surface-200 space-y-3">
            <span className="text-xs font-bold text-surface-500 uppercase tracking-wider block font-sans">
              Instant 1-Click Snappy Terminal Launch:
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              <Button size="sm" variant="outline" className="text-xs font-mono h-10 border-primary-300 text-primary-700 hover:bg-primary-50 rounded-xl" onClick={() => handleQuickLogin("seller.iraq@tureep.ai")}>
                Silver Seller (Iraq)
              </Button>
              <Button size="sm" variant="outline" className="text-xs font-mono h-10 border-amber-300 text-amber-700 hover:bg-amber-50 rounded-xl" onClick={() => handleQuickLogin("buyer.turkey@tureep.ai")}>
                Gold Buyer (Turkey)
              </Button>
              <Button size="sm" variant="outline" className="text-xs font-mono h-10 border-purple-300 text-purple-700 hover:bg-purple-50 rounded-xl" onClick={() => handleQuickLogin("buyer.global@tureep.ai")}>
                Platinum Enterprise
              </Button>
              <Button size="sm" variant="outline" className="text-xs font-mono h-10 border-surface-800 text-surface-900 hover:bg-surface-100 rounded-xl" onClick={() => handleQuickLogin("admin@tureep.ai")}>
                Compliance Officer
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
