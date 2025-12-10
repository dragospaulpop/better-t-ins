import { randomBytes } from "node:crypto";
import { and, db, eq, isNull, sql } from "@tud-box/db";
import { folder, folderClosure } from "@tud-box/db/schema/upload";
import { getDescendants } from "./get-descendants";

const RANDOM_BYTES_LENGTH = 3;

export default async function assignFolderTemplateToUsers(
  folderId: number,
  userIds: string[]
) {
  const descendants = await getDescendants(db, folderId);

  const rootFolder = descendants.find((d) => d.depth === 0);

  if (!rootFolder) {
    throw new Error("Folder not found");
  }

  for (const userId of userIds) {
    await db.transaction(async (tx) => {
      const newRootFolder = {
        owner_id: userId,
        name: rootFolder.name,
        parent_id: null,
      };

      const [existingFolder] = await tx
        .select()
        .from(folder)
        .where(
          and(
            eq(folder.name, newRootFolder.name),
            eq(folder.owner_id, userId),
            isNull(folder.parent_id)
          )
        )
        .limit(1);

      if (existingFolder) {
        newRootFolder.name = `${newRootFolder.name} (${randomBytes(RANDOM_BYTES_LENGTH).toString("hex")})`;
      }

      const [insertedRootFolder] = await tx
        .insert(folder)
        .values(newRootFolder)
        .execute();

      const newRootFolderId = insertedRootFolder.insertId;

      // Self relationship
      await tx.insert(folderClosure).values({
        ancestor: newRootFolderId,
        descendant: newRootFolderId,
        depth: 0,
      });

      let parentId = newRootFolderId;

      for (const descendant of descendants.slice(1)) {
        const [insertedFolder] = await tx
          .insert(folder)
          .values({
            name: descendant.name,
            parent_id: parentId,
            owner_id: userId,
          })
          .execute();

        await tx.insert(folderClosure).values({
          ancestor: insertedFolder.insertId,
          descendant: insertedFolder.insertId,
          depth: 0,
        });

        await tx.execute(
          sql`
          INSERT INTO folder_closure (ancestor, descendant, depth)
          SELECT ancestor, ${insertedFolder.insertId}, depth + 1
          FROM folder_closure
          WHERE descendant = ${parentId};
        `
        );

        parentId = insertedFolder.insertId;
      }
    });
  }
}
