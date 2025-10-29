import nodemailer from "nodemailer";
import { Resend } from "resend";

const isProd = process.env.NODE_ENV === "production";

let sendEmail: (opts: {
  to: string;
  subject: string;
  html: string;
}) => Promise<void>;

if (isProd) {
  // Use Resend in production
  const resend = new Resend(process.env.RESEND_API_KEY);
  sendEmail = async ({ to, subject, html }) => {
    await resend.emails.send({
      from: process.env.FROM_EMAIL || "noreply@localhost",
      to,
      subject,
      html,
    });
  };
} else {
  // Use MailHog locally
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "localhost",
    port: Number(process.env.SMTP_PORT || "1025"),
    auth: process.env.SMTP_USER
      ? {
          user: process.env.SMTP_USER || "",
          pass: process.env.SMTP_PASS || "",
        }
      : undefined,
  });

  sendEmail = async ({ to, subject, html }) => {
    await transporter.sendMail({
      from: "noreply@localhost",
      to,
      subject,
      html,
    });
  };
}

export { sendEmail };
