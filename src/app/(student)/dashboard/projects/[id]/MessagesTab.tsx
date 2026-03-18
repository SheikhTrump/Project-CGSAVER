"use client";

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, MessageSquareText } from "lucide-react";

export default function ProjectMessagesTab({ projectId, userId }: { projectId: string; userId: string }) {
  // Phase 4 will wire this up fully with realtime supabase subscriptions.
  return (
    <Card className="shadow-sm border-border h-[600px] flex flex-col">
      <CardHeader className="border-b border-border py-4 bg-surface-2/30">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageSquareText className="h-5 w-5 text-accent" /> 
          Project Discussion
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col justify-end p-6 bg-surface">
        <div className="text-center space-y-3 opacity-50 mb-auto mt-auto">
          <MessageSquareText className="h-12 w-12 mx-auto text-text-muted" />
          <p className="text-text-muted text-sm">No messages yet. Real-time chat integration is coming in Phase 4!</p>
        </div>

        {/* Placeholder Chat bubble */}
        <div className="w-full flex justify-end mb-4 opacity-50">
          <div className="bg-accent/10 border border-accent/20 rounded-t-xl rounded-l-xl p-3 max-w-[80%]">
            <p className="text-sm text-text-primary">Hi, I'd like to ask about the tech stack requirements.</p>
            <span className="text-[10px] text-text-muted block mt-1 text-right">You - 12:00 PM</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="border-t border-border p-4 bg-surface-2/30">
        <form className="flex w-full items-center gap-3">
          <Input 
            placeholder="Type your message... (Disabled for Phase 2)" 
            disabled 
            className="flex-1 rounded-full bg-white shadow-sm"
          />
          <Button disabled size="icon" className="rounded-full bg-accent hover:bg-accent-hover text-white shadow-sm shrink-0">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
