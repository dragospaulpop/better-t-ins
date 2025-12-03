import type { MySql2Database } from "@better-t-ins/db";
import { allowedHost } from "@better-t-ins/db/schema/settings";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";

export async function updateHost(
  db: MySql2Database,
  host: string,
  description: string,
  enabled: boolean
) {
  if (host === "tudconsult.ro" && enabled === false) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Tudconsult host cannot be disabled",
    });
  }
  return await db
    .update(allowedHost)
    .set({ enabled, description })
    .where(eq(allowedHost.host, host));
}
