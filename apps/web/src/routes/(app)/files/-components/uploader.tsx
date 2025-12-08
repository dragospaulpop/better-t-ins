import { UploadDropzone } from "@/components/upload-dropzone";
import { usePacerUpload } from "@/providers/pacer-upload-provider";

interface UploaderProps {
  targetFolderId?: string | null;
}

export function Uploader({ targetFolderId }: UploaderProps) {
  const { control, addToUploadQueue } = usePacerUpload();

  const folderId = targetFolderId ?? null;

  return (
    <UploadDropzone
      control={control}
      description={{
        maxFiles: 100,
        maxFileSize: "50GB",
      }}
      folderId={folderId}
      // isQueued={hasQueuedUploads(folderId)}
      // isUploading={isUploadingTo(folderId)}
      uploadOverride={(files) => {
        addToUploadQueue({ files, folderId });
      }}
    />
  );
}
