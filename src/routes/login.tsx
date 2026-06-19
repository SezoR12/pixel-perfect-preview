import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, Mail, Lock, ArrowRight, Globe, ShieldCheck, Zap } from "lucide-react";
import { login, setToken } from "@/lib/api";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await login(email, password || "password123");
      setToken(res.access_token);
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
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
                Our AI pre-generates institutional deals, clears compliance, and orchestrates logistics.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-4 h-4 text-accent-300" />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">AI-Powered Matching</p>
                  <p className="text-primary-200 text-xs">Smart deal generation based on price, location, and reputation</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-4 h-4 text-accent-300" />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">Secure Escrow</p>
                  <p className="text-primary-200 text-xs">Neutral custody protects every transaction</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Globe className="w-4 h-4 text-accent-300" />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">Global Corridors</p>
                  <p className="text-primary-200 text-xs">Iraq → Turkey → EU trade lanes</p>
                </div>
              </div>
            </div>
          </div>

          <p className="text-primary-300 text-xs">
            Trusted by commodity traders, manufacturers, and logistics operators across the Middle East.
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
                  placeholder="you@company.com"
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
                  placeholder="Enter your password"
                  className={inputClass}
                />
              </div>
              <p className="text-xs text-surface-400 mt-2">Demo: Use any demo email without password</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 disabled:opacity-50 transition-colors shadow-sm"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Sign In <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 p-4 bg-white rounded-xl border border-surface-200">
            <p className="text-xs font-semibold text-surface-600 mb-3">Demo Accounts</p>
            <div className="space-y-2">
              {[
                { email: "seller.iraq@tureep.ai", role: "Seller (Iraq)", tier: "Silver" },
                { email: "buyer.turkey@tureep.ai", role: "Buyer (Turkey)", tier: "Gold" },
                { email: "buyer.global@tureep.ai", role: "Buyer (Global)", tier: "Platinum" },
              ].map((account) => (
                <button
                  key={account.email}
                  onClick={() => setEmail(account.email)}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-surface-50 transition-colors text-left"
                >
                  <div>
                    <p className="text-xs font-medium text-surface-700">{account.email}</p>
                    <p className="text-[10px] text-surface-400">{account.role}</p>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary-50 text-primary-600">
                    {account.tier}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
