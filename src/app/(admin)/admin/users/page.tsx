import { createClient } from "@/utils/supabase/server";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { Users } from "lucide-react";

export default async function AdminUsersPage() {
  const supabase = createClient();
  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-text-primary">User Management</h1>
        <p className="text-text-secondary mt-1">Directory of all registered students and admins.</p>
      </div>

      <Card className="shadow-sm border-border overflow-hidden">
        {(!profiles || profiles.length === 0) ? (
          <div className="p-12 text-center text-text-muted">
            <Users className="mx-auto h-12 w-12 opacity-50 mb-3" />
            <p>No users found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-surface-2/50 text-text-secondary text-xs uppercase border-b border-border">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-surface">
                {profiles.map(p => (
                  <tr key={p.id} className="hover:bg-surface-2/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-text-primary">{p.full_name}</td>
                    <td className="px-6 py-4 text-text-secondary">{p.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-md text-xs font-semibold capitalize ${
                        p.role === 'superadmin' ? 'bg-danger/10 text-danger border border-danger/20' : 
                        p.role === 'admin' ? 'bg-purple-100 text-purple-700 border border-purple-200' : 
                        'bg-surface-2 text-text-secondary border border-border'
                      }`}>
                        {p.role}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-text-secondary whitespace-nowrap">
                      {format(new Date(p.created_at), "MMM d, yyyy")}
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
