import type { MySql2Database } from "@tud-box/db";
import { eq } from "@tud-box/db";
import { folder, folderClosure } from "@tud-box/db/schema/upload";

export async function getDescendants(db: MySql2Database, id: number) {
  return await db
    .select({
      id: folder.id,
      name: folder.name,
      depth: folderClosure.depth,
    })
    .from(folderClosure)
    .innerJoin(folder, eq(folderClosure.descendant, folder.id))
    .where(eq(folderClosure.ancestor, id))
    .orderBy(folderClosure.depth);
}
