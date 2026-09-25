"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, AlertTriangle, FileCheck2, CheckCircle, CreditCard, XCircle } from "lucide-react";
import { notifyAdmins } from "@/utils/notifications";

interface ProjectProps {
  id: string;
  title: string;
  status: string;
  description: string;
  student_id: string;
  quotes?: { id: string; price: number; currency: string; delivery_date?: string; status: string; scope_notes?: string }[];
  payments?: { id: string; amount: number; method: string; transaction_id: string; screenshot_url?: string; status: string; created_at: string }[];
  project_files?: { id: string; file_url: string; file_name: string; file_type: string }[];
}

export default function ProjectOverviewTab({ project }: { project: ProjectProps }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Payment state
  const [paymentMethod] = useState("bkash");
  const [trxId, setTrxId] = useState("");
  const [paymentFile, setPaymentFile] = useState<File | null>(null);
  const [paymentConfig, setPaymentConfig] = useState<{ bkash?: string } | null>(null);

  useEffect(() => {
    async function fetchConfig() {
      const { data } = await supabase
        .from("system_config")
        .select("value")
        .eq("key", "payment_methods")
        .single();

      if (data) {
        setPaymentConfig(data.value);
      }
    }
    fetchConfig();
  }, []);

  const handleQuoteAction = async (action: "accept" | "reject", quoteId: string) => {
    setLoading(true);

    try {
      const newStatus = action === "accept" ? "payment_pending" : "submitted";

      // 1. Update Quote
      const { error: quoteError } = await supabase.from("quotes").update({ status: action === "accept" ? "accepted" : "rejected" }).eq("id", quoteId);
      if (quoteError) throw quoteError;

      // 2. Update Project Status
      const { error: projectError } = await supabase.from("projects").update({ status: newStatus }).eq("id", project.id);
      if (projectError) throw projectError;

      alert(`Quote ${action === "accept" ? "accepted" : "declined"} successfully.`);
      router.refresh();
    } catch (e: unknown) {
      console.error(`Error ${action}ing quote:`, e);
      alert(`Failed to perform action: ${(e as Error).message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trxId) return;
    setLoading(true);


    try {
      let uploadUrl = null;
      if (paymentFile) {
        const filePath = `${project.student_id}/${project.id}/payment_${Date.now()}_${paymentFile.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage.from("project_files").upload(filePath, paymentFile);

        if (uploadError) throw uploadError;

        if (uploadData) {
          const { data } = supabase.storage.from("project_files").getPublicUrl(uploadData.path);
          uploadUrl = data.publicUrl;
        }
      }

      // 1. Record payment
      const quote = project.quotes?.find((q: { status: string }) => q.status === "accepted");
      const { error: paymentError } = await supabase.from("payments").insert({
        project_id: project.id,
        amount: quote?.price || 0,
        method: paymentMethod,
        transaction_id: trxId,
        screenshot_url: uploadUrl,
        status: "pending"
      });

      if (paymentError) throw paymentError;

      alert("Payment details submitted successfully. An Admin will verify it shortly.");
      router.refresh();
    } catch (error: unknown) {
      console.error("Payment submission error:", error);
      alert(`Failed to submit payment: ${(error as Error).message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeliveryAction = async (action: "complete" | "revision") => {
    setLoading(true);

    try {
      const newStatus = action === "complete" ? "completed" : "revision_requested";
      const { error } = await supabase.from("projects").update({ status: newStatus }).eq("id", project.id);

      if (error) throw error;

      // Notify admins of revision request
      if (action === "revision") {
        await notifyAdmins({
          title: "Revision Requested",
          message: `Student requested a revision for project: ${project.title}`,
          link: `/admin/projects/${project.id}`,
          type: "revision_request"
        });

      }

      alert(`Project ${action === "complete" ? "accepted" : "revision request sent"} successfully.`);
      router.refresh();
    } catch (e: unknown) {
      console.error(`Error during ${action} action:`, e);
      alert(`Failed to perform action: ${(e as Error).message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Find active quote
  const pendingQuote = project.quotes?.find((q: { status: string }) => q.status === "pending");
  const acceptedQuote = project.quotes?.find((q: { status: string }) => q.status === "accepted");
  const latestPayment = project.payments?.sort((a: { created_at: string }, b: { created_at: string }) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

      {/* Left Column: Details */}
      <div className="lg:col-span-2 space-y-6">
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Project Description</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap text-text-secondary leading-relaxed bg-surface-2 p-4 rounded-md text-sm border border-border/50">
              {project.description}
            </div>
          </CardContent>
        </Card>

        {/* Deliverables Section (Only show if there are deliverables) */}
        {project.project_files?.some((f: { file_type: string }) => f.file_type === "deliverable") && (
          <Card className="border-border bg-surface">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-text-primary">
                <FileCheck2 className="h-5 w-5" />
                Latest Deliverables
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {project.project_files?.filter((f) => f.file_type === "deliverable").map((file) => (
                  <li key={file.id} className="flex items-center justify-between p-3 bg-surface border border-border rounded-md">
                    <span className="text-sm font-medium text-text-primary">{file.file_name}</span>
                    <Button variant="outline" size="sm" asChild className="text-text-primary border-border hover:bg-surface-2">
                      <a href={file.file_url} target="_blank" rel="noopener noreferrer">Download</a>
                    </Button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Right Column: Actions & Context */}
      <div className="space-y-6">

        {/* Quote Action Card */}
        {project.status === "quoted" && pendingQuote && (
          <Card className="border-border bg-surface">
            <CardHeader className="pb-3 text-center">
              <CardTitle className="text-text-primary border-b border-border pb-2">Admin Quote</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-center pb-2">
              <div>
                <p className="text-xs text-text-muted mb-1">Estimated price</p>
                <p className="text-3xl font-medium tracking-tight tabular-nums text-text-primary">
                  {pendingQuote.currency} {pendingQuote.price}
                </p>
              </div>
              {pendingQuote.delivery_date && (
                <div>
                  <p className="text-sm text-text-secondary">Estimated Delivery</p>
                  <p className="font-medium text-text-primary">{pendingQuote.delivery_date}</p>
                </div>
              )}
              {pendingQuote.scope_notes && (
                <div className="bg-white p-3 rounded text-sm text-left text-text-primary border border-border italic">
                  &quot;{pendingQuote.scope_notes}&quot;
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-2 pt-4">
              <Button
                className="w-full bg-accent hover:bg-accent-hover text-white"
                onClick={() => handleQuoteAction('accept', pendingQuote.id)}
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Accept & Proceed to Payment
              </Button>
              <Button
                variant="ghost"
                className="w-full text-text-secondary hover:bg-surface-2"
                onClick={() => handleQuoteAction('reject', pendingQuote.id)}
                disabled={loading}
              >
                Decline Quote
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Payment Action Card */}
        {project.status === "payment_pending" && acceptedQuote && (
          <Card className="border-border bg-surface">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-text-primary">
                <CreditCard className="h-5 w-5" />
                Payment Required
              </CardTitle>
              <CardDescription className="text-text-secondary">
                Please pay {acceptedQuote.currency} {acceptedQuote.price} to start work.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {latestPayment?.status === "pending" ? (
                <div className="bg-white p-4 rounded-md border border-border text-center space-y-2">
                  <Loader2 className="h-8 w-8 text-text-muted animate-spin mx-auto" />
                  <p className="font-medium text-text-primary">Payment Verification Pending</p>
                  <p className="text-sm text-text-secondary">Your payment of {latestPayment.amount} {acceptedQuote.currency} via {latestPayment.method.toUpperCase()} (TrxID: {latestPayment.transaction_id}) is currently under review by our team.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmitPayment} className="space-y-4">
                  <div className="bg-white p-3 rounded-md border border-border text-sm text-text-primary space-y-1">
                    <p className="font-semibold">Payment Details:</p>
                    {paymentConfig ? (
                      <div className="space-y-2">
                        {paymentConfig.bkash && (
                          <div className="flex justify-between items-center">
                            <span className="font-medium">bKash:</span>
                            <span className="font-mono bg-surface-2 px-2 py-0.5 rounded border border-border">{paymentConfig.bkash}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-text-muted">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span className="text-xs">Loading payment details...</span>
                      </div>
                    )}
                    <p className="text-[10px] opacity-80 mt-2 text-center">(Send Money )</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="method" className="text-text-primary">Method</Label>
                    <Input id="method" value="bKash" disabled className="bg-white border-border" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="trxId" className="text-text-primary">Transaction ID</Label>
                    <Input id="trxId" required value={trxId} onChange={(e) => setTrxId(e.target.value)} className="bg-white border-border" placeholder="e.g. 9FHD83J2K" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="screenshot" className="text-text-primary">Screenshot (Optional)</Label>
                    <Input id="screenshot" type="file" onChange={(e) => setPaymentFile(e.target.files?.[0] || null)} className="bg-white border-border text-xs" accept="image/*" />
                  </div>

                  <Button type="submit" className="w-full bg-accent hover:bg-accent-hover text-white mt-2" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Submit Payment Record"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        )}

        {/* Delivery Completion Actions */}
        {project.status === "delivered" && (
          <Card className="border-border bg-surface">
            <CardHeader className="text-center">
              <CardTitle className="text-text-primary">Project delivered</CardTitle>
              <CardDescription className="text-text-secondary">Please review the deliverables.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full h-10"
                onClick={() => handleDeliveryAction('complete')}
                disabled={loading}
              >
                {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CheckCircle className="mr-2 h-5 w-5" />}
                Accept & Mark Completed
              </Button>
              <Button
                variant="outline"
                className="w-full text-danger border-red-200 hover:bg-red-50 hover:text-red-700"
                onClick={() => handleDeliveryAction('revision')}
                disabled={loading}
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <AlertTriangle className="mr-2 h-4 w-4" />}
                Request Revision
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Completed State */}
        {project.status === "completed" && (
          <div className="bg-surface-2 border border-border rounded-card p-6 text-center">
            <CheckCircle className="h-5 w-5 text-success mx-auto mb-3" />
            <h3 className="font-medium text-text-primary">Project completed</h3>
            <p className="text-text-secondary text-sm mt-1">Thanks for using CGSAVER. Check your files and messages anytime.</p>
          </div>
        )}

        {/* Cancelled State */}
        {project.status === "cancelled" && (
          <div className="bg-surface-2 border border-border rounded-card p-6 text-center">
            <XCircle className="h-5 w-5 text-text-muted mx-auto mb-3" />
            <h3 className="font-medium text-text-secondary">Project cancelled</h3>
            <p className="text-text-muted text-sm mt-1">This project has been cancelled and cannot be reopened.</p>
          </div>
        )}
      </div>
    </div>
  );
}
