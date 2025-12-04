import { and, db, eq, sql } from "@better-t-ins/db";
import { user } from "@better-t-ins/db/schema/auth";
import { file, history } from "@better-t-ins/db/schema/upload";
import { createFileFolderCondition } from "./utils";

export async function getAllByFolderId(folderId: number | null) {
  return await db
    .select({
      id: file.id,
      name: file.name,
      type: file.type,
      size: file.size,
      folder_id: file.folder_id,
      owner_id: file.owner_id,
      owner_name: user.name,
      createdAt: file.createdAt,
      updatedAt: file.updatedAt,
      history_count: sql<number>`(SELECT COUNT(*) FROM ${history} WHERE ${history.file_id} = ${file.id})`,
    })
    .from(file)
    .innerJoin(user, eq(file.owner_id, user.id))
    .where(
      and(createFileFolderCondition(folderId), eq(file.owner_id, user.id))
    );
}
