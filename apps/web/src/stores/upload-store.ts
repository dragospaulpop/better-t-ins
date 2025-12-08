import { Store } from "@tanstack/react-store";

const PERCENT_MULTIPLIER = 100;

export type UploadItem = {
  id: string;
  name: string;
  size: number;
  mime: string;
  progress: number;
  status: "pending" | "uploading" | "completed" | "failed";
  error?: string;
  createdAt: Date;
};

export type UploadStore = {
  uploadQueue: UploadItem[];
  queuedFolderIds: Set<number | null>;
  uploadingFolderId: number | null;
  isUploading: boolean;
  averageProgress: number;
};

export const store = new Store<UploadStore>({
  uploadQueue: [],
  queuedFolderIds: new Set(),
  uploadingFolderId: null,
  isUploading: false,
  averageProgress: 0,
});

export const addItemsToStore = (
  items: UploadItem[],
  folderId: number | null
) => {
  store.setState((state) => ({
    ...state,
    isUploading: true,
    uploadQueue: [...state.uploadQueue, ...items],
    queuedFolderIds: new Set([...state.queuedFolderIds, folderId]),
  }));
};

export const updateItemProgress = (id: string, progress: number) => {
  store.setState((state) => {
    const newProgress = Number((progress * PERCENT_MULTIPLIER).toFixed(2));

    const newQueue = state.uploadQueue.map((item) =>
      item.id === id
        ? {
            ...item,
            progress: newProgress,
          }
        : item
    );

    // Recalculate average progress
    const activeItems = newQueue.filter(
      (item) => item.status === "uploading" || item.status === "pending"
    );
    const averageProgress =
      activeItems.length > 0
        ? activeItems.reduce((acc, item) => acc + item.progress, 0) /
          activeItems.length
        : 0;

    return {
      ...state,
      uploadQueue: newQueue,
      averageProgress,
    };
  });
};

export const updateItemStatus = (
  id: string,
  status: "pending" | "uploading" | "completed" | "failed"
) => {
  store.setState((state) => ({
    ...state,
    uploadQueue: state.uploadQueue.map((item) =>
      item.id === id ? { ...item, status } : item
    ),
  }));
};

export const updateItemError = (id: string, error: string) => {
  store.setState((state) => ({
    ...state,
    uploadQueue: state.uploadQueue.map((item) =>
      item.id === id ? { ...item, error } : item
    ),
  }));
};

export const clearUploadQueue = () => {
  store.setState((state) => ({
    ...state,
    uploadQueue: [],
  }));
};

export const setUploading = (isUploading: boolean) => {
  store.setState((state) => ({
    ...state,
    isUploading,
  }));
};

export const setUploadingFolderId = (folderId: number | null | undefined) => {
  store.setState((state) => ({
    ...state,
    uploadingFolderId: folderId ?? null,
  }));
};

export const removeFolderFromQueuedFolderIds = (folderId: number | null) => {
  store.setState((state) => ({
    ...state,
    queuedFolderIds: new Set(
      [...state.queuedFolderIds].filter((id) => id !== folderId)
    ),
  }));
};
