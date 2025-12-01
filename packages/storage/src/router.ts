// when using a separate backend server, make sure to update the `api` option on the client hooks.

import { auth } from "@better-t-ins/auth";
import { RejectUpload, type Router, route } from "@better-upload/server";
import { minio } from "@better-upload/server/clients";
import z from "zod";
import { storage } from ".";

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
      onBeforeUpload: async ({ req }) => {
        const session = await auth.api.getSession({ headers: req.headers });
        if (!session) {
          throw new RejectUpload("Unauthorized");
        }
        await storage.ensureBucket();
      },
      multipleFiles: true,
      multipart: true,
      maxFiles: MAX_FILES,
      maxFileSize: MAX_FILE_SIZE,
    }),
  },
};
