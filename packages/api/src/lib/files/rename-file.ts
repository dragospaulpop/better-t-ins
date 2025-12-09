import { db } from "@better-t-ins/db";
import { file } from "@better-t-ins/db/schema/upload";
import { eq } from "drizzle-orm";

export default async function renameFile(fileId: number, name: string) {
  await db.update(file).set({ name }).where(eq(file.id, fileId));
}
