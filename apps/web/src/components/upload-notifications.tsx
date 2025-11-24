import { formatBytes } from "@better-upload/client/helpers";
import {
  Bell,
  CheckCircleIcon,
  InfoIcon,
  Loader2Icon,
  TriangleAlertIcon,
} from "lucide-react";
import { useCallback, useEffect, useRef } from "react";
import { STATUSES, useUploadFeedback } from "@/hooks/use-upload-feedback";
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

const ONE_SECOND = 1000;
const ONE_TENTH_SECOND = 100;

const MAX_PROGRESS = 100;
const MAX_SIZE = 50_000_000_000;
const RANDOM_POW = 6;
const MESSAGES_TO_KEEP = 10;
const PENDING_PROB = 0.25;
const ERROR_PROB = 0.98;

export default function UploadNotifications() {
  const { messages, addMessage, clearMessages, editMessage } =
    useUploadFeedback();

  // Track whether we should still be adding/editing messages
  const shouldAddRef = useRef(true);
  const shouldEditRef = useRef(true);

  // Keep a ref to the latest messages to avoid restarting intervals
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  // Callback to add a message
  const addTestMessage = useCallback(() => {
    const status =
      Math.random() > PENDING_PROB ? STATUSES.pending : STATUSES.info;
    const message = "very-long-filename-with-important-contents.pdf";

    if (status === STATUSES.pending) {
      shouldEditRef.current = true;
    }

    addMessage({
      id: crypto.randomUUID(),
      message,
      description: formatBytes(
        Math.floor(Math.random() ** RANDOM_POW * MAX_SIZE),
        {
          decimalPlaces: 2,
        }
      ),
      progress:
        status === STATUSES.pending
          ? Math.floor(Math.random() * MAX_PROGRESS)
          : undefined,
      status,
    });
  }, [addMessage]);

  // Start add interval on mount, stop when limit reached
  useEffect(() => {
    const interval = setInterval(() => {
      if (shouldAddRef.current) {
        addTestMessage();
      }
    }, ONE_SECOND);

    return () => clearInterval(interval);
  }, [addTestMessage]);

  // Start edit interval on mount
  useEffect(() => {
    // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: fuck off biome
    const updateMessages = () => {
      if (!shouldEditRef.current) {
        return;
      }

      const currentMessages = messagesRef.current;
      const pendingMessages = currentMessages.filter(
        (msg) =>
          msg.status === STATUSES.pending &&
          msg.progress !== undefined &&
          msg.progress < MAX_PROGRESS
      );

      for (const pendingMessage of pendingMessages) {
        if (pendingMessage.progress !== undefined) {
          const newProgress = Math.min(
            pendingMessage.progress + 1,
            MAX_PROGRESS
          );

          const isError = Math.random() > ERROR_PROB;

          let newStatus = pendingMessage.status;

          if (isError) {
            newStatus = STATUSES.error;
          } else if (newProgress === MAX_PROGRESS) {
            newStatus = STATUSES.success;
          }

          editMessage(pendingMessage.id, {
            ...pendingMessage,
            progress: newProgress,
            status: newStatus,
          });
        }
      }
    };

    const interval = setInterval(updateMessages, ONE_TENTH_SECOND);

    return () => clearInterval(interval);
  }, [editMessage]);

  // Check stopping conditions
  useEffect(() => {
    // Stop adding if we have enough messages
    if (messages.length >= MESSAGES_TO_KEEP) {
      shouldAddRef.current = false;
    }

    // Stop editing if no pending messages
    const hasPending = messages.some(
      (msg) =>
        msg.status === STATUSES.pending &&
        msg.progress !== undefined &&
        msg.progress < MAX_PROGRESS
    );

    if (hasPending) {
      shouldEditRef.current = true;
    } else {
      shouldEditRef.current = false;
    }
  }, [messages]);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="icon" variant="ghost">
          <Bell className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader className="flex-0">
          <SheetTitle>Notifications</SheetTitle>
          <SheetDescription>Upload notifications</SheetDescription>
        </SheetHeader>
        <ItemGroup className="flex-1 overflow-y-auto">
          {messages.map((message) => (
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
                  {message.progress !== undefined ? `${message.progress}%` : ""}
                </ItemDescription>
              </ItemContent>
            </Item>
          ))}
        </ItemGroup>
        <SheetFooter className="flex-0">
          <Button onClick={() => clearMessages()} variant="outline">
            Clear
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
