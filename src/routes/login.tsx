import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { loginWithSupabase } from "@/lib/supabase";
import { setToken } from "@/lib/api";
import { ArrowRight, Globe } from "lucide-react";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("seller.iraq@tureep.ai");
  const [password, setPassword] = useState("password123");
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

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <a href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <span className="font-mono text-sm font-bold">T</span>
            </div>
            <span className="text-lg font-semibold text-foreground">Tureep AI+</span>
          </a>
        </div>
      </header>

      <div className="mx-auto grid min-h-[calc(100vh-64px)] max-w-7xl items-center gap-12 px-6 lg:grid-cols-2">
        <div className="hidden lg:block">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
            <Globe className="h-3.5 w-3.5" />
            Secure B2B trade terminal
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Access the trade terminal
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Manage products, review AI-generated pre-deals, and track deals end-to-end.
          </p>
          <div className="mt-8 grid gap-4 text-sm text-muted-foreground">
            <p className="flex items-center gap-2 font-mono text-xs">
              <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0"></span>
              <span>Seller (Silver): <strong>seller.iraq@tureep.ai</strong></span>
            </p>
            <p className="flex items-center gap-2 font-mono text-xs">
              <span className="h-2 w-2 rounded-full bg-amber-500 flex-shrink-0"></span>
              <span>Buyer (Gold): <strong>buyer.turkey@tureep.ai</strong></span>
            </p>
            <p className="flex items-center gap-2 font-mono text-xs">
              <span className="h-2 w-2 rounded-full bg-purple-500 flex-shrink-0"></span>
              <span>Global Buyer (Platinum): <strong>buyer.global@tureep.ai</strong></span>
            </p>
            <p className="flex items-center gap-2 font-mono text-xs">
              <span className="h-2 w-2 rounded-full bg-slate-900 flex-shrink-0"></span>
              <span>Compliance Officer (Admin): <strong>admin@tureep.ai</strong></span>
            </p>
            <p className="flex items-center gap-2 font-mono text-xs pt-1 border-t border-border">
              <span className="h-2 w-2 rounded-full bg-green-500 flex-shrink-0"></span>
              <span>Universal Password: <strong>password123</strong></span>
            </p>
          </div>
        </div>

        <Card className="mx-auto w-full max-w-md shadow-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight">Sign in</CardTitle>
            <CardDescription>Enter your credentials to access the terminal.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
              {error && <p className="text-sm font-medium text-red-600">{error}</p>}
              <Button type="submit" className="h-11 w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign in"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>

            {/* Quick 1-Click Sandbox Bypass Buttons */}
            <div className="mt-6 pt-4 border-t border-border space-y-2">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block font-mono">
                Instant 1-Click Snappy Terminal Launch:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <Button size="sm" variant="outline" className="text-xs font-mono h-8 border-primary text-primary hover:bg-primary/5" onClick={() => handleQuickLogin("seller.iraq@tureep.ai")}>
                  Silver Seller (Iraq)
                </Button>
                <Button size="sm" variant="outline" className="text-xs font-mono h-8 border-amber-500 text-amber-700 hover:bg-amber-50" onClick={() => handleQuickLogin("buyer.turkey@tureep.ai")}>
                  Gold Buyer (Turkey)
                </Button>
                <Button size="sm" variant="outline" className="text-xs font-mono h-8 border-purple-500 text-purple-700 hover:bg-purple-50" onClick={() => handleQuickLogin("buyer.global@tureep.ai")}>
                  Platinum Enterprise
                </Button>
                <Button size="sm" variant="outline" className="text-xs font-mono h-8 border-slate-900 text-slate-900 hover:bg-slate-100" onClick={() => handleQuickLogin("admin@tureep.ai")}>
                  Compliance Officer
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
