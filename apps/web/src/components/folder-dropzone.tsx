import type { UploadHookControl } from "@better-upload/client";
import { useNavigate } from "@tanstack/react-router";
import {
  ClockIcon,
  FolderIcon,
  Loader2,
  MoreVerticalIcon,
  UploadIcon,
} from "lucide-react";
import { useId } from "react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";
import type { Item } from "@/routes/(app)/files/-components/folders";
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
    ...args: Parameters<UploadHookControl<true>["upload"]>
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

  const { getRootProps, getInputProps, isDragActive, inputRef } = useDropzone({
    onDrop: (files) => {
      // Allow drops anytime - queue system handles concurrent uploads
      if (files.length > 0) {
        if (uploadOverride) {
          uploadOverride(files, { metadata });
        } else {
          upload(files, { metadata });
        }
      }
      inputRef.current.value = "";
    },
    noClick: true,
  });

  return (
    <a
      className={cn(
        "group relative flex flex-col items-center justify-start gap-2 rounded-lg border border-transparent bg-card p-0 transition-all hover:border-tud-blue/50 hover:bg-tud-blue/25 hover:shadow-md hover:shadow-tud-green/25transition-colors",
        {
          "border-primary/80 border-dashed": isDragActive,
        }
      )}
      href={"/files/{-$parentId}"}
      onClick={(e) => e.preventDefault()}
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
          "flex h-full w-full flex-col items-center justify-start rounded-lg bg-transparent p-2 transition-colors dark:bg-input/10",
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
          <UploadIcon
            className={cn("pointer-events-none shrink-0", gridItemSize)}
            strokeWidth={0.75}
          />
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
        {!isDragActive && (
          <span
            className={cn("line-clamp-2 break-all text-center", gridItemLabel)}
          >
            {item.name}
          </span>
        )}
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
            <DropdownMenuItem>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </a>
  );
}
