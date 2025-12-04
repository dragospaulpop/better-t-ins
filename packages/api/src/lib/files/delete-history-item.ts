import { db } from "@better-t-ins/db";
import { file, history } from "@better-t-ins/db/schema/upload";
import { deleteS3File } from "@better-t-ins/storage/lib/delete-s3-file";
import { eq } from "drizzle-orm";

export async function deleteHistoryItem(historyId: number) {
  return await db.transaction(async (tx) => {
    const [historyItem] = await tx
      .select()
      .from(history)
      .where(eq(history.id, historyId))
      .limit(1);
    if (!historyItem) {
      throw new Error("History item not found");
    }

    await deleteS3File(historyItem.s3_key);
    await tx.delete(history).where(eq(history.id, historyId));

    if (historyItem.file_id) {
      const historyItemsRemaining = await tx
        .select()
        .from(history)
        .where(eq(history.file_id, historyItem.file_id));

      if (historyItemsRemaining.length === 0) {
        await tx.delete(file).where(eq(file.id, historyItem.file_id));
      }
    }
  });
}
