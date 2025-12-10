import { and, db, eq, isNull } from "@better-t-ins/db";
import { folder } from "@better-t-ins/db/schema/upload";
import { z } from "zod";
import { protectedProcedure, router } from "../index";
import { deleteFile } from "../lib/files/delete-file";
import { getAllByFolderId } from "../lib/files/get-all-by-folder-id";
import buildPaths from "../lib/folders/build-paths";
import { deleteFolder } from "../lib/folders/delete-folder";
import buildTree from "../lib/folders/folder-tree";
import { getAncestors } from "../lib/folders/get-ancestors";
import { getDescendants } from "../lib/folders/get-descendants";
import { getFolderTreeFlat } from "../lib/folders/get-folder-tree-flat";
import { insertFolder } from "../lib/folders/insert-folder";
import renameFolder from "../lib/folders/rename-folder";

const MAX_FOLDER_NAME_LENGTH = 255;
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

  deleteFolder: protectedProcedure
    .input(z.object({ id: z.coerce.number() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const id = input.id;

      if (!id) {
        return;
      }

      const descendants = await getDescendants(db, id);

      const files = await Promise.all(
        descendants
          .flatMap((descendant) => descendant.id)
          .map((descendantId) => getAllByFolderId(descendantId, userId))
      );

      await Promise.all(
        files
          .flatMap((fileArray) => fileArray.map((file) => file.id))
          .map((fileId) => deleteFile(fileId))
      );

      await deleteFolder(db, id);
    }),

  deleteFolders: protectedProcedure
    .input(z.object({ folder_ids: z.array(z.coerce.number()) }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const folderIds = input.folder_ids;

      if (!folderIds) {
        return;
      }

      const descendants = await Promise.all(
        folderIds.map((folderId) => getDescendants(db, folderId))
      );

      const files = await Promise.all(
        descendants
          .flatMap((descendant) => descendant.map((d) => d.id))
          .flatMap((id) => getAllByFolderId(id, userId))
      );

      await Promise.all(
        files
          .flatMap((fileArray) => fileArray.map((file) => file.id))
          .map((id) => deleteFile(id))
      );

      await Promise.all(folderIds.map((id) => deleteFolder(db, id)));
    }),

  renameFolder: protectedProcedure
    .input(
      z.object({
        id: z.coerce.number(),
        name: z.string().min(1).max(MAX_FOLDER_NAME_LENGTH),
        parent_id: z.string().nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const id = input.id;
      const name = input.name;
      const parentId = input.parent_id;

      const exists = await folderAlreadyExists(
        name,
        parentId ? Number.parseInt(parentId, 10) : null,
        userId
      );

      if (exists) {
        throw new Error("Folder name already exists");
      }

      await renameFolder(db, id, name);
    }),

  downloadFolder: protectedProcedure
    .input(z.object({ id: z.coerce.number() }))
    .mutation(async ({ input }) => {
      const id = input.id;

      if (!id) {
        return;
      }

      const { folders, files } = await getFolderTreeFlat(db, id);
      const tree = buildTree(folders, files);
      const paths = buildPaths(folders);

      const result: { name: string }[] = [];
      for (const file of files) {
        const folderPath = file.folderId
          ? (paths.get(file.folderId) ?? "")
          : "";
        result.push({ name: `${folderPath}/${file.fileName}` });
      }

      return { id, tree, paths: Object.fromEntries(paths), folders, result };

      /**
        async function writeTree(dirHandle, node) {
          // create current folder
          const currentDir =
            node.depth === 0 ? dirHandle : await dirHandle.getDirectoryHandle(node.name, { create: true });

          // write files in this folder
          for (const file of node.files ?? []) {
            const fileHandle = await currentDir.getFileHandle(file.fileName, { create: true });
            const writable = await fileHandle.createWritable();
            // write your actual file data here
            await writable.write("placeholder");
            await writable.close();
          }

          // recurse children
          for (const child of node.children ?? []) {
            await writeTree(currentDir, child);
          }
        }

        const root = await window.showDirectoryPicker();
        await writeTree(root, treeRootObject);
      */
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
