import type { UploadHookControl } from "@better-upload/client";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  ClockIcon,
  FolderIcon,
  Loader2,
  MoreVerticalIcon,
  UploadIcon,
} from "lucide-react";
import { useId, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import type { EnhancedFile } from "@/providers/pacer-upload-provider";
import { useRefetchFolder } from "@/providers/refetch-folder-provider";
import { useSelectedItems } from "@/providers/selected-items-provider";
import type { Item } from "@/routes/(app)/files/-components/folders";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

type FolderDropzoneProps = {
  control: UploadHookControl<true>;
  id?: string;
  accept?: string;
  metadata?: Record<string, unknown>;
  uploadOverride?: (
    files: EnhancedFile[],
    options?: Parameters<UploadHookControl<true>["upload"]>[1]
  ) => void;
  item: Item;
  gridItemSize: string;
  gridItemLabel: string;
  isUploading?: boolean;
  isQueued?: boolean;
};

export function FolderDropzone({
  control: { upload },
  id: _id,
  accept,
  metadata,
  uploadOverride,
  item,
  gridItemSize,
  gridItemLabel,
  isUploading = false,
  isQueued = false,
}: FolderDropzoneProps) {
  const id = useId();
  const navigate = useNavigate();
  const { toggleSelectedFolder, selectedFolders, clearSelectedFolders } =
    useSelectedItems();
  const { refetchFiles, refetchFolders } = useRefetchFolder();

  const [deleteOpen, setDeleteOpen] = useState(false);

  const { mutateAsync: deleteFolder } = useMutation(
    trpc.folder.deleteFolder.mutationOptions({
      onSuccess: () => {
        toast.success("Folder deleted successfully");
        clearSelectedFolders();
        refetchFiles();
        refetchFolders();
      },
      onError: (error) => {
        toast.error("Failed to delete folder", {
          description: error.message,
        });
      },
    })
  );

  const { getRootProps, getInputProps, isDragActive, inputRef } = useDropzone({
    onDrop: (files) => {
      // Allow drops anytime - queue system handles concurrent uploads
      if (files.length > 0) {
        if (uploadOverride) {
          uploadOverride(
            files.map((file) => ({
              id: crypto.randomUUID(),
              file,
              folderId: item.id,
            })),
            { metadata }
          );
        } else {
          upload(files, { metadata });
        }
      }
      inputRef.current.value = "";
    },
    noClick: true,
  });

  return (
    <>
      <a
        className={cn(
          "group relative flex flex-col items-center justify-start gap-2 rounded-lg border border-transparent p-0 transition-all hover:bg-tud-blue/25 hover:shadow-md hover:shadow-tud-green/25transition-colors",
          {
            "border-primary/80 border-dashed": isDragActive,
            "border-tud-blue/80 bg-tud-blue/25": selectedFolders.includes(
              item.id
            ),
          }
        )}
        href={"/files/{-$parentId}"}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleSelectedFolder(item.id);
        }}
        onDoubleClick={(e) => {
          e.preventDefault();
          navigate({
            to: "/files/{-$parentId}",
            params: { parentId: String(item.id) },
          });
        }}
      >
        <div
          {...getRootProps()}
          className={cn(
            "flex h-full w-full flex-col items-center justify-start rounded-lg bg-transparent p-2 transition-colors",
            {
              "hover:bg-accent dark:hover:bg-accent/40": true,
              "justify-center": isDragActive,
            }
          )}
        >
          <input
            {...getInputProps()}
            accept={accept}
            id={_id || id}
            multiple
            type="file"
          />
          {isDragActive && (
            <div className="relative my-2 grid items-center justify-center">
              <UploadIcon
                className={cn(
                  "pointer-events-none col-1 row-1 shrink-0",
                  gridItemSize
                )}
                strokeWidth={0.75}
              />
            </div>
          )}

          {!isDragActive && (
            <div className="relative my-2 grid items-center justify-center">
              {isUploading && (
                <Loader2 className="col-1 row-1 size-6 animate-spin self-center justify-self-center" />
              )}

              <FolderIcon
                className={cn(
                  "col-1 row-1 shrink-0 fill-tud-blue/75 dark:fill-tud-blue",
                  gridItemSize,
                  { "opacity-50": isUploading }
                )}
                strokeWidth={0}
              />

              {isQueued && !isUploading && (
                <div className="-top-1 -left-1 absolute rounded-full bg-amber-500 p-0.5">
                  <ClockIcon className="size-3 text-white" />
                </div>
              )}
            </div>
          )}

          <span
            className={cn(
              "line-clamp-none break-all text-center",
              gridItemLabel
            )}
          >
            {item.name}
          </span>
        </div>
        <div className="absolute top-1 right-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="rounded-full p-1 opacity-0 transition-opacity group-hover:opacity-100"
                size="icon-sm"
                variant="ghost"
              >
                <MoreVerticalIcon className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Open</DropdownMenuItem>
              <DropdownMenuItem>Open in new tab</DropdownMenuItem>
              <DropdownMenuItem>Download</DropdownMenuItem>
              <DropdownMenuItem>Rename</DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:bg-destructive/20"
                onSelect={() => setDeleteOpen(true)}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </a>
      <AlertDialog onOpenChange={setDeleteOpen} open={deleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this folder?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteFolder({ id: item.id })}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
