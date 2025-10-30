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
  plugins: [
    twoFactor({
      otpOptions: {
        sendOTP: async ({ user, otp }) => {
          await sendEmail({
            to: user.email,
            subject: "Your OTP code",
            html: `
            <p>Hello ${user.name},</p>
            <p>Your OTP code is: <strong>${otp}</strong></p>
            <p>This code will expire in 3 minutes.</p>
            <p>Best regards,</p>
            <p>The ${process.env.APP_NAME} team</p>`,
          });
        },
      },
    }),
  ],
  trustedOrigins: [process.env.CORS_ORIGIN || ""],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // this autosends the verification email with the url set to /
    autoSignIn: true,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Reset your password",
        html: `<p>Hello ${user.name},</p>
        <p>Click the link to reset your password: <a href="${url}">${url}</a></p>
        <p>If you did not request this, please ignore this email.</p>
        <p>This link will expire in 1 hour.</p>
        <p>Best regards,</p>
        <p>The ${process.env.APP_NAME} team</p>`,
      });
    },
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
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60, // 1 minute
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

// Infer the API type with plugins included
export type AuthAPIWithPlugins = ReturnType<
  typeof betterAuth<
    BetterAuthOptions & { plugins: [ReturnType<typeof twoFactor>] }
  >
>["api"];
