import type { MySql2Database } from "@tud-box/db";
import { desc, eq } from "@tud-box/db";
import { folder, folderClosure } from "@tud-box/db/schema/upload";

export async function getAncestors(db: MySql2Database, id: number) {
  return await db
    .select({
      id: folder.id,
      name: folder.name,
      depth: folderClosure.depth,
    })
    .from(folderClosure)
    .innerJoin(folder, eq(folderClosure.ancestor, folder.id))
    .where(eq(folderClosure.descendant, id))
    .orderBy(desc(folderClosure.depth));
}

export type Ancestors = Awaited<ReturnType<typeof getAncestors>>;
