import { useSuspenseQuery } from "@tanstack/react-query";
import type { TrpcFile, TrpcFolder } from "@tud-box/db/schema/upload";
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
import { trpc } from "@/lib/trpc";
import { useDisplaySettings } from "@/providers/display-settings-provider";
import GridItems from "./grid-items";
import ListItems from "./list-items";

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

export type Item = {
  id: number;
  parentId: string | number | null;
  name: string;
  type: "folder" | "file";
  mime: string;
  size?: number;
  createdAt: Date;
  updatedAt: Date;
  history_count?: number;
};

interface FoldersProps {
  currentFolderId: string | null | undefined;
}

const selectFolders = (folders: TrpcFolder[]): Item[] =>
  folders.map((folder) => ({
    id: folder.id,
    name: folder.name,
    parentId: folder.parent_id ?? null,
    type: "folder",
    mime: "application/x-folder",
    size: 0,
    createdAt: new Date(folder.createdAt),
    updatedAt: new Date(folder.updatedAt),
  }));

const selectFiles = (files: TrpcFile[]): Item[] =>
  files.map((file) => ({
    id: file.id,
    name: file.name,
    parentId: file.folder_id ?? null,
    type: "file",
    mime: file.type ?? "application/octet-stream",
    size: file.size ?? undefined,
    createdAt: new Date(file.createdAt),
    updatedAt: new Date(file.updatedAt),
  }));

export default function Folders({ currentFolderId }: FoldersProps) {
  const { displayMode } = useDisplaySettings();

  const { data: folders = [] } = useSuspenseQuery({
    ...trpc.folder.getAllByParentId.queryOptions({
      parent_id: currentFolderId,
    }),
    select: selectFolders,
  });

  const { data: files = [] } = useSuspenseQuery({
    ...trpc.file.getAllByFolderId.queryOptions({
      folder_id: currentFolderId,
    }),
    select: selectFiles,
  });

  const items = [...files, ...folders];

  return (
    <div className="w-full">
      {displayMode === "grid" ? (
        <GridItems items={items} />
      ) : (
        <ListItems items={items} />
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
