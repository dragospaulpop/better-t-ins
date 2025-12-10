import { db } from "@tud-box/db";
import { history } from "@tud-box/db/schema/upload";
import { eq } from "drizzle-orm";
import { deleteHistoryItem } from "./delete-history-item";

export async function deleteFile(fileId: number) {
  const historyItems = await db
    .select()
    .from(history)
    .where(eq(history.file_id, fileId));

  for (const historyItem of historyItems) {
    // the last history item will also delete the file
    await deleteHistoryItem(historyItem.id);
  }
}
