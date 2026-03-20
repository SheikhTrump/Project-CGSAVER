/**
 * Email Notification Service (Stub / Blueprint)
 * 
 * In a production environment with a configured Resend API key, you would:
 * 1. npm install resend @react-email/components
 * 2. Configure `const resend = new Resend(process.env.RESEND_API_KEY);`
 * 3. Replace the console.logs below with `resend.emails.send({...})`
 */

export const sendEmailNotification = async (
  to: string,
  subject: string,
  templateName: "welcome" | "project_submitted" | "quote_received" | "payment_confirmed" | "project_delivered" | "new_message",
  data: { name?: string; title?: string; price?: number }
) => {
  // Determine text body based on template (in real app, use React Email templates)
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

  // MOCK LOGIC for development so we don't crash without API keys or domains
  console.log("=====================================");
  console.log("✉️  EMAIL DISPATCH (MOCK)");
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Body: ${body}`);
  console.log("=====================================");

  return { success: true, mocked: true };
};
