import { formatBytes } from "@better-upload/client/helpers";
import { useNavigate } from "@tanstack/react-router";
import { FolderIcon } from "lucide-react";
import { useMemo } from "react";
import { Fragment } from "react/jsx-runtime";
import { defaultStyles, FileIcon } from "react-file-icon";
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
import {
  getSizeValue,
  useDisplaySettings,
} from "@/providers/display-settings-provider";
import { useSelectedItems } from "@/providers/selected-items-provider";
import { FileItemMenu } from "./file-item-menu";
import FolderItemMenu from "./folder-item-menu";
import { type Item as ItemType, mimeToReadable } from "./folders";

const LIST_ITEM_SIZE_OFFSET = 4;
const LIST_ITEM_ICON_SIZE_OFFSET_FOLDER = 8;
const LIST_ITEM_ICON_SIZE_OFFSET_FILE = 4;

interface ListItemsProps {
  items: ItemType[];
}

export default function ListItems({ items }: ListItemsProps) {
  const { itemSize } = useDisplaySettings();
  const { selectedFiles, toggleSelectedFile } = useSelectedItems();
  const navigate = useNavigate();

  const listItemSize = useMemo(
    () => `size-${getSizeValue(itemSize) - LIST_ITEM_SIZE_OFFSET}`,
    [itemSize]
  );
  const listItemIconSizeFolder = useMemo(
    () => `size-${getSizeValue(itemSize) - LIST_ITEM_ICON_SIZE_OFFSET_FOLDER}`,
    [itemSize]
  );
  const listItemIconSizeFile = useMemo(
    () => `size-${getSizeValue(itemSize) - LIST_ITEM_ICON_SIZE_OFFSET_FILE}`,
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
        {items.map((item, index) => (
          <Fragment key={item.id}>
            <Item
              className={cn(
                "group rounded-none px-0 py-0.5 transition-none hover:bg-tud-blue/25",
                {
                  "border-tud-blue/80 bg-tud-blue/25": selectedFiles.includes(
                    item.id
                  ),
                }
              )}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleSelectedFile(item.id);
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
                  toggleSelectedFile(item.id);
                }
              }}
              role="button"
              size="sm"
              tabIndex={0}
            >
              <ItemMedia className={cn(listItemSize)}>
                {item.type === "folder" ? (
                  <FolderIcon
                    className={cn(
                      "shrink-0 fill-tud-blue/75 dark:fill-tud-blue",
                      listItemIconSizeFolder
                    )}
                    strokeWidth={0}
                  />
                ) : (
                  <MimeFileIcon
                    listItemIconSize={listItemIconSizeFile}
                    mime={item.mime}
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
                  {formatBytes(item.size ?? 0, { decimalPlaces: 2 })}
                </ItemDescription>
                <ItemDescription className={cn("text-left", listItemLabel)}>
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
              </ItemContent>
              <ItemActions>
                {item.type === "file" && (
                  <FileItemMenu
                    className="relative top-auto right-auto"
                    item={item}
                  />
                )}
                {item.type === "folder" && (
                  <FolderItemMenu
                    className="relative top-auto right-auto"
                    item={item}
                  />
                )}
              </ItemActions>
            </Item>
            {index !== items.length - 1 && <ItemSeparator />}
          </Fragment>
        ))}
      </ItemGroup>
    </div>
  );
}

function MimeFileIcon({
  mime,
  listItemIconSize,
}: {
  mime: string;
  listItemIconSize: string;
}) {
  const extension = useMemo(() => mime.split("/").pop()?.toLowerCase(), [mime]);

  const style = useMemo(
    () =>
      defaultStyles[extension as keyof typeof defaultStyles] ||
      defaultStyles.bin,
    [extension]
  );

  return (
    <div
      className={cn(
        listItemIconSize,
        "my-2 grid shrink-0 place-items-center p-2 [&>svg]:size-full"
      )}
    >
      <FileIcon extension={extension} {...style} labelUppercase={false} />
    </div>
  );
}
