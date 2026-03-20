"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, Trash2, Edit2, ExternalLink, Sparkles } from "lucide-react";

interface ShowcaseEntry {
  id: string;
  title: string;
  description: string;
  tech_stack: string | null;
  live_link: string | null;
  image_url: string | null;
  created_at: string;
}

export default function AdminShowcasePage() {
  const [entries, setEntries] = useState<ShowcaseEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [techStack, setTechStack] = useState("");
  const [liveLink, setLiveLink] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const { data, error } = await supabase
        .from("showcase_entries")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setEntries(data || []);
    } catch (err) {
      console.error("Error fetching showcase:", err);
      alert("Failed to load showcase projects");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setTechStack("");
    setLiveLink("");
    setImageUrl("");
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      title,
      description,
      tech_stack: techStack || null,
      live_link: liveLink || null,
      image_url: imageUrl || null,
    };

    try {
      if (editingId) {
        const { error } = await supabase
          .from("showcase_entries")
          .update(payload)
          .eq("id", editingId);
        if (error) throw error;
        alert("Project updated successfully");
      } else {
        const { error } = await supabase
          .from("showcase_entries")
          .insert(payload);
        if (error) throw error;
        alert("Project added to showcase");
      }
      resetForm();
      fetchEntries();
    } catch (err: unknown) {
      console.error("Error saving entry:", err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      alert(`Failed to save showcase project: ${errorMessage}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (entry: ShowcaseEntry) => {
    setEditingId(entry.id);
    setTitle(entry.title);
    setDescription(entry.description || "");
    setTechStack(entry.tech_stack || "");
    setLiveLink(entry.live_link || "");
    setImageUrl(entry.image_url || "");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this project from showcase?")) return;

    try {
      const { error } = await supabase
        .from("showcase_entries")
        .delete()
        .eq("id", id);
      if (error) throw error;
      alert("Project removed");
      fetchEntries();
    } catch (err) {
      console.error("Error deleting entry:", err);
      alert("Failed to delete project");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-text-primary flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-accent" />
          Showcase Management
        </h1>
        <p className="text-text-secondary mt-1">Manage projects displayed in the public Hall of Fame.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-1">
          <Card className="shadow-sm border-border sticky top-24">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                {editingId ? <Edit2 className="h-4 w-4" /> : <Plus className="h-4 w-4 text-accent" />}
                {editingId ? "Edit Showcase Project" : "Add New Project"}
              </CardTitle>
              <CardDescription>Enter details manually for the public showcase.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Project Name *</Label>
                  <Input id="title" value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g. E-Commerce Platform" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="desc">Description *</Label>
                  <Textarea id="desc" value={description} onChange={e => setDescription(e.target.value)} required placeholder="Briefly describe the project..." className="min-h-[100px]" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tech">Tech Stack</Label>
                  <Input id="tech" value={techStack} onChange={e => setTechStack(e.target.value)} placeholder="e.g. React, Node.js, MongoDB" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="live">Live Link</Label>
                  <Input id="live" value={liveLink} onChange={e => setLiveLink(e.target.value)} placeholder="https://example.com" type="url" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">Image URL</Label>
                  <Input id="image" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="Direct link to project image" type="url" />
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <Button type="submit" className="w-full bg-accent hover:bg-accent-hover text-white" disabled={submitting}>
                    {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {editingId ? "Update Project" : "Add to Showcase"}
                  </Button>
                  {editingId && (
                    <Button type="button" variant="ghost" onClick={resetForm} className="w-full">
                      Cancel Edit
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* List Column */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-text-primary px-1">Curated Projects ({entries.length})</h2>
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-surface rounded-card border border-border border-dashed">
              <Loader2 className="h-8 w-8 text-accent animate-spin mb-2" />
              <p className="text-text-secondary">Loading showcase entries...</p>
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-20 bg-surface rounded-card border border-border border-dashed">
              <Sparkles className="h-12 w-12 mx-auto text-text-muted opacity-20 mb-4" />
              <p className="text-text-secondary">No projects in your showcase yet. Start by adding one!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {entries.map((entry) => (
                <Card key={entry.id} className="group overflow-hidden border-border transition-all hover:shadow-md">
                  <div className="flex flex-col sm:flex-row h-full">
                    {entry.image_url && (
                      <div className="sm:w-48 h-32 sm:h-auto overflow-hidden bg-muted flex-shrink-0 relative">
                        <Image 
                          src={entry.image_url} 
                          alt={entry.title} 
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          unoptimized
                        />
                      </div>
                    )}
                    <div className="flex-1 p-5 flex flex-col">
                      <div className="flex justify-between items-start gap-4 mb-2">
                        <div>
                          <h3 className="font-bold text-text-primary">{entry.title}</h3>
                          {entry.tech_stack && (
                            <span className="text-[10px] uppercase tracking-wider font-bold text-accent bg-accent/10 px-1.5 py-0.5 rounded mt-1 inline-block">
                              {entry.tech_stack}
                            </span>
                          )}
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-text-muted hover:text-accent" onClick={() => handleEdit(entry)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-text-muted hover:text-danger" onClick={() => handleDelete(entry.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <p className="text-sm text-text-secondary mb-4 flex-1 whitespace-pre-wrap">
                        {entry.description}
                      </p>

                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/40">
                        <span className="text-[10px] text-text-muted">Added {new Date(entry.created_at).toLocaleDateString()}</span>
                        {entry.live_link && (
                          <a 
                            href={entry.live_link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs font-bold text-danger hover:underline flex items-center gap-1"
                          >
                            Live Demo <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
