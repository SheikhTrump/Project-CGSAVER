import { createClient } from "@/utils/supabase/server";
import { ProfileForm } from "@/components/ProfileForm";
import { redirect } from "next/navigation";

export default async function StudentProfilePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return <div>Profile not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-3xl font-bold text-text-primary tracking-tight">Your Profile</h1>
        <p className="text-text-secondary mt-2">Manage your account information and preferences</p>
      </div>

      <ProfileForm initialProfile={profile} />
    </div>
  );
}
