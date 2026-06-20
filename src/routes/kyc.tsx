import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getKYCStatus, submitKYC, listPendingKYC, reviewKYC, type KYCRecord, getMe, type User } from "@/lib/api";
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
      setPendingRecords((prev) => prev.filter((r) => r.id !== kycId));
      if (currentUser?.id === kycId) {
        setStatus(reviewStatus);
      }
    } catch (err: any) {
      setAdminError(err.message || "Review action failed");
    }
  }

  const statusIcons: Record<string, React.ReactNode> = {
    pending: <Clock className="h-8 w-8 text-surface-400 flex-shrink-0" />,
    submitted: <Upload className="h-8 w-8 text-primary-600 flex-shrink-0" />,
    in_review: <Clock className="h-8 w-8 text-warning-500 flex-shrink-0" />,
    approved: <CheckCircle2 className="h-8 w-8 text-success-500 flex-shrink-0" />,
    rejected: <XCircle className="h-8 w-8 text-danger-500 flex-shrink-0" />,
  };

  const isAdmin = currentUser?.email?.includes("admin") || false;

  return (
    <div className="space-y-8 animate-slide-in font-sans select-none">
      
      {/* Vercel Style Main Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-900 text-white p-8 rounded-3xl border border-surface-800 shadow-2xl">
        <div className="space-y-1">
          <Badge className="bg-primary-500 text-white font-mono text-[10px] uppercase tracking-widest px-3 py-1">Identity bureau</Badge>
          <h1 className="text-3xl font-black tracking-tight text-white font-serif">KYC & AML Compliance Review Desk</h1>
          <p className="text-xs text-surface-400 font-mono">Verify corporate documentation integrity and establish automated B2B deal execution permissions</p>
        </div>

        {isAdmin && (
          <Badge variant="outline" className="border-primary text-primary bg-primary-50/20 font-mono font-bold text-xs px-4 py-2 self-start sm:self-auto uppercase tracking-wider">
            Compliance Officer Role: Active
          </Badge>
        )}
      </div>

      <div className="max-w-5xl mx-auto space-y-6">
        <Tabs defaultValue={isAdmin ? "admin" : "my-kyc"} className="w-full">
          <TabsList className="mb-6 grid w-full grid-cols-2 max-w-md font-mono">
            <TabsTrigger value="my-kyc" className="flex items-center gap-2 font-bold text-xs cursor-pointer">
              <FileCheck2 className="h-4 w-4" />
              1. My KYC Submission Proof
            </TabsTrigger>
            <TabsTrigger value="admin" className="flex items-center gap-2 font-bold text-xs cursor-pointer">
              <UserCheck className="h-4 w-4" />
              2. Admin Audit Queue
            </TabsTrigger>
          </TabsList>

          {/* User Submission Tab */}
          <TabsContent value="my-kyc">
            <Card className="border border-surface-200 rounded-3xl shadow-sm bg-white select-text">
              <CardHeader className="bg-surface-50 border-b border-surface-100 rounded-t-3xl p-8 pb-6 select-none">
                <div className="flex items-center gap-3">
                  <Shield className="h-8 w-8 text-primary-600 flex-shrink-0" />
                  <div>
                    <CardTitle className="text-xl font-black text-surface-900 font-sans tracking-tight">Verify Your Business Identity</CardTitle>
                    <CardDescription className="text-xs font-mono mt-0.5">
                      Strict cross-border regulatory compliance requires corporate KYC/AML verification prior to enabling formal order settlements.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-8 space-y-6">
                <div className="flex items-center gap-5 rounded-2xl bg-surface-100 p-6 border border-surface-200/80 select-none">
                  {statusIcons[status] || statusIcons.pending}
                  <div>
                    <div className="flex items-center gap-2.5 font-mono">
                      <p className="font-extrabold text-surface-900 capitalize text-sm font-sans">Status: {status.replace("_", " ")}</p>
                      <Badge variant={status === "approved" ? "outline" : "secondary"} className={status === "approved" ? "bg-success-50 text-success-700 border-success-300 font-bold uppercase tracking-wider text-[10px]" : "font-bold uppercase tracking-wider text-[10px]"}>
                        ● {status === "approved" ? "Active Authorized Tier" : "Pending Compliance Audit"}
                      </Badge>
                    </div>
                    <p className="text-xs text-surface-500 font-sans mt-1 leading-relaxed">
                      {status === "approved"
                        ? "Your corporate identity has been fully authenticated. You are authorized to settle escrow instruments and unseal payments."
                        : "Upload your accredited business documentation (Certificate of Incorporation, Tax Certificate, Executive ID) below."}
                    </p>
                  </div>
                </div>

                {status !== "approved" && (
                  <form onSubmit={handleSubmit} className="space-y-6 pt-4 border-t border-surface-100">
                    <div className="grid md:grid-cols-2 gap-6 font-mono text-xs">
                      <div className="space-y-2">
                        <Label htmlFor="documentType" className="font-bold font-sans uppercase text-[10px] tracking-widest text-surface-700">Documentation Type</Label>
                        <Select value={documentType} onValueChange={setDocumentType}>
                          <SelectTrigger id="documentType" className="h-12 rounded-2xl bg-surface-50 border-surface-200 font-bold font-mono">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="passport">Executive Passport (ID)</SelectItem>
                            <SelectItem value="national_id">National Identity Card</SelectItem>
                            <SelectItem value="business_license">Business Trade License</SelectItem>
                            <SelectItem value="tax_certificate">Tax Registration Certificate</SelectItem>
                            <SelectItem value="bank_statement">Corporate Bank Statement</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="documentHash" className="font-bold font-sans uppercase text-[10px] tracking-widest text-surface-700">Cryptographic SHA-256 Hash</Label>
                        <Input
                          id="documentHash"
                          value={documentHash}
                          onChange={(e) => setDocumentHash(e.target.value)}
                          placeholder="e.g. e3b0c44298fc1c149afbf4c8996..."
                          className="h-12 rounded-2xl bg-surface-50 border-surface-200 font-mono text-xs pl-4"
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="documentUrl" className="font-bold font-sans uppercase text-[10px] tracking-widest text-surface-700">Secure File Storage URL</Label>
                        <Input
                          id="documentUrl"
                          value={documentUrl}
                          onChange={(e) => setDocumentUrl(e.target.value)}
                          placeholder="https://s3.tureep.ai/compliance/documents/my_license_2026.pdf"
                          required
                          className="h-12 rounded-2xl bg-surface-50 border-surface-200 font-mono text-xs pl-4"
                        />
                        <p className="text-[10px] text-surface-400 font-sans pt-1">
                          In production, files are uploaded exclusively via pre-signed AWS S3 KMS buckets with robust virus scanning enabled.
                        </p>
                      </div>
                    </div>

                    {error && <p className="text-xs font-bold text-danger-700 bg-danger-50 p-4 rounded-2xl border border-danger-200 select-text font-mono">{error}</p>}
                    {success && <p className="text-xs font-bold text-success-700 bg-success-50 p-4 rounded-2xl border border-success-200 select-text font-mono">{success}</p>}
                    
                    <Button type="submit" className="w-full bg-primary-600 hover:bg-primary-500 text-white font-extrabold py-4 h-auto rounded-2xl shadow-lg shadow-primary-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer font-sans text-xs select-none" disabled={loading}>
                      <Upload className="w-4 h-4 text-yellow-400" />
                      <span>{loading ? "Transmitting Cryptographic Hashes..." : "Submit Regulatory KYC Proof"}</span>
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Compliance Admin Tab */}
          <TabsContent value="admin">
            <Card className="border border-surface-200 rounded-3xl shadow-sm bg-white select-text">
              <CardHeader className="bg-surface-50 border-b border-surface-100 rounded-t-3xl p-8 pb-6 select-none">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-black text-surface-900 font-sans tracking-tight">Compliance Admin Desk</CardTitle>
                    <CardDescription className="text-xs font-mono mt-0.5">
                      Review submitted KYC documents, verify cryptographic Hashes, and approve corporate Master Accounts.
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={loadAdminRecords} disabled={adminLoading} className="font-mono text-xs rounded-xl cursor-pointer">
                    <Clock className="mr-2 h-3.5 w-3.5 text-primary-600" />
                    Refresh Applicant Pools
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-8 space-y-6">
                {!isAdmin ? (
                  <div className="p-10 text-center bg-warning-50 rounded-3xl border border-warning-200 shadow-sm space-y-3 select-none">
                    <AlertCircle className="mx-auto h-12 w-12 text-warning-600 animate-bounce" />
                    <h4 className="text-base font-black text-warning-950 font-sans tracking-tight">Compliance Officer Gatekeeper Role Required</h4>
                    <p className="text-xs text-warning-900 font-sans max-w-md mx-auto leading-relaxed">
                      To access the live compliance admin review queue, you must be logged in as an accredited Compliance Officer. For demo purposes, authenticate with `admin@tureep.ai` (passphrase: `Tureep*Auth#2026!xKey`).
                    </p>
                    <Button className="bg-warning-600 hover:bg-warning-500 text-white font-extrabold px-6 py-3.5 h-auto rounded-2xl shadow-md cursor-pointer font-sans text-xs mt-2" onClick={() => navigate({ to: "/login" })}>
                      Switch to Sovereign Admin Account
                    </Button>
                  </div>
                ) : adminError ? (
                  <Card className="border-danger-200 bg-danger-50 p-4 font-mono text-xs text-danger-700 font-bold">
                    <p>{adminError}</p>
                  </Card>
                ) : adminLoading ? (
                  <p className="text-muted-foreground text-xs font-mono">Scanning compliance multi-tenant ledger...</p>
                ) : pendingRecords.length === 0 ? (
                  <div className="p-16 text-center bg-surface-50 rounded-3xl border border-surface-200 space-y-3 select-none">
                    <CheckCircle2 className="mx-auto h-12 w-12 text-success-500" />
                    <p className="font-extrabold text-surface-900 text-base font-sans">Zero Pending Submissions</p>
                    <p className="text-xs text-surface-500 font-sans leading-relaxed">All active applicant documentation queues have been fully audited and settled.</p>
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {pendingRecords.map((record) => (
                      <Card key={record.id} className="overflow-hidden border border-surface-200 bg-surface-50/50 rounded-2xl shadow-sm">
                        <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                          <div className="space-y-2 flex-1 font-mono text-xs select-text">
                            <div className="flex items-center gap-2 select-none">
                              <Badge className="bg-primary-600 text-white font-mono uppercase font-bold text-[10px] px-2.5 py-0.5">{record.document_type.replace("_", " ")}</Badge>
                              <span className="text-[10px] font-mono text-surface-400 font-bold">Submission Request #{record.id}</span>
                            </div>
                            <p className="font-bold text-surface-900 font-sans select-text">
                              Document File Blob URL: <a href={record.document_url} target="_blank" rel="noreferrer" className="text-primary-600 hover:text-primary-700 underline font-normal font-mono select-all">{record.document_url}</a>
                            </p>
                            <p className="text-[10px] text-surface-500 font-mono select-all pt-0.5">
                              Cryptographic SHA-256 Digest: {record.document_hash}
                            </p>
                          </div>

                          <div className="flex flex-col gap-3 w-full md:w-auto font-sans select-none">
                            <Input
                              placeholder="Rejection legal remarks (if rejecting)"
                              value={rejectionReasons[record.id] || ""}
                              onChange={(e) => setRejectionReasons((prev) => ({ ...prev, [record.id]: e.target.value }))}
                              className="text-xs h-10 rounded-xl bg-white border-surface-200 font-mono pl-3"
                            />
                            <div className="flex gap-2.5 justify-end">
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-danger-300 text-danger-700 hover:bg-danger-50 font-bold font-sans text-xs h-10 px-5 rounded-xl cursor-pointer"
                                onClick={() => handleReview(record.id, "rejected")}
                              >
                                <XCircle className="mr-1.5 h-4 w-4" />
                                Reject Proof
                              </Button>
                              <Button
                                size="sm"
                                className="bg-success-600 hover:bg-success-500 text-white font-extrabold font-sans text-xs h-10 px-6 rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
                                onClick={() => handleReview(record.id, "approved")}
                              >
                                <CheckCircle2 className="w-4 h-4 text-white" />
                                Authenticate Target Profile
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
    </div>
  );
}

export default KYCPage;
