import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getKYCStatus, submitKYC } from "@/lib/api";
import { Shield, ArrowLeft, Upload, CheckCircle2, Clock, XCircle } from "lucide-react";

export const Route = createFileRoute("/kyc")({
  component: KYCPage,
});

function KYCPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<string>("pending");
  const [documentType, setDocumentType] = useState("passport");
  const [documentUrl, setDocumentUrl] = useState("");
  const [documentHash, setDocumentHash] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    getKYCStatus()
      .then((kyc) => setStatus(kyc.status))
      .catch(() => setStatus("pending"));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await submitKYC(documentType, documentUrl, documentHash || "sha256-placeholder");
      setSuccess("KYC submitted successfully. Our team will review it.");
      setStatus("submitted");
    } catch (err: any) {
      setError(err.message || "Failed to submit KYC");
    } finally {
      setLoading(false);
    }
  }

  const statusIcons: Record<string, React.ReactNode> = {
    pending: <Clock className="h-8 w-8 text-muted-foreground" />,
    submitted: <Upload className="h-8 w-8 text-primary" />,
    in_review: <Clock className="h-8 w-8 text-yellow-500" />,
    approved: <CheckCircle2 className="h-8 w-8 text-green-500" />,
    rejected: <XCircle className="h-8 w-8 text-red-500" />,
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-6">
          <button onClick={() => navigate({ to: "/dashboard" })} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold text-foreground">KYC Verification</h1>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-10">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>Verify your identity</CardTitle>
                <CardDescription>
                  KYC is required before you can trade on Tureep AI+.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4 rounded-lg bg-secondary p-4">
              {statusIcons[status] || statusIcons.pending}
              <div>
                <p className="font-medium text-foreground">Current status: {status.replace("_", " ")}</p>
                <p className="text-sm text-muted-foreground">
                  {status === "approved"
                    ? "You are verified and can trade."
                    : "Complete the form below to submit your verification documents."}
                </p>
              </div>
            </div>

            {status !== "approved" && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="documentType">Document type</Label>
                  <Select value={documentType} onValueChange={setDocumentType}>
                    <SelectTrigger id="documentType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="passport">Passport</SelectItem>
                      <SelectItem value="national_id">National ID</SelectItem>
                      <SelectItem value="business_license">Business License</SelectItem>
                      <SelectItem value="tax_certificate">Tax Certificate</SelectItem>
                      <SelectItem value="bank_statement">Bank Statement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="documentUrl">Document URL</Label>
                  <Input
                    id="documentUrl"
                    value={documentUrl}
                    onChange={(e) => setDocumentUrl(e.target.value)}
                    placeholder="https://example.com/document.pdf"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    In production, this would be a secure file upload to S3.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="documentHash">Document hash (SHA-256)</Label>
                  <Input
                    id="documentHash"
                    value={documentHash}
                    onChange={(e) => setDocumentHash(e.target.value)}
                    placeholder="Optional integrity hash"
                  />
                </div>
                {error && <p className="text-sm font-medium text-red-600">{error}</p>}
                {success && <p className="text-sm font-medium text-green-600">{success}</p>}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Submitting..." : "Submit KYC"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
