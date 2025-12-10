import { folder } from "@tud-box/db/schema/upload";
import { eq } from "drizzle-orm";
import type { MySql2Database } from "drizzle-orm/mysql2";

export default async function renameFolder(
  db: MySql2Database,
  id: number,
  name: string
) {
  await db.update(folder).set({ name }).where(eq(folder.id, id));
}
