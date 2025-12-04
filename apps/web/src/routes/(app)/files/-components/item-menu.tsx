import { useMutation } from "@tanstack/react-query";
import {
  DownloadIcon,
  HistoryIcon,
  MoreVerticalIcon,
  PencilIcon,
  TrashIcon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { trpc } from "@/lib/trpc";
import { useRefetchFolder } from "@/providers/refetch-folder-provider";
import type { Item } from "./folders";
import ItemHistory from "./item-history";

export function ItemMenu({ item }: { item: Item }) {
  const { refetchFiles } = useRefetchFolder();
  const [historyOpen, setHistoryOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { mutate: deleteFile } = useMutation(
    trpc.file.deleteFile.mutationOptions({
      onSuccess: () => {
        toast.success("File deleted successfully");
        refetchFiles();
      },
      onError: (error) => {
        toast.error("Failed to delete file", {
          description: error.message,
        });
      },
    })
  );

  return (
    <div className="absolute top-1 right-1 opacity-0 transition-opacity group-hover:opacity-100">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="rounded-full p-1" size="icon-sm" variant="ghost">
            <MoreVerticalIcon className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>

          <DropdownMenuItem
            className="flex gap-2"
            onClick={() => setHistoryOpen(true)}
          >
            <HistoryIcon className="mr-2 size-4" />
            View History
          </DropdownMenuItem>
          <DropdownMenuItem>
            <DownloadIcon className="mr-2 size-4" />
            Download latest
          </DropdownMenuItem>
          <DropdownMenuItem>
            <PencilIcon className="mr-2 size-4" />
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem>
            <PencilIcon className="mr-2 size-4" />
            Move to
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setDeleteOpen(true)}
            variant="destructive"
          >
            <TrashIcon className="mr-2 size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ItemHistory
        item={item}
        onOpenChange={setHistoryOpen}
        open={historyOpen}
      />

      <AlertDialog onOpenChange={setDeleteOpen} open={deleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this file?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteFile({ file_id: item.id })}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
