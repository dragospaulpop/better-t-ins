import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

interface SelectedItemsContextValue {
  currentFolderId: number | null;
  selectedFolders: number[];
  selectedFiles: number[];
  toggleSelectedFolder: (folderId: number) => void;
  toggleSelectedFile: (fileId: number) => void;
  clearSelectedItems: () => void;
  clearSelectedFiles: () => void;
  clearSelectedFolders: () => void;
}

const SelectedItemsContext = createContext<SelectedItemsContextValue | null>(
  null
);

interface SelectedItemsProviderProps {
  children: React.ReactNode;
  currentFolderId: number | null;
}

export function SelectedItemsProvider({
  children,
  currentFolderId,
}: SelectedItemsProviderProps) {
  const [selectedFolders, setSelectedFolders] = useState<number[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<number[]>([]);

  const toggleSelectedFolder = useCallback((folderId: number) => {
    setSelectedFolders((prev) => {
      if (prev.includes(folderId)) {
        return prev.filter((id) => id !== folderId);
      }
      return [...prev, folderId];
    });
  }, []);

  const toggleSelectedFile = useCallback((fileId: number) => {
    setSelectedFiles((prev) => {
      if (prev.includes(fileId)) {
        return prev.filter((id) => id !== fileId);
      }
      return [...prev, fileId];
    });
  }, []);

  const clearSelectedItems = useCallback(() => {
    setSelectedFolders([]);
    setSelectedFiles([]);
  }, []);

  const clearSelectedFiles = useCallback(() => {
    setSelectedFiles([]);
  }, []);

  const clearSelectedFolders = useCallback(() => {
    setSelectedFolders([]);
  }, []);

  const value = useMemo(
    () => ({
      currentFolderId,
      selectedFolders,
      selectedFiles,
      toggleSelectedFolder,
      toggleSelectedFile,
      clearSelectedItems,
      clearSelectedFiles,
      clearSelectedFolders,
    }),
    [
      currentFolderId,
      selectedFolders,
      selectedFiles,
      toggleSelectedFolder,
      toggleSelectedFile,
      clearSelectedItems,
      clearSelectedFiles,
      clearSelectedFolders,
    ]
  );

  return (
    <SelectedItemsContext.Provider value={value}>
      {children}
    </SelectedItemsContext.Provider>
  );
}

export function useSelectedItems() {
  const context = useContext(SelectedItemsContext);
  if (!context) {
    throw new Error(
      "useSelectedItems must be used within a SelectedItemsProvider"
    );
  }
  return context;
}
