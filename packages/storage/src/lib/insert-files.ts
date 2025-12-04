import { db } from "@better-t-ins/db";
import type { FileInsert } from "@better-t-ins/db/schema/upload";
import { file, history } from "@better-t-ins/db/schema/upload";
import { and, eq, isNull } from "drizzle-orm";

export async function insertFiles(files: FileInsert[]) {
  for (const fileRecord of files) {
    const [existingFileRecord] = await db
      .select()
      .from(file)
      .where(
        and(
          eq(file.name, fileRecord.name),
          createFolderCondition(fileRecord.folder_id)
        )
      )
      .limit(1);

    const existingFileId = existingFileRecord
      ? existingFileRecord.id
      : undefined;

    if (!existingFileId) {
      await db.insert(file).values(fileRecord);
    }

    await db.insert(history).values({
      file_id: existingFileId,
      size: fileRecord.size ?? 0,
      author_id: fileRecord.owner_id,
    });
  }
}

function createFolderCondition(folderId: number | null | undefined) {
  if (folderId === null || folderId === undefined) {
    return isNull(file.folder_id);
  }
  return eq(file.folder_id, folderId);
}
