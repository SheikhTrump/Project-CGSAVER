"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Loader2, User, CheckCircle2 } from "lucide-react";

type Profile = {
  id: string;
  full_name: string;
  email: string;
  role: string;
};

export function ProfileForm({ initialProfile }: { initialProfile: Profile }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    fullName: initialProfile.full_name || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
    setSuccess(false);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          full_name: formData.fullName,
        })
        .eq("id", initialProfile.id);

      if (updateError) throw updateError;
      
      setSuccess(true);
      // Optional: window.location.reload() to sync other UI parts like headers
      // But we can just use the local state for now
    } catch (err: any) {
      console.error("Profile update error:", err);
      setError(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-sm border-border">
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
          <User className="h-6 w-6 text-accent" />
          Profile Settings
        </CardTitle>
        <CardDescription>
          Update your personal information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="profile-form" onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-text-muted">Email Address</Label>
            <Input 
              id="email" 
              value={initialProfile.email} 
              disabled 
              className="bg-surface-2 cursor-not-allowed opacity-70"
            />
            <p className="text-[10px] text-text-muted italic">Email cannot be changed.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-text-muted" /> Full Name
              </Label>
              <Input 
                id="fullName" 
                placeholder="John Doe" 
                value={formData.fullName} 
                onChange={handleChange} 
                className="rounded-btn"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-text-muted">Account Role</Label>
              <div className="h-10 flex items-center px-3 rounded-btn bg-surface-2 border border-border text-sm font-semibold text-text-primary capitalize">
                {initialProfile.role}
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-md bg-danger/10 border border-danger/20 text-danger text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 rounded-md bg-success/10 border border-success/20 text-success text-sm flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Profile updated successfully!
            </div>
          )}
        </form>
      </CardContent>
      <CardFooter className="border-t border-border pt-6 flex justify-end">
        <Button 
          form="profile-form" 
          type="submit" 
          disabled={loading}
          className="rounded-pill bg-accent hover:bg-accent-hover text-white px-8 transition-all active:scale-95"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving Changes...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
