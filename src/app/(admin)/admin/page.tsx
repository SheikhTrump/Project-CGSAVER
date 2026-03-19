import { createClient } from "@/utils/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge, ProjectStatus } from "@/components/StatusBadge";
import Link from "next/link";
import { FolderKanban, DollarSign, FileSignature, MessageCircle, ArrowRight } from "lucide-react";
import { format } from "date-fns";

export default async function AdminDashboardHome() {
  const supabase = createClient();
  
  // Verify Admin/Superadmin (defense-in-depth, not just middleware)
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (!profile || !['admin', 'superadmin'].includes(profile.role)) return null;

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
    .select("sender_id, profiles!sender_id(role)")
    .eq("is_read", false);
  
  const unreadMessagesCount = unreadMessages?.filter(m => 
    (m.profiles as any)?.role === 'student'
  ).length || 0;
  // 5. Fetch Recent Projects (with student profile info)
  const { data: recentProjects } = await supabase
    .from("projects")
    .select(`
      id, title, status, deadline, created_at,
      profiles!student_id ( full_name, email )
    `)
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text-primary">Admin Overview</h1>
          <p className="text-text-secondary mt-1">Platform operations and metrics at a glance.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-text-secondary">Confirmed Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">৳ {totalRevenueBdt.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-text-secondary">Active Projects</CardTitle>
            <FolderKanban className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-text-primary">{activeProjectsCount || 0}</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-text-secondary">Awaiting Quote</CardTitle>
            <FileSignature className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-text-primary">{pendingQuotesCount || 0}</div>
            <p className="text-xs text-text-muted mt-1">Projects needing review</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-text-secondary">Unread Messages</CardTitle>
            <MessageCircle className="h-4 w-4 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-text-primary">{unreadMessagesCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Projects List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-text-primary tracking-tight">Recent Submissions</h2>
          <Button variant="link" asChild className="text-danger hover:text-danger/80 p-0 h-auto font-semibold">
            <Link href="/admin/projects">View all <ArrowRight className="ml-1 h-4 w-4 inline" /></Link>
          </Button>
        </div>
        
        <Card className="shadow-sm border-border overflow-hidden">
          {(!recentProjects || recentProjects.length === 0) ? (
            <div className="p-8 text-center text-text-muted">
              No projects found in the system.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-surface-2/50 text-text-secondary text-xs uppercase border-b border-border">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Project Name</th>
                    <th className="px-6 py-4 font-semibold">Student</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold">Date Submitted</th>
                    <th className="px-6 py-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-surface">
                  {recentProjects.map((project: any) => (
                    <tr key={project.id} className="hover:bg-surface-2/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-text-primary max-w-[200px] truncate">
                        <Link href={`/admin/projects/${project.id}`} className="hover:text-danger hover:underline transition-colors">
                          {project.title}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-text-secondary">
                        <div className="font-medium text-text-primary">{project.profiles?.full_name}</div>
                        <div className="text-xs text-text-muted">{project.profiles?.email}</div>
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
