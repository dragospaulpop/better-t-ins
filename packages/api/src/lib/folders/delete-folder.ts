import { desc, eq, inArray, type MySql2Database, or } from "@better-t-ins/db";
import { folder, folderClosure } from "@better-t-ins/db/schema/upload";

export async function deleteFolder(db: MySql2Database, folderId: number) {
  await db.transaction(async (tx) => {
    // Collect all descendant folder IDs WITH depth (deepest first)
    const descendants = await tx
      .select({
        descendant: folderClosure.descendant,
        depth: folderClosure.depth,
      })
      .from(folderClosure)
      .where(eq(folderClosure.ancestor, folderId))
      .orderBy(desc(folderClosure.depth)); // Children first!

    const descendantIds = descendants.map((d) => d.descendant);

    // Delete closure links first
    await tx
      .delete(folderClosure)
      .where(
        or(
          inArray(folderClosure.descendant, descendantIds),
          inArray(folderClosure.ancestor, descendantIds)
        )
      );

    // Delete folders one by one, deepest (children) first

    for (const { descendant } of descendants) {
      await tx.delete(folder).where(eq(folder.id, descendant));
    }
  });
}
