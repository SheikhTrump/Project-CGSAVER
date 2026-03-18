"use client";

import { ChatWindow } from "@/components/ChatWindow";

export default function AdminMessagesTab({ projectId, adminId }: { projectId: string; adminId: string }) {
  return (
    <div className="animate-in fade-in duration-500">
      <ChatWindow 
        projectId={projectId} 
        currentUserId={adminId}
        isAdminView={true}
        title="Client Communication"
      />
    </div>
  );
}
