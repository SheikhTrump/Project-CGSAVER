import { createClient } from "@/utils/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge, ProjectStatus } from "@/components/StatusBadge";
import Link from "next/link";
import { FolderKanban, CheckCircle2, Loader2, FileDown, PlusCircle, Megaphone } from "lucide-react";
import { format } from "date-fns";

export default async function DashboardHome() {
  const supabase = createClient();
  
  // Get current user session
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Fetch student profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  // Fetch student projects
  const { data: projects } = await supabase
    .from("projects")
    .select("id, title, status, deadline, created_at")
    .eq("student_id", user.id)
    .order("created_at", { ascending: false });

  // Fetch active announcements
  const { data: announcements } = await supabase
    .from("announcements")
    .select("id, title, body, is_urgent, created_at")
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(3);

  const totalProjects = projects?.length || 0;
  const completedProjects = projects?.filter(p => p.status === "completed").length || 0;
  const deliveredProjects = projects?.filter(p => p.status === "delivered").length || 0;
  const activeProjects = totalProjects - completedProjects - deliveredProjects - (projects?.filter(p => p.status === "cancelled").length || 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text-primary">
            Welcome back, {profile?.full_name?.split(" ")[0] || "Student"}!
          </h1>
          <p className="text-text-secondary mt-1">Here is what&apos;s happening with your projects today.</p>
        </div>
        <Button asChild className="rounded-pill bg-accent hover:bg-accent-hover text-white shadow-sm">
          <Link href="/dashboard/projects/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Project
          </Link>
        </Button>
      </div>

      {/* Announcements */}
      {announcements && announcements.length > 0 && (
        <div className="space-y-3">
          {announcements.map((announcement) => (
            <div 
              key={announcement.id} 
              className={`flex items-start gap-3 p-4 rounded-card border ${
                announcement.is_urgent 
                  ? "bg-red-50 border-red-100 text-red-900" 
                  : "bg-accent-light border-orange-100 text-orange-900"
              }`}
            >
              <Megaphone className={`h-5 w-5 mt-0.5 shrink-0 ${announcement.is_urgent ? "text-red-500" : "text-accent"}`} />
              <div>
                <h4 className="font-semibold text-sm">{announcement.title}</h4>
                <p className="text-sm mt-1 opacity-90">{announcement.body}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-text-secondary">Total Projects</CardTitle>
            <FolderKanban className="h-4 w-4 text-text-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-text-primary">{totalProjects}</div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-text-secondary">Active</CardTitle>
            <Loader2 className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-text-primary">{activeProjects}</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-text-secondary">Delivered</CardTitle>
            <FileDown className="h-4 w-4 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-text-primary">{deliveredProjects}</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-text-secondary">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-text-primary">{completedProjects}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Projects List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-text-primary tracking-tight">Recent Projects</h2>
          <Button variant="link" asChild className="text-accent hover:text-accent-hover p-0 h-auto">
            <Link href="/dashboard/projects">View all</Link>
          </Button>
        </div>
        
        <Card className="shadow-sm border-border overflow-hidden">
          {(!projects || projects.length === 0) ? (
            <div className="p-8 text-center">
              <FolderKanban className="mx-auto h-12 w-12 text-text-muted opacity-50 mb-3" />
              <h3 className="text-lg font-medium text-text-primary">No projects yet</h3>
              <p className="text-text-secondary mt-1 mb-4">You haven&apos;t submitted any projects yet.</p>
              <Button asChild className="rounded-pill bg-accent hover:bg-accent-hover text-white">
                <Link href="/dashboard/projects/new">Create your first project</Link>
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {projects.slice(0, 5).map((project) => (
                <div key={project.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 hover:bg-surface-2/50 transition-colors">
                  <div className="space-y-1 mb-3 sm:mb-0">
                    <Link href={`/dashboard/projects/${project.id}`} className="font-semibold text-text-primary hover:text-accent transition-colors block">
                      {project.title}
                    </Link>
                    <div className="flex items-center gap-3 text-sm text-text-secondary">
                      <span>Submitted on {format(new Date(project.created_at), 'MMM d, yyyy')}</span>
                      {project.deadline && (
                        <>
                          <span className="hidden sm:inline">•</span>
                          <span>Deadline: {format(new Date(project.deadline), 'MMM d, yyyy')}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                    <StatusBadge status={project.status as ProjectStatus} />
                    <Button variant="secondary" size="sm" asChild className="rounded-btn font-medium">
                      <Link href={`/dashboard/projects/${project.id}`}>View Details</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
