import { RefreshCwIcon } from "lucide-react";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { useRefetchFolder } from "@/providers/refetch-folder-provider";

export default function RefreshButton() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { refetchFiles, refetchFolders, refetchAncestors, refetchTree } =
    useRefetchFolder();

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetchFiles();
      await refetchFolders();
      await refetchAncestors();
      await refetchTree();
    } finally {
      setIsRefreshing(false);
    }
  }, [refetchFiles, refetchFolders, refetchAncestors, refetchTree]);

  return (
    <Button
      disabled={isRefreshing}
      onClick={handleRefresh}
      size="sm"
      variant="outline"
    >
      <LoadingSwap isLoading={isRefreshing}>
        <RefreshCwIcon className="size-4" />
      </LoadingSwap>
    </Button>
  );
}
