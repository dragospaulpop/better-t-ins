import {
  type ReactAsyncQueuer,
  useAsyncQueuer,
} from "@tanstack/react-pacer/async-queuer";
import { createContext, useContext } from "react";

interface PacerUploadContextValue {
  currentFolderId?: string | number | null;
  asyncQueuer: ReactAsyncQueuer<Item>;
}

const PacerUploadContext = createContext<PacerUploadContextValue | null>(null);

interface PacerUploadProviderProps {
  children: React.ReactNode;
  currentFolderId?: string | number | null;
}

const DELAY = 1000;
type Item = {
  name: string;
  size: number;
  mime: string;
};
async function processItem(item: Item) {
  await new Promise((resolve) => setTimeout(resolve, DELAY));
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

  return (
    <PacerUploadContext.Provider
      value={{
        currentFolderId,
        asyncQueuer,
      }}
    >
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
