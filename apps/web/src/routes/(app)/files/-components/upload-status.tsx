import { useStore } from "@tanstack/react-store";
import { UploadIcon } from "lucide-react";
import { useMemo } from "react";
import { Progress } from "@/components/ui/progress";
import useRAFProgress from "@/hooks/use-raf-progress";
import { cn } from "@/lib/utils";
import { store } from "@/stores/upload-store";

export default function UploadStatus() {
  const { averageProgress, isUploading } = useStore(store, (state) => ({
    averageProgress: state.averageProgress,
    isUploading: state.isUploading,
  }));

  const progress = useRAFProgress(averageProgress);

  const memoizedProgress = useMemo(() => progress, [progress]);

  return (
    <div
      className={cn(
        "absolute bottom-1 left-1 z-20 flex w-64 items-center gap-2 rounded-md border border-muted-foreground/20 bg-muted p-2 transition-opacity duration-300",
        isUploading ? "opacity-100" : "opacity-0"
      )}
    >
      <UploadIcon className="size-4" />
      <Progress value={memoizedProgress} />
    </div>
  );
}
