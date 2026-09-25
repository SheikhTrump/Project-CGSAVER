"use client";

import { useState } from "react";
import { LayoutDashboard, FolderKanban, Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { AppShell, type NavSection } from "@/components/AppShell";

const sections: NavSection[] = [
  {
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/dashboard/projects", label: "My projects", icon: FolderKanban },
      { href: "/dashboard/projects/new", label: "New project", icon: Plus },
    ],
  },
];

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const { profile, user } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await supabase.auth.signOut();
      // Use window.location.href for a full refresh to clear server-side session
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
      window.location.href = "/login"; // Force redirect anyway
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <AppShell
      homeHref="/dashboard"
      sections={sections}
      profileHref="/dashboard/profile"
      userName={profile?.full_name}
      userEmail={user?.email}
      userRole="Student"
      onSignOut={handleLogout}
      signingOut={isLoggingOut}
    >
      {children}
    </AppShell>
  );
}
