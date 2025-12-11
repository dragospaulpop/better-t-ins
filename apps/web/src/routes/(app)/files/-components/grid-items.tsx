import { FileStackIcon } from "lucide-react";
import { useMemo } from "react";
import { defaultStyles, FileIcon } from "react-file-icon";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import {
  sizeClassMap,
  sizeClassMapLoading,
  useDisplaySettings,
} from "@/providers/display-settings-provider";
import { useSelectedItems } from "@/providers/selected-items-provider";
import { FileItemMenu } from "./file-item-menu";
import { FolderDropzoneItem } from "./folder-dropzone-item";
import type { Item } from "./folders";

interface GridItemsProps {
  items: Item[];
}

export default function GridItems({ items }: GridItemsProps) {
  const { itemSize } = useDisplaySettings();

  const gridItemSize = useMemo(() => sizeClassMap[itemSize], [itemSize]);
  const gridItemSizeLoading = useMemo(
    () => sizeClassMapLoading[itemSize],
    [itemSize]
  );
  const gridItemSizeFolder = useMemo(() => sizeClassMap[itemSize], [itemSize]);
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

  return (
    <div className={cn("grid w-full gap-0.5", gridMinColSize)}>
      {items.map((item) =>
        item.type === "folder" ? (
          <FolderDropzoneItem
            display="grid"
            item={item}
            itemLabel={gridItemLabel}
            itemSizeClass={gridItemSize}
            itemSizeClassFolder={gridItemSizeFolder}
            itemSizeClassLoading={gridItemSizeLoading}
            key={item.id}
          />
        ) : (
          <FileItem
            item={item}
            itemLabel={gridItemLabel}
            itemSizeClass={gridItemSize}
            key={item.id}
          />
        )
      )}
    </div>
  );
}

function FileItem({
  item,
  itemSizeClass,
  itemLabel,
}: {
  item: Item;
  itemSizeClass: string;
  itemLabel: string;
}) {
  const { selectedFiles, toggleSelectedFile } = useSelectedItems();
  const { resolvedTheme } = useTheme();
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

  const iconColor = resolvedTheme === "dark" ? "#999999" : "#dddddd";

  return (
    <div className="group relative">
      {/* biome-ignore lint/a11y/useSemanticElements: gimme a break */}
      <div
        className={cn(
          "group z-10 flex h-full flex-col items-center justify-start gap-0 rounded-none border border-transparent p-2 transition-none hover:bg-tud-blue/25",
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
              itemSizeClass,
              "my-2 grid shrink-0 place-items-center p-2 [&>svg]:size-full"
            )}
          >
            <FileIcon
              extension={extension}
              {...style}
              color={iconColor}
              labelUppercase={false}
            />
          </div>
        </div>
        <span
          className={cn("line-clamp-none break-all text-center", itemLabel)}
        >
          {item.name}
        </span>
        {item?.history_count && item.history_count > 1 && (
          <FileStackIcon className="absolute top-1 left-1 size-3 text-tud-green/75" />
        )}
      </div>
      <FileItemMenu item={item} />
    </div>
  );
}
