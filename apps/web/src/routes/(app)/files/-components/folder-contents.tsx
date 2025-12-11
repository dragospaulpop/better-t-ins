import { useSelectedItems } from "@/providers/selected-items-provider";
import Folders from "./folders";

interface FolderContentsProps {
  currentFolderId: string | null | undefined;
}

export default function FolderContents({
  currentFolderId,
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
      <Folders currentFolderId={currentFolderId} />
    </div>
  );
}
