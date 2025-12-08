import {
  type ReactAsyncQueuer,
  useAsyncQueuer,
} from "@tanstack/react-pacer/async-queuer";
import { createContext, useCallback, useContext, useMemo } from "react";

interface PacerUploadContextValue {
  currentFolderId?: string | number | null;
  asyncQueuer: ReactAsyncQueuer<Item>;
  addItem: (item: Item) => void;
}

const PacerUploadContext = createContext<PacerUploadContextValue | null>(null);

interface PacerUploadProviderProps {
  children: React.ReactNode;
  currentFolderId?: string | number | null;
}

import {
  addItem as addItemToStore,
  updateItemProgress,
  updateItemStatus,
} from "@/stores/upload-store";

const UPDATE_DELAY = 1000;
const UPLOAD_PROGRESS_INCREMENT = 10;
const MAX_PROGRESS = 100;

type Item = {
  id: string;
  name: string;
  size: number;
  mime: string;
};
async function processItem(item: Item) {
  let progress = 0;
  await new Promise((resolve) => {
    const interval = setInterval(() => {
      progress += UPLOAD_PROGRESS_INCREMENT;
      if (progress >= MAX_PROGRESS) {
        updateItemStatus(item.id, "completed");
        clearInterval(interval);
        resolve(true);
      }
      updateItemProgress(item.id, progress);
    }, UPDATE_DELAY);
  });
  // biome-ignore lint/suspicious/noConsole: testing
  console.log("processing item", item);

  return item.name;
}

export function PacerUploadProvider({
  children,
  currentFolderId,
}: PacerUploadProviderProps) {
  const asyncQueuer = useAsyncQueuer(
    processItem,
    {
      maxSize: undefined,
      concurrency: 1,
      started: true,
      onError: (error, item) => {
        // biome-ignore lint/suspicious/noConsole: testing
        console.log("error processing item", error, item);
      },
      onSuccess(result, item) {
        // biome-ignore lint/suspicious/noConsole: testing
        console.log("success processing item", result, item);
      },
    },
    (state) => ({
      status: state.status,
      size: state.size,
      isRunning: state.isRunning,
      isIdle: state.isIdle,
      isEmpty: state.isEmpty,
      successCount: state.successCount,
    })
  );

  const addItem = useCallback(
    (item: Item) => {
      addItemToStore(item);
      asyncQueuer.addItem(item);
    },
    [asyncQueuer]
  );

  const value = useMemo(
    () => ({
      currentFolderId,
      asyncQueuer,
      addItem,
    }),
    [currentFolderId, asyncQueuer, addItem]
  );

  return (
    <PacerUploadContext.Provider value={value}>
      {children}
    </PacerUploadContext.Provider>
  );
}

export function usePacerUpload() {
  const context = useContext(PacerUploadContext);
  if (!context) {
    throw new Error("usePacerUpload must be used within a PacerUploadProvider");
  }
  return context;
}
