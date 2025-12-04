import { and, db, eq, isNull } from "@better-t-ins/db";
import { folder } from "@better-t-ins/db/schema/upload";
import { z } from "zod";
import { protectedProcedure, router } from "../index";
import { getAncestors } from "../lib/folders/get-ancestors";
import { getFilesByFolderId } from "../lib/folders/get-files-by-folder-id";
import { insertFolder } from "../lib/folders/insert-folder";

const MAX_FOLDER_NAME_LENGTH = 100;
// const SLEEP_MS = 2000;
// const BOO_HOO_PROBABILITY = 0.5;

export const folderRouter = router({
  getAllByParentId: protectedProcedure
    .input(z.object({ parent_id: z.string().nullable().optional() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // await Bun.sleep(SLEEP_MS);

      // if (Math.random() > BOO_HOO_PROBABILITY) {
      //   throw new Error("Boo-hoo");
      // }

      const parentId =
        Number.isNaN(input.parent_id) ||
        input.parent_id === null ||
        input.parent_id === undefined
          ? null
          : Number.parseInt(input.parent_id as string, 10);

      return await db
        .select()
        .from(folder)
        .where(
          and(
            eq(folder.owner_id, userId),
            createFolderParentCondition(parentId)
          )
        )
        .orderBy(folder.name);
    }),

  getFilesByFolderId: protectedProcedure
    .input(z.object({ folder_id: z.string().nullable().optional() }))
    .query(async ({ input }) => {
      const folderId =
        Number.isNaN(input.folder_id) ||
        input.folder_id === null ||
        input.folder_id === undefined
          ? null
          : Number.parseInt(input.folder_id as string, 10);

      return await getFilesByFolderId(folderId);
    }),

  validateFolderName: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(MAX_FOLDER_NAME_LENGTH),
        parent_id: z.string().nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // await Bun.sleep(SLEEP_MS);
      const userId = ctx.session.user.id;
      const name = input.name;
      const parentId =
        input.parent_id === undefined ||
        input.parent_id === null ||
        Number.isNaN(input.parent_id)
          ? null
          : Number.parseInt(input.parent_id, 10);

      const exists = await folderAlreadyExists(name, parentId, userId);

      return exists;
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(MAX_FOLDER_NAME_LENGTH),
        parent_id: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const name = input.name;
      const parentId =
        input.parent_id === undefined
          ? null
          : Number.parseInt(input.parent_id, 10);

      const exists = await folderAlreadyExists(name, parentId, userId);

      if (exists) {
        throw new Error("Folder already exists");
      }

      return await insertFolder(db, name, parentId, userId);
    }),

  folderExists: protectedProcedure
    .input(
      z.object({
        id: z.coerce.number().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const id = input.id === undefined ? null : input.id;

      if (id === null) {
        return true;
      }

      const exists = await db
        .select()
        .from(folder)
        .where(and(eq(folder.id, id), eq(folder.owner_id, userId)));

      return exists.length > 0;
    }),

  getAncestors: protectedProcedure
    .input(z.object({ id: z.string().nullable().optional() }))
    .query(async ({ input }) => {
      const id = input.id;

      if (!id) {
        return [];
      }

      return await getAncestors(db, Number.parseInt(id, 10));
    }),
});

function createFolderParentCondition(parentId: number | null) {
  if (parentId === null) {
    return isNull(folder.parent_id);
  }
  return eq(folder.parent_id, parentId);
}

async function folderAlreadyExists(
  name: string,
  parentId: number | null,
  userId: string
): Promise<boolean> {
  const parentCondition = createFolderParentCondition(parentId);

  const result = await db
    .select()
    .from(folder)
    .where(
      and(eq(folder.name, name), eq(folder.owner_id, userId), parentCondition)
    )
    .limit(1);

  return result.length > 0;
}
