import type { UploadHookControl } from "@better-upload/client";
import { revalidateLogic, useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { TRPCClientError } from "@trpc/client";
import {
  ClockIcon,
  FolderIcon,
  Loader2,
  MoreVerticalIcon,
  UploadIcon,
} from "lucide-react";
import { Fragment, useId, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import z from "zod";
import { useListUsers, useSession } from "@/lib/auth-hooks";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import type { EnhancedFile } from "@/providers/pacer-upload-provider";
import { useRefetchFolder } from "@/providers/refetch-folder-provider";
import { useSelectedItems } from "@/providers/selected-items-provider";
import type { User } from "@/routes/(app)/admin/settings/-components/users/columns";
import type { Item as FolderItem } from "@/routes/(app)/files/-components/folders";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Field, FieldError, FieldGroup, FieldLabel } from "./ui/field";
import { InputGroup, InputGroupInput } from "./ui/input-group";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "./ui/item";
import { Label } from "./ui/label";
import { LoadingSwap } from "./ui/loading-swap";

const MAX_FOLDER_NAME_LENGTH = 255;

type FolderDropzoneProps = {
  control: UploadHookControl<true>;
  id?: string;
  accept?: string;
  metadata?: Record<string, unknown>;
  uploadOverride?: (
    files: EnhancedFile[],
    options?: Parameters<UploadHookControl<true>["upload"]>[1]
  ) => void;
  item: FolderItem;
  gridItemSize: string;
  gridItemLabel: string;
  isUploading?: boolean;
  isQueued?: boolean;
};

export function FolderDropzone({
  control: { upload },
  id: _id,
  accept,
  metadata,
  uploadOverride,
  item,
  gridItemSize,
  gridItemLabel,
  isUploading = false,
  isQueued = false,
}: FolderDropzoneProps) {
  const id = useId();
  const { user } = useSession();
  const navigate = useNavigate();
  const { toggleSelectedFolder, selectedFolders, clearSelectedFolders } =
    useSelectedItems();
  const { refetchFiles, refetchFolders, refetchTree } = useRefetchFolder();

  const [openDialog, setOpenDialog] = useState<"edit" | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);

  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  const { data: { users = [] } = {} } = useListUsers() as {
    data: { users: User[] };
  };

  const { mutateAsync: deleteFolder } = useMutation(
    trpc.folder.deleteFolder.mutationOptions({
      onSuccess: () => {
        toast.success("Folder deleted successfully");
        clearSelectedFolders();
        refetchFiles();
        refetchFolders();
        refetchTree();
      },
      onError: (error) => {
        toast.error("Failed to delete folder", {
          description: error.message,
        });
      },
    })
  );
  const { mutateAsync: assignFolderTemplateToUsers } = useMutation(
    trpc.folder.assignFolderTemplateToUsers.mutationOptions({
      onSuccess: () => {
        toast.success("Folder assigned successfully to users");
      },
      onError: (error) => {
        toast.error("Failed to assign folder to users", {
          description: error.message,
        });
      },
    })
  );

  const validateMutation = useMutation(
    trpc.folder.validateFolderName.mutationOptions()
  );

  const { mutateAsync: renameFolder } = useMutation(
    trpc.folder.renameFolder.mutationOptions({
      onSuccess: () => {
        toast.success("Folder renamed successfully");
        refetchFolders();
        refetchTree();
        form.reset();
        setOpenDialog(null);
      },
      onError: (error) => {
        toast.error("Failed to rename folder", {
          description: error.message,
        });
      },
    })
  );

  const downloadFolder = (folderId: number) => {
    window.open(
      `${import.meta.env.VITE_SERVER_URL}/download/folder/${folderId}`,
      "_blank",
      "noopener"
    );
  };

  const { getRootProps, getInputProps, isDragActive, inputRef } = useDropzone({
    onDrop: (files) => {
      // Allow drops anytime - queue system handles concurrent uploads
      if (files.length > 0) {
        if (uploadOverride) {
          uploadOverride(
            files.map((file) => ({
              id: crypto.randomUUID(),
              file,
              folderId: item.id,
            })),
            { metadata }
          );
        } else {
          upload(files, { metadata });
        }
      }
      inputRef.current.value = "";
    },
    noClick: true,
  });

  const form = useForm({
    defaultValues: {
      name: item.name,
    },
    validationLogic: revalidateLogic(),
    validators: {
      onSubmit: z.object({
        name: z.string().min(1).max(MAX_FOLDER_NAME_LENGTH),
      }),
      onSubmitAsync: async ({ value }) => {
        try {
          await renameFolder({ id: item.id, name: value.name });
        } catch (e) {
          return {
            fields: {
              name: { message: handleRenameFolderError(e) },
            },
          };
        }
      },
    },
  });

  const assignFolderToUsers = async (folderId: number) => {
    await assignFolderTemplateToUsers({ folderId, userIds: selectedUserIds });
    setAssignOpen(false);
    setSelectedUserIds([]);
    refetchFolders();
    refetchTree();
  };

  return (
    <>
      <a
        className={cn(
          "group relative flex flex-col items-center justify-start gap-2 rounded-lg border border-transparent p-0 transition-all hover:bg-tud-blue/25 hover:shadow-md hover:shadow-tud-green/25transition-colors",
          {
            "border-primary/80 border-dashed": isDragActive,
            "border-tud-blue/80 bg-tud-blue/25": selectedFolders.includes(
              item.id
            ),
          }
        )}
        href={"/files/{-$parentId}"}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleSelectedFolder(item.id);
        }}
        onDoubleClick={(e) => {
          e.preventDefault();
          navigate({
            to: "/files/{-$parentId}",
            params: { parentId: String(item.id) },
          });
        }}
      >
        <div
          {...getRootProps()}
          className={cn(
            "flex h-full w-full flex-col items-center justify-start rounded-lg bg-transparent p-2 transition-colors",
            {
              "hover:bg-accent dark:hover:bg-accent/40": true,
              "justify-center": isDragActive,
            }
          )}
        >
          <input
            {...getInputProps()}
            accept={accept}
            id={_id || id}
            multiple
            type="file"
          />
          {isDragActive && (
            <div className="relative my-2 grid items-center justify-center">
              <UploadIcon
                className={cn(
                  "pointer-events-none col-1 row-1 shrink-0",
                  gridItemSize
                )}
                strokeWidth={0.75}
              />
            </div>
          )}

          {!isDragActive && (
            <div className="relative my-2 grid items-center justify-center">
              {isUploading && (
                <Loader2 className="col-1 row-1 size-6 animate-spin self-center justify-self-center" />
              )}

              <FolderIcon
                className={cn(
                  "col-1 row-1 shrink-0 fill-tud-blue/75 dark:fill-tud-blue",
                  gridItemSize,
                  { "opacity-50": isUploading }
                )}
                strokeWidth={0}
              />

              {isQueued && !isUploading && (
                <div className="-top-1 -left-1 absolute rounded-full bg-amber-500 p-0.5">
                  <ClockIcon className="size-3 text-white" />
                </div>
              )}
            </div>
          )}

          <span
            className={cn(
              "line-clamp-none break-all text-center",
              gridItemLabel
            )}
          >
            {item.name}
          </span>
        </div>

        {/** biome-ignore lint/a11y/useKeyWithClickEvents: leave me alone */}
        {/** biome-ignore lint/a11y/useSemanticElements: leave me alone */}
        <div
          className="absolute top-1 right-1"
          onClick={(e) => e.stopPropagation()}
          onDoubleClick={(e) => e.preventDefault()}
          role="button"
          tabIndex={0}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="rounded-full p-1 opacity-0 transition-opacity group-hover:opacity-100"
                size="icon-sm"
                variant="ghost"
              >
                <MoreVerticalIcon className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem asChild>
                <Link
                  params={{ parentId: String(item.id) }}
                  to="/files/{-$parentId}"
                >
                  Open
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => window.open(`/files/${item.id}`, "_blank")}
              >
                Open in new tab
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => downloadFolder(item.id)}>
                Download
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setOpenDialog("edit")}>
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:bg-destructive/20"
                onSelect={() => setDeleteOpen(true)}
              >
                Delete
              </DropdownMenuItem>
              {user?.role === "admin" && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => setAssignOpen(true)}>
                    Assign as template to users
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </a>
      <AlertDialog onOpenChange={setDeleteOpen} open={deleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this folder?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteFolder({ id: item.id })}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        onOpenChange={(open) => !open && setOpenDialog(null)}
        open={openDialog === "edit"}
      >
        <DialogContent onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Rename folder</DialogTitle>
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

                    try {
                      const folderExists = await validateMutation.mutateAsync({
                        name: value,
                        parent_id: item.parentId ? String(item.parentId) : null,
                      });

                      return folderExists
                        ? { message: "Folder name already exists" }
                        : undefined;
                    } catch (e) {
                      return {
                        message: handleRenameFolderError(e),
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

      <Dialog
        onOpenChange={(open) => !open && setAssignOpen(false)}
        open={assignOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign as template to users</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            If the folder name already exists in the a user's home it will get a
            random prefix. Assigning it to your own user will just create a copy
            of the folder in your home. Note that only the folder structure will
            be copied.
          </DialogDescription>
          <ItemGroup className="max-h-[300px] overflow-y-auto">
            {users.map((userItem, index) => (
              <Fragment key={userItem.id}>
                <Item asChild size="sm">
                  <Label htmlFor={userItem.id}>
                    <ItemMedia>
                      <Avatar>
                        <AvatarFallback>
                          {userItem.name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </ItemMedia>
                    <ItemContent className="gap-1">
                      <ItemTitle>{userItem.name}</ItemTitle>
                      <ItemDescription>{userItem.email}</ItemDescription>
                    </ItemContent>
                    <ItemActions>
                      <Checkbox
                        checked={selectedUserIds.includes(userItem.id)}
                        id={userItem.id}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedUserIds([
                              ...selectedUserIds,
                              userItem.id,
                            ]);
                          } else {
                            setSelectedUserIds(
                              selectedUserIds.filter(
                                (selectedId) => selectedId !== userItem.id
                              )
                            );
                          }
                        }}
                      />
                    </ItemActions>
                  </Label>
                </Item>
                {index !== users.length - 1 && <ItemSeparator />}
              </Fragment>
            ))}
          </ItemGroup>
          <DialogFooter>
            <Button
              onClick={() => {
                setAssignOpen(false);
                setSelectedUserIds([]);
              }}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              disabled={selectedUserIds.length === 0}
              onClick={() => assignFolderToUsers(item.id)}
            >
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function handleRenameFolderError(e: unknown): string {
  if (e instanceof TRPCClientError) {
    if (e.data?.code === "UNAUTHORIZED") {
      return "You are not authorized to rename a folder";
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
          "Failed to rename folder (no server error message)"
        );
      } catch (_) {
        return "Failed to rename folder (unknown error)";
      }
    }

    if (e.data?.code === "INTERNAL_SERVER_ERROR") {
      return e.message;
    }
    return `Failed to rename folder (${e.data?.code} ${e.data?.message})`;
  }
  return `Failed to rename folder (unknown error: ${(e as Error)?.message})`;
}
