import { db } from "@better-t-ins/db";
import { user } from "@better-t-ins/db/schema/auth";
import { history } from "@better-t-ins/db/schema/upload";
import { desc, eq } from "drizzle-orm";

export async function getHistory(fileId: number) {
  return await db
    .select({
      id: history.id,
      size: history.size,
      author_id: history.author_id,
      author_name: user.name,
      createdAt: history.createdAt,
    })
    .from(history)
    .innerJoin(user, eq(history.author_id, user.id))
    .where(eq(history.file_id, fileId))
    .orderBy(desc(history.createdAt));
}
