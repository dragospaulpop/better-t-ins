import type { File, Folder } from "@better-t-ins/db/schema/upload";
import { useSelectedItems } from "@/providers/selected-items-provider";
import Folders from "./folders";

interface FolderContentsProps {
  displayMode: "grid" | "list";
  files: File[];
  folders: Folder[];
  foldersFirst: boolean;
  itemSize: "xs" | "sm" | "md" | "lg";
  sortDirection: "asc" | "desc";
  sortField: "name" | "type" | "size" | "date";
}

export default function FolderContents({
  displayMode,
  files,
  folders,
  foldersFirst,
  itemSize,
  sortDirection,
  sortField,
}: FolderContentsProps) {
  const { clearSelectedItems } = useSelectedItems();
  return (
    // biome-ignore lint/a11y/useSemanticElements: gimme a break
    <div
      className="min-h-0 w-full flex-[0_1_auto] overflow-y-auto p-6"
      id="folder-contents"
      onClick={() => {
        clearSelectedItems();
      }}
      onKeyUp={(e) => {
        if (e.key === "Escape") {
          clearSelectedItems();
        }
      }}
      role="button"
      tabIndex={0}
    >
      <Folders
        displayMode={displayMode}
        files={files}
        folders={folders}
        foldersFirst={foldersFirst}
        itemSize={itemSize}
        sortDirection={sortDirection}
        sortField={sortField}
      />
    </div>
  );
}
