import { Client } from "minio";
import { z } from "zod";
import "dotenv/config";

const DEFAULT_STORAGE_CONFIG = {
  endPoint: "localhost",
  port: 9000,
  useSSL: false,
  accessKey: "minioadmin",
  secretKey: "minioadmin",
  bucketName: "better-t-ins",
};

const storageConfigSchema = z.object({
  endPoint: z.string().default(DEFAULT_STORAGE_CONFIG.endPoint),
  port: z.coerce.number().default(DEFAULT_STORAGE_CONFIG.port),
  useSSL: z.coerce.boolean().default(DEFAULT_STORAGE_CONFIG.useSSL),
  accessKey: z.string().default(DEFAULT_STORAGE_CONFIG.accessKey),
  secretKey: z.string().default(DEFAULT_STORAGE_CONFIG.secretKey),
  bucketName: z.string().default(DEFAULT_STORAGE_CONFIG.bucketName),
});

export type StorageConfig = z.infer<typeof storageConfigSchema>;

export const createStorageClient = (config?: Partial<StorageConfig>) => {
  const parsedConfig = storageConfigSchema.parse({
    endPoint: process.env.MINIO_ENDPOINT,
    port: process.env.MINIO_PORT,
    useSSL: process.env.MINIO_USE_SSL,
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY,
    bucketName: process.env.MINIO_BUCKET_NAME,
    ...config,
  });

  const client = new Client({
    endPoint: parsedConfig.endPoint,
    port: parsedConfig.port,
    useSSL: parsedConfig.useSSL,
    accessKey: parsedConfig.accessKey,
    secretKey: parsedConfig.secretKey,
  });

  return {
    client,
    bucketName: parsedConfig.bucketName,
    ensureBucket: async () => {
      const exists = await client.bucketExists(parsedConfig.bucketName);
      if (!exists) {
        await client.makeBucket(parsedConfig.bucketName, "us-east-1");
      }
    },
  };
};

export const storage = createStorageClient();
