import { storage } from "..";

export async function deleteS3File(s3Key: string) {
  return await storage.client.removeObject(storage.bucketName, s3Key);
}
