import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Code2, Rocket, ShieldCheck, Zap } from "lucide-react";
import { createClient } from "@/utils/supabase/server";

export default async function LandingPage() {
  const supabase = createClient();
  const { data: featuredProjects } = await supabase
    .from("projects")
    .select("id, title, description, tech_stack")
    .eq("is_featured", true)
    .limit(3);

  return (
    <div className="flex flex-col min-h-screen bg-background text-text-primary overflow-x-hidden">
      
      {/* Navbar */}
      <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="text-2xl font-black tracking-tighter text-text-primary flex items-center gap-2">
            <span className="bg-accent text-white p-1 rounded-md text-xs">CS</span>
            CGSAVER
          </div>
          <nav className="hidden md:flex items-center gap-8 font-medium text-sm text-text-secondary">
            <Link href="#features" className="hover:text-accent transition-colors">Features</Link>
            <Link href="#how-it-works" className="hover:text-accent transition-colors">How it Works</Link>
            <Link href="/showcase" className="hover:text-accent transition-colors">Showcase</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild className="hidden sm:inline-flex text-text-primary hover:text-accent hover:bg-accent/10">
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild className="bg-accent hover:bg-accent-hover text-white rounded-btn shadow-sm">
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-16">
        
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 sm:py-32 lg:pb-32 xl:pb-36 bg-surface-2/30 isolate">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent/20 via-background to-background"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold text-accent bg-accent/10 mb-8 border border-accent/20 animate-in slide-in-from-bottom flex-shrink duration-700">
              <Rocket className="h-4 w-4 mr-2" /> Bangladesh's Elite Student Dev Agency
            </div>
            <h1 className="mx-auto max-w-4xl text-5xl font-extrabold tracking-tight text-text-primary sm:text-7xl animate-in fade-in zoom-in duration-700 delay-150">
              Your software projects, built <span className="text-accent relative inline-block">faster<svg className="absolute -bottom-2 w-full h-3 text-accent" viewBox="0 0 100 10" preserveAspectRatio="none"><path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="4" fill="transparent"/></svg></span> and better.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg tracking-tight text-text-secondary animate-in fade-in duration-700 delay-300">
              Submit your requirements, get an instant flat-rate quote, and receive production-ready code from top-tier developers. The easiest way to save your CGPA.
            </p>
            <div className="mt-10 flex justify-center gap-x-6 animate-in fade-in duration-700 delay-500">
              <Button asChild size="lg" className="bg-accent hover:bg-accent-hover text-white rounded-pill px-8 text-base shadow-lg shadow-accent/20">
                <Link href="/signup">Start a Project <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="rounded-pill px-8 text-base border-border bg-white hover:bg-surface-2 text-text-primary">
                <Link href="/showcase">View Showcase</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-24 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">Why choose CGSAVER?</h2>
              <p className="mt-4 text-text-secondary text-lg">We handle everything from architecture to deployment so you can focus on your studies.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: Zap, title: "Lightning Fast", desc: "Get your deliverables in record time. We prioritize speed without sacrificing quality." },
                { icon: Code2, title: "Modern Tech Stacks", desc: "React, Next.js, Python, Flutter, Node.js - we build using enterprise-grade tooling." },
                { icon: ShieldCheck, title: "Guaranteed Delivery", desc: "Pay securely via bKash/Nagad and get full source code ownership upon completion." }
              ].map((feature, i) => (
                <div key={i} className="bg-surface border border-border rounded-card p-8 hover:border-accent/50 hover:shadow-md transition-all">
                  <div className="h-12 w-12 bg-accent/10 rounded-xl flex items-center justify-center mb-6">
                    <feature.icon className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="text-xl font-bold text-text-primary mb-3">{feature.title}</h3>
                  <p className="text-text-secondary leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it Works Step-by-Step */}
        <section id="how-it-works" className="py-24 bg-surface-2/30 border-y border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold tracking-tight text-center text-text-primary sm:text-4xl mb-16">How it works</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
              <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-border -z-10"></div>
              {[
                { step: "01", title: "Submit", desc: "Upload your requirements and set a deadline." },
                { step: "02", title: "Quote", desc: "We review and send you a fixed price quote." },
                { step: "03", title: "Develop", desc: "You pay securely, and our devs start coding." },
                { step: "04", title: "Deliver", desc: "Download your code and documentation." }
              ].map((step, i) => (
                <div key={i} className="relative text-center">
                  <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-background border-4 border-surface shadow-sm mb-6">
                    <span className="text-3xl font-black text-accent">{step.step}</span>
                  </div>
                  <h3 className="text-xl font-bold text-text-primary mb-2">{step.title}</h3>
                  <p className="text-text-secondary">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Showcase Preview */}
        {featuredProjects && featuredProjects.length > 0 && (
          <section className="py-24 bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-12">
                <h2 className="text-3xl font-bold tracking-tight text-text-primary">Featured Work</h2>
                <Button variant="ghost" asChild className="text-accent hover:text-accent-hover hover:bg-accent/10">
                  <Link href="/showcase">View all projects <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {featuredProjects.map((project: any) => (
                  <div key={project.id} className="group bg-surface border border-border rounded-card overflow-hidden hover:shadow-lg transition-all duration-300">
                    <div className="h-48 bg-sidebar-bg/5 flex items-center justify-center p-6 border-b border-border relative overflow-hidden">
                      <Code2 className="h-16 w-16 text-text-muted opacity-20 group-hover:scale-110 transition-transform duration-500" />
                      {project.tech_stack && (
                        <span className="absolute bottom-4 left-4 bg-background/90 backdrop-blur text-xs font-semibold px-2 py-1 rounded text-text-primary border border-border">
                          {project.tech_stack}
                        </span>
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="font-bold text-xl text-text-primary mb-2 line-clamp-1">{project.title}</h3>
                      <p className="text-text-secondary text-sm line-clamp-3 mb-4">{project.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-sidebar-bg py-12 text-sidebar-text border-t border-sidebar-hover">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-xl font-black text-white">
            <span className="bg-accent text-white p-1 rounded-md text-[10px]">CS</span>
            CGSAVER
          </div>
          <p className="text-sm text-sidebar-text/60">
            &copy; {new Date().getFullYear()} CGSAVER. All rights reserved. Built for students, by students.
          </p>
          <div className="flex gap-6 text-sm font-medium opacity-80">
            <Link href="#" className="hover:text-white transition-colors">Terms</Link>
            <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/login" className="hover:text-white transition-colors">Dashboard</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
