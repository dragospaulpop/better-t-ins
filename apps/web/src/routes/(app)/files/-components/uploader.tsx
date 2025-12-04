import { UploadDropzone } from "@/components/upload-dropzone";
import { useUpload } from "@/providers/upload-provider";

interface UploaderProps {
  targetFolderId?: string | null;
}

export function Uploader({ targetFolderId }: UploaderProps) {
  const { control, uploadToFolder, isUploadingTo, hasQueuedUploads } =
    useUpload();

  const folderId = targetFolderId ?? null;

  return (
    <UploadDropzone
      control={control}
      description={{
        maxFiles: 100,
        maxFileSize: "50GB",
      }}
      isQueued={hasQueuedUploads(folderId)}
      isUploading={isUploadingTo(folderId)}
      uploadOverride={(files) => {
        uploadToFolder(files, folderId);
      }}
    />
  );
}
