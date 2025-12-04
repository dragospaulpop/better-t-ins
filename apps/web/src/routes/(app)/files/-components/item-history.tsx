import { useQuery } from "@tanstack/react-query";
import { AlertCircleIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { trpc } from "@/lib/trpc";
import type { Item } from "./folders";
export default function ItemHistory({
  open,
  onOpenChange,
  item,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: Item;
}) {
  const {
    data: history,
    isLoading,
    isError,
  } = useQuery(trpc.file.getHistory.queryOptions({ file_id: Number(item.id) }));
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Item History</DialogTitle>
          <DialogDescription>
            Timeline of uploads of a file withe same name in the same folder
          </DialogDescription>
        </DialogHeader>
        {isLoading && <Spinner className="size-4 animate-spin" />}
        {isError && <AlertCircleIcon className="size-4 text-destructive" />}
        {history && (
          <div>
            <h1>History</h1>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
