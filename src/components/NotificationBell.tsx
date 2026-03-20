"use client";

import { useState, useEffect } from "react";
import { Bell, Check, Loader2 } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  link: string | null;
  type: string;
  is_read: boolean;
  created_at: string;
}

export function NotificationBell() {
  const { user } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch initial notifications
  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (data) {
        setNotifications(data);
      }
      setLoading(false);
    };

    fetchNotifications();

    // Subscribe to new notifications
    const channel = supabase
      .channel(`notifications_${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setNotifications(prev => [payload.new as Notification, ...prev]);
          } else if (payload.eventType === "UPDATE") {
             setNotifications(prev => prev.map(n => n.id === payload.new.id ? payload.new as Notification : n));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const markAllAsRead = async () => {
    if (!user) return;
    
    // Optimistic update
    setNotifications(prev => prev.map(n => ({...n, is_read: true})));
    
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);
  };

  const markAsReadAndNavigate = async (notification: Notification) => {
    if (!notification.is_read) {
      // Optimistic
      setNotifications(prev => prev.map(n => n.id === notification.id ? {...n, is_read: true} : n));
      await supabase.from("notifications").update({ is_read: true }).eq("id", notification.id);
    }
    
    if (notification.link) {
      router.push(notification.link);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-text-secondary hover:text-text-primary hover:bg-surface-2 transition-colors">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-2 inline-flex h-2 w-2 rounded-full bg-danger">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger opacity-75"></span>
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80 shadow-lg border-border">
        <DropdownMenuLabel className="font-semibold text-text-primary flex justify-between items-center py-2 px-3">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={markAllAsRead}
              className="h-auto p-1 text-xs text-accent hover:text-accent-hover font-medium"
            >
              <Check className="h-3 w-3 mr-1" /> Mark all read
            </Button>
          )}
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator className="bg-border" />
        
        <div className="max-h-[70vh] overflow-y-auto">
          {loading ? (
            <div className="py-8 flex justify-center text-text-muted">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-8 text-center px-4">
              <Bell className="h-8 w-8 mx-auto text-text-muted opacity-30 mb-2" />
              <p className="text-sm font-medium text-text-primary">All caught up!</p>
              <p className="text-xs text-text-secondary">You have no notifications yet.</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem 
                key={notification.id} 
                className={`flex flex-col items-start px-4 py-3 cursor-pointer ${notification.is_read ? 'opacity-75 focus:bg-surface-2' : 'bg-accent/5 focus:bg-accent/10 border-l-2 border-accent'}`}
                onClick={() => markAsReadAndNavigate(notification)}
              >
                <div className="flex justify-between w-full mb-1">
                  <span className={`font-semibold text-sm ${notification.is_read ? 'text-text-primary' : 'text-accent'}`}>
                    {notification.title}
                  </span>
                  <span className="text-[10px] text-text-muted whitespace-nowrap ml-2">
                    {format(new Date(notification.created_at), "MMM d")}
                  </span>
                </div>
                <p className="text-xs text-text-secondary line-clamp-2">
                  {notification.message}
                </p>
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
