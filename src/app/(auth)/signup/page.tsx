"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast"; // Wait, shadcn toast has a specific hook if initialized. I'll rely on basic error handling if toast isn't set up yet.

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    university: "",
    studentId: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // 1. Sign up user
    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
    });

    if (error) {
      alert(error.message); // Fallback if toast isn't built
      setLoading(false);
      return;
    }

    if (data.user) {
      // 2. Create profile
      const { error: profileError } = await supabase.from("profiles").insert({
        id: data.user.id,
        full_name: formData.fullName,
        email: formData.email,
        university: formData.university || null,
        student_id: formData.studentId || null,
        role: "student",
      });

      if (profileError) {
        console.error("Profile creation error:", profileError);
        alert("Account created but failed to save profile details.");
      } else {
        setSuccess(true);
      }
    }
    
    setLoading(false);
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md shadow-card rounded-card border-border">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-text-primary">Check your email</CardTitle>
            <CardDescription className="text-text-secondary">
              We've sent a verification link to {formData.email}. Please verify your email to continue.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Link href="/login" className="text-accent font-medium hover:underline w-full text-center">
              Go to Login
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-card rounded-card border-border">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold text-text-primary tracking-tight">Create an account</CardTitle>
          <CardDescription className="text-text-secondary">
            Enter your details below to join CGSAVER
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-text-primary">Full Name</Label>
              <Input id="fullName" required placeholder="John Doe" value={formData.fullName} onChange={handleChange} className="rounded-btn" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-text-primary">Email</Label>
              <Input id="email" type="email" required placeholder="m@example.com" value={formData.email} onChange={handleChange} className="rounded-btn" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-text-primary">Password</Label>
              <Input id="password" type="password" required value={formData.password} onChange={handleChange} className="rounded-btn" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="university" className="text-text-primary">University (Optional)</Label>
              <Input id="university" placeholder="Your University" value={formData.university} onChange={handleChange} className="rounded-btn" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="studentId" className="text-text-primary">Student ID (Optional)</Label>
              <Input id="studentId" placeholder="e.g. 19-12345-1" value={formData.studentId} onChange={handleChange} className="rounded-btn" />
            </div>
            
            <Button type="submit" className="w-full rounded-pill bg-accent hover:bg-accent-hover text-white transition-colors" disabled={loading}>
              {loading ? "Creating account..." : "Sign Up"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center gap-2">
          <div className="text-sm text-text-muted">
            Already have an account?{" "}
            <Link href="/login" className="text-accent hover:underline font-medium">
              Login here
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
