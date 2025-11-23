import "dotenv/config";
import nodemailer from "nodemailer";
import { Resend } from "resend";
import { z } from "zod";

const envSchema = z.object({
  RESEND_API_KEY: z.string(),
  FROM_EMAIL: z.string().default("noreply@localhost"),
  SMTP_HOST: z.string().default("localhost"),
  SMTP_PORT: z.string().default("1025"),
  SMTP_USER: z.string().default(""),
  SMTP_PASS: z.string().default(""),
  NODE_ENV: z.string().default("development"),
});

const env = envSchema.safeParse(process.env);

if (!env.success) {
  throw new Error("Invalid environment variables", {
    cause: env.error,
  });
}

const isProd = env.data.NODE_ENV === "production";

let sendEmail: (opts: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) => Promise<void>;

if (isProd) {
  // Use Resend in production
  const resend = new Resend(env.data.RESEND_API_KEY);
  sendEmail = async ({ to, subject, html, text }) => {
    await resend.emails.send({
      from: env.data.FROM_EMAIL,
      to,
      subject,
      html,
      text,
    });
  };
} else {
  // Use MailHog locally
  const transporter = nodemailer.createTransport({
    host: env.data.SMTP_HOST,
    port: Number(env.data.SMTP_PORT),
    auth: env.data.SMTP_USER
      ? {
          user: env.data.SMTP_USER,
          pass: env.data.SMTP_PASS,
        }
      : undefined,
  });

  sendEmail = async ({ to, subject, html, text }) => {
    await transporter.sendMail({
      from: env.data.FROM_EMAIL,
      to,
      subject,
      html,
      text,
    });
  };
}

export { sendEmail };
