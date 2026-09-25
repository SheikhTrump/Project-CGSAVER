"use client";

import { useEffect } from "react";
import Link from "next/link";
import "./globals.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <div className="flex min-h-screen flex-col items-start justify-center bg-background px-5 text-text-primary sm:items-center sm:text-center">
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-text-muted">Error</p>
          <h1 className="mt-4 text-3xl font-medium tracking-tight">Something went wrong</h1>
          <p className="mt-3 max-w-md text-text-secondary">
            An unexpected error occurred while processing your request.
          </p>
          <pre className="mt-6 w-full max-w-lg whitespace-pre-wrap break-words rounded-btn border border-border bg-surface px-4 py-3 text-left font-mono text-xs text-text-secondary">
            {error.message || "Unknown application error"}
          </pre>
          <div className="mt-8 flex items-center gap-6 text-sm">
            <button
              onClick={() => reset()}
              className="inline-flex h-10 items-center rounded-btn bg-accent px-4 font-medium text-white transition-colors hover:bg-accent-hover"
            >
              Try again
            </button>
            <Link href="/" className="text-text-secondary underline decoration-border underline-offset-4 hover:text-text-primary">
              Back to home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
