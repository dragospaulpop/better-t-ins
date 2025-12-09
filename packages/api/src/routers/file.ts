import { z } from "zod";
import { protectedProcedure, router } from "../index";
import { deleteFile } from "../lib/files/delete-file";
import { deleteHistoryItem } from "../lib/files/delete-history-item";
import { getAllByFolderId } from "../lib/files/get-all-by-folder-id";
import { getHistory } from "../lib/files/get-history";

export const fileRouter = router({
  getAllByFolderId: protectedProcedure
    .input(z.object({ folder_id: z.string().nullable().optional() }))
    .query(async ({ input }) => {
      const folderId =
        Number.isNaN(input.folder_id) ||
        input.folder_id === null ||
        input.folder_id === undefined
          ? null
          : Number.parseInt(input.folder_id as string, 10);

      return await getAllByFolderId(folderId);
    }),

  getHistory: protectedProcedure
    .input(z.object({ file_id: z.coerce.number() }))
    .query(async ({ input }) => await getHistory(input.file_id)),

  deleteHistoryItem: protectedProcedure
    .input(z.object({ history_id: z.coerce.number() }))
    .mutation(async ({ input }) => {
      await deleteHistoryItem(input.history_id);
    }),

  deleteFile: protectedProcedure
    .input(z.object({ file_id: z.coerce.number() }))
    .mutation(async ({ input }) => {
      await deleteFile(input.file_id);
    }),

  deleteFiles: protectedProcedure
    .input(z.object({ file_ids: z.array(z.coerce.number()) }))
    .mutation(async ({ input }) => {
      await Promise.all(
        input.file_ids.map(async (fileId) => {
          await deleteFile(fileId);
        })
      );
    }),
});
