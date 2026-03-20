import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge, ProjectStatus } from "@/components/StatusBadge";
import { StatusFilterSelect } from "@/components/StatusFilterSelect";
import Link from "next/link";
import { format } from "date-fns";
import { FolderKanban, Search } from "lucide-react";

export default async function AdminProjectsPage({
  searchParams,
}: {
  searchParams: { query?: string; status?: string };
}) {
  const supabase = createClient();

  // Defense-in-depth: verify admin role server-side
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return notFound();
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (!profile || !['admin', 'superadmin'].includes(profile.role)) return notFound();

  interface AdminProjectWithProfile {
    id: string;
    title: string;
    status: string;
    deadline: string | null;
    created_at: string;
    profiles: { full_name: string; email: string } | null;
  }

  const query = searchParams.query || "";
  const statusFilter = searchParams.status || "all";

  // Build the Supabase query
  let dbQuery = supabase
    .from("projects")
    .select(`
      id, title, status, deadline, created_at,
      profiles!student_id ( full_name, email )
    `)
    .order("created_at", { ascending: false });

  if (statusFilter !== "all") {
    dbQuery = dbQuery.eq("status", statusFilter);
  }

  if (query) {
    dbQuery = dbQuery.ilike("title", `%${query}%`);
  }

  const { data: projects } = await dbQuery.limit(100);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text-primary">All Projects</h1>
          <p className="text-text-secondary mt-1">Manage all student software requests in one place.</p>
        </div>
      </div>

      <Card className="shadow-sm border-border overflow-hidden">
        {/* Filter & Search Bar - Done via Server Component Form for simplicity */}
        <div className="p-4 border-b border-border bg-surface-2/30 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <form className="flex-1 w-full flex items-center gap-2 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-text-muted" />
              <Input
                name="query"
                type="search"
                defaultValue={query}
                placeholder="Search projects by title..."
                className="pl-8 bg-white border-border w-full"
              />
            </div>
            {/* If there's an existing status filter, keep it when searching */}
            <input type="hidden" name="status" value={statusFilter} />
            <Button type="submit" variant="secondary" className="whitespace-nowrap">Search</Button>
          </form>

          <StatusFilterSelect defaultValue={statusFilter} query={query} />
        </div>

        {/* Results Table */}
        {(!projects || projects.length === 0) ? (
          <div className="p-12 text-center bg-surface">
            <FolderKanban className="mx-auto h-16 w-16 text-text-muted opacity-50 mb-4" />
            <h3 className="text-xl font-medium text-text-primary">No projects found</h3>
            <p className="text-text-secondary mt-2">Try adjusting your search or filters.</p>
            {(query || statusFilter !== "all") && (
              <Button variant="link" asChild className="mt-4 text-danger">
                <Link href="/admin/projects">Clear all filters</Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-surface-2/50 text-text-secondary text-xs uppercase border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-semibold">Project Name</th>
                  <th className="px-6 py-4 font-semibold">Student</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Submitted Date</th>
                  <th className="px-6 py-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-surface">
                {(projects as unknown as AdminProjectWithProfile[]).map((project) => (
                  <tr key={project.id} className="hover:bg-surface-2/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-text-primary max-w-[250px] truncate">
                      <Link href={`/admin/projects/${project.id}`} className="hover:text-danger hover:underline transition-colors block" title={project.title}>
                        {project.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-text-primary">{project.profiles?.full_name}</div>
                      <div className="text-xs text-text-muted mt-0.5">{project.profiles?.email}</div>
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
  );
}
