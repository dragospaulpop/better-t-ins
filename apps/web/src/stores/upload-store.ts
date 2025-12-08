import { Store } from "@tanstack/react-store";

export type UplaodItem = {
  name: string;
  size: number;
  mime: string;
  progress: number;
  status: "pending" | "uploading" | "completed" | "failed";
  error?: string;
  id: string;
  createdAt: Date;
};

export type UploadStore = {
  uploadQueue: UplaodItem[];
  isUploading: boolean;
  hasQueuedUploads: boolean;
  currentFolderId: string | null;
  averageProgress: number;
};

export const store = new Store<UploadStore>({
  uploadQueue: [],
  isUploading: false,
  hasQueuedUploads: false,
  currentFolderId: null,
  averageProgress: 0,
});

export const updateItemProgress = (id: string, progress: number) => {
  store.setState((state) => {
    const queueItem = state.uploadQueue.find((i) => i.id === id);
    if (queueItem) {
      return {
        ...state,
        uploadQueue: state.uploadQueue.map((i) =>
          i.id === id ? { ...i, progress } : i
        ),
      };
    }
    return state;
  });
};

export const updateAverageProgress = () => {
  store.setState((state) => {
    const totalProgress = state.uploadQueue.reduce(
      (acc, item) => acc + item.progress,
      0
    );
    const averageProgress = totalProgress / state.uploadQueue.length;
    return {
      ...state,
      averageProgress,
    };
  });
};

export const updateItemStatus = (
  id: string,
  status: "pending" | "uploading" | "completed" | "failed"
) => {
  store.setState((state) => {
    const queueItem = state.uploadQueue.find((i) => i.id === id);
    if (queueItem) {
      return {
        ...state,
        uploadQueue: state.uploadQueue.map((i) =>
          i.id === id ? { ...i, status } : i
        ),
      };
    }
    return state;
  });
};

export const addItem = (item: UplaodItem) => {
  store.setState((state) => ({
    ...state,
    isUploading: true,
    hasQueuedUploads: true,
    uploadQueue: [
      ...state.uploadQueue,
      { ...item, progress: 0, status: "pending", createdAt: new Date() },
    ],
  }));
};

export const setIsUploading = (isUploading: boolean) => {
  store.setState((state) => ({
    ...state,
    isUploading,
  }));
};
