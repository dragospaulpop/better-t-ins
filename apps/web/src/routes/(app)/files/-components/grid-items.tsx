import { FileStackIcon } from "lucide-react";
import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { FolderUploader } from "./folder-uploader";
import { CustomIcon, type Item } from "./folders";
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
            return sortDirection === "asc" ? a.size - b.size : b.size - a.size;
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
  return (
    <div className="group relative flex flex-col items-center justify-between gap-2 rounded-lg border border-transparent bg-card p-2 transition-all hover:border-tud-blue/50 hover:bg-tud-blue/25 hover:shadow-md hover:shadow-tud-green/25">
      <div className="relative">
        <CustomIcon
          absoluteStrokeWidth={true}
          className={cn("shrink-0", gridItemSize)}
          extension={item.mime as string}
          strokeWidth={0.75}
        />
      </div>
      <span className={cn("line-clamp-2 break-all text-center", gridItemLabel)}>
        {item.name}
      </span>
      {item?.history_count && item.history_count > 1 && (
        <FileStackIcon className="absolute top-1 left-1 size-3 text-tud-green/75" />
      )}

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
