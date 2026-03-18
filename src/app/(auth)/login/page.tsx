"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
    setErrorMsg("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      if (profile?.role === "admin" || profile?.role === "superadmin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    }
    
    // Do not set loading false immediately to allow redirect flush
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-card rounded-card border-border">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold text-text-primary tracking-tight">Welcome Back</CardTitle>
          <CardDescription className="text-text-secondary">
            Log in to your CGSAVER account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-text-primary">Email</Label>
              <Input id="email" type="email" required placeholder="m@example.com" value={formData.email} onChange={handleChange} className="rounded-btn" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-text-primary">Password</Label>
              <Input id="password" type="password" required value={formData.password} onChange={handleChange} className="rounded-btn" />
            </div>
            
            {errorMsg && (
              <p className="text-sm font-medium text-danger">{errorMsg}</p>
            )}

            <Button type="submit" className="w-full rounded-pill bg-accent hover:bg-accent-hover text-white transition-colors" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center gap-2">
          <div className="text-sm text-text-muted">
            Don't have an account?{" "}
            <Link href="/signup" className="text-accent hover:underline font-medium">
              Sign up here
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
