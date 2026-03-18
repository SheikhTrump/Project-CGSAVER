"use client";

import { ChatWindow } from "@/components/ChatWindow";

export default function ProjectMessagesTab({ projectId, userId }: { projectId: string; userId: string }) {
  return (
    <div className="animate-in fade-in duration-500">
      <ChatWindow 
        projectId={projectId} 
        currentUserId={userId} 
      />
    </div>
  );
}
