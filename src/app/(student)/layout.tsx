"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, FolderKanban, PlusCircle, LogOut, Menu } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { NotificationBell } from "@/components/NotificationBell";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User as UserIcon, Settings, LogOut as LogOutIcon } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/projects", label: "My Projects", icon: FolderKanban },
  { href: "/dashboard/projects/new", label: "New Project", icon: PlusCircle },
];

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
   const { profile, user, isLoading } = useAuth();
   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
   const [isLoggingOut, setIsLoggingOut] = useState(false);
 
   const handleLogout = async () => {
     try {
       setIsLoggingOut(true);
       await supabase.auth.signOut();
       // Use window.location.href for a full refresh to clear server-side session
       window.location.href = "/login";
     } catch (error) {
       console.error("Logout error:", error);
       window.location.href = "/login"; // Force redirect anyway
     } finally {
       setIsLoggingOut(false);
     }
   };

  return (
    <div className="flex min-h-screen bg-background text-text-primary">
      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-60 flex-col bg-sidebar-bg text-sidebar-text transition-transform duration-300 lg:static lg:translate-x-0",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center px-6">
          <Link href="/dashboard" className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span className="bg-accent text-white p-1 rounded-md text-xs">CGS</span>
            CGSAVER
          </Link>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-sidebar-hover text-sidebar-active border-l-2 border-accent" 
                    : "text-sidebar-text hover:bg-sidebar-hover hover:text-white"
                )}
              >
                <Icon className={cn("h-4 w-4", isActive ? "text-accent" : "text-sidebar-text")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-hover">
          <div className="flex items-center gap-3 mb-4 px-2">
            <Avatar className="h-9 w-9 border border-sidebar-hover">
              <AvatarFallback className="bg-sidebar-hover text-sidebar-text">
                {profile?.full_name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{profile?.full_name}</p>
              <p className="text-xs text-sidebar-text truncate">Student</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex w-full items-center justify-start gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-text hover:bg-sidebar-hover hover:text-white transition-colors"
          >
            <LogOut className="h-4 w-4" />
            {isLoggingOut ? "Signing Out..." : "Sign Out"}
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden text-text-secondary"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            {/* Page Title could go here dynamically if wanted, but often it's rendered by the page */}
            {!mobileMenuOpen && <div className="hidden lg:block w-5"></div>}
          </div>
          
          <div className="flex items-center gap-4">
            <NotificationBell />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-8 w-8 cursor-pointer border border-border transition-all hover:ring-2 hover:ring-accent/50 active:scale-95">
                  <AvatarFallback className="bg-surface-2 text-primary text-xs font-bold">
                    {profile?.full_name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-1">
                <DropdownMenuLabel className="flex flex-col">
                  <span className="font-semibold text-text-primary">{profile?.full_name}</span>
                  <span className="text-xs text-text-muted font-normal">{user?.email}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/dashboard/profile" className="flex items-center">
                    <UserIcon className="mr-2 h-4 w-4 text-accent" />
                    <span>Profile Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="cursor-pointer text-danger focus:text-danger focus:bg-danger/10"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                >
                  <LogOutIcon className="mr-2 h-4 w-4" />
                  <span>{isLoggingOut ? "Signing Out..." : "Sign Out"}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
