"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, CheckCircle, XCircle, FileSignature, Edit3, Settings2 } from "lucide-react";
import { StatusBadge, ProjectStatus } from "@/components/StatusBadge";
import { sendNotification } from "@/utils/notifications";

export default function AdminOverviewTab({ project, adminId }: { project: any, adminId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Quote form state
  const [quotePrice, setQuotePrice] = useState("");
  const [quoteNotes, setQuoteNotes] = useState("");
  const [quoteDate, setQuoteDate] = useState("");

  // Status manager state
  const [manualStatus, setManualStatus] = useState<ProjectStatus>(project.status as ProjectStatus);

  const handleSendQuote = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    try {
      // 1. Create quote
      const { error: quoteError } = await supabase.from("quotes").insert({
        project_id: project.id,
        admin_id: adminId,
        price: Number(quotePrice),
        currency: "BDT",
        delivery_date: quoteDate || null,
        scope_notes: quoteNotes || null,
        status: "pending"
      });

      if (quoteError) throw quoteError;


      // 2. Update project status
      const { error: projectError } = await supabase.from("projects").update({ status: "quoted" }).eq("id", project.id);
      if (projectError) throw projectError;

      
      alert("Quote sent successfully!");
      router.refresh();
    } catch (err: any) {
      console.error("Error sending quote:", err);
      alert(`Failed to send quote: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentAction = async (paymentId: string, action: "confirmed" | "rejected") => {
    setLoading(true);
    try {
      const { error: paymentError } = await supabase.from("payments").update({ status: action }).eq("id", paymentId);
      if (paymentError) throw paymentError;
      
      if (action === "confirmed") {
        const { error: projectError } = await supabase.from("projects").update({ status: "in_progress" }).eq("id", project.id);
        if (projectError) throw projectError;
      }
      
      alert(`Payment ${action === "confirmed" ? "approved" : "rejected"} successfully.`);
      router.refresh();
    } catch (err: any) {
      console.error(`Error in payment action (${action}):`, err);
      alert(`Failed to verify payment: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.from("projects").update({ status: manualStatus }).eq("id", project.id);
      if (error) throw error;
      
      // Notify student of status update
      await sendNotification({
        userId: project.student_id,
        title: "Project Status Updated",
        message: `The status of your project '${project.title}' has been updated to: ${manualStatus.replace('_', ' ')}`,
        link: `/dashboard/projects/${project.id}`,
        type: "status_update"
      });

      
      alert("Project status updated successfully.");
      router.refresh();
    } catch (err: any) {
      console.error("Error updating status:", err);
      alert(`Failed to update status: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const pendingPayments = project.payments?.filter((p: any) => p.status === "pending") || [];
  const latestQuote = project.quotes?.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2 space-y-6">
        
        {/* Description */}
        <Card className="shadow-sm border-border">
          <CardHeader>
            <CardTitle>Project Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap text-text-secondary leading-relaxed bg-surface-2 p-4 rounded-md text-sm border border-border/50">
              {project.description}
            </div>
          </CardContent>
        </Card>

        {/* Payment Verification Workflow */}
        {pendingPayments.length > 0 && (
          <Card className="shadow-md border-orange-200 bg-orange-50/30">
            <CardHeader>
              <CardTitle className="text-orange-900 flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Payment Verification Needed
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {pendingPayments.map((payment: any) => (
                <div key={payment.id} className="bg-white p-4 rounded-md border border-orange-200 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                  <div>
                    <p className="font-semibold text-text-primary">
                      {payment.amount} BDT via {payment.method.toUpperCase()}
                    </p>
                    <p className="text-sm text-text-secondary font-mono mt-1">TrxID: {payment.transaction_id}</p>
                    {payment.screenshot_url && (
                      <a href={payment.screenshot_url} target="_blank" rel="noopener noreferrer" className="text-xs text-orange-600 hover:underline mt-2 inline-block">
                        View Screenshot
                      </a>
                    )}
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto mt-3 sm:mt-0">
                    <Button 
                      size="sm" 
                      className="bg-success hover:bg-emerald-600 text-white flex-1 sm:flex-none"
                      onClick={() => handlePaymentAction(payment.id, "confirmed")}
                      disabled={loading}
                    >
                      <CheckCircle className="mr-1 h-4 w-4" /> Approve
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-danger border-red-200 hover:bg-red-50 hover:text-red-700 flex-1 sm:flex-none"
                      onClick={() => handlePaymentAction(payment.id, "rejected")}
                      disabled={loading}
                    >
                      <XCircle className="mr-1 h-4 w-4" /> Reject
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

      </div>

      <div className="space-y-6">
        
        {/* Manual Status Manager */}
        <Card className="shadow-sm border-border">
          <CardHeader className="pb-3 border-b border-border/50 bg-surface-2/30">
            <CardTitle className="flex items-center gap-2 text-text-primary text-base">
              <Settings2 className="h-4 w-4 text-text-muted" /> Status Override
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            <div className="flex items-center gap-2">
              <select 
                className="flex flex-1 h-9 w-full rounded-md border border-border bg-white px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                value={manualStatus}
                onChange={(e) => setManualStatus(e.target.value as ProjectStatus)}
              >
                <option value="submitted">Submitted</option>
                <option value="in_review">In Review</option>
                <option value="quoted">Quoted</option>
                <option value="payment_pending">Payment Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="delivered">Delivered</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <Button size="sm" variant="secondary" onClick={handleUpdateStatus} disabled={loading || manualStatus === project.status}>
                Update
              </Button>
            </div>
            <p className="text-xs text-text-muted">Use this to manually move the project state if automatic workflows get stuck.</p>
          </CardContent>
        </Card>

        {/* Quote Creation Workflow */}
        {project.status === "in_review" || project.status === "submitted" ? (
          <form onSubmit={handleSendQuote}>
            <Card className="shadow-md border-purple-200 bg-purple-50/20">
              <CardHeader className="pb-3 border-b border-purple-100 bg-purple-50/50">
                <CardTitle className="text-purple-900 flex items-center gap-2 text-base">
                  <FileSignature className="h-4 w-4" /> Submit Quote
                </CardTitle>
                <CardDescription className="text-purple-700 max-w-xs">
                  Propose a price and timeline to the student.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-purple-900 text-xs font-bold">Total Price (BDT) *</Label>
                  <Input id="price" type="number" required min="1" value={quotePrice} onChange={e => setQuotePrice(e.target.value)} className="bg-white border-purple-200" placeholder="e.g. 5000" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-purple-900 text-xs font-bold">Estimated Delivery Date *</Label>
                  <Input id="date" type="date" required value={quoteDate} onChange={e => setQuoteDate(e.target.value)} className="bg-white border-purple-200" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-purple-900 text-xs font-bold">Scope / Notes (Optional)</Label>
                  <Textarea id="notes" value={quoteNotes} onChange={e => setQuoteNotes(e.target.value)} className="bg-white border-purple-200 min-h-[80px]" placeholder="Outline what is included..." />
                </div>
                
                <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white" disabled={loading}>
                   {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Send Quote
                </Button>
              </CardContent>
            </Card>
          </form>
        ) : latestQuote ? (
          <Card className="shadow-sm border-border bg-surface">
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="text-text-primary text-base flex items-center gap-2">
                <FileSignature className="h-4 w-4 text-text-muted" /> Active Quote
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-2 text-sm">
               <div className="flex justify-between border-b border-border border-dashed pb-2">
                 <span className="text-text-secondary">Amount:</span>
                 <span className="font-bold text-text-primary">{latestQuote.currency} {latestQuote.price}</span>
               </div>
               <div className="flex justify-between border-b border-border border-dashed pb-2">
                 <span className="text-text-secondary">Delivery by:</span>
                 <span className="font-medium text-text-primary">{latestQuote.delivery_date || 'N/A'}</span>
               </div>
               <div className="flex justify-between pb-2">
                 <span className="text-text-secondary">Quote Status:</span>
                 <span className="font-medium capitalize text-text-primary">{latestQuote.status}</span>
               </div>
            </CardContent>
          </Card>
        ) : null}

      </div>
    </div>
  );
}
