import { revalidateLogic, useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { TRPCClientError } from "@trpc/client";
import {
  DownloadIcon,
  HistoryIcon,
  MoreVerticalIcon,
  PencilIcon,
  TrashIcon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import z from "zod";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { trpc } from "@/lib/trpc";
import { useRefetchFolder } from "@/providers/refetch-folder-provider";
import type { Item } from "./folders";
import ItemHistory from "./item-history";

const MAX_FILE_NAME_LENGTH = 255;

export function FileItemMenu({ item }: { item: Item }) {
  const { refetchFiles } = useRefetchFolder();
  const [historyOpen, setHistoryOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { mutate: deleteFile } = useMutation(
    trpc.file.deleteFile.mutationOptions({
      onSuccess: () => {
        toast.success("File deleted successfully");
        refetchFiles();
      },
      onError: (error) => {
        toast.error("Failed to delete file", {
          description: error.message,
        });
      },
    })
  );

  const [openDialog, setOpenDialog] = useState<"edit" | null>(null);

  const validateMutation = useMutation(
    trpc.file.validateFileName.mutationOptions()
  );

  const { mutateAsync: renameFile } = useMutation(
    trpc.file.renameFile.mutationOptions({
      onSuccess: () => {
        toast.success("File renamed successfully");
        refetchFiles();
        form.reset();
        setOpenDialog(null);
      },
      onError: (error) => {
        toast.error("Failed to rename file", {
          description: error.message,
        });
      },
    })
  );

  const { mutateAsync: downloadLatestFileHistory } = useMutation(
    trpc.file.downloadLatestFileHistory.mutationOptions({
      onSuccess: (data) => {
        window.open(data, "_blank", "noopener");
      },
      onError: (error) => {
        toast.error("Failed to download latest file history", {
          description: error.message,
        });
      },
    })
  );

  const form = useForm({
    defaultValues: {
      name: item.name,
    },
    validationLogic: revalidateLogic(),
    validators: {
      onSubmit: z.object({
        name: z.string().min(1).max(MAX_FILE_NAME_LENGTH),
      }),
      onSubmitAsync: async ({ value }) => {
        try {
          await renameFile({
            file_id: item.id,
            name: value.name,
            folder_id: item.parentId?.toString() ?? null,
          });
        } catch (e) {
          return {
            fields: {
              name: { message: handleRenameFileError(e) },
            },
          };
        }
      },
    },
  });

  return (
    <div className="absolute top-1 right-1 z-20 opacity-0 transition-opacity group-hover:opacity-100">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="rounded-full p-1" size="icon-sm" variant="ghost">
            <MoreVerticalIcon className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>

          <DropdownMenuItem
            className="flex gap-2"
            onClick={() => setHistoryOpen(true)}
          >
            <HistoryIcon className="mr-2 size-4" />
            View History
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => downloadLatestFileHistory({ file_id: item.id })}
          >
            <DownloadIcon className="mr-2 size-4" />
            Download latest
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpenDialog("edit")}>
            <PencilIcon className="mr-2 size-4" />
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem disabled>
            <PencilIcon className="mr-2 size-4" />
            Move to
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setDeleteOpen(true)}
            variant="destructive"
          >
            <TrashIcon className="mr-2 size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ItemHistory
        item={item}
        onOpenChange={setHistoryOpen}
        open={historyOpen}
      />

      <AlertDialog onOpenChange={setDeleteOpen} open={deleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this file?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteFile({ file_id: item.id })}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        onOpenChange={(open) => !open && setOpenDialog(null)}
        open={openDialog === "edit"}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename file</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
          >
            <FieldGroup>
              <form.Field
                name="name"
                validators={{
                  onDynamicAsyncDebounceMs: 500,
                  onDynamicAsync: async ({ value }) => {
                    if (!value) {
                      return { message: "Name can't be empty" };
                    }

                    if (value === item.name) {
                      return;
                    }

                    try {
                      const folderExists = await validateMutation.mutateAsync({
                        name: value,
                        folder_id: item.parentId ? String(item.parentId) : null,
                        file_id: item.id,
                      });

                      return folderExists
                        ? { message: "File name already exists" }
                        : undefined;
                    } catch (e) {
                      return {
                        message: handleRenameFileError(e),
                      };
                    }
                  },
                }}
              >
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                      <InputGroup>
                        <InputGroupInput
                          aria-invalid={isInvalid}
                          autoFocus
                          id={field.name}
                          name={field.name}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="Folder name"
                          type="text"
                          value={field.state.value}
                        />
                      </InputGroup>
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              </form.Field>
              <form.Subscribe>
                {(state) => (
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button
                      disabled={!state.canSubmit || state.isSubmitting}
                      type="submit"
                    >
                      <LoadingSwap
                        isLoading={
                          state.isSubmitting || state.isFieldsValidating
                        }
                      >
                        Save
                      </LoadingSwap>
                    </Button>
                  </DialogFooter>
                )}
              </form.Subscribe>
            </FieldGroup>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function handleRenameFileError(e: unknown): string {
  if (e instanceof TRPCClientError) {
    if (e.data?.code === "UNAUTHORIZED") {
      return "You are not authorized to rename a file";
    }
    if (e.data?.code === "BAD_REQUEST") {
      try {
        const error = JSON.parse(e.message as string) as {
          code: string;
          message: string;
          path: string[];
        }[];

        return (
          error?.[0]?.message ??
          "Failed to rename file (no server error message)"
        );
      } catch (_) {
        return "Failed to rename file (unknown error)";
      }
    }

    if (e.data?.code === "INTERNAL_SERVER_ERROR") {
      return e.message;
    }
    return `Failed to rename file (${e.data?.code} ${e.data?.message})`;
  }
  return `Failed to rename file (unknown error: ${(e as Error)?.message})`;
}
