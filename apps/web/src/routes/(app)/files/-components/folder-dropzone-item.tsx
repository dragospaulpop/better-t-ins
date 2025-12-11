import { formatBytes } from "@better-upload/client/helpers";
import { useNavigate } from "@tanstack/react-router";
import { useStore } from "@tanstack/react-store";
import { ClockIcon, FolderIcon, Loader2, UploadIcon } from "lucide-react";
import { useId } from "react";
import {
  type DropzoneInputProps,
  type DropzoneRootProps,
  useDropzone,
} from "react-dropzone";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { cn } from "@/lib/utils";
import { usePacerUpload } from "@/providers/pacer-upload-provider";
import { useSelectedItems } from "@/providers/selected-items-provider";
import FolderItemMenu from "@/routes/(app)/files/-components/folder-item-menu";
import {
  type Item as FolderItem,
  mimeToReadable,
} from "@/routes/(app)/files/-components/folders";
import { store } from "@/stores/upload-store";

type FolderDropzoneItemProps = {
  item: FolderItem;
  display: "grid" | "list";
  itemSizeClass: string;
  itemSizeClassFolder: string;
  itemSizeClassLoading: string;
  itemLabel: string;
};

export function FolderDropzoneItem({
  item,
  display,
  itemSizeClass,
  itemSizeClassFolder,
  itemSizeClassLoading,
  itemLabel,
}: FolderDropzoneItemProps) {
  const { addToUploadQueue } = usePacerUpload();

  const isUploading = useStore(
    store,
    (state) => state.uploadingFolderId === item.id
  );
  const isQueued = useStore(store, (state) =>
    state.queuedFolderIds.has(item.id)
  );

  const { getRootProps, getInputProps, isDragActive, inputRef } = useDropzone({
    onDrop: (files) => {
      // Allow drops anytime - queue system handles concurrent uploads
      if (files.length > 0) {
        addToUploadQueue({
          files: files.map((file) => ({
            id: crypto.randomUUID(),
            file,
            folderId: item.id,
          })),
          folderId: item.id,
        });
      }
      inputRef.current.value = "";
    },
    noClick: true,
  });

  return display === "list" ? (
    <ListFolderItem
      getInputProps={getInputProps}
      getRootProps={getRootProps}
      inputRef={inputRef}
      isDragActive={isDragActive}
      isQueued={isQueued}
      isUploading={isUploading}
      item={item}
      itemLabel={itemLabel}
      itemSizeClass={itemSizeClass}
      itemSizeClassFolder={itemSizeClassFolder}
      itemSizeClassLoading={itemSizeClassLoading}
    />
  ) : (
    <GridFolderItem
      getInputProps={getInputProps}
      getRootProps={getRootProps}
      inputRef={inputRef}
      isDragActive={isDragActive}
      isQueued={isQueued}
      isUploading={isUploading}
      item={item}
      itemLabel={itemLabel}
      itemSizeClass={itemSizeClass}
      itemSizeClassFolder={itemSizeClassFolder}
      itemSizeClassLoading={itemSizeClassLoading}
    />
  );
}

interface FolderItemProps {
  item: FolderItem;
  itemSizeClass: string;
  itemSizeClassFolder: string;
  itemSizeClassLoading: string;
  itemLabel: string;
  isDragActive: boolean;
  isUploading: boolean;
  isQueued: boolean;
  getRootProps: <T extends DropzoneRootProps>(props?: T) => T;
  getInputProps: <T extends DropzoneInputProps>(props?: T) => T;
  inputRef: React.RefObject<HTMLInputElement>;
}

