import { db } from "@better-t-ins/db";
// biome-ignore lint/performance/noNamespaceImport: this is a schema
import * as schema from "@better-t-ins/db/schema/auth";
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
  },
  advanced: {
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
      httpOnly: true,
    },
  },
});
