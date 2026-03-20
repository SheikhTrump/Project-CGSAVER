"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileCode2, FileText, Download, UploadCloud, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface ProjectFile {
  id: string;
  file_url: string;
  file_name: string;
  file_type: string;
  created_at: string;
}

interface AdminProject {
  id: string;
  student_id: string;
  status: string;
  project_files?: ProjectFile[];
}

export default function AdminFilesTab({ project, adminId }: { project: AdminProject, adminId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deliverables, setDeliverables] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const MAX_SIZE = 10 * 1024 * 1024; // 10MB
      const validFiles = Array.from(e.target.files).filter(f => {
        if (f.size > MAX_SIZE) {
          alert(`File "${f.name}" exceeds the 10MB size limit and was skipped.`);
          return false;
        }
        return true;
      });
      setDeliverables(validFiles);
    }
  };

  const handleUploadDeliverables = async (e: React.FormEvent) => {
    e.preventDefault();
    if (deliverables.length === 0) return;
    

    setLoading(true);
    setUploadProgress("");

    try {
      let count = 0;
      for (const file of deliverables) {
        count++;
        setUploadProgress(`Uploading ${count} of ${deliverables.length}: ${file.name}...`);

        
        const filePath = `${project.student_id}/${project.id}/deliverable_${Date.now()}_${file.name}`;
        
        // 1. Storage Upload
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("project_files")
          .upload(filePath, file);

        if (uploadError) {
          console.error(`Upload error for ${file.name}:`, uploadError);
          throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`);
        }

        if (!uploadData?.path) {
          throw new Error(`No upload path returned for ${file.name}`);
        }

        const { data: publicUrlData } = supabase.storage
          .from("project_files")
          .getPublicUrl(uploadData.path);

        // 2. Database Record Creation
        const { error: insertError } = await supabase.from("project_files").insert({
          project_id: project.id,
          file_url: publicUrlData.publicUrl,
          file_name: file.name,
          uploaded_by: adminId,
          file_type: "deliverable",
        });

        if (insertError) {
          console.error(`Database error for ${file.name}:`, insertError);
          throw new Error(`Failed to save record for ${file.name}: ${insertError.message}`);
        }
        

      }

      // 3. Update project status if needed
      if (project.status === "in_progress") {
        setUploadProgress("Updating project status...");
        const { error: projectError } = await supabase.from("projects").update({ status: "delivered" }).eq("id", project.id);
        if (projectError) {
          console.error("Project status update error:", projectError);
          throw new Error(`Failed to update project status: ${projectError.message}`);
        }

      }

      alert("Deliverables uploaded and delivered to student successfully!");
      setDeliverables([]);
      router.refresh();
      
    } catch (error: unknown) {
      console.error("Upload deliverables error:", error);
      alert((error as Error).message || "An unexpected error occurred during upload.");
    } finally {
      setLoading(false);
      setUploadProgress("");
    }
  };

  const requirementsList = project.project_files?.filter((f) => f.file_type === "requirement") || [];
  const deliverablesList = project.project_files?.filter((f) => f.file_type === "deliverable") || [];

  return (
    <div className="space-y-6">
      
      <Card className="shadow-sm border-border">
        <CardHeader className="border-b border-border/50 pb-4">
          <CardTitle className="flex items-center gap-2 text-text-primary text-lg">
            <FileText className="h-5 w-5 text-text-secondary" />
            Client Requirements
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {requirementsList.length === 0 ? (
            <p className="text-sm text-text-muted italic">No requirement files uploaded.</p>
          ) : (
             <ul className="divide-y divide-border border border-border rounded-md overflow-hidden bg-surface">
             {requirementsList.map((file) => (
               <li key={file.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-surface-2 transition-colors gap-3">
                 <div className="flex items-center gap-3 overflow-hidden">
                   <FileText className="h-6 w-6 text-text-muted shrink-0" />
                   <div className="min-w-0 flex-1">
                     <p className="text-sm font-medium text-text-primary truncate" title={file.file_name}>{file.file_name}</p>
                     <p className="text-xs text-text-muted">{format(new Date(file.created_at), "MMM d, yyyy 'at' p")}</p>
                   </div>
                 </div>
                 <Button variant="outline" size="sm" asChild className="text-text-primary w-full sm:w-auto">
                   <a href={file.file_url} target="_blank" rel="noopener noreferrer">
                     <Download className="h-4 w-4 mr-2" /> Download
                   </a>
                 </Button>
               </li>
             ))}
           </ul>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-sm border-info/20">
        <CardHeader className="border-b border-info/20 pb-4 bg-blue-50/30">
          <CardTitle className="flex items-center gap-2 text-info text-lg">
            <FileCode2 className="h-5 w-5" />
            Upload Deliverables
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {/* Deliverables List */}
          {deliverablesList.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {deliverablesList.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-3 border border-info/30 rounded-md bg-white">
                  <div className="truncate pr-2">
                    <p className="text-sm font-medium text-text-primary truncate" title={file.file_name}>{file.file_name}</p>
                    <p className="text-xs text-text-muted">{format(new Date(file.created_at), "MMM d")}</p>
                  </div>
                  <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-info shrink-0">
                    <a href={file.file_url} target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Upload Form */}
          <form onSubmit={handleUploadDeliverables} className="space-y-4 pt-4 border-t border-border border-dashed">
            <div className="space-y-2">
              <Label className="text-text-primary font-medium">Add New Output Files (ZIP, PDF, Code)</Label>
              <div className="border-2 border-dashed border-info/30 rounded-card p-6 flex flex-col items-center justify-center bg-blue-50/20 hover:bg-blue-50/50 transition-colors">
                <UploadCloud className="h-8 w-8 text-info/60 mb-2" />
                <Label htmlFor="deliverable-upload" className="cursor-pointer text-info font-medium hover:underline text-sm">
                  Click to select files
                </Label>
                <Input 
                  id="deliverable-upload" 
                  type="file" 
                  multiple 
                  className="hidden" 
                  onChange={handleFileChange}
                />
              </div>
            </div>
            
            {deliverables.length > 0 && (
              <div className="bg-surface-2 p-3 rounded-md border border-border text-sm">
                <p className="font-medium mb-1">Files selected:</p>
                <ul className="list-disc pl-5 text-text-secondary">
                  {deliverables.map(f => (
                     <li key={f.name}>{f.name}</li>
                  ))}
                </ul>
              </div>
            )}

            <Button 
              type="submit" 
              disabled={loading || deliverables.length === 0} 
              className="w-full bg-info hover:bg-blue-600 text-white rounded-pill"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? (uploadProgress || "Uploading...") : "Upload & Deliver to Student"}
            </Button>
          </form>
        </CardContent>
      </Card>
      
    </div>
  );
}
