import { FileStackIcon } from "lucide-react";
import { useMemo } from "react";
import { defaultStyles, FileIcon } from "react-file-icon";
import { cn } from "@/lib/utils";
import { useSelectedItems } from "@/providers/selected-items-provider";
import { FolderUploader } from "./folder-uploader";
import type { Item } from "./folders";
import { ItemMenu } from "./item-menu";
import { type Size, sizeClassMap } from "./size-options";

interface GridItemsProps {
  items: Item[];
  sortField: "name" | "type" | "size" | "date";
  sortDirection: "asc" | "desc";
  itemSize: Size;
  foldersFirst: boolean;
}

export default function GridItems({
  items,
  sortField,
  sortDirection,
  itemSize,
  foldersFirst,
}: GridItemsProps) {
  /**
   * Sort the items by the sort field and direction.
   * Folders are always sorted before files.
   * Other fields are sorted by the sort field and direction.
   */

  const sortedItems = useMemo(
    () =>
      // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: sorting items
      items.sort((a, b) => {
        if (foldersFirst) {
          if (a.type === "folder" && b.type === "file") {
            return -1;
          }
          if (a.type === "file" && b.type === "folder") {
            return 1;
          }
        }

        switch (sortField) {
          case "name":
            return sortDirection === "asc"
              ? a.name.localeCompare(b.name)
              : b.name.localeCompare(a.name);
          case "type":
            return sortDirection === "asc"
              ? a.mime.localeCompare(b.mime)
              : b.mime.localeCompare(a.mime);
          case "size":
            return sortDirection === "asc"
              ? (a.size ?? 0) - (b.size ?? 0)
              : (b.size ?? 0) - (a.size ?? 0);
          case "date":
            return sortDirection === "asc"
              ? a.createdAt.getTime() - b.createdAt.getTime()
              : b.createdAt.getTime() - a.createdAt.getTime();
          default:
            return 0;
        }
      }),
    [items, sortField, sortDirection, foldersFirst]
  );

  const gridItemSize = useMemo(() => sizeClassMap[itemSize], [itemSize]);

  const gridMinColSize = useMemo(() => {
    switch (itemSize) {
      case "xs":
        return "grid-cols-[repeat(auto-fill,minmax(5rem,1fr))]";
      case "sm":
        return "grid-cols-[repeat(auto-fill,minmax(6rem,1fr))]";
      case "md":
        return "grid-cols-[repeat(auto-fill,minmax(7rem,1fr))]";
      case "lg":
        return "grid-cols-[repeat(auto-fill,minmax(8rem,1fr))]";
      default:
        return "grid-cols-[repeat(auto-fill,minmax(5rem,1fr))]";
    }
  }, [itemSize]);

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

  return (
    <div className={cn("grid w-full gap-4", gridMinColSize)}>
      {sortedItems.map((item) =>
        item.type === "folder" ? (
          <FolderItem
            gridItemLabel={gridItemLabel}
            gridItemSize={gridItemSize}
            item={item}
            key={item.id}
          />
        ) : (
          <FileItem
            gridItemLabel={gridItemLabel}
            gridItemSize={gridItemSize}
            item={item}
            key={item.id}
          />
        )
      )}
    </div>
  );
}

function FileItem({
  item,
  gridItemSize,
  gridItemLabel,
}: {
  item: Item;
  gridItemSize: string;
  gridItemLabel: string;
}) {
  const { selectedFiles, toggleSelectedFile } = useSelectedItems();

  const extension = useMemo(
    () => item.name.split(".").pop()?.toLowerCase(),
    [item.name]
  );

  const style = useMemo(
    () =>
      defaultStyles[extension as keyof typeof defaultStyles] ||
      defaultStyles.bin,
    [extension]
  );

  return (
    <div className="group relative">
      {/* biome-ignore lint/a11y/useSemanticElements: gimme a break */}
      <div
        className={cn(
          "group z-10 flex flex-col items-center justify-start gap-0 rounded-lg border border-transparent p-2 transition-all hover:bg-tud-blue/25 hover:shadow-md hover:shadow-tud-green/25",
          {
            "border-tud-blue/80 bg-tud-blue/25": selectedFiles.includes(
              item.id
            ),
          }
        )}
        data-type="file"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleSelectedFile(item.id);
        }}
        onKeyUp={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            toggleSelectedFile(item.id);
          }
        }}
        role="button"
        tabIndex={0}
      >
        <div className="relative">
          <div
            className={cn(
              gridItemSize,
              "my-2 grid shrink-0 place-items-center p-2 [&>svg]:size-full"
            )}
          >
            <FileIcon extension={extension} {...style} labelUppercase={false} />
          </div>
        </div>
        <span
          className={cn("line-clamp-none break-all text-center", gridItemLabel)}
        >
          {item.name}
        </span>
        {item?.history_count && item.history_count > 1 && (
          <FileStackIcon className="absolute top-1 left-1 size-3 text-tud-green/75" />
        )}
      </div>
      <ItemMenu item={item} />
    </div>
  );
}

function FolderItem({
  item,
  gridItemSize,
  gridItemLabel,
}: {
  item: Item;
  gridItemSize: string;
  gridItemLabel: string;
}) {
  return (
    <FolderUploader
      gridItemLabel={gridItemLabel}
      gridItemSize={gridItemSize}
      item={item}
    />
  );
}
