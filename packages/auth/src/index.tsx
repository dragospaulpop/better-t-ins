import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { passkey } from "@better-auth/passkey";
import { and, db, eq } from "@better-t-ins/db";
// biome-ignore lint/performance/noNamespaceImport: this is a schema
import * as schema from "@better-t-ins/db/schema/auth";
import { allowedHosts } from "@better-t-ins/db/schema/settings";
import { file, folder } from "@better-t-ins/db/schema/upload";
import { sendEmail } from "@better-t-ins/mail";
import DeleteAccountEmail from "@better-t-ins/mail/emails/delete-account-email";
import MagicLinkEmail from "@better-t-ins/mail/emails/magic-link-email";
import OTPEmail from "@better-t-ins/mail/emails/otp-email";
import ResetPasswordEmail from "@better-t-ins/mail/emails/reset-password-email";
import VerifyEmail from "@better-t-ins/mail/emails/verify-email";
import render from "@better-t-ins/mail/render";
import { APIError, type BetterAuthOptions, betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import {
  admin,
  captcha,
  createAuthMiddleware,
  haveIBeenPwned,
  magicLink,
  twoFactor,
} from "better-auth/plugins";
import dotenv from "dotenv";
import z from "zod";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({
  path: resolve(__dirname, "../../../apps/server/.env"),
});

const envSchema = z.object({
  RECAPTCHA_SECRET_KEY: z.string(),
  CORS_ORIGIN: z.string(),
  DOMAIN: z.string(),
  FRONTEND_URL: z.string(),
  APP_NAME: z.string(),
});

const env = envSchema.safeParse(process.env);

if (!env.success) {
  throw new Error("Invalid environment variables", {
    cause: env.error,
  });
}

export const auth = betterAuth<BetterAuthOptions>({
  database: drizzleAdapter(db, {
    provider: "mysql",
    schema,
  }),
  rateLimit: {
    enabled: true,
    max: 10,
    window: 60, // 1 minute
    customRules: {
      "/get-session": false,
      "/sign-in/email": {
        window: 10,
        max: 3,
      },
      "/two-factor/*": () => {
        // custom function to return rate limit window and max
        return {
          window: 10,
          max: 3,
        };
      },
    },
  },
  appName: env.data.APP_NAME,
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
      disableSignUp: true,
    }),
    haveIBeenPwned({
      customPasswordCompromisedMessage:
        "This password has been compromised. Please choose a different password or request a password reset.",
    }),
    passkey({
      rpID: env.data.DOMAIN,
      rpName: env.data.APP_NAME,
      origin: env.data.FRONTEND_URL,
    }),
    captcha({
      provider: "google-recaptcha", // or google-recaptcha, hcaptcha, captchafox
      secretKey: env.data.RECAPTCHA_SECRET_KEY,
      minScore: 0.1,
    }),
    admin(),
  ],
  trustedOrigins: [env.data.CORS_ORIGIN],

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
      beforeDelete: async (user) => {
        await db.transaction(async (tx) => {
          await tx
            .update(folder)
            .set({ owner_id: null })
            .where(eq(folder.owner_id, user.id));
          await tx
            .update(file)
            .set({ owner_id: null })
            .where(eq(file.owner_id, user.id));
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
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== "/sign-up/email") {
        return;
      }

      const [allowedHost] = await db
        .select()
        .from(allowedHosts)
        .where(
          and(
            eq(allowedHosts.host, ctx.body?.email.split("@")[1]),
            eq(allowedHosts.enabled, true)
          )
        )
        .limit(1);

      if (!allowedHost) {
        throw new APIError("BAD_REQUEST", {
          message: "Email must end with an allowed host",
        });
      }
    }),
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          // promote user to admin if they are the first user to sign up
          const [adminUser] = await db
            .select()
            .from(schema.user)
            .where(eq(schema.user.role, "admin"));
          if (!adminUser) {
            await db
              .update(schema.user)
              .set({ role: "admin" })
              .where(eq(schema.user.id, user.id));
          }
        },
      },
    },
  },
});

// Infer the API type with plugins included
export type AuthAPIWithPlugins = ReturnType<
  typeof betterAuth<
    BetterAuthOptions & { plugins: [ReturnType<typeof twoFactor>] }
  >
>["api"];
