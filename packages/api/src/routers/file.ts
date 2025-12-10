import { storage } from "@better-t-ins/storage";
import { z } from "zod";
import { protectedProcedure, router } from "../index";
import { deleteFile } from "../lib/files/delete-file";
import { deleteHistoryItem } from "../lib/files/delete-history-item";
import fileAlreadyExists from "../lib/files/file-already-exists";
import { getAllByFolderId } from "../lib/files/get-all-by-folder-id";
import { getFileHistoryKey } from "../lib/files/get-file-history-key";
import { getHistory } from "../lib/files/get-history";
import { getLatestFileHistoryKey } from "../lib/files/get-latest-file-history-key";
import renameFile from "../lib/files/rename-file";

const MAX_FILE_NAME_LENGTH = 255;

const FIVE_MINUTES = 5;
const SECONDS = 60;
const FIVE_MINUTES_IN_SECONDS = FIVE_MINUTES * SECONDS;

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

  renameFile: protectedProcedure
    .input(
      z.object({
        file_id: z.coerce.number(),
        name: z.string().min(1).max(MAX_FILE_NAME_LENGTH),
        folder_id: z.string().nullable().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const fileId = input.file_id;
      const name = input.name;

      const exists = await fileAlreadyExists(
        name,
        input.folder_id ? Number.parseInt(input.folder_id, 10) : null,
        fileId
      );
      if (exists) {
        throw new Error("File name already exists");
      }

      await renameFile(fileId, name);
    }),

  validateFileName: protectedProcedure
    .input(
      z.object({
        file_id: z.coerce.number(),
        name: z.string().min(1).max(MAX_FILE_NAME_LENGTH),
        folder_id: z.string().nullable().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const name = input.name;
      const fileId = input.file_id;
      const folderId =
        input.folder_id === undefined ||
        input.folder_id === null ||
        Number.isNaN(input.folder_id)
          ? null
          : Number.parseInt(input.folder_id, 10);

      const exists = await fileAlreadyExists(name, folderId, fileId);

      return exists;
    }),

  downloadLatestFileHistory: protectedProcedure
    .input(z.object({ file_id: z.coerce.number() }))
    .mutation(async ({ input }) => {
      const key = await getLatestFileHistoryKey(input.file_id);

      // get presigned url from s3
      const url = await storage.client.presignedGetObject(
        storage.bucketName,
        key,
        FIVE_MINUTES_IN_SECONDS
      );
      return url;
    }),

  downloadSpecificFileHistoryItem: protectedProcedure
    .input(z.object({ history_id: z.coerce.number() }))
    .mutation(async ({ input }) => {
      const key = await getFileHistoryKey(input.history_id);

      // get presigned url from s3
      const url = await storage.client.presignedGetObject(
        storage.bucketName,
        key,
        FIVE_MINUTES_IN_SECONDS
      );
      return url;
    }),
});
