import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getMe, screenSanctions } from "@/lib/api";
import { Shield, ArrowLeft, CheckCircle2, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/sanctions")({
  component: SanctionsPage,
});

function SanctionsPage() {
  const navigate = useNavigate();
  const [entityName, setEntityName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ match_found: boolean; match_details?: string } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getMe().then((user) => {
      if (!entityName) setEntityName(user.name);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);
    try {
      const res = await screenSanctions(entityName, "user");
      setResult(res);
    } catch (err: any) {
      setError(err.message || "Screening failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-6">
          <button onClick={() => navigate({ to: "/dashboard" })} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold text-foreground">Sanctions Screening</h1>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-10">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>Sanctions compliance check</CardTitle>
                <CardDescription>
                  Screen your company or individual name against OFAC, EU, and UN sanctions lists.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="entityName">Entity name</Label>
                <Input
                  id="entityName"
                  value={entityName}
                  onChange={(e) => setEntityName(e.target.value)}
                  placeholder="Company or individual name"
                  required
                />
              </div>
              {error && <p className="text-sm font-medium text-red-600">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Screening..." : "Run sanctions check"}
              </Button>
            </form>

            {result && (
              <div
                className={`flex items-start gap-4 rounded-lg p-4 ${
                  result.match_found ? "bg-red-50" : "bg-green-50"
                }`}
              >
                {result.match_found ? (
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                ) : (
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                )}
                <div>
                  <p className={`font-medium ${result.match_found ? "text-red-700" : "text-green-700"}`}>
                    {result.match_found ? "Potential match found" : "No sanctions match found"}
                  </p>
                  {result.match_details && (
                    <p className="mt-1 text-sm text-muted-foreground">{result.match_details}</p>
                  )}
                </div>
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              [LEGAL REVIEW REQUIRED] This demo uses a small local sanctions list. Production must integrate with live OFAC, EU, and UN lists.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
