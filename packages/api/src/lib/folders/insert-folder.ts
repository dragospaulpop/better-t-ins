import type { MySql2Database } from "@tud-box/db";
import { sql } from "@tud-box/db";
import { folder, folderClosure } from "@tud-box/db/schema/upload";

export async function insertFolder(
  db: MySql2Database,
  name: string,
  parentId: number | null,
  ownerId: string
) {
  await db.transaction(async (tx) => {
    const [newFolder] = await tx
      .insert(folder)
      .values({ name, owner_id: ownerId, parent_id: parentId })
      .execute();

    const newId = newFolder.insertId;

    // Self relationship
    await tx
      .insert(folderClosure)
      .values({ ancestor: newId, descendant: newId, depth: 0 });

    if (parentId) {
      // Inherit ancestor–descendant relations from parent
      await tx.execute(
        sql`
          INSERT INTO folder_closure (ancestor, descendant, depth)
          SELECT ancestor, ${newId}, depth + 1
          FROM folder_closure
          WHERE descendant = ${parentId};
        `
      );
    }

    return newId;
  });
}
