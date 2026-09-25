import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";

interface ShowcaseProject {
  id: string;
  title: string;
  description: string;
  tech_stack: string | null;
  image_url: string | null;
  live_link: string | null;
}

export default async function ShowcasePage() {
  const supabase = createClient();

  // Fetch manually curated showcase entries
  const { data: showcaseEntries } = await supabase
    .from("showcase_entries")
    .select("*")
    .order("created_at", { ascending: false });

  const projects = (showcaseEntries ?? []) as unknown as ShowcaseProject[];

  return (
    <div className="flex min-h-screen flex-col bg-background text-text-primary">
      <SiteHeader />

      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-5 pb-24 pt-16 sm:px-8 sm:pt-20">
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-text-muted">Showcase</p>
          <h1 className="mt-4 text-4xl font-medium tracking-tightest sm:text-5xl">Selected work</h1>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-text-secondary">
            Academic and commercial software delivered by the CGSAVER team.
          </p>

          {projects.length === 0 ? (
            <div className="mt-16 border-t border-border pt-10">
              <p className="font-medium">Nothing here yet.</p>
              <p className="mt-1 text-text-secondary">We&apos;re putting together our best projects. Check back soon.</p>
            </div>
          ) : (
            <div className="mt-14 grid gap-x-8 gap-y-14 sm:grid-cols-2">
              {projects.map((project) => (
                <article key={project.id} className="group">
                  <Link href={`/showcase/${project.id}`} className="block">
                    <div className="relative aspect-[16/10] overflow-hidden rounded-card border border-border bg-surface-2">
                      {project.image_url ? (
                        <Image
                          src={project.image_url}
                          alt={project.title}
                          fill
                          className="object-cover transition-opacity duration-300 group-hover:opacity-90"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-full items-end p-5">
                          <span className="text-2xl font-medium tracking-tight text-text-muted/60">{project.title}</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 flex items-start justify-between gap-4">
                      <h2 className="font-medium underline-offset-4 group-hover:underline">{project.title}</h2>
                      {project.tech_stack && (
                        <span className="shrink-0 pt-0.5 font-mono text-xs text-text-muted">
                          {project.tech_stack.split(",")[0].trim()}
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 line-clamp-2 text-[15px] leading-relaxed text-text-secondary">
                      {project.description}
                    </p>
                  </Link>
                  {project.live_link && (
                    <a
                      href={project.live_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1 text-sm text-text-secondary transition-colors hover:text-text-primary"
                    >
                      Live site <ArrowUpRight className="h-3.5 w-3.5" />
                    </a>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
