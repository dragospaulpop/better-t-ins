import { db, eq } from "@better-t-ins/db";
import { history } from "@better-t-ins/db/schema/upload";

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
