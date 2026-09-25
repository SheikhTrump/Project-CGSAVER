"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LogOut, Menu, User as UserIcon, X, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { NotificationBell } from "@/components/NotificationBell";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}

interface AppShellProps {
  homeHref: string;
  tag?: string;
  sections: NavSection[];
  profileHref: string;
  userName?: string | null;
  userEmail?: string | null;
  userRole: string;
  onSignOut: () => void;
  signingOut?: boolean;
  children: React.ReactNode;
}

export function AppShell({
  homeHref,
  tag,
  sections,
  profileHref,
  userName,
  userEmail,
  userRole,
  onSignOut,
  signingOut = false,
  children,
}: AppShellProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const initial = userName?.charAt(0)?.toUpperCase() || "U";

  // Highlight the most specific nav entry that matches the current path
  const allHrefs = sections.flatMap((s) => s.items.map((i) => i.href));
  const activeHref = allHrefs
    .filter((href) => pathname === href || (href !== homeHref && pathname.startsWith(href + "/")))
    .sort((a, b) => b.length - a.length)[0];

  return (
    <div className="flex min-h-screen bg-background text-text-primary">
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-text-primary/20 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-border bg-background transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-14 items-center justify-between px-5">
          <Link href={homeHref} className="flex items-center gap-2 text-[15px] font-semibold tracking-tight">
            cgsaver
            {tag && (
              <span className="rounded border border-border px-1.5 py-px font-mono text-[10px] font-normal uppercase tracking-wider text-text-muted">
                {tag}
              </span>
            )}
          </Link>
          <button
            className="text-text-muted hover:text-text-primary lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
          {sections.map((section, i) => (
            <div key={section.title ?? i}>
              {section.title && (
                <div className="mb-1.5 px-2 text-xs text-text-muted">{section.title}</div>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = item.href === activeHref;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-2.5 rounded-btn px-2 py-1.5 text-sm transition-colors",
                        isActive
                          ? "bg-sidebar-hover font-medium text-text-primary"
                          : "text-text-secondary hover:bg-sidebar-hover/60 hover:text-text-primary"
                      )}
                    >
                      <Icon className={cn("h-4 w-4", isActive ? "text-text-primary" : "text-text-muted")} strokeWidth={1.75} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-border p-3">
          <div className="flex items-center gap-2.5 px-2 py-1.5">
            <Avatar className="h-7 w-7">
              <AvatarFallback className="bg-surface-2 text-xs font-medium text-text-secondary">{initial}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{userName}</p>
              <p className="truncate text-xs capitalize text-text-muted">{userRole}</p>
            </div>
          </div>
          <button
            onClick={onSignOut}
            disabled={signingOut}
            className="mt-1 flex w-full items-center gap-2.5 rounded-btn px-2 py-1.5 text-sm text-text-secondary transition-colors hover:bg-sidebar-hover/60 hover:text-text-primary disabled:opacity-50"
          >
            <LogOut className="h-4 w-4 text-text-muted" strokeWidth={1.75} />
            {signingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/95 px-4 supports-[backdrop-filter]:bg-background/85 supports-[backdrop-filter]:backdrop-blur-sm sm:px-6 lg:justify-end">
          <Button
            variant="ghost"
            size="icon"
            className="-ml-2 lg:hidden"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-2">
            <NotificationBell />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-primary/20" aria-label="Account menu">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-surface-2 text-xs font-medium text-text-secondary">{initial}</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="mt-1 w-56">
                <DropdownMenuLabel className="flex flex-col font-normal">
                  <span className="font-medium text-text-primary">{userName}</span>
                  <span className="text-xs text-text-muted">{userEmail}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href={profileHref} className="flex items-center">
                    <UserIcon className="mr-2 h-4 w-4 text-text-muted" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" onClick={onSignOut} disabled={signingOut}>
                  <LogOut className="mr-2 h-4 w-4 text-text-muted" />
                  {signingOut ? "Signing out…" : "Sign out"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden px-4 py-6 sm:px-6 lg:px-10 lg:py-10">{children}</main>
      </div>
    </div>
  );
}
