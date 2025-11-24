import { db } from "@better-t-ins/db";
import { folder } from "@better-t-ins/db/schema/upload";
import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure, router } from "../index";

const MAX_FOLDER_NAME_LENGTH = 100;

export const folderRouter = router({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    return await db.select().from(folder).where(eq(folder.owner_id, userId));
  }),

  create: protectedProcedure
    .input(z.object({ name: z.string().min(1).max(MAX_FOLDER_NAME_LENGTH) }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const name = input.name;

      const exitingFolder = await db
        .select()
        .from(folder)
        .where(
          and(
            eq(folder.name, name),
            eq(folder.owner_id, userId),
            isNull(folder.parent_id)
          )
        )
        .limit(1);

      if (exitingFolder.length > 0) {
        throw new Error("Folder already exists");
      }

      return await db.insert(folder).values({
        name,
        owner_id: userId,
      });
    }),
});
