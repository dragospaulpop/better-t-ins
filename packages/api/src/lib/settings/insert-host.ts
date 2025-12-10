import type { MySql2Database } from "@tud-box/db";
import { allowedHost } from "@tud-box/db/schema/settings";

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
