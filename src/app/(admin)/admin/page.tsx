import { createClient } from "@/utils/supabase/server";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge, ProjectStatus } from "@/components/StatusBadge";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { format } from "date-fns";

export default async function AdminDashboardHome() {
  const supabase = createClient();
  
  // Verify Admin/Superadmin (defense-in-depth, not just middleware)
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (!profile || !['admin', 'superadmin'].includes(profile.role)) return null;

  /* MessageWithProfile removed as it was unused */

  // 1. Fetch Total Revenue
  const { data: payments } = await supabase
    .from("payments")
    .select("amount")
    .eq("status", "confirmed");
    
  const totalRevenueBdt = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

  // 2. Fetch Active Projects Count
  const { count: activeProjectsCount } = await supabase
    .from("projects")
    .select("*", { count: 'exact', head: true })
    .not("status", "in", '("completed","cancelled","delivered")');

  // 3. Fetch Pending Quotes (projects waiting for quote)
  const { count: pendingQuotesCount } = await supabase
    .from("projects")
    .select("*", { count: 'exact', head: true })
    .eq("status", "submitted");

  // 4. Fetch Unread Messages (Count messages from students that are unread)
  const { data: unreadMessages } = await supabase
    .from("messages")
    .select("sender_id, profiles:sender_id(role)")
    .eq("is_read", false);
  
  const unreadMessagesCount = (unreadMessages as { sender_id: string; profiles: unknown }[])?.filter(m => {
    const profile = Array.isArray(m.profiles) ? m.profiles[0] : m.profiles;
    return profile?.role === 'student';
  }).length || 0;
  // 5. Fetch Recent Projects (with student profile info)
  interface ProjectWithProfile {
    id: string;
    title: string;
    status: string;
    deadline: string | null;
    created_at: string;
    profiles: { full_name: string; email: string } | null;
  }

  const { data: recentProjects } = await supabase
    .from("projects")
    .select(`
      id, title, status, deadline, created_at,
      profiles:student_id ( full_name, email )
    `)
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">Admin Overview</h1>
          <p className="text-text-secondary mt-1">Platform operations and metrics at a glance.</p>
        </div>
      </div>

      {/* Stats */}
      <dl className="grid grid-cols-2 divide-border overflow-hidden rounded-card border border-border bg-surface lg:grid-cols-4 [&>*]:border-border max-lg:[&>*:nth-child(-n+2)]:border-b max-lg:[&>*:nth-child(odd)]:border-r lg:divide-x">
        <div className="px-5 py-4">
          <dt className="text-xs text-text-muted">Confirmed revenue</dt>
          <dd className="mt-1.5 text-2xl font-medium tracking-tight tabular-nums text-text-primary">৳{totalRevenueBdt.toLocaleString()}</dd>
        </div>
        <div className="px-5 py-4">
          <dt className="text-xs text-text-muted">Active projects</dt>
          <dd className="mt-1.5 text-2xl font-medium tracking-tight tabular-nums text-text-primary">{activeProjectsCount || 0}</dd>
        </div>
        <div className="px-5 py-4">
          <dt className="text-xs text-text-muted">Awaiting quote</dt>
          <dd className="mt-1.5 text-2xl font-medium tracking-tight tabular-nums text-text-primary">{pendingQuotesCount || 0}</dd>
        </div>
        <div className="px-5 py-4">
          <dt className="text-xs text-text-muted">Unread messages</dt>
          <dd className="mt-1.5 text-2xl font-medium tracking-tight tabular-nums text-text-primary">{unreadMessagesCount}</dd>
        </div>
      </dl>

      {/* Recent Projects List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-text-primary tracking-tight">Recent Submissions</h2>
          <Button variant="link" asChild className="p-0 h-auto text-text-secondary no-underline hover:text-text-primary">
            <Link href="/admin/projects">View all <ArrowRight className="ml-1 h-4 w-4 inline" /></Link>
          </Button>
        </div>
        
        <Card className="border-border overflow-hidden">
          {(!recentProjects || recentProjects.length === 0) ? (
            <div className="p-8 text-center text-text-muted">
              No projects found in the system.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-text-muted text-xs border-b border-border">
                  <tr>
                    <th className="px-6 py-4 font-medium">Project Name</th>
                    <th className="px-6 py-4 font-medium">Student</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Date Submitted</th>
                    <th className="px-6 py-4 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-surface">
                  {(recentProjects as unknown as ProjectWithProfile[]).map((project) => (
                    <tr key={project.id} className="hover:bg-surface-2/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-text-primary max-w-[200px] truncate">
                        <Link href={`/admin/projects/${project.id}`} className="hover:underline underline-offset-4 transition-colors">
                          {project.title}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-text-secondary">
                        <div className="font-medium text-text-primary">
                          {Array.isArray(project.profiles) ? project.profiles[0]?.full_name : project.profiles?.full_name}
                        </div>
                        <div className="text-xs text-text-muted">
                          {Array.isArray(project.profiles) ? project.profiles[0]?.email : project.profiles?.email}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={project.status as ProjectStatus} />
                      </td>
                      <td className="px-6 py-4 text-text-secondary whitespace-nowrap">
                        {format(new Date(project.created_at), "MMM d, yyyy")}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="outline" size="sm" asChild className="rounded-btn font-medium">
                          <Link href={`/admin/projects/${project.id}`}>Manage</Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
