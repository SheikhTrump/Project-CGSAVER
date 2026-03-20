import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { StatusBadge, ProjectStatus } from "@/components/StatusBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { CalendarDays, Code, User } from "lucide-react";
import AdminOverviewTab from "./AdminOverviewTab";
import AdminMessagesTab from "./AdminMessagesTab";
import AdminFilesTab from "./AdminFilesTab";

export default async function AdminProjectDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return notFound();

  // Fetch project details with related data
  const { data: project, error } = await supabase
    .from("projects")
    .select("*, profiles!student_id(full_name, email), quotes(*), payments(*), project_files(*)")
    .eq("id", params.id)
    .single();

  if (error || !project) {
    return notFound();
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="bg-surface border border-border rounded-card p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-3">
             <div className="flex items-center gap-3">
               <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-text-primary">
                 {project.title}
               </h1>
               <StatusBadge status={project.status as ProjectStatus} />
             </div>
            
            <div className="flex items-center gap-1.5 text-sm text-text-primary bg-surface-2 w-fit px-3 py-1.5 rounded-md border border-border">
              <User className="h-4 w-4 text-text-secondary" />
              <span className="font-medium">{project.profiles?.full_name}</span>
              <span className="text-text-muted">({project.profiles?.email})</span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary mt-1">
              <span className="flex items-center gap-1">
                <CalendarDays className="h-4 w-4 text-text-muted" />
                Submitted {format(new Date(project.created_at), "MMM d, yyyy")}
              </span>
              
              {project.deadline && (
                <span className="flex items-center gap-1">
                  <CalendarDays className="h-4 w-4 text-text-muted" />
                  Target: {format(new Date(project.deadline), "MMM d, yyyy")}
                </span>
              )}
              
              {project.tech_stack && (
                <span className="flex items-center gap-1">
                  <Code className="h-4 w-4 text-text-muted" />
                  {project.tech_stack}
                </span>
              )}
              

            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full justify-start border-b border-border bg-transparent rounded-none p-0 h-auto space-x-6">
          <TabsTrigger 
            value="overview" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-danger data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-danger px-1 py-3"
          >
            Management & Overview
          </TabsTrigger>
          <TabsTrigger 
            value="messages" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-danger data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-danger px-1 py-3"
          >
            Communication
          </TabsTrigger>
          <TabsTrigger 
            value="files" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-danger data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-danger px-1 py-3"
          >
            Project Files ({project.project_files?.length || 0})
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="overview" className="m-0">
            <AdminOverviewTab project={project} adminId={user.id} />
          </TabsContent>
          
          <TabsContent value="messages" className="m-0">
            <AdminMessagesTab projectId={project.id} adminId={user.id} />
          </TabsContent>
          
          <TabsContent value="files" className="m-0">
            <AdminFilesTab project={project} adminId={user.id} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
