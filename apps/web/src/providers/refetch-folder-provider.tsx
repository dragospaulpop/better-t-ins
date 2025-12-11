import { useQueryClient } from "@tanstack/react-query";
import { createContext, useCallback, useContext, useMemo } from "react";
import { trpc } from "@/lib/trpc";

interface RefetchFolderContextValue {
  currentFolderId: string | null | undefined;
  refetchFiles: () => Promise<void>;
  refetchFolders: () => Promise<void>;
  refetchAncestors: () => Promise<void>;
  refetchTree: () => Promise<void>;
}

const RefetchFolderContext = createContext<RefetchFolderContextValue | null>(
  null
);

type RefetchFolderProviderProps = {
  children: React.ReactNode;
  currentFolderId: string | null | undefined;
};

export function RefetchFolderProvider({
  children,
  currentFolderId,
}: RefetchFolderProviderProps) {
  const queryClient = useQueryClient();

  const refetchFiles = useCallback(async () => {
    await queryClient.invalidateQueries(
      trpc.file.getAllByFolderId.queryOptions({
        folder_id: currentFolderId,
      })
    );
  }, [currentFolderId, queryClient]);

  const refetchFolders = useCallback(async () => {
    await queryClient.invalidateQueries(
      trpc.folder.getAllByParentId.queryOptions({
        parent_id: currentFolderId,
      })
    );
  }, [currentFolderId, queryClient]);

  const refetchAncestors = useCallback(async () => {
    await queryClient.invalidateQueries(
      trpc.folder.getAncestors.queryOptions({
        id: currentFolderId,
      })
    );
  }, [currentFolderId, queryClient]);

  const refetchTree = useCallback(async () => {
    await queryClient.invalidateQueries(
      trpc.folder.getRootFolderTree.queryOptions()
    );
  }, [queryClient]);

  const value = useMemo(
    () => ({
      currentFolderId,
      refetchFiles,
      refetchFolders,
      refetchAncestors,
      refetchTree,
    }),
    [
      currentFolderId,
      refetchFiles,
      refetchFolders,
      refetchAncestors,
      refetchTree,
    ]
  );
  return (
    <RefetchFolderContext.Provider value={value}>
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
