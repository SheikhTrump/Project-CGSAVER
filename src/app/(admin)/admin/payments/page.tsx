import { createClient } from "@/utils/supabase/server";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { CreditCard, CheckCircle, XCircle, Clock } from "lucide-react";
import Link from "next/link";

export default async function AdminPaymentsPage() {
  const supabase = createClient();
  const { data: payments } = await supabase
    .from("payments")
    .select("*, projects(title, student_id, profiles(full_name))")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-text-primary">Payment History</h1>
        <p className="text-text-secondary mt-1">Global log of all transactions and verifications.</p>
      </div>

      <Card className="shadow-sm border-border overflow-hidden">
        {(!payments || payments.length === 0) ? (
          <div className="p-12 text-center text-text-muted">
            <CreditCard className="mx-auto h-12 w-12 opacity-50 mb-3" />
            <p>No transactions found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-surface-2/50 text-text-secondary text-xs uppercase border-b border-border">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Project</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-surface">
                {payments.map(p => (
                  <tr key={p.id} className="hover:bg-surface-2/30 transition-colors">
                    <td className="px-6 py-4 text-text-secondary whitespace-nowrap">
                      {format(new Date(p.created_at), "MMM d, yyyy")}
                    </td>
                    <td className="px-6 py-4 font-medium text-text-primary">
                      {p.projects?.profiles?.full_name || "Unknown"}
                    </td>
                    <td className="px-6 py-4 max-w-[200px] truncate">
                      <Link href={`/admin/projects/${p.project_id}`} className="hover:text-accent hover:underline">
                        {p.projects?.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4 font-bold text-text-primary">
                      {p.amount} {p.currency}
                      <span className="block text-xs font-normal text-text-muted">{p.method.toUpperCase()} - {p.transaction_id}</span>
                    </td>
                    <td className="px-6 py-4">
                      {p.status === 'confirmed' ? (
                        <span className="inline-flex items-center text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md text-xs font-medium border border-emerald-200">
                          <CheckCircle className="h-3 w-3 mr-1" /> Confirmed
                        </span>
                      ) : p.status === 'rejected' ? (
                         <span className="inline-flex items-center text-red-600 bg-red-50 px-2 py-1 rounded-md text-xs font-medium border border-red-200">
                          <XCircle className="h-3 w-3 mr-1" /> Rejected
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-orange-600 bg-orange-50 px-2 py-1 rounded-md text-xs font-medium border border-orange-200">
                          <Clock className="h-3 w-3 mr-1" /> Pending
                        </span>
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
