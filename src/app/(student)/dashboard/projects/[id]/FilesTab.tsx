"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileCode2, FileText, Download } from "lucide-react";
import { format } from "date-fns";

interface ProjectFile {
  id: string;
  file_url: string;
  file_name: string;
  file_type: string;
  created_at: string;
}

export default function ProjectFilesTab({ files }: { files: ProjectFile[] }) {
  const requirements = files.filter(f => f.file_type === "requirement");
  const deliverables = files.filter(f => f.file_type === "deliverable");

  return (
    <div className="space-y-6">
      
      <Card className="shadow-sm border-border">
        <CardHeader className="border-b border-border/50 pb-4">
          <CardTitle className="flex items-center gap-2 text-text-primary text-lg">
            <FileCode2 className="h-5 w-5 text-accent" />
            Deliverables
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {deliverables.length === 0 ? (
            <p className="text-sm text-text-muted italic">No deliverables uploaded yet. They will appear here once the project is finished.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {deliverables.map(file => (
                <div key={file.id} className="group relative overflow-hidden rounded-card border border-border bg-surface p-4 transition-all hover:border-accent hover:shadow-md">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="font-semibold text-text-primary text-sm line-clamp-2" title={file.file_name}>
                        {file.file_name}
                      </p>
                      <p className="text-xs text-text-muted">
                        {format(new Date(file.created_at), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                  <Button asChild size="sm" className="w-full mt-4 bg-accent/10 text-accent hover:bg-accent hover:text-white transition-colors">
                    <a href={file.file_url} target="_blank" rel="noopener noreferrer">
                      <Download className="mr-2 h-4 w-4" />
                      Download File
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-sm border-border">
        <CardHeader className="border-b border-border/50 pb-4">
          <CardTitle className="flex items-center gap-2 text-text-primary text-lg">
            <FileText className="h-5 w-5 text-text-secondary" />
            Requirement Files
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {requirements.length === 0 ? (
            <p className="text-sm text-text-muted italic">No requirement files uploaded.</p>
          ) : (
             <ul className="divide-y divide-border border border-border rounded-md overflow-hidden bg-surface">
             {requirements.map(file => (
               <li key={file.id} className="flex items-center justify-between p-4 hover:bg-surface-2 transition-colors">
                 <div className="flex items-center gap-3 overflow-hidden">
                   <FileText className="h-6 w-6 text-text-muted shrink-0" />
                   <div className="min-w-0">
                     <p className="text-sm font-medium text-text-primary truncate" title={file.file_name}>{file.file_name}</p>
                     <p className="text-xs text-text-muted">{format(new Date(file.created_at), "MMM d, yyyy 'at' p")}</p>
                   </div>
                 </div>
                 <Button variant="ghost" size="sm" asChild className="text-accent hover:bg-accent/10">
                   <a href={file.file_url} target="_blank" rel="noopener noreferrer">Download</a>
                 </Button>
               </li>
             ))}
           </ul>
          )}
        </CardContent>
      </Card>
      
    </div>
  );
}
