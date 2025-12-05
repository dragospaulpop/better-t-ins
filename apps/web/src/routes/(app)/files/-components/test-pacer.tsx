import { Button } from "@/components/ui/button";
import { usePacerUpload } from "@/providers/pacer-upload-provider";

const MAX_SIZE = 1_000_000;
const MIME_TYPES = [
  "text/plain",
  "image/jpeg",
  "image/png",
  "image/gif",
  "video/mp4",
  "video/webm",
  "audio/mpeg",
  "audio/wav",
  "audio/ogg",
  "application/pdf",
  "application/zip",
  "application/rar",
  "application/7z",
  "application/x-7z-compressed",
  "application/x-rar-compressed",
  "application/x-zip-compressed",
];

export function TestPacer() {
  const { asyncQueuer } = usePacerUpload();

  return (
    <div>
      <Button
        onClick={() =>
          asyncQueuer.addItem({
            name: crypto.randomUUID(),
            size: Math.random() * MAX_SIZE,
            mime: MIME_TYPES[Math.floor(Math.random() * MIME_TYPES.length)],
          })
        }
      >
        Enqueue
      </Button>
    </div>
  );
}
