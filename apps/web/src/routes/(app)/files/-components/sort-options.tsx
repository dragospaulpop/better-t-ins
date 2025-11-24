import { SortAscIcon, SortDescIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SortOptionsProps {
  sortField: "name" | "type" | "size" | "date";
  sortDirection: "asc" | "desc";
  handleSortBy: (newField: "name" | "type" | "size" | "date") => void;
  handleSortDirection: (newDirection: "asc" | "desc") => void;
  foldersFirst: boolean;
  setFoldersFirst: (newFoldersFirst: boolean) => void;
}

export default function SortOptions({
  sortField,
  sortDirection,
  handleSortBy,
  handleSortDirection,
  foldersFirst,
  setFoldersFirst,
}: SortOptionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <DropdownMenu onOpenChange={setIsOpen} open={isOpen}>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="outline">
          {sortField.charAt(0).toUpperCase() + sortField.slice(1)}
          {sortDirection === "asc" && <SortAscIcon className="size-4" />}
          {sortDirection === "desc" && <SortDescIcon className="size-4" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuLabel>Sort by</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          onValueChange={(value) =>
            handleSortBy(value as "name" | "type" | "size" | "date")
          }
          value={sortField}
        >
          <DropdownMenuRadioItem value="name">Name</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="type">Type</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="size">Size</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="date">Date</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Sort direction</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          onValueChange={(value) =>
            handleSortDirection(value as "asc" | "desc")
          }
          value={sortDirection}
        >
          <DropdownMenuRadioItem value="asc">Ascending</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="desc">Descending</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Folders</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          onValueChange={(value) => setFoldersFirst(value === "folders")}
          value={foldersFirst ? "folders" : "mixed"}
        >
          <DropdownMenuRadioItem value="folders">
            Folders first
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="mixed">
            Mixed with files
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// <div className="flex items-center gap-2">
//   <Button onClick={() => handleSortBy("name")} size="sm" variant="outline">
//     Name
//     {sortField === "name" &&
//       (sortDirection === "asc" ? (
//         <ChevronUpIcon className="h-4 w-4" />
//       ) : (
//         <ChevronDownIcon className="h-4 w-4" />
//       ))}
//   </Button>
//   <Button onClick={() => handleSortBy("type")} size="sm" variant="outline">
//     Type
//     {sortField === "type" &&
//       (sortDirection === "asc" ? (
//         <ChevronUpIcon className="h-4 w-4" />
//       ) : (
//         <ChevronDownIcon className="h-4 w-4" />
//       ))}
//   </Button>
//   <Button onClick={() => handleSortBy("size")} size="sm" variant="outline">
//     Size
//     {sortField === "size" &&
//       (sortDirection === "asc" ? (
//         <ChevronUpIcon className="h-4 w-4" />
//       ) : (
//         <ChevronDownIcon className="h-4 w-4" />
//       ))}
//   </Button>
//   <Button onClick={() => handleSortBy("date")} size="sm" variant="outline">
//     Date
//     {sortField === "date" &&
//       (sortDirection === "asc" ? (
//         <ChevronUpIcon className="h-4 w-4" />
//       ) : (
//         <ChevronDownIcon className="h-4 w-4" />
//       ))}
//   </Button>
// </div>
