import { useQueryErrorResetBoundary } from "@tanstack/react-query";
import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import Loader from "@/components/loader";
import Whoops from "@/components/whoops";
import DisplaySettingsProvider from "@/providers/display-settings-provider";
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

  const currentFolderId = useMemo(
    () => (parentId ? Number.parseInt(parentId, 10) : null),
    [parentId]
  );

  return (
    <RefetchFolderProvider currentFolderId={parentId}>
      <PacerUploadProvider currentFolderId={currentFolderId}>
        <SelectedItemsProvider
          currentFolderId={currentFolderId}
          key={currentFolderId ?? "root"}
        >
          <DisplaySettingsProvider>
            {/* container */}
            <div className="relative flex h-full flex-col items-start justify-start gap-0 overflow-hidden">
              <UploadStatus />
              {/* toolbar */}
              <div className="flex w-full flex-none flex-col gap-6 p-6">
                <div className="flex w-full flex-wrap items-center justify-between gap-4 lg:flex-nowrap">
                  <BreadcrumbNav currentFolderId={parentId} />
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
                    <RefreshButton />
                    <SortOptions />
                  </div>
                  <DeleteSelectedButton />
                  <SizeOptions />
                  <DisplayOptions />
                </div>
              </div>
              {/* items - shrinks to content when few items, scrolls when many */}

              <FolderContents currentFolderId={parentId} />

              {/* uploader - min 140px, grows to fill remaining space */}
              <div className="flex min-h-48 w-full flex-1 flex-col items-center justify-center p-6">
                <Uploader targetFolderId={currentFolderId} />
              </div>
            </div>
          </DisplaySettingsProvider>
        </SelectedItemsProvider>
      </PacerUploadProvider>
    </RefetchFolderProvider>
  );
}
