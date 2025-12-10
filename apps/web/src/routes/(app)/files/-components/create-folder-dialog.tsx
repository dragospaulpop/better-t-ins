import { revalidateLogic, useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { getRouteApi, useParams } from "@tanstack/react-router";
import { TRPCClientError } from "@trpc/client";
import { FolderPlusIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { LoadingSwap } from "@/components/ui/loading-swap";

const MAX_FOLDER_NAME_LENGTH = 100;

const schema = z.object({
  name: z.string().min(1).max(MAX_FOLDER_NAME_LENGTH),
});

const routeApi = getRouteApi("/(app)/files/{-$parentId}");

export default function CreateFolderDialog() {
  const [open, setOpen] = useState(false);
  const { parentId } = useParams({ strict: false });
  const { trpc, queryClient } = routeApi.useRouteContext();
  // const router = useRouter();

  const createMutation = useMutation(trpc.folder.create.mutationOptions());
  const validateMutation = useMutation(
    trpc.folder.validateFolderName.mutationOptions()
  );

  const form = useForm({
    defaultValues: {
      name: "New folder",
    },
    validationLogic: revalidateLogic(),
    validators: {
      onSubmit: schema,
      onSubmitAsync: async ({ value }) => {
        try {
          await createMutation.mutateAsync({
            ...value,
            parent_id: parentId,
          });
          toast.success("Folder created successfully");
          await queryClient.invalidateQueries({
            queryKey: trpc.folder.getAllByParentId.queryKey({
              parent_id: parentId,
            }),
          });
          await queryClient.invalidateQueries(
            trpc.folder.getRootFolderTree.queryOptions()
          );
          // await router.invalidate();
          form.reset();
          setOpen(false);
          return null;
        } catch (e) {
          const error = handleCreateFolderError(e);
          return {
            fields: {
              name: { message: error },
            },
          };
        }
      },
    },
  });

  return (
    <Dialog
      onOpenChange={(v) => {
        if (!v) {
          form.reset();
        }
        setOpen(v);
      }}
      open={open}
    >
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <FolderPlusIcon className="h-4 w-4" />
          Create folder
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create folder</DialogTitle>
          <DialogDescription>
            Create a new folder to store your files
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <FieldGroup className="">
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
                      parent_id: parentId,
                    });

                    return folderExists
                      ? { message: "Folder name already exists" }
                      : undefined;
                  } catch (e) {
                    return {
                      message: handleCreateFolderError(e),
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
                      isLoading={state.isSubmitting || state.isFieldsValidating}
                    >
                      Create
                    </LoadingSwap>
                  </Button>
                </DialogFooter>
              )}
            </form.Subscribe>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function handleCreateFolderError(e: unknown): string {
  if (e instanceof TRPCClientError) {
    if (e.data?.code === "UNAUTHORIZED") {
      return "You are not authorized to create a folder";
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
          "Failed to create folder (no server error message)"
        );
      } catch (_) {
        return "Failed to create folder (unknown error)";
      }
    }

    if (e.data?.code === "INTERNAL_SERVER_ERROR") {
      return e.message;
    }
    return `Failed to create folder (${e.data?.code} ${e.data?.message})`;
  }
  return `Failed to create folder (unknown error: ${(e as Error)?.message})`;
}
