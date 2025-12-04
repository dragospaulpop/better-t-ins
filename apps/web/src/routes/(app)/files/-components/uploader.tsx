import { UploadDropzone } from "@/components/upload-dropzone";
import { useUpload } from "@/providers/upload-provider";

export function Uploader() {
  const {
    control,
    uploadToFolder,
    isUploadingTo,
    hasQueuedUploads,
    currentFolderId,
  } = useUpload();

  return (
    <UploadDropzone
      control={control}
      description={{
        maxFiles: 100,
        maxFileSize: "50GB",
      }}
      isQueued={hasQueuedUploads(currentFolderId)}
      isUploading={isUploadingTo(currentFolderId)}
      uploadOverride={(files) => {
        // Upload files to the current folder
        uploadToFolder(files);
      }}
    />
  );
}
