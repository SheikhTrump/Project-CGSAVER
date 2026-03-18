import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-center px-4 animate-in fade-in duration-500">
      <div className="mb-8 relative">
        <div className="absolute inset-0 bg-accent/20 blur-3xl rounded-full"></div>
        <SearchX className="h-32 w-32 text-accent relative z-10" />
      </div>
      <h1 className="text-5xl font-black tracking-tight text-text-primary mb-4">404</h1>
      <h2 className="text-2xl font-bold tracking-tight text-text-secondary mb-2">Page not found</h2>
      <p className="text-text-muted max-w-md mx-auto mb-8">
        The page or project you're looking for doesn't exist or has been moved.
      </p>
      <div className="flex gap-4">
        <Button asChild size="lg" className="bg-accent hover:bg-accent-hover text-white rounded-pill px-8">
          <Link href="/">Go to Homepage</Link>
        </Button>
        <Button variant="outline" size="lg" asChild className="rounded-pill px-8 border-border hover:bg-surface-2 text-text-primary">
          <Link href="/login">Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
