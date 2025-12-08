import { Button } from "@/components/ui/button";
import { usePacerUpload } from "@/providers/pacer-upload-provider";

export function TestPacer() {
  const { addToUploadQueue } = usePacerUpload();

  return (
    <div>
      <Button
        onClick={() =>
          addToUploadQueue(
            [
              {
                id: crypto.randomUUID(),
                file: new File([], crypto.randomUUID()),
                folderId: null,
              },
            ],
            null
          )
        }
      >
        Enqueue
      </Button>
    </div>
  );
}
