"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import {
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Phone,
  ExternalLink,
  Image as ImageIcon,
} from "lucide-react";
import Link from "next/link";

type Payment = {
  id: string;
  project_id: string;
  amount: number;
  method: string;
  sender_number?: string;
  transaction_id: string;
  screenshot_url?: string;
  status: string;
  admin_note?: string;
  created_at: string;
  projects?: {
    title: string;
    student_id: string;
    profiles?: {
      full_name: string;
      email: string;
    };
  };
};

export default function AdminPaymentsPage() {
  const { isLoading: authLoading } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState<{ [key: string]: string }>({});
  const [showRejectInput, setShowRejectInput] = useState<string | null>(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  async function fetchPayments() {
    setLoading(true);
    const { data, error } = await supabase
      .from("payments")
      .select("*, projects(title, student_id, profiles!student_id(full_name, email))")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setPayments(data as Payment[]);
    }
    setLoading(false);
  }

  const handleConfirm = async (paymentId: string, projectId: string) => {
    setActionLoading(paymentId);
    try {
      // 1. Update payment status
      const { error: payError } = await supabase
        .from("payments")
        .update({ status: "confirmed" })
        .eq("id", paymentId);
      if (payError) throw payError;

      // 2. Update project status to in_progress
      const { error: projError } = await supabase
        .from("projects")
        .update({ status: "in_progress" })
        .eq("id", projectId);
      if (projError) throw projError;

      await fetchPayments();
    } catch (err: unknown) {
      console.error("Error confirming payment:", err);
      alert("Failed to confirm payment: " + ((err as Error).message || "Unknown error"));
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (paymentId: string) => {
    setActionLoading(paymentId);
    try {
      const { error } = await supabase
        .from("payments")
        .update({
          status: "rejected",
          admin_note: rejectNote[paymentId] || "Payment rejected by admin.",
        })
        .eq("id", paymentId);
      if (error) throw error;

      setShowRejectInput(null);
      setRejectNote((prev) => ({ ...prev, [paymentId]: "" }));
      await fetchPayments();
    } catch (err: unknown) {
      console.error("Error rejecting payment:", err);
      alert("Failed to reject payment: " + ((err as Error).message || "Unknown error"));
    } finally {
      setActionLoading(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-danger" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-text-primary">Payment Management</h1>
        <p className="text-text-secondary mt-1">
          Review, verify, and manage all student payment submissions.
        </p>
      </div>

      <Card className="shadow-sm border-border overflow-hidden">
        {payments.length === 0 ? (
          <div className="p-12 text-center text-text-muted">
            <CreditCard className="mx-auto h-12 w-12 opacity-50 mb-3" />
            <p>No transactions found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-surface-2/50 text-text-secondary text-xs uppercase border-b border-border">
                <tr>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4">Student</th>
                  <th className="px-5 py-4">Project</th>
                  <th className="px-5 py-4">Amount</th>
                  <th className="px-5 py-4">Details</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-surface">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-surface-2/30 transition-colors">
                    <td className="px-5 py-4 text-text-secondary whitespace-nowrap text-xs">
                      {format(new Date(p.created_at), "MMM d, yyyy")}
                      <br />
                      <span className="text-text-muted">
                        {format(new Date(p.created_at), "h:mm a")}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-medium text-text-primary block">
                        {p.projects?.profiles?.full_name || "Unknown"}
                      </span>
                      <span className="text-xs text-text-muted">
                        {p.projects?.profiles?.email}
                      </span>
                    </td>
                    <td className="px-5 py-4 max-w-[180px]">
                      <Link
                        href={`/admin/projects/${p.project_id}`}
                        className="hover:text-danger hover:underline text-text-primary font-medium truncate block"
                      >
                        {p.projects?.title}
                      </Link>
                    </td>
                    <td className="px-5 py-4 font-bold text-text-primary whitespace-nowrap">
                      ৳{Number(p.amount).toLocaleString()}
                    </td>
                    <td className="px-5 py-4">
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-1 text-text-secondary">
                          <CreditCard className="h-3 w-3" />
                          {p.method?.toUpperCase()}
                        </div>
                        {p.sender_number && (
                          <div className="flex items-center gap-1 text-text-secondary">
                            <Phone className="h-3 w-3" />
                            {p.sender_number}
                          </div>
                        )}
                        <div className="text-text-muted">
                          TrxID: <span className="font-mono">{p.transaction_id}</span>
                        </div>
                        {p.screenshot_url && (
                          <a
                            href={p.screenshot_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-accent hover:underline"
                          >
                            <ImageIcon className="h-3 w-3" />
                            Screenshot
                            <ExternalLink className="h-2.5 w-2.5" />
                          </a>
                        )}
                        {p.admin_note && (
                          <p className="text-red-500 italic">Note: {p.admin_note}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {p.status === "confirmed" ? (
                        <span className="inline-flex items-center text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full text-xs font-semibold border border-emerald-200">
                          <CheckCircle className="h-3 w-3 mr-1" /> Confirmed
                        </span>
                      ) : p.status === "rejected" ? (
                        <span className="inline-flex items-center text-red-600 bg-red-50 px-2.5 py-1 rounded-full text-xs font-semibold border border-red-200">
                          <XCircle className="h-3 w-3 mr-1" /> Rejected
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full text-xs font-semibold border border-orange-200">
                          <Clock className="h-3 w-3 mr-1" /> Pending
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {p.status === "pending" ? (
                        <div className="flex flex-col items-end gap-2">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-pill text-xs h-8 px-3"
                              disabled={actionLoading === p.id}
                              onClick={() => handleConfirm(p.id, p.project_id)}
                            >
                              {actionLoading === p.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <>
                                  <CheckCircle className="h-3 w-3 mr-1" /> Confirm
                                </>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-200 text-red-600 hover:bg-red-50 rounded-pill text-xs h-8 px-3"
                              disabled={actionLoading === p.id}
                              onClick={() =>
                                setShowRejectInput(
                                  showRejectInput === p.id ? null : p.id
                                )
                              }
                            >
                              <XCircle className="h-3 w-3 mr-1" /> Reject
                            </Button>
                          </div>
                          {showRejectInput === p.id && (
                            <div className="flex gap-2 w-full max-w-[250px]">
                              <Input
                                placeholder="Reason (optional)"
                                value={rejectNote[p.id] || ""}
                                onChange={(e) =>
                                  setRejectNote((prev) => ({
                                    ...prev,
                                    [p.id]: e.target.value,
                                  }))
                                }
                                className="text-xs h-8"
                              />
                              <Button
                                size="sm"
                                className="bg-red-600 hover:bg-red-700 text-white text-xs h-8 px-3 shrink-0"
                                disabled={actionLoading === p.id}
                                onClick={() => handleReject(p.id)}
                              >
                                {actionLoading === p.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  "Send"
                                )}
                              </Button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-text-muted">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
