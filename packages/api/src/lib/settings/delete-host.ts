import type { MySql2Database } from "@tud-box/db";
import { allowedHost } from "@tud-box/db/schema/settings";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";

export async function deleteHost(db: MySql2Database, host: string) {
  if (host === "tudconsult.ro") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Tudconsult host cannot be deleted",
    });
  }
  return await db.delete(allowedHost).where(eq(allowedHost.host, host));
}
