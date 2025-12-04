import type { UploadHookControl } from "@better-upload/client";
import { useUploadFiles } from "@better-upload/client";
import { formatBytes } from "@better-upload/client/helpers";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  STATUSES,
  useUploadFeedback,
} from "@/providers/upload-feedback-provider";

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
  onFileUploaded?: (folderId: string | null) => void;
}

const PERCENT_MULTIPLIER = 100;

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
  onFileUploaded,
}: UploadProviderProps) {
  const currentFolderId = normalizeFolderId(rawCurrentFolderId);
  const { addMessage, editMessage } = useUploadFeedback();

  const [uploadingFolderId, setUploadingFolderId] = useState<string | null>(
    null
  );
  const [uploadQueue, setUploadQueue] = useState<QueuedUpload[]>([]);
  const [shouldProcessNext, setShouldProcessNext] = useState(false);

  // Use ref to track queue for the settle callback (avoids stale closure)
  const uploadQueueRef = useRef<QueuedUpload[]>([]);
  uploadQueueRef.current = uploadQueue;

  // Track the uploading folder ID in a ref for the effect (avoids stale closure)
  const uploadingFolderIdRef = useRef<string | null>(null);
  uploadingFolderIdRef.current = uploadingFolderId;

  // Track callback in ref to avoid stale closures
  const onFileUploadedRef = useRef(onFileUploaded);
  onFileUploadedRef.current = onFileUploaded;

  // Track previous uploaded files count to detect new completions
  const prevUploadedCountRef = useRef(0);

  // Track feedback functions in refs to avoid stale closures
  const addMessageRef = useRef(addMessage);
  addMessageRef.current = addMessage;
  const editMessageRef = useRef(editMessage);
  editMessageRef.current = editMessage;

  // Track file IDs for feedback messages (file name -> message ID)
  const fileMessageIdsRef = useRef<Map<string, string>>(new Map());

  const queuedFolderIds = useMemo(() => {
    const ids = new Set<string>();
    for (const item of uploadQueue) {
      if (item.folderId !== null) {
        ids.add(item.folderId);
      }
    }
    return ids;
  }, [uploadQueue]);

  // Helper to create a unique key for a file
  const getFileKey = useCallback(
    (file: { name: string; size: number }) => `${file.name}-${file.size}`,
    []
  );

  const { control, upload, isPending, uploadedFiles } = useUploadFiles({
    route: "files",
    api: `${import.meta.env.VITE_SERVER_URL}/upload`,
    credentials: "include",
    onUploadBegin: ({ files }) => {
      // Add pending messages for each file
      for (const file of files) {
        const messageId = crypto.randomUUID();
        const fileKey = getFileKey(file);
        fileMessageIdsRef.current.set(fileKey, messageId);

        addMessageRef.current({
          id: messageId,
          message: file.name,
          description: formatBytes(file.size, { decimalPlaces: 2 }),
          progress: 0,
          status: STATUSES.pending,
        });
      }
    },
    onUploadProgress: ({ file }) => {
      const fileKey = getFileKey(file);
      const messageId = fileMessageIdsRef.current.get(fileKey);
      if (!messageId) {
        return;
      }

      const progressPercent = Math.round(file.progress * PERCENT_MULTIPLIER);

      editMessageRef.current(messageId, {
        id: messageId,
        message: file.name,
        description: formatBytes(file.size, { decimalPlaces: 2 }),
        progress: progressPercent,
        status:
          file.status === "complete" ? STATUSES.success : STATUSES.pending,
      });
    },
    onUploadComplete: ({ files }) => {
      // Mark completed files as success
      for (const file of files) {
        const fileKey = getFileKey(file);
        const messageId = fileMessageIdsRef.current.get(fileKey);
        if (!messageId) {
          continue;
        }

        editMessageRef.current(messageId, {
          id: messageId,
          message: file.name,
          description: formatBytes(file.size, { decimalPlaces: 2 }),
          progress: 100,
          status: STATUSES.success,
        });
      }
    },
    onUploadFail: ({ failedFiles }) => {
      // Mark failed files as error
      for (const file of failedFiles) {
        const fileKey = getFileKey(file);
        const messageId = fileMessageIdsRef.current.get(fileKey);
        if (!messageId) {
          continue;
        }

        editMessageRef.current(messageId, {
          id: messageId,
          message: file.name,
          description: file.error?.message || "Upload failed",
          progress: undefined,
          status: STATUSES.error,
        });
      }
    },
    onUploadSettle: () => {
      // Clear the file message IDs map for this batch
      fileMessageIdsRef.current.clear();
      // Reset the uploaded count when a batch settles
      prevUploadedCountRef.current = 0;
      setUploadingFolderId(null);
      // Signal to process next item in effect
      setShouldProcessNext(true);
    },
  });

  // Detect individual file completions and call callback
  useEffect(() => {
    const currentCount = uploadedFiles.length;
    const prevCount = prevUploadedCountRef.current;

    if (currentCount > prevCount) {
      // New files have completed
      const newFilesCount = currentCount - prevCount;
      const folderId = uploadingFolderIdRef.current;

      // Call callback for each new completed file
      for (let i = 0; i < newFilesCount; i++) {
        onFileUploadedRef.current?.(folderId);
      }

      prevUploadedCountRef.current = currentCount;
    }
  }, [uploadedFiles.length]);

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
