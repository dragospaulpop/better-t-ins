import type { MySql2Database } from "@better-t-ins/db";
import { allowedHost } from "@better-t-ins/db/schema/settings";

export async function insertHost(
  db: MySql2Database,
  host: string,
  description: string,
  addedBy: string
) {
  return await db
    .insert(allowedHost)
    .values({ host, description, addedBy, enabled: true })
    .$returningId();
}
