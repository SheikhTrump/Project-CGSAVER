"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Megaphone, Trash2, Loader2, AlertTriangle, Pin } from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

export default function AdminAnnouncementsPage() {
  const { user, isSuperAdmin } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    is_urgent: false,
    is_pinned: false
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    const { data } = await supabase
      .from("announcements")
      .select("*, profiles!admin_id(full_name)")
      .order("created_at", { ascending: false });
    if (data) setAnnouncements(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !isSuperAdmin) return;
    
    setLoading(true);
    try {
      await supabase.from("announcements").insert({
        title: formData.title,
        body: formData.content,
        is_urgent: formData.is_urgent,
        is_pinned: formData.is_pinned,
        admin_id: user.id
      });
      
      setFormData({ title: "", content: "", is_urgent: false, is_pinned: false });
      await fetchAnnouncements();
    } catch (error) {
      console.error(error);
      alert("Failed to publish announcement");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;
    try {
      await supabase.from("announcements").delete().eq("id", id);
      setAnnouncements(prev => prev.filter(a => a.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  if (isSuperAdmin === false) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center text-text-secondary">
        <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-warning" />
        <h2 className="text-xl font-bold text-text-primary">Access Denied</h2>
        <p>Only Super Admins can manage global organization announcements.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-text-primary">Global Announcements</h1>
        <p className="text-text-secondary mt-1">Broadcast important platform updates or alerts to all students.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Composer Form */}
        <Card className="lg:col-span-1 shadow-sm border-border h-fit">
          <CardHeader className="bg-sidebar-hover text-white rounded-t-card pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <Megaphone className="h-5 w-5 text-accent" />
              New Broadcast
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-text-primary">Title</Label>
                <Input required id="title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="bg-surface" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="content" className="text-text-primary">Message</Label>
                <Textarea required id="content" value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="bg-surface min-h-[120px]" />
              </div>

              <div className="flex flex-col gap-3 py-2">
                <label className="flex items-center gap-2 text-sm text-text-primary cursor-pointer hover:bg-surface-2 p-2 rounded-md border border-transparent hover:border-border transition-colors">
                  <input type="checkbox" className="rounded border-border text-danger focus:ring-danger h-4 w-4" checked={formData.is_urgent} onChange={e => setFormData({...formData, is_urgent: e.target.checked})} />
                  <span className="flex items-center gap-1"><AlertTriangle className="h-4 w-4 text-danger" /> Mark as Urgent (Red Banner)</span>
                </label>
                
                <label className="flex items-center gap-2 text-sm text-text-primary cursor-pointer hover:bg-surface-2 p-2 rounded-md border border-transparent hover:border-border transition-colors">
                  <input type="checkbox" className="rounded border-border text-accent focus:ring-accent h-4 w-4" checked={formData.is_pinned} onChange={e => setFormData({...formData, is_pinned: e.target.checked})} />
                  <span className="flex items-center gap-1"><Pin className="h-4 w-4 text-accent" /> Pin to Dashboard Top</span>
                </label>
              </div>

              <Button type="submit" disabled={loading} className="w-full bg-accent hover:bg-accent-hover text-white">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Publish Announcement"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Existing Announcements List */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-semibold text-text-primary text-lg">Broadcast History</h3>
          
          {announcements.length === 0 ? (
            <div className="text-center py-12 bg-surface-2/30 rounded-card border border-border border-dashed">
              <Megaphone className="h-10 w-10 mx-auto text-text-muted opacity-30 mb-2" />
              <p className="text-sm text-text-secondary">No announcements have been published yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {announcements.map((ann) => (
                <div key={ann.id} className={`p-5 rounded-card border ${ann.is_urgent ? 'border-danger/30 bg-red-50' : 'border-border bg-surface'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      {ann.is_urgent && <span className="bg-danger text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Urgent</span>}
                      {ann.is_pinned && <span className="bg-accent/10 border border-accent/20 text-accent text-[10px] uppercase font-bold px-2 py-0.5 rounded flex items-center gap-1"><Pin className="h-3 w-3" /> Pinned</span>}
                      <h4 className={`font-bold text-lg ${ann.is_urgent ? 'text-danger' : 'text-text-primary'}`}>{ann.title}</h4>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(ann.id)} className="h-8 w-8 text-text-muted hover:text-danger hover:bg-red-50 -mt-1 -mr-1">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <p className="text-text-secondary text-sm whitespace-pre-wrap mb-4">{ann.body}</p>
                  
                  <div className="flex items-center justify-between text-xs text-text-muted border-t border-border/50 pt-3">
                    <span>By {ann.profiles?.full_name || 'Admin'}</span>
                    <span>{format(new Date(ann.created_at), "MMM d, yyyy 'at' p")}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
