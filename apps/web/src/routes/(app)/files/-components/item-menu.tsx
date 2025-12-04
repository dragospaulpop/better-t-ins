import {
  DownloadIcon,
  HistoryIcon,
  MoreVerticalIcon,
  PencilIcon,
  TrashIcon,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Item } from "./folders";
import ItemHistory from "./item-history";

export function ItemMenu({ item }: { item: Item }) {
  const [historyOpen, setHistoryOpen] = useState(false);

  return (
    <div className="absolute top-1 right-1 opacity-0 transition-opacity group-hover:opacity-100">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="rounded-full p-1" size="icon-sm" variant="ghost">
            <MoreVerticalIcon className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>

          <DropdownMenuItem
            className="flex gap-2"
            onClick={() => setHistoryOpen(true)}
          >
            <HistoryIcon className="mr-2 size-4" />
            View History
          </DropdownMenuItem>
          <DropdownMenuItem>
            <DownloadIcon className="mr-2 size-4" />
            Download latest
          </DropdownMenuItem>
          <DropdownMenuItem>
            <PencilIcon className="mr-2 size-4" />
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem>
            <PencilIcon className="mr-2 size-4" />
            Move to
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">
            <TrashIcon className="mr-2 size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ItemHistory
        item={item}
        onOpenChange={setHistoryOpen}
        open={historyOpen}
      />
    </div>
  );
}
