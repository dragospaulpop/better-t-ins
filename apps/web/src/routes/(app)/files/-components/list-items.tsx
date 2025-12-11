import { formatBytes } from "@better-upload/client/helpers";
import { useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { Fragment } from "react/jsx-runtime";
import { defaultStyles, FileIcon } from "react-file-icon";
import { useTheme } from "@/components/theme-provider";
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
  sizeClassMapLoading,
  useDisplaySettings,
} from "@/providers/display-settings-provider";
import { useSelectedItems } from "@/providers/selected-items-provider";
import { FileItemMenu } from "./file-item-menu";
import { FolderDropzoneItem } from "./folder-dropzone-item";
import { type Item as ItemType, mimeToReadable } from "./folders";

const LIST_ITEM_SIZE_OFFSET = 4;
const LIST_ITEM_ICON_SIZE_OFFSET_FOLDER = 8;
const LIST_ITEM_ICON_SIZE_OFFSET_FILE = 4;

interface ListItemsProps {
  items: ItemType[];
}

export default function ListItems({ items }: ListItemsProps) {
  const { itemSize } = useDisplaySettings();

  const listItemSize = useMemo(
    () => `size-${getSizeValue(itemSize) - LIST_ITEM_SIZE_OFFSET}`,
    [itemSize]
  );
  const listItemSizeFolder = useMemo(
    () => `size-${getSizeValue(itemSize) - LIST_ITEM_ICON_SIZE_OFFSET_FOLDER}`,
    [itemSize]
  );
  const listItemSizeFile = useMemo(
    () => `size-${getSizeValue(itemSize) - LIST_ITEM_ICON_SIZE_OFFSET_FILE}`,
    [itemSize]
  );

  const listItemSizeLoading = useMemo(
    () => sizeClassMapLoading[itemSize],
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
            {item.type === "folder" ? (
              <FolderDropzoneItem
                display="list"
                item={item}
                itemLabel={listItemLabel}
                itemSizeClass={listItemSize}
                itemSizeClassFolder={listItemSizeFolder}
                itemSizeClassLoading={listItemSizeLoading}
              />
            ) : (
              <ListFileItem
                item={item}
                itemLabel={listItemLabel}
                itemSizeClass={listItemSize}
                itemSizeClassFile={listItemSizeFile}
              />
            )}
            {index !== items.length - 1 && <ItemSeparator />}
          </Fragment>
        ))}
      </ItemGroup>
    </div>
  );
}

function ListFileItem({
  item,
  itemSizeClass,
  itemLabel,
  itemSizeClassFile,
}: {
  item: ItemType;
  itemSizeClass: string;
  itemLabel: string;

  itemSizeClassFile: string;
}) {
  const { selectedFiles, toggleSelectedFile } = useSelectedItems();
  const navigate = useNavigate();

  return (
    <Item
      className={cn(
        "group rounded-none px-0 py-0.5 transition-none hover:bg-tud-blue/25",
        {
          "border-tud-blue/80 bg-tud-blue/25": selectedFiles.includes(item.id),
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
      <ItemMedia className={cn(itemSizeClass)}>
        <MimeFileIcon itemSizeClass={itemSizeClassFile} name={item.name} />
      </ItemMedia>
      <ItemContent className="grid w-full grid-cols-4 items-center justify-center gap-6">
        <ItemTitle
          className={cn("line-clamp-1 break-all text-left", itemLabel)}
        >
          {item.name}
        </ItemTitle>
        <ItemDescription className={cn("line-clamp-1 text-left", itemLabel)}>
          {mimeToReadable(item.mime)}
        </ItemDescription>
        <ItemDescription className={cn("line-clamp-1 text-left", itemLabel)}>
          {formatBytes(item.size ?? 0, { decimalPlaces: 2 })}
        </ItemDescription>
        <ItemDescription className={cn("line-clamp-1 text-left", itemLabel)}>
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
        <FileItemMenu className="relative top-auto right-auto" item={item} />
      </ItemActions>
    </Item>
  );
}

function MimeFileIcon({
  name,
  itemSizeClass,
}: {
  name: string;
  itemSizeClass: string;
}) {
  const { resolvedTheme } = useTheme();

  const extension = useMemo(() => name.split(".").pop()?.toLowerCase(), [name]);

  const style = useMemo(
    () =>
      defaultStyles[extension as keyof typeof defaultStyles] ||
      defaultStyles.bin,
    [extension]
  );

  const iconColor = resolvedTheme === "dark" ? "#999999" : "#dddddd";

  return (
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
  );
}
