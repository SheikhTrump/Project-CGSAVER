import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Code2, LayoutTemplate, Star } from "lucide-react";
import { createClient } from "@/utils/supabase/server";

export default async function ShowcasePage() {
  const supabase = createClient();
  
  // Fetch featured projects with their reviews
  const { data: showcaseProjects } = await supabase
    .from("projects")
    .select(`
      id, title, description, tech_stack, showcase_image_url,
      reviews (rating, comment)
    `)
    .eq("is_featured", true)
    .order("created_at", { ascending: false });

  // Compute average rating if reviews exist
  const getReviewData = (project: any) => {
    if (!project.reviews || project.reviews.length === 0) return null;
    // Assuming single review per project usually based on UI
    const review = project.reviews[0];
    return { rating: review.rating, comment: review.comment };
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-text-primary">
      
      {/* Header */}
      <header className="border-b border-border bg-surface sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Button variant="ghost" asChild className="text-text-secondary hover:text-text-primary pl-0">
            <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Home</Link>
          </Button>
          <div className="font-bold tracking-tight text-text-primary flex items-center gap-2">
            Showcase
          </div>
          <Button asChild size="sm" className="bg-accent hover:bg-accent-hover text-white rounded-pill">
            <Link href="/signup">Start Your Project</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h1 className="text-4xl font-extrabold tracking-tight text-text-primary sm:text-5xl mb-4">
              Hall of Fame
            </h1>
            <p className="text-lg text-text-secondary">
              A curated collection of top-tier academic and commercial software delivered by CGSAVER.
            </p>
          </div>

          {!showcaseProjects || showcaseProjects.length === 0 ? (
            <div className="text-center py-20 bg-surface-2/30 rounded-card border border-border border-dashed">
              <LayoutTemplate className="h-16 w-16 mx-auto text-text-muted opacity-30 mb-4" />
              <h3 className="text-xl font-bold text-text-primary">Showcase is currently empty</h3>
              <p className="text-text-secondary mt-2">Check back soon as we curate our best projects!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {showcaseProjects.map((project: any) => {
                const review = getReviewData(project);
                
                return (
                  <div key={project.id} className="group bg-surface border border-border rounded-card overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
                    {/* Project Image Header */}
                    <div className="h-56 bg-gradient-to-br from-sidebar-bg to-sidebar-hover flex items-center justify-center relative overflow-hidden">
                      {project.showcase_image_url ? (
                        <div 
                          className="absolute inset-0 bg-cover bg-center opacity-80 group-hover:opacity-100 transition-opacity"
                          style={{ backgroundImage: `url(${project.showcase_image_url})` }}
                        />
                      ) : (
                        <Code2 className="h-20 w-20 text-white/10 group-hover:scale-110 transition-transform duration-500" />
                      )}
                      
                      {project.tech_stack && (
                        <span className="absolute top-4 right-4 bg-background/90 backdrop-blur text-xs font-semibold px-2.5 py-1 rounded text-text-primary border border-border shadow-sm">
                          {project.tech_stack}
                        </span>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="font-bold text-xl text-text-primary mb-2 line-clamp-2">{project.title}</h3>
                      <p className="text-text-secondary text-sm line-clamp-3 mb-6 flex-1">
                        {project.description}
                      </p>
                      
                      {/* Review / Rating if exists */}
                      {review && (
                        <div className="mt-auto pt-4 border-t border-border/50">
                          <div className="flex text-warning mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-current' : 'text-text-muted/30'}`} />
                            ))}
                          </div>
                          <p className="text-xs italic text-text-secondary line-clamp-2">"{review.comment}"</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      
    </div>
  );
}
