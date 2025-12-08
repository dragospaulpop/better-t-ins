import { useStore } from "@tanstack/react-store";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { store } from "@/stores/upload-store";

export default function UploadStatus() {
  const { averageProgress, isUploading } = useStore(store, (state) => ({
    averageProgress: state.averageProgress,
    isUploading: state.isUploading,
  }));

  return (
    <div
      className={cn(
        "absolute bottom-1 left-1 z-20 w-64 rounded-md border border-muted-foreground/20 bg-muted p-2 transition-opacity duration-300",
        isUploading ? "opacity-100" : "opacity-0"
      )}
    >
      <Progress value={averageProgress} />
    </div>
  );
}
