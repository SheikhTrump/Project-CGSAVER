"use client";

import { ChatWindow } from "@/components/ChatWindow";

export default function AdminMessagesTab({ projectId, adminId }: { projectId: string; adminId: string }) {
  return (
    <div>
      <ChatWindow 
        projectId={projectId} 
        currentUserId={adminId}
        isAdminView={true}
        title="Client Communication"
      />
    </div>
  );
}
