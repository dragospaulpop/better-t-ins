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
import { useDisplaySettings } from "@/providers/display-settings-provider";

export default function SortOptions() {
  const {
    sortField,
    sortDirection,
    foldersFirst,
    handleSortBy,
    setFoldersFirst,
    setSortDirection,
  } = useDisplaySettings();

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
          onValueChange={(value) => setSortDirection(value as "asc" | "desc")}
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
