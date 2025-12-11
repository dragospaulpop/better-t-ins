import type { UploadHookControl } from "@better-upload/client";
import { useNavigate } from "@tanstack/react-router";
import { ClockIcon, FolderIcon, Loader2, UploadIcon } from "lucide-react";
import { useId, useMemo } from "react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";
import {
  sizeClassMap,
  useDisplaySettings,
} from "@/providers/display-settings-provider";
import type { EnhancedFile } from "@/providers/pacer-upload-provider";
import { useSelectedItems } from "@/providers/selected-items-provider";
import FolderItemMenu from "@/routes/(app)/files/-components/folder-item-menu";
import type { Item as FolderItem } from "@/routes/(app)/files/-components/folders";

type FolderDropzoneProps = {
  control: UploadHookControl<true>;
  id?: string;
  accept?: string;
  metadata?: Record<string, unknown>;
  uploadOverride?: (
    files: EnhancedFile[],
    options?: Parameters<UploadHookControl<true>["upload"]>[1]
  ) => void;
  item: FolderItem;
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
  isUploading = false,
  isQueued = false,
}: FolderDropzoneProps) {
  const id = useId();

  const navigate = useNavigate();
  const { toggleSelectedFolder, selectedFolders } = useSelectedItems();

  const { itemSize } = useDisplaySettings();

  const gridItemSize = useMemo(() => sizeClassMap[itemSize], [itemSize]);

  const gridItemLabel = useMemo(() => {
    switch (itemSize) {
      case "xs":
        return "text-xs font-extralight";
      case "sm":
        return "text-sm font-light";
      case "md":
        return "text-base font-normal";
      case "lg":
        return "text-lg font-medium";
      default:
        return "text-sm font-light";
    }
  }, [itemSize]);

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
    <a
      className={cn(
        "group relative flex flex-col items-center justify-start gap-2 rounded-none border border-transparent p-0 transition-none hover:bg-tud-blue/25",
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
          className={cn("line-clamp-none break-all text-center", gridItemLabel)}
        >
          {item.name}
        </span>
      </div>
      <FolderItemMenu item={item} />
    </a>
  );
}
