"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  FolderKanban, 
  Users, 
  CreditCard, 
  Megaphone,
  LogOut, 
  Menu,
  ShieldAlert
} from "lucide-react";
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
import { User as UserIcon, LogOut as LogOutIcon, ShieldCheck } from "lucide-react";

const navItems = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/projects", label: "All Projects", icon: FolderKanban },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/announcements", label: "Announcements", icon: Megaphone },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, user, isSuperAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      window.location.href = "/login";
    } catch (err) {
      console.error("Logout failed:", err);
      window.location.href = "/login";
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-text-primary">
      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Admin Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-sidebar-bg text-sidebar-text transition-transform duration-300 lg:static lg:translate-x-0 border-r border-sidebar-hover",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center px-6">
          <Link href="/admin" className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span className="bg-danger text-white p-1 rounded-md text-xs font-black">ADMIN</span>
            CGSAVER
          </Link>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <div className="text-xs font-semibold text-sidebar-text/60 uppercase tracking-wider mb-2 px-2">Management</div>
          
          {navItems.map((item) => {
            const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/admin");
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-sidebar-hover text-white lg:border-l-2 lg:border-danger" 
                    : "text-sidebar-text hover:bg-sidebar-hover/50 hover:text-white"
                )}
              >
                <Icon className={cn("h-4 w-4", isActive ? "text-danger" : "text-sidebar-text")} />
                {item.label}
              </Link>
            );
          })}

          {isSuperAdmin && (
            <div className="mt-8">
              <div className="text-xs font-semibold text-danger border-t border-sidebar-hover/50 pt-6 mt-6 uppercase tracking-wider mb-2 px-2">Super Admin</div>
              <Link
                href="/admin/config"
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors text-sidebar-text hover:bg-sidebar-hover/50 hover:text-white"
                )}
              >
                <ShieldAlert className="h-4 w-4 text-warning" />
                System Settings
              </Link>
            </div>
          )}
        </nav>

        <div className="p-4 border-t border-sidebar-hover bg-sidebar-bg">
          <div className="flex items-center gap-3 mb-4 px-2">
            <Avatar className="h-9 w-9 border border-danger">
              <AvatarFallback className="bg-danger/20 text-danger font-bold">
                {profile?.full_name?.charAt(0) || "A"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{profile?.full_name}</p>
              <p className="text-xs text-danger font-semibold truncate uppercase">{profile?.role}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-text hover:bg-sidebar-hover hover:text-white transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-white px-4 sm:px-6 shadow-sm">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden text-text-secondary"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="hidden lg:flex items-center text-sm font-medium text-text-secondary">
              <span className="bg-danger/10 text-danger px-2 py-0.5 rounded text-xs tracking-wide">ADMIN PORTAL</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <NotificationBell />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-8 w-8 cursor-pointer border border-border transition-all hover:ring-2 hover:ring-danger/50 active:scale-95">
                  <AvatarFallback className="bg-danger text-white text-xs font-bold">
                    {profile?.full_name?.charAt(0) || "A"}
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
                  <Link href="/admin/profile" className="flex items-center">
                    <UserIcon className="mr-2 h-4 w-4 text-danger" />
                    <span>Admin Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="cursor-pointer text-danger focus:text-danger focus:bg-danger/10"
                  onClick={handleLogout}
                >
                  <LogOutIcon className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
