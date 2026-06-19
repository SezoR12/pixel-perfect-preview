import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getKYCStatus, submitKYC, listPendingKYC, reviewKYC, KYCRecord, getMe, User } from "@/lib/api";
import { Shield, ArrowLeft, Upload, CheckCircle2, Clock, XCircle, FileCheck2, UserCheck, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/kyc")({
  component: KYCPage,
});

function KYCPage() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [status, setStatus] = useState<string>("pending");
  const [documentType, setDocumentType] = useState("passport");
  const [documentUrl, setDocumentUrl] = useState("");
  const [documentHash, setDocumentHash] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Admin state
  const [pendingRecords, setPendingRecords] = useState<KYCRecord[]>([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState("");
  const [rejectionReasons, setRejectionReasons] = useState<Record<number, string>>({});

  useEffect(() => {
    getMe().then((u) => {
      setCurrentUser(u);
      if (u.email.includes("admin")) {
        loadAdminRecords();
      }
    });

    getKYCStatus()
      .then((kyc) => setStatus(kyc.status))
      .catch(() => setStatus("pending"));
  }, []);

  async function loadAdminRecords() {
    setAdminLoading(true);
    setAdminError("");
    try {
      const records = await listPendingKYC();
      setPendingRecords(records);
    } catch (err: any) {
      setAdminError(err.message || "Failed to load admin KYC records. (Demo Note: User email must contain 'admin')");
    } finally {
      setAdminLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await submitKYC(documentType, documentUrl, documentHash || "sha256-placeholder");
      setSuccess("KYC submitted successfully. Our compliance team will review it.");
      setStatus("submitted");
    } catch (err: any) {
      setError(err.message || "Failed to submit KYC");
    } finally {
      setLoading(false);
    }
  }

  async function handleReview(kycId: number, reviewStatus: "approved" | "rejected") {
    try {
      const reason = reviewStatus === "rejected" ? (rejectionReasons[kycId] || "Incomplete documentation") : undefined;
      await reviewKYC(kycId, reviewStatus, reason);
      setPendingRecords(pendingRecords.filter((r) => r.id !== kycId));
      if (currentUser?.id === kycId) {
        setStatus(reviewStatus);
      }
    } catch (err: any) {
      setAdminError(err.message || "Review action failed");
    }
  }

  const statusIcons: Record<string, React.ReactNode> = {
    pending: <Clock className="h-8 w-8 text-muted-foreground flex-shrink-0" />,
    submitted: <Upload className="h-8 w-8 text-primary flex-shrink-0" />,
    in_review: <Clock className="h-8 w-8 text-yellow-500 flex-shrink-0" />,
    approved: <CheckCircle2 className="h-8 w-8 text-green-500 flex-shrink-0" />,
    rejected: <XCircle className="h-8 w-8 text-red-500 flex-shrink-0" />,
  };

  const isAdmin = currentUser?.email?.includes("admin") || false;

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar activeRoute="kyc" />

      <main className="flex-1 overflow-auto">
        <header className="flex h-16 items-center justify-between border-b border-border bg-white px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate({ to: "/dashboard" })} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-semibold text-foreground">KYC & AML Workflow Management</h1>
          </div>
          {isAdmin && (
            <Badge variant="outline" className="border-primary text-primary bg-primary/5">
              Compliance Officer Role: Active
            </Badge>
          )}
        </header>

        <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
          <Tabs defaultValue={isAdmin ? "admin" : "my-kyc"} className="w-full">
            <TabsList className="mb-6 grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="my-kyc" className="flex items-center gap-2">
                <FileCheck2 className="h-4 w-4" />
                My KYC Submission
              </TabsTrigger>
              <TabsTrigger value="admin" className="flex items-center gap-2">
                <UserCheck className="h-4 w-4" />
                Compliance Admin Review
              </TabsTrigger>
            </TabsList>

            {/* User Submission Tab */}
            <TabsContent value="my-kyc">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Shield className="h-8 w-8 text-primary flex-shrink-0" />
                    <div>
                      <CardTitle>Verify Your Business Identity</CardTitle>
                      <CardDescription>
                        Strict cross-border regulatory compliance requires corporate KYC/AML verification prior to enabling active deal execution.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-4 rounded-xl bg-secondary/50 p-5 border border-border">
                    {statusIcons[status] || statusIcons.pending}
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-foreground capitalize">Status: {status.replace("_", " ")}</p>
                        <Badge variant={status === "approved" ? "outline" : "secondary"} className={status === "approved" ? "bg-green-50 text-green-700 border-green-300" : ""}>
                          {status === "approved" ? "Active Tier" : "Pending Audit"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {status === "approved"
                          ? "Your corporate identity has been fully authenticated. You are authorized to settle escrow payments."
                          : "Upload your accredited business documentation (Certificate of Incorporation, Tax Certificate, ID) below."}
                      </p>
                    </div>
                  </div>

                  {status !== "approved" && (
                    <form onSubmit={handleSubmit} className="space-y-5 pt-2 border-t border-border">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="documentType">Documentation Type</Label>
                          <Select value={documentType} onValueChange={setDocumentType}>
                            <SelectTrigger id="documentType">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="passport">Executive Passport</SelectItem>
                              <SelectItem value="national_id">National Identity Card</SelectItem>
                              <SelectItem value="business_license">Business Trade License</SelectItem>
                              <SelectItem value="tax_certificate">Tax Registration Certificate</SelectItem>
                              <SelectItem value="bank_statement">Corporate Bank Statement</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="documentHash">Cryptographic SHA-256 Hash</Label>
                          <Input
                            id="documentHash"
                            value={documentHash}
                            onChange={(e) => setDocumentHash(e.target.value)}
                            placeholder="e.g. e3b0c44298fc1c149afbf4c8996..."
                          />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="documentUrl">Secure File Storage URL</Label>
                          <Input
                            id="documentUrl"
                            value={documentUrl}
                            onChange={(e) => setDocumentUrl(e.target.value)}
                            placeholder="https://s3.tureep.ai/compliance/documents/my_license_2026.pdf"
                            required
                          />
                          <p className="text-xs text-muted-foreground">
                            In production, files are uploaded via pre-signed AWS S3 KMS buckets with virus scanning enabled.
                          </p>
                        </div>
                      </div>

                      {error && <p className="text-sm font-medium text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">{error}</p>}
                      {success && <p className="text-sm font-medium text-green-600 bg-green-50 p-3 rounded-lg border border-green-200">{success}</p>}
                      
                      <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white py-2.5" disabled={loading}>
                        <Upload className="mr-2 h-4 w-4" />
                        {loading ? "Transmitting Securely..." : "Submit Regulatory KYC Proof"}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Compliance Admin Tab */}
            <TabsContent value="admin">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Compliance Admin Desk</CardTitle>
                      <CardDescription>
                        Review submitted KYC documents, verify cryptographic integrity, and approve corporate trading tiers.
                      </CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={loadAdminRecords} disabled={adminLoading}>
                      <Clock className="mr-2 h-4 w-4" />
                      Refresh Pool
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!isAdmin ? (
                    <div className="p-8 text-center bg-yellow-50/50 rounded-xl border border-yellow-200">
                      <AlertCircle className="mx-auto h-10 w-10 text-yellow-600 mb-2" />
                      <h4 className="text-sm font-bold text-yellow-900">Compliance Officer Role Required</h4>
                      <p className="text-xs text-yellow-800 mt-1 max-w-md mx-auto leading-relaxed">
                        To access the live review queue, you must be logged in as an accredited Compliance Officer. For demo purposes, log in with `admin@tureep.ai` (password: `Tureep*Auth#2026!xKey`).
                      </p>
                      <Button className="mt-4 bg-yellow-600 hover:bg-yellow-700 text-white" onClick={() => navigate({ to: "/login" })}>
                        Switch to Admin Demo Account
                      </Button>
                    </div>
                  ) : adminError ? (
                    <Card className="border-red-200 bg-red-50 p-4">
                      <p className="text-sm font-medium text-red-700">{adminError}</p>
                    </Card>
                  ) : adminLoading ? (
                    <p className="text-muted-foreground text-sm">Scanning compliance ledger...</p>
                  ) : pendingRecords.length === 0 ? (
                    <div className="p-12 text-center bg-secondary/30 rounded-xl border border-border">
                      <CheckCircle2 className="mx-auto h-10 w-10 text-green-600" />
                      <p className="mt-3 font-medium text-foreground">Zero Pending Submissions</p>
                      <p className="text-xs text-muted-foreground mt-1">All applicant queues have been fully audited and settled.</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {pendingRecords.map((record) => (
                        <Card key={record.id} className="overflow-hidden border border-border bg-white shadow-sm">
                          <CardContent className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div className="space-y-1.5 flex-1">
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="uppercase font-mono text-xs">{record.document_type.replace("_", " ")}</Badge>
                                <span className="text-xs font-mono text-muted-foreground">Submission #{record.id}</span>
                              </div>
                              <p className="text-sm font-bold text-foreground">
                                Document URL: <a href={record.document_url} target="_blank" rel="noreferrer" className="text-primary underline font-normal">{record.document_url}</a>
                              </p>
                              <p className="text-xs text-muted-foreground font-mono">
                                SHA-256 Hash: {record.document_hash}
                              </p>
                            </div>

                            <div className="flex flex-col gap-2.5 w-full md:w-auto">
                              <Input
                                size={30}
                                placeholder="Rejection note (if rejecting)"
                                value={rejectionReasons[record.id] || ""}
                                onChange={(e) => setRejectionReasons({ ...rejectionReasons, [record.id]: e.target.value })}
                                className="text-xs h-8"
                              />
                              <div className="flex gap-2 justify-end">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-red-300 text-red-700 hover:bg-red-50"
                                  onClick={() => handleReview(record.id, "rejected")}
                                >
                                  <XCircle className="mr-1.5 h-4 w-4" />
                                  Reject
                                </Button>
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                  onClick={() => handleReview(record.id, "approved")}
                                >
                                  <CheckCircle2 className="mr-1.5 h-4 w-4" />
                                  Approve KYC
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
