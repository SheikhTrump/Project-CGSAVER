import { supabase } from "@/lib/supabase";

export type NotificationPayload = {
  userId: string;
  title: string;
  message: string;
  link?: string;
  type?: string;
};

/**
 * Sends a notification to a specific user
 */
export async function sendNotification({
  userId,
  title,
  message,
  link,
  type,
}: NotificationPayload) {
  const { error } = await supabase.from("notifications").insert({
    user_id: userId,
    title,
    message,
    link,
    type,
    is_read: false,
  });

  if (error) {
    console.error("Error sending notification:", error);
    return { success: false, error };
  }

  return { success: true };
}

/**
 * Sends a notification to all admins and superadmins
 */
export async function notifyAdmins({
  title,
  message,
  link,
  type = "admin_alert",
}: Omit<NotificationPayload, "userId">) {
  // 1. Fetch all admin/superadmin IDs
  const { data: admins, error: fetchError } = await supabase
    .from("profiles")
    .select("id")
    .in("role", ["admin", "superadmin"]);

  if (fetchError || !admins) {
    console.error("Error fetching admins for notification:", fetchError);
    return { success: false, error: fetchError };
  }

  // 2. Send notification to each admin
  const notifications = admins.map((admin) => ({
    user_id: admin.id,
    title,
    message,
    link,
    type,
    is_read: false,
  }));

  const { error: insertError } = await supabase
    .from("notifications")
    .insert(notifications);

  if (insertError) {
    console.error("Error broadcasting notifications to admins:", insertError);
    return { success: false, error: insertError };
  }

  return { success: true };
}
