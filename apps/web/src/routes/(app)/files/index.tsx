import { createFileRoute } from "@tanstack/react-router";
import { UploadIcon } from "lucide-react";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { BreadcrumbNav } from "./-components/breadcrumb-nav";
import CreateFolderDialog from "./-components/create-folder-dialog";
import DisplayOptions from "./-components/display-options";
import Folders from "./-components/folders";
import SizeOptions from "./-components/size-options";
import SortOptions from "./-components/sort-options";
import { Uploader } from "./-components/uploader";

export const Route = createFileRoute("/(app)/files/")({
  component: RouteComponent,
});

function RouteComponent() {
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
  return (
    // container
    <div className="relative flex h-full flex-col items-start justify-start gap-0 overflow-hidden">
      {/* toolbar */}
      <div className="flex w-full flex-none flex-col gap-6 p-6">
        <div className="flex w-full flex-wrap items-center justify-between gap-4 lg:flex-nowrap">
          <BreadcrumbNav />
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline">
              <UploadIcon className="h-4 w-4" />
              Upload files
            </Button>
            <CreateFolderDialog />
          </div>
        </div>
        <div className="flex w-full flex-wrap items-center justify-between gap-4 lg:flex-nowrap">
          <SortOptions
            foldersFirst={foldersFirst}
            handleSortBy={handleSortBy}
            handleSortDirection={handleSortDirection}
            setFoldersFirst={setFoldersFirst}
            sortDirection={sortDirection}
            sortField={sortField}
          />
          <SizeOptions handleItemSize={handleItemSize} itemSize={itemSize} />
          <DisplayOptions
            displayMode={displayMode}
            setDisplayMode={setDisplayMode}
          />
        </div>
      </div>
      {/* items */}
      <div className="w-full flex-1 overflow-y-auto p-6">
        <Folders
          displayMode={displayMode}
          foldersFirst={foldersFirst}
          itemSize={itemSize}
          sortDirection={sortDirection}
          sortField={sortField}
        />
      </div>
      {/* uploader */}
      <div className="flex w-full flex-0 flex-col items-center justify-center">
        <Uploader />
      </div>
    </div>
  );
}
