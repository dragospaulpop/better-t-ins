import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { drizzle } from "drizzle-orm/mysql2";
import { z } from "zod";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({
  path: resolve(__dirname, "../../../apps/server/.env"),
});

const envSchema = z.object({
  DATABASE_URL: z.string(),
});

const env = envSchema.safeParse(process.env);

if (!env.success) {
  throw new Error("Invalid environment variables", {
    cause: env.error,
  });
}

export const db = drizzle({
  connection: {
    uri: env.data.DATABASE_URL,
  },
});

// biome-ignore lint/performance/noBarrelFile: O.M.F.G.!!!
export * from "drizzle-orm";

export type { MySql2Database } from "drizzle-orm/mysql2";
