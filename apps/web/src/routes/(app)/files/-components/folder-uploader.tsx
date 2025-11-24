import { useUploadFiles } from "@better-upload/client";
import { FolderDropzone } from "@/components/folder-dropzone";
import type { Item } from "./folders";

interface FolderUploaderProps {
  item: Item;
  gridItemSize: string;
  gridItemLabel: string;
}

export function FolderUploader({
  item,
  gridItemSize,
  gridItemLabel,
}: FolderUploaderProps) {
  const { control } = useUploadFiles({
    route: "files",
    api: `${import.meta.env.VITE_SERVER_URL}/upload`,
    credentials: "include",
  });

  return (
    <FolderDropzone
      control={control}
      gridItemLabel={gridItemLabel}
      gridItemSize={gridItemSize}
      item={item}
    />
  );
}
