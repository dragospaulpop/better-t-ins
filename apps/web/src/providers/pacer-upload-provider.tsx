import { type UploadHookControl, useUploadFiles } from "@better-upload/client";
import {
  type ReactAsyncQueuer,
  useAsyncQueuer,
} from "@tanstack/react-pacer/async-queuer";
import { createContext, useCallback, useContext, useMemo, useRef } from "react";
import {
  addItemsToStore,
  removeFolderFromQueuedFolderIds,
  setUploading,
  setUploadingFolderId,
  updateItemError,
  updateItemProgress,
  updateItemStatus,
} from "@/stores/upload-store";
import { useRefetchFolder } from "./refetch-folder-provider";

interface PacerUploadContextValue {
  currentFolderId?: string | number | null;
  asyncQueuer: ReactAsyncQueuer<UploadQueueItem>;
  control: UploadHookControl<true>;
  addToUploadQueue: (item: UploadQueueItem) => void;
}

const PacerUploadContext = createContext<PacerUploadContextValue | null>(null);

interface PacerUploadProviderProps {
  children: React.ReactNode;
  currentFolderId: number | null;
}

// import { addItem as addItemToStore } from "@/stores/upload-store";

export interface EnhancedFile {
  id: string;
  file: File;
  folderId: number | null;
}

type UploadQueueItem = {
  files: EnhancedFile[];
  folderId: number | null;
};

const COMPLETED_PROGRESS = 100;

export function PacerUploadProvider({
  children,
  currentFolderId,
}: PacerUploadProviderProps) {
  const { refetchFiles: refreshCurrentFolder } = useRefetchFolder();
  const fileTrackingMap = useRef(new WeakMap<File, EnhancedFile>());
  const { control, uploadAsync } = useUploadFiles({
    route: "files",
    api: `${import.meta.env.VITE_SERVER_URL}/upload`,
    credentials: "include",
    onUploadBegin: ({ files }) => {
      for (const file of files) {
        const enhancedFile = fileTrackingMap.current.get(file.raw);
        if (enhancedFile) {
          updateItemStatus(enhancedFile.id, "uploading");
        }
      }
    },
    onUploadProgress: ({ file }) => {
      const enhancedFile = fileTrackingMap.current.get(file.raw);
      if (enhancedFile) {
        updateItemProgress(enhancedFile.id, file.progress);
        if (
          enhancedFile.folderId === currentFolderId &&
          file.progress >= COMPLETED_PROGRESS
        ) {
          refreshCurrentFolder();
        }
      }
    },
    onUploadComplete: ({ files }) => {
      for (const file of files) {
        const enhancedFile = fileTrackingMap.current.get(file.raw);
        if (enhancedFile) {
          updateItemStatus(enhancedFile.id, "completed");
          updateItemProgress(enhancedFile.id, 0);
        }

        if (enhancedFile?.folderId === currentFolderId) {
          refreshCurrentFolder();
        }
      }
    },
    onUploadFail: ({ failedFiles }) => {
      for (const file of failedFiles) {
        const enhancedFile = fileTrackingMap.current.get(file.raw);
        if (enhancedFile) {
          updateItemStatus(enhancedFile.id, "failed");
          updateItemError(
            enhancedFile.id,
            file.error?.message ?? "Upload failed"
          );
        }
      }
    },
    onUploadSettle: ({ files }) => {
      for (const file of files) {
        const enhancedFile = fileTrackingMap.current.get(file.raw);
        if (enhancedFile) {
          updateItemStatus(enhancedFile.id, "completed");
        }
      }
    },
  });

  const asyncQueuer = useAsyncQueuer(
    async (item: UploadQueueItem) => {
      for (const enhancedFile of item.files) {
        fileTrackingMap.current.set(enhancedFile.file, enhancedFile);
      }

      setUploadingFolderId(item.folderId);
      removeFolderFromQueuedFolderIds(item.folderId);

      await uploadAsync(
        item.files.map((f) => f.file),
        {
          metadata: {
            folderId: item.folderId ? String(item.folderId) : null,
          },
        }
      );
    },
    {
      maxSize: undefined,
      concurrency: 1,
      started: true,
      onSettled: () => {
        setUploading(false);
        setUploadingFolderId(null);
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

  const addToUploadQueue = useCallback(
    (item: UploadQueueItem) => {
      addItemsToStore(
        item.files.map((f) => ({
          id: f.id,
          name: f.file.name,
          size: f.file.size,
          mime: f.file.type,
          progress: 0,
          status: "pending",
          error: undefined,
          createdAt: new Date(),
        })),
        item.folderId
      );
      asyncQueuer.addItem(item);
    },
    [asyncQueuer]
  );

  const value = useMemo(
    () => ({
      currentFolderId,
      asyncQueuer,
      addToUploadQueue,
      control,
    }),
    [currentFolderId, asyncQueuer, addToUploadQueue, control]
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
