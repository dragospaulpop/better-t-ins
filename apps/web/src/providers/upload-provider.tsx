import type { UploadHookControl } from "@better-upload/client";
import { useUploadFiles } from "@better-upload/client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

interface QueuedUpload {
  folderId: string | null;
  files: File[];
}

interface UploadContextValue {
  control: UploadHookControl<true>;
  uploadToFolder: (
    files: File[] | FileList,
    folderId?: string | number | null
  ) => void;
  isPending: boolean;
  uploadingFolderId: string | null;
  queuedFolderIds: Set<string>;
  isUploadingTo: (folderId: string | number | null) => boolean;
  hasQueuedUploads: (folderId: string | number | null) => boolean;
  currentFolderId: string | null;
}

const UploadContext = createContext<UploadContextValue | null>(null);

interface UploadProviderProps {
  children: React.ReactNode;
  currentFolderId?: string | number | null;
}

// Normalize folder ID to string or null for consistent comparison
function normalizeFolderId(
  folderId: string | number | null | undefined
): string | null {
  if (folderId === null || folderId === undefined) {
    return null;
  }
  return String(folderId);
}

export function UploadProvider({
  children,
  currentFolderId: rawCurrentFolderId,
}: UploadProviderProps) {
  const currentFolderId = normalizeFolderId(rawCurrentFolderId);

  const [uploadingFolderId, setUploadingFolderId] = useState<string | null>(
    null
  );
  const [uploadQueue, setUploadQueue] = useState<QueuedUpload[]>([]);
  const [shouldProcessNext, setShouldProcessNext] = useState(false);

  // Use ref to track queue for the settle callback (avoids stale closure)
  const uploadQueueRef = useRef<QueuedUpload[]>([]);
  uploadQueueRef.current = uploadQueue;

  const queuedFolderIds = useMemo(() => {
    const ids = new Set<string>();
    for (const item of uploadQueue) {
      if (item.folderId !== null) {
        ids.add(item.folderId);
      }
    }
    return ids;
  }, [uploadQueue]);

  const { control, upload, isPending } = useUploadFiles({
    route: "files",
    api: `${import.meta.env.VITE_SERVER_URL}/upload`,
    credentials: "include",
    onUploadSettle: () => {
      setUploadingFolderId(null);
      // Signal to process next item in effect
      setShouldProcessNext(true);
    },
  });

  // Process queue in effect to avoid stale closure issues
  useEffect(() => {
    if (!shouldProcessNext) {
      return;
    }

    setShouldProcessNext(false);

    if (uploadQueueRef.current.length === 0) {
      return;
    }

    const [nextUpload, ...remainingQueue] = uploadQueueRef.current;
    setUploadQueue(remainingQueue);
    setUploadingFolderId(nextUpload.folderId);

    upload(nextUpload.files, {
      metadata: {
        folderId: nextUpload.folderId,
      },
    });
  }, [shouldProcessNext, upload]);

  const uploadToFolder = useCallback(
    (files: File[] | FileList, folderId?: string | number | null) => {
      const targetFolderId = normalizeFolderId(folderId ?? currentFolderId);
      const fileArray = Array.from(files);

      if (isPending || uploadingFolderId !== null) {
        // Add to queue if upload is in progress
        setUploadQueue((prev) => [
          ...prev,
          { folderId: targetFolderId, files: fileArray },
        ]);
        return;
      }

      // Start upload immediately
      setUploadingFolderId(targetFolderId);
      upload(fileArray, {
        metadata: {
          folderId: targetFolderId,
        },
      });
    },
    [upload, currentFolderId, isPending, uploadingFolderId]
  );

  const isUploadingTo = useCallback(
    (folderId: string | number | null) => {
      // Must be actually uploading to return true
      if (!isPending) {
        return false;
      }
      const normalizedId = normalizeFolderId(folderId);
      return uploadingFolderId === normalizedId;
    },
    [uploadingFolderId, isPending]
  );

  const hasQueuedUploads = useCallback(
    (folderId: string | number | null) => {
      const normalizedId = normalizeFolderId(folderId);
      if (normalizedId === null) {
        return uploadQueue.some((item) => item.folderId === null);
      }
      return queuedFolderIds.has(normalizedId);
    },
    [uploadQueue, queuedFolderIds]
  );

  const value = useMemo<UploadContextValue>(
    () => ({
      control,
      uploadToFolder,
      isPending,
      uploadingFolderId,
      queuedFolderIds,
      isUploadingTo,
      hasQueuedUploads,
      currentFolderId,
    }),
    [
      control,
      uploadToFolder,
      isPending,
      uploadingFolderId,
      queuedFolderIds,
      isUploadingTo,
      hasQueuedUploads,
      currentFolderId,
    ]
  );

  return (
    <UploadContext.Provider value={value}>{children}</UploadContext.Provider>
  );
}

export function useUpload() {
  const context = useContext(UploadContext);
  if (!context) {
    throw new Error("useUpload must be used within an UploadProvider");
  }
  return context;
}
