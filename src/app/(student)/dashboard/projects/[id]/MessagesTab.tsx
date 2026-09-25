"use client";

import { ChatWindow } from "@/components/ChatWindow";

export default function ProjectMessagesTab({ projectId, userId }: { projectId: string; userId: string }) {
  return (
    <div>
      <ChatWindow 
        projectId={projectId} 
        currentUserId={userId} 
      />
    </div>
  );
}
