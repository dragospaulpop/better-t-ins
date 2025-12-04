import { db, eq, isNull } from "@better-t-ins/db";
import { file } from "@better-t-ins/db/schema/upload";

export async function getFilesByFolderId(folderId: number | null) {
  return await db
    .select()
    .from(file)
    .where(createFileFolderCondition(folderId));
}

function createFileFolderCondition(folderId: number | null) {
  if (folderId === null) {
    return isNull(file.folder_id);
  }
  return eq(file.folder_id, folderId);
}
