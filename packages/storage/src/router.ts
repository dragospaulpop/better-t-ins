// when using a separate backend server, make sure to update the `api` option on the client hooks.

import { auth } from "@better-t-ins/auth";
import { RejectUpload, type Router, route } from "@better-upload/server";
import { minio } from "@better-upload/server/clients";
import z from "zod";
import { storage } from ".";
import { insertFiles } from "./lib/insert-files";

const configSchema = z.object({
  region: z.string(),
  endpoint: z.string(),
  port: z.coerce.number(),
  useSSL: z.preprocess(
    (val) =>
      typeof val === "string" ? val.toLowerCase() === "true" : Boolean(val),
    z.boolean()
  ),
  accessKeyId: z.string(),
  secretAccessKey: z.string(),
  bucketName: z.string(),
});

const config = configSchema.safeParse({
  region: process.env.MINIO_CLIENT_REGION,
  endpoint: process.env.MINIO_CLIENT_ENDPOINT,
  port: process.env.MINIO_CLIENT_PORT,
  useSSL: process.env.MINIO_CLIENT_USE_SSL,
  accessKeyId: process.env.MINIO_CLIENT_ACCESS_KEY,
  secretAccessKey: process.env.MINIO_CLIENT_SECRET_KEY,
  bucketName: process.env.MINIO_CLIENT_BUCKET_NAME,
});

if (!config.success) {
  throw new Error(`Invalid config: ${config.error}`);
}

const MAX_FILES = 100;
const B_IN_KB = 1024;
const KB_IN_MB = 1024;
const MB_IN_GB = 1024;
const MAX_GB = 50;
const MAX_FILE_SIZE = B_IN_KB * KB_IN_MB * MB_IN_GB * MAX_GB;

// Schema for validating client metadata
const clientMetadataSchema = z.object({
  folderId: z.string().nullable().optional(),
});

export const router: Router = {
  client: minio({
    region: config.data.region,
    endpoint: `${config.data.useSSL ? "https" : "http"}://${config.data.endpoint}:${config.data.port}`,
    accessKeyId: config.data.accessKeyId,
    secretAccessKey: config.data.secretAccessKey,
  }),
  bucketName: config.data.bucketName,
  routes: {
    files: route({
      clientMetadataSchema,
      onBeforeUpload: async ({ req, clientMetadata }) => {
        const session = await auth.api.getSession({ headers: req.headers });
        if (!session) {
          throw new RejectUpload("Unauthorized");
        }
        await storage.ensureBucket();

        const userId = session.user.id;
        const folderId = clientMetadata?.folderId
          ? Number.parseInt(clientMetadata.folderId, 10)
          : null;

        return {
          generateObjectInfo: ({ file: uploadFile }) => {
            const uniqueId = crypto.randomUUID();
            const key = `${userId}/${uniqueId}-${uploadFile.name}`;
            return {
              key,
              metadata: {
                "x-amz-meta-user-id": userId,
                "x-amz-meta-original-name": uploadFile.name,
              },
            };
          },
          metadata: {
            userId,
            folderId,
          },
        };
      },
      onAfterSignedUrl: async ({ files, metadata }) => {
        // Insert file records into the database
        const userId = metadata?.userId as string;
        const folderId = metadata?.folderId as number | null;

        const fileRecords = files.map((uploadFile) => ({
          name: uploadFile.name,
          type: uploadFile.type || "application/octet-stream",
          size: uploadFile.size,
          s3_key: uploadFile.objectInfo.key,
          folder_id: folderId,
          owner_id: userId,
        }));

        if (fileRecords.length > 0) {
          await insertFiles(fileRecords);
        }

        return {
          metadata: {
            filesCreated: fileRecords.length,
          },
        };
      },
      multipleFiles: true,
      multipart: true,
      maxFiles: MAX_FILES,
      maxFileSize: MAX_FILE_SIZE,
    }),
  },
};
