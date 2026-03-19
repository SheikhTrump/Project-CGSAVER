"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CreditCard, CheckCircle, XCircle, Clock, Phone, Hash, Upload } from "lucide-react";
import { format } from "date-fns";

export default function PaymentTab({ project, userId }: { project: any; userId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [paymentConfig, setPaymentConfig] = useState<any>(null);
  const [configLoading, setConfigLoading] = useState(true);

  // Form state
  const [paymentMethod, setPaymentMethod] = useState("bkash");
  const [senderNumber, setSenderNumber] = useState("");
  const [trxId, setTrxId] = useState("");
  const [paymentFile, setPaymentFile] = useState<File | null>(null);

  // Fetch payment config
  useEffect(() => {
    async function fetchConfig() {
      const { data } = await supabase
        .from("system_config")
        .select("value")
        .eq("key", "payment_methods")
        .single();
      if (data) setPaymentConfig(data.value);
      setConfigLoading(false);
    }
    fetchConfig();
  }, []);

  const acceptedQuote = project.quotes?.find((q: any) => q.status === "accepted");
  const payments = (project.payments || []).sort(
    (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  const hasPendingPayment = payments.some((p: any) => p.status === "pending");

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trxId || !senderNumber) return;
    setLoading(true);

    try {
      let uploadUrl = null;
      if (paymentFile) {
        const filePath = `${userId}/${project.id}/payment_${Date.now()}_${paymentFile.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("project_files")
          .upload(filePath, paymentFile);
        if (uploadError) throw uploadError;
        if (uploadData) {
          const { data } = supabase.storage.from("project_files").getPublicUrl(uploadData.path);
          uploadUrl = data.publicUrl;
        }
      }

      const quote = acceptedQuote;
      const { error: paymentError } = await supabase.from("payments").insert({
        project_id: project.id,
        amount: quote?.price || 0,
        method: paymentMethod,
        sender_number: senderNumber,
        transaction_id: trxId,
        screenshot_url: uploadUrl,
        status: "pending",
      });

      if (paymentError) throw paymentError;

      // Update project status if not already payment_pending
      if (project.status === "payment_pending") {
        // Status stays as payment_pending
      }

      alert("Payment submitted successfully! An admin will verify it shortly.");
      setSenderNumber("");
      setTrxId("");
      setPaymentFile(null);
      router.refresh();
    } catch (error: any) {
      console.error("Payment submission error:", error);
      alert(`Failed to submit payment: ${error.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const statusIcon = (status: string) => {
    if (status === "confirmed") return <CheckCircle className="h-4 w-4 text-emerald-500" />;
    if (status === "rejected") return <XCircle className="h-4 w-4 text-red-500" />;
    return <Clock className="h-4 w-4 text-orange-500" />;
  };

  const statusBadge = (status: string) => {
    if (status === "confirmed")
      return (
        <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full text-xs font-semibold border border-emerald-200">
          <CheckCircle className="h-3 w-3" /> Confirmed
        </span>
      );
    if (status === "rejected")
      return (
        <span className="inline-flex items-center gap-1 text-red-700 bg-red-50 px-2.5 py-1 rounded-full text-xs font-semibold border border-red-200">
          <XCircle className="h-3 w-3" /> Rejected
        </span>
      );
    return (
      <span className="inline-flex items-center gap-1 text-orange-700 bg-orange-50 px-2.5 py-1 rounded-full text-xs font-semibold border border-orange-200">
        <Clock className="h-3 w-3" /> Pending Review
      </span>
    );
  };

  // Determine if the student can submit a new payment
  const canSubmitPayment =
    project.status === "payment_pending" && acceptedQuote && !hasPendingPayment;

  return (
    <div className="space-y-6">
      {/* Payment History */}
      {payments.length > 0 && (
        <Card className="shadow-sm border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-accent" />
              Payment History
            </CardTitle>
            <CardDescription>All payment submissions for this project.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {payments.map((p: any) => (
                <div
                  key={p.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-surface-2/50 border border-border rounded-lg"
                >
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {statusBadge(p.status)}
                      <span className="text-xs text-text-muted">
                        {format(new Date(p.created_at), "MMM d, yyyy 'at' h:mm a")}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm mt-2">
                      <span className="text-text-primary font-semibold">
                        ৳{Number(p.amount).toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1 text-text-secondary">
                        <Hash className="h-3 w-3" />
                        {p.method?.toUpperCase()}
                      </span>
                      <span className="flex items-center gap-1 text-text-secondary">
                        <Phone className="h-3 w-3" />
                        {p.sender_number || "N/A"}
                      </span>
                      <span className="text-text-muted text-xs">
                        TrxID: <span className="font-mono">{p.transaction_id}</span>
                      </span>
                    </div>
                    {p.admin_note && (
                      <p className="text-xs text-red-600 mt-1 italic">
                        Admin Note: {p.admin_note}
                      </p>
                    )}
                    {p.screenshot_url && (
                      <a
                        href={p.screenshot_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-accent hover:underline mt-1 inline-block"
                      >
                        View Screenshot →
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending verification notice */}
      {hasPendingPayment && (
        <Card className="shadow-sm border-orange-200 bg-orange-50/50">
          <CardContent className="p-6 text-center space-y-2">
            <Loader2 className="h-8 w-8 text-orange-400 animate-spin mx-auto" />
            <p className="font-medium text-orange-900">Payment Verification In Progress</p>
            <p className="text-sm text-orange-700">
              Your latest payment is being reviewed by our team. You'll be notified once it's confirmed.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Submit New Payment Form */}
      {canSubmitPayment && (
        <Card className="shadow-md border-accent/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-text-primary">
              <CreditCard className="h-5 w-5 text-accent" />
              Make a Payment
            </CardTitle>
            <CardDescription>
              {acceptedQuote && (
                <>
                  Amount due:{" "}
                  <span className="font-bold text-text-primary">
                    {acceptedQuote.currency} {Number(acceptedQuote.price).toLocaleString()}
                  </span>
                </>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitPayment} className="space-y-5">
              {/* Payment Account Info */}
              <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200 text-sm text-emerald-900">
                <p className="font-semibold mb-2">Send payment to:</p>
                {configLoading ? (
                  <div className="flex items-center gap-2 text-emerald-500">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span className="text-xs">Loading...</span>
                  </div>
                ) : paymentConfig ? (
                  <div className="space-y-1.5">
                    {paymentConfig.bkash && (
                      <div className="flex justify-between items-center">
                        <span className="font-medium">bKash:</span>
                        <span className="font-mono bg-white px-2.5 py-1 rounded border border-emerald-200 text-sm">
                          {paymentConfig.bkash}
                        </span>
                      </div>
                    )}
                    {paymentConfig.nagad && (
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Nagad:</span>
                        <span className="font-mono bg-white px-2.5 py-1 rounded border border-emerald-200 text-sm">
                          {paymentConfig.nagad}
                        </span>
                      </div>
                    )}
                    {paymentConfig.bank && (
                      <div className="pt-1.5 mt-1.5 border-t border-emerald-200">
                        <p className="text-[10px] uppercase font-bold opacity-60">Bank Transfer</p>
                        <p className="text-xs">{paymentConfig.bank}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-emerald-600">Payment details not configured yet.</p>
                )}
              </div>

              {/* Method */}
              <div className="space-y-2">
                <Label htmlFor="method">Payment Method</Label>
                <select
                  id="method"
                  className="flex h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="bkash">bKash</option>
                  <option value="nagad">Nagad</option>
                  <option value="bank">Bank Transfer</option>
                </select>
              </div>

              {/* Sender Number */}
              <div className="space-y-2">
                <Label htmlFor="senderNumber">
                  Your {paymentMethod === "bank" ? "Account" : paymentMethod === "bkash" ? "bKash" : "Nagad"} Number
                </Label>
                <Input
                  id="senderNumber"
                  required
                  value={senderNumber}
                  onChange={(e) => setSenderNumber(e.target.value)}
                  placeholder="e.g. 01712345678"
                  className="bg-surface"
                />
                <p className="text-xs text-text-muted">The number you sent the payment from.</p>
              </div>

              {/* Transaction ID */}
              <div className="space-y-2">
                <Label htmlFor="trxId">Transaction ID</Label>
                <Input
                  id="trxId"
                  required
                  value={trxId}
                  onChange={(e) => setTrxId(e.target.value)}
                  placeholder="e.g. 9FHD83J2K"
                  className="bg-surface"
                />
              </div>

              {/* Screenshot */}
              <div className="space-y-2">
                <Label htmlFor="screenshot">Payment Screenshot (Optional)</Label>
                <div className="flex items-center gap-3">
                  <Label
                    htmlFor="screenshot"
                    className="cursor-pointer flex items-center gap-2 bg-surface-2 border border-border rounded-md px-4 py-2.5 text-sm text-text-secondary hover:bg-surface-2/80 transition-colors"
                  >
                    <Upload className="h-4 w-4" />
                    {paymentFile ? paymentFile.name : "Choose file..."}
                  </Label>
                  <Input
                    id="screenshot"
                    type="file"
                    onChange={(e) => setPaymentFile(e.target.files?.[0] || null)}
                    className="hidden"
                    accept="image/*"
                  />
                  {paymentFile && (
                    <button
                      type="button"
                      onClick={() => setPaymentFile(null)}
                      className="text-xs text-danger hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-accent hover:bg-accent-hover text-white rounded-pill h-11"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CreditCard className="mr-2 h-4 w-4" />
                )}
                Submit Payment
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* No payment needed states */}
      {project.status !== "payment_pending" && payments.length === 0 && (
        <Card className="shadow-sm border-border">
          <CardContent className="p-10 text-center text-text-muted">
            <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium text-text-secondary">No Payments Yet</p>
            <p className="text-sm mt-1">
              Payments will appear here once a quote is accepted and payment is required.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
