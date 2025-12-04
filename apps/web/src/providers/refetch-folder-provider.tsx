import { createContext, useContext } from "react";

interface RefetchFolderContextValue {
  refetchFolders: () => void;
  refetchFiles: () => void;
}

const RefetchFolderContext = createContext<RefetchFolderContextValue | null>(
  null
);

type RefetchFolderProviderProps = {
  children: React.ReactNode;
  refetchFolders: () => void;
  refetchFiles: () => void;
};

export function RefetchFolderProvider({
  children,
  refetchFolders,
  refetchFiles,
}: RefetchFolderProviderProps) {
  return (
    <RefetchFolderContext.Provider value={{ refetchFolders, refetchFiles }}>
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
