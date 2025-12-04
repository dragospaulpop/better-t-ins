import {
  Bell,
  CheckCircleIcon,
  InfoIcon,
  Loader2Icon,
  TriangleAlertIcon,
} from "lucide-react";
import {
  STATUSES,
  useUploadFeedback,
} from "@/providers/upload-feedback-provider";
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

export default function UploadNotifications() {
  const { messages, clearMessages } = useUploadFeedback();

  // Count pending uploads for the badge
  const pendingCount = messages.filter(
    (msg) => msg.status === STATUSES.pending
  ).length;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className="relative" size="icon" variant="ghost">
          <Bell className="h-5 w-5" />
          {messages.length > 0 && (
            <Badge
              className="-top-2 -right-2 absolute h-5 min-w-5 px-1 tabular-nums"
              variant={pendingCount > 0 ? "default" : "secondary"}
            >
              {pendingCount > 0 ? pendingCount : messages.length}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader className="flex-0">
          <SheetTitle>Upload Notifications</SheetTitle>
          <SheetDescription>
            <UploadStatusText
              messagesCount={messages.length}
              pendingCount={pendingCount}
            />
          </SheetDescription>
        </SheetHeader>
        <ItemGroup className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-muted-foreground text-sm">
              No uploads yet
            </div>
          ) : (
            messages.map((message) => (
              <Item key={message.id} size="sm">
                <ItemMedia>
                  {message.status === STATUSES.pending && (
                    <Loader2Icon className="size-5 animate-spin" />
                  )}
                  {message.status === STATUSES.success && (
                    <CheckCircleIcon className="size-5 text-success" />
                  )}
                  {message.status === STATUSES.error && (
                    <TriangleAlertIcon className="size-5 text-destructive" />
                  )}
                  {message.status === STATUSES.info && (
                    <InfoIcon className="size-5 text-info" />
                  )}
                </ItemMedia>
                <ItemContent>
                  <ItemTitle className="line-clamp-1 break-all">
                    {message.message}
                  </ItemTitle>
                  <ItemDescription>{message.description}</ItemDescription>
                </ItemContent>
                <ItemContent>
                  <ItemDescription>
                    {message.status === STATUSES.pending &&
                    message.progress !== undefined
                      ? `${message.progress}%`
                      : ""}
                  </ItemDescription>
                </ItemContent>
              </Item>
            ))
          )}
        </ItemGroup>
        <SheetFooter className="flex-0">
          <Button
            disabled={messages.length === 0}
            onClick={() => clearMessages()}
            variant="outline"
          >
            Clear
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
