import { FolderDropzone } from "@/components/folder-dropzone";
import { usePacerUpload } from "@/providers/pacer-upload-provider";
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
  const { control, addToUploadQueue } = usePacerUpload();

  return (
    <FolderDropzone
      control={control}
      gridItemLabel={gridItemLabel}
      gridItemSize={gridItemSize}
      // isQueued={hasQueuedUploads(item.id)}
      // isUploading={isUploadingTo(item.id)}
      item={item}
      uploadOverride={(files) => {
        // Upload files to this specific folder (the folder being dragged onto)
        addToUploadQueue({ files, folderId: item.id });
      }}
    />
  );
}
