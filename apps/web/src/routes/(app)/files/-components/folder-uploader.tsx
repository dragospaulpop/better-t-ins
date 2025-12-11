import { useStore } from "@tanstack/react-store";
import { FolderDropzone } from "@/components/folder-dropzone";
import { usePacerUpload } from "@/providers/pacer-upload-provider";
import { store } from "@/stores/upload-store";
import type { Item } from "./folders";

interface FolderUploaderProps {
  item: Item;
}

export function FolderUploader({ item }: FolderUploaderProps) {
  const { control, addToUploadQueue } = usePacerUpload();

  const uploadingFolderId = useStore(store, (state) => state.uploadingFolderId);
  const queuedFolderIds = useStore(store, (state) => state.queuedFolderIds);

  return (
    <FolderDropzone
      control={control}
      isQueued={queuedFolderIds.has(item.id)}
      isUploading={uploadingFolderId === item.id}
      item={item}
      uploadOverride={(files) => {
        // Upload files to this specific folder (the folder being dragged onto)
        addToUploadQueue({ files, folderId: item.id });
      }}
    />
  );
}
