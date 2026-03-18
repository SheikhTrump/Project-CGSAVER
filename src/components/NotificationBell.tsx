"use client";

import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { BellIcon } from "lucide-react";

export function NotificationBell() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-surface-2 text-text-secondary">
          <BellIcon className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-danger border border-surface"></span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0 shadow-modal rounded-card border-border">
        <div className="flex items-center justify-between p-4 pb-2">
          <h3 className="font-semibold text-text-primary">Notifications</h3>
          <button className="text-xs text-accent hover:underline">Mark all read</button>
        </div>
        <div className="flex flex-col max-h-[300px] overflow-y-auto p-2">
          {/* Placeholder for notifications */}
          <div className="p-4 text-center text-sm text-text-muted">
            <BellIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
            No new notifications
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
