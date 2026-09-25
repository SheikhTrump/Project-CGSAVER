import Link from "next/link";

export function Wordmark({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="text-[15px] font-semibold tracking-tight text-text-primary">
      cgsaver
    </Link>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 supports-[backdrop-filter]:bg-background/85 supports-[backdrop-filter]:backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-5 sm:px-8">
        <Wordmark />
        <nav className="flex items-center gap-5 text-sm sm:gap-7">
          <Link href="/#how-it-works" className="hidden text-text-secondary transition-colors hover:text-text-primary sm:inline">
            Process
          </Link>
          <Link href="/showcase" className="text-text-secondary transition-colors hover:text-text-primary">
            Work
          </Link>
          <Link href="/login" className="text-text-secondary transition-colors hover:text-text-primary">
            Log in
          </Link>
          <Link
            href="/signup"
            className="inline-flex h-8 items-center rounded-btn bg-accent px-3 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
          >
            Start a project
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-5 py-10 text-sm text-text-muted sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p>&copy; {new Date().getFullYear()} CGSAVER. Built for students, by students.</p>
        <div className="flex gap-6">
          <Link href="/showcase" className="transition-colors hover:text-text-primary">Work</Link>
          <Link href="/login" className="transition-colors hover:text-text-primary">Dashboard</Link>
        </div>
      </div>
    </footer>
  );
}
