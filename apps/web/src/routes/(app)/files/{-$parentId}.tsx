import {
  useQueryErrorResetBoundary,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { UploadIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import Loader from "@/components/loader";
import { Button } from "@/components/ui/button";
import Whoops from "@/components/whoops";
import { RefetchFolderProvider } from "@/providers/refetch-folder-provider";
import { UploadProvider } from "@/providers/upload-provider";
import { BreadcrumbNav } from "./-components/breadcrumb-nav";
import CreateFolderDialog from "./-components/create-folder-dialog";
import DisplayOptions from "./-components/display-options";
import Folders from "./-components/folders";
import RefreshButton from "./-components/refresh-button";
import SizeOptions from "./-components/size-options";
import SortOptions from "./-components/sort-options";
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
  loader: async ({ context: { trpc, queryClient }, params: { parentId } }) => {
    const [folders, ancestors, files] = await Promise.all([
      queryClient.ensureQueryData(
        trpc.folder.getAllByParentId.queryOptions({
          parent_id: parentId,
        })
      ),
      queryClient.ensureQueryData(
        trpc.folder.getAncestors.queryOptions({
          id: parentId,
        })
      ),
      queryClient.ensureQueryData(
        trpc.file.getAllByFolderId.queryOptions({
          folder_id: parentId,
        })
      ),
    ]);

    return { folders, ancestors, files };
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
});

function RouteComponent() {
  const { parentId } = Route.useParams();
  const { trpc, queryClient } = Route.useRouteContext();
  const { data: rawFolders = [], refetch: refetchFolders } = useSuspenseQuery(
    trpc.folder.getAllByParentId.queryOptions({
      parent_id: parentId,
    })
  );
  const { data: ancestors = [], refetch: refetchAncestors } = useSuspenseQuery(
    trpc.folder.getAncestors.queryOptions({
      id: parentId,
    })
  );
  const { data: rawFiles = [], refetch: refetchFiles } = useSuspenseQuery(
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
    await refetchFolders();
    await refetchAncestors();
    await refetchFiles();
  }, [refetchFolders, refetchAncestors, refetchFiles]);

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

  // Callback when a file finishes uploading - refetch if it's for the current folder
  const handleFileUploaded = useCallback(
    (folderId: string | null) => {
      // Normalize parentId - undefined means root (null)
      const currentFolderId = parentId ?? null;

      // Only refetch if the uploaded file is in the currently displayed folder
      if (folderId === currentFolderId) {
        queryClient.invalidateQueries({
          queryKey: trpc.file.getAllByFolderId.queryKey({
            folder_id: parentId,
          }),
        });
      }
    },
    [queryClient, parentId, trpc]
  );

  return (
    <UploadProvider
      currentFolderId={parentId}
      onFileUploaded={handleFileUploaded}
    >
      {/* container */}
      <div className="relative flex h-full flex-col items-start justify-start gap-0 overflow-hidden">
        {/* toolbar */}
        <div className="flex w-full flex-none flex-col gap-6 p-6">
          <div className="flex w-full flex-wrap items-center justify-between gap-4 lg:flex-nowrap">
            <BreadcrumbNav ancestors={ancestors} />
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline">
                <UploadIcon className="h-4 w-4" />
                Upload files
              </Button>
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
            <SizeOptions handleItemSize={handleItemSize} itemSize={itemSize} />
            <DisplayOptions
              displayMode={displayMode}
              setDisplayMode={setDisplayMode}
            />
          </div>
        </div>
        {/* items - shrinks to content when few items, scrolls when many */}
        <div className="min-h-0 w-full flex-[0_1_auto] overflow-y-auto p-6">
          <RefetchFolderProvider
            refetchFiles={refetchFiles}
            refetchFolders={refetchFolders}
          >
            <Folders
              displayMode={displayMode}
              files={files}
              folders={folders}
              foldersFirst={foldersFirst}
              itemSize={itemSize}
              sortDirection={sortDirection}
              sortField={sortField}
            />
          </RefetchFolderProvider>
        </div>
        {/* uploader - min 140px, grows to fill remaining space */}
        <div className="flex min-h-48 w-full flex-1 flex-col items-center justify-center p-6">
          <Uploader />
        </div>
      </div>
    </UploadProvider>
  );
}
