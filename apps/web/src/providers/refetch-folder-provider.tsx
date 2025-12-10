import { createContext, useContext } from "react";

interface RefetchFolderContextValue {
  refetchFolders: () => void;
  refetchFiles: () => void;
  refetchTree: () => void;
}

const RefetchFolderContext = createContext<RefetchFolderContextValue | null>(
  null
);

type RefetchFolderProviderProps = {
  children: React.ReactNode;
  refetchFolders: () => void;
  refetchFiles: () => void;
  refetchTree: () => void;
};

export function RefetchFolderProvider({
  children,
  refetchFolders,
  refetchFiles,
  refetchTree,
}: RefetchFolderProviderProps) {
  return (
    <RefetchFolderContext.Provider
      value={{ refetchFolders, refetchFiles, refetchTree }}
    >
      {children}
    </RefetchFolderContext.Provider>
  );
}

export function useRefetchFolder() {
  const context = useContext(RefetchFolderContext);
  if (!context) {
    throw new Error("No RefetchFolderProvider found");
  }
  return context;
}
