"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [email, setEmail] = useState("");

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-5 py-12">
        <Link href="/" className="mb-8 text-[15px] font-semibold tracking-tight text-text-primary">cgsaver</Link>
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-xl font-medium tracking-tight text-text-primary">Check your email</CardTitle>
            <CardDescription className="mt-1 text-text-secondary">
              We&apos;ve sent a password reset link to <span className="font-semibold text-text-primary">{email}</span>.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button variant="outline" asChild className="h-10 w-full">
              <Link href="/login" className="flex items-center justify-center gap-2">
                <ArrowLeft className="h-4 w-4" /> Back to Login
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-5 py-12">
        <Link href="/" className="mb-8 text-[15px] font-semibold tracking-tight text-text-primary">cgsaver</Link>
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl font-medium tracking-tight text-text-primary">Forgot Password</CardTitle>
          <CardDescription className="text-text-secondary">
            Enter your email and we&apos;ll send you a reset link
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleResetRequest} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                required
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
               
              />
            </div>
            
            {errorMsg && (
              <p className="text-sm font-medium text-danger">{errorMsg}</p>
            )}

            <Button type="submit" className="h-10 w-full" disabled={loading}>
              {loading ? "Sending link..." : "Send Reset Link"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center gap-2 bg-surface">
          <Link href="/login" className="flex items-center gap-1 text-sm text-text-muted transition-colors hover:text-text-primary">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Login
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
