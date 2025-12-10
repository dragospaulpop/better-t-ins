import { formatBytes } from "@better-upload/client/helpers";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AlertCircleIcon, DownloadIcon, TrashIcon } from "lucide-react";
import { Fragment, useEffect } from "react";
import { toast } from "sonner";
import { ActionButton } from "@/components/ui/action-button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
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
import { Spinner } from "@/components/ui/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { queryClient, trpc } from "@/lib/trpc";
import { useRefetchFolder } from "@/providers/refetch-folder-provider";
import type { Item as ItemType } from "./folders";

export default function ItemHistory({
  open,
  onOpenChange,
  item,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: ItemType;
}) {
  const { refetchFiles } = useRefetchFolder();
  const {
    data: history,
    isLoading,
    isError,
    refetch,
  } = useQuery(
    trpc.file.getHistory.queryOptions(
      { file_id: Number(item.id) },
      { enabled: open }
    )
  );

  const { mutateAsync: deleteHistoryItem } = useMutation(
    trpc.file.deleteHistoryItem.mutationOptions()
  );

  useEffect(() => {
    if (open) {
      queryClient.invalidateQueries({
        queryKey: trpc.file.getHistory.queryKey({ file_id: Number(item.id) }),
      });
    }
  }, [open, item.id]);

  useEffect(() => {
    if (!history || history.length === 0) {
      onOpenChange(false);

      queryClient.removeQueries({
        queryKey: trpc.file.getHistory.queryKey({ file_id: Number(item.id) }),
      });
      refetchFiles();
    }
  }, [history, onOpenChange, item.id, refetchFiles]);

  const { mutateAsync: downloadSpecificFileHistoryItem } = useMutation(
    trpc.file.downloadSpecificFileHistoryItem.mutationOptions({
      onSuccess: (data) => {
        window.open(data, "_blank", "noopener");
      },
      onError: (error) => {
        toast.error("Failed to download specific file history item", {
          description: error.message,
        });
      },
    })
  );

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex flex-col gap-2">
            <div className="font-bold">Item History for</div>
            <div className="font-mono text-muted-foreground">{item.name}</div>
          </DialogTitle>
          <DialogDescription>
            Timeline of uploads of a file with the same name in the same folder
          </DialogDescription>
        </DialogHeader>
        {isLoading && <Spinner className="size-4 animate-spin" />}
        {isError && <AlertCircleIcon className="size-4 text-destructive" />}
        {history && history.length > 0 && (
          <ItemGroup className="max-h-[500px] overflow-y-auto">
            {history.map((historyItem, index) => (
              <Fragment key={historyItem.id}>
                <Item>
                  <ItemMedia>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Avatar>
                          <AvatarFallback>
                            {historyItem.author_name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      </TooltipTrigger>
                      <TooltipContent className="bg-muted text-muted-foreground">
                        {historyItem.author_name}
                      </TooltipContent>
                    </Tooltip>
                  </ItemMedia>
                  <ItemContent className="gap-1">
                    <ItemTitle className="font-mono">
                      {new Date(historyItem.createdAt).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                          hour12: false,
                        }
                      )}
                    </ItemTitle>
                    <ItemDescription className="font-mono">
                      {formatBytes(historyItem.size, { decimalPlaces: 2 })}
                    </ItemDescription>
                  </ItemContent>
                  <ItemActions>
                    <Button
                      className="rounded-full"
                      onClick={() =>
                        downloadSpecificFileHistoryItem({
                          history_id: historyItem.id,
                        })
                      }
                      size="icon"
                      variant="ghost"
                    >
                      <DownloadIcon />
                    </Button>
                    <ActionButton
                      action={async () => {
                        try {
                          await deleteHistoryItem({
                            history_id: historyItem.id,
                          });
                          await refetch();
                          toast.success("History item deleted successfully");
                          return { error: false };
                        } catch (error) {
                          return {
                            error: true,
                            message:
                              error instanceof Error
                                ? error.message
                                : "An unknown error occurred",
                          };
                        }
                      }}
                      className="rounded-full text-destructive"
                      requireAreYouSure
                      size="icon"
                      variant="ghost"
                    >
                      <TrashIcon />
                    </ActionButton>
                  </ItemActions>
                </Item>
                {index !== history.length - 1 && <ItemSeparator />}
              </Fragment>
            ))}
          </ItemGroup>
        )}

        {!history ||
          (history.length === 0 && (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <AlertCircleIcon />
                </EmptyMedia>
              </EmptyHeader>
              <EmptyContent>
                <EmptyTitle>No history found</EmptyTitle>
                <EmptyDescription>This file has no history.</EmptyDescription>
              </EmptyContent>
            </Empty>
          ))}
      </DialogContent>
    </Dialog>
  );
}
