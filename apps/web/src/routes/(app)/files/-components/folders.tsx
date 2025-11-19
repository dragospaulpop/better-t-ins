import {
  FileArchiveIcon,
  FileAudioIcon,
  FileImageIcon,
  FileTextIcon,
  FileVideoIcon,
  FolderIcon,
  type LucideIcon,
  MoreVerticalIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const fileIcons: Record<string, LucideIcon> = {
  pdf: FileTextIcon,
  docx: FileTextIcon,
  txt: FileTextIcon,
  png: FileImageIcon,
  jpg: FileImageIcon,
  mp4: FileVideoIcon,
  mp3: FileAudioIcon,
  zip: FileArchiveIcon,
  rar: FileArchiveIcon,
  "7z": FileArchiveIcon,
};

const fileTypes = [
  "pdf",
  "docx",
  "txt",
  "png",
  "jpg",
  "mp4",
  "mp3",
  "zip",
  "rar",
  "7z",
];

const MAX_STRING_LENGTH = 50;
const MIN_STRING_LENGTH = 4;
const MAX_ITEMS = 50;
const PROBABILITY_FOLDER = 0.5;
const PROBABILITY_SPACE = 0.2;
const LOWERCASE_LETTERS = "abcdefghijklmnopqrstuvwxyz";

const items = new Array(MAX_ITEMS).fill(0).map((_, index) => {
  const type = Math.random() < PROBABILITY_FOLDER ? "folder" : "file";
  const fileCount = Math.floor(Math.random() * MAX_ITEMS);
  const fileType = fileTypes[Math.floor(Math.random() * fileTypes.length)];

  return {
    id: index,
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
      return `${spacedString}${type === "folder" ? "" : `.${fileType}`}`;
    })(),
    type,
    label: type === "folder" ? fileCount : fileType,
  };
});

export default function Folders() {
  return (
    <div className="grid w-full grid-cols-[repeat(auto-fill,minmax(10rem,1fr))] gap-2">
      {items.map((item) => (
        <div
          className="group relative flex flex-col items-center gap-2 rounded-lg border border-transparent bg-card p-2 transition-all hover:border-tud-blue/50 hover:bg-tud-blue/25 hover:shadow-md hover:shadow-tud-green/25"
          key={item.id}
        >
          <div className="relative">
            {item.type === "folder" ? (
              <FolderIcon
                className="size-24 shrink-0 fill-tud-blue/75 dark:fill-tud-blue"
                strokeWidth={0}
              />
            ) : (
              <CustomIcon
                absoluteStrokeWidth={true}
                className="size-24 shrink-0"
                extension={item.label as string}
                strokeWidth={0.75}
              />
            )}
            <div className="absolute inset-0 grid place-items-center">
              <span
                className={cn(
                  "font-bold text-xs",
                  item.type === "folder"
                    ? "text-primary dark:text-primary-foreground"
                    : "text-primary dark:text-primary-foreground"
                )}
              >
                {/* {item.label} */}
              </span>
            </div>
          </div>
          <span className="line-clamp-2 break-all text-center text-sm">
            {item.name}
          </span>
          <div className="absolute top-1 right-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className="opacity-0 transition-opacity group-hover:opacity-100"
                  size="icon-sm"
                  variant="ghost"
                >
                  <MoreVerticalIcon className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Open</DropdownMenuItem>
                <DropdownMenuItem>Open in new tab</DropdownMenuItem>
                <DropdownMenuItem>Download</DropdownMenuItem>
                <DropdownMenuItem>Rename</DropdownMenuItem>
                <DropdownMenuItem>Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      ))}
    </div>
  );
}

type FileIconProps = {
  extension: string;
  className?: string;
  strokeWidth?: number;
  absoluteStrokeWidth?: boolean;
};

function CustomIcon({
  extension,
  className,
  strokeWidth,
  absoluteStrokeWidth = false,
}: FileIconProps) {
  const IconComponent = fileIcons[extension.toLowerCase()] || FileTextIcon;
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
