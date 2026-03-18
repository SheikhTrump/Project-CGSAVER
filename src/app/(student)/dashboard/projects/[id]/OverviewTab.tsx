"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, AlertTriangle, FileCheck2, CheckCircle, CreditCard, XCircle } from "lucide-react";

export default function ProjectOverviewTab({ project }: { project: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Payment state
  const [paymentMethod, setPaymentMethod] = useState("bkash");
  const [trxId, setTrxId] = useState("");
  const [paymentFile, setPaymentFile] = useState<File | null>(null);

  const handleQuoteAction = async (action: "accept" | "reject", quoteId: string) => {
    setLoading(true);
    try {
      const newStatus = action === "accept" ? "payment_pending" : "submitted";
      
      // Update Quote
      await supabase.from("quotes").update({ status: action === "accept" ? "accepted" : "rejected" }).eq("id", quoteId);
      
      // Update Project Status
      await supabase.from("projects").update({ status: newStatus }).eq("id", project.id);
      
      router.refresh();
    } catch (e) {
      console.error(e);
      alert("Failed to perform action");
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
        const { data: uploadData } = await supabase.storage.from("project_files").upload(filePath, paymentFile);
        if (uploadData) {
          const { data } = supabase.storage.from("project_files").getPublicUrl(uploadData.path);
          uploadUrl = data.publicUrl;
        }
      }

      // 1. Record payment
      const quote = project.quotes?.find((q: any) => q.status === "accepted");
      await supabase.from("payments").insert({
        project_id: project.id,
        amount: quote?.price || 0,
        method: paymentMethod,
        transaction_id: trxId,
        screenshot_url: uploadUrl,
        status: "pending"
      });

      // 2. We don't change project status to 'in_progress' automatically. Admins verify payment first.
      // But standard platforms might just say "Payment Pending Verification". The DB design says payments start 'pending'.
      // We will leave status as 'payment_pending' or maybe 'in_review_payment'. We'll stick to 'payment_pending' and let admin change to 'in_progress'.

      alert("Payment details submitted successfully. An Admin will verify it shortly.");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to submit payment");
    } finally {
      setLoading(false);
    }
  };

  const handleDeliveryAction = async (action: "complete" | "revision") => {
    setLoading(true);
    try {
      const newStatus = action === "complete" ? "completed" : "revision_requested";
      await supabase.from("projects").update({ status: newStatus }).eq("id", project.id);
      router.refresh();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Find active quote
  const pendingQuote = project.quotes?.find((q: any) => q.status === "pending");
  const acceptedQuote = project.quotes?.find((q: any) => q.status === "accepted");
  const latestPayment = project.payments?.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Left Column: Details */}
      <div className="lg:col-span-2 space-y-6">
        <Card className="shadow-sm border-border">
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
        {project.project_files?.some((f: any) => f.file_type === "deliverable") && (
          <Card className="shadow-sm border-info/20 bg-blue-50/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-info">
                <FileCheck2 className="h-5 w-5" />
                Latest Deliverables
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {project.project_files.filter((f: any) => f.file_type === "deliverable").map((file: any) => (
                  <li key={file.id} className="flex items-center justify-between p-3 bg-surface border border-info/30 rounded-md">
                    <span className="text-sm font-medium text-text-primary">{file.file_name}</span>
                    <Button variant="outline" size="sm" asChild className="text-info border-info hover:bg-info hover:text-white">
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
          <Card className="shadow-md border-purple-200 bg-purple-50/50">
            <CardHeader className="pb-3 text-center">
              <CardTitle className="text-purple-900 border-b border-purple-200 pb-2">Admin Quote</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-center pb-2">
              <div>
                <p className="text-xs text-purple-600 font-semibold uppercase tracking-wider mb-1">Estimated Price</p>
                <p className="text-4xl font-bold text-purple-900">
                  {pendingQuote.currency} {pendingQuote.price}
                </p>
              </div>
              {pendingQuote.delivery_date && (
                <div>
                  <p className="text-sm text-purple-700">Estimated Delivery</p>
                  <p className="font-medium text-purple-900">{pendingQuote.delivery_date}</p>
                </div>
              )}
              {pendingQuote.scope_notes && (
                <div className="bg-white p-3 rounded text-sm text-left text-purple-800 shadow-sm border border-purple-100 italic">
                  "{pendingQuote.scope_notes}"
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-2 pt-4">
              <Button 
                className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-pill" 
                onClick={() => handleQuoteAction('accept', pendingQuote.id)}
                disabled={loading}
              >
                Accept & Proceed to Payment
              </Button>
              <Button 
                variant="ghost" 
                className="w-full text-purple-600 hover:bg-purple-100 rounded-pill"
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
          <Card className="shadow-md border-orange-200 bg-orange-50/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-orange-900">
                <CreditCard className="h-5 w-5" />
                Payment Required
              </CardTitle>
              <CardDescription className="text-orange-700">
                Please pay {acceptedQuote.currency} {acceptedQuote.price} to start work.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {latestPayment?.status === "pending" ? (
                <div className="bg-white p-4 rounded-md border border-orange-200 text-center space-y-2">
                  <Loader2 className="h-8 w-8 text-orange-400 animate-spin mx-auto" />
                  <p className="font-medium text-orange-900">Payment Verification Pending</p>
                  <p className="text-sm text-orange-700">Your payment of {latestPayment.amount} {acceptedQuote.currency} via {latestPayment.method.toUpperCase()} (TrxID: {latestPayment.transaction_id}) is currently under review by our team.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmitPayment} className="space-y-4">
                  <div className="bg-white p-3 rounded-md border border-orange-200 text-sm text-orange-800 space-y-1">
                    <p className="font-semibold">bKash / Nagad Account:</p>
                    <p className="text-lg font-mono tracking-wider">017XXXXXXXX</p>
                    <p className="text-xs opacity-80">(Send Money or Payment)</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="method" className="text-orange-900">Method</Label>
                    <select 
                      id="method" 
                      className="flex h-10 w-full rounded-md border border-orange-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    >
                      <option value="bkash">bKash</option>
                      <option value="nagad">Nagad</option>
                      <option value="bank">Bank Transfer</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="trxId" className="text-orange-900">Transaction ID</Label>
                    <Input id="trxId" required value={trxId} onChange={(e) => setTrxId(e.target.value)} className="bg-white border-orange-200" placeholder="e.g. 9FHD83J2K" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="screenshot" className="text-orange-900">Screenshot (Optional)</Label>
                    <Input id="screenshot" type="file" onChange={(e) => setPaymentFile(e.target.files?.[0] || null)} className="bg-white border-orange-200 text-xs" accept="image/*" />
                  </div>

                  <Button type="submit" className="w-full bg-accent hover:bg-accent-hover text-white rounded-pill mt-2" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Submit Payment Record"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        )}

        {/* Delivery Completion Actions */}
        {project.status === "delivered" && (
          <Card className="shadow-md border-teal-200 bg-teal-50/50">
            <CardHeader className="text-center">
              <CardTitle className="text-teal-900">Project Delivered!</CardTitle>
              <CardDescription className="text-teal-700">Please review the deliverables.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full bg-success hover:bg-emerald-600 text-white rounded-pill h-12 text-md" 
                onClick={() => handleDeliveryAction('complete')}
                disabled={loading}
              >
                <CheckCircle className="mr-2 h-5 w-5" />
                Accept & Mark Completed
              </Button>
              <Button 
                variant="outline" 
                className="w-full text-danger border-red-200 hover:bg-red-50 hover:text-red-700 rounded-pill"
                onClick={() => handleDeliveryAction('revision')}
                disabled={loading}
              >
                <AlertTriangle className="mr-2 h-4 w-4" />
                Request Revision
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Completed State */}
        {project.status === "completed" && (
          <div className="bg-green-50 border border-green-200 rounded-card p-6 text-center shadow-sm">
            <CheckCircle className="h-12 w-12 text-success mx-auto mb-3" />
            <h3 className="font-bold text-green-900 text-lg">Project Completed</h3>
            <p className="text-green-700 text-sm mt-1">Thank you for using CGSAVER! Check your files and messages anytime.</p>
          </div>
        )}

        {/* Cancelled State */}
        {project.status === "cancelled" && (
          <div className="bg-slate-100 border border-slate-200 rounded-card p-6 text-center shadow-sm">
            <XCircle className="h-12 w-12 text-slate-400 mx-auto mb-3" />
            <h3 className="font-bold text-slate-700 text-lg">Project Cancelled</h3>
            <p className="text-slate-500 text-sm mt-1">This project has been cancelled and cannot be reopened.</p>
          </div>
        )}
      </div>
    </div>
  );
}
