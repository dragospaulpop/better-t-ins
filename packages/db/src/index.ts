import { drizzle } from "drizzle-orm/mysql2";

import { z } from "zod";

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
