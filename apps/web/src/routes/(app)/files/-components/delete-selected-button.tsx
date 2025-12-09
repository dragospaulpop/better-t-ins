import { useMutation } from "@tanstack/react-query";
import { TrashIcon } from "lucide-react";
import { toast } from "sonner";
import { ActionButton } from "@/components/ui/action-button";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { trpc } from "@/lib/trpc";
import { useRefetchFolder } from "@/providers/refetch-folder-provider";
import { useSelectedItems } from "@/providers/selected-items-provider";

export default function DeleteSelectedButton() {
  const {
    selectedFiles,
    selectedFolders,
    clearSelectedFiles,
    clearSelectedFolders,
  } = useSelectedItems();
  const { refetchFiles, refetchFolders } = useRefetchFolder();
  const { mutateAsync: deleteSelectedFiles, isPending: isDeletingFiles } =
    useMutation(
      trpc.file.deleteFiles.mutationOptions({
        onSuccess: () => {
          toast.success("Files deleted successfully");
          refetchFiles();
          clearSelectedFiles();
        },
        onError: (error) => {
          toast.error("Failed to delete files", {
            description: error.message,
          });
        },
      })
    );

  const { mutateAsync: deleteSelectedFolders, isPending: isDeletingFolders } =
    useMutation(
      trpc.folder.deleteFolders.mutationOptions({
        onSuccess: () => {
          toast.success("Folders deleted successfully");
          refetchFiles();
          refetchFolders();
          clearSelectedFolders();
        },
        onError: (error) => {
          toast.error("Failed to delete folders", {
            description: error.message,
          });
        },
      })
    );

  return (
    <ActionButton
      action={async () => {
        await deleteSelectedFiles({ file_ids: selectedFiles });
        await deleteSelectedFolders({ folder_ids: selectedFolders });
        return {
          error: false,
        };
      }}
      disabled={selectedFiles.length === 0 && selectedFolders.length === 0}
      requireAreYouSure
      size="sm"
      variant="outline"
    >
      <LoadingSwap isLoading={isDeletingFiles || isDeletingFolders}>
        <TrashIcon className="size-4 text-destructive" />
      </LoadingSwap>
    </ActionButton>
  );
}
