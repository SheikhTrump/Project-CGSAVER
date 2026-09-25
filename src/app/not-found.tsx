import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-start justify-center bg-background px-5 text-text-primary sm:items-center sm:text-center">
      <p className="font-mono text-xs uppercase tracking-[0.14em] text-text-muted">404</p>
      <h1 className="mt-4 text-3xl font-medium tracking-tight sm:text-4xl">Page not found</h1>
      <p className="mt-3 max-w-sm text-text-secondary">
        The page or project you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="mt-8 flex items-center gap-6 text-sm">
        <Link
          href="/"
          className="inline-flex h-10 items-center rounded-btn bg-accent px-4 font-medium text-white transition-colors hover:bg-accent-hover"
        >
          Back to home
        </Link>
        <Link href="/login" className="text-text-secondary underline decoration-border underline-offset-4 hover:text-text-primary">
          Dashboard
        </Link>
      </div>
    </div>
  );
}
