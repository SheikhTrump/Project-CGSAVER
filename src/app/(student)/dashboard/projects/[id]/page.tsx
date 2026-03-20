import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { StatusBadge, ProjectStatus } from "@/components/StatusBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { CalendarDays, Code } from "lucide-react";
// Sub-components that we will build next
import ProjectOverviewTab from "./OverviewTab";
import ProjectMessagesTab from "./MessagesTab";
import ProjectFilesTab from "./FilesTab";
import PaymentTab from "./PaymentTab";

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return notFound();

  // Fetch project details
  const { data: project, error } = await supabase
    .from("projects")
    .select("*, quotes(*), payments(*), project_files(*)")
    .eq("id", params.id)
    .eq("student_id", user.id)
    .single();

  if (error || !project) {
    return notFound();
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="bg-surface border border-border rounded-card p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-text-primary">
              {project.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary">
              <span className="flex items-center gap-1">
                <CalendarDays className="h-4 w-4 text-text-muted" />
                Submitted on {format(new Date(project.created_at), "MMM d, yyyy")}
              </span>
              
              {project.deadline && (
                <span className="flex items-center gap-1">
                  <CalendarDays className="h-4 w-4 text-text-muted" />
                  Deadline: {format(new Date(project.deadline), "MMM d, yyyy")}
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
          <div className="shrink-0 flex items-center justify-end">
             <StatusBadge status={project.status as ProjectStatus} className="text-sm px-3 py-1" />
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full justify-start border-b border-border bg-transparent rounded-none p-0 h-auto space-x-6">
          <TabsTrigger 
            value="overview" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent data-[state=active]:shadow-none px-1 py-3"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger 
            value="messages" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent data-[state=active]:shadow-none px-1 py-3"
          >
            Messages
          </TabsTrigger>
          <TabsTrigger 
            value="files" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent data-[state=active]:shadow-none px-1 py-3"
          >
            Files ({project.project_files?.length || 0})
          </TabsTrigger>
          <TabsTrigger 
            value="payment" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent data-[state=active]:shadow-none px-1 py-3"
          >
            Payment
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="overview" className="m-0">
            <ProjectOverviewTab project={project} />
          </TabsContent>
          
          <TabsContent value="messages" className="m-0">
            <ProjectMessagesTab projectId={project.id} userId={user.id} />
          </TabsContent>
          
          <TabsContent value="files" className="m-0">
            <ProjectFilesTab files={project.project_files || []} />
          </TabsContent>

          <TabsContent value="payment" className="m-0">
            <PaymentTab project={project} userId={user.id} />
          </TabsContent>
        </div>
      </Tabs>

    </div>
  );
}
