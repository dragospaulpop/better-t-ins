import { db, eq } from "@tud-box/db";
import { history } from "@tud-box/db/schema/upload";

export async function getFileHistoryKey(historyId: number) {
  const [historyItem] = await db
    .select()
    .from(history)
    .where(eq(history.id, historyId))
    .limit(1);
  if (!historyItem) {
    throw new Error("History item not found");
  }
  return historyItem.s3_key;
}
