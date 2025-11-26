import type { MySql2Database } from "@better-t-ins/db";
import { sql } from "@better-t-ins/db";

export async function deleteFolder(db: MySql2Database, folderId: number) {
  await db.transaction(async (tx) => {
    // Delete closure links (ancestors and descendants)
    await tx.execute(
      sql`
        DELETE FROM folder_closure
        WHERE descendant IN (
          SELECT descendant FROM (SELECT descendant FROM folder_closure WHERE ancestor = ${folderId}) AS d
        )
        OR ancestor IN (
          SELECT descendant FROM (SELECT descendant FROM folder_closure WHERE ancestor = ${folderId}) AS d2
        );
      `
    );

    // Delete the actual folders
    await tx.execute(
      sql`
        DELETE FROM folder
        WHERE id IN (
          SELECT descendant FROM (SELECT descendant FROM folder_closure WHERE ancestor = ${folderId}) AS f
        );
      `
    );
  });
}
