import { db } from "@better-t-ins/db";
// biome-ignore lint/performance/noNamespaceImport: this is a schema
import * as schema from "@better-t-ins/db/schema/auth";
import { sendEmail } from "@better-t-ins/mail";
import DeleteAccountEmail from "@better-t-ins/mail/emails/delete-account-email";
import MagicLinkEmail from "@better-t-ins/mail/emails/magic-link-email";
import OTPEmail from "@better-t-ins/mail/emails/otp-email";
import ResetPasswordEmail from "@better-t-ins/mail/emails/reset-password-email";
import VerifyEmail from "@better-t-ins/mail/emails/verify-email";
import render from "@better-t-ins/mail/render";
import { type BetterAuthOptions, betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { haveIBeenPwned, magicLink, twoFactor } from "better-auth/plugins";

export const auth = betterAuth<BetterAuthOptions>({
  database: drizzleAdapter(db, {
    provider: "mysql",
    schema,
  }),
  appName: "VerdeINS",
  plugins: [
    twoFactor({
      otpOptions: {
        // period: 3, // default 3 minutes
        sendOTP: async ({ user, otp }) => {
          const { html, text } = await render(
            <OTPEmail expiryTimeInMinutes={3} verificationCode={otp} />
          );
          await sendEmail({
            to: user.email,
            subject: "Your OTP code",
            html,
            text,
          });
        },
      },
    }),
    magicLink({
      // expiresIn: 300, // default 5 minutes
      sendMagicLink: async ({ email, url }) => {
        const { html, text } = await render(<MagicLinkEmail url={url} />);
        await sendEmail({
          to: email,
          subject: "Login with a magic link",
          html,
          text,
        });
      },
    }),
    haveIBeenPwned({
      customPasswordCompromisedMessage:
        "This password has been compromised. Please choose a different password or request a password reset.",
    }),
  ],
  trustedOrigins: [process.env.CORS_ORIGIN || ""],

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // this autosends the verification email with the url set to /
    autoSignIn: true,
    revokeSessionsOnPasswordReset: true,

    sendResetPassword: async ({ user, url }) => {
      const { html, text } = await render(
        <ResetPasswordEmail name={user.name} url={url} />
      );
      await sendEmail({
        to: user.email,
        subject: "Reset your password",
        html,
        text,
      });
    },
    // resetPasswordTokenExpiresIn: 3600, // default 1 hour
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      const { html, text } = await render(
        <VerifyEmail name={user.name} url={url} />
      );
      await sendEmail({
        to: user.email,
        subject: "Verify your email address",
        html,
        text,
      });
    },
    sendOnSignUp: false,
    autoSignInAfterVerification: true,
    expiresIn: 3600, // default 1h
  },
  user: {
    deleteUser: {
      enabled: true,
      // deleteTokenExpiresIn: 60 * 60 * 24 * 1000 // default 24h
      sendDeleteAccountVerification: async ({ user, url }) => {
        const { html, text } = await render(
          <DeleteAccountEmail name={user.name} url={url} />
        );
        await sendEmail({
          to: user.email,
          subject: "Confirm account deletion",
          html,
          text,
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
