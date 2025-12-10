import { db } from "@tud-box/db";
import { file } from "@tud-box/db/schema/upload";
import { and, eq, ne } from "drizzle-orm";
import { createFileFolderCondition } from "./utils";

export default async function fileAlreadyExists(
  name: string,
  folderId: number | null,
  fileId: number
) {
  const exists = await db
    .select()
    .from(file)
    .where(
      and(
        eq(file.name, name),
        createFileFolderCondition(folderId),
        ne(file.id, fileId)
      )
    );
  return exists.length > 0;
}
