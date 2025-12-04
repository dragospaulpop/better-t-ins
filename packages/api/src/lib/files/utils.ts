import { file } from "@better-t-ins/db/schema/upload";
import { eq, isNull } from "drizzle-orm";

export function createFileFolderCondition(folderId: number | null) {
  if (folderId === null) {
    return isNull(file.folder_id);
  }
  return eq(file.folder_id, folderId);
}
