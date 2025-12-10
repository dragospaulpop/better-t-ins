import {
  useQueryErrorResetBoundary,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import Loader from "@/components/loader";
import Whoops from "@/components/whoops";
import { PacerUploadProvider } from "@/providers/pacer-upload-provider";
import { RefetchFolderProvider } from "@/providers/refetch-folder-provider";
import { SelectedItemsProvider } from "@/providers/selected-items-provider";
import { BreadcrumbNav } from "./-components/breadcrumb-nav";
import CreateFolderDialog from "./-components/create-folder-dialog";
import DeleteSelectedButton from "./-components/delete-selected-button";
import DisplayOptions from "./-components/display-options";
import FolderContents from "./-components/folder-contents";
import RefreshButton from "./-components/refresh-button";
import SizeOptions from "./-components/size-options";
import SortOptions from "./-components/sort-options";
import UploadStatus from "./-components/upload-status";
import { Uploader } from "./-components/uploader";

export const Route = createFileRoute("/(app)/files/{-$parentId}")({
  component: RouteComponent,
  pendingComponent: () => <Loader />,
  errorComponent: ({ error }) => {
    const router = useRouter();
    const queryErrorResetBoundary = useQueryErrorResetBoundary();

    useEffect(() => {
      // Reset the query error boundary
      queryErrorResetBoundary.reset();
    }, [queryErrorResetBoundary]);

    const retry = () => {
      router.invalidate();
    };

    return <Whoops error={error} retry={retry} />;
  },
  beforeLoad: async ({ context: { trpc, queryClient }, params }) => {
    const { parentId } = params;
    try {
      const exists = await queryClient.ensureQueryData(
        trpc.folder.folderExists.queryOptions({
          id: parentId,
        })
      );
      if (!exists) {
        redirect({
          to: "/files/{-$parentId}",
          params: { parentId: undefined },
          replace: true,
          throw: true,
        });
      }
      return;
    } catch (_) {
      redirect({
        to: "/files/{-$parentId}",
        params: { parentId: undefined },
        replace: true,
        throw: true,
      });
    }
  },
  loader: ({ context: { trpc, queryClient }, params: { parentId } }) => {
    queryClient.fetchQuery(
      trpc.folder.getAllByParentId.queryOptions({
        parent_id: parentId,
      })
    );
    queryClient.fetchQuery(
      trpc.folder.getAncestors.queryOptions({
        id: parentId,
      })
    );
    queryClient.fetchQuery(
      trpc.file.getAllByFolderId.queryOptions({
        folder_id: parentId,
      })
    );
  },
});

function RouteComponent() {
  const { parentId } = Route.useParams();
  const { trpc, queryClient } = Route.useRouteContext();

  const { data: rawFolders = [] } = useSuspenseQuery(
    trpc.folder.getAllByParentId.queryOptions({
      parent_id: parentId,
    })
  );
  const { data: ancestors = [] } = useSuspenseQuery(
    trpc.folder.getAncestors.queryOptions({
      id: parentId,
    })
  );
  const { data: rawFiles = [] } = useSuspenseQuery(
    trpc.file.getAllByFolderId.queryOptions({
      folder_id: parentId,
    })
  );

  const folders = rawFolders?.map((folder) => ({
    ...folder,
    createdAt: new Date(folder.createdAt),
    updatedAt: new Date(folder.updatedAt),
  }));

  const files = rawFiles?.map((file) => ({
    ...file,
    createdAt: new Date(file.createdAt),
    updatedAt: new Date(file.updatedAt),
  }));

  const [sortField, setSortField] = useState<"name" | "type" | "size" | "date">(
    "name"
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [foldersFirst, setFoldersFirst] = useState<boolean>(true);
  const [displayMode, setDisplayMode] = useState<"grid" | "list">("grid");

  const [itemSize, setItemSize] = useState<"xs" | "sm" | "md" | "lg">("md");
  const handleItemSize = useCallback(
    (newSize: "xs" | "sm" | "md" | "lg" | "") => {
      setItemSize(newSize as "xs" | "sm" | "md" | "lg");
    },
    []
  );

  const refresh = useCallback(async () => {
    await queryClient.invalidateQueries(
      trpc.folder.getAllByParentId.queryOptions({
        parent_id: parentId,
      })
    );
    await queryClient.invalidateQueries(
      trpc.folder.getAncestors.queryOptions({
        id: parentId,
      })
    );
    await queryClient.invalidateQueries(
      trpc.file.getAllByFolderId.queryOptions({
        folder_id: parentId,
      })
    );
    await queryClient.invalidateQueries(
      trpc.folder.getRootFolderTree.queryOptions()
    );
  }, [parentId, queryClient, trpc]);

  const refetchFiles = useCallback(() => {
    queryClient.invalidateQueries(
      trpc.file.getAllByFolderId.queryOptions({
        folder_id: parentId,
      })
    );
  }, [parentId, queryClient, trpc]);

  const refetchFolders = useCallback(() => {
    queryClient.invalidateQueries(
      trpc.folder.getAllByParentId.queryOptions({
        parent_id: parentId,
      })
    );
  }, [parentId, queryClient, trpc]);

  const refetchTree = useCallback(() => {
    queryClient.invalidateQueries(trpc.folder.getRootFolderTree.queryOptions());
  }, [queryClient, trpc]);

  const handleSortBy = useCallback(
    (newField: "name" | "type" | "size" | "date") => {
      const currentField = sortField;
      const currentDirection = sortDirection;

      if (currentField === newField) {
        setSortDirection(currentDirection === "asc" ? "desc" : "asc");
      } else {
        setSortField(newField);
        setSortDirection("asc");
      }
    },
    [sortDirection, sortField]
  );
  const handleSortDirection = useCallback((newDirection: "asc" | "desc") => {
    setSortDirection(newDirection);
  }, []);

  const currentFolderId = useMemo(
    () => (parentId ? Number.parseInt(parentId, 10) : null),
    [parentId]
  );

  return (
    <PacerUploadProvider
      currentFolderId={currentFolderId}
      refreshCurrentFolder={refetchFiles}
    >
      <SelectedItemsProvider
        currentFolderId={currentFolderId}
        key={currentFolderId ?? "root"}
      >
        <RefetchFolderProvider
          refetchFiles={refetchFiles}
          refetchFolders={refetchFolders}
          refetchTree={refetchTree}
        >
          {/* container */}
          <div className="relative flex h-full flex-col items-start justify-start gap-0 overflow-hidden">
            <UploadStatus />
            {/* toolbar */}
            <div className="flex w-full flex-none flex-col gap-6 p-6">
              <div className="flex w-full flex-wrap items-center justify-between gap-4 lg:flex-nowrap">
                <BreadcrumbNav ancestors={ancestors} />
                <div className="flex items-center gap-2">
                  {/* <Button size="sm" variant="outline">
                    <UploadIcon className="h-4 w-4" />
                    Upload files
                  </Button> */}
                  <CreateFolderDialog />
                </div>
              </div>
              <div className="flex w-full flex-wrap items-center justify-between gap-4 lg:flex-nowrap">
                <div className="flex items-center gap-2">
                  <RefreshButton refresh={refresh} />
                  <SortOptions
                    foldersFirst={foldersFirst}
                    handleSortBy={handleSortBy}
                    handleSortDirection={handleSortDirection}
                    setFoldersFirst={setFoldersFirst}
                    sortDirection={sortDirection}
                    sortField={sortField}
                  />
                </div>
                <DeleteSelectedButton />
                <SizeOptions
                  handleItemSize={handleItemSize}
                  itemSize={itemSize}
                />
                <DisplayOptions
                  displayMode={displayMode}
                  setDisplayMode={setDisplayMode}
                />
              </div>
            </div>
            {/* items - shrinks to content when few items, scrolls when many */}

            <FolderContents
              displayMode={displayMode}
              files={files}
              folders={folders}
              foldersFirst={foldersFirst}
              itemSize={itemSize}
              sortDirection={sortDirection}
              sortField={sortField}
            />

            {/* uploader - min 140px, grows to fill remaining space */}
            <div className="flex min-h-48 w-full flex-1 flex-col items-center justify-center p-6">
              <Uploader targetFolderId={currentFolderId} />
            </div>
          </div>
        </RefetchFolderProvider>
      </SelectedItemsProvider>
    </PacerUploadProvider>
  );
}
