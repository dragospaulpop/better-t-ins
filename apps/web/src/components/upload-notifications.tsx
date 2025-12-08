import { formatBytes } from "@better-upload/client/helpers";
import { useStore } from "@tanstack/react-store";
import {
  Bell,
  CheckCircleIcon,
  TriangleAlertIcon,
  UploadIcon,
} from "lucide-react";
import { useMemo } from "react";
import useRAFProgress from "@/hooks/use-raf-progress";
import { STATUSES } from "@/providers/upload-feedback-provider";
import {
  clearUploadQueue,
  store,
  type UploadItem,
} from "@/stores/upload-store";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "./ui/item";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { Spinner } from "./ui/spinner";

export default function UploadNotifications() {
  const uploadQueue = useStore(store, (state) => state.uploadQueue);

  // Count pending uploads for the badge
  const pendingCount = useMemo(
    () => uploadQueue.filter((item) => item.status === STATUSES.pending).length,
    [uploadQueue]
  );

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className="relative" size="icon" variant="ghost">
          <Bell className="h-5 w-5" />
          {uploadQueue.length > 0 && (
            <Badge
              className="-top-2 -right-2 absolute h-5 min-w-5 px-1 tabular-nums"
              variant={pendingCount > 0 ? "default" : "secondary"}
            >
              {pendingCount > 0 ? pendingCount : uploadQueue.length}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader className="flex-0">
          <SheetTitle>Upload Notifications</SheetTitle>
          <SheetDescription>
            <UploadStatusText
              messagesCount={uploadQueue.length}
              pendingCount={pendingCount}
            />
          </SheetDescription>
        </SheetHeader>
        <ItemGroup className="flex-1 overflow-y-auto">
          {uploadQueue.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-muted-foreground text-sm">
              No uploads yet
            </div>
          ) : (
            uploadQueue.map((item) => (
              <UploadListItem item={item} key={item.id} />
            ))
          )}
        </ItemGroup>
        <SheetFooter className="flex-0">
          <Button
            disabled={uploadQueue.length === 0}
            onClick={() => clearUploadQueue()}
            variant="outline"
          >
            Clear
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function UploadStatusText({
  pendingCount,
  messagesCount,
}: {
  pendingCount: number;
  messagesCount: number;
}) {
  if (pendingCount > 0) {
    return `${pendingCount} upload${pendingCount > 1 ? "s" : ""} in progress`;
  }
  if (messagesCount > 0) {
    return `${messagesCount} recent upload${messagesCount > 1 ? "s" : ""}`;
  }
  return "No recent uploads";
}

function UploadListItem({ item }: { item: UploadItem }) {
  const throttledProgress = useRAFProgress(item.progress);

  return (
    <Item key={item.id} size="sm">
      <ItemMedia>
        {item.status === "uploading" && (
          <Spinner aria-label="Uploading" className="size-5" />
        )}
        {item.status === "pending" && <UploadIcon className="size-5" />}
        {item.status === "completed" && (
          <CheckCircleIcon className="size-5 text-success" />
        )}
        {item.status === "failed" && (
          <TriangleAlertIcon className="size-5 text-destructive" />
        )}
      </ItemMedia>
      <ItemContent>
        <ItemTitle className="line-clamp-1 break-all">{item.name}</ItemTitle>
        <ItemDescription>
          {formatBytes(item.size, { decimalPlaces: 2 })}
        </ItemDescription>
      </ItemContent>
      <ItemContent>
        <ItemDescription>
          {item.status === "uploading" && item.progress !== undefined
            ? `${throttledProgress}%`
            : ""}
        </ItemDescription>
      </ItemContent>
    </Item>
  );
}