function ListFolderItem({
  item,
  itemSizeClass,
  itemSizeClassFolder,
  itemSizeClassLoading,
  itemLabel,
  isDragActive,
  isUploading,
  isQueued,
  getRootProps,
  getInputProps,
  inputRef,
}: FolderItemProps) {
  const id = useId();
  const navigate = useNavigate();

  const { toggleSelectedFolder, selectedFolders } = useSelectedItems();

  return (
    <Item
      {...getRootProps()}
      className={cn(
        "group rounded-none px-0 py-0.5 transition-none hover:bg-tud-blue/25",
        {
          "border-tud-blue/80 bg-tud-blue/25": selectedFolders.includes(
            item.id
          ),
          "border-primary/80 border-dashed bg-accent dark:bg-accent/40":
            isDragActive,
        }
      )}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleSelectedFolder(item.id);
      }}
      onDoubleClick={(e) => {
        e.preventDefault();
        if (item.type === "folder") {
          navigate({
            to: "/files/{-$parentId}",
            params: { parentId: String(item.id) },
          });
        }
      }}
      onKeyUp={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          toggleSelectedFolder(item.id);
        }
      }}
      role="button"
      size="sm"
      tabIndex={0}
    >
      <input
        {...getInputProps()}
        accept={undefined}
        id={id}
        multiple
        ref={inputRef}
        type="file"
      />
      <ItemMedia className={cn(itemSizeClass)}>
        {!isDragActive && (
          <div className="relative my-2 grid items-center justify-center">
            {isUploading && (
              <Loader2
                className={cn(
                  "col-1 row-1 animate-spin self-center justify-self-center",
                  itemSizeClassLoading
                )}
              />
            )}
            <FolderIcon
              className={cn(
                "col-1 row-1 shrink-0 fill-tud-blue/75 dark:fill-tud-blue",
                { "opacity-50": isUploading },
                itemSizeClassFolder
              )}
              strokeWidth={0}
            />
          </div>
        )}
        {isDragActive && (
          <div className="relative my-2 grid items-center justify-center">
            <UploadIcon
              className={cn(
                "pointer-events-none col-1 row-1 shrink-0",
                itemSizeClassFolder
              )}
              strokeWidth={0.75}
            />
            {isQueued && !isUploading && (
              <div className="-top-1 -left-1 absolute rounded-full bg-amber-500 p-0.5">
                <ClockIcon className="size-3 text-white" />
              </div>
            )}
          </div>
        )}
      </ItemMedia>
      <ItemContent
        className={cn(
          "grid w-full grid-cols-4 items-center justify-center gap-6",
          {
            "grid-cols-2": isDragActive,
          }
        )}
      >
        <ItemTitle
          className={cn("line-clamp-none break-all text-left", itemLabel)}
        >
          {item.name}
        </ItemTitle>
        {!isDragActive && (
          <>
            <ItemDescription className={cn("text-left", itemLabel)}>
              {mimeToReadable(item.mime)}
            </ItemDescription>
            <ItemDescription className={cn("text-left", itemLabel)}>
              {formatBytes(item.size ?? 0, { decimalPlaces: 2 })}
            </ItemDescription>
            <ItemDescription className={cn("text-left", itemLabel)}>
              {item.createdAt.toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false,
              })}
            </ItemDescription>
          </>
        )}
        {isDragActive && (
          <ItemDescription
            className={cn("text-left font-bold text-primary", itemLabel)}
          >
            Drop files here
          </ItemDescription>
        )}
      </ItemContent>
      <ItemActions>
        <FolderItemMenu className="relative top-auto right-auto" item={item} />
      </ItemActions>
    </Item>
  );
}

function GridFolderItem({
  item,
  itemSizeClassFolder,
  itemSizeClassLoading,
  itemLabel,
  isDragActive,
  isUploading,
  isQueued,
  getRootProps,
  getInputProps,
  inputRef,
}: FolderItemProps) {
  const id = useId();
  const navigate = useNavigate();

  const { toggleSelectedFolder, selectedFolders } = useSelectedItems();

  return (
    <a
      className={cn(
        "group relative flex flex-col items-center justify-start gap-2 rounded-none border border-transparent p-0 transition-none hover:bg-tud-blue/25",

        {
          "border-primary/80 border-dashed bg-accent dark:bg-accent/40":
            isDragActive,
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
            "justify-center": isDragActive,
          }
        )}
      >
        <input
          {...getInputProps()}
          accept={undefined}
          id={id}
          multiple
          ref={inputRef}
          type="file"
        />
        {isDragActive && (
          <div className="relative my-2 grid items-center justify-center">
            <UploadIcon
              className={cn(
                "pointer-events-none col-1 row-1 shrink-0",
                itemSizeClassFolder
              )}
              strokeWidth={0.75}
            />
          </div>
        )}

        {!isDragActive && (
          <div className="relative my-2 grid items-center justify-center">
            {isUploading && (
              <Loader2
                className={cn(
                  "col-1 row-1 animate-spin self-center justify-self-center",
                  itemSizeClassLoading
                )}
              />
            )}

            <FolderIcon
              className={cn(
                "col-1 row-1 shrink-0 fill-tud-blue/75 dark:fill-tud-blue",
                itemSizeClassFolder,
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
          className={cn("line-clamp-none break-all text-center", itemLabel)}
        >
          {item.name}
        </span>
      </div>
      <FolderItemMenu item={item} />
    </a>
  );
}
