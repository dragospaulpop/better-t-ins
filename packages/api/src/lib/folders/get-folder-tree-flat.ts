// packages/api/src/lib/folders/get-folder-tree-flat.ts
import type { MySql2Database } from "@tud-box/db";
import { and, eq, isNull, sql } from "@tud-box/db";
import {
  file,
  folder,
  folderClosure,
  history,
} from "@tud-box/db/schema/upload";

export async function getFolderTreeFlat(
  db: MySql2Database,
  folderId: number,
  userId: string
) {
  // Get folders with depth
  const folders = await db
    .select({
      folderId: folder.id,
      folderName: folder.name,
      parentId: folder.parent_id,
      depth: folderClosure.depth,
    })
    .from(folderClosure)
    .innerJoin(folder, eq(folderClosure.descendant, folder.id))
    .where(eq(folderClosure.ancestor, folderId))
    .orderBy(folderClosure.depth, folder.name);

  // Get all files for those folders with latest history
  const folderIds = folders.map((f) => f.folderId);

  if (folderIds.length === 0) {
    return { folders: [], files: [] };
  }

  const files = await db
    .select({
      fileId: file.id,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      folderId: file.folder_id,
      s3Key: sql<string>`(
        SELECT ${history.s3_key} FROM ${history}
        WHERE ${history.file_id} = ${sql.raw("`file`.`id`")}
        ORDER BY ${history.createdAt} DESC
        LIMIT 1
      )`.as("s3_key"),
    })
    .from(file)
    .where(
      and(
        sql`${file.folder_id} IN (${sql.join(folderIds, sql`, `)})`,
        eq(file.owner_id, userId)
      )
    );

  return { folders, files };
}

export async function getFilesInRootFolder(db: MySql2Database, userId: string) {
  const files = await db
    .select({
      fileId: file.id,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      folderId: file.folder_id,
      s3Key: sql<string>`(
        SELECT ${history.s3_key} FROM ${history}
        WHERE ${history.file_id} = ${sql.raw("`file`.`id`")}
        ORDER BY ${history.createdAt} DESC
        LIMIT 1
      )`.as("s3_key"),
    })
    .from(file)
    .where(and(eq(file.owner_id, userId), isNull(file.folder_id)));

  return files;
}
