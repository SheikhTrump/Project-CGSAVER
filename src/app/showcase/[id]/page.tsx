import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";

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

  const techStack: string[] = project.tech_stack
    ? project.tech_stack.split(",").map((t: string) => t.trim()).filter(Boolean)
    : [];

  return (
    <div className="flex min-h-screen flex-col bg-background text-text-primary">
      <SiteHeader />

      <main className="flex-1">
        <article className="mx-auto max-w-5xl px-5 pb-24 pt-10 sm:px-8 sm:pt-14">
          <Link
            href="/showcase"
            className="inline-flex items-center gap-1.5 text-sm text-text-secondary transition-colors hover:text-text-primary"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> All work
          </Link>

          <header className="mt-10 max-w-3xl">
            <p className="font-mono text-xs text-text-muted">
              {new Date(project.created_at).toLocaleDateString(undefined, { year: "numeric", month: "long" })}
            </p>
            <h1 className="mt-3 text-4xl font-medium tracking-tightest sm:text-5xl">{project.title}</h1>
          </header>

          <div className="relative mt-10 aspect-video overflow-hidden rounded-card border border-border bg-surface-2">
            {project.image_url ? (
              <Image src={project.image_url} alt={project.title} fill className="object-cover" unoptimized />
            ) : (
              <div className="flex h-full items-end p-6 sm:p-8">
                <span className="text-3xl font-medium tracking-tight text-text-muted/50 sm:text-4xl">{project.title}</span>
              </div>
            )}
          </div>

          <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_16rem]">
            <div className="max-w-2xl whitespace-pre-wrap text-[17px] leading-relaxed text-text-secondary">
              {project.description}
            </div>

            <aside className="space-y-8 text-sm lg:border-l lg:border-border lg:pl-8">
              {techStack.length > 0 && (
                <div>
                  <h2 className="text-xs font-medium uppercase tracking-[0.1em] text-text-muted">Stack</h2>
                  <ul className="mt-3 space-y-1.5">
                    {techStack.map((tech) => (
                      <li key={tech} className="font-mono text-[13px] text-text-primary">{tech}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="space-y-3">
                {project.live_link && (
                  <a
                    href={project.live_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 items-center justify-center gap-1.5 rounded-btn bg-accent px-4 font-medium text-white transition-colors hover:bg-accent-hover"
                  >
                    View live site <ArrowUpRight className="h-4 w-4" />
                  </a>
                )}
                <Link
                  href="/signup"
                  className="flex h-10 items-center justify-center rounded-btn border border-border bg-surface px-4 font-medium transition-colors hover:bg-surface-2"
                >
                  Request something similar
                </Link>
              </div>
            </aside>
          </div>
        </article>
      </main>

      <SiteFooter />
    </div>
  );
}
