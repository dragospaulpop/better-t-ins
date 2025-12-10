import { and, db, desc, eq } from "@tud-box/db";
import { history } from "@tud-box/db/schema/upload";

export async function getLatestFileHistoryKey(fileId: number) {
  const [file] = await db
    .select()
    .from(history)
    .where(and(eq(history.file_id, fileId)))
    .orderBy(desc(history.createdAt))
    .limit(1);
  if (!file) {
    throw new Error("File not found");
  }
  return file.s3_key;
}
