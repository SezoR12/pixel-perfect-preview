import { createFileRoute } from "@tanstack/react-router";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock, ShieldCheck, CheckCircle2, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/hardening-notes")({
  component: HardeningNotesPage,
});

function HardeningNotesPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar activeRoute="hardening-notes" />

      <main className="flex-1 overflow-auto">
        <header className="flex h-16 items-center justify-between border-b border-border bg-white px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Lock className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-semibold text-foreground">HTTPS & Secrets Hardening Guide</h1>
          </div>
          <Badge variant="outline" className="border-green-500 text-green-700 bg-green-50">
            Production Readiness: Phase 1
          </Badge>
        </header>

        <div className="p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 rounded-xl border border-primary/20">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-primary" />
              Securing Tureep AI+ for Production Cross-Border B2B Trade
            </h2>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
              As a trade platform connecting high-risk corridors (Iraq, Iran, Turkey, EU), strict cryptographical hardening, robust secrets orchestration, and absolute network layer security are non-negotiable prerequisites. This document details the step-by-step production hardening specification relative to our current Phase 1 MVP.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-border">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-primary" />
                  <CardTitle>1. Secrets Orchestration & KMS</CardTitle>
                </div>
                <CardDescription>Zero-trust secrets storage replacing hardcoded .env files</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <strong className="text-foreground">AWS Secrets Manager / HashiCorp Vault:</strong> Store production `DATABASE_URL`, `REDIS_URL`, Stripe keys, and bank API credentials in encrypted cloud vaults. Inject into containers at runtime via Task Execution Roles (ECS) or sidecars.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <strong className="text-foreground">Cryptographic Key Hashing:</strong> Upgrade FastAPI JWT validation from static `SECRET_KEY` to asymmetrical RSA-256 / EdDSA keys with regular automated 90-day rotation.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <strong className="text-foreground">Immediate Remediation:</strong> The GitHub personal access token previously exposed during repository clone must be fully revoked in GitHub Settings and replaced with a fine-grained GitHub App repository token or OAuth App with strict expiration.
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  <CardTitle>2. HTTPS, TLS 1.3 & Transport Security</CardTitle>
                </div>
                <CardDescription>Network perimeter and Transport Layer protection</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <strong className="text-foreground">Strict TLS 1.3 Enforcement:</strong> Terminate SSL at Cloudflare / AWS Application Load Balancer (ALB). Disable fallback to legacy TLS 1.0/1.1/1.2 protocols.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <strong className="text-foreground">mTLS for Inter-Service & Bank APIs:</strong> Mutual TLS (mTLS) authentication must be enforced between our microservices and external Letter of Credit / Escrow payment institutional gateways.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <strong className="text-foreground">HSTS Preloading:</strong> Inject HTTP Strict Transport Security headers (`Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`) to prevent SSL stripping man-in-the-middle attacks.
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                <CardTitle>3. Database & Docker Architecture Hardening</CardTitle>
              </div>
              <CardDescription>Infrastructure protection and defense-in-depth configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-secondary p-4 rounded-lg space-y-2">
                  <h4 className="font-semibold text-foreground flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Data-at-Rest Encryption
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Enable AWS KMS AES-256 block-level encryption on all PostgreSQL EBS volumes and S3 document buckets (KYC IDs, custom clearance papers, L/Cs).
                  </p>
                </div>

                <div className="bg-secondary p-4 rounded-lg space-y-2">
                  <h4 className="font-semibold text-foreground flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Container Hardening
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Run all Docker containers with non-root users (`USER 1000:1000`). Drop all default Linux capabilities (`--cap-drop=ALL`) and set root filesystems to read-only (`read_only: true`).
                  </p>
                </div>

                <div className="bg-secondary p-4 rounded-lg space-y-2">
                  <h4 className="font-semibold text-foreground flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Connection Pooling & DDoS
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Place PgBouncer in front of PostgreSQL to absorb connection spikes. Implement rate limiting on all FastAPI authentication and KYC endpoints via Redis token buckets.
                  </p>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <h4 className="text-sm font-semibold text-foreground mb-3">FastAPI Security Headers Production Snippet</h4>
                <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg text-xs font-mono overflow-x-auto">
{`from fastapi.middleware.trustedhost import TrustedHostMiddleware
from starlette.middleware.base import BaseHTTPMiddleware

app.add_middleware(TrustedHostMiddleware, allowed_hosts=["tureep.ai", "*.tureep.ai"])

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)
        response.headers["Content-Security-Policy"] = "default-src 'self'; connect-src 'self' live.stripe.com;"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        return response`}
                </pre>
              </div>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 bg-yellow-50/50">
            <CardContent className="p-4 flex items-center gap-4">
              <AlertTriangle className="h-8 w-8 text-yellow-600 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-yellow-900">Compliance & Sanctions Legal Disclaimer</h4>
                <p className="text-xs text-yellow-800 mt-1 leading-relaxed">
                  Before launching real-money operations in any sanctioned or restricted jurisdiction, our mock screening services must be fully replaced with accredited enterprise KYC/AML vendors (e.g. Sumsub, Persona, Chainalysis) and certified OFAC screening APIs. All transaction hashes and KYC proofs must be archived for a statutory 5-year retention period.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
