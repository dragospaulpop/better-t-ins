import { db } from "@better-t-ins/db";
// biome-ignore lint/performance/noNamespaceImport: this is a schema
import * as schema from "@better-t-ins/db/schema/auth";
import { sendEmail } from "@better-t-ins/mail";
import { type BetterAuthOptions, betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { twoFactor } from "better-auth/plugins";

export const auth = betterAuth<BetterAuthOptions>({
  database: drizzleAdapter(db, {
    provider: "mysql",
    schema,
  }),
  appName: "VerdeINS",
  plugins: [twoFactor()],
  trustedOrigins: [process.env.CORS_ORIGIN || ""],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    autoSignIn: true,
    // sendResetPassword:
    // resetPasswordTokenExpiresIn: 3600, // 1 hour
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Verify your email address",
        html: `<p>Hello ${user.name},</p>
        <p>Click the link to verify your email: <a href="${url}">${url}</a></p>
        <p>Best regards,</p>
        <p>The ${process.env.APP_NAME} team</p>`,
      });
    },
    sendOnSignUp: false,
    autoSignInAfterVerification: true,
    expiresIn: 3600, // 1h
  },
  user: {
    deleteUser: {
      enabled: true,
      sendDeleteAccountVerification: async ({ user, url }) => {
        await sendEmail({
          to: user.email,
          subject: "Confirm account deletion",
          html: `<p>Sorry to see you leave, ${user.name},</p>
          <p>Click the link to delete your account: <a href="${url}">${url}</a></p>
          <p>If you did not request this, please ignore this email.</p>
          <p>Best regards,</p>
          <p>The ${process.env.APP_NAME} team</p>`,
        });
      },
    },
  },
  advanced: {
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
      httpOnly: true,
    },
  },
});
