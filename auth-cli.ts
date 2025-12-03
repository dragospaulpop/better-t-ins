// Standalone config for better-auth CLI only
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { passkey } from "@better-auth/passkey";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import {
  admin,
  captcha,
  haveIBeenPwned,
  magicLink,
  twoFactor,
} from "better-auth/plugins";
import dotenv from "dotenv";
import { drizzle } from "drizzle-orm/mysql2";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, "apps/server/.env") });

const db = drizzle({ connection: { uri: process.env.DATABASE_URL || "" } });

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "mysql" }),
  plugins: [
    twoFactor(),
    magicLink({
      disableSignUp: true,
      sendMagicLink: ({ email, url }) => {
        // biome-ignore lint/suspicious/noConsole: grrr...
        console.log(`Sending magic link to ${email} with url ${url}`);
      },
    }),
    haveIBeenPwned(),
    passkey(),
    captcha({
      provider: "google-recaptcha",
      secretKey: process.env.RECAPTCHA_SECRET_KEY || "",
    }),
    admin(),
  ],
  emailAndPassword: { enabled: true },
});
