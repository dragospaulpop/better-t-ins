import type { Folder } from "@better-t-ins/db/schema/upload";
import {
  FileArchiveIcon,
  FileAudioIcon,
  FileImageIcon,
  FileQuestionMarkIcon,
  FileTextIcon,
  FileVideoIcon,
  FolderIcon,
  type LucideIcon,
} from "lucide-react";
import GridItems from "./grid-items";
import ListItems from "./list-items";
import type { Size } from "./size-options";

const fileIcons: Record<string, LucideIcon> = {
  "application/x-folder": FolderIcon,
  "application/pdf": FileTextIcon,
  "application/msword": FileTextIcon,
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    FileTextIcon,
  "text/plain": FileTextIcon,
  "image/png": FileImageIcon,
  "image/jpeg": FileImageIcon,
  "video/mp4": FileVideoIcon,
  "audio/mpeg": FileAudioIcon,
  "application/zip": FileArchiveIcon,
  "application/rar": FileArchiveIcon,
  "application/x-7z-compressed": FileArchiveIcon,
  "application/octet-stream": FileQuestionMarkIcon,
};

const fileTypes = [
  "application/x-folder",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "image/png",
  "image/jpeg",
  "video/mp4",
  "audio/mpeg",
  "application/zip",
  "application/rar",
  "application/x-7z-compressed",
  "application/octet-stream",
];

export const mimeToReadable = (mime: string) => {
  switch (mime) {
    case "application/x-folder":
      return "Folder";
    case "application/pdf":
      return "PDF Document";
    case "application/msword":
      return "Word Document";
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      return "Word Document";
    case "text/plain":
      return "Text Document";
    case "image/png":
      return "PNG Image";
    case "image/jpeg":
      return "JPEG Image";
    case "video/mp4":
      return "MP4 Video";
    case "audio/mpeg":
      return "MP3 Audio";
    case "application/zip":
      return "ZIP Archive";
    case "application/rar":
      return "RAR Archive";
    case "application/x-7z-compressed":
      return "7Z Archive";
    case "application/octet-stream":
      return "Unknown File";
    default:
      return mime;
  }
};

const MAX_STRING_LENGTH = 50;
const MIN_STRING_LENGTH = 4;
const MAX_ITEMS = 50;

const PROBABILITY_SPACE = 0.2;
const LOWERCASE_LETTERS = "abcdefghijklmnopqrstuvwxyz";
const ONE_YEAR_IN_MS = 31_536_000_000;
const MAX_SIZE = 1_000_000_000;
const MIN_SIZE = 100_000;
const MAX_DATE = Date.now();
const MIN_DATE = Date.now() - ONE_YEAR_IN_MS;

export type Item = {
  id: string | number;
  parentId: string | number;
  name: string;
  type: "folder" | "file";
  mime: string;
  size: number;
  createdAt: Date;
  updatedAt: Date;
};

export const items: Item[] = new Array(MAX_ITEMS).fill(0).map((_, _index) => {
  const type = "file";

  const fileType = fileTypes[Math.floor(Math.random() * fileTypes.length)];

  return {
    id: crypto.randomUUID(),
    parentId: crypto.randomUUID(),
    name: (() => {
      const initialString = Array.from(
        {
          length:
            Math.floor(
              Math.random() * (MAX_STRING_LENGTH - MIN_STRING_LENGTH + 1)
            ) + MIN_STRING_LENGTH,
        },
        () =>
          LOWERCASE_LETTERS[
            Math.floor(Math.random() * LOWERCASE_LETTERS.length)
          ]
      ).join("");

      let spacedString = "";
      for (let i = 0; i < initialString.length; i++) {
        spacedString += initialString[i];
        // Randomly insert a space after a character, but not at the very end
        if (i < initialString.length - 1 && Math.random() < PROBABILITY_SPACE) {
          // 20% chance to insert a space
          spacedString += " ";
        }
      }
      return `${spacedString}.${fileType}`;
    })(),
    type,
    mime: fileType,
    size: Math.floor(Math.random() * (MAX_SIZE - MIN_SIZE) + MIN_SIZE),
    createdAt: new Date(Math.random() * (MAX_DATE - MIN_DATE) + MIN_DATE),
    updatedAt: new Date(Math.random() * (MAX_DATE - MIN_DATE) + MIN_DATE),
  };
});

interface FoldersProps {
  displayMode: "grid" | "list";
  foldersFirst: boolean;
  sortField: "name" | "type" | "size" | "date";
  sortDirection: "asc" | "desc";
  itemSize: Size;
  folders: Folder[];
}

export default function Folders({
  displayMode,
  foldersFirst,
  sortField,
  sortDirection,
  itemSize,
  folders,
}: FoldersProps) {
  const folderItems = folders.map(
    (folder) =>
      ({
        id: folder.id,
        name: folder.name,
        type: "folder",
        mime: "application/x-folder",
        size: 15,
        createdAt: folder.createdAt,
        updatedAt: folder.updatedAt,
      }) as Item
  );

  return (
    <div className="w-full">
      {displayMode === "grid" ? (
        <GridItems
          foldersFirst={foldersFirst}
          itemSize={itemSize}
          items={[...items, ...(folderItems ? folderItems : [])]}
          sortDirection={sortDirection}
          sortField={sortField}
        />
      ) : (
        <ListItems
          foldersFirst={foldersFirst}
          itemSize={itemSize}
          items={items}
          sortDirection={sortDirection}
          sortField={sortField}
        />
      )}
    </div>
  );
}

type CurstomIconProps = {
  extension: string;
  className?: string;
  strokeWidth?: number;
  absoluteStrokeWidth?: boolean;
};

export function CustomIcon({
  extension,
  className,
  strokeWidth,
  absoluteStrokeWidth = false,
}: CurstomIconProps) {
  const IconComponent =
    fileIcons[extension.toLowerCase()] || FileQuestionMarkIcon;
  return (
    // <div className="flex items-center justify-center rounded-md bg-tud-light-grey/15 dark:bg-tud-dark-grey/15">
    <IconComponent
      absoluteStrokeWidth={absoluteStrokeWidth}
      className={className}
      strokeWidth={strokeWidth}
    />
    // </div>
  );
}
