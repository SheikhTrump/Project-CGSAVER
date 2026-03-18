import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Megaphone, Wrench } from "lucide-react";

export default function AdminAnnouncementsPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-text-primary">Announcements</h1>
        <p className="text-text-secondary mt-1">Send global updates to all students.</p>
      </div>

      <Card className="shadow-sm border-border border-dashed bg-surface-2/50">
        <CardContent className="flex flex-col items-center justify-center p-12 text-center text-text-muted">
          <Wrench className="h-16 w-16 mb-4 opacity-50" />
          <h2 className="text-xl font-bold text-text-primary mb-2">Under Construction</h2>
          <p className="max-w-md mx-auto">
            The announcement management system will be fully implemented alongside the notification center in Phase 4.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
