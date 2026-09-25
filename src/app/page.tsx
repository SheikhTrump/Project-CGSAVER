import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";

const principles = [
  {
    title: "Fixed price, up front",
    desc: "Send your requirements and get a flat quote before anything starts. No hourly billing, no surprises.",
  },
  {
    title: "Modern, readable code",
    desc: "React, Next.js, Python, Flutter, Node.js — built the way it would be in industry, so you can explain every part.",
  },
  {
    title: "Yours on delivery",
    desc: "Pay through bKash and receive the full source code and documentation once the work is done.",
  },
];

const steps = [
  { title: "Submit", desc: "Upload your requirements and set a deadline." },
  { title: "Quote", desc: "We review the scope and send a fixed price." },
  { title: "Develop", desc: "Pay securely and development begins." },
  { title: "Deliver", desc: "Download your code and documentation." },
];

export default async function LandingPage() {
  const supabase = createClient();
  const { data: featuredProjects } = await supabase
    .from("projects")
    .select("id, title, description, tech_stack")
    .eq("is_featured", true)
    .limit(3);

  return (
    <div className="flex min-h-screen flex-col bg-background text-text-primary">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto max-w-5xl px-5 pb-24 pt-20 sm:px-8 sm:pb-32 sm:pt-28">
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-text-muted">
            Student dev studio · Bangladesh
          </p>
          <h1 className="mt-6 max-w-3xl text-[2.6rem] font-medium leading-[1.05] tracking-tightest sm:text-6xl">
            Your software project, built properly and on time.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-text-secondary">
            Share your requirements, get a flat-rate quote, and receive clean, working code
            from developers who know what your course expects.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4">
            <Link
              href="/signup"
              className="group inline-flex h-11 items-center gap-2 rounded-btn bg-accent px-5 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
            >
              Start a project
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/showcase"
              className="text-sm font-medium text-text-secondary underline decoration-border underline-offset-4 transition-colors hover:text-text-primary hover:decoration-text-primary"
            >
              See past work
            </Link>
          </div>
        </section>

        {/* Principles */}
        <section id="features" className="border-t border-border">
          <div className="mx-auto grid max-w-5xl gap-12 px-5 py-20 sm:px-8 md:grid-cols-3 md:gap-10">
            {principles.map((item) => (
              <div key={item.title}>
                <h3 className="text-[15px] font-medium">{item.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-text-secondary">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Process */}
        <section id="how-it-works" className="border-t border-border bg-surface">
          <div className="mx-auto max-w-5xl px-5 py-20 sm:px-8 sm:py-24">
            <h2 className="text-2xl font-medium tracking-tight sm:text-3xl">How it works</h2>
            <ol className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
              {steps.map((step, i) => (
                <li key={step.title} className="border-t border-text-primary pt-5">
                  <span className="font-mono text-xs text-text-muted">0{i + 1}</span>
                  <h3 className="mt-3 text-[15px] font-medium">{step.title}</h3>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-text-secondary">{step.desc}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Featured work */}
        {featuredProjects && featuredProjects.length > 0 && (
          <section className="border-t border-border">
            <div className="mx-auto max-w-5xl px-5 py-20 sm:px-8 sm:py-24">
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="text-2xl font-medium tracking-tight sm:text-3xl">Recent work</h2>
                <Link
                  href="/showcase"
                  className="inline-flex items-center gap-1 text-sm text-text-secondary transition-colors hover:text-text-primary"
                >
                  View all <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <ul className="mt-10 divide-y divide-border border-y border-border">
                {(featuredProjects as { id: string; title: string; description: string; tech_stack: string | null }[]).map((project) => (
                  <li key={project.id} className="grid gap-2 py-6 sm:grid-cols-[1fr_2fr] sm:gap-8">
                    <div>
                      <h3 className="font-medium">{project.title}</h3>
                      {project.tech_stack && (
                        <p className="mt-1 font-mono text-xs text-text-muted">{project.tech_stack}</p>
                      )}
                    </div>
                    <p className="line-clamp-2 text-[15px] leading-relaxed text-text-secondary">
                      {project.description}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* Closing CTA */}
        <section className="border-t border-border">
          <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-6 px-5 py-20 sm:flex-row sm:items-center sm:px-8">
            <div>
              <h2 className="text-2xl font-medium tracking-tight">Have a deadline coming up?</h2>
              <p className="mt-2 text-text-secondary">Tell us what you need. Quotes are free.</p>
            </div>
            <Link
              href="/signup"
              className="inline-flex h-11 shrink-0 items-center rounded-btn bg-accent px-5 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
            >
              Get a quote
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
