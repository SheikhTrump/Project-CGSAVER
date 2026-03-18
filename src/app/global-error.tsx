"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertOctagon, RefreshCcw } from "lucide-react";
import Link from "next/link";

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
      <body>
        <div className="min-h-screen flex flex-col items-center justify-center bg-background text-center px-4 animate-in fade-in duration-500">
          <AlertOctagon className="h-24 w-24 text-danger mb-6 opacity-80" />
          <h1 className="text-4xl font-extrabold tracking-tight text-text-primary mb-3">Something went wrong!</h1>
          <p className="text-text-secondary max-w-md mx-auto mb-8">
            An unexpected error occurred while processing your request. Our team has been notified.
          </p>
          <div className="bg-surface-2/50 border border-danger/20 rounded-md p-4 mb-8 max-w-lg w-full text-left text-sm text-danger/80 break-words font-mono">
            {error.message || "Unknown Application Error"}
          </div>
          <div className="flex gap-4">
            <Button onClick={() => reset()} size="lg" className="bg-text-primary hover:bg-black text-white rounded-pill px-6">
              <RefreshCcw className="mr-2 h-4 w-4" /> Try again
            </Button>
            <Button variant="outline" size="lg" asChild className="rounded-pill px-6 border-border hover:bg-surface-2">
               <Link href="/">Back to Safety</Link>
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
