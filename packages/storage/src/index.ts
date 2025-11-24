import { Client } from "minio";
import { z } from "zod";
import "dotenv/config";
// biome-ignore lint/performance/noNamespaceImport: fuck off, biome
import * as https from "node:https";

const storageConfigSchema = z.object({
  region: z.string(),
  endPoint: z.string(),
  port: z.coerce.number(),
  useSSL: z
    .string()
    .transform((v) => v === "true")
    .or(z.boolean()),
  accessKey: z.string(),
  secretKey: z.string(),
  bucketName: z.string(),
});

export type StorageConfig = z.infer<typeof storageConfigSchema>;

export const createStorageClient = (config?: Partial<StorageConfig>) => {
  const parsedConfig = storageConfigSchema.safeParse({
    region: process.env.MINIO_CLIENT_REGION,
    endPoint: process.env.MINIO_CLIENT_ENDPOINT,
    port: process.env.MINIO_CLIENT_PORT,
    useSSL: process.env.MINIO_CLIENT_USE_SSL,
    accessKey: process.env.MINIO_CLIENT_ACCESS_KEY,
    secretKey: process.env.MINIO_CLIENT_SECRET_KEY,
    bucketName: process.env.MINIO_CLIENT_BUCKET_NAME,
    ...config,
  });

  if (!parsedConfig.success) {
    throw new Error("Invalid config");
  }

  const clientConfig: Record<string, unknown> = {
    region: parsedConfig.data.region,
    endPoint: parsedConfig.data.endPoint,
    port: parsedConfig.data.port,
    useSSL: parsedConfig.data.useSSL,
    accessKey: parsedConfig.data.accessKey,
    secretKey: parsedConfig.data.secretKey,
  };

  // For development with self-signed certificates, disable SSL verification
  if (process.env.NODE_ENV !== "production" && parsedConfig.data.useSSL) {
    clientConfig.transportAgent = new https.Agent({
      rejectUnauthorized: false,
    });
  }

  // biome-ignore lint/suspicious/noExplicitAny: minio types don't include transportAgent option
  const client = new Client(clientConfig as any);

  return {
    client,
    bucketName: parsedConfig.data.bucketName,
    ensureBucket: async () => {
      const exists = await client.bucketExists(parsedConfig.data.bucketName);
      if (!exists) {
        await client.makeBucket(parsedConfig.data.bucketName, "us-east-1");
      }
    },
  };
};

export const storage = createStorageClient();
