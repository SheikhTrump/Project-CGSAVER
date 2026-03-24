import nodemailer from 'nodemailer';

// Configure the SMTP transporter for Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

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
    const info = await transporter.sendMail({
      from: `"PROJECT CGSAVER" <${process.env.GMAIL_USER}>`,
      to: to,
      subject: subject,
      text: body,
    });

    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error("Email Dispatch Failed:", err);
    return { success: false, error: err };
  }
};
