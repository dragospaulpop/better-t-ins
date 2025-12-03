import type { MySql2Database } from "@better-t-ins/db";
import { allowedHost } from "@better-t-ins/db/schema/settings";
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
