"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { addDays, format } from "date-fns";
import { Loader2, UploadCloud, XCircle } from "lucide-react";

export default function NewProjectPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    techStack: "",
    budgetRange: "",
    deadline: "",
  });
  
  const [files, setFiles] = useState<File[]>([]);

  // Calculate min date (7 days from today)
  const minDate = format(addDays(new Date(), 7), "yyyy-MM-dd");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(prev => [...prev, ...Array.from(e.target.files as FileList)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    setErrorMsg("");

    try {
      // 1. Insert Project
      const { data: project, error: projectError } = await supabase
        .from("projects")
        .insert({
          student_id: user.id,
          title: formData.title,
          description: formData.description,
          tech_stack: formData.techStack || null,
          budget_range: formData.budgetRange || null,
          deadline: formData.deadline || null,
          status: "submitted",
        })
        .select()
        .single();

      if (projectError) throw new Error(projectError.message);

      // 2. Upload Files
      if (files.length > 0 && project) {
        for (const file of files) {
          const filePath = `${user.id}/${project.id}/${Date.now()}_${file.name}`;
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from("project_files")
            .upload(filePath, file);

          if (uploadError) {
            console.error("Upload error for", file.name, uploadError);
            continue; // Skip failed file but keep going
          }

          const { data: publicUrlData } = supabase.storage
            .from("project_files")
            .getPublicUrl(uploadData.path);

          // 3. Insert File Record
          await supabase.from("project_files").insert({
            project_id: project.id,
            file_url: publicUrlData.publicUrl,
            file_name: file.name,
            uploaded_by: user.id,
            file_type: "requirement",
          });
        }
      }

      // 4. Redirect to project detail
      router.push(`/dashboard/projects/${project.id}`);
    } catch (error: any) {
      setErrorMsg(error.message || "An unexpected error occurred.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-text-primary">Submit a New Project</h1>
        <p className="text-text-secondary mt-1">Provide the details and requirements for your software project.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="shadow-sm border-border">
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
            <CardDescription>Fill in the core information about what you need built.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            <div className="space-y-2">
              <Label htmlFor="title" className="text-text-primary">Project Title <span className="text-danger">*</span></Label>
              <Input id="title" required placeholder="e.g. E-commerce Website" value={formData.title} onChange={handleChange} className="bg-surface" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-text-primary">Detailed Description <span className="text-danger">*</span></Label>
              <Textarea 
                id="description" 
                required 
                placeholder="Describe your project requirements, features, and acceptable deliverables..." 
                className="min-h-[150px] bg-surface resizable-none"
                value={formData.description} 
                onChange={handleChange} 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="techStack" className="text-text-primary">Preferred Tech Stack (Optional)</Label>
                <Input id="techStack" placeholder="e.g. React, Node.js, Python" value={formData.techStack} onChange={handleChange} className="bg-surface" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="budgetRange" className="text-text-primary">Budget Range (Optional)</Label>
                <Input id="budgetRange" placeholder="e.g. 5,000 - 10,000 BDT" value={formData.budgetRange} onChange={handleChange} className="bg-surface" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline" className="text-text-primary">Target Deadline <span className="text-danger">*</span></Label>
              <Input 
                id="deadline" 
                type="date" 
                required 
                min={minDate}
                value={formData.deadline} 
                onChange={handleChange} 
                className="bg-surface text-text-primary cursor-pointer" 
              />
              <p className="text-xs text-text-muted">Must be at least 7 days from today to ensure quality delivery.</p>
            </div>

            <div className="space-y-3 pt-4 border-t border-border">
              <Label className="text-text-primary block">Supporting Files</Label>
              <p className="text-sm text-text-secondary">Upload PDF, Word, or ZIP files containing diagrams or extended requirements.</p>
              
              <div className="border-2 border-dashed border-sidebar-hover/30 rounded-card p-6 flex flex-col items-center justify-center bg-surface-2/30 hover:bg-surface-2/60 transition-colors">
                <UploadCloud className="h-10 w-10 text-text-muted mb-2" />
                <Label htmlFor="file-upload" className="cursor-pointer text-accent hover:underline font-medium">
                  Click to browse files
                </Label>
                <Input 
                  id="file-upload" 
                  type="file" 
                  multiple 
                  className="hidden" 
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.zip,.png,.jpg,.jpeg"
                />
              </div>

              {files.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h4 className="text-sm font-medium text-text-primary">Attached Files:</h4>
                  <ul className="space-y-2">
                    {files.map((file, idx) => (
                      <li key={idx} className="flex items-center justify-between p-2 bg-surface border border-border rounded-md text-sm">
                        <span className="truncate flex-1 max-w-[250px] sm:max-w-xs">{file.name}</span>
                        <span className="text-text-muted text-xs mr-4">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                        <button type="button" onClick={() => removeFile(idx)} className="text-danger hover:text-danger/80 transition-colors">
                          <XCircle className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm font-medium border border-red-200">
                {errorMsg}
              </div>
            )}
          </CardContent>
          
          <CardFooter className="bg-surface-2/50 border-t border-border py-4 flex justify-end gap-3 rounded-b-card">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" className="bg-accent hover:bg-accent-hover text-white rounded-btn px-6" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Submitting..." : "Submit Project"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
