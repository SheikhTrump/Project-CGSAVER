"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save, ShieldCheck, AlertCircle } from "lucide-react";

export default function SystemSettingsPage() {
  const { isSuperAdmin, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Settings state
  const [paymentMethods, setPaymentMethods] = useState({
    bkash: ""
  });
  
  const [platformSettings, setPlatformSettings] = useState({
    maintenance_mode: false,
    allow_new_projects: true
  });

  useEffect(() => {
    async function fetchSettings() {
      if (authLoading) return;
      if (!isSuperAdmin) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("system_config")
          .select("*");

        if (error) throw error;

        if (data) {
          const pm = data.find(item => item.key === 'payment_methods');
          if (pm) setPaymentMethods(pm.value);

          const ps = data.find(item => item.key === 'platform_settings');
          if (ps) setPlatformSettings(ps.value);
        }
      } catch (err: unknown) {
        console.error("Error fetching settings:", err);
        setError((err as Error).message || "Failed to load settings. Please check your permissions.");
      } finally {
        setLoading(false);
      }
    }

    fetchSettings();
  }, [isSuperAdmin, authLoading]);

  const handleSavePaymentMethods = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const { error } = await supabase
        .from("system_config")
        .upsert({
          key: "payment_methods",
          value: paymentMethods,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      console.error("Error saving payment methods:", err);
      setError((err as Error).message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleSavePlatformSettings = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const { error } = await supabase
        .from("system_config")
        .upsert({
          key: "platform_settings",
          value: platformSettings,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      console.error("Error saving platform settings:", err);
      setError((err as Error).message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-danger" />
      </div>
    );
  }

  if (!isSuperAdmin) {
    return (
      <div className="p-8 text-center bg-danger/10 text-danger rounded-md border border-danger/20">
        <ShieldCheck className="h-12 w-12 mx-auto mb-4" />
        <h2 className="text-xl font-bold">Access Denied</h2>
        <p>You must have Super Admin privileges to view this page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-text-primary">System Settings</h1>
        <p className="text-text-secondary mt-1">Manage global platform configurations and preferences.</p>
      </div>

      {error && (
        <div className="bg-danger/10 border border-danger/20 text-danger p-4 rounded-md flex items-center gap-3">
          <AlertCircle className="h-5 w-5" />
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-success/10 border border-success/20 text-success p-4 rounded-md flex items-center gap-3">
          <ShieldCheck className="h-5 w-5" />
          <p>Settings saved successfully!</p>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Payment Account Settings */}
        <Card className="shadow-sm border-border">
          <CardHeader>
            <CardTitle>Payment Accounts</CardTitle>
            <CardDescription>Configure the bKash number displayed to students during payment.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-white">
            <div className="space-y-2">
              <Label htmlFor="bkash">bKash Number</Label>
              <Input 
                id="bkash" 
                value={paymentMethods.bkash} 
                onChange={(e) => setPaymentMethods({...paymentMethods, bkash: e.target.value})}
                placeholder="e.g. 017XXXXXXXX"
                className="bg-surface-2"
              />
            </div>
          </CardContent>
          <CardFooter className="border-t border-border pt-4">
            <Button 
              className="bg-accent hover:bg-accent-hover text-white rounded-pill" 
              onClick={handleSavePaymentMethods}
              disabled={saving}
            >
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Payment Details
            </Button>
          </CardFooter>
        </Card>

        {/* Platform Status Settings */}
        <Card className="shadow-sm border-border">
          <CardHeader>
            <CardTitle>Platform Controls</CardTitle>
            <CardDescription>Toggle platform-wide features and maintenance mode.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-3 bg-surface-2 rounded-md">
              <div>
                <p className="font-medium text-text-primary">New Project Submissions</p>
                <p className="text-xs text-text-secondary">If disabled, students cannot create new projects.</p>
              </div>
              <input 
                type="checkbox" 
                checked={platformSettings.allow_new_projects} 
                onChange={(e) => setPlatformSettings({...platformSettings, allow_new_projects: e.target.checked})}
                className="h-5 w-5 rounded border-border text-accent focus:ring-accent"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-surface-2 rounded-md border border-warning/20">
              <div>
                <p className="font-medium text-text-primary">Maintenance Mode</p>
                <p className="text-xs text-text-secondary">Take the platform offline for everyone except admins.</p>
              </div>
              <input 
                type="checkbox" 
                checked={platformSettings.maintenance_mode} 
                onChange={(e) => setPlatformSettings({...platformSettings, maintenance_mode: e.target.checked})}
                className="h-5 w-5 rounded border-border text-accent focus:ring-accent"
              />
            </div>
          </CardContent>
          <CardFooter className="border-t border-border pt-4">
            <Button 
              className="bg-accent hover:bg-accent-hover text-white rounded-pill" 
              onClick={handleSavePlatformSettings}
              disabled={saving}
            >
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Update Platform Status
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
