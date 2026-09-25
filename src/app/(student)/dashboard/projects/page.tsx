import { createClient } from "@/utils/supabase/server";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge, ProjectStatus } from "@/components/StatusBadge";
import Link from "next/link";
import { format } from "date-fns";
import { PlusCircle } from "lucide-react";

export default async function ProjectsListPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: projects } = await supabase
    .from("projects")
    .select("id, title, status, deadline, created_at")
    .eq("student_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">My Projects</h1>
          <p className="text-text-secondary mt-1">View and manage all your software requests.</p>
        </div>
        <Button asChild className="bg-accent hover:bg-accent-hover text-white">
          <Link href="/dashboard/projects/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Project
          </Link>
        </Button>
      </div>

      <Card className="border-border overflow-hidden">
        {(!projects || projects.length === 0) ? (
          <div className="p-12 text-center">
            <h3 className="text-xl font-medium text-text-primary">No projects found</h3>
            <p className="text-text-secondary mt-2 mb-6 max-w-md mx-auto">
              You haven&apos;t submitted any projects yet. Start by generating a requirement request.
            </p>
            <Button asChild className="bg-accent hover:bg-accent-hover text-white px-8">
              <Link href="/dashboard/projects/new">Create Project</Link>
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-text-muted text-xs border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-medium">Project Name</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Submitted Date</th>
                  <th className="px-6 py-4 font-medium">Deadline</th>
                  <th className="px-6 py-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-surface">
                {projects.map((project) => (
                  <tr key={project.id} className="hover:bg-surface-2/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-text-primary">
                      <Link href={`/dashboard/projects/${project.id}`} className="hover:text-accent transition-colors">
                        {project.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={project.status as ProjectStatus} />
                    </td>
                    <td className="px-6 py-4 text-text-secondary whitespace-nowrap">
                      {format(new Date(project.created_at), "MMM d, yyyy")}
                    </td>
                    <td className="px-6 py-4 text-text-secondary whitespace-nowrap">
                      {project.deadline ? format(new Date(project.deadline), "MMM d, yyyy") : "-"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="outline" size="sm" asChild className="rounded-btn font-medium">
                        <Link href={`/dashboard/projects/${project.id}`}>View Details</Link>
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
  );
}
