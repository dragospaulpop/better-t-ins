import { db } from "@tud-box/db";
import { file } from "@tud-box/db/schema/upload";
import { eq } from "drizzle-orm";

export default async function renameFile(fileId: number, name: string) {
  await db.update(file).set({ name }).where(eq(file.id, fileId));
}
