import { RefreshCwIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { cn } from "@/lib/utils";

interface RefreshButtonProps {
  refresh: () => Promise<void>;
}

export default function RefreshButton({ refresh }: RefreshButtonProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refresh();
    } finally {
      setIsRefreshing(false);
    }
  };

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
