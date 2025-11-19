import { useUploadFiles } from "@better-upload/client";
import { UploadDropzone } from "@/components/upload-dropzone";

export function Uploader() {
  const { control } = useUploadFiles({
    route: "files",
    api: `${import.meta.env.VITE_SERVER_URL}/upload`,
    credentials: "include",
  });

  return (
    <UploadDropzone
      control={control}
      description={{
        maxFiles: 100,
        maxFileSize: "50GB",
      }}
    />
  );
}
