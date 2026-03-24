import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmailNotification = async (
  to: string,
  subject: string,
  templateName: "welcome" | "project_submitted" | "quote_received" | "payment_confirmed" | "project_delivered" | "new_message",
  data: { name?: string; title?: string; price?: number }
) => {
  // Determine text body based on template
  let body = "";
  switch (templateName) {
    case "welcome":
      body = `Welcome to CGSAVER, ${data.name}! Your account has been securely created.`;
      break;
    case "project_submitted":
      body = `Your project "${data.title}" has been successfully submitted and is under review by our admins.`;
      break;
    case "quote_received":
      body = `Good news! You have received a quote of ${data.price} BDT for your project "${data.title}". Login to review and accept.`;
      break;
    case "payment_confirmed":
      body = `Your payment for "${data.title}" has been verified! Our team is now working on your project.`;
      break;
    case "project_delivered":
      body = `Your project "${data.title}" is ready! Log in to download your deliverables and mark it as completed.`;
      break;
    case "new_message":
      body = `You have a new message regarding "${data.title}". Log in to your dashboard to reply.`;
      break;
  }

  try {
    const { data: response, error } = await resend.emails.send({
      from: 'CGSAVER <onboarding@resend.dev>', // Replace with your verified domain e.g. notifications@cgsaver.com
      to: [to],
      subject: subject,
      text: body,
    });

    if (error) {
      console.error("Resend Error:", error);
      return { success: false, error };
    }

    return { success: true, data: response };
  } catch (err) {
    console.error("Email Dispatch Failed:", err);
    return { success: false, error: err };
  }
};
