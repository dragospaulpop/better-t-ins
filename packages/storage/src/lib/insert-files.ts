import { db } from "@tud-box/db";
import type { FileInsert } from "@tud-box/db/schema/upload";
import { file, history } from "@tud-box/db/schema/upload";
import { and, eq, isNull } from "drizzle-orm";

type ObjWithFileRecordAndS3Key = {
  fileRecord: FileInsert;
  s3_key: string;
};

export async function insertFiles(records: ObjWithFileRecordAndS3Key[]) {
  for (const { s3_key, fileRecord } of records) {
    const [existingFileRecord] = await db
      .select()
      .from(file)
      .where(
        and(
          eq(file.name, fileRecord.name),
          createFolderCondition(fileRecord.folder_id),
          eq(file.owner_id, fileRecord.owner_id as string)
        )
      )
      .limit(1);

    let existingFileId = existingFileRecord ? existingFileRecord.id : undefined;

    if (!existingFileId) {
      const newFileRecordId = await db
        .insert(file)
        .values(fileRecord)
        .$returningId();
      existingFileId = newFileRecordId?.[0]?.id;
    }

    await db.insert(history).values({
      file_id: existingFileId,
      size: fileRecord.size ?? 0,
      author_id: fileRecord.owner_id,
      s3_key,
    });
  }
}

function createFolderCondition(folderId: number | null | undefined) {
  if (folderId === null || folderId === undefined) {
    return isNull(file.folder_id);
  }
  return eq(file.folder_id, folderId);
}
