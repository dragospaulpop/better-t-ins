import type { MySql2Database } from "@tud-box/db";
import { eq, sql } from "@tud-box/db";
import { folder } from "@tud-box/db/schema/upload";

export async function moveFolder(
  db: MySql2Database,
  folderId: number,
  newParentId: number
) {
  await db.transaction(async (tx) => {
    // 1. Delete old relationships (except self)
    await tx.execute(
      sql`
        DELETE FROM folder_closure
        WHERE descendant IN (
          SELECT descendant FROM (SELECT descendant FROM folder_closure WHERE ancestor = ${folderId}) AS sub
        )
        AND ancestor IN (
          SELECT ancestor FROM (SELECT ancestor FROM folder_closure WHERE descendant = ${folderId} AND ancestor != ${folderId}) AS sup
        );
      `
    );

    // 2. Insert new paths from new parent
    await tx.execute(
      sql`
        INSERT INTO folder_closure (ancestor, descendant, depth)
        SELECT super.ancestor, sub.descendant, super.depth + sub.depth + 1
        FROM folder_closure AS super
        JOIN folder_closure AS sub
        ON super.descendant = ${newParentId}
        WHERE sub.ancestor = ${folderId};
      `
    );

    // 3. Update parentId on the main table
    await tx
      .update(folder)
      .set({ parent_id: newParentId })
      .where(eq(folder.id, folderId));
  });
}
