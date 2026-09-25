"use client";

import {
  LayoutDashboard,
  FolderKanban,
  Users,
  CreditCard,
  Megaphone,
  LayoutGrid,
  Settings,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { AppShell, type NavSection } from "@/components/AppShell";

const managementSection: NavSection = {
  title: "Manage",
  items: [
    { href: "/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/projects", label: "Projects", icon: FolderKanban },
    { href: "/admin/payments", label: "Payments", icon: CreditCard },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/announcements", label: "Announcements", icon: Megaphone },
    { href: "/admin/showcase", label: "Showcase", icon: LayoutGrid },
  ],
};

const superAdminSection: NavSection = {
  title: "Super admin",
  items: [{ href: "/admin/config", label: "System settings", icon: Settings }],
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { profile, user, isSuperAdmin } = useAuth();

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
    <AppShell
      homeHref="/admin"
      tag="Admin"
      sections={isSuperAdmin ? [managementSection, superAdminSection] : [managementSection]}
      profileHref="/admin/profile"
      userName={profile?.full_name}
      userEmail={user?.email}
      userRole={profile?.role ?? "admin"}
      onSignOut={handleLogout}
    >
      {children}
    </AppShell>
  );
}
