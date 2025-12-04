import type { UploadHookControl } from "@better-upload/client";
import { ClockIcon, Loader2, Upload } from "lucide-react";
import { useId } from "react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";

function DropzoneLabel({
  isUploading,
  isQueued,
}: {
  isUploading: boolean;
  isQueued: boolean;
}) {
  if (isUploading) {
    return "Uploading...";
  }
  if (isQueued) {
    return "Upload queued";
  }
  return "Drag and drop files here";
}

type UploadDropzoneProps = {
  control: UploadHookControl<true>;
  id?: string;
  accept?: string;
  metadata?: Record<string, unknown>;
  description?:
    | {
        fileTypes?: string;
        maxFileSize?: string;
        maxFiles?: number;
      }
    | string;
  uploadOverride?: (
    ...args: Parameters<UploadHookControl<true>["upload"]>
  ) => void;
  isUploading?: boolean;
  isQueued?: boolean;
};

export function UploadDropzone({
  control: { upload },
  id: _id,
  accept,
  metadata,
  description,
  uploadOverride,
  isUploading = false,
  isQueued = false,
}: UploadDropzoneProps) {
  const id = useId();

  const { getRootProps, getInputProps, isDragActive, inputRef } = useDropzone({
    onDrop: (files) => {
      // Allow drops anytime - queue system handles concurrent uploads
      if (files.length > 0) {
        if (uploadOverride) {
          uploadOverride(files, { metadata });
        } else {
          upload(files, { metadata });
        }
      }
      inputRef.current.value = "";
    },
    noClick: true,
  });

  return (
    <div
      className={cn(
        "relative h-full w-full rounded-lg border border-input border-dashed text-foreground transition-colors",
        {
          "border-primary/80": isDragActive,
        }
      )}
    >
      <label
        {...getRootProps()}
        className={cn(
          "flex h-full w-full min-w-72 cursor-pointer flex-col items-center justify-center rounded-lg bg-transparent px-2 py-6 transition-colors dark:bg-input/10",
          {
            "hover:bg-accent dark:hover:bg-accent/40": true,
            "opacity-0": isDragActive,
          }
        )}
        htmlFor={_id || id}
      >
        <div className="relative my-2">
          {isUploading ? (
            <Loader2 className="size-6 animate-spin" />
          ) : (
            <>
              <Upload className="size-6" />
              {isQueued && (
                <div className="-top-1 -right-2 absolute rounded-full bg-amber-500 p-0.5">
                  <ClockIcon className="size-3 text-white" />
                </div>
              )}
            </>
          )}
        </div>

        <div className="mt-3 space-y-1 text-center">
          <p className="font-semibold text-sm">
            <DropzoneLabel isQueued={isQueued} isUploading={isUploading} />
          </p>

          <p className="max-w-64 text-muted-foreground text-xs">
            {typeof description === "string" ? (
              description
            ) : (
              <>
                {description?.maxFiles &&
                  `You can upload ${description.maxFiles} file${description.maxFiles !== 1 ? "s" : ""}.`}{" "}
                {description?.maxFileSize &&
                  `${description.maxFiles !== 1 ? "Each u" : "U"}p to ${description.maxFileSize}.`}{" "}
                {description?.fileTypes && `Accepted ${description.fileTypes}.`}
              </>
            )}
          </p>
        </div>

        <input
          {...getInputProps()}
          accept={accept}
          id={_id || id}
          multiple
          type="file"
        />
      </label>

      {isDragActive && (
        <div className="pointer-events-none absolute inset-0 rounded-lg">
          <div className="flex size-full flex-col items-center justify-center rounded-lg bg-accent dark:bg-accent/40">
            <div className="my-2">
              <Upload className="size-6" />
            </div>

            <p className="mt-3 font-semibold text-sm">Drop files here</p>
          </div>
        </div>
      )}
    </div>
  );
}
