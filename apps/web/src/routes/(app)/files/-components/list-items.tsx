import { formatBytes } from "@better-upload/client/helpers";
import { FolderIcon, MoreVerticalIcon } from "lucide-react";
import { useMemo } from "react";
import { Fragment } from "react/jsx-runtime";
import { Button } from "@/components/ui/button";

import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "@/components/ui/item";
import { cn } from "@/lib/utils";
import { CustomIcon, type Item as ItemType, mimeToReadable } from "./folders";
import { getSizeValue, type Size } from "./size-options";

const LIST_ITEM_SIZE_OFFSET = 4;
const LIST_ITEM_ICON_SIZE_OFFSET = 8;

interface ListItemsProps {
  items: ItemType[];
  sortField: "name" | "type" | "size" | "date";
  sortDirection: "asc" | "desc";
  itemSize: Size;
  foldersFirst: boolean;
}

export default function ListItems({
  items,
  sortField,
  sortDirection,
  itemSize,
  foldersFirst,
}: ListItemsProps) {
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
              ? a.date.getTime() - b.date.getTime()
              : b.date.getTime() - a.date.getTime();
          default:
            return 0;
        }
      }),
    [items, sortField, sortDirection, foldersFirst]
  );

  const listItemSize = useMemo(
    () => `size-${getSizeValue(itemSize) - LIST_ITEM_SIZE_OFFSET}`,
    [itemSize]
  );
  const listItemIconSize = useMemo(
    () => `size-${getSizeValue(itemSize) - LIST_ITEM_ICON_SIZE_OFFSET}`,
    [itemSize]
  );

  const listItemLabel = useMemo(() => {
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
    <div className="flex flex-col gap-2">
      <ItemGroup>
        {sortedItems.map((item, index) => (
          <Fragment key={item.id}>
            <Item size="sm">
              <ItemMedia className={cn(listItemSize)}>
                {item.type === "folder" ? (
                  <FolderIcon
                    className={cn(
                      "shrink-0 fill-tud-blue/75 dark:fill-tud-blue",
                      listItemIconSize
                    )}
                    strokeWidth={0}
                  />
                ) : (
                  <CustomIcon
                    absoluteStrokeWidth={true}
                    className={cn("shrink-0", listItemIconSize)}
                    extension={item.label as string}
                    strokeWidth={0.75}
                  />
                )}
              </ItemMedia>
              <ItemContent className="grid w-full grid-cols-4 items-center justify-center gap-6">
                <ItemTitle
                  className={cn(
                    "line-clamp-2 break-all text-left",
                    listItemLabel
                  )}
                >
                  {item.name}
                </ItemTitle>
                <ItemDescription className={cn("text-left", listItemLabel)}>
                  {mimeToReadable(item.mime)}
                </ItemDescription>
                <ItemDescription className={cn("text-left", listItemLabel)}>
                  {formatBytes(item.size, { decimalPlaces: 2 })}
                </ItemDescription>
                <ItemDescription className={cn("text-left", listItemLabel)}>
                  {item.date.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: false,
                  })}
                </ItemDescription>
              </ItemContent>
              <ItemActions>
                <Button className="rounded-full" size="icon" variant="ghost">
                  <MoreVerticalIcon />
                </Button>
              </ItemActions>
            </Item>
            {index !== items.length - 1 && <ItemSeparator />}
          </Fragment>
        ))}
      </ItemGroup>
    </div>
  );
}
