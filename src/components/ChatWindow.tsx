"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, MessageSquareText, Loader2 } from "lucide-react";
import { format } from "date-fns";

type Message = {
  id: string;
  project_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  profiles?: { full_name: string; role: string };
};

export function ChatWindow({ 
  projectId, 
  currentUserId, 
  title = "Project Discussion",
}: { 
  projectId: string; 
  currentUserId: string;
  title?: string;
  // Kept for callers; both portals now share one chat style
  isAdminView?: boolean;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Fetch initial messages
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*, profiles!sender_id(full_name, role)")
        .eq("project_id", projectId)
        .order("created_at", { ascending: true });

      if (!error && data) {
        setMessages(data as Message[]);
      }
      setLoading(false);
      scrollToBottom();
    };

    fetchMessages();

    // 2. Subscribe to realtime inserts
    const channel = supabase
      .channel(`chat_${projectId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `project_id=eq.${projectId}`
        },
        async (payload) => {
          // Fetch the profile for the new message to display the name/role correctly
          const { data: profileData } = await supabase
            .from("profiles")
            .select("full_name, role")
            .eq("id", payload.new.sender_id)
            .single();

          const newMsg = {
            ...payload.new,
            profiles: profileData
          } as Message;

          setMessages((prev) => [...prev, newMsg]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 3. Mark messages as read when viewed
  useEffect(() => {
    if (!projectId || !currentUserId || messages.length === 0) return;

    const markAsRead = async () => {
      const { error } = await supabase
        .from("messages")
        .update({ is_read: true })
        .eq("project_id", projectId)
        .neq("sender_id", currentUserId)
        .eq("is_read", false);

      if (error) {
        console.error("Error marking messages as read:", error);
      } else {
        console.log("Messages marked as read for project:", projectId);
      }
    };

    markAsRead();
  }, [projectId, currentUserId, messages.length]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUserId) return;
    
    setSending(true);
    const msgText = newMessage.trim();
    setNewMessage(""); // Optimistic clear

    try {
      const { error } = await supabase.from("messages").insert({
        project_id: projectId,
        sender_id: currentUserId,
        content: msgText
      });
      if (error) {
        console.error("Failed to send message:", error);
        throw error;
      }
    } catch (err) {
      console.error(err);
      setNewMessage(msgText); // Restore if failed
    } finally {
      setSending(false);
    }
  };

  return (
    <Card className="border-border h-[600px] flex flex-col">
      <CardHeader className="border-b border-border pb-4">
        <CardTitle className="flex items-center gap-2">
          <MessageSquareText className="h-4 w-4 text-text-muted" />
          {title}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto px-5 py-2 space-y-4 flex flex-col">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-text-muted opacity-50" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center my-auto">
            <p className="text-sm text-text-muted">No messages yet. Send one to start the conversation.</p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col gap-3 justify-start">
            {messages.map((msg) => {
              const isMine = msg.sender_id === currentUserId;
              const senderRole = msg.profiles?.role || 'student';
              const isAdminMsg = senderRole === 'admin' || senderRole === 'superadmin';

              return (
                <div key={msg.id} className={`w-full flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`
                    max-w-[80%] p-3 text-sm relative
                    ${isMine 
                      ? 'rounded-l-lg rounded-tr-lg' 
                      : 'rounded-r-lg rounded-tl-lg'
                    }
                    ${isMine 
                      ? 'bg-accent text-white' 
                      : (isAdminMsg ? 'bg-surface-2 text-text-primary' : 'bg-surface border border-border text-text-primary')
                    }
                  `}>
                    {!isMine && !isAdminMsg && (
                      <span className="block text-xs font-medium mb-1 text-text-muted">
                        {msg.profiles?.full_name || 'User'}
                      </span>
                    )}
                    <p className="whitespace-pre-wrap break-words leading-relaxed">{msg.content}</p>
                    <span className={`text-[10px] block mt-1 ${isMine ? 'text-white/70 text-right' : 'text-text-muted text-left'}`}>
                      {format(new Date(msg.created_at), "p")}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} className="h-1" />
          </div>
        )}
      </CardContent>

      <CardFooter className="p-3">
        <form onSubmit={handleSend} className="flex w-full items-center gap-3">
          <Input 
            required
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={sending}
            placeholder="Type your message..." 
            className="flex-1"
          />
          <Button 
            type="submit" 
            disabled={sending || !newMessage.trim()} 
            size="icon" 
            className="shrink-0"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
