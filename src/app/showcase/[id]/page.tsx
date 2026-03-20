import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Code2, Globe, Sparkles, Calendar, Tag } from "lucide-react";
import Image from "next/image";
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  
  const { data: project } = await supabase
    .from("showcase_entries")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!project) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-text-primary">
      
      {/* Header */}
      <header className="border-b border-border bg-surface sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Button variant="ghost" asChild className="text-text-secondary hover:text-text-primary pl-0">
            <Link href="/showcase"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Showcase</Link>
          </Button>
          <div className="font-bold tracking-tight text-text-primary opacity-0 sm:opacity-100 transition-opacity">
            {project.title}
          </div>
          <div className="w-20 sm:w-auto h-1" /> {/* Spacer */}
        </div>
      </header>

      <main className="flex-1 py-12 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            {/* Title & Badge Section */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="bg-accent/10 text-accent text-xs font-bold px-2 py-1 rounded-pill flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> Featured Project
                </span>
                <span className="text-text-muted text-xs flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> {new Date(project.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-text-primary">
                {project.title}
              </h1>
              {project.tech_stack && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {project.tech_stack.split(',').map((tech: string) => (
                    <span key={tech} className="bg-surface-2/50 border border-border text-text-secondary text-xs px-2.5 py-1 rounded font-medium flex items-center gap-1.5 shadow-sm">
                      <Tag className="h-3 w-3 text-accent" /> {tech.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Hero Image / Banner */}
            <div className="relative aspect-video rounded-card overflow-hidden bg-surface-2 border border-border shadow-2xl">
              {project.image_url ? (
                <Image 
                  src={project.image_url} 
                  alt={project.title} 
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-sidebar-bg to-sidebar-hover text-white/5">
                  <Code2 className="h-32 w-32" />
                </div>
              )}
            </div>

            {/* Content Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pt-8">
              <div className="lg:col-span-2 space-y-6">
                <h2 className="text-2xl font-bold text-text-primary border-b border-border pb-2 flex items-center gap-2">
                  Project Description
                </h2>
                <div className="text-lg text-text-secondary leading-relaxed whitespace-pre-wrap font-medium">
                  {project.description}
                </div>
              </div>

              <div className="lg:col-span-1 space-y-8">
                {/* Actions Card */}
                <div className="bg-surface border border-border p-6 rounded-card shadow-lg sticky top-24 space-y-6">
                  <h3 className="font-bold text-lg text-text-primary">Project Links</h3>
                  
                  <div className="space-y-3">
                    {project.live_link ? (
                      <Button asChild className="w-full bg-accent hover:bg-accent-hover text-white flex items-center justify-center gap-2">
                        <a href={project.live_link} target="_blank" rel="noopener noreferrer">
                          <Globe className="h-4 w-4" /> View Live Demo
                        </a>
                      </Button>
                    ) : (
                      <p className="text-sm text-text-muted italic">No live link available</p>
                    )}
                    
                    <Button variant="outline" asChild className="w-full border-border hover:bg-surface-2 text-text-primary">
                      <Link href="/signup">Request Similar Project</Link>
                    </Button>
                  </div>

                  <div className="pt-4 border-t border-border/50">
                    <p className="text-xs text-text-muted leading-relaxed">
                      This project was curated by the CGSAVER team as a benchmark for quality and execution.
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Footer CTA */}
      <footer className="py-20 bg-surface-2/30 border-t border-border mt-20">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl font-bold text-text-primary">Ready to build something amazing?</h2>
          <p className="text-text-secondary">Join hundreds of students who trusted CGSAVER with their dreams.</p>
          <Button asChild size="lg" className="bg-danger hover:bg-danger/90 text-white rounded-pill px-8">
            <Link href="/signup">Get Started Now</Link>
          </Button>
        </div>
      </footer>
      
    </div>
  );
}
